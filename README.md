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

## Sensor API connection

The browser calls the Common Senses sensor API directly. The Data panel's `Load sensor data` button builds the query from the current report controls:

- Sensor or sensor cluster: must be a numbered AQ or NU sensor location.
- What to Report: PM2.5 maps to AQ `pm25`; PM10 maps to AQ `pm10`; Heat Index maps to NU `heat_index`; Noise maps to NU `noise`.
- Select month: maps to `start_date` and `end_date`.
- Average period: maps to `aggregation`; the report UI loads `1day`.

```text
GET https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api/aq/sensors-list
GET https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api/nu/sensors-list
GET https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api/aq/readings?location_id=13&metric=pm25&start_date=2026-04-01&end_date=2026-04-30&aggregation=1day
GET https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api/nu/readings?location_id=5&metric=heat_index&start_date=2026-01-01&end_date=2026-01-31&aggregation=1day
```

The report UI uses the Common Senses AQ endpoint for PM2.5 and PM10. The NU endpoint supports `heat_index`, `noise`, `temperature`, and `humidity`; this report UI uses it for Heat Index and Noise.

Response shape:

```json
{
  "location_id": 5,
  "metric": "heat_index",
  "readings": [
    {
      "timestamp": "2026-01-02T13:00:00-05:00",
      "heat_index": 25.67
    }
  ]
}
```

Then open `http://localhost:8000`.

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
