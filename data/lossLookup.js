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

const REGIONS = [
  { name: 'California', abbr: 'CA', x: 8,  y: 58 },
  { name: 'Texas', abbr: 'TX', x: 36, y: 76 },
  { name: 'Florida', abbr: 'FL', x: 80, y: 86 },
  { name: 'New York', abbr: 'NY', x: 81, y: 26 },
  { name: 'Ohio', abbr: 'OH', x: 69, y: 39 },
  { name: 'Pennsylvania', abbr: 'PA', x: 75, y: 33 },
  { name: 'Michigan', abbr: 'MI', x: 65, y: 27 },
  { name: 'Illinois', abbr: 'IL', x: 60, y: 39 },
  { name: 'Georgia', abbr: 'GA', x: 75, y: 69 },
  { name: 'Arizona', abbr: 'AZ', x: 18, y: 63 },
  { name: 'Washington', abbr: 'WA', x: 12, y: 9 },
  { name: 'Colorado', abbr: 'CO', x: 32, y: 49 },
  { name: 'North Carolina', abbr: 'NC', x: 79, y: 56 },
  { name: 'Virginia', abbr: 'VA', x: 79, y: 47 },
  { name: 'Oklahoma', abbr: 'OK', x: 41, y: 65 },
  { name: 'Tennessee', abbr: 'TN', x: 68, y: 58 },
  { name: 'Missouri', abbr: 'MO', x: 53, y: 49 },
  { name: 'Nevada', abbr: 'NV', x: 14, y: 46 },
  { name: 'Massachusetts', abbr: 'MA', x: 86, y: 21 },
  { name: 'Minnesota', abbr: 'MN', x: 54, y: 25 },
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

function genUserId() { return 'USR-' + Math.floor(1000 + Math.random() * 9000); }
function genId(prefix) { return prefix + '-' + Math.floor(100000 + Math.random() * 900000); }
