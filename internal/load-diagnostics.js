const apiBaseUrl = "https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api";
const diagnosticStorageKey = "csenses-internal-load-diagnostics-v1";
const maxHistory = 40;

const elements = {
  pipeline: document.getElementById("pipeline"),
  requestType: document.getElementById("requestType"),
  targetId: document.getElementById("targetId"),
  metric: document.getElementById("metric"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  attemptCount: document.getElementById("attemptCount"),
  timeoutSeconds: document.getElementById("timeoutSeconds"),
  run: document.getElementById("runDiagnostic"),
  stop: document.getElementById("stopDiagnostic"),
  clear: document.getElementById("clearDiagnostic"),
  download: document.getElementById("downloadDiagnostic"),
  print: document.getElementById("printDiagnostic"),
  status: document.getElementById("diagnosticStatus"),
  chart: document.getElementById("diagnosticChart"),
  summary: document.getElementById("diagnosticSummary"),
  rows: document.getElementById("diagnosticRows"),
  printDetails: document.getElementById("printDetails"),
  printPipeline: document.getElementById("printPipeline"),
  printRequestType: document.getElementById("printRequestType"),
  printTargetId: document.getElementById("printTargetId"),
  printMetric: document.getElementById("printMetric"),
  printDateRange: document.getElementById("printDateRange"),
  printAttemptCount: document.getElementById("printAttemptCount"),
  printTimeout: document.getElementById("printTimeout"),
};

let history = readHistory();
let runController = null;

function localDateValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function setDateDefaults() {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  elements.startDate.value = localDateValue(start);
  elements.endDate.value = localDateValue(end);
}

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(diagnosticStorageKey) || "[]");
    return Array.isArray(stored) ? stored.slice(-maxHistory) : [];
  } catch {
    return [];
  }
}

function storeHistory() {
  try {
    localStorage.setItem(diagnosticStorageKey, JSON.stringify(history));
  } catch {
    // Diagnostics remain usable for the current page even without storage.
  }
}

function syncMetricOptions() {
  const options = elements.pipeline.value === "aq"
    ? [{ value: "pm25", label: "PM2.5" }, { value: "pm10", label: "PM10" }]
    : [{ value: "heat_index", label: "Heat Index" }, { value: "noise", label: "Noise" }];
  elements.metric.replaceChildren(...options.map(({ value, label }) => new Option(label, value)));
}

function durationLabel(durationMs) {
  const seconds = durationMs / 1000;
  return seconds < 10 ? `${seconds.toFixed(2)} s` : `${seconds.toFixed(1)} s`;
}

function buildUrl(settings, attemptNumber) {
  const url = new URL(`${apiBaseUrl}/${settings.pipeline}/${settings.requestType}`);
  url.searchParams.set(settings.requestType === "cluster-readings" ? "cluster_id" : "location_id", settings.targetId);
  url.searchParams.set("metric", settings.metric);
  url.searchParams.set("start_date", settings.startDate);
  url.searchParams.set("end_date", settings.endDate);
  url.searchParams.set("aggregation", "1day");
  url.searchParams.set("diagnostic_attempt", `${Date.now()}-${attemptNumber}`);
  return url;
}

function currentSettings() {
  return {
    pipeline: elements.pipeline.value,
    requestType: elements.requestType.value,
    targetId: elements.targetId.value.trim(),
    metric: elements.metric.value,
    startDate: elements.startDate.value,
    endDate: elements.endDate.value,
    attemptCount: Math.min(20, Math.max(1, Number(elements.attemptCount.value) || 1)),
    timeoutMs: Math.min(300, Math.max(5, Number(elements.timeoutSeconds.value) || 45)) * 1000,
  };
}

function validateSettings(settings) {
  if (!/^\d+$/.test(settings.targetId)) return "Enter a numeric sensor or cluster ID.";
  if (!settings.startDate || !settings.endDate) return "Choose a start and end date.";
  if (settings.startDate > settings.endDate) return "The start date must be before the end date.";
  return "";
}

async function runAttempt(settings, sequence, parentSignal) {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromParent = () => controller.abort(parentSignal.reason);
  parentSignal.addEventListener("abort", abortFromParent, { once: true });
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, settings.timeoutMs);
  const startedAt = performance.now();
  let result = "success";
  let httpStatus = "";
  let rowCount = 0;
  let errorMessage = "";

  try {
    const response = await fetch(buildUrl(settings, sequence), {
      cache: "no-store",
      signal: controller.signal,
    });
    httpStatus = response.status;
    const payload = await response.json().catch(() => ({}));
    rowCount = Array.isArray(payload?.readings) ? payload.readings.length : 0;
    if (!response.ok) {
      result = "error";
      errorMessage = payload?.error || `HTTP ${response.status}`;
    }
  } catch (error) {
    if (timedOut) {
      result = "timeout";
      errorMessage = `No response within ${settings.timeoutMs / 1000} seconds`;
    } else if (parentSignal.aborted) {
      result = "stopped";
      errorMessage = "Stopped by user";
    } else {
      result = "error";
      errorMessage = error?.message || "Request failed";
    }
  } finally {
    window.clearTimeout(timeoutId);
    parentSignal.removeEventListener("abort", abortFromParent);
  }

  return {
    number: history.reduce((largest, attempt) => Math.max(largest, Number(attempt.number) || 0), 0) + 1,
    recordedAt: new Date().toISOString(),
    target: `${settings.pipeline}/${settings.requestType} ${settings.targetId}`,
    pipeline: settings.pipeline,
    requestType: settings.requestType,
    targetId: settings.targetId,
    metric: settings.metric,
    startDate: settings.startDate,
    endDate: settings.endDate,
    attemptsRequested: settings.attemptCount,
    timeoutSeconds: settings.timeoutMs / 1000,
    result,
    durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
    httpStatus,
    rowCount,
    errorMessage,
  };
}

function renderChart() {
  const attempts = history.slice(-20);
  if (!attempts.length) {
    elements.chart.innerHTML = "";
    elements.chart.setAttribute("aria-label", "No diagnostic attempts recorded");
    elements.summary.textContent = "Run a diagnostic to create the chart.";
    return;
  }
  const width = 920;
  const height = 280;
  const margin = { top: 32, right: 12, bottom: 42, left: 56 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxDuration = Math.max(1000, ...attempts.map((attempt) => attempt.durationMs));
  const slot = plotWidth / attempts.length;
  const compactLabels = attempts.length > 10;
  const colors = { success: "#226d68", timeout: "#c45f4e", error: "#b46b18", stopped: "#8a949b" };
  const grid = [0, 0.25, 0.5, 0.75, 1].map((fraction) => {
    const y = margin.top + plotHeight * (1 - fraction);
    return `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#dce2e5"></line><text x="${margin.left - 7}" y="${y + 4}" text-anchor="end">${durationLabel(maxDuration * fraction)}</text>`;
  }).join("");
  const points = attempts.map((attempt, index) => ({
    attempt,
    x: margin.left + slot * (index + 0.5),
    y: margin.top + plotHeight - plotHeight * attempt.durationMs / maxDuration,
  }));
  const line = points.length > 1
    ? `<polyline points="${points.map(({ x, y }) => `${x},${y}`).join(" ")}" fill="none" stroke="#226d68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>`
    : "";
  const dots = points.map(({ attempt, x, y }, index) => {
    const timeLabel = durationLabel(attempt.durationMs);
    const labelOffset = compactLabels ? 21 + (index % 2) * 18 : 12;
    const nearTop = y < margin.top + 52;
    const nearBottom = y > margin.top + plotHeight - 42;
    const placeBelow = nearTop || (!nearBottom && compactLabels && index % 2 === 1);
    const labelY = placeBelow ? y + labelOffset : y - labelOffset;
    const labelFontSize = compactLabels ? 9 : 11;
    const labelWidth = timeLabel.length * (compactLabels ? 5.6 : 6.4) + 10;
    const labelHeight = compactLabels ? 15 : 17;
    return `<g><title>Attempt ${attempt.number}: ${timeLabel}, ${attempt.result}</title><circle cx="${x}" cy="${y}" r="${compactLabels ? 5 : 6}" fill="${colors[attempt.result] || colors.error}" stroke="white" stroke-width="2"></circle><rect x="${x - labelWidth / 2}" y="${labelY - labelHeight + 4}" width="${labelWidth}" height="${labelHeight}" rx="4" fill="white" fill-opacity="0.96" stroke="#c7d0d5"></rect><text x="${x}" y="${labelY}" text-anchor="middle" font-size="${labelFontSize}" font-weight="700">${timeLabel}</text><text x="${x}" y="${height - 17}" text-anchor="middle">${attempt.number}</text></g>`;
  }).join("");
  elements.chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${grid}${line}${dots}<text x="${margin.left + plotWidth / 2}" y="${height - 1}" text-anchor="middle">Attempt number</text></svg>`;
  const successful = attempts.filter((attempt) => attempt.result === "success");
  const latest = attempts[attempts.length - 1];
  let comparison = "";
  if (successful.length >= 2) {
    const first = successful[0].durationMs;
    const last = successful[successful.length - 1].durationMs;
    const percent = first ? Math.round((last - first) / first * 100) : 0;
    comparison = percent === 0
      ? " The first and latest successful attempts took the same time."
      : ` The latest successful attempt was ${Math.abs(percent)}% ${percent < 0 ? "faster" : "slower"} than the first.`;
  }
  elements.chart.setAttribute("aria-label", `Response-time chart for ${attempts.length} attempts. Latest result: ${latest.result} in ${durationLabel(latest.durationMs)}.`);
  elements.summary.textContent = `Latest attempt: ${durationLabel(latest.durationMs)} (${latest.result}).${comparison}`;
}

function renderTable() {
  elements.rows.innerHTML = "";
  if (!history.length) {
    const row = elements.rows.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 8;
    cell.textContent = "No attempts recorded.";
    return;
  }
  history.slice().reverse().forEach((attempt) => {
    const row = elements.rows.insertRow();
    const fullResult = attempt.errorMessage ? `${attempt.result}: ${attempt.errorMessage}` : attempt.result;
    const values = [
      attempt.number,
      new Date(attempt.recordedAt).toLocaleString(),
      attempt.target,
      attempt.metric,
      fullResult,
      durationLabel(attempt.durationMs),
      attempt.httpStatus || "--",
      attempt.rowCount,
    ];
    values.forEach((value, index) => {
      const cell = row.insertCell();
      if (index === 4) {
        const screenResult = document.createElement("span");
        screenResult.className = "screen-result";
        screenResult.textContent = value;
        const printResult = document.createElement("span");
        printResult.className = "print-result";
        printResult.textContent = attempt.result;
        cell.append(screenResult, printResult);
      } else {
        cell.textContent = value;
      }
    });
  });
}

function updatePrintDetails() {
  const current = currentSettings();
  if (history.length) {
    const latest = history[history.length - 1];
    const pipeline = latest.pipeline || current.pipeline;
    const requestType = latest.requestType || current.requestType;
    const targetId = latest.targetId || current.targetId;
    const metric = latest.metric || current.metric;
    const startDate = latest.startDate || current.startDate;
    const endDate = latest.endDate || current.endDate;
    elements.printDetails.textContent = `Showing ${Math.min(20, history.length)} of ${history.length} saved attempts | Printed ${new Date().toLocaleString()}`;
    elements.printPipeline.textContent = pipeline === "aq" ? "Air quality (AQ)" : "Heat/noise (NU)";
    elements.printRequestType.textContent = requestType === "cluster-readings" ? "Predefined cluster" : "Individual sensor";
    elements.printTargetId.textContent = targetId;
    elements.printMetric.textContent = ({ pm25: "PM2.5", pm10: "PM10", heat_index: "Heat Index", noise: "Noise" })[metric] || metric;
    elements.printDateRange.textContent = `${startDate} to ${endDate}`;
    elements.printAttemptCount.textContent = latest.attemptsRequested || current.attemptCount;
    elements.printTimeout.textContent = `${latest.timeoutSeconds || current.timeoutMs / 1000} seconds`;
  } else {
    elements.printDetails.textContent = "No diagnostic attempts recorded.";
    elements.printPipeline.textContent = "--";
    elements.printRequestType.textContent = "--";
    elements.printTargetId.textContent = "--";
    elements.printMetric.textContent = "--";
    elements.printDateRange.textContent = "--";
    elements.printAttemptCount.textContent = "--";
    elements.printTimeout.textContent = "--";
  }
}

function render() {
  renderChart();
  renderTable();
  elements.download.disabled = !history.length;
  elements.print.disabled = !history.length;
  updatePrintDetails();
}

async function runDiagnostic() {
  const settings = currentSettings();
  const validationMessage = validateSettings(settings);
  if (validationMessage) {
    elements.status.textContent = validationMessage;
    return;
  }
  runController = new AbortController();
  elements.run.disabled = true;
  elements.stop.disabled = false;
  try {
    for (let sequence = 1; sequence <= settings.attemptCount; sequence += 1) {
      if (runController.signal.aborted) break;
      elements.status.textContent = `Running attempt ${sequence} of ${settings.attemptCount}...`;
      const attempt = await runAttempt(settings, sequence, runController.signal);
      history = [...history, attempt].slice(-maxHistory);
      storeHistory();
      render();
    }
    elements.status.textContent = runController.signal.aborted ? "Diagnostic stopped." : "Diagnostic complete.";
  } finally {
    runController = null;
    elements.run.disabled = false;
    elements.stop.disabled = true;
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv() {
  if (!history.length) return;
  const header = ["attempt", "recorded_at", "target", "metric", "result", "duration_ms", "http_status", "rows", "error"];
  const lines = [header, ...history.map((attempt) => [
    attempt.number, attempt.recordedAt, attempt.target, attempt.metric, attempt.result,
    attempt.durationMs, attempt.httpStatus, attempt.rowCount, attempt.errorMessage,
  ])].map((row) => row.map(csvCell).join(","));
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  link.download = `csenses-load-diagnostics-${localDateValue(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.pipeline.addEventListener("change", syncMetricOptions);
elements.run.addEventListener("click", runDiagnostic);
elements.stop.addEventListener("click", () => runController?.abort());
elements.print.addEventListener("click", () => {
  updatePrintDetails();
  window.print();
});
window.addEventListener("beforeprint", updatePrintDetails);
elements.clear.addEventListener("click", () => {
  history = [];
  storeHistory();
  render();
  elements.status.textContent = "Timing history cleared.";
});
elements.download.addEventListener("click", downloadCsv);

setDateDefaults();
syncMetricOptions();
render();
