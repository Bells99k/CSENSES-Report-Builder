const state = {
  template: "composite",
  rows: [],
  imageChoice: "grove",
  uploadedImage: null,
  builtInImages: {},
  sensorCatalog: [],
  dataSource: "sample",
  comparisonLocations: [],
  trendHoverDay: null,
  sensorPrintMapPromise: Promise.resolve(),
  sensorPrintMapRenderId: 0,
  apiLoadId: 0,
  apiAbortController: null,
  comparisonLocationsEdited: false,
  customClusters: [],
  customClusterDraftSensors: [],
  customClusterCounter: 1,
  noteHtml: "",
  noteDirty: false,
  generatedNoteText: "",
};

const els = {
  title: document.getElementById("reportTitle"),
  author: document.getElementById("reportAuthor"),
  reportDate: document.getElementById("reportDate"),
  catchphrase: document.getElementById("reportCatchphrase"),
  includeMapPage: document.getElementById("includeMapPage"),
  location: document.getElementById("locationName"),
  locationMode: document.getElementById("locationMode"),
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
  apiAggregation: document.getElementById("apiAggregation"),
  dataStatus: document.getElementById("dataStatus"),
  loadApiBtn: document.getElementById("loadApiBtn"),
  sensorSearch: document.getElementById("sensorSearch"),
  sensorSearchBtn: document.getElementById("sensorSearchBtn"),
  sensorSearchResults: document.getElementById("sensorSearchResults"),
  customClusterName: document.getElementById("customClusterName"),
  customClusterSelect: document.getElementById("customClusterSelect"),
  customClusterAddBtn: document.getElementById("customClusterAddBtn"),
  customClusterCreateBtn: document.getElementById("customClusterCreateBtn"),
  customClusterSelected: document.getElementById("customClusterSelected"),
  customClusterStatus: document.getElementById("customClusterStatus"),
  comparisonSearch: document.getElementById("comparisonSearch"),
  comparisonSearchBtn: document.getElementById("comparisonSearchBtn"),
  comparisonSearchResults: document.getElementById("comparisonSearchResults"),
  comparisonSelect: document.getElementById("comparisonSelect"),
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
  sensorMapPage: document.getElementById("sensorMapPage"),
  sensorMap: document.getElementById("sensorMap"),
  sensorMapLegend: document.getElementById("sensorMapLegend"),
  sensorMapList: document.getElementById("sensorMapList"),
  sensorMapTitle: document.getElementById("sensorMapTitle"),
  sensorMapMeta: document.getElementById("sensorMapMeta"),
  sensorPrintMap: document.getElementById("sensorPrintMap"),
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
const trendChartPadding = { left: 78, right: 30, top: 34, bottom: 66 };
const noteWordLimit = 100;
const defaultNoteText = "Type in your comments/stories/lived experience here (100 words max)";
const sensorDataApiBaseUrl = "https://sensordata-func-api-prd-ue2-01-d4hrdscjdcaxhugc.eastus2-01.azurewebsites.net/api";
const mapTileBaseUrl = "https://a.basemaps.cartocdn.com/light_all";
const apiRequestTimeoutMs = 90000;
const sensorApiMetricByReportMetric = {
  air: { namespace: "aq", metric: "pm25", rowKey: "air" },
  pm10: { namespace: "aq", metric: "pm10", rowKey: "pm10" },
  heat: { namespace: "nu", metric: "heat_index", rowKey: "heat" },
  noise: { namespace: "nu", metric: "noise", rowKey: "noise" },
};
const defaultSensorFilterIdByMetric = {
  air: "MOD-PM-01492",
  pm10: "MOD-PM-01492",
  heat: "25",
  noise: "25",
};
const legacyAqLocationIdByFilterId = {
  "MOD-PM-01486": "15",
  "MOD-PM-01487": "2",
  "MOD-PM-01488": "3",
  "MOD-PM-01489": "4",
  "MOD-PM-01490": "5",
  "MOD-PM-01491": "6",
  "MOD-PM-01492": "7",
  "MOD-PM-01493": "8",
  "MOD-PM-01494": "9",
  "MOD-PM-01495": "10",
  "MOD-PM-01548": "11",
  "MOD-PM-01549": "12",
  "MOD-PM-01550": "13",
  "MOD-PM-01592": "14",
  "MOD-PM-01593": "15",
  "MOD-PM-01594": "16",
  "MOD-PM-01595": "17",
  "MOD-PM-01596": "18",
  "MOD-PM-01597": "19",
  "MOD-PM-01598": "20",
  "MOD-PM-01599": "21",
  "MOD-PM-01600": "22",
  "MOD-PM-01601": "23",
};

const metricLabels = {
  composite: "Composite hazard severity",
  air: "PM2.5",
  pm10: "PM10",
  heat: "Heat Index classification",
  noise: "Noise",
};
const sensorMapFillColors = {
  air: "rgba(242, 192, 55, 0.4)",
  heat: "rgba(193, 48, 37, 0.34)",
  noise: "rgba(123, 44, 191, 0.4)",
};

const pictureAssets = {
  grove: "assets/Grove Hall.avif",
};

const builtInSensorCatalog = [
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01486", "filterId": "MOD-PM-01486", "displayId": "MOD-PM-01486", "name": "Blue Hill Ave @ Fayston St (Removed)", "latitude": 42.31422, "longitude": -71.07889},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01487", "filterId": "MOD-PM-01487", "displayId": "MOD-PM-01487", "name": "Blue Hill Ave @ Otisfield St", "latitude": 42.3126, "longitude": -71.0802},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01488", "filterId": "MOD-PM-01488", "displayId": "MOD-PM-01488", "name": "Blue Hill Ave @ Moreland St", "latitude": 42.32266, "longitude": -71.0769},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01489", "filterId": "MOD-PM-01489", "displayId": "MOD-PM-01489", "name": "Lewis Place", "latitude": 42.3237797, "longitude": -71.074761},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01490", "filterId": "MOD-PM-01490", "displayId": "MOD-PM-01490", "name": "Blue Hill Ave @ Intervale St", "latitude": 42.311667, "longitude": -71.080981},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01492", "filterId": "MOD-PM-01492", "displayId": "MOD-PM-01492", "name": "Blue Hill Ave @ Grove Hall", "latitude": 42.30876, "longitude": -71.08304},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01493", "filterId": "MOD-PM-01493", "displayId": "MOD-PM-01493", "name": "Blue Hill Ave @ Dudley Square Plaza", "latitude": 42.324604, "longitude": -71.075412},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01494", "filterId": "MOD-PM-01494", "displayId": "MOD-PM-01494", "name": "Blue Hill Ave @ Southwood St", "latitude": 42.31797, "longitude": -71.07797},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01495", "filterId": "MOD-PM-01495", "displayId": "MOD-PM-01495", "name": "Blue Hill Ave @ Woodcliff St", "latitude": 42.31644, "longitude": -71.07824},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01491", "filterId": "MOD-PM-01491", "displayId": "MOD-PM-01491", "name": "Horatio Harris Park", "latitude": 42.318763, "longitude": -71.089615},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01550", "filterId": "MOD-PM-01550", "displayId": "MOD-PM-01550", "name": "Julian Street", "latitude": 42.319504, "longitude": -71.075321},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01549", "filterId": "MOD-PM-01549", "displayId": "MOD-PM-01549", "name": "Kroc Center", "latitude": 42.319041, "longitude": -71.069993},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01593", "filterId": "MOD-PM-01593", "displayId": "MOD-PM-01593", "name": "Blue Hill Ave @ Fayston St", "latitude": 42.31422, "longitude": -71.07889},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01548", "filterId": "MOD-PM-01548", "displayId": "MOD-PM-01548", "name": "Seaver and Walnut", "latitude": 42.3131943, "longitude": -71.0946088},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01592", "filterId": "MOD-PM-01592", "displayId": "MOD-PM-01592", "name": "Trotter Elementary", "latitude": 42.3153953, "longitude": -71.0877955},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01594", "filterId": "MOD-PM-01594", "displayId": "MOD-PM-01594", "name": "Elm Hill Ave and Wenonah St", "latitude": 42.31328138, "longitude": -71.0845827},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01595", "filterId": "MOD-PM-01595", "displayId": "MOD-PM-01595", "name": "Humboldt and Seaver", "latitude": 42.3101841, "longitude": -71.0919846},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01596", "filterId": "MOD-PM-01596", "displayId": "MOD-PM-01596", "name": "Forest St and Vine St", "latitude": 42.326659, "longitude": -71.0774723},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01597", "filterId": "MOD-PM-01597", "displayId": "MOD-PM-01597", "name": "Ruthven and Humboldt", "latitude": 42.3127867, "longitude": -71.0901441},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01598", "filterId": "MOD-PM-01598", "displayId": "MOD-PM-01598", "name": "Ceylon Park", "latitude": 42.3098042, "longitude": -71.0733483},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01599", "filterId": "MOD-PM-01599", "displayId": "MOD-PM-01599", "name": "Elm Hill Park", "latitude": 42.3130327, "longitude": -71.0819107},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01600", "filterId": "MOD-PM-01600", "displayId": "MOD-PM-01600", "name": "Normandy St near Geneva Ave", "latitude": 42.3084003, "longitude": -71.081064},
  {"group": "Air Quality Sensors", "id": "air:MOD-PM-01601", "filterId": "MOD-PM-01601", "displayId": "MOD-PM-01601", "name": "Marshfield St and Batchelder St", "latitude": 42.3227283, "longitude": -71.0692903},
  {"group": "Noise Sensors", "id": "noise:1", "filterId": "1", "displayId": "Noise Sensor 1", "name": "Seaver st & Tiffany Moore Tot Park", "latitude": 42.309, "longitude": -71.091},
  {"group": "Noise Sensors", "id": "noise:2", "filterId": "2", "displayId": "Noise Sensor 2", "name": "Blue Hill @ Seaver St", "latitude": 42.3050352, "longitude": -71.0848431},
  {"group": "Noise Sensors", "id": "noise:3", "filterId": "3", "displayId": "Noise Sensor 3", "name": "Dudley @ Fcottage", "latitude": 42.3214532, "longitude": -71.0721814},
  {"group": "Noise Sensors", "id": "noise:4", "filterId": "4", "displayId": "Noise Sensor 4", "name": "Dudley @ Blue Hill (Dudley Commons)", "latitude": 42.3248193, "longitude": -71.0750074},
  {"group": "Noise Sensors", "id": "noise:5", "filterId": "5", "displayId": "Noise Sensor 5", "name": "George @ Shirley", "latitude": 42.3238184, "longitude": -71.0711447},
  {"group": "Noise Sensors", "id": "noise:6", "filterId": "6", "displayId": "Noise Sensor 6", "name": "Waverly @ Warren", "latitude": 42.3214453, "longitude": -71.082034},
  {"group": "Noise Sensors", "id": "noise:7", "filterId": "7", "displayId": "Noise Sensor 7", "name": "Kroc Centre", "latitude": 42.319003, "longitude": -71.0699431},
  {"group": "Noise Sensors", "id": "noise:8", "filterId": "8", "displayId": "Noise Sensor 8", "name": "Magnolia @ Lingard", "latitude": 42.3166749, "longitude": -71.0707997},
  {"group": "Noise Sensors", "id": "noise:10", "filterId": "10", "displayId": "Noise Sensor 10", "name": "Magnolia @ Wayland", "latitude": 42.314058, "longitude": -71.0720164},
  {"group": "Noise Sensors", "id": "noise:11", "filterId": "11", "displayId": "Noise Sensor 11", "name": "Hollander st", "latitude": 42.3157997, "longitude": -71.0887256},
  {"group": "Noise Sensors", "id": "noise:12", "filterId": "12", "displayId": "Noise Sensor 12", "name": "Blue Hill @ Maywood", "latitude": 42.316419, "longitude": -71.0781852},
  {"group": "Noise Sensors", "id": "noise:13", "filterId": "13", "displayId": "Noise Sensor 13", "name": "Blue Hill @ Quincy", "latitude": 42.3141877, "longitude": -71.0789912},
  {"group": "Noise Sensors", "id": "noise:15", "filterId": "15", "displayId": "Noise Sensor 15", "name": "Moreland st @ learning together day care", "latitude": 42.3255823, "longitude": -71.0817659},
  {"group": "Noise Sensors", "id": "noise:16", "filterId": "16", "displayId": "Noise Sensor 16", "name": "Warren @ Townsend/Quincy", "latitude": 42.3164061, "longitude": -71.0826839},
  {"group": "Noise Sensors", "id": "noise:17", "filterId": "17", "displayId": "Noise Sensor 17", "name": "Sargent st", "latitude": 42.3152962, "longitude": -71.073893},
  {"group": "Noise Sensors", "id": "noise:18", "filterId": "18", "displayId": "Noise Sensor 18", "name": "Elm Hill Ave", "latitude": 42.3082767, "longitude": -71.0886139},
  {"group": "Noise Sensors", "id": "noise:19", "filterId": "19", "displayId": "Noise Sensor 19", "name": "Quincy @ Dacia", "latitude": 42.3142633, "longitude": -71.0780641},
  {"group": "Noise Sensors", "id": "noise:20", "filterId": "20", "displayId": "Noise Sensor 20", "name": "Schuyler st", "latitude": 42.3086645, "longitude": -71.0858625},
  {"group": "Noise Sensors", "id": "noise:21", "filterId": "21", "displayId": "Noise Sensor 21", "name": "Blue Hill @ Columbia Road", "latitude": 42.303987, "longitude": -71.084942},
  {"group": "Noise Sensors", "id": "noise:22", "filterId": "22", "displayId": "Noise Sensor 22", "name": "Sonoma St", "latitude": 42.308337, "longitude": -71.0870204},
  {"group": "Noise Sensors", "id": "noise:23", "filterId": "23", "displayId": "Noise Sensor 23", "name": "Freedom House Warren St", "latitude": 42.3108226, "longitude": -71.0832951},
  {"group": "Noise Sensors", "id": "noise:24", "filterId": "24", "displayId": "Noise Sensor 24", "name": "Samuel W. Mason Elementary", "latitude": 42.3261204, "longitude": -71.0706918},
  {"group": "Noise Sensors", "id": "noise:25", "filterId": "25", "displayId": "Noise Sensor 25", "name": "Geneva @ Blue Hill", "latitude": 42.3088432, "longitude": -71.0828049},
  {"group": "Noise Sensors", "id": "noise:26", "filterId": "26", "displayId": "Noise Sensor 26", "name": "Franklin Park", "latitude": 42.3046873, "longitude": -71.0955525},
  {"group": "Noise Sensors", "id": "noise:27", "filterId": "27", "displayId": "Noise Sensor 27", "name": "Dunreath St", "latitude": 42.3232051, "longitude": -71.0805673},
  {"group": "Noise Sensors", "id": "noise:28", "filterId": "28", "displayId": "Noise Sensor 28", "name": "Other Dudley Commons", "latitude": 42.3267352, "longitude": -71.0755563},
  {"group": "Noise Sensors", "id": "noise:29", "filterId": "29", "displayId": "Noise Sensor 29", "name": "Langdon St Farm", "latitude": 42.3243402, "longitude": -71.0723826},
  {"group": "Noise Sensors", "id": "noise:30", "filterId": "30", "displayId": "Noise Sensor 30", "name": "E. Cottage & Batchelder St", "latitude": 42.32156, "longitude": -71.06928},
  {"group": "Noise Sensors", "id": "noise:32", "filterId": "32", "displayId": "Noise Sensor 32", "name": "Normandy and Stanwood", "latitude": 42.30926, "longitude": -71.08027},
  {"group": "Noise Sensors", "id": "noise:33", "filterId": "33", "displayId": "Noise Sensor 33", "name": "Weldon St and Gannet St", "latitude": 42.31487, "longitude": -71.08192},
  {"group": "Noise Sensors", "id": "noise:34", "filterId": "34", "displayId": "Noise Sensor 34", "name": "Homestead and Harold", "latitude": 42.31285, "longitude": -71.09263},
  {"group": "Noise Sensors", "id": "noise:35", "filterId": "35", "displayId": "Noise Sensor 35", "name": "Ruthven and Humboldt", "latitude": 42.31267, "longitude": -71.09006},
  {"group": "Noise Sensors", "id": "noise:36", "filterId": "36", "displayId": "Noise Sensor 36", "name": "Waumbeck and Warren", "latitude": 42.3133, "longitude": -71.0837},
  {"group": "Noise Sensors", "id": "noise:37", "filterId": "37", "displayId": "Noise Sensor 37", "name": "Crawford (behind Crispus Attucks Children Center)", "latitude": 42.31387, "longitude": -71.09082},
  {"group": "Noise Sensors", "id": "noise:38", "filterId": "38", "displayId": "Noise Sensor 38", "name": "Elm Hill and Crawford", "latitude": 42.311667, "longitude": -71.085833},
  {"group": "Noise Sensors", "id": "noise:39", "filterId": "39", "displayId": "Noise Sensor 39", "name": "Batchelder and Marshfield", "latitude": 42.322778, "longitude": -71.069167},
  {"group": "Noise Sensors", "id": "noise:40", "filterId": "40", "displayId": "Noise Sensor 40", "name": "Hampden and Eustis", "latitude": 42.326944, "longitude": -71.075278},
  {"group": "Noise Sensors", "id": "noise:41", "filterId": "41", "displayId": "Noise Sensor 41", "name": "Forest St and Vine St", "latitude": 42.32667, "longitude": -71.0775},
  {"group": "Noise Sensors", "id": "noise:43", "filterId": "43", "displayId": "Noise Sensor 43", "name": "W.Cottage and Brook", "latitude": 42.32069, "longitude": -71.07425},
  {"group": "Noise Sensors", "id": "noise:44", "filterId": "44", "displayId": "Noise Sensor 44", "name": "Washington St and Bishop Joe L. Smith", "latitude": 42.3062, "longitude": -71.08143},
  {"group": "Noise Sensors", "id": "noise:45", "filterId": "45", "displayId": "Noise Sensor 45", "name": "Children's Park (Intervale and Normandy)", "latitude": 42.31067, "longitude": -71.07822},
  {"group": "Noise Sensors", "id": "noise:46", "filterId": "46", "displayId": "Noise Sensor 46", "name": "Bynoe Park", "latitude": 42.329, "longitude": -71.076},
  {"group": "Noise Sensors", "id": "noise:47", "filterId": "47", "displayId": "Noise Sensor 47", "name": "Elm Hill and Cheney", "latitude": 42.31047, "longitude": -71.08691},
  {"group": "Noise Sensors", "id": "noise:48", "filterId": "48", "displayId": "Noise Sensor 48", "name": "Quincy and Magnolia", "latitude": 42.31227, "longitude": -71.07349},
  {"group": "Noise Sensors", "id": "noise:49", "filterId": "49", "displayId": "Noise Sensor 49", "name": "Moreland St, Howes Playground", "latitude": 42.32404, "longitude": -71.07928},
  {"group": "Noise Sensors", "id": "noise:50", "filterId": "50", "displayId": "Noise Sensor 50", "name": "Warren Pl", "latitude": 42.32787, "longitude": -71.082},
  {"group": "Noise Sensors", "id": "noise:51", "filterId": "51", "displayId": "Noise Sensor 51", "name": "Normandy and Seaver", "latitude": 42.30499, "longitude": -71.08363},
  {"group": "Noise Sensors", "id": "noise:52", "filterId": "52", "displayId": "Noise Sensor 52", "name": "Winthrop Playground", "latitude": 42.31742, "longitude": -71.07608},
  {"group": "Noise Sensors", "id": "noise:53", "filterId": "53", "displayId": "Noise Sensor 53", "name": "Dennis St Park", "latitude": 42.32258, "longitude": -71.07489},
  {"group": "Noise Sensors", "id": "noise:54", "filterId": "54", "displayId": "Noise Sensor 54", "name": "Freedom House Warren St", "latitude": 42.3108226, "longitude": -71.0832951},
  {"group": "Noise Sensors", "id": "noise:55", "filterId": "55", "displayId": "Noise Sensor 55", "name": "Fayston and Perth", "latitude": 42.31298, "longitude": -71.07653},
  {"group": "Noise Sensors", "id": "noise:9", "filterId": "9", "displayId": "Noise Sensor 9", "name": "Savin & Tupelo", "latitude": 42.3167, "longitude": -71.08095},
  {"group": "Heat Sensors", "id": "heat:1", "filterId": "1", "displayId": "Heat Sensor 1", "name": "Seaver st & Tiffany Moore Tot Park", "latitude": 42.309, "longitude": -71.091},
  {"group": "Heat Sensors", "id": "heat:2", "filterId": "2", "displayId": "Heat Sensor 2", "name": "Blue Hill @ Seaver St", "latitude": 42.3050352, "longitude": -71.0848431},
  {"group": "Heat Sensors", "id": "heat:3", "filterId": "3", "displayId": "Heat Sensor 3", "name": "Dudley @ Fcottage", "latitude": 42.3214532, "longitude": -71.0721814},
  {"group": "Heat Sensors", "id": "heat:4", "filterId": "4", "displayId": "Heat Sensor 4", "name": "Dudley @ Blue Hill (Dudley Commons)", "latitude": 42.3248193, "longitude": -71.0750074},
  {"group": "Heat Sensors", "id": "heat:5", "filterId": "5", "displayId": "Heat Sensor 5", "name": "George @ Shirley", "latitude": 42.3238184, "longitude": -71.0711447},
  {"group": "Heat Sensors", "id": "heat:6", "filterId": "6", "displayId": "Heat Sensor 6", "name": "Waverly @ Warren", "latitude": 42.3214453, "longitude": -71.082034},
  {"group": "Heat Sensors", "id": "heat:7", "filterId": "7", "displayId": "Heat Sensor 7", "name": "Kroc Centre", "latitude": 42.319003, "longitude": -71.0699431},
  {"group": "Heat Sensors", "id": "heat:8", "filterId": "8", "displayId": "Heat Sensor 8", "name": "Magnolia @ Lingard", "latitude": 42.3166749, "longitude": -71.0707997},
  {"group": "Heat Sensors", "id": "heat:10", "filterId": "10", "displayId": "Heat Sensor 10", "name": "Magnolia @ Wayland", "latitude": 42.314058, "longitude": -71.0720164},
  {"group": "Heat Sensors", "id": "heat:11", "filterId": "11", "displayId": "Heat Sensor 11", "name": "Hollander st", "latitude": 42.3157997, "longitude": -71.0887256},
  {"group": "Heat Sensors", "id": "heat:12", "filterId": "12", "displayId": "Heat Sensor 12", "name": "Blue Hill @ Maywood", "latitude": 42.316419, "longitude": -71.0781852},
  {"group": "Heat Sensors", "id": "heat:13", "filterId": "13", "displayId": "Heat Sensor 13", "name": "Blue Hill @ Quincy", "latitude": 42.3141877, "longitude": -71.0789912},
  {"group": "Heat Sensors", "id": "heat:15", "filterId": "15", "displayId": "Heat Sensor 15", "name": "Moreland st @ learning together day care", "latitude": 42.3255823, "longitude": -71.0817659},
  {"group": "Heat Sensors", "id": "heat:16", "filterId": "16", "displayId": "Heat Sensor 16", "name": "Warren @ Townsend/Quincy", "latitude": 42.3164061, "longitude": -71.0826839},
  {"group": "Heat Sensors", "id": "heat:17", "filterId": "17", "displayId": "Heat Sensor 17", "name": "Sargent st", "latitude": 42.3152962, "longitude": -71.073893},
  {"group": "Heat Sensors", "id": "heat:18", "filterId": "18", "displayId": "Heat Sensor 18", "name": "Elm Hill Ave", "latitude": 42.3082767, "longitude": -71.0886139},
  {"group": "Heat Sensors", "id": "heat:19", "filterId": "19", "displayId": "Heat Sensor 19", "name": "Quincy @ Dacia", "latitude": 42.3142633, "longitude": -71.0780641},
  {"group": "Heat Sensors", "id": "heat:20", "filterId": "20", "displayId": "Heat Sensor 20", "name": "Schuyler st", "latitude": 42.3086645, "longitude": -71.0858625},
  {"group": "Heat Sensors", "id": "heat:21", "filterId": "21", "displayId": "Heat Sensor 21", "name": "Blue Hill @ Columbia Road", "latitude": 42.303987, "longitude": -71.084942},
  {"group": "Heat Sensors", "id": "heat:22", "filterId": "22", "displayId": "Heat Sensor 22", "name": "Sonoma St", "latitude": 42.308337, "longitude": -71.0870204},
  {"group": "Heat Sensors", "id": "heat:23", "filterId": "23", "displayId": "Heat Sensor 23", "name": "Freedom House Warren St", "latitude": 42.3108226, "longitude": -71.0832951},
  {"group": "Heat Sensors", "id": "heat:24", "filterId": "24", "displayId": "Heat Sensor 24", "name": "Samuel W. Mason Elementary", "latitude": 42.3261204, "longitude": -71.0706918},
  {"group": "Heat Sensors", "id": "heat:25", "filterId": "25", "displayId": "Heat Sensor 25", "name": "Geneva @ Blue Hill", "latitude": 42.3088432, "longitude": -71.0828049},
  {"group": "Heat Sensors", "id": "heat:26", "filterId": "26", "displayId": "Heat Sensor 26", "name": "Franklin Park", "latitude": 42.3046873, "longitude": -71.0955525},
  {"group": "Heat Sensors", "id": "heat:27", "filterId": "27", "displayId": "Heat Sensor 27", "name": "Dunreath St", "latitude": 42.3232051, "longitude": -71.0805673},
  {"group": "Heat Sensors", "id": "heat:28", "filterId": "28", "displayId": "Heat Sensor 28", "name": "Other Dudley Commons", "latitude": 42.3267352, "longitude": -71.0755563},
  {"group": "Heat Sensors", "id": "heat:29", "filterId": "29", "displayId": "Heat Sensor 29", "name": "Langdon St Farm", "latitude": 42.3243402, "longitude": -71.0723826},
  {"group": "Heat Sensors", "id": "heat:30", "filterId": "30", "displayId": "Heat Sensor 30", "name": "E. Cottage & Batchelder St", "latitude": 42.32156, "longitude": -71.06928},
  {"group": "Heat Sensors", "id": "heat:32", "filterId": "32", "displayId": "Heat Sensor 32", "name": "Normandy and Stanwood", "latitude": 42.30926, "longitude": -71.08027},
  {"group": "Heat Sensors", "id": "heat:33", "filterId": "33", "displayId": "Heat Sensor 33", "name": "Weldon St and Gannet St", "latitude": 42.31487, "longitude": -71.08192},
  {"group": "Heat Sensors", "id": "heat:34", "filterId": "34", "displayId": "Heat Sensor 34", "name": "Homestead and Harold", "latitude": 42.31285, "longitude": -71.09263},
  {"group": "Heat Sensors", "id": "heat:35", "filterId": "35", "displayId": "Heat Sensor 35", "name": "Ruthven and Humboldt", "latitude": 42.31267, "longitude": -71.09006},
  {"group": "Heat Sensors", "id": "heat:36", "filterId": "36", "displayId": "Heat Sensor 36", "name": "Waumbeck and Warren", "latitude": 42.3133, "longitude": -71.0837},
  {"group": "Heat Sensors", "id": "heat:37", "filterId": "37", "displayId": "Heat Sensor 37", "name": "Crawford (behind Crispus Attucks Children Center)", "latitude": 42.31387, "longitude": -71.09082},
  {"group": "Heat Sensors", "id": "heat:38", "filterId": "38", "displayId": "Heat Sensor 38", "name": "Elm Hill and Crawford", "latitude": 42.311667, "longitude": -71.085833},
  {"group": "Heat Sensors", "id": "heat:39", "filterId": "39", "displayId": "Heat Sensor 39", "name": "Batchelder and Marshfield", "latitude": 42.322778, "longitude": -71.069167},
  {"group": "Heat Sensors", "id": "heat:40", "filterId": "40", "displayId": "Heat Sensor 40", "name": "Hampden and Eustis", "latitude": 42.326944, "longitude": -71.075278},
  {"group": "Heat Sensors", "id": "heat:41", "filterId": "41", "displayId": "Heat Sensor 41", "name": "Forest St and Vine St", "latitude": 42.32667, "longitude": -71.0775},
  {"group": "Heat Sensors", "id": "heat:43", "filterId": "43", "displayId": "Heat Sensor 43", "name": "W.Cottage and Brook", "latitude": 42.32069, "longitude": -71.07425},
  {"group": "Heat Sensors", "id": "heat:44", "filterId": "44", "displayId": "Heat Sensor 44", "name": "Washington St and Bishop Joe L. Smith", "latitude": 42.3062, "longitude": -71.08143},
  {"group": "Heat Sensors", "id": "heat:45", "filterId": "45", "displayId": "Heat Sensor 45", "name": "Children's Park (Intervale and Normandy)", "latitude": 42.31067, "longitude": -71.07822},
  {"group": "Heat Sensors", "id": "heat:46", "filterId": "46", "displayId": "Heat Sensor 46", "name": "Bynoe Park", "latitude": 42.329, "longitude": -71.076},
  {"group": "Heat Sensors", "id": "heat:47", "filterId": "47", "displayId": "Heat Sensor 47", "name": "Elm Hill and Cheney", "latitude": 42.31047, "longitude": -71.08691},
  {"group": "Heat Sensors", "id": "heat:48", "filterId": "48", "displayId": "Heat Sensor 48", "name": "Quincy and Magnolia", "latitude": 42.31227, "longitude": -71.07349},
  {"group": "Heat Sensors", "id": "heat:49", "filterId": "49", "displayId": "Heat Sensor 49", "name": "Moreland St, Howes Playground", "latitude": 42.32404, "longitude": -71.07928},
  {"group": "Heat Sensors", "id": "heat:50", "filterId": "50", "displayId": "Heat Sensor 50", "name": "Warren Pl", "latitude": 42.32787, "longitude": -71.082},
  {"group": "Heat Sensors", "id": "heat:51", "filterId": "51", "displayId": "Heat Sensor 51", "name": "Normandy and Seaver", "latitude": 42.30499, "longitude": -71.08363},
  {"group": "Heat Sensors", "id": "heat:52", "filterId": "52", "displayId": "Heat Sensor 52", "name": "Winthrop Playground", "latitude": 42.31742, "longitude": -71.07608},
  {"group": "Heat Sensors", "id": "heat:53", "filterId": "53", "displayId": "Heat Sensor 53", "name": "Dennis St Park", "latitude": 42.32258, "longitude": -71.07489},
  {"group": "Heat Sensors", "id": "heat:54", "filterId": "54", "displayId": "Heat Sensor 54", "name": "Freedom House Warren St", "latitude": 42.3108226, "longitude": -71.0832951},
  {"group": "Heat Sensors", "id": "heat:55", "filterId": "55", "displayId": "Heat Sensor 55", "name": "Fayston and Perth", "latitude": 42.31298, "longitude": -71.07653},
  {"group": "Heat Sensors", "id": "heat:9", "filterId": "9", "displayId": "Heat Sensor 9", "name": "Savin & Tupelo", "latitude": 42.3167, "longitude": -71.08095},
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
const remoteSensorCatalogSources = [
  { namespace: "aq", kinds: ["air"], label: "Air Quality Sensors" },
  { namespace: "nu", kinds: ["heat", "noise"], label: "Neighborhood Unit Sensors" },
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
    healthEffect: "Fatigue is possible with prolonged exposure and/or physical activity.",
    recommendation: "Limit your time outdoors; stay well-hydrated; drink 10 gulps every 20 minutes.",
  },
  {
    label: "Extreme Caution",
    shortLabel: "Extreme",
    min: 90,
    max: 103,
    color: "#edd365",
    className: "hi-extreme-caution-cell",
    healthEffect: "Sunstroke, heat cramps, and heat exhaustion are possible with prolonged exposure and/or physical activity.",
    recommendation: "Limit strenuous outdoor activity; limit your time outdoors; stay well-hydrated; drink 10 gulps every 20 minutes.",
  },
  {
    label: "Danger",
    shortLabel: "Danger",
    min: 103,
    max: 125,
    color: "#d1763d",
    className: "hi-danger-cell",
    healthEffect: "Sunstroke, heat cramps, and heat exhaustion are likely. Heat stroke is possible with prolonged exposure and/or physical activity.",
    recommendation: "Avoid strenuous outdoor activity; stay indoors in an air-conditioned facility; stay well-hydrated; drink 10 gulps every 20 minutes.",
  },
  {
    label: "Extreme Danger",
    shortLabel: "Extreme",
    min: 125,
    max: Infinity,
    color: "#b03227",
    className: "hi-extreme-danger-cell",
    healthEffect: "Heat stroke or sunstroke is highly likely with continued exposure.",
    recommendation: "Avoid strenuous outdoor activity; stay indoors in an air-conditioned facility; stay well-hydrated; drink 10 gulps every 20 minutes; check on your family, friends, and neighbors.",
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
      {
        label: "Good",
        detail: "0-9",
        min: 0,
        max: 9.1,
        color: "#008334",
        recommendation: "Air quality is satisfactory, and air pollution poses little or no risk.",
      },
      {
        label: "Moderate",
        detail: "9.1-35.4",
        min: 9.1,
        max: 35.5,
        color: "#ffa331",
        recommendation: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
      },
      {
        label: "Unhealthy for Sensitive Groups",
        detail: "35.5-55.4",
        min: 35.5,
        max: 55.5,
        color: "#ff6523",
        recommendation: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
      },
      {
        label: "Unhealthy",
        detail: "55.5-125.4",
        min: 55.5,
        max: 125.5,
        color: "#ee1e1e",
        recommendation: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
      },
      {
        label: "Very Unhealthy",
        detail: "125.5-225.4",
        min: 125.5,
        max: 225.5,
        color: "#612e61",
        recommendation: "Health alert: The risk of health effects is increased for everyone.",
      },
      {
        label: "Hazardous",
        detail: ">=225.5",
        min: 225.5,
        max: Infinity,
        color: "#660e10",
        recommendation: "Health warning of emergency conditions: everyone is more likely to be affected.",
      },
    ],
  },
  pm10: {
    title: "PM10",
    note: "PM10 colors follow U.S. EPA Air Quality Index categories for daily average PM10 concentrations.",
    noDataColor: "#ffffff",
    bands: [
      {
        label: "Good",
        detail: "0-54",
        min: 0,
        max: 55,
        color: "#008636",
        recommendation: "Air quality is satisfactory, and air pollution poses little or no risk.",
      },
      {
        label: "Moderate",
        detail: "55-154",
        min: 55,
        max: 155,
        color: "#ffa52f",
        recommendation: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
      },
      {
        label: "Unhealthy for Sensitive Groups",
        detail: "155-254",
        min: 155,
        max: 255,
        color: "#ff6221",
        recommendation: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
      },
      {
        label: "Unhealthy",
        detail: "255-354",
        min: 255,
        max: 355,
        color: "#e41f21",
        recommendation: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
      },
      {
        label: "Very Unhealthy",
        detail: "355-424",
        min: 355,
        max: 425,
        color: "#62346c",
        recommendation: "Health alert: The risk of health effects is increased for everyone.",
      },
      {
        label: "Hazardous",
        detail: ">=425",
        min: 425,
        max: Infinity,
        color: "#691011",
        recommendation: "Health warning of emergency conditions: everyone is more likely to be affected.",
      },
    ],
  },
  heat: {
    title: "Heat Index",
    note: "Heat Index colors use daily cluster averages and follow NOAA's NWS HI thresholds: <80°F, 80-90°F, 90-103°F, 103-124°F, and 125°F+.",
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
      healthEffect: band.healthEffect,
      recommendation: band.recommendation,
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

function sensorListUrl(namespace) {
  return `${sensorDataApiBaseUrl}/${namespace}/sensors-list`;
}

function sensorReadingsUrl(namespace) {
  return `${sensorDataApiBaseUrl}/${namespace}/readings`;
}

function sensorDisplayId(kind, filterId) {
  if (kind === "air") return `AQ Sensor ${filterId}`;
  if (kind === "noise") return `Noise Sensor ${filterId}`;
  if (kind === "heat") return `Heat Sensor ${filterId}`;
  return `Sensor ${filterId}`;
}

function normalizeSensorName(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fallbackSensorDetails(kind, filterId, name) {
  const normalizedName = normalizeSensorName(name);
  return builtInSensorCatalog.find((sensor) => {
    const sensorKind = sensor.id.split(":")[0];
    return sensorKind === kind && sensor.filterId === filterId;
  }) || builtInSensorCatalog.find((sensor) => {
    const sensorKind = sensor.id.split(":")[0];
    return sensorKind === kind && normalizedName && normalizeSensorName(sensor.name) === normalizedName;
  }) || null;
}

function legacyApiLocationIdForSensor(sensorOrSelection) {
  const kind = String(sensorOrSelection.id || "").split(":")[0];
  if (kind !== "air") return "";
  return legacyAqLocationIdByFilterId[sensorOrSelection.filterId] || "";
}

function normalizeRemoteSensorCatalog(payload, source) {
  const sensors = Array.isArray(payload?.sensors) ? payload.sensors : (Array.isArray(payload) ? payload : []);
  return sensors.flatMap((sensor) => {
    const filterId = cleanSensorId(sensor.location_id ?? sensor.id ?? sensor.locationId);
    if (!filterId) return [];
    const name = cleanText(sensor.location_address || sensor.location || sensor.name || sensor.address);
    return source.kinds.map((kind) => {
      const fallback = fallbackSensorDetails(kind, filterId, name);
      return {
        group: kind === "air" ? "Air Quality Sensors" : kind === "heat" ? "Heat Sensors" : "Noise Sensors",
        id: `${kind}:${filterId}`,
        filterId,
        apiLocationId: filterId,
        displayId: sensorDisplayId(kind, filterId),
        name,
        latitude: toNumber(sensor.latitude ?? sensor.lat) ?? fallback?.latitude ?? null,
        longitude: toNumber(sensor.longitude ?? sensor.lon ?? sensor.lng) ?? fallback?.longitude ?? null,
      };
    });
  });
}

async function loadRemoteSensorCatalog() {
  const catalogGroups = await Promise.all(remoteSensorCatalogSources.map(async (source) => {
    try {
      const response = await fetch(sensorListUrl(source.namespace), { cache: "no-store" });
      if (!response.ok) return [];
      return normalizeRemoteSensorCatalog(await response.json(), source);
    } catch {
      return [];
    }
  }));
  return catalogGroups.flat();
}

async function loadSensorCatalog() {
  const remoteCatalog = await loadRemoteSensorCatalog();
  if (remoteCatalog.length) {
    state.sensorCatalog = remoteCatalog;
    return;
  }

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
          apiLocationId: source.kind === "air" ? legacyAqLocationIdByFilterId[filterId] || "" : filterId,
          displayId: source.kind === "air" ? filterId : `${type} ${filterId}`,
          name: cleanText(row[source.nameField]),
          latitude: toNumber(row.Latitude),
          longitude: toNumber(row.Longitude),
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

function setDataStatus(message, tone = "neutral") {
  if (!els.dataStatus) return;
  els.dataStatus.textContent = message;
  els.dataStatus.classList.toggle("is-error", tone === "error");
  els.dataStatus.classList.toggle("is-success", tone === "success");
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

function monthDateRange() {
  const info = monthInfo();
  const month = String(info.month).padStart(2, "0");
  return {
    start: `${info.year}-${month}-01`,
    end: `${info.year}-${month}-${String(info.days).padStart(2, "0")}`,
  };
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

function metricDisplayHtml(metric) {
  return {
    air: "PM<sub>2.5</sub>",
    pm10: "PM<sub>10</sub>",
    heat: "Heat Index",
    noise: "Noise",
  }[metric] || "Sensor reading";
}

function metricTextHtml(value) {
  return escapeHtml(value)
    .replace(/PM2\.5/g, "PM<sub>2.5</sub>")
    .replace(/PM10/g, "PM<sub>10</sub>");
}

function filteredRows() {
  const { year, month } = monthInfo();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const selection = selectedLocation();
  const rows = state.rows.filter((row) => row.date.startsWith(prefix) && rowMatchesLocation(row, selection));
  return averageRowsByDate(rows);
}

function rowHasMetricValue(row, metric) {
  return row[metric] !== null && row[metric] !== undefined;
}

function rowMatchesMonth(row, startDate, endDate) {
  return row.date >= startDate && row.date <= endDate;
}

function selectedMetricRows() {
  const metric = els.calendarMetric.value;
  return filteredRows().filter((row) => row[metric] !== null && row[metric] !== undefined);
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
  return rowHasMetricValue(row, metric);
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
  if (state.dataSource !== "uploaded") return [];
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
      apiLocationId: sensor.apiLocationId || legacyApiLocationIdForSensor(sensor),
      value: locationValue("sensor", sensor.id),
      label: sensor.name ? `${sensor.name} - ${sensor.displayId}` : sensor.displayId,
      display: sensor.name ? `${sensor.name} (${sensor.displayId})` : sensor.displayId,
    }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function sensorLocationOptions() {
  const seen = new Set();
  return [...sensorOptionsFromCatalog(), ...sensorOptionsFromRows()].filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

function baseLocationOptions() {
  return [...sensorOptionsFromCatalog(), ...clusterOptionsFromRows(), ...sensorOptionsFromRows()];
}

function customClusterOptions(metric = selectedHazardMetric()) {
  return state.customClusters
    .filter((cluster) => cluster.metric === metric)
    .map((cluster) => ({
      kind: "custom",
      group: "Custom sensor clusters",
      id: cluster.id,
      filterId: cluster.id,
      value: locationValue("custom", cluster.id),
      label: `${cluster.name} (${plural(cluster.members.length, "sensor")})`,
      display: cluster.name,
      metric: cluster.metric,
      members: cluster.members,
    }));
}

function locationOptions() {
  return [...customClusterOptions(), ...baseLocationOptions()];
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

function reportLocationDisplay(value = els.location.value) {
  const location = selectedLocation(value, comparisonLocationOptions());
  const display = location.display || location.label || "Sensor Site";
  if (location.kind !== "sensor") return display;
  return display
    .replace(/\s+\([^()]*\)\s*$/u, "")
    .replace(/\s+-\s+[^-]+$/u, "")
    .trim() || display;
}

function rowMatchesLocation(row, selection) {
  if (selection.kind === "custom") {
    return (selection.members || []).some((memberValue) => rowMatchesLocation(row, selectedLocation(memberValue)));
  }
  if (selection.kind === "sensor") {
    return Boolean(row.locationValue && row.locationValue === selection.value) ||
      Boolean(row.sensorId && (row.sensorId === selection.filterId || row.sensorId === selection.id));
  }
  return row.cluster === selection.filterId;
}

function resolvePreferredLocation(preferredLocation, options) {
  if (options.some((option) => option.value === preferredLocation)) return preferredLocation;
  const legacyMatch = options.find((option) => option.id === preferredLocation || option.filterId === preferredLocation || option.label === preferredLocation);
  return legacyMatch?.value || equivalentSensorLocationValue(preferredLocation, options) || defaultLocationValue(options);
}

function equivalentSensorLocationValue(preferredLocation, options) {
  const selected = parseLocationValue(preferredLocation);
  if (selected.kind !== "sensor" || !selected.filterId) return "";
  return options.find((option) => {
    return option.kind === "sensor" &&
      option.filterId &&
      selected.filterId &&
      option.filterId === selected.filterId;
  })?.value || "";
}

function parseLocationValue(value) {
  const [kind, encodedId = ""] = String(value || "").split(":");
  const id = decodeURIComponent(encodedId);
  const [, filterId = id] = id.split(":");
  return { kind, id, filterId };
}

function defaultSensorFilterIdForMetric(metric = selectedHazardMetric()) {
  return defaultSensorFilterIdByMetric[metric] || "";
}

function defaultPreferredLocationValue() {
  return defaultSensorFilterIdForMetric() ? "" : "Sample Cluster 1";
}

function metricChangePreferredLocationValue() {
  return defaultSensorFilterIdForMetric() ? "" : els.location.value;
}

function defaultLocationValue(options) {
  const defaultSensorFilterId = defaultSensorFilterIdForMetric();
  if (defaultSensorFilterId) {
    return options.find((option) => option.kind === "sensor" && option.filterId === defaultSensorFilterId)?.value || options[0]?.value || "";
  }
  return options[0]?.value || "";
}

function updateClusterOptions(preferredCluster = els.location.value) {
  const options = locationOptions();
  populateClusterSelect(els.location, options);

  const selectedValue = resolvePreferredLocation(preferredCluster, options);
  if (!selectedValue) return;
  els.location.value = selectedValue;
  els.previewCluster.textContent = reportLocationDisplay(selectedValue);
  updateComparisonLocationOptions(selectedValue);
  renderCustomClusterBuilder();
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

function customClusterSensorOptions() {
  return sensorLocationOptions();
}

function setCustomClusterStatus(message = "", tone = "neutral") {
  if (!els.customClusterStatus) return;
  els.customClusterStatus.textContent = message;
  els.customClusterStatus.classList.toggle("is-error", tone === "error");
  els.customClusterStatus.classList.toggle("is-success", tone === "success");
}

function setCustomClusterNameError(hasError) {
  if (!els.customClusterName) return;
  els.customClusterName.classList.toggle("is-invalid", hasError);
  els.customClusterName.setAttribute("aria-invalid", String(hasError));
}

function renderGroupedOptions(select, options, placeholder) {
  if (!select) return;
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.append(empty);
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

function renderCustomClusterBuilder() {
  if (!els.customClusterSelect || !els.customClusterSelected) return;
  const options = customClusterSensorOptions();
  const optionValues = new Set(options.map((option) => option.value));
  state.customClusterDraftSensors = state.customClusterDraftSensors
    .filter((value, index, all) => optionValues.has(value) && all.indexOf(value) === index);

  const selectedValues = new Set(state.customClusterDraftSensors);
  renderGroupedOptions(
    els.customClusterSelect,
    options.filter((option) => !selectedValues.has(option.value)),
    "Choose a sensor",
  );

  els.customClusterSelected.innerHTML = "";
  state.customClusterDraftSensors.forEach((sensorValue) => {
    const option = selectedLocation(sensorValue);
    const chip = document.createElement("span");
    chip.className = "comparison-chip";
    const label = document.createElement("span");
    label.textContent = option.display || option.label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${option.display || option.label}`);
    remove.textContent = "x";
    remove.addEventListener("click", () => {
      state.customClusterDraftSensors = state.customClusterDraftSensors.filter((value) => value !== sensorValue);
      renderCustomClusterBuilder();
    });
    chip.append(label, remove);
    els.customClusterSelected.append(chip);
  });

  const name = cleanText(els.customClusterName?.value || "");
  const canAddSensor = Boolean(els.customClusterSelect.options.length > 1);
  if (name) setCustomClusterNameError(false);
  if (els.customClusterAddBtn) els.customClusterAddBtn.disabled = !canAddSensor;
  if (els.customClusterCreateBtn) els.customClusterCreateBtn.disabled = false;
  if (!state.customClusterDraftSensors.length) {
    setCustomClusterStatus("Select at least two sensors to create a cluster.");
  } else {
    setCustomClusterStatus(`${plural(state.customClusterDraftSensors.length, "sensor")} selected.`);
  }
}

function addCustomClusterDraftSensor() {
  const value = els.customClusterSelect?.value || "";
  if (!value || state.customClusterDraftSensors.includes(value)) return;
  state.customClusterDraftSensors = [...state.customClusterDraftSensors, value];
  if (els.customClusterSelect) els.customClusterSelect.value = "";
  renderCustomClusterBuilder();
}

function createCustomCluster() {
  const name = cleanText(els.customClusterName?.value || "");
  const missingName = !name;
  const missingSensors = state.customClusterDraftSensors.length < 2;
  setCustomClusterNameError(missingName);

  if (missingName || missingSensors) {
    if (missingName && missingSensors) {
      setCustomClusterStatus("Enter a sensor cluster name and select at least two sensors.", "error");
    } else if (missingName) {
      setCustomClusterStatus("Enter a sensor cluster name.", "error");
    } else {
      setCustomClusterStatus("Select at least two sensors to create a cluster.", "error");
    }
    if (missingName) els.customClusterName?.focus();
    return;
  }

  const cluster = {
    id: `custom-${state.customClusterCounter++}`,
    name,
    metric: els.calendarMetric.value,
    members: [...state.customClusterDraftSensors],
  };
  state.customClusters = [...state.customClusters, cluster];
  state.customClusterDraftSensors = [];
  if (els.customClusterName) els.customClusterName.value = "";
  setCustomClusterNameError(false);

  const customValue = locationValue("custom", cluster.id);
  updateClusterOptions(customValue);
  render();
  setCustomClusterStatus(`Created ${name}.`, "success");
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
  updateDataStatusForSelection();
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
  const selected = new Set(selectedComparisonLocations());
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
  state.comparisonLocationsEdited = true;
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

function primaryComparisonLocationValue(options, primaryLocation = els.location.value) {
  return resolvePreferredLocation(primaryLocation, options) || options[0]?.value || "";
}

function defaultComparisonLocations(options, primaryLocation = els.location.value) {
  const primaryValue = primaryComparisonLocationValue(options, primaryLocation);
  return primaryValue ? [primaryValue] : [];
}

function updateComparisonLocationOptions(primaryLocation = els.location.value) {
  const options = comparisonLocationOptions();
  const optionValues = new Set(options.map((option) => option.value));
  const previous = state.comparisonLocations
    .map((location) => resolvePreferredLocation(location, options))
    .filter((location, index, all) => optionValues.has(location) && all.indexOf(location) === index);
  const defaults = defaultComparisonLocations(options, primaryLocation);
  const next = state.comparisonLocationsEdited
    ? [...defaults, ...previous.filter((location) => !defaults.includes(location))]
    : defaults;
  state.comparisonLocations = next.slice(0, 8);
  renderComparisonLocationOptions();
}

function renderComparisonLocationOptions() {
  els.comparisonLocations.innerHTML = "";
  renderComparisonSelectOptions();
  renderComparisonSelected();
}

function renderComparisonSelectOptions() {
  if (!els.comparisonSelect) return;
  const options = comparisonLocationOptions();
  els.comparisonSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a sensor";
  els.comparisonSelect.append(placeholder);
  const groups = new Map();
  options.forEach((locationOption) => {
    if (!groups.has(locationOption.group)) {
      const group = document.createElement("optgroup");
      group.label = locationOption.group;
      groups.set(locationOption.group, group);
      els.comparisonSelect.append(group);
    }
    const group = groups.get(locationOption.group);
    const option = document.createElement("option");
    option.value = locationOption.value;
    option.textContent = locationOption.label;
    group.append(option);
  });
  els.comparisonSelect.value = "";
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
      state.comparisonLocationsEdited = true;
      state.comparisonLocations = state.comparisonLocations.filter((location) => location !== locationValueToRender);
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
  if (state.comparisonLocationsEdited) return selected.slice(0, 8);
  const defaults = defaultComparisonLocations(options);
  return [...defaults, ...selected.filter((location) => !defaults.includes(location))].slice(0, 8);
}

function comparisonSeries() {
  const metric = els.calendarMetric.value;
  return selectedComparisonLocations().map((locationValueToRead, index) => {
    const rows = monthRowsForLocation(locationValueToRead);
    const values = rows.filter((row) => row[metric] !== null && row[metric] !== undefined);
    const peak = values.length ? Math.max(...values.map((row) => row[metric])) : null;
    const average = values.length ? roundNumber(values.reduce((sum, row) => sum + row[metric], 0) / values.length) : null;
    return {
      key: locationValueToRead,
      cluster: reportLocationDisplay(locationValueToRead),
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
      if (row[key] !== null && row[key] !== undefined) max[key] = max[key] === null ? row[key] : Math.max(max[key], row[key]);
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

function renderStandardsGraphic(graphic, standard) {
  if (!graphic) return;
  graphic.innerHTML = "";
  graphic.className = `hi-legend standard-legend standard-legend-${standard.metric}`;
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

function renderStandards(metric) {
  const standard = metricStandards[metric] || metricStandards.composite;
  const renderStandard = { ...standard, metric };
  const title = document.getElementById("standardsTitle");
  if (title) title.innerHTML = metricTextHtml(renderStandard.title);
  renderStandardsGraphic(document.getElementById("standardsGraphic"), renderStandard);
  renderStandardsGraphic(document.getElementById("comparisonStandardsGraphic"), renderStandard);
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
  document.getElementById("heatmapNote").innerHTML = metricTextHtml((metricStandards[metric] || metricStandards.composite).note);

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

function trendChartScale(values, threshold, metric) {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (!finiteValues.length) {
    return { min: 0, max: Math.max(threshold || 0, 10) };
  }

  const dataMin = Math.min(...finiteValues);
  const dataMax = Math.max(...finiteValues);
  const includeThreshold = Number.isFinite(threshold) &&
    threshold >= dataMin - Math.max(5, (dataMax - dataMin) * 0.35) &&
    threshold <= dataMax + Math.max(5, (dataMax - dataMin) * 0.35);
  const rawMin = includeThreshold ? Math.min(dataMin, threshold) : dataMin;
  const rawMax = includeThreshold ? Math.max(dataMax, threshold) : dataMax;
  const rawRange = Math.max(1, rawMax - rawMin);
  const padding = Math.max(rawRange * 0.18, metric === "noise" ? 2 : 1);
  const step = rawRange > 80 ? 20 : rawRange > 30 ? 10 : rawRange > 12 ? 5 : 2;
  const min = Math.max(0, Math.floor((rawMin - padding) / step) * step);
  const max = Math.ceil((rawMax + padding) / step) * step;
  return { min, max: Math.max(max, min + step) };
}

function trendValueToY(value, scale, padding, plotH) {
  const range = scale.max - scale.min || 1;
  return padding.top + plotH - ((value - scale.min) / range) * plotH;
}

function drawStandardBands(ctx, metric, padding, plotW, plotH, scale) {
  const standard = metricStandards[metric];
  if (!standard) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(padding.left, padding.top, plotW, plotH);
  ctx.clip();

  standard.bands.forEach((band) => {
    const min = Number.isFinite(band.min) ? Math.max(scale.min, band.min) : scale.min;
    const max = Number.isFinite(band.max) ? Math.min(scale.max, band.max) : scale.max;
    if (max <= scale.min || min >= scale.max || max <= min) return;

    const yTop = trendValueToY(max, scale, padding, plotH);
    const yBottom = trendValueToY(min, scale, padding, plotH);
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
  const scale = trendChartScale(allValues, threshold, metric);
  const rowsByCluster = new Map(series.map((item) => [item.cluster, new Map(item.rows.map((row) => [Number(row.date.slice(-2)), row]))]));

  drawStandardBands(ctx, metric, padding, plotW, plotH, scale);

  ctx.strokeStyle = "#d3d8da";
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.muted;
  ctx.font = "20px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotH / 4) * i;
    const labelValue = scale.max - ((scale.max - scale.min) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(Math.round(labelValue)), padding.left - 14, y + 6);
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

  if (threshold && threshold >= scale.min && threshold <= scale.max) {
    const thresholdY = trendValueToY(threshold, scale, padding, plotH);
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
    ctx.fillText(`Threshold ${threshold} ${unit}`, padding.left + 12, thresholdY - 10);
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
      const y = trendValueToY(value, scale, padding, plotH);
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
      const y = trendValueToY(value, scale, padding, plotH);
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
    ctx.fillText(String(day), x, height - 28);
  }
  ctx.textAlign = "left";
  ctx.fillText("Day of month", padding.left, height - 10);

  if (!allValues.length) {
    ctx.fillStyle = colors.muted;
    ctx.font = "24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Load sensor data", width / 2, height / 2);
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
    <span>${metricDisplayHtml(metric)}</span>
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
  gradient.addColorStop(0, "#9fb5bd");
  gradient.addColorStop(1, "#f2b9ad");
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
  ctx.fillText("Grove Hall Sensor", width * 0.06, height * 0.88);
}

function sensorKind(sensor) {
  return sensor.id.split(":")[0];
}

function mapColorForSensor(sensor) {
  return sensorMapFillColors[sensorKind(sensor)] || colors.teal;
}

function highlightedFillColor() {
  return "#c13025";
}

function mappedSensorsForMetric() {
  return state.sensorCatalog.filter((sensor) => {
    return catalogSensorMatchesMetric(sensor) &&
      Number.isFinite(sensor.latitude) &&
      Number.isFinite(sensor.longitude);
  });
}

function selectedReportSensorIds() {
  const selections = state.template === "trends"
    ? selectedComparisonLocations().map((location) => comparisonOption(location))
    : [selectedLocation(els.location.value, comparisonLocationOptions())];
  const ids = selections.flatMap((selection) => {
    if (selection.kind === "sensor") return [selection.id];
    if (selection.kind === "custom") {
      return (selection.members || [])
        .map((memberValue) => selectedLocation(memberValue))
        .filter((member) => member.kind === "sensor")
        .map((member) => member.id);
    }
    return [];
  });
  return new Set(ids);
}

function selectedMappedSensors() {
  const selectedIds = selectedReportSensorIds();
  return mappedSensorsForMetric().filter((sensor) => selectedIds.has(sensor.id));
}

function sensorLocationValue(sensor) {
  return locationValue("sensor", sensor.id);
}

function updateSensorMapDetails(sensors, selected) {
  const selectedIds = new Set(selected.map((sensor) => sensor.id));
  els.sensorMapLegend.innerHTML = "";
  els.sensorMapList.innerHTML = "";

  const buildLegendSwatch = ({ kind, highlighted = false }) => {
    if ((kind === "air" || kind === "noise" || kind === "heat") && !highlighted) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("aria-hidden", "true");
      svg.classList.add("map-swatch-svg");
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", "50,5 90,27 90,73 50,95 10,73 10,27");
      polygon.setAttribute(
        "fill",
        sensorMapFillColors[kind] || colors.teal,
      );
      polygon.setAttribute("stroke", "#181b1f");
      polygon.setAttribute("stroke-width", "14");
      svg.append(polygon);
      return svg;
    }

    const swatch = document.createElement("i");
    swatch.className = `map-swatch map-swatch-${kind || "default"}`;
    if (highlighted) {
      swatch.className = "map-swatch map-swatch-highlighted";
      swatch.style.background = highlightedFillColor();
      swatch.style.border = "3px solid #181b1f";
      return swatch;
    }

    swatch.style.background = mapColorForSensor({ id: `${kind}:legend` });
    if (kind === "heat") {
      swatch.style.border = "3px solid #c13025";
    } else if (kind === "air") {
      swatch.style.border = "3px solid #181b1f";
    }
    return swatch;
  };

  const visibleKinds = Array.from(new Set(sensors.map(sensorKind)));
  visibleKinds.forEach((kind) => {
    const legendItem = document.createElement("span");
    const swatch = buildLegendSwatch({ kind });
    legendItem.append(swatch, document.createTextNode(`${kind === "air" ? "Air quality" : kind[0].toUpperCase() + kind.slice(1)} sensors`));
    els.sensorMapLegend.append(legendItem);
  });

  const highlightedLegend = document.createElement("span");
  const highlightedSwatch = buildLegendSwatch({ highlighted: true });
  highlightedLegend.append(highlightedSwatch, document.createTextNode("Highlighted in report"));
  els.sensorMapLegend.append(highlightedLegend);

  const listSensors = selected.length ? selected : sensors.slice(0, 8);
  listSensors.forEach((sensor) => {
    const item = document.createElement("li");
    item.textContent = `${sensor.name || sensor.displayId} - ${sensor.displayId}`;
    els.sensorMapList.append(item);
  });
  if (!selected.length) {
    const item = document.createElement("li");
    item.textContent = "No mapped report sensors selected; showing available sensors for this hazard.";
    els.sensorMapList.prepend(item);
  }
  return selectedIds;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lonToWorldX(lon, zoom) {
  return ((lon + 180) / 360) * 256 * (2 ** zoom);
}

function latToWorldY(lat, zoom) {
  const clampedLat = clamp(lat, -85.05112878, 85.05112878);
  const sinLat = Math.sin((clampedLat * Math.PI) / 180);
  return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * 256 * (2 ** zoom);
}

function worldYToLat(worldY, zoom) {
  const n = Math.PI - (2 * Math.PI * worldY) / (256 * (2 ** zoom));
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function worldToTile(value) {
  return Math.floor(value / 256);
}

function staticMapViewport(sensors, width, height, focusSensors = []) {
  const viewportSensors = focusSensors.length ? focusSensors : sensors;
  const minLat = Math.min(...viewportSensors.map((sensor) => sensor.latitude));
  const maxLat = Math.max(...viewportSensors.map((sensor) => sensor.latitude));
  const minLon = Math.min(...viewportSensors.map((sensor) => sensor.longitude));
  const maxLon = Math.max(...viewportSensors.map((sensor) => sensor.longitude));
  const paddedLatMin = minLat - Math.max((maxLat - minLat) * 0.12, 0.0016);
  const paddedLatMax = maxLat + Math.max((maxLat - minLat) * 0.12, 0.0016);
  const paddedLonMin = minLon - Math.max((maxLon - minLon) * 0.12, 0.0016);
  const paddedLonMax = maxLon + Math.max((maxLon - minLon) * 0.12, 0.0016);

  let zoom = 14;
  for (let candidate = 18; candidate >= 10; candidate -= 1) {
    const xSpan = lonToWorldX(paddedLonMax, candidate) - lonToWorldX(paddedLonMin, candidate);
    const ySpan = latToWorldY(paddedLatMin, candidate) - latToWorldY(paddedLatMax, candidate);
    if (xSpan <= width * 0.92 && ySpan <= height * 0.92) {
      zoom = candidate;
      break;
    }
  }

  const centerLat = (paddedLatMin + paddedLatMax) / 2;
  const centerLon = (paddedLonMin + paddedLonMax) / 2;
  const centerX = lonToWorldX(centerLon, zoom);
  const centerY = latToWorldY(centerLat, zoom);
  return {
    zoom,
    left: centerX - width / 2,
    top: centerY - height / 2,
    width,
    height,
  };
}

function drawSensorPrintMapFallback(ctx, width, height) {
  ctx.fillStyle = "#f2f3f3";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d6dadc";
  ctx.lineWidth = 1.5;
  for (let x = -height; x < width; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x + height, 0);
    ctx.stroke();
  }
  ctx.strokeStyle = "#e2e5e7";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 120) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function loadTileImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawHexagonPath(ctx, x, y, radius) {
  ctx.beginPath();
  for (let point = 0; point < 6; point += 1) {
    const angle = ((Math.PI / 3) * point) - (Math.PI / 2);
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (point === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function rectanglesOverlap(a, b, gap = 6) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

function labelCandidateFits(candidate, width, height, placedLabels) {
  const insideCanvas = candidate.x >= 8 &&
    candidate.y >= 8 &&
    candidate.x + candidate.width <= width - 8 &&
    candidate.y + candidate.height <= height - 38;
  if (!insideCanvas) return false;
  return !placedLabels.some((placed) => rectanglesOverlap(candidate, placed));
}

function labelOverlapScore(candidate, placedLabels) {
  return placedLabels.reduce((score, placed) => {
    const overlapW = Math.max(0, Math.min(candidate.x + candidate.width, placed.x + placed.width) - Math.max(candidate.x, placed.x));
    const overlapH = Math.max(0, Math.min(candidate.y + candidate.height, placed.y + placed.height) - Math.max(candidate.y, placed.y));
    return score + overlapW * overlapH;
  }, 0);
}

function drawHighlightedLabel(ctx, x, y, text, placedLabels = [], canvasWidth = 0, canvasHeight = 0) {
  const safeText = cleanText(text) || "Selected sensor";
  ctx.save();
  ctx.font = "700 15px Inter, sans-serif";
  const textWidth = ctx.measureText(safeText).width;
  const paddingX = 10;
  const labelW = textWidth + paddingX * 2;
  const labelH = 26;
  const offsets = [
    { dx: 16, dy: -34 },
    { dx: 16, dy: 12 },
    { dx: -labelW - 16, dy: -34 },
    { dx: -labelW - 16, dy: 12 },
    { dx: -labelW / 2, dy: -52 },
    { dx: -labelW / 2, dy: 24 },
    { dx: 26, dy: -64 },
    { dx: -labelW - 26, dy: -64 },
    { dx: 26, dy: 42 },
    { dx: -labelW - 26, dy: 42 },
  ];
  const candidates = offsets.map((offset) => ({
    x: x + offset.dx,
    y: y + offset.dy,
    width: labelW,
    height: labelH,
  }));
  const boundedCandidates = candidates.map((candidate) => ({
    ...candidate,
    x: clamp(candidate.x, 8, Math.max(8, canvasWidth - labelW - 8)),
    y: clamp(candidate.y, 8, Math.max(8, canvasHeight - labelH - 38)),
  }));
  const placement = boundedCandidates.find((candidate) => labelCandidateFits(candidate, canvasWidth, canvasHeight, placedLabels)) ||
    boundedCandidates
      .slice()
      .sort((a, b) => labelOverlapScore(a, placedLabels) - labelOverlapScore(b, placedLabels))[0];
  placedLabels.push(placement);

  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.strokeStyle = "rgba(24, 27, 31, 0.72)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(placement.x, placement.y, labelW, labelH, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#11151a";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(safeText, placement.x + paddingX, placement.y + labelH / 2);
  ctx.restore();
}

function drawSensorMarker(ctx, x, y, sensor, highlighted) {
  const kind = sensorKind(sensor);
  ctx.save();
  if (!highlighted && (kind === "heat" || kind === "air" || kind === "noise")) {
    drawHexagonPath(ctx, x, y, 10);
    ctx.fillStyle = sensorMapFillColors[kind] || colors.teal;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#181b1f";
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, highlighted ? 11 : 7, 0, Math.PI * 2);
    ctx.fillStyle = highlighted ? highlightedFillColor() : "#65737a";
    ctx.fill();
    ctx.lineWidth = highlighted ? 4 : 2.5;
    ctx.strokeStyle = highlighted ? "#181b1f" : "#ffffff";
    ctx.stroke();
  }
  if (highlighted) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function niceScaleDistance(meters) {
  if (!Number.isFinite(meters) || meters <= 0) return 100;
  const exponent = Math.floor(Math.log10(meters));
  const fraction = meters / (10 ** exponent);
  const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : 1;
  return niceFraction * (10 ** exponent);
}

function formatScaleDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  const kilometers = meters / 1000;
  return `${Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)} km`;
}

function drawMapScaleBar(ctx, viewport, width, height) {
  const centerLat = worldYToLat(viewport.top + height / 2, viewport.zoom);
  const metersPerPixel = Math.cos((centerLat * Math.PI) / 180) * 40075016.686 / (256 * (2 ** viewport.zoom));
  const targetPixels = width * 0.16;
  const distanceMeters = niceScaleDistance(targetPixels * metersPerPixel);
  const barWidth = Math.max(44, distanceMeters / metersPerPixel);
  const x = 28;
  const y = height - 54;
  const label = formatScaleDistance(distanceMeters);

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.strokeStyle = "rgba(24, 27, 31, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 12, y - 28, barWidth + 24, 46, 7);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#181b1f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barWidth, y);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 8);
  ctx.moveTo(x + barWidth, y - 8);
  ctx.lineTo(x + barWidth, y + 8);
  ctx.stroke();

  ctx.fillStyle = "#181b1f";
  ctx.font = "800 15px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, x + barWidth / 2, y - 10);
  ctx.restore();
}

function drawNorthArrow(ctx, width) {
  const x = width - 48;
  const y = 42;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.strokeStyle = "rgba(24, 27, 31, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 25, y - 27, 50, 66, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#181b1f";
  ctx.beginPath();
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x + 13, y + 13);
  ctx.lineTo(x, y + 7);
  ctx.lineTo(x - 13, y + 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y + 7);
  ctx.stroke();

  ctx.fillStyle = "#181b1f";
  ctx.font = "900 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("N", x, y + 17);
  ctx.restore();
}

async function renderStaticSensorPrintMap(sensors, selectedIds, focusSensors = []) {
  if (!els.sensorPrintMap) return;
  const renderId = state.sensorPrintMapRenderId + 1;
  state.sensorPrintMapRenderId = renderId;
  const canvas = els.sensorPrintMap;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!sensors.length) {
    drawSensorPrintMapFallback(ctx, width, height);
    ctx.fillStyle = "#626b76";
    ctx.font = "700 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No mapped sensors are available for this hazard.", width / 2, height / 2);
    return;
  }

  const viewport = staticMapViewport(sensors, width, height, focusSensors);
  const tileMinX = worldToTile(viewport.left);
  const tileMaxX = worldToTile(viewport.left + viewport.width);
  const tileMinY = worldToTile(viewport.top);
  const tileMaxY = worldToTile(viewport.top + viewport.height);
  const tileJobs = [];

  for (let tileX = tileMinX; tileX <= tileMaxX; tileX += 1) {
    for (let tileY = tileMinY; tileY <= tileMaxY; tileY += 1) {
      tileJobs.push({
        x: tileX * 256 - viewport.left,
        y: tileY * 256 - viewport.top,
        src: `${mapTileBaseUrl}/${viewport.zoom}/${tileX}/${tileY}.png`,
      });
    }
  }

  drawSensorPrintMapFallback(ctx, width, height);
  const loadedTiles = await Promise.all(tileJobs.map((job) => loadTileImage(job.src).then((image) => ({ ...job, image }))));
  if (renderId !== state.sensorPrintMapRenderId) return;
  loadedTiles.forEach((tile) => {
    if (tile.image) ctx.drawImage(tile.image, tile.x, tile.y, 256, 256);
  });

  const highlightedPoints = [];
  sensors.forEach((sensor) => {
    const highlighted = selectedIds.has(sensor.id);
    const x = lonToWorldX(sensor.longitude, viewport.zoom) - viewport.left;
    const y = latToWorldY(sensor.latitude, viewport.zoom) - viewport.top;
    drawSensorMarker(ctx, x, y, sensor, highlighted);
    if (highlighted) {
      highlightedPoints.push({ x, y, label: sensor.name || sensor.displayId || sensor.filterId || "Selected sensor" });
    }
  });

  const placedLabels = [];
  highlightedPoints.forEach((point) => {
    drawHighlightedLabel(ctx, point.x, point.y, point.label, placedLabels, width, height);
  });

  drawMapScaleBar(ctx, viewport, width, height);
  drawNorthArrow(ctx, width);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.fillRect(width - 482, height - 31, 472, 21);
  ctx.fillStyle = "#2f363c";
  ctx.font = "700 13px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Map tiles (c) CARTO, map data (c) OpenStreetMap contributors", width - 16, height - 16);
}

function renderSensorMap() {
  const pageIncluded = Boolean(els.includeMapPage?.checked);
  if (els.sensorMapPage) els.sensorMapPage.hidden = !pageIncluded;
  if (!pageIncluded || !els.sensorPrintMap) return;

  const sensors = mappedSensorsForMetric();
  const selected = selectedMappedSensors();
  const author = els.author.value.trim() || "Name";
  const reportDate = formatReportDate(els.reportDate.value) || currentReportDateLabel();

  els.sensorMapTitle.innerHTML = `${metricDisplayHtml(els.calendarMetric.value)} sensor locations`;
  els.sensorMapMeta.textContent = `Prepared by ${author} on ${reportDate}`;

  const selectedIds = updateSensorMapDetails(sensors, selected);
  state.sensorPrintMapPromise = renderStaticSensorPrintMap(sensors, selectedIds, selected);
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

function localDateParts(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
}

function currentDateInputValue(date = new Date()) {
  const { year, month, day } = localDateParts(date);
  return `${year}-${month}-${day}`;
}

function currentMonthInputValue(date = new Date()) {
  const { year, month } = localDateParts(date);
  return `${year}-${month}`;
}

function currentReportDateLabel() {
  return formatReportDate(currentDateInputValue());
}

function setCurrentPeriodDefaults() {
  const now = new Date();
  els.reportDate.value = currentDateInputValue(now);
  els.month.value = currentMonthInputValue(now);
}

function loadSampleData() {
  state.rows = sampleRows;
  state.dataSource = "sample";
  if (els.csvUpload) els.csvUpload.value = "";
  setDataStatus("Load data using the button above", "neutral");
  updateClusterOptions(defaultPreferredLocationValue());
  render();
}

function updateDataStatusForSelection() {
  const metric = els.calendarMetric.value;
  const apiConfig = sensorApiConfigForReportMetric(metric);
  const selection = selectedLocation();
  if (!apiConfig || !selectedLocationCanLoadSensorData(selection, metric) || selectedMetricRows().length) return;
  setDataStatus(`No loaded ${metricDisplay(metric)} readings for ${selection.display || selection.label}. Click Load sensor data for the selected month.`, "neutral");
}

function sensorApiConfigForReportMetric(metric) {
  return sensorApiMetricByReportMetric[metric] || null;
}

function selectedLocationCanLoadSensorData(selection, metric) {
  return Boolean(sensorApiConfigForReportMetric(metric) && apiLocationId(selection));
}

function apiLocationId(selection) {
  if (selection.apiLocationId) return String(selection.apiLocationId);
  const legacyLocationId = legacyApiLocationIdForSensor(selection);
  if (legacyLocationId) return legacyLocationId;
  const value = String(selection.filterId || selection.id || "").trim();
  return /^\d+$/.test(value) ? value : "";
}

function apiReadingDate(timestamp) {
  if (!timestamp) return "";
  const raw = String(timestamp).trim();
  const isoDate = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;
  return cleanDate(raw);
}

function apiReadingValue(reading, apiMetric) {
  const candidates = [apiMetric, "value", "reading", "avg", "average", "mean"];
  for (const key of candidates) {
    const value = toNumber(reading?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function buildApiReadingsUrl({ namespace, locationId, apiMetric, startDate, endDate, aggregation }) {
  const url = new URL(sensorReadingsUrl(namespace));
  url.searchParams.set("location_id", locationId);
  url.searchParams.set("metric", apiMetric);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("aggregation", aggregation || "1day");
  url.searchParams.set("_", String(Date.now()));
  return url.toString();
}

function apiLoadedDateSpan(rows) {
  const dates = rows.map((row) => row.date).filter(Boolean).sort();
  if (!dates.length) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? first : `${first} to ${last}`;
}

function blankMetricRow() {
  return {
    air: null,
    pm10: null,
    heat: null,
    noise: null,
  };
}

function normalizeApiRows(payload, { selection, apiConfig }) {
  const readings = Array.isArray(payload?.readings) ? payload.readings : (Array.isArray(payload) ? payload : []);
  const sensorId = String(payload?.location_id ?? selection.filterId ?? selection.id ?? "");
  const cluster = selection.display || selection.label || `Location ${sensorId}`;

  return readings.map((reading) => {
    const row = {
      date: apiReadingDate(reading.timestamp || reading.date || reading.time),
      cluster,
      sensorId,
      locationValue: selection.value,
      ...blankMetricRow(),
    };
    const value = apiReadingValue(reading, apiConfig.metric);
    row[apiConfig.rowKey] = value;
    return row;
  }).filter((row) => row.date && row[apiConfig.rowKey] !== null);
}

function mergeLoadedRows(nextRows, { selection, metric, startDate, endDate }) {
  const keptRows = state.rows.filter((row) => {
    if (!rowMatchesMonth(row, startDate, endDate)) return true;
    if (!rowMatchesLocation(row, selection)) return true;
    return !rowHasMetricValue(row, metric);
  });
  state.rows = [...keptRows, ...nextRows];
}

async function fetchRowsForSelection(selection, { apiConfig, start, end, aggregation, signal }) {
  const locationId = apiLocationId(selection);
  const url = buildApiReadingsUrl({
    namespace: apiConfig.namespace,
    locationId,
    apiMetric: apiConfig.metric,
    startDate: start,
    endDate: end,
    aggregation,
  });
  console.info("CSENSES API request", { namespace: apiConfig.namespace, locationId, apiMetric: apiConfig.metric, start, end, aggregation, url });
  const response = await fetch(url, {
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  console.info("CSENSES API response", {
    status: response.status,
    locationId: payload?.location_id,
    metric: payload?.metric,
    readings: Array.isArray(payload?.readings) ? payload.readings.length : 0,
  });
  if (!response.ok) {
    throw new Error(payload?.error || `API request failed with status ${response.status}`);
  }
  return {
    provider: apiConfig.namespace,
    rows: normalizeApiRows(payload, { selection, apiConfig }),
  };
}

function selectedLoadLocations(metric) {
  const values = state.template === "trends" ? selectedComparisonLocations() : [els.location.value];
  return values
    .flatMap((value) => {
      const selection = selectedLocation(value);
      if (selection.kind !== "custom") return [selection];
      return (selection.members || []).map((memberValue) => selectedLocation(memberValue));
    })
    .filter((selection, index, all) => {
      return selectedLocationCanLoadSensorData(selection, metric) &&
        all.findIndex((item) => item.value === selection.value) === index;
    });
}

function sensorTypeLabelForMetric(metric) {
  if (metric === "air" || metric === "pm10") return "air quality sensor";
  if (metric === "noise") return "noise sensor";
  return "heat sensor";
}

async function loadApiData() {
  const loadId = state.apiLoadId + 1;
  state.apiLoadId = loadId;
  if (state.apiAbortController) state.apiAbortController.abort();
  state.apiAbortController = new AbortController();
  const timeoutId = window.setTimeout(() => state.apiAbortController?.abort(), apiRequestTimeoutMs);

  const metric = els.calendarMetric.value;
  const apiConfig = sensorApiConfigForReportMetric(metric);
  if (!apiConfig) {
    window.clearTimeout(timeoutId);
    setDataStatus("Sensor data loading currently supports PM2.5, PM10, Heat Index, and Noise.", "error");
    return;
  }

  const selections = selectedLoadLocations(metric);
  if (!selections.length) {
    window.clearTimeout(timeoutId);
    setDataStatus(apiConfig.namespace === "aq"
      ? "Choose one or more air quality sensors before loading PM data."
      : "Choose one or more numbered Heat or Noise sensors before loading sensor data.", "error");
    return;
  }

  const { start, end } = monthDateRange();
  const aggregation = els.apiAggregation?.value || "1day";
  const requestedLocationValue = els.location.value;

  const button = els.loadApiBtn;
  if (button) button.disabled = true;
  setDataStatus(`Loading ${metricDisplay(metric)} for ${selections.length} location${selections.length === 1 ? "" : "s"} from ${start} to ${end}...`);

  try {
    const results = await Promise.allSettled(selections.map((selection) => {
      return fetchRowsForSelection(selection, {
        apiConfig,
        start,
        end,
        aggregation,
        signal: state.apiAbortController.signal,
      }).then((result) => ({ selection, ...result }));
    }));

    if (loadId !== state.apiLoadId) return;

    const loaded = [];
    const failed = [];
    let emptyCount = 0;
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failed.push({ selection: selections[index], error: result.reason });
        return;
      }

      const item = result.value;
      if (!item.rows.length) {
        emptyCount += 1;
        console.info("CSENSES API returned no usable rows", {
          location: item.selection.display || item.selection.label,
          metric,
          start,
          end,
        });
        return;
      }

      mergeLoadedRows(item.rows, {
        selection: item.selection,
        metric,
        startDate: start,
        endDate: end,
      });
      loaded.push(item);
    });

    if (!loaded.length) {
      const abortError = failed.find((item) => item.error?.name === "AbortError")?.error;
      if (abortError) throw abortError;
      const firstError = failed.find((item) => item.error)?.error;
      throw new Error(firstError?.message || `No data for the selected ${sensorTypeLabelForMetric(metric)} location${selections.length === 1 ? "" : "s"} from ${start} to ${end}. Try sensor location or another month.`);
    }

    state.dataSource = "api";
    if (els.csvUpload) els.csvUpload.value = "";
    updateClusterOptions(requestedLocationValue);
    els.location.value = requestedLocationValue;
    renderComparisonLocationOptions();
    const totalRows = loaded.reduce((sum, item) => sum + item.rows.length, 0);
    const dateSpans = loaded.map((item) => apiLoadedDateSpan(item.rows)).filter(Boolean);
    const dateSpan = dateSpans.length ? dateSpans[0] : `${start} to ${end}`;
    const skipped = failed.length + emptyCount;
    const skippedNote = skipped ? ` ${skipped} location${skipped === 1 ? "" : "s"} had no usable data or could not be loaded.` : "";
    setDataStatus(`Loaded ${totalRows} ${aggregation} readings for ${loaded.length} location${loaded.length === 1 ? "" : "s"} (${dateSpan}).${skippedNote}`, "success");
    render();
  } catch (error) {
    if (error.name === "AbortError" && loadId !== state.apiLoadId) return;
    const message = error.name === "AbortError"
      ? "Sensor data loading timed out. Try fewer sensors, another month, or try again in a moment."
      : (error.message || "Could not load API data.");
    setDataStatus(message, "error");
  } finally {
    window.clearTimeout(timeoutId);
    if (loadId === state.apiLoadId) {
      state.apiAbortController = null;
      if (button) button.disabled = false;
    }
  }
}

function updateComparisonSummary() {
  const metric = els.calendarMetric.value;
  const metricNameHtml = metricDisplayHtml(metric);
  const unit = metricUnit(metric);
  const series = comparisonSeries();
  const withPeaks = series.filter((item) => item.peak !== null);
  const withAverages = series.filter((item) => item.average !== null);
  const peak = withPeaks.sort((a, b) => b.peak - a.peak)[0];
  const average = withAverages.sort((a, b) => b.average - a.average)[0];
  const comparedDays = Math.max(0, ...series.map((item) => item.values.length));

  document.getElementById("comparisonMetricTitle").innerHTML = `${metricNameHtml} by Location`;
  document.getElementById("comparisonPeakLabel").innerHTML = `Highest daily average ${metricNameHtml}`;
  document.getElementById("comparisonAverageLabel").innerHTML = `Highest monthly average ${metricNameHtml}`;
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

function noteCanUseGeneratedText() {
  const currentText = els.generalInfo.value.trim();
  return !state.noteDirty && (!currentText || currentText === defaultNoteText || currentText === state.generatedNoteText);
}

function formatMonthDay(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatTextList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function rowsForGeneratedNote(metric) {
  if (state.template === "trends") {
    return comparisonSeries().flatMap((series) => {
      return series.values
        .filter((row) => row[metric] !== null && row[metric] !== undefined)
        .map((row) => ({ row, location: series.cluster }));
    });
  }

  const location = reportLocationDisplay() || "Sensor Site";
  return filteredRows()
    .filter((row) => row[metric] !== null && row[metric] !== undefined)
    .map((row) => ({ row, location }));
}

function observationGroupsForGeneratedNote(noteRows, metric) {
  const bands = metricStandards[metric].bands;
  const groups = bands.map((band, index) => ({
    band,
    index,
    count: 0,
    dates: new Set(),
    locations: new Set(),
  }));

  noteRows.forEach(({ row, location }) => {
    const band = standardBand(metric, row, null);
    const index = bands.findIndex((candidate) => candidate.label === band.label);
    if (index === -1) return;
    groups[index].count += 1;
    groups[index].dates.add(row.date);
    if (location) groups[index].locations.add(location);
  });

  return groups.filter((group) => group.count);
}

function generatedNoteObservationPhrase(group, totalCount) {
  if (state.template === "trends") {
    if (group.count === totalCount) return `across all ${plural(totalCount, "daily location reading")}`;
    return `in ${plural(group.count, "daily location reading")}`;
  }

  const dates = Array.from(group.dates).sort();
  if (dates.length === totalCount) return `on all ${plural(totalCount, "day")} with data`;
  if (dates.length <= 3) return `on ${formatTextList(dates.map(formatMonthDay))}`;
  return `on ${plural(dates.length, "day")}`;
}

function buildAirQualityGeneratedNote(info, location, metric) {
  const metricName = metricDisplay(metric);
  const context = state.template === "trends" ? "across the compared locations" : `at ${location}`;
  const noteRows = rowsForGeneratedNote(metric);
  if (!noteRows.length) {
    return `No observed ${metricName} daily averages are available for ${info.short} ${context}, so the air quality category cannot be summarized.`;
  }

  const observedGroups = observationGroupsForGeneratedNote(noteRows, metric);
  const highestGroup = observedGroups.sort((a, b) => b.index - a.index)[0];
  if (!highestGroup) {
    return `No observed ${metricName} daily averages are available for ${info.short} ${context}, so the air quality category cannot be summarized.`;
  }

  const phrase = generatedNoteObservationPhrase(highestGroup, noteRows.length);

  return truncateNoteText(`Based on observed daily ${metricName} averages for ${info.short} ${context}, air quality was in the ${highestGroup.band.label} category ${phrase}.\n${highestGroup.band.recommendation}`);
}

function buildHeatIndexGeneratedNote(info, location) {
  const metric = "heat";
  const context = state.template === "trends" ? "across the compared locations" : `at ${location}`;
  const noteRows = rowsForGeneratedNote(metric);
  if (!noteRows.length) {
    return `No observed daily heat index averages are available for ${info.short} ${context}, so the heat index category cannot be summarized.`;
  }

  const observedGroups = observationGroupsForGeneratedNote(noteRows, metric);
  const highestGroup = observedGroups.sort((a, b) => b.index - a.index)[0];
  if (!highestGroup) {
    return `No observed daily heat index averages are available for ${info.short} ${context}, so the heat index category cannot be summarized.`;
  }

  if (highestGroup.index === 0) {
    const coverage = state.template === "trends"
      ? `all ${plural(noteRows.length, "daily location reading")} were`
      : `all ${plural(noteRows.length, "day")} with data were`;
    return `Based on observed daily heat index averages for ${info.short} ${context}, ${coverage} below 80°F, so no heat index advisory category applied.`;
  }

  const phrase = generatedNoteObservationPhrase(highestGroup, noteRows.length);
  return truncateNoteText(`Based on observed daily heat index averages for ${info.short} ${context}, the heat index was in the ${highestGroup.band.label} category ${phrase}. Health effect: ${highestGroup.band.healthEffect}\nRecommendations: ${highestGroup.band.recommendation}`);
}

function buildGeneratedNote(info, location) {
  const metric = els.calendarMetric.value;
  if (metric === "air" || metric === "pm10") return buildAirQualityGeneratedNote(info, location, metric);
  if (metric === "heat") return buildHeatIndexGeneratedNote(info, location);
  return "";
}

function heatIndexGeneratedNoteHtml(note) {
  const [observation, ...recommendationParts] = note.split("\n");
  const recommendation = recommendationParts.join("\n").trim();
  const observationParts = observation.match(/^(Based on observed daily )(heat index)( averages for .*? )(at |across )(.+?)(, the heat index was in the )(.+?)(\. )(Health effect:)( )(.+)$/);

  if (observationParts) {
    const observationHtml = [
      escapeHtml(observationParts[1]),
      `<strong>${escapeHtml(observationParts[2])}</strong>`,
      escapeHtml(observationParts[3]),
      escapeHtml(observationParts[4]),
      `<strong>${escapeHtml(observationParts[5])}</strong>`,
      escapeHtml(observationParts[6]),
      `<strong>${escapeHtml(observationParts[7])}</strong>`,
      escapeHtml(observationParts[8]),
      `<strong>${escapeHtml(observationParts[9])}</strong>`,
      escapeHtml(observationParts[10]),
      escapeHtml(observationParts[11]),
    ].join("");
    const recommendationHtml = recommendation
      ? `<p><strong>${escapeHtml(recommendation)}</strong></p>`
      : "";
    return `<p>${observationHtml}</p>${recommendationHtml}`;
  }

  const contextParts = observation.match(/^(Based on observed daily )(heat index)( averages for .*? )(at |across )(.+?)(, .+)$/);
  if (!contextParts) return escapeHtml(note);

  const observationHtml = [
    escapeHtml(contextParts[1]),
    `<strong>${escapeHtml(contextParts[2])}</strong>`,
    escapeHtml(contextParts[3]),
    escapeHtml(contextParts[4]),
    `<strong>${escapeHtml(contextParts[5])}</strong>`,
    escapeHtml(contextParts[6]),
  ].join("");
  return `<p>${observationHtml}</p>`;
}

function generatedNoteHtml(note, metric) {
  if (!note) return "";
  if (metric === "heat") return heatIndexGeneratedNoteHtml(note);
  if (metric !== "air" && metric !== "pm10") return escapeHtml(note);

  const [observation, ...recommendationParts] = note.split("\n");
  const recommendation = recommendationParts.join("\n").trim();
  if (!recommendation) return escapeHtml(note);

  const observationParts = observation.match(/^(.*?daily )(PM2\.5|PM10)( averages .*?air quality was in the )(.+)(\.)$/);
  if (!observationParts) {
    return `<p>${escapeHtml(observation)}</p><p><strong>${escapeHtml(recommendation)}</strong></p>`;
  }

  const metricHtml = metric === "air" ? "PM<sub>2.5</sub>" : "PM<sub>10</sub>";
  const observationHtml = [
    escapeHtml(observationParts[1]),
    `<strong>${metricHtml}</strong>`,
    escapeHtml(observationParts[3]),
    `<strong>${escapeHtml(observationParts[4])}</strong>`,
    escapeHtml(observationParts[5]),
  ].join("");

  return `<p>${observationHtml}</p><p><strong>${escapeHtml(recommendation)}</strong></p>`;
}

function updateText() {
  const info = monthInfo();
  const stats = exceedanceStats();
  const title = els.title.value.trim() || "Composite Calendar";
  const location = reportLocationDisplay() || "Sensor Site";
  const comparedLocations = selectedComparisonLocations();
  const comparedLocationText = comparedLocations.length > 1
    ? `${comparedLocations.length} locations`
    : (comparedLocations[0] ? reportLocationDisplay(comparedLocations[0]) : location);
  const catchphrase = els.catchphrase.value.trim() || `What's going on in ${location}?`;
  const author = els.author.value.trim() || "Name";
  const reportDate = formatReportDate(els.reportDate.value) || currentReportDateLabel();
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
  const generatedNote = buildGeneratedNote(info, location);
  if (noteCanUseGeneratedText()) {
    state.generatedNoteText = generatedNote;
    els.generalInfo.value = generatedNote;
    state.noteHtml = generatedNoteHtml(generatedNote, els.calendarMetric.value);
  }
  const userNote = els.generalInfo.value.trim();
  const noteHtml = state.noteHtml || escapeHtml(userNote || defaultNoteText);
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
  document.getElementById("snapshotNotes").textContent = userNote || defaultNoteText;

  const selectedMetric = els.calendarMetric.value;
  const selectedMetricNameHtml = metricDisplayHtml(selectedMetric);
  const selectedMetricUnit = metricUnit(selectedMetric);
  const selectedMetricStats = metricSummaryStats(stats.rows, selectedMetric);
  document.getElementById("metricSummaryLabel").innerHTML = `${selectedMetricNameHtml} exceedance days for ${escapeHtml(info.short)}.`;
  document.getElementById("peakMetricSummaryLabel").innerHTML = `Highest daily average ${selectedMetricNameHtml} for ${escapeHtml(info.short)}.`;
  document.getElementById("riskMetricSummaryLabel").innerHTML = `Most common ${selectedMetricNameHtml} standard category for ${escapeHtml(info.short)}.`;
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

  const total = stats.counts.air + stats.counts.pm10 + stats.counts.heat + stats.counts.noise;
  document.getElementById("recommendationText").textContent = total
    ? `${info.short} shows ${total} combined threshold exceedances based on daily averages for ${location}. Compare clustered days against site activity, weather, and nearby sources before assigning cause.`
    : `No threshold exceedances are currently shown for ${location}. Adjust thresholds, choose another sensor or cluster, or load sensor data to refine the interpretation.`;
}

function render() {
  updateText();
  renderCalendar();
  renderScene(els.reportScene);
  renderTrendChart();
  renderScene(els.trendScene);
  renderScene(els.snapshotScene);
  renderSensorMap();
}

function noteWords(text) {
  return String(text || "").trim().match(/\S+/g) || [];
}

function truncateNoteText(text) {
  const words = noteWords(text);
  return words.length > noteWordLimit ? words.slice(0, noteWordLimit).join(" ") : String(text || "");
}

function moveCursorToEnd(node) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function enforceNoteWordLimit(editor) {
  const currentText = editor.textContent || "";
  const limitedText = truncateNoteText(currentText);
  if (limitedText === currentText) return false;
  editor.textContent = limitedText;
  moveCursorToEnd(editor);
  return true;
}

function syncNoteFromTextInput() {
  const limitedText = truncateNoteText(els.generalInfo.value);
  if (limitedText !== els.generalInfo.value) els.generalInfo.value = limitedText;
  const normalizedText = limitedText.trim();
  state.noteDirty = Boolean(normalizedText && normalizedText !== defaultNoteText && normalizedText !== state.generatedNoteText);
  state.noteHtml = escapeHtml(limitedText);
}

function syncNoteFromEditor(editor) {
  enforceNoteWordLimit(editor);
  state.noteDirty = true;
  state.noteHtml = editor.innerHTML;
  els.generalInfo.value = editor.innerText;
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

function syncLocationModeControls() {
  const mode = els.locationMode?.value || "existing";
  document.querySelectorAll("[data-location-mode]").forEach((control) => {
    control.hidden = state.template !== "composite" || control.dataset.locationMode !== mode;
  });
  if (mode !== "existing") hideSensorSearchResults();
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
  syncLocationModeControls();
}

document.querySelectorAll(".template-tab").forEach((button) => {
  button.addEventListener("click", () => {
    setTemplate(button.dataset.template);
    render();
  });
});

["input", "change"].forEach((eventName) => {
  [els.title, els.author, els.reportDate, els.catchphrase, els.includeMapPage, els.location, els.month, els.generalInfo, els.airThreshold, els.pm10Threshold, els.heatThreshold, els.noiseThreshold, els.calendarMetric].forEach((input) => {
    input.addEventListener(eventName, () => {
      if (input === els.generalInfo) syncNoteFromTextInput();
      if (input === els.calendarMetric && eventName === "change") updateClusterOptions(metricChangePreferredLocationValue());
      if (input === els.location && eventName === "change") updateComparisonLocationOptions(els.location.value);
      render();
      if (input === els.location || input === els.month || input === els.calendarMetric) updateDataStatusForSelection();
    });
  });
});

els.locationMode?.addEventListener("change", () => {
  syncLocationModeControls();
  renderCustomClusterBuilder();
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

els.customClusterAddBtn?.addEventListener("click", () => {
  addCustomClusterDraftSensor();
});

els.customClusterSelect?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addCustomClusterDraftSensor();
});

els.customClusterName?.addEventListener("input", () => {
  renderCustomClusterBuilder();
});

els.customClusterCreateBtn?.addEventListener("click", () => {
  createCustomCluster();
});

els.comparisonSearchBtn.addEventListener("click", () => {
  renderComparisonSearchResults({ force: true });
  els.comparisonSearch.focus();
});
els.comparisonSelect?.addEventListener("change", () => {
  const value = els.comparisonSelect.value;
  if (!value) return;
  addComparisonLocation(value);
  els.comparisonSelect.value = "";
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

els.csvUpload?.addEventListener("change", () => {
  const file = els.csvUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsedRows = normalizeRows(parseCsv(String(reader.result || "")));
    if (!parsedRows.length) {
      window.alert("No valid rows were found in the uploaded CSV. Please check the date and metric column names.");
      return;
    }
    const previousCluster = els.location.value;
    state.rows = parsedRows;
    state.dataSource = "uploaded";
    setDataStatus(`Loaded ${parsedRows.length} CSV rows.`, "success");
    updateClusterOptions(previousCluster);
    render();
  };
  reader.readAsText(file);
});

els.loadApiBtn?.addEventListener("click", () => {
  loadApiData();
});

document.getElementById("printBtn").addEventListener("click", async () => {
  renderSensorMap();
  await state.sensorPrintMapPromise;
  await wait(250);
  window.print();
});

setCurrentPeriodDefaults();
state.sensorCatalog = builtInSensorCatalog;
loadSampleData();
preloadPictureAssets();
setTemplate(state.template);
loadSensorCatalog().then(() => {
  updateClusterOptions(els.location.value);
  render();
});
