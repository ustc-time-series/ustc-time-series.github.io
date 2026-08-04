export const BASINS = Object.freeze({
  mountain: Object.freeze({
    label: '山地流域',
    area: '1,280 km²',
    character: '坡陡流急，汇流时间短，对强降雨响应敏感',
    baseFlow: 72,
    response: 9.2,
    recession: 0.72,
    wetness: 0.68,
    alert: 260,
    warning: 360,
    rainfallScale: 1.08,
  }),
  plain: Object.freeze({
    label: '湿润平原流域',
    area: '2,460 km²',
    character: '河网密集、土壤偏湿，流量响应较缓但高水位持续更久',
    baseFlow: 118,
    response: 6.4,
    recession: 0.86,
    wetness: 0.76,
    alert: 330,
    warning: 470,
    rainfallScale: 0.96,
  }),
  urban: Object.freeze({
    label: '城市河网',
    area: '420 km²',
    character: '不透水面比例高，产流快、峰现早，短时暴雨风险集中',
    baseFlow: 34,
    response: 10.8,
    recession: 0.58,
    wetness: 0.42,
    alert: 170,
    warning: 255,
    rainfallScale: 1.16,
  }),
});

export const SCENARIOS = Object.freeze({
  normal: Object.freeze({
    label: '常态降雨',
    summary: '零散阵雨逐步减弱，主要观察基流与短记忆汇流过程。',
    decision: '常规巡查与滚动更新',
  }),
  persistent: Object.freeze({
    label: '持续降雨',
    summary: '中等强度降雨持续输入，前期湿润状态会放大后续产流。',
    decision: '关注水位累积与调度余量',
  }),
  storm: Object.freeze({
    label: '短时暴雨',
    summary: '短历时强降雨快速集中，重点识别洪峰、峰现时间与风险窗口。',
    decision: '提前预警并核查高风险断面',
  }),
});

const SUPPORTED_HORIZONS = new Set([6, 12, 24]);
const HISTORY_HOURS = 12;
const MAX_HORIZON = 24;
const HISTORICAL_RAIN = [0, 0.4, 1.1, 2.8, 4.2, 3.5, 1.7, 0.6, 0, 0.3, 1.4, 0.8];

function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function clamp(value, minimum, maximum = Number.POSITIVE_INFINITY) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function resolveCanvasWidth(measuredWidth, fallback = 760) {
  const width = Number(measuredWidth);
  return Number.isFinite(width) && width > 0 ? Math.round(width) : fallback;
}

function rainfallForLead(scenarioKey, lead) {
  if (scenarioKey === 'normal') {
    const profile = [0.4, 1.1, 2.3, 3.2, 2.4, 1.2, 0.5, 0.2, 0, 0, 0.4, 0.8];
    return profile[(lead - 1) % profile.length] * Math.max(0.35, 1 - lead / 40);
  }

  if (scenarioKey === 'persistent') {
    const pulse = 4.4 + 1.35 * Math.sin((lead - 2) * 0.58);
    return lead <= 18 ? Math.max(2.6, pulse) : Math.max(0.6, 3.1 - (lead - 18) * 0.42);
  }

  const mainPulse = 18.5 * Math.exp(-((lead - 5.2) ** 2) / 5.8);
  const trailingPulse = 5.8 * Math.exp(-((lead - 11.5) ** 2) / 16);
  return mainPulse + trailingPulse + (lead <= 2 ? 1.1 : 0.25);
}

function labelForIndex(index) {
  if (index < HISTORY_HOURS - 1) {
    return `−${String(HISTORY_HOURS - 1 - index).padStart(2, '0')}h`;
  }
  if (index === HISTORY_HOURS - 1) return 'T0';
  return `+${String(index - HISTORY_HOURS + 1).padStart(2, '0')}h`;
}

function validateOptions({ basin, scenario, horizon }) {
  if (!Object.hasOwn(BASINS, basin)) {
    throw new RangeError(`Unknown basin: ${basin}`);
  }
  if (!Object.hasOwn(SCENARIOS, scenario)) {
    throw new RangeError(`Unknown scenario: ${scenario}`);
  }
  if (!SUPPORTED_HORIZONS.has(Number(horizon))) {
    throw new RangeError(`Unsupported horizon: ${horizon}`);
  }
}

export function buildHydroSeries({ basin = 'mountain', scenario = 'normal', horizon = 12 } = {}) {
  const normalizedHorizon = Number(horizon);
  validateOptions({ basin, scenario, horizon: normalizedHorizon });

  const basinConfig = BASINS[basin];
  const points = [];
  let flowState = basinConfig.baseFlow * (1 + basinConfig.wetness * 0.12);

  for (let index = 0; index < HISTORY_HOURS + MAX_HORIZON; index += 1) {
    const isFuture = index >= HISTORY_HOURS;
    const lead = isFuture ? index - HISTORY_HOURS + 1 : 0;
    const rawRainfall = isFuture
      ? rainfallForLead(scenario, lead)
      : HISTORICAL_RAIN[index];
    const rainfall = round(rawRainfall * basinConfig.rainfallScale);
    const saturationGain = 0.5 + basinConfig.wetness * 0.65;
    const effectiveInflow = rainfall * basinConfig.response * saturationGain;
    const previousExcess = Math.max(0, flowState - basinConfig.baseFlow);
    flowState = basinConfig.baseFlow + previousExcess * basinConfig.recession + effectiveInflow;

    if (!isFuture) {
      const observedFactor = 1 + 0.018 * Math.sin(index * 1.17 + basinConfig.response);
      const actual = round(clamp(flowState * observedFactor, 0));
      flowState = actual;
      points.push({
        index,
        label: labelForIndex(index),
        rainfall,
        actual,
        forecast: actual,
        p10: actual,
        p90: actual,
        isFuture: false,
      });
      continue;
    }

    const forecast = round(clamp(flowState, 0));
    const relativeSpread = 0.055 + lead * 0.0045;
    const band = Math.max(3.2, forecast * relativeSpread + rainfall * 1.25);
    points.push({
      index,
      label: labelForIndex(index),
      rainfall,
      actual: null,
      forecast,
      p10: round(clamp(forecast - band, 0)),
      p90: round(forecast + band),
      isFuture: true,
    });
  }

  return points.slice(0, HISTORY_HOURS + normalizedHorizon);
}

export function summarizeHydroForecast(series, basinKey) {
  if (!Object.hasOwn(BASINS, basinKey)) {
    throw new RangeError(`Unknown basin: ${basinKey}`);
  }
  const future = series.filter((point) => point.isFuture);
  if (future.length === 0) {
    throw new RangeError('Hydrological summary requires future points');
  }

  const basin = BASINS[basinKey];
  const peak = future.reduce((highest, point) =>
    point.forecast > highest.forecast ? point : highest,
  );
  let maxRise = 0;
  for (let index = 0; index < future.length; index += 1) {
    const previous = index === 0
      ? series[series.indexOf(future[0]) - 1]?.forecast ?? future[0].forecast
      : future[index - 1].forecast;
    maxRise = Math.max(maxRise, future[index].forecast - previous);
  }

  const riskPoints = future.filter((point) => point.forecast >= basin.alert);
  const totalRainfall = future.reduce((sum, point) => sum + point.rainfall, 0);
  const meanIntervalWidth = future.reduce(
    (sum, point) => sum + point.p90 - point.p10,
    0,
  ) / future.length;

  return {
    peakFlow: round(peak.forecast),
    peakLabel: peak.label,
    maxRise: round(maxRise),
    totalRainfall: round(totalRainfall),
    meanIntervalWidth: round(meanIntervalWidth),
    riskHours: riskPoints.length,
    riskWindow: riskPoints.length > 0
      ? `${riskPoints[0].label}–${riskPoints.at(-1).label}`
      : '未进入警戒区',
    riskLevel: peak.forecast >= basin.warning
      ? '预警'
      : peak.forecast >= basin.alert
        ? '警戒'
        : '关注',
  };
}

function canvasDimensions(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = resolveCanvasWidth(rect.width);
  const height = width < 560 ? 360 : 420;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.height = `${height}px`;
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function drawPolyline(context, points, xFor, yFor, color, width = 2.5) {
  if (points.length === 0) return;
  context.beginPath();
  points.forEach((point, index) => {
    const x = xFor(point.index);
    const y = yFor(point.forecast);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();
}

function renderChart(canvas, series, basinKey) {
  const { context, width, height } = canvasDimensions(canvas);
  const basin = BASINS[basinKey];
  const compact = width < 560;
  const margin = { top: 28, right: compact ? 44 : 58, bottom: 48, left: compact ? 48 : 62 };
  const rainTop = margin.top;
  const rainBottom = compact ? 82 : 92;
  const flowTop = rainBottom + 28;
  const flowBottom = height - margin.bottom;
  const plotWidth = width - margin.left - margin.right;
  const xFor = (index) => margin.left + (index / (series.length - 1)) * plotWidth;
  const maxRain = Math.max(6, ...series.map((point) => point.rainfall)) * 1.08;
  const maxFlow = Math.max(
    basin.warning * 1.12,
    ...series.map((point) => Math.max(point.actual ?? 0, point.p90)),
  );
  const yForFlow = (value) => flowBottom - (value / maxFlow) * (flowBottom - flowTop);

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.font = `${compact ? 10 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  context.textBaseline = 'middle';

  context.fillStyle = '#5b7187';
  context.fillText('降雨 mm/h', margin.left, 13);
  context.fillText('流量 m³/s', margin.left, flowTop - 12);

  for (let step = 0; step <= 4; step += 1) {
    const value = (maxFlow / 4) * step;
    const y = yForFlow(value);
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(width - margin.right, y);
    context.strokeStyle = '#e6f0f5';
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = '#71869a';
    context.textAlign = 'right';
    context.fillText(String(Math.round(value)), margin.left - 8, y);
  }

  const barWidth = Math.max(3, (plotWidth / series.length) * 0.58);
  for (const point of series) {
    const barHeight = (point.rainfall / maxRain) * (rainBottom - rainTop);
    context.fillStyle = point.isFuture ? 'rgba(15, 127, 143, 0.62)' : 'rgba(90, 127, 166, 0.42)';
    context.fillRect(xFor(point.index) - barWidth / 2, rainTop, barWidth, barHeight);
  }

  const future = series.filter((point) => point.isFuture);
  const anchor = series.find((point) => point.index === HISTORY_HOURS - 1);
  const bandPoints = anchor ? [anchor, ...future] : future;
  context.beginPath();
  bandPoints.forEach((point, index) => {
    const x = xFor(point.index);
    const y = yForFlow(point.p90);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  [...bandPoints].reverse().forEach((point) => {
    context.lineTo(xFor(point.index), yForFlow(point.p10));
  });
  context.closePath();
  context.fillStyle = 'rgba(15, 127, 143, 0.15)';
  context.fill();

  const thresholdY = yForFlow(basin.alert);
  context.beginPath();
  context.setLineDash([6, 5]);
  context.moveTo(margin.left, thresholdY);
  context.lineTo(width - margin.right, thresholdY);
  context.strokeStyle = '#b56b35';
  context.lineWidth = 1.5;
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = '#9a5529';
  context.textAlign = 'left';
  context.fillText('警戒流量', width - margin.right + 7, thresholdY);

  const history = series.filter((point) => !point.isFuture);
  drawPolyline(context, history, xFor, yForFlow, '#163d70', 2.8);
  drawPolyline(context, bandPoints, xFor, yForFlow, '#0f7f8f', 3);

  const originX = xFor(HISTORY_HOURS - 1);
  context.beginPath();
  context.setLineDash([4, 5]);
  context.moveTo(originX, rainTop);
  context.lineTo(originX, flowBottom);
  context.strokeStyle = '#8ba6b9';
  context.lineWidth = 1;
  context.stroke();
  context.setLineDash([]);

  const labelEvery = compact ? Math.ceil(series.length / 5) : Math.ceil(series.length / 8);
  context.fillStyle = '#71869a';
  context.textAlign = 'center';
  series.forEach((point, index) => {
    if (index % labelEvery === 0 || index === series.length - 1 || point.label === 'T0') {
      context.fillText(point.label, xFor(point.index), flowBottom + 22);
    }
  });
  context.fillStyle = '#5a7fa6';
  context.fillText('预测起点', originX, flowBottom + 39);
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function initializeNavigation() {
  const dropdown = document.querySelector('.nav-dropdown');
  const toggle = document.querySelector('.nav-dropdown-toggle');
  if (!dropdown || !toggle) return;

  const close = () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initializeHydroDemo() {
  const basinSelect = document.getElementById('basin-select');
  const scenarioSelect = document.getElementById('scenario-select');
  const horizonSelect = document.getElementById('horizon-select');
  const updateButton = document.getElementById('update-forecast');
  const canvas = document.getElementById('hydro-chart');
  if (!basinSelect || !scenarioSelect || !horizonSelect || !updateButton || !canvas) return;

  let activeSeries = [];
  let activeBasin = basinSelect.value;

  const render = () => {
    activeBasin = basinSelect.value;
    const scenario = scenarioSelect.value;
    const horizon = Number(horizonSelect.value);
    activeSeries = buildHydroSeries({ basin: activeBasin, scenario, horizon });
    const summary = summarizeHydroForecast(activeSeries, activeBasin);
    const basinMeta = BASINS[activeBasin];
    const scenarioMeta = SCENARIOS[scenario];

    drawOrQueue();
    setText('metric-peak', `${summary.peakFlow.toFixed(1)} m³/s`);
    setText('metric-time', summary.peakLabel);
    setText('metric-rise', `${summary.maxRise.toFixed(1)} m³/s·h⁻¹`);
    setText('metric-risk', summary.riskWindow);
    setText('metric-peak-note', `${summary.riskLevel}等级 · 警戒 ${basinMeta.alert} m³/s`);
    setText('metric-time-note', `未来 ${horizon} 小时预测窗口`);
    setText('metric-rise-note', '相邻小时最大正向变化');
    setText('metric-risk-note', `${summary.riskHours} 小时达到或超过警戒流量`);
    setText(
      'scenario-summary',
      `${basinMeta.label}（${basinMeta.area}）：${basinMeta.character}。${scenarioMeta.summary} 未来累计降雨 ${summary.totalRainfall.toFixed(1)} mm；建议关注：${scenarioMeta.decision}。`,
    );
    setText(
      'chart-summary',
      `${basinMeta.label}${scenarioMeta.label}模拟：未来 ${horizon} 小时洪峰 ${summary.peakFlow.toFixed(1)} 立方米每秒，出现在 ${summary.peakLabel}，最大涨水速率 ${summary.maxRise.toFixed(1)} 立方米每秒每小时，风险窗口 ${summary.riskWindow}。`,
    );
  };

  const drawOrQueue = () => {
    window.requestAnimationFrame(() => renderChart(canvas, activeSeries, activeBasin));
  };

  for (const control of [basinSelect, scenarioSelect, horizonSelect]) {
    control.addEventListener('change', render);
  }
  updateButton.addEventListener('click', render);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(drawOrQueue);
    observer.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', drawOrQueue, { passive: true });
  }

  render();
}

if (typeof document !== 'undefined') {
  initializeNavigation();
  initializeHydroDemo();
}
