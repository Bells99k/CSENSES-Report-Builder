const state = {
  template: "composite",
  rows: [],
  imageChoice: "grove",
  uploadedImage: null,
  sampleImage: null,
  noteHtml: "Type in your comments/stories/lived experience here",
};

const els = {
  title: document.getElementById("reportTitle"),
  location: document.getElementById("locationName"),
  month: document.getElementById("reportMonth"),
  author: document.getElementById("reportAuthor"),
  reportDate: document.getElementById("reportDate"),
  generalInfo: document.getElementById("generalInfo"),
  notePreview: document.getElementById("generalInfoPreview"),
  noteFontFamily: document.getElementById("noteFontFamily"),
  noteFontSize: document.getElementById("noteFontSize"),
  noteClearFormat: document.getElementById("noteClearFormat"),
  pictureSelect: document.getElementById("pictureSelect"),
  imageUpload: document.getElementById("imageUpload"),
  csvUpload: document.getElementById("csvUpload"),
  airThreshold: document.getElementById("airThreshold"),
  pm10Threshold: document.getElementById("pm10Threshold"),
  heatThreshold: document.getElementById("heatThreshold"),
  noiseThreshold: document.getElementById("noiseThreshold"),
  calendarMetric: document.getElementById("calendarMetric"),
  standardsGraphic: document.getElementById("standardsGraphic"),
  previewCluster: document.getElementById("calendarLocation"),
  calendarGrid: document.getElementById("calendarGrid"),
  reportScene: document.getElementById("sceneCanvasReport"),
  trendChart: document.getElementById("trendChart"),
  trendScene: document.getElementById("sceneCanvasTrends"),
  snapshotScene: document.getElementById("sceneCanvasSnapshot"),
};

const colors = {
  air: "#b8b2ea",
  pm10: "#f4c269",
  heat: "#f2b9ad",
  noise: "#f3dba5",
  ink: "#181b1f",
  muted: "#66717a",
  teal: "#83AC62",
  leaf: "#6f8b3d",
  coral: "#c45f4e",
};

const defaultNoteFontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const defaultNoteFontSize = "18";

const metricLabels = {
  composite: "Composite hazard severity",
  air: "PM₂.₅",
  pm10: "PM₁₀",
  heat: "Heat Index classification",
  noise: "Noise",
};

const reportMetrics = ["air", "pm10", "heat", "noise"];

const metricStandards = {
  heat: {
    title: "Heat Index",
    note: "Heat Index colors use sensors or daily cluster averages and follow the HI thresholds.",
    riskLabel: "Danger or Extreme Danger",
    threshold: 80,
    bands: [
      { label: "No HI Classification", min: -Infinity, max: 80, range: "Less than 80°F", color: "#fffdfb", textColor: "#c7564e", className: "hi-none-cell" },
      { label: "Caution", min: 80, max: 90, range: "80°F - 90°F", color: "#fffdb0", className: "hi-caution-cell" },
      { label: "Extreme Caution", min: 90, max: 103, range: "90°F - 103°F", color: "#edd365", className: "hi-extreme-caution-cell" },
      { label: "Danger", min: 103, max: 125, range: "103°F - 124°F", color: "#d1763d", className: "hi-danger-cell" },
      { label: "Extreme Danger", min: 125, max: Infinity, range: "125°F and higher", color: "#b03227", textColor: "#ffffff", className: "hi-extreme-danger-cell" },
    ],
  },
  air: {
    title: "PM₂.₅",
    note: "PM₂.₅ colors use daily cluster averages and follow the displayed particulate matter standards.",
    riskLabel: "Unhealthy or worse",
    threshold: 35.5,
    bands: [
      { label: "Good", min: -Infinity, max: 9.1, range: "0 - 9", color: "#0ca33f", textColor: "#ffffff" },
      { label: "Moderate", min: 9.1, max: 35.5, range: "9.1 - 35.4", color: "#ffb21a", textColor: "#ffffff" },
      { label: "Unhealthy for Sensitive Groups", min: 35.5, max: 55.5, range: "35.5 - 55.4", color: "#ff7113", textColor: "#ffffff" },
      { label: "Unhealthy", min: 55.5, max: 125.5, range: "55.5 - 125.4", color: "#ed1c24", textColor: "#ffffff" },
      { label: "Very Unhealthy", min: 125.5, max: 225.5, range: "125.5 - 225.4", color: "#724188", textColor: "#ffffff" },
      { label: "Hazardous", min: 225.5, max: Infinity, range: ">=225.5", color: "#7c0b08", textColor: "#ffffff" },
    ],
  },
  pm10: {
    title: "PM₁₀",
    note: "PM₁₀ colors use daily cluster averages and follow the displayed particulate matter standards.",
    riskLabel: "Unhealthy or worse",
    threshold: 155,
    bands: [
      { label: "Good", min: -Infinity, max: 55, range: "0 - 54", color: "#0ca33f", textColor: "#ffffff" },
      { label: "Moderate", min: 55, max: 155, range: "55 - 154", color: "#ffb21a", textColor: "#ffffff" },
      { label: "Unhealthy for Sensitive Groups", min: 155, max: 255, range: "155 - 254", color: "#ff7113", textColor: "#ffffff" },
      { label: "Unhealthy", min: 255, max: 355, range: "255 - 354", color: "#ed1c24", textColor: "#ffffff" },
      { label: "Very Unhealthy", min: 355, max: 425, range: "355 - 424", color: "#724188", textColor: "#ffffff" },
      { label: "Hazardous", min: 425, max: Infinity, range: ">=425", color: "#7c0b08", textColor: "#ffffff" },
    ],
  },
  noise: {
    title: "Noise",
    note: "Noise colors use daily cluster averages and follow the displayed decibel guidance bands.",
    riskLabel: "Unreasonable",
    threshold: 70,
    bands: [
      { label: "Acceptable at Any Time", min: -Infinity, max: 50, range: "0 - 49 dB", color: "#08a64f", textColor: "#ffffff" },
      { label: "Acceptable Only from 7 a.m. to 11 p.m.", min: 50, max: 70, range: "50 - 69 dB", color: "#f5c117", textColor: "#11151a" },
      { label: "Unreasonable at Any Time", min: 70, max: Infinity, range: "70+ dB", color: "#9c0606", textColor: "#ffffff" },
    ],
  },
};

const sampleDailyValues = [
  ["2026-06-01", 18, 54, 82, 61],
  ["2026-06-02", 42, 126, 85, 72],
  ["2026-06-03", 37, 112, 91, 68],
  ["2026-06-04", 22, 66, 88, 74],
  ["2026-06-05", 16, 48, 93, 76],
  ["2026-06-06", 28, 84, 95, 71],
  ["2026-06-07", 31, 93, 89, 66],
  ["2026-06-08", 45, 135, 92, 79],
  ["2026-06-09", 39, 117, 86, 63],
  ["2026-06-10", 20, 60, 81, 58],
  ["2026-06-11", 24, 72, 90, 70],
  ["2026-06-12", 52, 156, 104, 82],
  ["2026-06-13", 33, 99, 94, 75],
  ["2026-06-14", 19, 57, 87, 62],
  ["2026-06-15", 41, 123, 91, 73],
  ["2026-06-16", 35, 105, 84, 69],
  ["2026-06-17", 29, 87, 83, 65],
  ["2026-06-18", 48, 144, 97, 78],
  ["2026-06-19", 53, 159, 126, 81],
  ["2026-06-20", 27, 81, 90, 72],
  ["2026-06-21", 21, 63, 86, 67],
  ["2026-06-22", 17, 51, 79, 57],
  ["2026-06-23", 43, 129, 92, 77],
  ["2026-06-24", 46, 138, 94, 80],
  ["2026-06-25", 38, 114, 91, 73],
  ["2026-06-26", 25, 75, 88, 69],
  ["2026-06-27", 30, 90, 89, 71],
  ["2026-06-28", 55, 165, 99, 84],
  ["2026-06-29", 47, 141, 93, 76],
  ["2026-06-30", 32, 96, 87, 64],
];

const sampleRows = Array.from({ length: 5 }, (_, clusterIndex) => {
  const clusterNumber = clusterIndex + 1;
  const clusterOffset = clusterIndex * 3;
  return sampleDailyValues.flatMap(([date, air, pm10, heat, noise], dayIndex) => {
    const dayWave = (dayIndex % 5) - 2;
    return [1, 2].map((sensorNumber) => ({
      date,
      cluster: `Sample Cluster ${clusterNumber}`,
      sensorId: `SC${clusterNumber}-${sensorNumber}`,
      air: roundNumber(air + clusterOffset + sensorNumber + dayWave * 0.8),
      pm10: roundNumber(pm10 + clusterOffset * 2.7 + sensorNumber * 2 + dayWave * 1.1),
      heat: roundNumber(heat + clusterOffset * 1.4 + sensorNumber * 1.5 + dayWave),
      noise: roundNumber(noise + clusterOffset * 1.8 + sensorNumber * 1.2 - dayWave * 0.5),
    }));
  });
}).flat();

function parseCsv(text) {
  const rows = [];
  let field = "";
  let record = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      record.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      record.push(field);
      if (record.some((cell) => cell.trim())) rows.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  record.push(field);
  if (record.some((cell) => cell.trim())) rows.push(record);
  return rows;
}

function normalizeRows(csvRows) {
  if (csvRows.length < 2) return [];
  const headers = csvRows[0].map((header) => header.trim().toLowerCase());
  const findColumn = (names) => headers.findIndex((header) => names.some((name) => header.includes(name)));

  const dateIndex = findColumn(["date", "day", "timestamp", "time"]);
  const clusterIndex = findColumn(["cluster", "admin area", "admin_area", "area", "zone", "neighborhood"]);
  const sensorIndex = findColumn(["sensor_id", "sensor id", "sensor", "device", "station"]);
  const airIndex = findColumn(["pm2.5", "pm25", "air", "particulate"]);
  const pm10Index = findColumn(["pm10", "pm 10", "pm_10"]);
  const heatIndex = findColumn(["heat_index", "temperature", "temp", "heat"]);
  const noiseIndex = findColumn(["noise", "decibel", "db"]);

  return csvRows.slice(1).map((row) => ({
    date: cleanDate(row[dateIndex]),
    cluster: cleanText(row[clusterIndex]) || "Sample Cluster",
    sensorId: cleanText(row[sensorIndex]),
    air: toNumber(row[airIndex]),
    pm10: toNumber(row[pm10Index]),
    heat: toNumber(row[heatIndex]),
    noise: toNumber(row[noiseIndex]),
  })).filter((row) => row.date);
}

function cleanText(value) {
  return value ? value.trim() : "";
}

function cleanDate(value) {
  if (!value) return "";
  const parsed = new Date(`${value.trim()}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
}

function roundNumber(value) {
  return Math.round(value * 10) / 10;
}

function monthInfo() {
  const [year, month] = els.month.value.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const long = date.toLocaleString("en", { month: "long", year: "numeric" });
  const short = date.toLocaleString("en", { month: "long" });
  const days = new Date(year, month, 0).getDate();
  const start = date.getDay();
  return { year, month, long, short, days, start };
}

function thresholds() {
  return {
    air: Number(els.airThreshold.value) || metricStandards.air.threshold,
    pm10: Number(els.pm10Threshold.value) || metricStandards.pm10.threshold,
    heat: Number(els.heatThreshold.value) || metricStandards.heat.threshold,
    noise: Number(els.noiseThreshold.value) || metricStandards.noise.threshold,
  };
}

function metricUnit(metric) {
  if (metric === "air" || metric === "pm10") return "ug/m3";
  if (metric === "heat") return "°F";
  if (metric === "noise") return "dB";
  return "severity";
}

function filteredRows() {
  const { year, month } = monthInfo();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const cluster = els.location.value;
  const rows = state.rows.filter((row) => row.date.startsWith(prefix) && row.cluster === cluster);
  return averageRowsByDate(rows);
}

function averageRowsByDate(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    if (!grouped.has(row.date)) {
      grouped.set(row.date, {
        date: row.date,
        cluster: row.cluster,
        air: { sum: 0, count: 0 },
        pm10: { sum: 0, count: 0 },
        heat: { sum: 0, count: 0 },
        noise: { sum: 0, count: 0 },
        sensorCount: new Set(),
      });
    }

    const group = grouped.get(row.date);
    if (row.sensorId) group.sensorCount.add(row.sensorId);
    reportMetrics.forEach((key) => {
      if (row[key] === null) return;
      group[key].sum += row[key];
      group[key].count += 1;
    });
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((group) => ({
      date: group.date,
      cluster: group.cluster,
      air: averageMetric(group.air),
      pm10: averageMetric(group.pm10),
      heat: averageMetric(group.heat),
      noise: averageMetric(group.noise),
      sensorCount: group.sensorCount.size || Math.max(group.air.count, group.pm10.count, group.heat.count, group.noise.count),
    }));
}

function averageMetric(metric) {
  return metric.count ? roundNumber(metric.sum / metric.count) : null;
}

function clusterOptions() {
  return Array.from(new Set(state.rows.map((row) => row.cluster).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function updateClusterOptions(preferredCluster = els.location.value) {
  const clusters = clusterOptions();
  populateClusterSelect(els.location, clusters);

  const selectedCluster = clusters.includes(preferredCluster) ? preferredCluster : clusters[0];
  if (!selectedCluster) return;
  els.location.value = selectedCluster;
  els.previewCluster.textContent = selectedCluster;
}

function populateClusterSelect(select, clusters) {
  select.innerHTML = "";
  clusters.forEach((cluster) => {
    const option = document.createElement("option");
    option.value = cluster;
    option.textContent = cluster;
    select.append(option);
  });
}

function exceedanceStats() {
  const limits = thresholds();
  const rows = filteredRows();
  const counts = { air: 0, pm10: 0, heat: 0, noise: 0 };
  const max = { air: null, pm10: null, heat: null, noise: null };
  const byDate = new Map();

  rows.forEach((row) => {
    const flags = {
      air: row.air !== null && row.air >= limits.air,
      pm10: row.pm10 !== null && row.pm10 >= limits.pm10,
      heat: row.heat !== null && row.heat >= limits.heat,
      noise: row.noise !== null && row.noise >= limits.noise,
    };
    Object.keys(counts).forEach((key) => {
      if (flags[key]) counts[key] += 1;
      if (row[key] !== null) max[key] = max[key] === null ? row[key] : Math.max(max[key], row[key]);
    });
    byDate.set(row.date, { ...row, flags });
  });

  return { rows, counts, max, byDate };
}

function metricSummaryStats(rows, metric) {
  const metricRows = rows.filter((row) => row[metric] !== null);
  const config = metricStandards[metric];
  const riskStart = metric === "heat" ? 3 : metric === "noise" ? 2 : 3;
  const riskDays = metricRows.filter((row) => {
    const band = standardBand(metric, row[metric]);
    return config.bands.indexOf(band) >= riskStart;
  }).length;

  return {
    exceedanceDays: metricRows.filter((row) => row[metric] >= config.threshold).length,
    maxValue: metricRows.length ? Math.max(...metricRows.map((row) => row[metric])) : null,
    riskDays,
  };
}

function rowSeverity(row, metric, limits) {
  if (!row) return null;

  if (metric !== "composite") {
    const value = row[metric];
    if (value === null) return null;
    const band = standardBand(metric, value);
    const bands = metricStandards[metric]?.bands || [];
    const index = bands.indexOf(band);
    return index === -1 ? 0 : index / Math.max(1, bands.length - 1);
  }

  const severities = reportMetrics
    .map((key) => {
      if (row[key] === null) return null;
      return Math.max(0, row[key] / (limits[key] || 1));
    })
    .filter((value) => value !== null);

  if (!severities.length) return null;
  return Math.min(1.6, severities.reduce((sum, value) => sum + value, 0) / severities.length);
}

function heatColor(severity) {
  if (severity === null) return "#ffffff";
  const stops = [
    [0, [232, 240, 234]],
    [0.55, [183, 211, 184]],
    [0.9, [243, 219, 165]],
    [1.2, [226, 153, 116]],
    [1.6, [196, 95, 78]],
  ];
  const clamped = Math.max(0, Math.min(1.6, severity));
  const upperIndex = stops.findIndex(([stop]) => stop >= clamped);
  const upper = stops[Math.max(upperIndex, 1)];
  const lower = stops[Math.max(upperIndex - 1, 0)];
  const range = upper[0] - lower[0] || 1;
  const ratio = (clamped - lower[0]) / range;
  const channel = (index) => Math.round(lower[1][index] + (upper[1][index] - lower[1][index]) * ratio);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function heatLabel(severity) {
  if (severity === null) return "No data";
  if (severity < 0.35) return "Low";
  if (severity < 0.7) return "Moderate";
  if (severity < 1) return "Elevated";
  return "Threshold exceeded";
}

function standardBand(metric, value) {
  if (value === null || !Number.isFinite(value)) return null;
  const bands = metricStandards[metric]?.bands || [];
  return bands.find((band) => value >= band.min && value < band.max) || bands[bands.length - 1] || null;
}

function calendarColor(row, metric, severity) {
  if (!row) return "#ffffff";
  if (metricStandards[metric]) return standardBand(metric, row[metric])?.color || "#ffffff";
  return heatColor(severity);
}

function calendarLabel(row, metric, severity) {
  if (!row) return "No data";
  if (metricStandards[metric]) return standardBand(metric, row[metric])?.label || "No data";
  return heatLabel(severity);
}

function calendarBandClass(row, metric) {
  if (!row || !metricStandards[metric]) return "";
  const band = standardBand(metric, row[metric]);
  return [band?.className || "", metric === "heat" && band?.textColor === "#ffffff" ? "is-dark-cell" : ""].filter(Boolean).join(" ");
}

function renderStandardsGraphic(metric) {
  const config = metricStandards[metric];
  if (!config) return;
  document.getElementById("standardsTitle").textContent = config.title;
  els.standardsGraphic.innerHTML = "";
  els.standardsGraphic.style.gridTemplateColumns = `repeat(${config.bands.length}, minmax(0, 1fr))`;
  els.standardsGraphic.setAttribute("aria-label", `${config.title} standards color scale`);

  config.bands.forEach((band) => {
    const item = document.createElement("span");
    item.style.background = band.color;
    item.style.color = band.textColor || "#11151a";
    item.innerHTML = `${band.label}<small>${band.range}</small>`;
    const small = item.querySelector("small");
    small.style.color = band.textColor || "#11151a";
    els.standardsGraphic.append(item);
  });
}

function renderCalendar() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const limits = thresholds();
  const metric = els.calendarMetric.value;
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  els.calendarGrid.innerHTML = "";
  renderStandardsGraphic(metric);
  document.getElementById("heatmapNote").textContent = metricStandards[metric]?.note || `${metricLabels[metric]} heatmap from daily cluster averages.`;

  weekdays.forEach((day) => {
    const item = document.createElement("div");
    item.className = "weekday";
    item.textContent = day;
    els.calendarGrid.append(item);
  });

  for (let i = 0; i < info.start; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day is-empty";
    els.calendarGrid.append(empty);
  }

  for (let day = 1; day <= info.days; day += 1) {
    const date = `${info.year}-${String(info.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const datum = stats.byDate.get(date);
    const severity = rowSeverity(datum, metric, limits);
    const label = calendarLabel(datum, metric, severity);
    const cell = document.createElement("div");
    cell.className = `day heatmap-day ${calendarBandClass(datum, metric)} ${severity !== null && severity >= 1 ? "is-over-threshold" : ""}`;
    cell.style.setProperty("--heat", calendarColor(datum, metric, severity));
    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="heatmap-value">${formatCellValue(datum, metric, severity)}</span>
      <div class="hazard-dots" aria-label="Exceeded thresholds">
        <span class="air ${datum?.flags.air ? "active" : ""}" title="PM₂.₅ threshold"></span>
        <span class="pm10 ${datum?.flags.pm10 ? "active" : ""}" title="PM₁₀ threshold"></span>
        <span class="heat ${datum?.flags.heat ? "active" : ""}" title="Heat threshold"></span>
        <span class="noise ${datum?.flags.noise ? "active" : ""}" title="Noise threshold"></span>
      </div>
    `;
    cell.setAttribute("aria-label", `${date}: ${label}`);
    const summary = datum
      ? `Averaged from ${datum.sensorCount || 0} sensor row(s). PM₂.₅ ${datum.air ?? "n/a"}, PM₁₀ ${datum.pm10 ?? "n/a"}, Heat ${datum.heat ?? "n/a"}, Noise ${datum.noise ?? "n/a"}`
      : "No data";
    cell.title = `${date}: ${label}. ${summary}`;
    els.calendarGrid.append(cell);
  }
}

function formatCellValue(row, metric, severity) {
  if (!row) return "";
  if (metric === "composite") return severity === null ? "" : `${Math.round(severity * 100)}%`;
  return row[metric] === null ? "" : `${row[metric]}`;
}

function renderTrendChart() {
  const canvas = els.trendChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const stats = exceedanceStats();
  const rows = stats.rows;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfbfa";
  ctx.fillRect(0, 0, width, height);

  const padding = { left: 56, right: 22, top: 24, bottom: 48 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const values = rows.flatMap((row) => [row.air, row.heat, row.noise]).filter((value) => value !== null);
  const maxValue = Math.max(100, ...values);

  ctx.strokeStyle = "#d3d8da";
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.muted;
  ctx.font = "14px Inter, sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(Math.round(maxValue - (maxValue / 4) * i)), 10, y + 4);
  }

  function drawLine(key, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    rows.forEach((row, index) => {
      if (row[key] === null) return;
      const x = padding.left + (rows.length <= 1 ? 0 : (plotW / (rows.length - 1)) * index);
      const y = padding.top + plotH - (row[key] / maxValue) * plotH;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  drawLine("air", colors.air);
  drawLine("heat", colors.heat);
  drawLine("noise", colors.noise);

  ctx.fillStyle = colors.muted;
  rows.forEach((row, index) => {
    if (index % Math.ceil(Math.max(rows.length, 1) / 8) !== 0) return;
    const day = Number(row.date.slice(-2));
    const x = padding.left + (rows.length <= 1 ? 0 : (plotW / (rows.length - 1)) * index);
    ctx.fillText(String(day), x - 5, height - 18);
  });

  if (!rows.length) {
    ctx.fillStyle = colors.muted;
    ctx.font = "24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload a CSV or load the sample data", width / 2, height / 2);
    ctx.textAlign = "start";
  }
}

function renderScene(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (state.uploadedImage) {
    const image = state.uploadedImage;
    drawImageContain(ctx, image, 0, 0, image.width, image.height, width, height);
    return;
  }

  if (state.imageChoice === "grove" && state.sampleImage?.complete) {
    drawImageContain(ctx, state.sampleImage, 2135, 155, 970, 715, width, height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (state.imageChoice === "school") {
    gradient.addColorStop(0, "#8fb7a1");
    gradient.addColorStop(1, "#f3dba5");
  } else if (state.imageChoice === "transit") {
    gradient.addColorStop(0, "#6d8794");
    gradient.addColorStop(1, "#c45f4e");
  } else {
    gradient.addColorStop(0, "#9fb5bd");
    gradient.addColorStop(1, "#f2b9ad");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.fillRect(0, height * 0.68, width, height * 0.32);
  ctx.fillStyle = "rgba(24,27,31,0.72)";
  ctx.fillRect(width * 0.08, height * 0.28, width * 0.16, height * 0.4);
  ctx.fillRect(width * 0.29, height * 0.16, width * 0.13, height * 0.52);
  ctx.fillRect(width * 0.74, height * 0.22, width * 0.15, height * 0.46);

  ctx.strokeStyle = "#181b1f";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(width * 0.56, height * 0.72);
  ctx.lineTo(width * 0.56, height * 0.33);
  ctx.stroke();
  ctx.fillStyle = "#f7f7f5";
  ctx.strokeStyle = "#181b1f";
  ctx.lineWidth = 6;
  ctx.fillRect(width * 0.49, height * 0.22, width * 0.14, height * 0.13);
  ctx.strokeRect(width * 0.49, height * 0.22, width * 0.14, height * 0.13);
  ctx.fillStyle = colors.teal;
  ctx.beginPath();
  ctx.arc(width * 0.56, height * 0.285, Math.min(width, height) * 0.025, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#181b1f";
  ctx.font = `700 ${Math.max(20, width * 0.035)}px Inter, sans-serif`;
  const label = state.imageChoice === "school" ? "Schoolyard Sensor" : state.imageChoice === "transit" ? "Transit Stop Monitor" : "Urban Heat Corridor";
  ctx.fillText(label, width * 0.06, height * 0.88);
}

function drawImageCover(ctx, image, sx, sy, sw, sh, width, height) {
  const scale = Math.max(width / sw, height / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, drawW, drawH);
}

function drawImageContain(ctx, image, sx, sy, sw, sh, width, height) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const scale = Math.min(width / sw, height / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, drawW, drawH);
}

function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function formattedReportDate() {
  if (!els.reportDate.value) return "";
  const date = new Date(`${els.reportDate.value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
}

function resizeReportNote() {
  const maxHeight = document.body.classList.contains("is-exporting") ? 110 : 220;
  els.notePreview.style.height = "auto";
  els.notePreview.style.height = `${Math.min(els.notePreview.scrollHeight, maxHeight)}px`;
}

function fitReportNoteForPrint() {
  const maxHeight = 300;
  let size = Number(els.noteFontSize.value) || Number(defaultNoteFontSize);
  els.notePreview.style.height = `${Math.min(els.notePreview.scrollHeight, maxHeight)}px`;
  els.notePreview.style.overflow = "hidden";
  els.notePreview.style.lineHeight = "1.12";

  while (els.notePreview.scrollHeight > maxHeight && size > 13) {
    size -= 0.5;
    els.notePreview.style.fontSize = `${size}px`;
    els.notePreview.style.height = `${Math.min(els.notePreview.scrollHeight, maxHeight)}px`;
  }
}

function restoreReportNoteAfterPrint() {
  applyNoteStyles();
  els.notePreview.style.lineHeight = "";
  els.notePreview.style.overflow = "";
  resizeReportNote();
}

function noteText() {
  return els.notePreview.innerText.trim();
}

function applyNoteStyles() {
  els.notePreview.style.fontFamily = els.noteFontFamily.value;
  els.notePreview.style.fontSize = `${els.noteFontSize.value}px`;
  resizeReportNote();
}

function plainTextToHtml(text) {
  return text
    .split(/\n/)
    .map((line) => line || "<br>")
    .join("<br>");
}

function syncNoteValue() {
  state.noteHtml = els.notePreview.innerHTML;
  els.generalInfo.value = noteText();
  resizeReportNote();
}

function runNoteCommand(command) {
  els.notePreview.focus();
  document.execCommand(command, false, null);
  syncNoteValue();
}

function updateText() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const title = els.title.value.trim() || "Composite Calendar";
  const location = els.location.value || "Sensor Site";
  const author = els.author.value.trim() || "Name";
  const reportDate = formattedReportDate();
  document.querySelectorAll('[data-bind="title"]').forEach((node) => { node.textContent = title; });
  document.querySelectorAll('[data-bind="monthShort"]').forEach((node) => { node.textContent = info.short; });
  document.getElementById("calendarMonth").textContent = info.long;
  document.getElementById("reportMeta").textContent = reportDate ? `Prepared by ${author} on ${reportDate}` : `Prepared by ${author}`;
  els.previewCluster.textContent = location;
  const userNote = els.generalInfo.value.trim();
  if (document.activeElement !== els.notePreview) {
    els.notePreview.innerHTML = userNote ? state.noteHtml : "Type in your comments/stories/lived experience here";
  }
  els.notePreview.classList.toggle("empty-note", !userNote);
  applyNoteStyles();
  resizeReportNote();
  document.getElementById("trendSubhead").textContent = `${location} in ${info.long}`;
  document.getElementById("snapshotSubhead").textContent = `${location} sensor context and interpretation notes.`;
  document.getElementById("snapshotLocation").textContent = location;
  document.getElementById("snapshotNotes").textContent = userNote || "Type in your comments/stories/lived experience here";

  const metric = els.calendarMetric.value;
  const metricLabel = metricLabels[metric] || "Selected metric";
  const metricStats = metricSummaryStats(stats.rows, metric);
  const unit = metricUnit(metric);
  document.getElementById("metricSummaryLabel").innerHTML = `${metricLabel} exceedance days for <span data-bind="monthShort">${info.short}</span>.`;
  document.getElementById("peakMetricSummaryLabel").innerHTML = `Highest daily average ${metricLabel} for <span data-bind="monthShort">${info.short}</span>.`;
  document.getElementById("riskMetricSummaryLabel").innerHTML = `${metricStandards[metric].riskLabel} ${metricLabel} days for <span data-bind="monthShort">${info.short}</span>.`;
  document.getElementById("heatSummary").textContent = plural(metricStats.exceedanceDays, "exceedance day");
  document.getElementById("peakHeatSummary").textContent = metricStats.maxValue === null ? "--" : `${metricStats.maxValue} ${unit}`;
  document.getElementById("dangerHeatSummary").textContent = plural(metricStats.riskDays, "day");
  document.getElementById("maxAir").textContent = stats.max.air === null ? "--" : `${stats.max.air} ug/m3`;
  document.getElementById("maxHeat").textContent = stats.max.heat === null ? "--" : `${stats.max.heat} °F`;
  document.getElementById("maxNoise").textContent = stats.max.noise === null ? "--" : `${stats.max.noise} dB`;

  document.getElementById("airThresholdCell").textContent = `${els.airThreshold.value} ug/m3`;
  document.getElementById("heatThresholdCell").textContent = `${els.heatThreshold.value} °F`;
  document.getElementById("noiseThresholdCell").textContent = `${els.noiseThreshold.value} dB`;
  document.getElementById("airDaysCell").textContent = stats.counts.air;
  document.getElementById("heatDaysCell").textContent = stats.counts.heat;
  document.getElementById("noiseDaysCell").textContent = stats.counts.noise;

  const total = reportMetrics.reduce((sum, key) => sum + stats.counts[key], 0);
  document.getElementById("recommendationText").textContent = total
    ? `${info.short} shows ${total} combined threshold exceedances based on daily averages for ${location}. Compare clustered days against site activity, weather, and nearby sources before assigning cause.`
    : `No threshold exceedances are currently shown for ${location}. Adjust thresholds, choose another cluster, or upload site data to refine the interpretation.`;
}

function render() {
  updateText();
  renderCalendar();
  renderTrendChart();
  renderScene(els.reportScene);
  renderScene(els.trendScene);
  renderScene(els.snapshotScene);
}

function setTemplate(template) {
  state.template = template;
  document.querySelectorAll(".template-tab").forEach((button) => {
    const active = button.dataset.template === template;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-template-panel]").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.templatePanel === template);
  });
}

document.querySelectorAll(".template-tab").forEach((button) => {
  button.addEventListener("click", () => setTemplate(button.dataset.template));
});

["input", "change"].forEach((eventName) => {
  [els.title, els.location, els.month, els.author, els.reportDate, els.generalInfo, els.airThreshold, els.pm10Threshold, els.heatThreshold, els.noiseThreshold, els.calendarMetric].forEach((input) => {
    input.addEventListener(eventName, render);
  });
});

els.notePreview.addEventListener("input", () => {
  syncNoteValue();
  render();
});

els.noteFontFamily.addEventListener("change", applyNoteStyles);
els.noteFontSize.addEventListener("change", applyNoteStyles);

document.querySelectorAll(".note-command[data-command]").forEach((button) => {
  button.addEventListener("click", () => runNoteCommand(button.dataset.command));
});

els.noteClearFormat.addEventListener("click", () => {
  els.noteFontFamily.value = defaultNoteFontFamily;
  els.noteFontSize.value = defaultNoteFontSize;
  els.notePreview.innerHTML = "";
  els.notePreview.style.textAlign = "center";
  applyNoteStyles();
  syncNoteValue();
});

els.pictureSelect.addEventListener("change", () => {
  state.imageChoice = els.pictureSelect.value;
  state.uploadedImage = null;
  els.imageUpload.value = "";
  render();
});

els.imageUpload.addEventListener("change", () => {
  const file = els.imageUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.uploadedImage = image;
      render();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

els.csvUpload.addEventListener("change", () => {
  const file = els.csvUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const previousCluster = els.location.value;
    state.rows = normalizeRows(parseCsv(reader.result));
    updateClusterOptions(previousCluster);
    render();
  };
  reader.readAsText(file);
});

function exportReportPdf() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  render();
  document.body.classList.add("is-exporting");
  fitReportNoteForPrint();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (typeof window.print === "function") {
        window.print();
        setTimeout(() => {
          document.body.classList.remove("is-exporting");
          restoreReportNoteAfterPrint();
        }, 1000);
      } else {
        window.alert("Printing is not available in this browser. Use your browser menu to print or save as PDF.");
        document.body.classList.remove("is-exporting");
        restoreReportNoteAfterPrint();
      }
    });
  });
}

window.addEventListener("afterprint", () => {
  document.body.classList.remove("is-exporting");
  restoreReportNoteAfterPrint();
});

window.addEventListener("beforeprint", fitReportNoteForPrint);

document.getElementById("printBtn").addEventListener("click", exportReportPdf);

state.rows = sampleRows;
updateClusterOptions("Sample Cluster 1");
state.sampleImage = new Image();
state.sampleImage.onload = render;
state.sampleImage.src = "assets/grove-hall-report.png";
render();
