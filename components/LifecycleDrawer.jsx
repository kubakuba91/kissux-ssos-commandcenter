// ── Deterministic pseudo-random so a given record always renders the same
// synthesized lifecycle values (re-opening shows identical detail). ──
function _hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function _mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OUTCOME_META = {
  resolved: {
    label: 'RESOLVED',
    tone: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    headline: 'Threat neutralized — call ended safely',
    bullets: ['Warning issued', 'User complied', 'Call ended safely'],
    decision: 'INTERVENE & RESOLVE',
  },
  active: {
    label: 'IN PROGRESS',
    tone: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    headline: 'Mimi actively monitoring the call',
    bullets: ['Threat detected', 'Monitoring in progress'],
    decision: 'MONITOR CALL',
  },
  ignored: {
    label: 'IGNORED',
    tone: 'text-red-400 border-red-500/40 bg-red-500/10',
    headline: 'Threat detected — user ignored warning',
    bullets: ['Warning issued', 'User did not respond'],
    decision: 'ESCALATE OPERATOR',
  },
};

function _outcomeFor(src) {
  if (src.status) return src.status; // map dots carry resolved/active/ignored
  switch (src.type) {           // activity events map by type
    case 'user_ignored': return 'ignored';
    case 'user_complied':
    case 'call_ended':
    case 'mimi_intervened': return 'resolved';
    default: return 'active';
  }
}

function _snake(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

function buildLifecycle(src) {
  const rnd = _mulberry32(_hashStr(src.id));
  const region = (typeof REGIONS !== 'undefined' && REGIONS.find(r => r.name === src.region)) || null;
  const outcome = _outcomeFor(src);
  const meta = OUTCOME_META[outcome] || OUTCOME_META.active;
  const scamType = src.scamType || 'Unknown';

  const lat = typeof src.lat === 'number' ? src.lat : (region ? region.lat : 0);
  const lng = typeof src.lng === 'number' ? src.lng : (region ? region.lng : 0);
  const location = region ? `${region.city}, ${region.abbr}` : (src.region || 'Unknown');

  const start = src.timestamp || (Date.now() - Math.floor(rnd() * 3600000));
  const end = start + (30 + Math.floor(rnd() * 90)) * 1000;

  const confidence = 78 + Math.floor(rnd() * 21); // 78–98%
  const threatScore = Math.min(1, Math.round((confidence / 100 + (outcome === 'ignored' ? 0.05 : 0)) * 100) / 100);

  let sid = '';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 19; i++) sid += chars[Math.floor(rnd() * chars.length)];

  const loss = (typeof LOSS_LOOKUP !== 'undefined' && LOSS_LOOKUP[scamType]) || (1000 + Math.floor(rnd() * 40) * 500);
  const atRisk = outcome !== 'resolved';

  return {
    sessionId: sid,
    completed: outcome !== 'active',
    location, lat, lng, start, end,
    userId: src.userId || ('USR-' + String(1000 + Math.floor(rnd() * 9000))),
    scamType, confidence, threatScore,
    decision: meta.decision,
    basis: 'Mimi Runtime 3.0 classification model',
    outcome, meta,
    campaign: `${_snake(scamType)}_${region ? _snake(region.city) : 'national'}_2026`,
    loss, atRisk,
    financeNote: atRisk
      ? 'Default multiplier — no LLM enhancement applied.'
      : 'Estimated loss prevented by Mimi intervention.',
  };
}

function _fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// One row inside a step card: label (with icon) on the left, value on the right.
function LcRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="flex items-center gap-2 w-32 shrink-0 text-gray-500 text-xs">
        {icon && <Icon name={icon} size={13} className="shrink-0 text-gray-600" />}
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0 text-sm text-gray-200">{children}</div>
    </div>
  );
}

function LcStep({ icon, iconTone, title, subtitle, last, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${iconTone}`}>
          <Icon name={icon} size={18} />
        </div>
        {!last && <div className="w-px flex-1 bg-white/10 my-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-baseline gap-2 mb-2.5 mt-1.5">
          <span className="text-sm font-bold tracking-wide text-gray-100">{title}</span>
          <span className="text-[10px] font-medium tracking-widest text-gray-600 uppercase">{subtitle}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LifecycleDrawer({ source, onClose }) {
  const { useEffect, useMemo } = React;

  useEffect(() => {
    if (!source) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [source, onClose]);

  const lc = useMemo(() => (source ? buildLifecycle(source) : null), [source]);
  if (!source || !lc) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/60 fade-in" onClick={onClose} />
      <div className="drawer-in absolute right-0 top-0 h-full w-full max-w-md bg-[#12141c] border-l border-white/10 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/10 bg-[#12141c]">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-wide text-white">THREAT MITIGATION LIFECYCLE</h2>
              <div className="text-[10px] tracking-widest text-gray-500 uppercase mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Signal → Assessment → Action → Outcome
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-200 -mt-1">
              <Icon name="x-circle" size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="text-gray-500">Session:</span>
            <span className="font-mono text-gray-400">{lc.sessionId}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${lc.completed ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : 'text-amber-400 border-amber-500/40 bg-amber-500/10'}`}>
              <Icon name={lc.completed ? 'check-circle' : 'clock'} size={11} />
              {lc.completed ? 'COMPLETED' : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* OBSERVE */}
          <LcStep icon="eye" iconTone="bg-slate-500/15 text-slate-300 border-slate-400/30" title="OBSERVE" subtitle="Signal Detection">
            <div className="bg-[#0f1117] border border-white/5 rounded-lg px-4 py-2 divide-y divide-white/[0.04]">
              <LcRow icon="map-pin" label="Location"><span className="font-semibold text-white">{lc.location}</span></LcRow>
              <LcRow icon="crosshair" label="Coordinates"><span className="font-mono">{lc.lat.toFixed(4)}, {lc.lng.toFixed(4)}</span></LcRow>
              <LcRow icon="clock" label="Call Start"><span className="font-mono">{_fmtTime(lc.start)}</span></LcRow>
              <LcRow icon="clock" label="Call End"><span className="font-mono">{lc.outcome === 'active' ? 'In progress' : _fmtTime(lc.end)}</span></LcRow>
              <LcRow icon="user" label="User ID"><CodeTag code={lc.userId} className="text-gray-200" /></LcRow>
            </div>
          </LcStep>

          {/* ORIENT */}
          <LcStep icon="crosshair" iconTone="bg-amber-500/15 text-amber-400 border-amber-500/30" title="ORIENT" subtitle="Threat Classification">
            <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-lg px-4 py-2 divide-y divide-white/[0.04]">
              <LcRow icon="alert-triangle" label="Threat Type"><span className="font-mono font-semibold text-amber-400">{_snake(lc.scamType)}</span></LcRow>
              <LcRow label="Confidence">
                <div>
                  <div className="text-gray-200">{lc.confidence}% certainty</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${lc.confidence}%` }} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-red-400">{lc.confidence}%</span>
                  </div>
                </div>
              </LcRow>
              <LcRow label="Threat Score"><span className="font-mono">{lc.threatScore.toFixed(2)}</span></LcRow>
            </div>
          </LcStep>

          {/* DECIDE */}
          <LcStep icon="cpu" iconTone="bg-purple-500/15 text-purple-400 border-purple-500/30" title="DECIDE" subtitle="Action Selection">
            <div className="bg-purple-500/[0.04] border border-purple-500/20 rounded-lg px-4 py-2 divide-y divide-white/[0.04]">
              <LcRow label="Decision"><span className="font-semibold text-purple-300">{lc.decision}</span></LcRow>
              <LcRow label="Confidence"><span>{lc.confidence}% — threshold met: <span className="text-emerald-400 font-semibold">YES</span></span></LcRow>
              <LcRow label="Basis"><span className="text-gray-300">{lc.basis}</span></LcRow>
            </div>
          </LcStep>

          {/* ACT */}
          <LcStep icon="zap" iconTone="bg-blue-500/15 text-blue-400 border-blue-500/30" title="ACT" subtitle="Final Outcome" last>
            <div className="bg-[#0f1117] border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded border ${lc.meta.tone}`}>{lc.meta.label}</span>
                <span className="text-sm text-gray-300">{lc.meta.headline}</span>
              </div>
              <ul className="space-y-1.5 mb-3">
                {lc.meta.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1 h-1 rounded-full bg-gray-600" />{b}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-gray-500">Campaign</span>
                <span className="font-mono text-sm text-blue-400">{lc.campaign}</span>
              </div>
            </div>
          </LcStep>

          {/* Financial impact */}
          <div className="border-t border-white/10 pt-5 mt-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                  <Icon name="dollar-sign" size={14} />
                </span>
                <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">Estimated Financial Impact</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 border border-white/10 rounded px-1.5 py-0.5">
                <Icon name="info" size={11} /> Modeled · not actual
              </span>
            </div>
            <div className={`rounded-lg border p-4 ${lc.atRisk ? 'bg-red-500/[0.04] border-red-500/20' : 'bg-emerald-500/[0.04] border-emerald-500/20'}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-2xl font-bold font-mono ${lc.atRisk ? 'text-red-400' : 'text-emerald-400'}`}>
                  <Icon name="trending-down" size={18} />
                  ${lc.loss.toLocaleString()}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border font-mono ${lc.atRisk ? 'text-red-400 border-red-500/40 bg-red-500/10' : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'}`}>
                  {lc.atRisk ? 'AT RISK' : 'SAVED'}
                </span>
              </div>
              <div className="text-xs text-gray-500 italic mt-3">"{lc.financeNote}"</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-white/10 flex items-center justify-between bg-[#12141c]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live feed · auto-refresh 5s
          </div>
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-300 border border-white/10 rounded-md hover:bg-white/5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
