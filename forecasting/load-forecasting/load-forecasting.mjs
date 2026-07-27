const roundOne = (value) => Math.round(value * 10) / 10;
const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));
const gaussian = (hour, center, width) =>
  Math.exp(-0.5 * Math.pow((hour - center) / width, 2));

export const LOAD_SCOPES = Object.freeze({
  urban: Object.freeze({
    label: '城市电网',
    capacity: 1000,
    unit: 'MW',
    defaultScenario: 'moderate',
    startHour: 0,
  }),
  industrial: Object.freeze({
    label: '产业园区',
    capacity: 160,
    unit: 'MW',
    defaultScenario: 'normal',
    startHour: 0,
  }),
  commercial: Object.freeze({
    label: '商业建筑',
    capacity: 24,
    unit: 'MW',
    defaultScenario: 'weekday',
    startHour: 0,
  }),
});

export const LOAD_SCENARIOS = Object.freeze({
  urban: Object.freeze({
    moderate: Object.freeze({
      label: '温和工作日',
      description: '早晚高峰清晰，午间负荷平稳，适合作为常规调度基线。',
      multiplier: 1,
      uncertainty: 0.028,
      phase: 0.2,
    }),
    heatwave: Object.freeze({
      label: '高温工作日',
      description: '午后制冷需求抬升并延续至晚高峰，峰值与爬坡压力同步增加。',
      multiplier: 1.06,
      uncertainty: 0.052,
      phase: 0.85,
    }),
    holiday: Object.freeze({
      label: '节假日',
      description: '通勤负荷减弱，白天生活用电占比上升，峰谷差相对收窄。',
      multiplier: 0.82,
      uncertainty: 0.038,
      phase: 1.45,
    }),
  }),
  industrial: Object.freeze({
    normal: Object.freeze({
      label: '常规生产',
      description: '生产班次按计划运行，工作时段保持稳定平台，夜间回落。',
      multiplier: 1,
      uncertainty: 0.026,
      phase: 0.45,
    }),
    extended_shift: Object.freeze({
      label: '增产班次',
      description: '生产负荷提前启动并延长至夜间，晚间回落时间明显推迟。',
      multiplier: 1.08,
      uncertainty: 0.045,
      phase: 1.1,
    }),
    maintenance: Object.freeze({
      label: '检修降载',
      description: '部分产线停机检修，工作平台负荷降低并出现阶段性缺口。',
      multiplier: 0.64,
      uncertainty: 0.035,
      phase: 1.75,
    }),
  }),
  commercial: Object.freeze({
    weekday: Object.freeze({
      label: '普通工作日',
      description: '营业与办公时段驱动白天负荷，闭店后快速回落至基础用电。',
      multiplier: 1,
      uncertainty: 0.032,
      phase: 0.65,
    }),
    hot_traffic: Object.freeze({
      label: '高温客流',
      description: '高温与客流叠加，午后空调和服务设施负荷持续处于高位。',
      multiplier: 1.09,
      uncertainty: 0.058,
      phase: 1.25,
    }),
    weekend: Object.freeze({
      label: '周末低负荷',
      description: '办公需求下降且启停更晚，整体负荷降低、峰值向午后移动。',
      multiplier: 0.72,
      uncertainty: 0.04,
      phase: 1.9,
    }),
  }),
});

const urbanLoadRatio = (hour, scenarioKey) => {
  let ratio =
    0.36 +
    0.19 * gaussian(hour, 8.5, 2.1) +
    0.08 * gaussian(hour, 14, 5.1) +
    0.29 * gaussian(hour, 19, 2.8);

  if (scenarioKey === 'heatwave') {
    ratio += 0.17 * gaussian(hour, 16, 4.2);
  }
  if (scenarioKey === 'holiday') {
    ratio =
      0.38 +
      0.07 * gaussian(hour, 10, 3.2) +
      0.19 * gaussian(hour, 19.5, 3.5);
  }
  return ratio;
};

const smoothWindow = (hour, start, end, edgeWidth = 0.8) => {
  const rising = 1 / (1 + Math.exp(-(hour - start) / edgeWidth));
  const falling = 1 / (1 + Math.exp((hour - end) / edgeWidth));
  return rising * falling;
};

const industrialLoadRatio = (hour, scenarioKey) => {
  const extendedShift = scenarioKey === 'extended_shift';
  const activity = smoothWindow(hour, extendedShift ? 5.8 : 7, extendedShift ? 22 : 19);
  let ratio = 0.2 + 0.56 * activity + 0.035 * gaussian(hour, 12.5, 4.5);

  if (scenarioKey === 'maintenance') {
    ratio -= 0.11 * gaussian(hour, 14, 2.2);
  }
  return ratio;
};

const commercialLoadRatio = (hour, scenarioKey) => {
  const weekend = scenarioKey === 'weekend';
  const activity = smoothWindow(hour, weekend ? 9.5 : 7.5, 21.5, 1);
  let ratio =
    0.12 +
    0.54 * activity +
    0.09 * gaussian(hour, weekend ? 16 : 14.5, 3.3);

  if (scenarioKey === 'hot_traffic') {
    ratio += 0.15 * gaussian(hour, 16, 4.3);
  }
  return ratio;
};

const getExpectedLoad = ({
  scopeKey,
  scenarioKey,
  scope,
  scenario,
  index,
  hour,
}) => {
  let loadRatio;
  if (scopeKey === 'urban') {
    loadRatio = urbanLoadRatio(hour, scenarioKey);
  } else if (scopeKey === 'industrial') {
    loadRatio = industrialLoadRatio(hour, scenarioKey);
  } else {
    loadRatio = commercialLoadRatio(hour, scenarioKey);
  }

  const deterministicVariation =
    1 + 0.012 * Math.sin(index * 0.71 + scenario.phase);
  return scope.capacity * loadRatio * scenario.multiplier * deterministicVariation;
};

const assertOptions = ({ scope, scenario, horizon }) => {
  if (!LOAD_SCOPES[scope]) {
    throw new RangeError(`Unknown load scope: ${scope}`);
  }
  if (!LOAD_SCENARIOS[scope][scenario]) {
    throw new RangeError(`Unknown ${scope} scenario: ${scenario}`);
  }
  if (![6, 12, 24].includes(Number(horizon))) {
    throw new RangeError(`Unsupported forecast horizon: ${horizon}`);
  }
};

export function buildLoadForecastSeries({
  scope: scopeKey,
  scenario: scenarioKey,
  horizon,
}) {
  const normalizedHorizon = Number(horizon);
  assertOptions({
    scope: scopeKey,
    scenario: scenarioKey,
    horizon: normalizedHorizon,
  });

  const scope = LOAD_SCOPES[scopeKey];
  const scenario = LOAD_SCENARIOS[scopeKey][scenarioKey];
  const historyLength = 12;
  const totalLength = historyLength + normalizedHorizon;

  return Array.from({ length: totalLength }, (_, index) => {
    const hour = (scope.startHour + index) % 24;
    const forecast = clamp(
      getExpectedLoad({
        scopeKey,
        scenarioKey,
        scope,
        scenario,
        index,
        hour,
      }),
      0,
      scope.capacity,
    );
    const futureStep = Math.max(0, index - historyLength + 1);
    const uncertaintyRatio =
      scenario.uncertainty + (Math.min(futureStep, 24) / 24) * 0.03;
    const spread = Math.max(
      scope.capacity * 0.012,
      scope.capacity * uncertaintyRatio,
    );
    const observedVariation =
      1 + 0.024 * Math.sin(index * 1.13 + scenario.phase);
    const actual = index < historyLength
      ? clamp(forecast * observedVariation, 0, scope.capacity)
      : null;

    return Object.freeze({
      index,
      label: `${String(hour).padStart(2, '0')}:00`,
      actual: actual === null ? null : roundOne(actual),
      forecast: roundOne(forecast),
      p10: roundOne(clamp(forecast - spread, 0, scope.capacity)),
      p90: roundOne(clamp(forecast + spread, 0, scope.capacity)),
      isFuture: index >= historyLength,
    });
  });
}

export function summarizeLoadForecast(series) {
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

export function getLoadChartDimensions(clientWidth, isCompactViewport = false) {
  const width = Number.isFinite(clientWidth) && clientWidth > 0
    ? clientWidth
    : 760;
  return {
    width,
    height: isCompactViewport || width < 560 ? 310 : 380,
  };
}

export function renderLoadForecastChart(canvas, series, scopeKey) {
  const context = canvas?.getContext?.('2d');
  if (!context || series.length === 0) return;

  const scope = LOAD_SCOPES[scopeKey];
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const isCompactViewport =
    window.matchMedia?.('(max-width: 720px)').matches ?? false;
  const { width, height } = getLoadChartDimensions(
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
    left: width < 560 ? 48 : 62,
  };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xForIndex = (index) =>
    padding.left + (index / Math.max(1, series.length - 1)) * plotWidth;
  const yForValue = (value) =>
    padding.top + plotHeight - (value / scope.capacity) * plotHeight;

  context.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  for (let step = 0; step <= 4; step += 1) {
    const value = (scope.capacity / 4) * step;
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
  const firstFutureIndex = series.findIndex((point) => point.isFuture);
  const bandStart = Math.max(0, firstFutureIndex - 1);
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
    .slice(bandStart)
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
  context.fillText(`负荷（${scope.unit}）`, padding.left, 3);
}

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

const fillLoadScenarioSelect = (scopeKey, selectedScenario) => {
  const scenarioSelect = document.getElementById('load-scenario-select');
  if (!scenarioSelect) return;
  scenarioSelect.replaceChildren();
  Object.entries(LOAD_SCENARIOS[scopeKey]).forEach(([key, scenario]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = scenario.label;
    option.selected = key === selectedScenario;
    scenarioSelect.append(option);
  });
};

export function initializeLoadForecastDemo() {
  const scopeSelect = document.getElementById('load-scope-select');
  const scenarioSelect = document.getElementById('load-scenario-select');
  const horizonSelect = document.getElementById('load-horizon-select');
  const updateButton = document.getElementById('load-update-forecast');
  const canvas = document.getElementById('load-forecast-chart');
  if (!scopeSelect || !scenarioSelect || !horizonSelect || !canvas) return;

  let currentSeries = [];
  let currentScope = scopeSelect.value;

  const update = () => {
    currentScope = scopeSelect.value;
    const scenarioKey = scenarioSelect.value;
    const horizon = Number(horizonSelect.value);
    currentSeries = buildLoadForecastSeries({
      scope: currentScope,
      scenario: scenarioKey,
      horizon,
    });
    const summary = summarizeLoadForecast(currentSeries);
    const scope = LOAD_SCOPES[currentScope];
    const scenario = LOAD_SCENARIOS[currentScope][scenarioKey];

    renderLoadForecastChart(canvas, currentSeries, currentScope);
    setText('load-metric-peak', `${summary.peak.toFixed(1)} ${scope.unit}`);
    setText('load-metric-time', summary.peakLabel);
    setText('load-metric-ramp', `${summary.maxRamp.toFixed(1)} ${scope.unit}/h`);
    setText('load-metric-width', `${summary.meanIntervalWidth.toFixed(1)} ${scope.unit}`);
    setText('load-scenario-description', scenario.description);
    setText(
      'load-chart-summary',
      `${scope.label}，${scenario.label}情景，未来 ${horizon} 小时模拟预测：` +
      `峰值 ${summary.peak.toFixed(1)} ${scope.unit}，发生在 ${summary.peakLabel}；` +
      `最大相邻时段爬坡 ${summary.maxRamp.toFixed(1)} ${scope.unit}。`,
    );
    canvas.setAttribute(
      'aria-label',
      `${scope.label}${scenario.label}情景的用电负荷预测演示曲线，` +
      `含历史观测、点预测和 P10 至 P90 区间`,
    );
  };

  scopeSelect.addEventListener('change', () => {
    const scopeKey = scopeSelect.value;
    fillLoadScenarioSelect(scopeKey, LOAD_SCOPES[scopeKey].defaultScenario);
    update();
  });
  scenarioSelect.addEventListener('change', update);
  horizonSelect.addEventListener('change', update);
  updateButton?.addEventListener('click', update);

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      renderLoadForecastChart(canvas, currentSeries, currentScope);
    });
  });

  fillLoadScenarioSelect(currentScope, LOAD_SCOPES[currentScope].defaultScenario);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoadForecastDemo);
  } else {
    initializeLoadForecastDemo();
  }
}
