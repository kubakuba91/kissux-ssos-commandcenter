// Seed / mock data for the SSOS Command Center

const SCAM_TYPES = SCAM_WEIGHTS.map(([t]) => t);

const ACTIVITY_ICONS = {
  call_started: 'phone',
  scam_detected: 'alert-triangle',
  mimi_intervened: 'shield',
  user_complied: 'check-circle',
  user_ignored: 'x-circle',
  call_ended: 'phone-off',
  classification_unknown: 'help-circle',
  pattern_logged: 'search',
};

const ACTIVITY_COLORS = {
  call_started: 'text-blue-400',
  scam_detected: 'text-amber-400',
  mimi_intervened: 'text-cyan-400',
  user_complied: 'text-emerald-400',
  user_ignored: 'text-red-400',
  call_ended: 'text-gray-400',
  classification_unknown: 'text-purple-400',
  pattern_logged: 'text-blue-300',
};

const ACTIVITY_BADGE_STYLES = {
  call_started: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  scam_detected: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  mimi_intervened: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  user_complied: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  user_ignored: 'bg-red-500/15 text-red-400 border-red-500/30',
  call_ended: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  classification_unknown: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  pattern_logged: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
};

const ACTIVITY_LABELS = {
  call_started: 'Call Started',
  scam_detected: 'Scam Detected',
  mimi_intervened: 'Mimi Intervened',
  user_complied: 'User Complied',
  user_ignored: 'User Ignored Prompt',
  call_ended: 'Call Ended',
  classification_unknown: 'Classification Unknown',
  pattern_logged: 'Threat Pattern Logged',
};

function describeEvent(type, regionName, scamType, userId) {
  switch (type) {
    case 'call_started': return `Call started — ${userId} (${regionName})`;
    case 'scam_detected': return `Scam detected — ${scamType} (${userId})`;
    case 'mimi_intervened': return `Mimi intervened — Tier 2 hang-up prompt issued (${userId})`;
    case 'user_complied': return `User complied — call ended safely (${userId})`;
    case 'user_ignored': return `User ignored Mimi's prompt — call continues (${userId})`;
    case 'call_ended': return `Call ended (${userId})`;
    case 'classification_unknown': return `Classification unknown — flagged for review (${userId})`;
    case 'pattern_logged': return `New threat pattern logged — ${regionName}`;
    default: return '';
  }
}

// Build a fully structured activity event so the description and the
// fields exposed in the UI (region, scamType, userId) stay consistent.
function buildActivityEvent(type, region, scamType, userId) {
  const regionName = region ? region.name : rand(REGIONS).name;
  scamType = scamType || rand(SCAM_TYPES);
  userId = userId || genUserId();
  return {
    id: genId('EVT'),
    timestamp: Date.now(),
    type,
    region: regionName,
    scamType,
    userId,
    description: describeEvent(type, regionName, scamType, userId),
  };
}

// ── Seed activity stream: 40 events spanning the last 2 hours ──
const SEED_ACTIVITY = (() => {
  const out = [];
  let t = Date.now();
  const types = ['call_started', 'scam_detected', 'mimi_intervened', 'user_complied', 'user_ignored', 'call_ended', 'classification_unknown', 'pattern_logged'];
  const typeWeights = [['call_started', 3], ['scam_detected', 2.5], ['mimi_intervened', 2], ['user_complied', 2], ['user_ignored', 0.8], ['call_ended', 2], ['classification_unknown', 0.3], ['pattern_logged', 0.2]];
  for (let i = 0; i < 40; i++) {
    t -= Math.floor(Math.random() * 250000) + 20000;
    const type = weightedPick(typeWeights);
    const region = rand(REGIONS);
    out.push({ ...buildActivityEvent(type, region), timestamp: t });
  }
  return out.sort((a, b) => b.timestamp - a.timestamp);
})();

// ── Seed threat intelligence feed (8 items) ──
const SEED_THREAT_FEED = [
  { id: genId('TI'), timestamp: Date.now() - 6 * 60000, severity: 'High', text: 'Spike in Tech Support Fraud calls — 14 attempts in the last 40 minutes across OH, PA, and MI. Possible coordinated campaign.' },
  { id: genId('TI'), timestamp: Date.now() - 18 * 60000, severity: 'Medium', text: '6 calls in the last hour share a spoofed caller ID prefix (202-555-XXXX). Pattern logged.' },
  { id: genId('TI'), timestamp: Date.now() - 32 * 60000, severity: 'Low', text: 'Unknown classification rate is 18% today vs 9% 7-day average. May indicate a new scam script in circulation.' },
  { id: genId('TI'), timestamp: Date.now() - 47 * 60000, severity: 'Medium', text: "Mimi intervention success rate dropped to 61% against Government Impersonation calls in the last 2 hours. Monitoring for script evolution." },
  { id: genId('TI'), timestamp: Date.now() - 58 * 60000, severity: 'Low', text: 'Romance Scam volume up slightly in FL and AZ — consistent with seasonal pattern.' },
  { id: genId('TI'), timestamp: Date.now() - 75 * 60000, severity: 'High', text: 'Grandparent Scam cluster detected — 9 calls referencing "bail money" script across NY and MA in 30 minutes.' },
  { id: genId('TI'), timestamp: Date.now() - 95 * 60000, severity: 'Medium', text: 'Lottery/Prize Fraud calls referencing "Publishers Clearing House" up 22% vs yesterday.' },
  { id: genId('TI'), timestamp: Date.now() - 110 * 60000, severity: 'Low', text: 'Utility Impersonation calls trending flat — no anomalies detected.' },
];

// ── Seed map dots (~16 active/resolved/ignored calls) ──
const SEED_MAP_DOTS = (() => {
  const statuses = ['resolved', 'resolved', 'resolved', 'active', 'active', 'ignored'];
  const out = [];
  for (let i = 0; i < 16; i++) {
    const region = rand(REGIONS);
    out.push({
      id: genId('CALL'),
      region: region.name,
      x: region.x + (Math.random() * 4 - 2),
      y: region.y + (Math.random() * 4 - 2),
      lat: region.lat + (Math.random() * 1.2 - 0.6),
      lng: region.lng + (Math.random() * 1.2 - 0.6),
      status: rand(statuses),
      scamType: rand(SCAM_TYPES),
    });
  }
  return out;
})();

// ── Active threat patterns (Threat Intelligence page, 6 cards) ──
const SEED_PATTERNS = [
  { id: genId('PAT'), type: 'Volume Spike', scamType: 'Tech Support Fraud', regions: 'OH, PA, MI', calls: 14, firstDetected: Date.now() - 40 * 60000, successRate: 82, status: 'Monitoring' },
  { id: genId('PAT'), type: 'Spoofed Caller ID', scamType: 'Government Impersonation', regions: 'DC, MD, VA', calls: 6, firstDetected: Date.now() - 65 * 60000, successRate: 61, status: 'Escalated' },
  { id: genId('PAT'), type: 'Script Cluster', scamType: 'Grandparent Scam', regions: 'NY, MA, CT', calls: 9, firstDetected: Date.now() - 95 * 60000, successRate: 74, status: 'Monitoring' },
  { id: genId('PAT'), type: 'Volume Spike', scamType: 'Lottery/Prize Fraud', regions: 'FL, GA', calls: 7, firstDetected: Date.now() - 120 * 60000, successRate: 88, status: 'Monitoring' },
  { id: genId('PAT'), type: 'Emerging Script', scamType: 'Romance Scam', regions: 'AZ, NV, CA', calls: 4, firstDetected: Date.now() - 150 * 60000, successRate: 70, status: 'Resolved' },
  { id: genId('PAT'), type: 'Repeat Targeting', scamType: 'Utility Impersonation', regions: 'TX, OK', calls: 5, firstDetected: Date.now() - 200 * 60000, successRate: 91, status: 'Resolved' },
];

// ── Scam type breakdown: today vs 7-day average ──
const SCAM_BREAKDOWN = {
  labels: SCAM_TYPES,
  today: [42, 27, 14, 9, 8, 4],
  avg7day: [29, 22, 13, 11, 9, 5],
};

// ── Unknown classification log (10 entries) ──
const SEED_UNKNOWN_LOG = (() => {
  const transcripts = [
    "...this is regarding your extended vehicle warranty, we've been trying to reach you...",
    "...I'm calling from the office of the inspector general regarding suspicious activity on your...",
    "...your grandson is in trouble and needs you to wire money for...",
    "...congratulations, you've been selected to receive a prize of...",
    "...your electric service will be disconnected within the hour unless...",
    "...I noticed some unusual charges on a credit profile linked to your name...",
    "...this call is to verify your Medicare benefits package, can you confirm your...",
    "...we detected a virus on your computer, please do not turn it off...",
    "...this is a final notice regarding your vehicle's extended service contract...",
    "...I'm reaching out about a refund you're owed from a recent purchase...",
  ];
  return transcripts.map((tx, i) => ({
    id: genId('UNK'),
    time: Date.now() - (15 + i * 11) * 60000,
    duration: `${2 + (i % 5)}m ${10 + i * 3 % 60}s`,
    region: rand(REGIONS).name,
    riskScore: 40 + Math.floor(Math.random() * 40),
    transcript: tx,
  }));
})();

// ── 30-day fleet performance data (with a degradation event mid-period) ──
const FLEET_PERFORMANCE = (() => {
  const labels = [];
  const interventionSuccess = [];
  const resolutionRate = [];
  const unknownRate = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const dayIdx = 29 - i;
    let success = 80 + Math.sin(dayIdx / 4) * 3;
    let resolution = 88 + Math.cos(dayIdx / 5) * 2;
    let unknown = 9 + Math.sin(dayIdx / 6) * 1.5;
    // degradation event around day 14-18, partial recovery after
    if (dayIdx >= 14 && dayIdx <= 22) {
      const sevDist = Math.abs(dayIdx - 17);
      const drop = Math.max(0, (5 - sevDist)) * 4;
      success -= drop;
      resolution -= drop * 0.6;
      unknown += drop * 0.8;
    }
    interventionSuccess.push(Math.round((success + (Math.random() * 2 - 1)) * 10) / 10);
    resolutionRate.push(Math.round((resolution + (Math.random() * 2 - 1)) * 10) / 10);
    unknownRate.push(Math.round((unknown + (Math.random() * 1)) * 10) / 10);
  }
  return { labels, interventionSuccess, resolutionRate, unknownRate };
})();

// ── Classification confidence histogram (today) ──
const CONFIDENCE_HISTOGRAM = {
  labels: ['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'],
  values: [2, 3, 4, 6, 9, 14, 22, 38, 61, 84],
};

// ── Device coverage ──
const DEVICE_COVERAGE = {
  total: 4128,
  activeToday: 3742,
  last1hr: 3105,
  last24hr: 812,
  over24hr: 211,
};

// ── Model feedback summary (week) ──
const MODEL_FEEDBACK = [
  { from: 'Unknown', to: 'Tech Support Fraud', count: 18 },
  { from: 'Unknown', to: 'Government Impersonation', count: 11 },
  { from: 'Government Impersonation', to: 'Grandparent Scam', count: 6 },
  { from: 'Unknown', to: 'Romance Scam', count: 5 },
  { from: 'Lottery/Prize Fraud', to: 'Government Impersonation', count: 3 },
  { from: 'Unknown', to: 'Utility Impersonation', count: 4 },
];

// ── Reports (3 filed/draft) ──
const SEED_REPORTS = [
  { id: genId('RPT'), seniorId: genUserId(), date: Date.now() - 2 * 86400000, scamType: 'Tech Support Fraud', loss: 24000, agency: 'FTC', status: 'Filed' },
  { id: genId('RPT'), seniorId: genUserId(), date: Date.now() - 5 * 86400000, scamType: 'Romance Scam', loss: 46000, agency: 'FBI IC3', status: 'Acknowledged' },
  { id: genId('RPT'), seniorId: genUserId(), date: Date.now() - 1 * 86400000, scamType: 'Grandparent Scam', loss: 9000, agency: 'APS', status: 'Draft' },
];

// ── Initial KPI state (consistent w/ ~2hrs of activity) ──
const SEED_KPIS = {
  mimiResolved: 47,
  mimiResolvedSpark: [31, 35, 38, 42, 39, 44, 47],
  mimiResolvedDelta: 12,
  activeEscalations: 3,
  activeEscalationsDelta: -1,
  interventionRate: 78,
  interventionRateDelta: 4,
  interventionRatePrevAvg: 74,
  moneySaved: 612000,
  moneyAtRisk: 38000,
};
