const SEVERITY_RANK = { High: 0, Medium: 1, Low: 2 };
const SEVERITY_STYLES = {
  High: 'bg-red-500/15 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
};

function ThreatFeed({ items, full }) {
  const { useState, useMemo } = React;
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(items);

  React.useEffect(() => {
    if (!paused) setFrozen(items);
  }, [items, paused]);

  const sorted = useMemo(() => {
    return [...frozen].sort((a, b) => {
      const sevDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.timestamp - a.timestamp;
    });
  }, [frozen]);

  const list = full ? sorted : sorted.slice(0, 10);

  return (
    <div
      className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-gray-200">Threat Intelligence Feed</div>
        {paused && <span className="text-[10px] text-gray-500 font-mono">PAUSED</span>}
      </div>
      <div className="text-xs text-gray-500 mb-3">Pattern-level observations from the fleet OODA loop</div>
      <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: full ? 'none' : 480 }}>
        {list.map(item => (
          <div
            key={item.id}
            className={`p-2.5 rounded-md bg-white/[0.02] border-l-2 ${
              item.severity === 'High' ? 'border-l-red-500' : item.severity === 'Medium' ? 'border-l-amber-400' : 'border-l-blue-400'
            } border-y border-r border-white/5`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${SEVERITY_STYLES[item.severity]}`}>
                {item.severity.toUpperCase()}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">{timeAgo(item.timestamp)}</span>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
