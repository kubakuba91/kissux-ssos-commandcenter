function ActivityStream({ items }) {
  const { useState, useEffect } = React;
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(items);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!paused) setFrozen(items);
  }, [items, paused]);

  // Close the detail view on Escape.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

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
      <div className="text-xs text-gray-500 mb-3">Raw fleet event stream · click an event for details</div>
      <div className="space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
        {frozen.map(ev => (
          <button
            type="button"
            key={ev.id}
            onClick={() => setSelected(ev)}
            className={`w-full flex items-start gap-2 text-xs py-1 px-1 -mx-1 rounded border-b border-white/[0.03] text-left cursor-pointer transition-colors hover:bg-white/[0.04] ${selected && selected.id === ev.id ? 'bg-white/[0.06]' : ''}`}
          >
            <span className="shrink-0 mt-0.5">{ACTIVITY_ICONS[ev.type]}</span>
            <span className={`flex-1 ${ACTIVITY_COLORS[ev.type] || 'text-gray-300'} leading-relaxed`}>{ev.description}</span>
            <span className="shrink-0 text-[10px] text-gray-600 font-mono mt-0.5">{timeAgo(ev.timestamp)}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm bg-[#1a1d27] border border-white/10 rounded-lg shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ACTIVITY_ICONS[selected.type]}</span>
                <span className={`text-sm font-semibold ${ACTIVITY_COLORS[selected.type] || 'text-gray-200'}`}>
                  {(typeof ACTIVITY_LABELS !== 'undefined' && ACTIVITY_LABELS[selected.type]) || selected.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-200 text-lg leading-none -mt-1"
                aria-label="Close"
              >×</button>
            </div>

            <div className="text-sm text-gray-200 leading-relaxed mb-4">{selected.description}</div>

            <div className="space-y-2 text-xs">
              {selected.region && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Region</span>
                  <span className="text-gray-300">{selected.region}</span>
                </div>
              )}
              {selected.scamType && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Scam type</span>
                  <span className="text-gray-300">{selected.scamType}</span>
                </div>
              )}
              {selected.userId && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">User</span>
                  <span className="text-gray-300 font-mono">{selected.userId}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Time</span>
                <span className="text-gray-300">{new Date(selected.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Event ID</span>
                <span className="text-gray-300 font-mono">{selected.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
