function ThreatTicker({ items }) {
  const { useMemo, useState } = React;
  const [paused, setPaused] = useState(false);

  // Highest severity first, then most recent — same ordering as the feed.
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const sevDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.timestamp - a.timestamp;
    });
  }, [items]);

  const highCount = sorted.filter(i => i.severity === 'High').length;

  // Duplicate the list so the marquee can loop seamlessly (-50% = one copy).
  const loop = sorted.length ? [...sorted, ...sorted] : [];

  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg flex items-stretch overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 border-r border-white/10 bg-white/[0.02]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-xs font-semibold text-gray-200 whitespace-nowrap">Threat Intel</span>
        {highCount > 0 && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-red-500/15 text-red-400 border-red-500/30">
            {highCount} HIGH
          </span>
        )}
      </div>

      <div
        className="relative flex-1 min-w-0 overflow-hidden ticker-mask"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="ticker-track flex items-center gap-8 py-2.5 whitespace-nowrap w-max"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {loop.map((item, i) => (
            <span key={`${item.id}-${i}`} className="flex items-center gap-2 text-xs">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${SEVERITY_STYLES[item.severity]}`}>
                {item.severity.toUpperCase()}
              </span>
              <span className="text-gray-300">{item.text}</span>
              <span className="text-gray-600 font-mono">· {timeAgo(item.timestamp)}</span>
              <span className="text-gray-700 ml-4">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
