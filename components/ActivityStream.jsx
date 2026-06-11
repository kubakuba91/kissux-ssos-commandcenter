function ActivityStream({ items, onSelect, selectedId }) {
  const { useState, useEffect } = React;
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(items);

  useEffect(() => {
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
      <div className="text-xs text-gray-500 mb-4">Raw fleet event stream · click an event for details</div>
      <div className="space-y-2.5 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
        {frozen.map(ev => (
          <button
            type="button"
            key={ev.id}
            onClick={() => onSelect && onSelect(ev)}
            className={`w-full p-3 rounded-md text-left cursor-pointer transition-colors bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 ${selectedId === ev.id ? 'bg-white/[0.07] border-white/15' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-2 min-w-0">
                <Icon name={ACTIVITY_ICONS[ev.type]} size={14} className={`shrink-0 ${ACTIVITY_COLORS[ev.type] || 'text-gray-400'}`} />
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${(typeof ACTIVITY_BADGE_STYLES !== 'undefined' && ACTIVITY_BADGE_STYLES[ev.type]) || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
                  {((typeof ACTIVITY_LABELS !== 'undefined' && ACTIVITY_LABELS[ev.type]) || ev.type).toUpperCase()}
                </span>
              </span>
              <span className="shrink-0 text-[10px] text-gray-600 font-mono">{timeAgo(ev.timestamp)}</span>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed">{ev.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
