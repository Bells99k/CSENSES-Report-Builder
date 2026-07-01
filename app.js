const state = {
  template: "composite",
  rows: [],
  imageChoice: "grove",
  uploadedImage: null,
  builtInImages: {},
  sensorCatalog: [],
  comparisonLocations: [],
  trendHoverDay: null,
  noteHtml: "",
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
  sensorSearch: document.getElementById("sensorSearch"),
  sensorSearchBtn: document.getElementById("sensorSearchBtn"),
  sensorSearchResults: document.getElementById("sensorSearchResults"),
  comparisonSearch: document.getElementById("comparisonSearch"),
  comparisonSearchBtn: document.getElementById("comparisonSearchBtn"),
  comparisonSearchResults: document.getElementById("comparisonSearchResults"),
  comparisonSelected: document.getElementById("comparisonSelected"),
  comparisonLocations: document.getElementById("comparisonLocations"),
  comparisonLegend: document.getElementById("comparisonLegend"),
  previewCluster: document.getElementById("calendarLocation"),
  calendarGrid: document.getElementById("calendarGrid"),
  reportScene: document.getElementById("sceneCanvasReport"),
  trendChart: document.getElementById("trendChart"),
  trendTooltip: document.getElementById("trendTooltip"),
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

const comparisonColors = ["#111827", "#0057ff", "#7b2cbf", "#00838f", "#d0006f", "#4a4e00", "#6d3900", "#334155"];
const trendChartPadding = { left: 64, right: 28, top: 30, bottom: 56 };

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

const builtInSensorCatalog = [
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01486", "filterId": "MOD-PM-01486", "displayId": "MOD-PM-01486", "name": "Blue Hill Ave @ Fayston St (Removed)"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01487", "filterId": "MOD-PM-01487", "displayId": "MOD-PM-01487", "name": "Blue Hill Ave @ Otisfield St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01488", "filterId": "MOD-PM-01488", "displayId": "MOD-PM-01488", "name": "Blue Hill Ave @ Moreland St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01489", "filterId": "MOD-PM-01489", "displayId": "MOD-PM-01489", "name": "Lewis Place"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01490", "filterId": "MOD-PM-01490", "displayId": "MOD-PM-01490", "name": "Blue Hill Ave @ Intervale St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01492", "filterId": "MOD-PM-01492", "displayId": "MOD-PM-01492", "name": "Blue Hill Ave @ Grove Hall"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01493", "filterId": "MOD-PM-01493", "displayId": "MOD-PM-01493", "name": "Blue Hill Ave @ Dudley Square Plaza"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01494", "filterId": "MOD-PM-01494", "displayId": "MOD-PM-01494", "name": "Blue Hill Ave @ Southwood St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01495", "filterId": "MOD-PM-01495", "displayId": "MOD-PM-01495", "name": "Blue Hill Ave @ Woodcliff St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01491", "filterId": "MOD-PM-01491", "displayId": "MOD-PM-01491", "name": "Horatio Harris Park"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01550", "filterId": "MOD-PM-01550", "displayId": "MOD-PM-01550", "name": "Julian Street"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01549", "filterId": "MOD-PM-01549", "displayId": "MOD-PM-01549", "name": "Kroc Center"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01593", "filterId": "MOD-PM-01593", "displayId": "MOD-PM-01593", "name": "Blue Hill Ave @ Fayston St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01548", "filterId": "MOD-PM-01548", "displayId": "MOD-PM-01548", "name": "Seaver and Walnut"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01592", "filterId": "MOD-PM-01592", "displayId": "MOD-PM-01592", "name": "Trotter Elementary"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01594", "filterId": "MOD-PM-01594", "displayId": "MOD-PM-01594", "name": "Elm Hill Ave and Wenonah St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01595", "filterId": "MOD-PM-01595", "displayId": "MOD-PM-01595", "name": "Humboldt and Seaver"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01596", "filterId": "MOD-PM-01596", "displayId": "MOD-PM-01596", "name": "Forest St and Vine St"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01597", "filterId": "MOD-PM-01597", "displayId": "MOD-PM-01597", "name": "Ruthven and Humboldt"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01598", "filterId": "MOD-PM-01598", "displayId": "MOD-PM-01598", "name": "Ceylon Park"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01599", "filterId": "MOD-PM-01599", "displayId": "MOD-PM-01599", "name": "Elm Hill Park"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01600", "filterId": "MOD-PM-01600", "displayId": "MOD-PM-01600", "name": "Normandy St near Geneva Ave"},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01601", "filterId": "MOD-PM-01601", "displayId": "MOD-PM-01601", "name": "Marshfield St and Batchelder St"},
  {"group": "Noise Sensors", "id": "noise:1", "filterId": "1", "displayId": "Noise Sensor 1", "name": "Seaver st & Tiffany Moore Tot Park"},
  {"group": "Noise Sensors", "id": "noise:2", "filterId": "2", "displayId": "Noise Sensor 2", "name": "Blue Hill @ Seaver St"},
  {"group": "Noise Sensors", "id": "noise:3", "filterId": "3", "displayId": "Noise Sensor 3", "name": "Dudley @ Fcottage"},
  {"group": "Noise Sensors", "id": "noise:4", "filterId": "4", "displayId": "Noise Sensor 4", "name": "Dudley @ Blue Hill (Dudley Commons)"},
  {"group": "Noise Sensors", "id": "noise:5", "filterId": "5", "displayId": "Noise Sensor 5", "name": "George @ Shirley"},
  {"group": "Noise Sensors", "id": "noise:6", "filterId": "6", "displayId": "Noise Sensor 6", "name": "Waverly @ Warren"},
  {"group": "Noise Sensors", "id": "noise:7", "filterId": "7", "displayId": "Noise Sensor 7", "name": "Kroc Centre"},
  {"group": "Noise Sensors", "id": "noise:8", "filterId": "8", "displayId": "Noise Sensor 8", "name": "Magnolia @ Lingard"},
  {"group": "Noise Sensors", "id": "noise:10", "filterId": "10", "displayId": "Noise Sensor 10", "name": "Magnolia @ Wayland"},
  {"group": "Noise Sensors", "id": "noise:11", "filterId": "11", "displayId": "Noise Sensor 11", "name": "Hollander st"},
  {"group": "Noise Sensors", "id": "noise:12", "filterId": "12", "displayId": "Noise Sensor 12", "name": "Blue Hill @ Maywood"},
  {"group": "Noise Sensors", "id": "noise:13", "filterId": "13", "displayId": "Noise Sensor 13", "name": "Blue Hill @ Quincy"},
  {"group": "Noise Sensors", "id": "noise:15", "filterId": "15", "displayId": "Noise Sensor 15", "name": "Moreland st @ learning together day care"},
  {"group": "Noise Sensors", "id": "noise:16", "filterId": "16", "displayId": "Noise Sensor 16", "name": "Warren @ Townsend/Quincy"},
  {"group": "Noise Sensors", "id": "noise:17", "filterId": "17", "displayId": "Noise Sensor 17", "name": "Sargent st"},
  {"group": "Noise Sensors", "id": "noise:18", "filterId": "18", "displayId": "Noise Sensor 18", "name": "Elm Hill Ave"},
  {"group": "Noise Sensors", "id": "noise:19", "filterId": "19", "displayId": "Noise Sensor 19", "name": "Quincy @ Dacia"},
  {"group": "Noise Sensors", "id": "noise:20", "filterId": "20", "displayId": "Noise Sensor 20", "name": "Schuyler st"},
  {"group": "Noise Sensors", "id": "noise:21", "filterId": "21", "displayId": "Noise Sensor 21", "name": "Blue Hill @ Columbia Road"},
  {"group": "Noise Sensors", "id": "noise:22", "filterId": "22", "displayId": "Noise Sensor 22", "name": "Sonoma St"},
  {"group": "Noise Sensors", "id": "noise:23", "filterId": "23", "displayId": "Noise Sensor 23", "name": "Freedom House Warren St"},
  {"group": "Noise Sensors", "id": "noise:24", "filterId": "24", "displayId": "Noise Sensor 24", "name": "Samuel W. Mason Elementary"},
  {"group": "Noise Sensors", "id": "noise:25", "filterId": "25", "displayId": "Noise Sensor 25", "name": "Geneva @ Blue Hill"},
  {"group": "Noise Sensors", "id": "noise:26", "filterId": "26", "displayId": "Noise Sensor 26", "name": "Franklin Park"},
  {"group": "Noise Sensors", "id": "noise:27", "filterId": "27", "displayId": "Noise Sensor 27", "name": "Dunreath St"},
  {"group": "Noise Sensors", "id": "noise:28", "filterId": "28", "displayId": "Noise Sensor 28", "name": "Other Dudley Commons"},
  {"group": "Noise Sensors", "id": "noise:29", "filterId": "29", "displayId": "Noise Sensor 29", "name": "Langdon St Farm"},
  {"group": "Noise Sensors", "id": "noise:30", "filterId": "30", "displayId": "Noise Sensor 30", "name": "E. Cottage & Batchelder St"},
  {"group": "Noise Sensors", "id": "noise:32", "filterId": "32", "displayId": "Noise Sensor 32", "name": "Normandy and Stanwood"},
  {"group": "Noise Sensors", "id": "noise:33", "filterId": "33", "displayId": "Noise Sensor 33", "name": "Weldon St and Gannet St"},
  {"group": "Noise Sensors", "id": "noise:34", "filterId": "34", "displayId": "Noise Sensor 34", "name": "Homestead and Harold"},
  {"group": "Noise Sensors", "id": "noise:35", "filterId": "35", "displayId": "Noise Sensor 35", "name": "Ruthven and Humboldt"},
  {"group": "Noise Sensors", "id": "noise:36", "filterId": "36", "displayId": "Noise Sensor 36", "name": "Waumbeck and Warren"},
  {"group": "Noise Sensors", "id": "noise:37", "filterId": "37", "displayId": "Noise Sensor 37", "name": "Crawford (behind Crispus Attucks Children Center)"},
  {"group": "Noise Sensors", "id": "noise:38", "filterId": "38", "displayId": "Noise Sensor 38", "name": "Elm Hill and Crawford"},
  {"group": "Noise Sensors", "id": "noise:39", "filterId": "39", "displayId": "Noise Sensor 39", "name": "Batchelder and Marshfield"},
  {"group": "Noise Sensors", "id": "noise:40", "filterId": "40", "displayId": "Noise Sensor 40", "name": "Hampden and Eustis"},
  {"group": "Noise Sensors", "id": "noise:41", "filterId": "41", "displayId": "Noise Sensor 41", "name": "Forest St and Vine St"},
  {"group": "Noise Sensors", "id": "noise:43", "filterId": "43", "displayId": "Noise Sensor 43", "name": "W.Cottage and Brook"},
  {"group": "Noise Sensors", "id": "noise:44", "filterId": "44", "displayId": "Noise Sensor 44", "name": "Washington St and Bishop Joe L. Smith"},
  {"group": "Noise Sensors", "id": "noise:45", "filterId": "45", "displayId": "Noise Sensor 45", "name": "Children's Park (Intervale and Normandy)"},
  {"group": "Noise Sensors", "id": "noise:46", "filterId": "46", "displayId": "Noise Sensor 46", "name": "Bynoe Park"},
  {"group": "Noise Sensors", "id": "noise:47", "filterId": "47", "displayId": "Noise Sensor 47", "name": "Elm Hill and Cheney"},
  {"group": "Noise Sensors", "id": "noise:48", "filterId": "48", "displayId": "Noise Sensor 48", "name": "Quincy and Magnolia"},
  {"group": "Noise Sensors", "id": "noise:49", "filterId": "49", "displayId": "Noise Sensor 49", "name": "Moreland St, Howes Playground"},
  {"group": "Noise Sensors", "id": "noise:50", "filterId": "50", "displayId": "Noise Sensor 50", "name": "Warren Pl"},
  {"group": "Noise Sensors", "id": "noise:51", "filterId": "51", "displayId": "Noise Sensor 51", "name": "Normandy and Seaver"},
  {"group": "Noise Sensors", "id": "noise:52", "filterId": "52", "displayId": "Noise Sensor 52", "name": "Winthrop Playground"},
  {"group": "Noise Sensors", "id": "noise:53", "filterId": "53", "displayId": "Noise Sensor 53", "name": "Dennis St Park"},
  {"group": "Noise Sensors", "id": "noise:54", "filterId": "54", "displayId": "Noise Sensor 54", "name": "Freedom House Warren St"},
  {"group": "Noise Sensors", "id": "noise:55", "filterId": "55", "displayId": "Noise Sensor 55", "name": "Fayston and Perth"},
  {"group": "Noise Sensors", "id": "noise:9", "filterId": "9", "displayId": "Noise Sensor 9", "name": "Savin & Tupelo"},
  {"group": "Heat Sensors", "id": "heat:1", "filterId": "1", "displayId": "Heat Sensor 1", "name": "Seaver st & Tiffany Moore Tot Park"},
  {"group": "Heat Sensors", "id": "heat:2", "filterId": "2", "displayId": "Heat Sensor 2", "name": "Blue Hill @ Seaver St"},
  {"group": "Heat Sensors", "id": "heat:3", "filterId": "3", "displayId": "Heat Sensor 3", "name": "Dudley @ Fcottage"},
  {"group": "Heat Sensors", "id": "heat:4", "filterId": "4", "displayId": "Heat Sensor 4", "name": "Dudley @ Blue Hill (Dudley Commons)"},
  {"group": "Heat Sensors", "id": "heat:5", "filterId": "5", "displayId": "Heat Sensor 5", "name": "George @ Shirley"},
  {"group": "Heat Sensors", "id": "heat:6", "filterId": "6", "displayId": "Heat Sensor 6", "name": "Waverly @ Warren"},
  {"group": "Heat Sensors", "id": "heat:7", "filterId": "7", "displayId": "Heat Sensor 7", "name": "Kroc Centre"},
  {"group": "Heat Sensors", "id": "heat:8", "filterId": "8", "displayId": "Heat Sensor 8", "name": "Magnolia @ Lingard"},
  {"group": "Heat Sensors", "id": "heat:10", "filterId": "10", "displayId": "Heat Sensor 10", "name": "Magnolia @ Wayland"},
  {"group": "Heat Sensors", "id": "heat:11", "filterId": "11", "displayId": "Heat Sensor 11", "name": "Hollander st"},
  {"group": "Heat Sensors", "id": "heat:12", "filterId": "12", "displayId": "Heat Sensor 12", "name": "Blue Hill @ Maywood"},
  {"group": "Heat Sensors", "id": "heat:13", "filterId": "13", "displayId": "Heat Sensor 13", "name": "Blue Hill @ Quincy"},
  {"group": "Heat Sensors", "id": "heat:15", "filterId": "15", "displayId": "Heat Sensor 15", "name": "Moreland st @ learning together day care"},
  {"group": "Heat Sensors", "id": "heat:16", "filterId": "16", "displayId": "Heat Sensor 16", "name": "Warren @ Townsend/Quincy"},
  {"group": "Heat Sensors", "id": "heat:17", "filterId": "17", "displayId": "Heat Sensor 17", "name": "Sargent st"},
  {"group": "Heat Sensors", "id": "heat:18", "filterId": "18", "displayId": "Heat Sensor 18", "name": "Elm Hill Ave"},
  {"group": "Heat Sensors", "id": "heat:19", "filterId": "19", "displayId": "Heat Sensor 19", "name": "Quincy @ Dacia"},
  {"group": "Heat Sensors", "id": "heat:20", "filterId": "20", "displayId": "Heat Sensor 20", "name": "Schuyler st"},
  {"group": "Heat Sensors", "id": "heat:21", "filterId": "21", "displayId": "Heat Sensor 21", "name": "Blue Hill @ Columbia Road"},
  {"group": "Heat Sensors", "id": "heat:22", "filterId": "22", "displayId": "Heat Sensor 22", "name": "Sonoma St"},
  {"group": "Heat Sensors", "id": "heat:23", "filterId": "23", "displayId": "Heat Sensor 23", "name": "Freedom House Warren St"},
  {"group": "Heat Sensors", "id": "heat:24", "filterId": "24", "displayId": "Heat Sensor 24", "name": "Samuel W. Mason Elementary"},
  {"group": "Heat Sensors", "id": "heat:25", "filterId": "25", "displayId": "Heat Sensor 25", "name": "Geneva @ Blue Hill"},
  {"group": "Heat Sensors", "id": "heat:26", "filterId": "26", "displayId": "Heat Sensor 26", "name": "Franklin Park"},
  {"group": "Heat Sensors", "id": "heat:27", "filterId": "27", "displayId": "Heat Sensor 27", "name": "Dunreath St"},
  {"group": "Heat Sensors", "id": "heat:28", "filterId": "28", "displayId": "Heat Sensor 28", "name": "Other Dudley Commons"},
  {"group": "Heat Sensors", "id": "heat:29", "filterId": "29", "displayId": "Heat Sensor 29", "name": "Langdon St Farm"},
  {"group": "Heat Sensors", "id": "heat:30", "filterId": "30", "displayId": "Heat Sensor 30", "name": "E. Cottage & Batchelder St"},
  {"group": "Heat Sensors", "id": "heat:32", "filterId": "32", "displayId": "Heat Sensor 32", "name": "Normandy and Stanwood"},
  {"group": "Heat Sensors", "id": "heat:33", "filterId": "33", "displayId": "Heat Sensor 33", "name": "Weldon St and Gannet St"},
  {"group": "Heat Sensors", "id": "heat:34", "filterId": "34", "displayId": "Heat Sensor 34", "name": "Homestead and Harold"},
  {"group": "Heat Sensors", "id": "heat:35", "filterId": "35", "displayId": "Heat Sensor 35", "name": "Ruthven and Humboldt"},
  {"group": "Heat Sensors", "id": "heat:36", "filterId": "36", "displayId": "Heat Sensor 36", "name": "Waumbeck and Warren"},
  {"group": "Heat Sensors", "id": "heat:37", "filterId": "37", "displayId": "Heat Sensor 37", "name": "Crawford (behind Crispus Attucks Children Center)"},
  {"group": "Heat Sensors", "id": "heat:38", "filterId": "38", "displayId": "Heat Sensor 38", "name": "Elm Hill and Crawford"},
  {"group": "Heat Sensors", "id": "heat:39", "filterId": "39", "displayId": "Heat Sensor 39", "name": "Batchelder and Marshfield"},
  {"group": "Heat Sensors", "id": "heat:40", "filterId": "40", "displayId": "Heat Sensor 40", "name": "Hampden and Eustis"},
  {"group": "Heat Sensors", "id": "heat:41", "filterId": "41", "displayId": "Heat Sensor 41", "name": "Forest St and Vine St"},
  {"group": "Heat Sensors", "id": "heat:43", "filterId": "43", "displayId": "Heat Sensor 43", "name": "W.Cottage and Brook"},
  {"group": "Heat Sensors", "id": "heat:44", "filterId": "44", "displayId": "Heat Sensor 44", "name": "Washington St and Bishop Joe L. Smith"},
  {"group": "Heat Sensors", "id": "heat:45", "filterId": "45", "displayId": "Heat Sensor 45", "name": "Children's Park (Intervale and Normandy)"},
  {"group": "Heat Sensors", "id": "heat:46", "filterId": "46", "displayId": "Heat Sensor 46", "name": "Bynoe Park"},
  {"group": "Heat Sensors", "id": "heat:47", "filterId": "47", "displayId": "Heat Sensor 47", "name": "Elm Hill and Cheney"},
  {"group": "Heat Sensors", "id": "heat:48", "filterId": "48", "displayId": "Heat Sensor 48", "name": "Quincy and Magnolia"},
  {"group": "Heat Sensors", "id": "heat:49", "filterId": "49", "displayId": "Heat Sensor 49", "name": "Moreland St, Howes Playground"},
  {"group": "Heat Sensors", "id": "heat:50", "filterId": "50", "displayId": "Heat Sensor 50", "name": "Warren Pl"},
  {"group": "Heat Sensors", "id": "heat:51", "filterId": "51", "displayId": "Heat Sensor 51", "name": "Normandy and Seaver"},
  {"group": "Heat Sensors", "id": "heat:52", "filterId": "52", "displayId": "Heat Sensor 52", "name": "Winthrop Playground"},
  {"group": "Heat Sensors", "id": "heat:53", "filterId": "53", "displayId": "Heat Sensor 53", "name": "Dennis St Park"},
  {"group": "Heat Sensors", "id": "heat:54", "filterId": "54", "displayId": "Heat Sensor 54", "name": "Freedom House Warren St"},
  {"group": "Heat Sensors", "id": "heat:55", "filterId": "55", "displayId": "Heat Sensor 55", "name": "Fayston and Perth"},
  {"group": "Heat Sensors", "id": "heat:9", "filterId": "9", "displayId": "Heat Sensor 9", "name": "Savin & Tupelo"},
];

const sensorCatalogSources = [
  {
    kind: "air",
    label: "Air Quality Sensors",
    path: "Air_Quality_Sensors/Air_Quality_Sensors.dbf",
    idField: "SensorID",
    nameField: "LocationNa",
    typeField: "SensorType",
  },
  {
    kind: "noise",
    label: "Noise Sensors",
    path: "Noise_Sensors/NoiseSensors.dbf",
    idField: "Sound_sens",
    nameField: "Location",
  },
  {
    kind: "heat",
    label: "Heat Sensors",
    path: "Heat_Sensors_Shapefile/Heat_Sensors_Shapefile.dbf",
    idField: "T__RH_sens",
    nameField: "Location",
  },
];

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
    noDataColor: "#ffffff",
    bands: [
      { label: "Lower", detail: "Less than 70% of threshold", min: 0, max: 0.7, color: "#e8f0ea" },
      { label: "Elevated", detail: "70% to 100% of threshold", min: 0.7, max: 1, color: "#f3dba5" },
      { label: "Exceeded", detail: "100% to 140% of threshold", min: 1, max: 1.4, color: "#e29974" },
      { label: "High", detail: "140% of threshold or higher", min: 1.4, max: Infinity, color: "#c45f4e" },
    ],
  },
  air: {
    title: "PM2.5",
    note: "PM2.5 colors follow U.S. EPA Air Quality Index categories for daily average PM2.5 concentrations.",
    noDataColor: "#ffffff",
    bands: [
      { label: "Good", detail: "0-9", min: 0, max: 9.1, color: "#008334" },
      { label: "Moderate", detail: "9.1-35.4", min: 9.1, max: 35.5, color: "#ffa331" },
      { label: "Unhealthy for Sensitive Groups", detail: "35.5-55.4", min: 35.5, max: 55.5, color: "#ff6523" },
      { label: "Unhealthy", detail: "55.5-125.4", min: 55.5, max: 125.5, color: "#ee1e1e" },
      { label: "Very Unhealthy", detail: "125.5-225.4", min: 125.5, max: 225.5, color: "#612e61" },
      { label: "Hazardous", detail: ">=225.5", min: 225.5, max: Infinity, color: "#660e10" },
    ],
  },
  pm10: {
    title: "PM10",
    note: "PM10 colors follow U.S. EPA Air Quality Index categories for daily average PM10 concentrations.",
    noDataColor: "#ffffff",
    bands: [
      { label: "Good", detail: "0-54", min: 0, max: 55, color: "#008636" },
      { label: "Moderate", detail: "55-154", min: 55, max: 155, color: "#ffa52f" },
      { label: "Unhealthy for Sensitive Groups", detail: "155-254", min: 155, max: 255, color: "#ff6221" },
      { label: "Unhealthy", detail: "255-354", min: 255, max: 355, color: "#e41f21" },
      { label: "Very Unhealthy", detail: "355-424", min: 355, max: 425, color: "#62346c" },
      { label: "Hazardous", detail: ">=425", min: 425, max: Infinity, color: "#691011" },
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
    note: "Noise colors follow the City of Boston Noise Regulation: acceptable at any time below 50 dB, daytime-only from 50 to 70 dB, and unreasonable at any time at 70 dB and higher.",
    noDataColor: "#ffffff",
    bands: [
      { label: "Acceptable at Any Time", detail: "0-50 dB", min: 0, max: 50, color: "#00944d" },
      { label: "Acceptable Only from 7 a.m. to 11 p.m.", detail: "50-70 dB", min: 50, max: 70, color: "#f9b934" },
      { label: "Unreasonable at Any Time", detail: ">=70 dB", min: 70, max: Infinity, color: "#810c10" },
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

function parseDbf(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder("latin1");
  const recordCount = view.getUint32(4, true);
  const headerLength = view.getUint16(8, true);
  const recordLength = view.getUint16(10, true);
  const fields = [];

  for (let offset = 32; offset + 32 <= headerLength && bytes[offset] !== 0x0d; offset += 32) {
    const nameBytes = bytes.slice(offset, offset + 11);
    const nullIndex = nameBytes.indexOf(0);
    const name = decoder.decode(nameBytes.slice(0, nullIndex === -1 ? nameBytes.length : nullIndex)).trim();
    fields.push({
      name,
      length: bytes[offset + 16],
    });
  }

  const rows = [];
  for (let index = 0; index < recordCount; index += 1) {
    const recordStart = headerLength + index * recordLength;
    if (bytes[recordStart] === 0x2a) continue;
    let fieldStart = recordStart + 1;
    const row = {};
    fields.forEach((field) => {
      const raw = bytes.slice(fieldStart, fieldStart + field.length);
      row[field.name] = cleanText(decoder.decode(raw));
      fieldStart += field.length;
    });
    rows.push(row);
  }
  return rows;
}

function cleanSensorId(value) {
  const text = cleanText(value);
  if (!text) return "";
  const number = Number(text);
  if (Number.isFinite(number)) return Number.isInteger(number) ? String(number) : String(roundNumber(number));
  return text;
}

async function loadSensorCatalog() {
  const catalogGroups = await Promise.all(sensorCatalogSources.map(async (source) => {
    try {
      const response = await fetch(source.path);
      if (!response.ok) return [];
      const rows = parseDbf(await response.arrayBuffer());
      return rows.map((row) => {
        const filterId = cleanSensorId(row[source.idField]);
        const type = cleanText(source.typeField ? row[source.typeField] : "") || source.label.replace(/s$/, "");
        if (!filterId) return null;
        return {
          group: source.label,
          id: `${source.kind}:${filterId}`,
          filterId,
          displayId: source.kind === "air" ? filterId : `${type} ${filterId}`,
          name: cleanText(row[source.nameField]),
        };
      }).filter(Boolean);
    } catch (error) {
      return [];
    }
  }));

  const loadedCatalog = catalogGroups.flat();
  if (loadedCatalog.length) state.sensorCatalog = loadedCatalog;
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

function metricDisplay(metric) {
  return {
    air: "PM2.5",
    pm10: "PM10",
    heat: "Heat Index",
    noise: "Noise",
  }[metric] || "Sensor reading";
}

function filteredRows() {
  const { year, month } = monthInfo();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const selection = selectedLocation();
  const rows = state.rows.filter((row) => row.date.startsWith(prefix) && rowMatchesLocation(row, selection));
  return averageRowsByDate(rows);
}

function monthRowsForCluster(cluster) {
  const { year, month } = monthInfo();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return averageRowsByDate(state.rows.filter((row) => row.date.startsWith(prefix) && row.cluster === cluster));
}

function monthRowsForLocation(locationValueToRead) {
  const { year, month } = monthInfo();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const selection = selectedLocation(locationValueToRead);
  return averageRowsByDate(state.rows.filter((row) => row.date.startsWith(prefix) && rowMatchesLocation(row, selection)));
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

function selectedHazardMetric() {
  return els.calendarMetric.value;
}

function metricHasValue(row, metric = selectedHazardMetric()) {
  return row[metric] !== null && row[metric] !== undefined;
}

function catalogSensorMatchesMetric(sensor, metric = selectedHazardMetric()) {
  const sensorKind = sensor.id.split(":")[0];
  if (metric === "air" || metric === "pm10") return sensorKind === "air";
  if (metric === "heat") return sensorKind === "heat";
  if (metric === "noise") return sensorKind === "noise";
  return true;
}

function clusterOptionsFromRows() {
  const clusters = new Map();
  state.rows.forEach((row) => {
    if (!row.cluster || !metricHasValue(row)) return;
    if (!clusters.has(row.cluster)) {
      clusters.set(row.cluster, {
        kind: "cluster",
        group: "Predefined sensor groups",
        id: row.cluster,
        filterId: row.cluster,
        value: locationValue("cluster", row.cluster),
        label: row.cluster,
        display: row.cluster,
      });
    }
  });
  return Array.from(clusters.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function sensorOptionsFromRows() {
  const sensors = new Map();
  state.rows.forEach((row) => {
    if (!row.sensorId || !metricHasValue(row)) return;
    const id = row.sensorId;
    if (!sensors.has(id)) {
      sensors.set(id, {
        kind: "sensor",
        group: "Predefined sensor groups",
        id,
        filterId: id,
        value: locationValue("sensor", id),
        label: row.cluster ? `${row.cluster} - ${id}` : id,
        display: row.cluster ? `${row.cluster} (${id})` : id,
      });
    }
  });
  return Array.from(sensors.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function sensorOptionsFromCatalog() {
  const uploadedSensorIds = new Set(sensorOptionsFromRows().map((sensor) => sensor.filterId));
  return state.sensorCatalog
    .filter((sensor) => catalogSensorMatchesMetric(sensor))
    .filter((sensor) => !uploadedSensorIds.has(sensor.filterId))
    .map((sensor) => ({
      kind: "sensor",
      group: sensor.group,
      id: sensor.id,
      filterId: sensor.filterId,
      value: locationValue("sensor", sensor.id),
      label: sensor.name ? `${sensor.name} - ${sensor.displayId}` : sensor.displayId,
      display: sensor.name ? `${sensor.name} (${sensor.displayId})` : sensor.displayId,
    }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function locationOptions() {
  return [...sensorOptionsFromCatalog(), ...clusterOptionsFromRows(), ...sensorOptionsFromRows()];
}

function comparisonLocationOptions() {
  return locationOptions();
}

function locationValue(kind, id) {
  return `${kind}:${encodeURIComponent(id)}`;
}

function selectedLocation(value = els.location.value, options = locationOptions()) {
  const selected = options.find((option) => option.value === value);
  if (selected) return selected;
  return {
    kind: "cluster",
    id: value,
    filterId: value,
    value: locationValue("cluster", value),
    label: value,
    display: value,
  };
}

function locationDisplay(value = els.location.value) {
  const location = selectedLocation(value, comparisonLocationOptions());
  return location.display || location.label || "Sensor Site";
}

function rowMatchesLocation(row, selection) {
  if (selection.kind === "sensor") {
    return row.sensorId && row.sensorId === selection.filterId;
  }
  return row.cluster === selection.filterId;
}

function resolvePreferredLocation(preferredLocation, options) {
  if (options.some((option) => option.value === preferredLocation)) return preferredLocation;
  const legacyMatch = options.find((option) => option.id === preferredLocation || option.filterId === preferredLocation || option.label === preferredLocation);
  return legacyMatch?.value || options[0]?.value || "";
}

function updateClusterOptions(preferredCluster = els.location.value) {
  const clusters = clusterOptions();
  const options = locationOptions();
  populateClusterSelect(els.location, options);

  const selectedValue = resolvePreferredLocation(preferredCluster, options);
  if (!selectedValue) return;
  els.location.value = selectedValue;
  els.previewCluster.textContent = locationDisplay(selectedValue);
  const selected = selectedLocation(selectedValue);
  updateComparisonLocationOptions(clusters, selected.kind === "cluster" ? selected.filterId : clusters[0]);
  if (els.sensorSearch.value.trim()) renderSensorSearchResults();
  if (els.comparisonSearch?.value.trim()) renderComparisonSearchResults();
}

function populateClusterSelect(select, options) {
  select.innerHTML = "";
  const groups = new Map();
  options.forEach((locationOption) => {
    if (!groups.has(locationOption.group)) {
      const group = document.createElement("optgroup");
      group.label = locationOption.group;
      groups.set(locationOption.group, group);
      select.append(group);
    }
    const group = groups.get(locationOption.group);
    const option = document.createElement("option");
    option.value = locationOption.value;
    option.textContent = locationOption.label;
    group.append(option);
  });
}

function matchingLocationOptions(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return Array.from(els.location.options).filter((option) => {
    return option.textContent.toLowerCase().includes(normalizedQuery) || option.value.toLowerCase().includes(normalizedQuery);
  });
}

function hideSensorSearchResults() {
  els.sensorSearchResults.hidden = true;
}

function selectLocationSearchResult(value, label = "") {
  els.location.value = value;
  els.sensorSearch.value = label;
  hideSensorSearchResults();
  render();
}

function renderSensorSearchResults({ force = false } = {}) {
  const query = els.sensorSearch.value.trim().toLowerCase();
  if (!query && !force) {
    hideSensorSearchResults();
    return [];
  }

  const matches = query ? matchingLocationOptions(query).slice(0, 8) : Array.from(els.location.options).slice(0, 8);
  els.sensorSearchResults.innerHTML = "";

  if (!matches.length) {
    const empty = document.createElement("span");
    empty.className = "sensor-search-empty";
    empty.textContent = "No matching sensors";
    els.sensorSearchResults.append(empty);
    els.sensorSearchResults.hidden = false;
    return [];
  }

  matches.forEach((option) => {
    const result = document.createElement("button");
    result.type = "button";
    result.className = "sensor-search-result";
    result.setAttribute("role", "option");
    result.dataset.value = option.value;
    result.textContent = option.textContent;
    result.addEventListener("click", () => selectLocationSearchResult(option.value, option.textContent));
    els.sensorSearchResults.append(result);
  });

  els.sensorSearchResults.hidden = false;
  return matches;
}

function searchLocationOptions() {
  const query = els.sensorSearch.value.trim();
  if (!query) {
    renderSensorSearchResults({ force: true });
    els.sensorSearch.focus();
    return;
  }

  const match = renderSensorSearchResults()[0];

  if (!match) {
    els.sensorSearch.setCustomValidity("No matching sensor found");
    els.sensorSearch.reportValidity();
    els.sensorSearch.setCustomValidity("");
    return;
  }

  selectLocationSearchResult(match.value, match.textContent);
}

function matchingComparisonOptions(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const selected = new Set(state.comparisonLocations);
  return comparisonLocationOptions().filter((option) => {
    if (selected.has(option.value)) return false;
    const searchable = `${option.label} ${option.display} ${option.value}`.toLowerCase();
    return !normalizedQuery || searchable.includes(normalizedQuery);
  });
}

function hideComparisonSearchResults() {
  els.comparisonSearchResults.hidden = true;
}

function addComparisonLocation(value) {
  if (!state.comparisonLocations.includes(value)) {
    state.comparisonLocations = [...state.comparisonLocations, value].slice(-8);
  }
  els.comparisonSearch.value = "";
  hideComparisonSearchResults();
  renderComparisonSelected();
  render();
}

function renderComparisonSearchResults({ force = false } = {}) {
  const query = els.comparisonSearch.value.trim();
  if (!query && !force) {
    hideComparisonSearchResults();
    return [];
  }

  const matches = matchingComparisonOptions(query).slice(0, 8);
  els.comparisonSearchResults.innerHTML = "";

  if (!matches.length) {
    const empty = document.createElement("span");
    empty.className = "sensor-search-empty";
    empty.textContent = "No matching sensors or groups";
    els.comparisonSearchResults.append(empty);
    els.comparisonSearchResults.hidden = false;
    return [];
  }

  matches.forEach((option) => {
    const result = document.createElement("button");
    result.type = "button";
    result.className = "sensor-search-result";
    result.setAttribute("role", "option");
    result.dataset.value = option.value;
    result.textContent = option.label;
    result.addEventListener("click", () => addComparisonLocation(option.value));
    els.comparisonSearchResults.append(result);
  });

  els.comparisonSearchResults.hidden = false;
  return matches;
}

function addFirstComparisonSearchResult() {
  const match = renderComparisonSearchResults({ force: true })[0];
  if (match) addComparisonLocation(match.value);
}

function updateComparisonLocationOptions(clusters, primaryCluster = els.location.value) {
  const options = comparisonLocationOptions();
  const optionValues = new Set(options.map((option) => option.value));
  const previous = state.comparisonLocations
    .map((location) => resolvePreferredLocation(location, options))
    .filter((location, index, all) => optionValues.has(location) && all.indexOf(location) === index);
  const primaryValue = resolvePreferredLocation(primaryCluster, options);
  const defaults = [primaryValue, ...options.map((option) => option.value)]
    .filter((location, index, all) => location && all.indexOf(location) === index)
    .slice(0, Math.min(4, options.length));
  state.comparisonLocations = previous.length ? previous : defaults;
  renderComparisonLocationOptions();
}

function renderComparisonLocationOptions() {
  els.comparisonLocations.innerHTML = "";
  renderComparisonSelected();
}

function comparisonOption(value) {
  return selectedLocation(value, comparisonLocationOptions());
}

function renderComparisonSelected() {
  if (!els.comparisonSelected) return;
  els.comparisonSelected.innerHTML = "";
  selectedComparisonLocations().forEach((locationValueToRender) => {
    const option = comparisonOption(locationValueToRender);
    const chip = document.createElement("span");
    chip.className = "comparison-chip";
    const label = document.createElement("span");
    label.textContent = option.display || option.label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${option.display || option.label}`);
    remove.textContent = "x";
    remove.addEventListener("click", () => {
      state.comparisonLocations = state.comparisonLocations.filter((location) => location !== locationValueToRender);
      if (!state.comparisonLocations.length) {
        state.comparisonLocations = comparisonLocationOptions().slice(0, 1).map((item) => item.value);
      }
      renderComparisonSelected();
      render();
    });
    chip.append(label, remove);
    els.comparisonSelected.append(chip);
  });
}

function selectedComparisonLocations() {
  const options = comparisonLocationOptions();
  const optionValues = new Set(options.map((option) => option.value));
  const selected = state.comparisonLocations
    .map((location) => resolvePreferredLocation(location, options))
    .filter((location, index, all) => optionValues.has(location) && all.indexOf(location) === index);
  if (selected.length) return selected;
  return options.slice(0, Math.min(4, options.length)).map((option) => option.value);
}

function comparisonSeries() {
  const metric = els.calendarMetric.value;
  return selectedComparisonLocations().map((locationValueToRead, index) => {
    const option = comparisonOption(locationValueToRead);
    const rows = monthRowsForLocation(locationValueToRead);
    const values = rows.filter((row) => row[metric] !== null && row[metric] !== undefined);
    const peak = values.length ? Math.max(...values.map((row) => row[metric])) : null;
    const average = values.length ? roundNumber(values.reduce((sum, row) => sum + row[metric], 0) / values.length) : null;
    return {
      key: locationValueToRead,
      cluster: option.display || option.label,
      rows,
      values,
      peak,
      average,
      color: comparisonColors[index % comparisonColors.length],
    };
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

function metricSummaryStats(rows, metric) {
  const limits = thresholds();
  const metricRows = rows.filter((row) => row[metric] !== null && row[metric] !== undefined);
  const bands = new Map();

  metricRows.forEach((row) => {
    const severity = rowSeverity(row, metric, limits);
    const band = standardBand(metric, row, severity);
    if (!bands.has(band.label)) {
      bands.set(band.label, { label: band.label, count: 0, color: band.color });
    }
    bands.get(band.label).count += 1;
  });

  return {
    exceedanceDays: metricRows.filter((row) => row[metric] >= limits[metric]).length,
    maxValue: metricRows.length ? Math.max(...metricRows.map((row) => row[metric])) : null,
    topBand: Array.from(bands.values()).sort((a, b) => b.count - a.count)[0] || null,
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
  const standard = metricStandards[metric] || metricStandards.composite;
  const noDataBand = { label: "No data", detail: "Missing readings", color: standard.noDataColor || "#ffffff" };
  if (!row) return noDataBand;
  if (metric === "composite") {
    return metricStandards.composite.bands.find((band) => {
      return severity !== null && severity >= band.min && severity < band.max;
    }) || noDataBand;
  }
  if (metric === "heat") return heatIndexBand(row.heat) || noDataBand;
  const value = row[metric];
  if (value === null || value === undefined) return noDataBand;
  const bands = standard.bands;
  return bands.find((band) => {
    return value >= band.min && value < band.max;
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
  graphic.style.setProperty("--legend-columns", standard.bands.length);
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
    const cellColor = calendarColor(datum, metric, severity);
    const cell = document.createElement("div");
    cell.className = [
      "day",
      "heatmap-day",
      calendarBandClass(datum, metric),
      severity !== null && severity >= 1 ? "is-over-threshold" : "",
      !darkTextOn(cellColor) ? "is-dark-cell" : "",
    ].filter(Boolean).join(" ");
    cell.style.setProperty("--heat", cellColor);
    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="heatmap-value">${formatCellValue(datum, metric, severity)}</span>
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

function standardChartCeiling(metric, valueMax) {
  const standard = metricStandards[metric];
  if (!standard) return valueMax;
  const finiteBandTops = standard.bands
    .map((band) => band.max)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  return finiteBandTops.find((value) => value >= valueMax) || finiteBandTops[finiteBandTops.length - 1] || valueMax;
}

function drawStandardBands(ctx, metric, padding, plotW, plotH, chartMax) {
  const standard = metricStandards[metric];
  if (!standard) return;

  const valueToY = (value) => padding.top + plotH - (value / chartMax) * plotH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(padding.left, padding.top, plotW, plotH);
  ctx.clip();

  standard.bands.forEach((band) => {
    const min = Number.isFinite(band.min) ? Math.max(0, band.min) : 0;
    const max = Number.isFinite(band.max) ? Math.min(chartMax, band.max) : chartMax;
    if (max <= 0 || min >= chartMax || max <= min) return;

    const yTop = valueToY(max);
    const yBottom = valueToY(min);
    ctx.fillStyle = band.color;
    ctx.fillRect(padding.left, yTop, plotW, yBottom - yTop);
  });

  ctx.restore();
}

function trendChartGeometry(canvas = els.trendChart) {
  const padding = trendChartPadding;
  return {
    padding,
    plotW: canvas.width - padding.left - padding.right,
    plotH: canvas.height - padding.top - padding.bottom,
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function formatMetricTooltipValue(value, metric) {
  if (value === null || value === undefined) return "No data";
  return `${value} ${metricUnit(metric)}`;
}

function comparisonValuesForDay(day) {
  const metric = els.calendarMetric.value;
  return comparisonSeries().map((item) => {
    const row = item.rows.find((datum) => Number(datum.date.slice(-2)) === day);
    return {
      cluster: item.cluster,
      color: item.color,
      value: row?.[metric],
    };
  });
}

function renderTrendChart() {
  const canvas = els.trendChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const metric = els.calendarMetric.value;
  const unit = metricUnit(metric);
  const info = monthInfo();
  const series = comparisonSeries();
  const allValues = series.flatMap((item) => item.values.map((row) => row[metric]));
  const threshold = thresholds()[metric];
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfbfa";
  ctx.fillRect(0, 0, width, height);

  const { padding, plotW, plotH } = trendChartGeometry(canvas);
  const maxValue = Math.max(threshold || 0, ...allValues, metric === "heat" ? 100 : 10);
  const standardMax = standardChartCeiling(metric, maxValue);
  const chartMax = Math.ceil((Math.max(maxValue, standardMax) * 1.12) / 10) * 10;
  const rowsByCluster = new Map(series.map((item) => [item.cluster, new Map(item.rows.map((row) => [Number(row.date.slice(-2)), row]))]));

  drawStandardBands(ctx, metric, padding, plotW, plotH, chartMax);

  ctx.strokeStyle = "#d3d8da";
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.muted;
  ctx.font = "14px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(Math.round(chartMax - (chartMax / 4) * i)), padding.left - 12, y + 4);
  }

  if (state.trendHoverDay) {
    const hoverX = padding.left + (info.days <= 1 ? 0 : (plotW / (info.days - 1)) * (state.trendHoverDay - 1));
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(17, 24, 39, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hoverX, padding.top);
    ctx.lineTo(hoverX, padding.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (threshold) {
    const thresholdY = padding.top + plotH - (threshold / chartMax) * plotH;
    ctx.setLineDash([8, 7]);
    ctx.strokeStyle = "#7b8288";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, thresholdY);
    ctx.lineTo(width - padding.right, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#4d555d";
    ctx.textAlign = "left";
    ctx.fillText(`Threshold ${threshold} ${unit}`, padding.left + 10, thresholdY - 8);
  }

  const traceSeriesLine = (item) => {
    ctx.beginPath();
    let hasPoint = false;
    for (let day = 1; day <= info.days; day += 1) {
      const row = rowsByCluster.get(item.cluster)?.get(day);
      const value = row?.[metric];
      if (value === null || value === undefined) {
        hasPoint = false;
        continue;
      }
      const x = padding.left + (info.days <= 1 ? 0 : (plotW / (info.days - 1)) * (day - 1));
      const y = padding.top + plotH - (value / chartMax) * plotH;
      if (!hasPoint) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      hasPoint = true;
    }
  };

  series.forEach((item) => {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    traceSeriesLine(item);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.lineWidth = 8;
    ctx.stroke();

    traceSeriesLine(item);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = item.color;
    item.rows.forEach((row) => {
      const value = row[metric];
      if (value === null || value === undefined) return;
      const day = Number(row.date.slice(-2));
      const x = padding.left + (info.days <= 1 ? 0 : (plotW / (info.days - 1)) * (day - 1));
      const y = padding.top + plotH - (value / chartMax) * plotH;
      const isHovered = state.trendHoverDay === day;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 6 : 4.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 4.2 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.fillStyle = colors.muted;
  ctx.textAlign = "center";
  for (let day = 1; day <= info.days; day += 1) {
    if (day !== 1 && day !== info.days && day % 5 !== 0) continue;
    const x = padding.left + (info.days <= 1 ? 0 : (plotW / (info.days - 1)) * (day - 1));
    ctx.fillText(String(day), x, height - 22);
  }
  ctx.textAlign = "left";
  ctx.fillText("Day of month", padding.left, height - 8);

  if (!allValues.length) {
    ctx.fillStyle = colors.muted;
    ctx.font = "24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload a CSV or load the sample data", width / 2, height / 2);
    ctx.textAlign = "start";
  }
}

function hideTrendTooltip() {
  state.trendHoverDay = null;
  if (els.trendTooltip) els.trendTooltip.hidden = true;
  renderTrendChart();
}

function updateTrendTooltip(event) {
  const canvas = els.trendChart;
  const tooltip = els.trendTooltip;
  if (!canvas || !tooltip) return;

  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const { padding, plotW, plotH } = trendChartGeometry(canvas);
  if (x < padding.left || x > padding.left + plotW || y < padding.top || y > padding.top + plotH) {
    hideTrendTooltip();
    return;
  }

  const info = monthInfo();
  const day = Math.max(1, Math.min(info.days, Math.round(((x - padding.left) / plotW) * (info.days - 1)) + 1));
  const metric = els.calendarMetric.value;
  const values = comparisonValuesForDay(day);
  if (!values.some((item) => item.value !== null && item.value !== undefined)) {
    hideTrendTooltip();
    return;
  }

  if (state.trendHoverDay !== day) {
    state.trendHoverDay = day;
    renderTrendChart();
  }

  const date = new Date(info.year, info.month - 1, day).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  tooltip.innerHTML = `
    <strong>${date}</strong>
    <span>${escapeHtml(metricDisplay(metric))}</span>
    ${values.map((item) => `
      <div class="tooltip-row">
        <i style="background:${item.color}"></i>
        <span>${escapeHtml(item.cluster)}</span>
        <b>${escapeHtml(formatMetricTooltipValue(item.value, metric))}</b>
      </div>
    `).join("")}
  `;
  tooltip.hidden = false;

  const panelRect = tooltip.parentElement.getBoundingClientRect();
  const tooltipWidth = tooltip.offsetWidth || 230;
  const tooltipHeight = tooltip.offsetHeight || 150;
  const left = Math.min(Math.max(event.clientX - panelRect.left + 14, 8), panelRect.width - tooltipWidth - 8);
  const top = Math.min(Math.max(event.clientY - panelRect.top + 14, 8), panelRect.height - tooltipHeight - 8);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
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

function updateComparisonSummary() {
  const metric = els.calendarMetric.value;
  const metricName = metricDisplay(metric);
  const unit = metricUnit(metric);
  const series = comparisonSeries();
  const withPeaks = series.filter((item) => item.peak !== null);
  const withAverages = series.filter((item) => item.average !== null);
  const peak = withPeaks.sort((a, b) => b.peak - a.peak)[0];
  const average = withAverages.sort((a, b) => b.average - a.average)[0];
  const comparedDays = Math.max(0, ...series.map((item) => item.values.length));

  document.getElementById("comparisonMetricTitle").textContent = `${metricName} by Location`;
  document.getElementById("comparisonPeakLabel").textContent = `Highest daily average ${metricName}`;
  document.getElementById("comparisonAverageLabel").textContent = `Highest monthly average ${metricName}`;
  document.getElementById("comparisonPeakLocation").textContent = peak ? `${peak.cluster}: ${peak.peak} ${unit}` : "--";
  document.getElementById("comparisonAverageLocation").textContent = average ? `${average.cluster}: ${average.average} ${unit}` : "--";
  document.getElementById("comparisonCoverage").textContent = series.length ? `${series.length} locations / ${comparedDays} days` : "--";

  els.comparisonLegend.innerHTML = "";
  series.forEach((item) => {
    const legendItem = document.createElement("span");
    const swatch = document.createElement("i");
    swatch.style.background = item.color;
    legendItem.append(swatch, document.createTextNode(item.cluster));
    els.comparisonLegend.append(legendItem);
  });
}

function updateText() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const title = els.title.value.trim() || "Composite Calendar";
  const location = locationDisplay() || "Sensor Site";
  const comparedLocations = selectedComparisonLocations();
  const comparedLocationText = comparedLocations.length > 1
    ? `${comparedLocations.length} locations`
    : (comparedLocations[0] ? locationDisplay(comparedLocations[0]) : location);
  const catchphrase = els.catchphrase.value.trim() || `What's going on in ${location}?`;
  const author = els.author.value.trim() || "Name";
  const reportDate = formatReportDate(els.reportDate.value) || "June 24, 2026";
  document.querySelectorAll('[data-bind="title"]').forEach((node) => { node.textContent = title; });
  document.querySelectorAll('[data-bind="monthShort"]').forEach((node) => { node.textContent = info.short; });
  document.getElementById("reportCatchphrasePreview").textContent = catchphrase;
  document.getElementById("reportPhotoTitle").textContent = location;
  document.getElementById("reportMeta").textContent = `Prepared by ${author} on ${reportDate}`;
  document.getElementById("trendCatchphrasePreview").textContent = catchphrase;
  document.getElementById("trendPhotoTitle").textContent = comparedLocationText;
  document.getElementById("trendMeta").textContent = `Prepared by ${author} on ${reportDate}`;
  document.getElementById("calendarMonth").textContent = info.long;
  document.getElementById("trendMonth").textContent = info.long;
  els.previewCluster.textContent = location;
  const userNote = els.generalInfo.value.trim();
  const noteHtml = state.noteHtml || escapeHtml(userNote || "Type in your comments/stories/lived experience here");
  if (document.activeElement !== els.notePreview) {
    els.notePreview.innerHTML = noteHtml;
  }
  const trendNote = document.getElementById("trendNotePreview");
  if (document.activeElement !== trendNote) {
    trendNote.innerHTML = noteHtml;
  }
  els.notePreview.classList.toggle("empty-note", !userNote);
  trendNote.classList.toggle("empty-note", !userNote);
  document.getElementById("snapshotSubhead").textContent = `${location} sensor context and interpretation notes.`;
  document.getElementById("snapshotLocation").textContent = location;
  document.getElementById("snapshotNotes").textContent = userNote || "Type in your comments/stories/lived experience here";

  const selectedMetric = els.calendarMetric.value;
  const selectedMetricName = metricDisplay(selectedMetric);
  const selectedMetricUnit = metricUnit(selectedMetric);
  const selectedMetricStats = metricSummaryStats(stats.rows, selectedMetric);
  document.getElementById("metricSummaryLabel").textContent = `${selectedMetricName} exceedance days for ${info.short}.`;
  document.getElementById("peakMetricSummaryLabel").textContent = `Highest daily average ${selectedMetricName} for ${info.short}.`;
  document.getElementById("riskMetricSummaryLabel").textContent = `Most common ${selectedMetricName} standard category for ${info.short}.`;
  document.getElementById("heatSummary").textContent = plural(selectedMetricStats.exceedanceDays, "exceedance day");
  document.getElementById("peakHeatSummary").textContent = selectedMetricStats.maxValue === null ? "--" : `${selectedMetricStats.maxValue} ${selectedMetricUnit}`;
  document.getElementById("dangerHeatSummary").textContent = selectedMetricStats.topBand ? `${selectedMetricStats.topBand.label}: ${plural(selectedMetricStats.topBand.count, "day")}` : "--";
  updateComparisonSummary();

  document.getElementById("airThresholdCell").textContent = `${els.airThreshold.value} ug/m3`;
  document.getElementById("heatThresholdCell").textContent = `${els.heatThreshold.value} °F`;
  document.getElementById("noiseThresholdCell").textContent = `${els.noiseThreshold.value} dB`;
  document.getElementById("airDaysCell").textContent = stats.counts.air;
  document.getElementById("heatDaysCell").textContent = stats.counts.heat;
  document.getElementById("noiseDaysCell").textContent = stats.counts.noise;

  const total = stats.counts.air + stats.counts.heat + stats.counts.noise;
  document.getElementById("recommendationText").textContent = total
    ? `${info.short} shows ${total} combined threshold exceedances based on daily averages for ${location}. Compare clustered days against site activity, weather, and nearby sources before assigning cause.`
    : `No threshold exceedances are currently shown for ${location}. Adjust thresholds, choose another sensor or cluster, or upload site data to refine the interpretation.`;
}

function render() {
  updateText();
  renderCalendar();
  renderScene(els.reportScene);
  renderTrendChart();
  renderScene(els.trendScene);
  renderScene(els.snapshotScene);
}

function syncNoteFromEditor(editor) {
  state.noteHtml = editor.innerHTML;
  els.generalInfo.value = editor.textContent;
  render();
}

function applyNoteCommand(editor, command, value = null) {
  editor.focus();
  document.execCommand(command, false, value);
  syncNoteFromEditor(editor);
}

function applyNoteFontSize(editor, size) {
  editor.focus();
  document.execCommand("fontSize", false, "7");
  editor.querySelectorAll('font[size="7"]').forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    while (font.firstChild) span.append(font.firstChild);
    font.replaceWith(span);
  });
  syncNoteFromEditor(editor);
}

function setupNoteEditor({ editor, toolbar, fontFamilySelect, fontSizeSelect, clearButton }) {
  if (!editor || !toolbar) return;

  editor.addEventListener("input", () => syncNoteFromEditor(editor));

  toolbar.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => applyNoteCommand(editor, button.dataset.command));
  });

  fontFamilySelect?.addEventListener("change", () => applyNoteCommand(editor, "fontName", fontFamilySelect.value));
  fontSizeSelect?.addEventListener("change", () => applyNoteFontSize(editor, fontSizeSelect.value));
  clearButton?.addEventListener("mousedown", (event) => event.preventDefault());
  clearButton?.addEventListener("click", () => applyNoteCommand(editor, "removeFormat"));
}

function setTemplate(template) {
  state.template = template;
  if (template !== "trends") hideTrendTooltip();
  document.querySelectorAll(".template-tab").forEach((button) => {
    const active = button.dataset.template === template;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-template-panel]").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.templatePanel === template);
  });
  document.querySelectorAll("[data-template-control]").forEach((control) => {
    control.hidden = control.dataset.templateControl !== template;
  });
}

document.querySelectorAll(".template-tab").forEach((button) => {
  button.addEventListener("click", () => setTemplate(button.dataset.template));
});

["input", "change"].forEach((eventName) => {
  [els.title, els.author, els.reportDate, els.catchphrase, els.location, els.month, els.generalInfo, els.airThreshold, els.pm10Threshold, els.heatThreshold, els.noiseThreshold, els.calendarMetric].forEach((input) => {
    input.addEventListener(eventName, () => {
      if (input === els.calendarMetric && eventName === "change") updateClusterOptions(els.location.value);
      render();
    });
  });
});

setupNoteEditor({
  editor: els.notePreview,
  toolbar: els.notePreview.previousElementSibling,
  fontFamilySelect: document.getElementById("noteFontFamily"),
  fontSizeSelect: document.getElementById("noteFontSize"),
  clearButton: document.getElementById("noteClearFormat"),
});

setupNoteEditor({
  editor: document.getElementById("trendNotePreview"),
  toolbar: document.getElementById("trendNotePreview").previousElementSibling,
  fontFamilySelect: document.getElementById("trendNoteFontFamily"),
  fontSizeSelect: document.getElementById("trendNoteFontSize"),
  clearButton: document.getElementById("trendNoteClearFormat"),
});

els.trendChart.addEventListener("pointermove", updateTrendTooltip);
els.trendChart.addEventListener("pointerleave", hideTrendTooltip);
els.trendChart.addEventListener("pointerdown", updateTrendTooltip);

els.sensorSearchBtn.addEventListener("click", () => {
  renderSensorSearchResults({ force: true });
  els.sensorSearch.focus();
});
els.sensorSearch.addEventListener("input", () => renderSensorSearchResults());
els.sensorSearch.addEventListener("focus", () => {
  if (els.sensorSearch.value.trim()) renderSensorSearchResults();
});
els.sensorSearch.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSensorSearchResults();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  searchLocationOptions();
});
els.location.addEventListener("change", hideSensorSearchResults);

els.comparisonSearchBtn.addEventListener("click", () => {
  renderComparisonSearchResults({ force: true });
  els.comparisonSearch.focus();
});
els.comparisonSearch.addEventListener("input", () => renderComparisonSearchResults());
els.comparisonSearch.addEventListener("focus", () => {
  if (els.comparisonSearch.value.trim()) renderComparisonSearchResults();
});
els.comparisonSearch.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideComparisonSearchResults();
    return;
  }
  if (event.key !== "Enter") return;
  event.preventDefault();
  addFirstComparisonSearchResult();
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
state.sensorCatalog = builtInSensorCatalog;
preloadPictureAssets();
updateClusterOptions("Sample Cluster 1");
setTemplate(state.template);
render();
loadSensorCatalog().then(() => {
  updateClusterOptions(els.location.value);
  render();
});
