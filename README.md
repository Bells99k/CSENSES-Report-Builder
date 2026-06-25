# CSENSES Environmental Report Builder

A self-contained browser tool for making Common Senses environmental sensor reports.

## Open the tool

Open `index.html` in a browser. No install step is required.

## Recommended online hosting

Use Azure Static Web Apps for the public version.

Why this fits the project:

- Free static hosting is available for this frontend.
- GitHub commits can automatically deploy the site.
- HTTPS/SSL is included.
- A custom domain can be added later.
- Azure Functions can be added under `/api` when the report builder is ready to call the existing sensor API or Azure database.

## Azure Static Web Apps settings

When creating the Static Web App in Azure:

- App location: `/`
- API location: leave blank for now
- Output location: leave blank
- Build preset: Custom

This repo includes `staticwebapp.config.json` for routing, CSV MIME handling, and basic security headers.

## Future API connection

The browser should not connect directly to the database. The online version should call an API that returns sensor readings by date range and selected sensor.

Expected API shape:

```text
GET /api/sensor-data?start=2026-06-01&end=2026-06-30&sensor_id=S001
```

Expected JSON fields:

```json
[
  {
    "sensor_id": "S001",
    "sensor_name": "Grove Hall",
    "timestamp": "2026-06-01T12:00:00Z",
    "pm25": 14.2,
    "pm10": 52.8,
    "heat_index": 86.4,
    "noise": 63
  }
]
```

## CSV format

The calendar accepts CSV files with a date column, an optional cluster column, and any of these sensor columns:

- `cluster`, `admin area`, `admin_area`, `area`, `zone`, or `neighborhood`
- `sensor_id`, `sensor id`, `sensor`, `device`, or `station`
- `pm25`, `pm2.5`, `air`, or `particulate`
- `pm10`, `pm 10`, or `pm_10`
- `temperature`, `temp`, `heat`, or `heat_index`
- `noise`, `decibel`, or `db`

See `sample-sensor-data.csv` for an example.

When multiple sensor rows share the same cluster and date, the tool averages PM2.5, PM10, heat, and noise into one daily cluster value before drawing the calendar and trend chart.

The calendar page defaults to a Heat Index classification heatmap:

- Less than 80°F: No HI Classification
- 80°F-90°F: Caution
- 90°F-103°F: Extreme Caution
- 103°F-124°F: Danger
- 125°F and higher: Extreme Danger

The calendar can render Heat Index, PM2.5, PM10, or noise from one sensor column at a time.
