// Elder-specific average loss by scam type (AARP / Senate Aging Committee figures)
const LOSS_LOOKUP = {
  'Tech Support Fraud': 24000,
  'Government Impersonation': 14000,
  'Grandparent Scam': 9000,
  'Romance Scam': 46000,
  'Lottery/Prize Fraud': 8000,
  'Utility Impersonation': 1500,
  'Unknown': 0,
};

const SCAM_WEIGHTS = [
  ['Tech Support Fraud', 0.35],
  ['Government Impersonation', 0.25],
  ['Grandparent Scam', 0.15],
  ['Lottery/Prize Fraud', 0.10],
  ['Utility Impersonation', 0.10],
  ['Romance Scam', 0.05],
];

const OUTCOME_WEIGHTS = [
  ['complied', 0.70],
  ['ignored', 0.25],
  ['unknown', 0.05],
];

// x/y are retained for legacy layout math; lat/lng drive the real map.
const REGIONS = [
  { name: 'California', abbr: 'CA', x: 8,  y: 58, lat: 36.7, lng: -119.7 },
  { name: 'Texas', abbr: 'TX', x: 36, y: 76, lat: 31.0, lng: -99.0 },
  { name: 'Florida', abbr: 'FL', x: 80, y: 86, lat: 27.8, lng: -81.7 },
  { name: 'New York', abbr: 'NY', x: 81, y: 26, lat: 42.9, lng: -75.5 },
  { name: 'Ohio', abbr: 'OH', x: 69, y: 39, lat: 40.2, lng: -82.9 },
  { name: 'Pennsylvania', abbr: 'PA', x: 75, y: 33, lat: 40.9, lng: -77.7 },
  { name: 'Michigan', abbr: 'MI', x: 65, y: 27, lat: 44.3, lng: -85.4 },
  { name: 'Illinois', abbr: 'IL', x: 60, y: 39, lat: 40.0, lng: -89.0 },
  { name: 'Georgia', abbr: 'GA', x: 75, y: 69, lat: 32.7, lng: -83.4 },
  { name: 'Arizona', abbr: 'AZ', x: 18, y: 63, lat: 34.2, lng: -111.7 },
  { name: 'Washington', abbr: 'WA', x: 12, y: 9, lat: 47.4, lng: -120.5 },
  { name: 'Colorado', abbr: 'CO', x: 32, y: 49, lat: 39.0, lng: -105.5 },
  { name: 'North Carolina', abbr: 'NC', x: 79, y: 56, lat: 35.6, lng: -79.4 },
  { name: 'Virginia', abbr: 'VA', x: 79, y: 47, lat: 37.5, lng: -78.7 },
  { name: 'Oklahoma', abbr: 'OK', x: 41, y: 65, lat: 35.5, lng: -97.5 },
  { name: 'Tennessee', abbr: 'TN', x: 68, y: 58, lat: 35.9, lng: -86.4 },
  { name: 'Missouri', abbr: 'MO', x: 53, y: 49, lat: 38.5, lng: -92.3 },
  { name: 'Nevada', abbr: 'NV', x: 14, y: 46, lat: 39.3, lng: -116.6 },
  { name: 'Massachusetts', abbr: 'MA', x: 86, y: 21, lat: 42.3, lng: -71.8 },
  { name: 'Minnesota', abbr: 'MN', x: 54, y: 25, lat: 46.3, lng: -94.3 },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedPick(weights) {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [item, w] of weights) {
    r -= w;
    if (r < 0) return item;
  }
  return weights[weights.length - 1][0];
}

// Monotonic per-prefix counters so generated IDs are guaranteed unique
// (and deterministic across reloads, since creation order is fixed).
const _idCounters = {};
function nextSeq(prefix) {
  _idCounters[prefix] = (_idCounters[prefix] || 0) + 1;
  return _idCounters[prefix];
}
function genUserId() { return 'USR-' + String(nextSeq('USR')).padStart(4, '0'); }
function genId(prefix) { return prefix + '-' + String(nextSeq(prefix)).padStart(6, '0'); }

// Human-readable meaning of each ID prefix, surfaced as tooltips in the UI.
const CODE_DESCRIPTIONS = {
  USR: 'Protected senior on the call (anonymized user ID)',
  CALL: 'Individual call handled by Mimi',
  EVT: 'Activity-stream event',
  TI: 'Threat-intelligence observation',
  PAT: 'Detected threat pattern',
  UNK: 'Unknown-classification call flagged for review',
  RPT: 'Report filed to an agency',
};
function describeCode(code) {
  if (!code) return '';
  return CODE_DESCRIPTIONS[String(code).split('-')[0]] || '';
}
