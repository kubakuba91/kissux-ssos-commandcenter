function ActivityStream({ items }) {
  const { useState } = React;
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(items);

  React.useEffect(() => {
    if (!paused) setFrozen(items);
  }, [items, paused]);

  return (
    <div
      className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-gray-200">Activity Stream</div>
        {paused && <span className="text-[10px] text-gray-500 font-mono">PAUSED</span>}
      </div>
      <div className="text-xs text-gray-500 mb-3">Raw fleet event stream</div>
      <div className="space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
        {frozen.map(ev => (
          <div key={ev.id} className="flex items-start gap-2 text-xs py-1 border-b border-white/[0.03]">
            <span className="shrink-0 mt-0.5">{ACTIVITY_ICONS[ev.type]}</span>
            <span className={`flex-1 ${ACTIVITY_COLORS[ev.type] || 'text-gray-300'} leading-relaxed`}>{ev.description}</span>
            <span className="shrink-0 text-[10px] text-gray-600 font-mono mt-0.5">{timeAgo(ev.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
