const roundOne = (value) => Math.round(value * 10) / 10;
const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

export const STATIONS = Object.freeze({
  solar: Object.freeze({
    label: '光伏电站',
    capacity: 100,
    unit: 'MW',
    defaultScenario: 'clear',
    startHour: 21,
  }),
  wind: Object.freeze({
    label: '风电场',
    capacity: 120,
    unit: 'MW',
    defaultScenario: 'stable',
    startHour: 0,
  }),
});

export const SCENARIOS = Object.freeze({
  solar: Object.freeze({
    clear: Object.freeze({
      label: '晴空稳定',
      description: '辐照条件较稳定，日间出力沿平滑包络上升并在午间达到峰值。',
      multiplier: 0.98,
      volatility: 0.025,
      uncertainty: 0.035,
    }),
    variable_cloud: Object.freeze({
      label: '云量波动',
      description: '间歇云层造成短时遮挡，点预测出现可见波动，区间同步变宽。',
      multiplier: 0.78,
      volatility: 0.17,
      uncertainty: 0.085,
    }),
    overcast: Object.freeze({
      label: '持续阴天',
      description: '整体辐照受限，出力峰值降低，但缓慢变化仍保留日内结构。',
      multiplier: 0.43,
      volatility: 0.055,
      uncertainty: 0.06,
    }),
  }),
  wind: Object.freeze({
    stable: Object.freeze({
      label: '稳定风况',
      description: '风速处于相对稳定区间，功率缓慢起伏，短时爬坡风险较低。',
      multiplier: 0.98,
      volatility: 0.035,
      uncertainty: 0.045,
    }),
    gusty: Object.freeze({
      label: '阵风增强',
      description: '阵风造成快速功率变化，预测区间扩大，并出现更明显的爬坡事件。',
      multiplier: 1.02,
      volatility: 0.19,
      uncertainty: 0.095,
    }),
    front: Object.freeze({
      label: '天气锋面',
      description: '天气系统过境推动风速阶段性增强，随后回落，形成持续爬坡过程。',
      multiplier: 0.9,
      volatility: 0.11,
      uncertainty: 0.075,
    }),
  }),
});

const solarEnvelope = (hour) => {
  if (hour < 6 || hour > 18) return 0;
  const daylightPosition = ((hour - 6) / 12) * Math.PI;
  return Math.pow(Math.sin(daylightPosition), 1.35);
};

const solarScenarioFactor = (scenarioKey, index, scenario) => {
  if (scenarioKey === 'variable_cloud') {
    return scenario.multiplier + scenario.volatility * Math.sin(index * 1.55 + 0.8);
  }
  if (scenarioKey === 'overcast') {
    return scenario.multiplier + scenario.volatility * Math.sin(index * 0.52 + 0.3);
  }
  return scenario.multiplier + scenario.volatility * Math.sin(index * 0.42);
};

const windEnvelope = (index) =>
  0.5 + 0.14 * Math.sin(index * 0.36 + 0.5) + 0.07 * Math.cos(index * 0.17);

const windScenarioFactor = (scenarioKey, index, scenario) => {
  if (scenarioKey === 'gusty') {
    return scenario.multiplier + scenario.volatility * Math.sin(index * 1.38 + 0.4);
  }
  if (scenarioKey === 'front') {
    const frontPulse = Math.exp(-Math.pow((index - 23) / 7, 2));
    return scenario.multiplier + scenario.volatility * 2.1 * frontPulse;
  }
  return scenario.multiplier + scenario.volatility * Math.sin(index * 0.28);
};

const getExpectedPower = ({
  stationKey,
  scenarioKey,
  scenario,
  station,
  index,
  hour,
}) => {
  if (stationKey === 'solar') {
    const envelope = solarEnvelope(hour);
    return station.capacity * 0.91 * envelope *
      solarScenarioFactor(scenarioKey, index, scenario);
  }

  return station.capacity * windEnvelope(index) *
    windScenarioFactor(scenarioKey, index, scenario);
};

const assertOptions = ({ station, scenario, horizon }) => {
  if (!STATIONS[station]) {
    throw new RangeError(`Unknown station: ${station}`);
  }
  if (!SCENARIOS[station][scenario]) {
    throw new RangeError(`Unknown ${station} scenario: ${scenario}`);
  }
  if (![6, 12, 24].includes(Number(horizon))) {
    throw new RangeError(`Unsupported forecast horizon: ${horizon}`);
  }
};

export function buildForecastSeries({
  station: stationKey,
  scenario: scenarioKey,
  horizon,
}) {
  const normalizedHorizon = Number(horizon);
  assertOptions({
    station: stationKey,
    scenario: scenarioKey,
    horizon: normalizedHorizon,
  });

  const station = STATIONS[stationKey];
  const scenario = SCENARIOS[stationKey][scenarioKey];
  const historyLength = 12;
  const totalLength = historyLength + normalizedHorizon;

  return Array.from({ length: totalLength }, (_, index) => {
    const hour = (station.startHour + index) % 24;
    const forecast = clamp(
      getExpectedPower({
        stationKey,
        scenarioKey,
        scenario,
        station,
        index,
        hour,
      }),
      0,
      station.capacity,
    );
    const futureStep = Math.max(0, index - historyLength + 1);
    const uncertaintyRatio =
      scenario.uncertainty + (Math.min(futureStep, 24) / 24) * 0.035;
    const hasProductionWindow =
      stationKey !== 'solar' || (hour > 6 && hour < 18);
    const spread = hasProductionWindow
      ? Math.max(1.8, station.capacity * uncertaintyRatio)
      : 0;
    const observedVariation =
      1 + 0.035 * Math.sin(index * 1.17 + (stationKey === 'wind' ? 0.8 : 0.2));
    const actual = index < historyLength
      ? clamp(forecast * observedVariation, 0, station.capacity)
      : null;

    return Object.freeze({
      index,
      label: `${String(hour).padStart(2, '0')}:00`,
      actual: actual === null ? null : roundOne(actual),
      forecast: roundOne(forecast),
      p10: roundOne(clamp(forecast - spread, 0, station.capacity)),
      p90: roundOne(clamp(forecast + spread, 0, station.capacity)),
      isFuture: index >= historyLength,
    });
  });
}

export function summarizeForecast(series) {
  const future = series.filter((point) => point.isFuture);
  if (future.length === 0) {
    return Object.freeze({
      peak: 0,
      peakLabel: '--:--',
      maxRamp: 0,
      meanIntervalWidth: 0,
    });
  }

  const peakPoint = future.reduce((currentPeak, point) =>
    point.forecast > currentPeak.forecast ? point : currentPeak
  );
  const maxRamp = future.reduce((largestRamp, point, index) => {
    if (index === 0) return largestRamp;
    const ramp = Math.abs(point.forecast - future[index - 1].forecast);
    return Math.max(largestRamp, ramp);
  }, 0);
  const meanIntervalWidth =
    future.reduce((total, point) => total + point.p90 - point.p10, 0) /
    future.length;

  return Object.freeze({
    peak: roundOne(peakPoint.forecast),
    peakLabel: peakPoint.label,
    maxRamp: roundOne(maxRamp),
    meanIntervalWidth: roundOne(meanIntervalWidth),
  });
}

const drawSeriesLine = (context, points, xForIndex, yForValue, color, width) => {
  if (points.length === 0) return;
  context.beginPath();
  points.forEach((point, index) => {
    const x = xForIndex(point.index);
    const y = yForValue(point.value);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();
};

export function getChartDimensions(clientWidth, isCompactViewport = false) {
  const width = Number.isFinite(clientWidth) && clientWidth > 0
    ? clientWidth
    : 760;
  return {
    width,
    height: isCompactViewport || width < 560 ? 310 : 380,
  };
}

export function renderForecastChart(canvas, series, stationKey) {
  const context = canvas?.getContext?.('2d');
  if (!context || series.length === 0) return;

  const station = STATIONS[stationKey];
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const isCompactViewport =
    window.matchMedia?.('(max-width: 720px)').matches ?? false;
  const { width, height } = getChartDimensions(
    canvas.clientWidth,
    isCompactViewport,
  );
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = {
    top: 26,
    right: width < 560 ? 18 : 28,
    bottom: 46,
    left: width < 560 ? 46 : 58,
  };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xForIndex = (index) =>
    padding.left + (index / Math.max(1, series.length - 1)) * plotWidth;
  const yForValue = (value) =>
    padding.top + plotHeight - (value / station.capacity) * plotHeight;

  context.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  for (let step = 0; step <= 4; step += 1) {
    const value = (station.capacity / 4) * step;
    const y = yForValue(value);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.strokeStyle = step === 4 ? '#b7d9ec' : '#e6f0f5';
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = '#5b7187';
    context.fillText(`${Math.round(value)}`, padding.left - 10, y);
  }

  const labelStride = width < 560 ? 6 : 4;
  context.textAlign = 'center';
  context.textBaseline = 'top';
  series.forEach((point, index) => {
    if (index % labelStride !== 0 && index !== series.length - 1) return;
    context.fillStyle = '#5b7187';
    context.fillText(point.label, xForIndex(index), height - padding.bottom + 14);
  });

  const future = series.filter((point) => point.isFuture);
  const bandStart = Math.max(0, series.findIndex((point) => point.isFuture) - 1);
  const bandPoints = series.slice(bandStart);
  context.beginPath();
  bandPoints.forEach((point, index) => {
    const x = xForIndex(point.index);
    const y = yForValue(point.p90);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  [...bandPoints].reverse().forEach((point) => {
    context.lineTo(xForIndex(point.index), yForValue(point.p10));
  });
  context.closePath();
  context.fillStyle = 'rgba(15, 127, 143, 0.14)';
  context.fill();

  const history = series
    .filter((point) => point.actual !== null)
    .map((point) => ({ index: point.index, value: point.actual }));
  const forecast = series
    .slice(Math.max(0, series.findIndex((point) => point.isFuture) - 1))
    .map((point) => ({ index: point.index, value: point.forecast }));
  drawSeriesLine(context, history, xForIndex, yForValue, '#163d70', 3);
  drawSeriesLine(context, forecast, xForIndex, yForValue, '#0f7f8f', 3);

  const forecastStartIndex = future[0]?.index ?? series.length - 1;
  const forecastStartX = xForIndex(forecastStartIndex);
  context.save();
  context.setLineDash([5, 5]);
  context.beginPath();
  context.moveTo(forecastStartX, padding.top);
  context.lineTo(forecastStartX, height - padding.bottom);
  context.strokeStyle = '#8aa7bb';
  context.lineWidth = 1.5;
  context.stroke();
  context.restore();
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = '#4c6176';
  context.fillText('预测起点', Math.min(forecastStartX + 7, width - 80), padding.top + 6);
  context.fillText(`功率（${station.unit}）`, padding.left, 3);
}

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

const fillScenarioSelect = (stationKey, selectedScenario) => {
  const scenarioSelect = document.getElementById('scenario-select');
  if (!scenarioSelect) return;
  scenarioSelect.replaceChildren();
  Object.entries(SCENARIOS[stationKey]).forEach(([key, scenario]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = scenario.label;
    option.selected = key === selectedScenario;
    scenarioSelect.append(option);
  });
};

export function initializeForecastDemo() {
  const stationSelect = document.getElementById('station-select');
  const scenarioSelect = document.getElementById('scenario-select');
  const horizonSelect = document.getElementById('horizon-select');
  const updateButton = document.getElementById('update-forecast');
  const canvas = document.getElementById('forecast-chart');
  if (!stationSelect || !scenarioSelect || !horizonSelect || !canvas) return;

  let currentSeries = [];
  let currentStation = stationSelect.value;

  const update = () => {
    currentStation = stationSelect.value;
    const scenarioKey = scenarioSelect.value;
    const horizon = Number(horizonSelect.value);
    currentSeries = buildForecastSeries({
      station: currentStation,
      scenario: scenarioKey,
      horizon,
    });
    const summary = summarizeForecast(currentSeries);
    const station = STATIONS[currentStation];
    const scenario = SCENARIOS[currentStation][scenarioKey];

    renderForecastChart(canvas, currentSeries, currentStation);
    setText('metric-peak', `${summary.peak.toFixed(1)} ${station.unit}`);
    setText('metric-time', summary.peakLabel);
    setText('metric-ramp', `${summary.maxRamp.toFixed(1)} ${station.unit}/h`);
    setText('metric-width', `${summary.meanIntervalWidth.toFixed(1)} ${station.unit}`);
    setText('scenario-description', scenario.description);
    setText(
      'chart-summary',
      `${station.label}，${scenario.label}情景，未来 ${horizon} 小时模拟预测：` +
      `峰值 ${summary.peak.toFixed(1)} ${station.unit}，发生在 ${summary.peakLabel}；` +
      `最大相邻时段爬坡 ${summary.maxRamp.toFixed(1)} ${station.unit}。`,
    );
    canvas.setAttribute(
      'aria-label',
      `${station.label}${scenario.label}情景的发电功率预测演示曲线，` +
      `含历史观测、点预测和 P10 至 P90 区间`,
    );
  };

  stationSelect.addEventListener('change', () => {
    const stationKey = stationSelect.value;
    fillScenarioSelect(stationKey, STATIONS[stationKey].defaultScenario);
    update();
  });
  scenarioSelect.addEventListener('change', update);
  horizonSelect.addEventListener('change', update);
  updateButton?.addEventListener('click', update);

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      renderForecastChart(canvas, currentSeries, currentStation);
    });
  });

  fillScenarioSelect(currentStation, STATIONS[currentStation].defaultScenario);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForecastDemo);
  } else {
    initializeForecastDemo();
  }
}
