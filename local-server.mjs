import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || "127.0.0.1";
const quantaqBaseUrl = "https://api.quant-aq.com/device-api/v1/data/resampled/";

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readLocalConfig() {
  const raw = await readFile(join(rootDir, "config.local.json"), "utf8");
  return JSON.parse(raw);
}

async function handleQuantaqReadings(requestUrl, response) {
  let config;
  try {
    config = await readLocalConfig();
  } catch {
    sendJson(response, 500, {
      error: "missing_config",
      message: "Create config.local.json with your QuantAQ API key before loading PM2.5 or PM10 data.",
    });
    return;
  }

  const apiKey = String(config.quantaqApiKey || "").trim();
  if (!apiKey || apiKey === "paste-your-local-quantaq-api-key-here") {
    sendJson(response, 500, {
      error: "missing_api_key",
      message: "Add your QuantAQ API key to config.local.json before loading PM2.5 or PM10 data.",
    });
    return;
  }

  const serialNumber = requestUrl.searchParams.get("serial_number") || "";
  const startDate = requestUrl.searchParams.get("start_date") || "";
  const endDate = requestUrl.searchParams.get("end_date") || "";
  const period = requestUrl.searchParams.get("period") || "1d";

  if (!serialNumber || !startDate || !endDate) {
    sendJson(response, 400, {
      error: "bad_request",
      message: "serial_number, start_date, and end_date are required.",
    });
    return;
  }

  const quantaqUrl = new URL(quantaqBaseUrl);
  quantaqUrl.searchParams.set("sn", serialNumber);
  quantaqUrl.searchParams.set("start_date", startDate);
  quantaqUrl.searchParams.set("end_date", endDate);
  quantaqUrl.searchParams.set("period", period);

  try {
    const upstream = await fetch(quantaqUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
    });
    const text = await upstream.text();
    response.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(text);
  } catch (error) {
    sendJson(response, 502, {
      error: "quantaq_request_failed",
      message: error.message || "Could not reach the QuantAQ API.",
    });
  }
}

function staticFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded === "/" ? "/index.html" : decoded).replace(/^(\.\.[/\\])+/, "");
  const absolute = resolve(rootDir, `.${normalized}`);
  if (!absolute.startsWith(resolve(rootDir))) return "";
  return absolute;
}

function serveStatic(requestUrl, response) {
  if (requestUrl.pathname === "/config.local.json" || requestUrl.pathname.startsWith("/.git") || requestUrl.pathname.startsWith("/.")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const filePath = staticFilePath(requestUrl.pathname);
  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (request.method === "GET" && requestUrl.pathname === "/api/quantaq/readings") {
    handleQuantaqReadings(requestUrl, response);
    return;
  }
  if (request.method !== "GET") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }
  serveStatic(requestUrl, response);
}).listen(port, host, () => {
  console.log(`CSENSES report builder running at http://localhost:${port}`);
});
