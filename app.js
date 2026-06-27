const state = {
  template: "composite",
  rows: [],
  imageChoice: "grove",
  uploadedImage: null,
  builtInImages: {},
};

const els = {
  title: document.getElementById("reportTitle"),
  author: document.getElementById("reportAuthor"),
  reportDate: document.getElementById("reportDate"),
  catchphrase: document.getElementById("reportCatchphrase"),
  location: document.getElementById("locationName"),
  month: document.getElementById("reportMonth"),
  generalInfo: document.getElementById("generalInfo"),
  notePreview: document.getElementById("generalInfoPreview"),
  pictureSelect: document.getElementById("pictureSelect"),
  imageUpload: document.getElementById("imageUpload"),
  csvUpload: document.getElementById("csvUpload"),
  airThreshold: document.getElementById("airThreshold"),
  pm10Threshold: document.getElementById("pm10Threshold"),
  heatThreshold: document.getElementById("heatThreshold"),
  noiseThreshold: document.getElementById("noiseThreshold"),
  calendarMetric: document.getElementById("calendarMetric"),
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
  teal: "#226d68",
  leaf: "#6f8b3d",
  coral: "#c45f4e",
};

const metricLabels = {
  composite: "Composite hazard severity",
  air: "PM2.5",
  pm10: "PM10",
  heat: "Heat Index classification",
  noise: "Noise",
};

const pictureAssets = {
  grove: "assets/Grove Hall.avif",
};

const heatIndexBands = [
  {
    label: "No HI Classification",
    shortLabel: "No HI",
    min: -Infinity,
    max: 80,
    color: "#fffdfb",
    className: "hi-none-cell",
  },
  {
    label: "Caution",
    shortLabel: "Caution",
    min: 80,
    max: 90,
    color: "#fffdb0",
    className: "hi-caution-cell",
  },
  {
    label: "Extreme Caution",
    shortLabel: "Extreme",
    min: 90,
    max: 103,
    color: "#edd365",
    className: "hi-extreme-caution-cell",
  },
  {
    label: "Danger",
    shortLabel: "Danger",
    min: 103,
    max: 125,
    color: "#d1763d",
    className: "hi-danger-cell",
  },
  {
    label: "Extreme Danger",
    shortLabel: "Extreme",
    min: 125,
    max: Infinity,
    color: "#b03227",
    className: "hi-extreme-danger-cell",
  },
];

const metricStandards = {
  composite: {
    title: "Composite Hazard Severity",
    note: "Composite colors combine available daily averages across PM2.5, PM10, Heat Index, and Noise.",
    bands: [
      { label: "No data", detail: "Missing readings", min: null, max: null, color: "#ffffff" },
      { label: "Lower", detail: "Less than 70% of threshold", min: 0, max: 0.7, color: "#e8f0ea" },
      { label: "Elevated", detail: "70% to 100% of threshold", min: 0.7, max: 1, color: "#f3dba5" },
      { label: "Exceeded", detail: "100% to 140% of threshold", min: 1, max: 1.4, color: "#e29974" },
      { label: "High", detail: "140% of threshold or higher", min: 1.4, max: Infinity, color: "#c45f4e" },
    ],
  },
  air: {
    title: "PM2.5",
    note: "PM2.5 colors use daily cluster averages compared with the EPA daily standard.",
    bands: [
      { label: "No data", detail: "Missing readings", min: null, max: null, color: "#ffffff" },
      { label: "Below", detail: "Less than 25 ug/m3", min: 0, max: 25, color: "#f4f2ff" },
      { label: "Near standard", detail: "25 to 35.4 ug/m3", min: 25, max: 35.5, color: "#d9d4f4" },
      { label: "Above standard", detail: "35.5 to 55.4 ug/m3", min: 35.5, max: 55.5, color: "#b8b2ea" },
      { label: "High", detail: "55.5 ug/m3 and higher", min: 55.5, max: Infinity, color: "#7e6fd4" },
    ],
  },
  pm10: {
    title: "PM10",
    note: "PM10 colors use daily cluster averages compared with the EPA daily standard.",
    bands: [
      { label: "No data", detail: "Missing readings", min: null, max: null, color: "#ffffff" },
      { label: "Below", detail: "Less than 100 ug/m3", min: 0, max: 100, color: "#fff7e8" },
      { label: "Near standard", detail: "100 to 149 ug/m3", min: 100, max: 150, color: "#f9dca1" },
      { label: "Above standard", detail: "150 to 254 ug/m3", min: 150, max: 255, color: "#f4c269" },
      { label: "High", detail: "255 ug/m3 and higher", min: 255, max: Infinity, color: "#c9791f" },
    ],
  },
  heat: {
    title: "Heat Index",
    note: "Heat Index colors use daily cluster averages and follow the HI thresholds: <80°F, 80-90°F, 90-103°F, 103-124°F, and 125°F+.",
    bands: heatIndexBands.map((band) => ({
      label: band.label,
      detail: band.label === "No HI Classification" ? "Less than 80°F" :
        band.label === "Caution" ? "80°F - 90°F" :
          band.label === "Extreme Caution" ? "90°F - 103°F" :
            band.label === "Danger" ? "103°F - 124°F" : "125°F and higher",
      min: band.min,
      max: band.max,
      color: band.color,
      className: band.className,
    })),
  },
  noise: {
    title: "Noise",
    note: "Noise colors use daily cluster averages and Boston noise limits for overnight and all-time readings.",
    bands: [
      { label: "No data", detail: "Missing readings", min: null, max: null, color: "#ffffff" },
      { label: "Below overnight limit", detail: "Less than 50 dB", min: 0, max: 50, color: "#fff8e6" },
      { label: "Above overnight limit", detail: "50 to 69 dB", min: 50, max: 70, color: "#f3dba5" },
      { label: "Above all-time limit", detail: "70 to 84 dB", min: 70, max: 85, color: "#d9a94e" },
      { label: "High", detail: "85 dB and higher", min: 85, max: Infinity, color: "#9f6b16" },
    ],
  },
};

const sampleDailyValues = [
  ["2026-06-01", 18, 82, 61],
  ["2026-06-02", 42, 85, 72],
  ["2026-06-03", 37, 91, 68],
  ["2026-06-04", 22, 88, 74],
  ["2026-06-05", 16, 93, 76],
  ["2026-06-06", 28, 95, 71],
  ["2026-06-07", 31, 89, 66],
  ["2026-06-08", 45, 92, 79],
  ["2026-06-09", 39, 86, 63],
  ["2026-06-10", 20, 81, 58],
  ["2026-06-11", 24, 90, 70],
  ["2026-06-12", 52, 104, 82],
  ["2026-06-13", 33, 94, 75],
  ["2026-06-14", 19, 87, 62],
  ["2026-06-15", 41, 91, 73],
  ["2026-06-16", 35, 84, 69],
  ["2026-06-17", 29, 83, 65],
  ["2026-06-18", 48, 97, 78],
  ["2026-06-19", 53, 126, 81],
  ["2026-06-20", 27, 90, 72],
  ["2026-06-21", 21, 86, 67],
  ["2026-06-22", 17, 79, 57],
  ["2026-06-23", 43, 92, 77],
  ["2026-06-24", 46, 94, 80],
  ["2026-06-25", 38, 91, 73],
  ["2026-06-26", 25, 88, 69],
  ["2026-06-27", 30, 89, 71],
  ["2026-06-28", 55, 99, 84],
  ["2026-06-29", 47, 93, 76],
  ["2026-06-30", 32, 87, 64],
];

const sampleRows = Array.from({ length: 5 }, (_, clusterIndex) => {
  const clusterNumber = clusterIndex + 1;
  const clusterOffset = clusterIndex * 3;
  return sampleDailyValues.flatMap(([date, air, heat, noise], dayIndex) => {
    const dayWave = (dayIndex % 5) - 2;
    return [1, 2].map((sensorNumber) => ({
      date,
      cluster: `Sample Cluster ${clusterNumber}`,
      sensorId: `SC${clusterNumber}-${sensorNumber}`,
      air: roundNumber(air + clusterOffset + sensorNumber + dayWave * 0.8),
      pm10: roundNumber((air + clusterOffset + sensorNumber + dayWave * 0.8) * 2.25),
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
    air: Number(els.airThreshold.value) || 0,
    pm10: Number(els.pm10Threshold.value) || 0,
    heat: Number(els.heatThreshold.value) || 0,
    noise: Number(els.noiseThreshold.value) || 0,
  };
}

function metricUnit(metric) {
  if (metric === "air") return "ug/m3";
  if (metric === "pm10") return "ug/m3";
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
    ["air", "pm10", "heat", "noise"].forEach((key) => {
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

function heatSummaryStats(rows) {
  const heatRows = rows.filter((row) => row.heat !== null);
  const dangerDays = heatRows.filter((row) => {
    const band = heatIndexBand(row.heat);
    return band?.label === "Danger" || band?.label === "Extreme Danger";
  }).length;

  return {
    exceedanceDays: heatRows.filter((row) => row.heat >= thresholds().heat).length,
    maxHeat: heatRows.length ? Math.max(...heatRows.map((row) => row.heat)) : null,
    dangerDays,
  };
}

function rowSeverity(row, metric, limits) {
  if (!row) return null;

  if (metric !== "composite") {
    const value = row[metric];
    if (value === null || value === undefined) return null;
    const limit = limits[metric] || 1;
    return Math.max(0, Math.min(1.6, value / limit));
  }

  const severities = ["air", "pm10", "heat", "noise"]
    .map((key) => {
      if (row[key] === null || row[key] === undefined) return null;
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

function heatIndexBand(value) {
  if (value === null || !Number.isFinite(value)) return null;
  return heatIndexBands.find((band) => value >= band.min && value < band.max) || heatIndexBands[heatIndexBands.length - 1];
}

function standardBand(metric, row, severity) {
  if (!row) return metricStandards[metric]?.bands[0] || metricStandards.composite.bands[0];
  if (metric === "composite") {
    return metricStandards.composite.bands.find((band) => {
      if (band.min === null) return severity === null;
      return severity !== null && severity >= band.min && severity < band.max;
    }) || metricStandards.composite.bands[metricStandards.composite.bands.length - 1];
  }
  if (metric === "heat") return heatIndexBand(row.heat) || metricStandards.heat.bands[0];
  const value = row[metric];
  const bands = metricStandards[metric]?.bands || metricStandards.composite.bands;
  return bands.find((band) => {
    if (band.min === null) return value === null || value === undefined;
    return value !== null && value !== undefined && value >= band.min && value < band.max;
  }) || bands[bands.length - 1];
}

function calendarColor(row, metric, severity) {
  return standardBand(metric, row, severity)?.color || "#ffffff";
}

function calendarLabel(row, metric, severity) {
  if (!row) return "No data";
  return standardBand(metric, row, severity)?.label || "No data";
}

function calendarBandClass(row, metric) {
  if (!row) return "";
  return standardBand(metric, row, rowSeverity(row, metric, thresholds()))?.className || "";
}

function renderStandards(metric) {
  const standard = metricStandards[metric] || metricStandards.composite;
  const title = document.getElementById("standardsTitle");
  const graphic = document.getElementById("standardsGraphic");
  title.textContent = standard.title;
  graphic.innerHTML = "";
  graphic.className = `hi-legend standard-legend standard-legend-${metric}`;
  graphic.setAttribute("aria-label", `${standard.title} standards color scale`);

  standard.bands.forEach((band) => {
    const item = document.createElement("span");
    item.className = band.className || "";
    item.style.background = band.color;
    item.style.color = darkTextOn(band.color) ? "#11151a" : "#ffffff";
    item.innerHTML = `${band.label}<small>${band.detail}</small>`;
    graphic.append(item);
  });
}

function darkTextOn(color) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return true;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 145;
}

function renderCalendar() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const limits = thresholds();
  const metric = els.calendarMetric.value;
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  els.calendarGrid.innerHTML = "";
  renderStandards(metric);
  document.getElementById("heatmapNote").textContent = (metricStandards[metric] || metricStandards.composite).note;

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
        <span class="air ${datum?.flags.air ? "active" : ""}" title="PM2.5 threshold"></span>
        <span class="pm10 ${datum?.flags.pm10 ? "active" : ""}" title="PM10 threshold"></span>
        <span class="heat ${datum?.flags.heat ? "active" : ""}" title="Heat threshold"></span>
        <span class="noise ${datum?.flags.noise ? "active" : ""}" title="Noise threshold"></span>
      </div>
    `;
    cell.setAttribute("aria-label", `${date}: ${label}`);
    const summary = datum
      ? `Averaged from ${datum.sensorCount || 0} sensor row(s). PM2.5 ${datum.air ?? "n/a"}, PM10 ${datum.pm10 ?? "n/a"}, Heat ${datum.heat ?? "n/a"}, Noise ${datum.noise ?? "n/a"}`
      : "No data";
    cell.title = `${date}: ${label}. ${summary}`;
    els.calendarGrid.append(cell);
  }
}

function formatCellValue(row, metric, severity) {
  if (!row) return "";
  if (metric === "composite") return severity === null ? "" : `${Math.round(severity * 100)}%`;
  return row[metric] === null || row[metric] === undefined ? "" : `${row[metric]}`;
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
    const scale = Math.max(width / image.width, height / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    ctx.drawImage(image, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    return;
  }

  const builtInImage = state.builtInImages[state.imageChoice];
  if (builtInImage?.complete && builtInImage.naturalWidth) {
    const scale = Math.max(width / builtInImage.width, height / builtInImage.height);
    const drawW = builtInImage.width * scale;
    const drawH = builtInImage.height * scale;
    ctx.drawImage(builtInImage, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
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

function preloadPictureAssets() {
  Object.entries(pictureAssets).forEach(([key, src]) => {
    const image = new Image();
    image.onload = render;
    image.src = src;
    state.builtInImages[key] = image;
  });
}

function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function formatReportDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
}

function updateText() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const title = els.title.value.trim() || "Composite Calendar";
  const location = els.location.value || "Sensor Site";
  const catchphrase = els.catchphrase.value.trim() || `What's going on in ${location}?`;
  const author = els.author.value.trim() || "Name";
  const reportDate = formatReportDate(els.reportDate.value) || "June 24, 2026";
  document.querySelectorAll('[data-bind="title"]').forEach((node) => { node.textContent = title; });
  document.querySelectorAll('[data-bind="monthShort"]').forEach((node) => { node.textContent = info.short; });
  document.getElementById("reportCatchphrasePreview").textContent = catchphrase;
  document.getElementById("reportPhotoTitle").textContent = location;
  document.getElementById("reportMeta").textContent = `Prepared by ${author} on ${reportDate}`;
  document.getElementById("calendarMonth").textContent = info.long;
  els.previewCluster.textContent = location;
  const userNote = els.generalInfo.value.trim();
  if (document.activeElement !== els.notePreview) {
    els.notePreview.textContent = userNote || "Type in your comments/stories/lived experience here";
  }
  els.notePreview.classList.toggle("empty-note", !userNote);
  document.getElementById("trendSubhead").textContent = `${location} in ${info.long}`;
  document.getElementById("snapshotSubhead").textContent = `${location} sensor context and interpretation notes.`;
  document.getElementById("snapshotLocation").textContent = location;
  document.getElementById("snapshotNotes").textContent = userNote || "Type in your comments/stories/lived experience here";

  const heatStats = heatSummaryStats(stats.rows);
  document.getElementById("heatSummary").textContent = plural(heatStats.exceedanceDays, "exceedance day");
  document.getElementById("peakHeatSummary").textContent = heatStats.maxHeat === null ? "--" : `${heatStats.maxHeat} °F`;
  document.getElementById("dangerHeatSummary").textContent = plural(heatStats.dangerDays, "day");
  document.getElementById("maxAir").textContent = stats.max.air === null ? "--" : `${stats.max.air} ug/m3`;
  document.getElementById("maxHeat").textContent = stats.max.heat === null ? "--" : `${stats.max.heat} °F`;
  document.getElementById("maxNoise").textContent = stats.max.noise === null ? "--" : `${stats.max.noise} dB`;

  document.getElementById("airThresholdCell").textContent = `${els.airThreshold.value} ug/m3`;
  document.getElementById("heatThresholdCell").textContent = `${els.heatThreshold.value} °F`;
  document.getElementById("noiseThresholdCell").textContent = `${els.noiseThreshold.value} dB`;
  document.getElementById("airDaysCell").textContent = stats.counts.air;
  document.getElementById("heatDaysCell").textContent = stats.counts.heat;
  document.getElementById("noiseDaysCell").textContent = stats.counts.noise;

  const total = stats.counts.air + stats.counts.heat + stats.counts.noise;
  document.getElementById("recommendationText").textContent = total
    ? `${info.short} shows ${total} combined threshold exceedances based on daily averages for ${location}. Compare clustered days against site activity, weather, and nearby sources before assigning cause.`
    : `No threshold exceedances are currently shown for ${location}. Adjust thresholds, choose another cluster, or upload site data to refine the interpretation.`;
}

function render() {
  updateText();
  renderCalendar();
  renderScene(els.reportScene);
  renderTrendChart();
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
  [els.title, els.author, els.reportDate, els.catchphrase, els.location, els.month, els.generalInfo, els.airThreshold, els.pm10Threshold, els.heatThreshold, els.noiseThreshold, els.calendarMetric].forEach((input) => {
    input.addEventListener(eventName, render);
  });
});

els.notePreview.addEventListener("input", () => {
  els.generalInfo.value = els.notePreview.textContent;
  render();
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

document.getElementById("loadSampleBtn")?.addEventListener("click", () => {
  state.rows = sampleRows;
  els.month.value = "2026-06";
  updateClusterOptions("Sample Cluster 1");
  render();
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

state.rows = sampleRows;
preloadPictureAssets();
updateClusterOptions("Sample Cluster 1");
render();
