function Sidebar({ page, setPage }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: '🛰️' },
    { id: 'threat', label: 'Threat Intelligence', icon: '🧭' },
    { id: 'fleet', label: 'Fleet Health', icon: '📡' },
    { id: 'reports', label: 'Reports', icon: '📋' },
  ];

  return (
    <div className="w-60 shrink-0 h-screen sticky top-0 bg-[#1a1d27] border-r border-white/10 flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-lg font-bold text-white tracking-tight">SSOS Command Center</div>
        <div className="text-xs text-gray-500 mt-1 font-mono">Mimi Fleet Surveillance</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              page === item.id
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live · {DEVICE_COVERAGE.activeToday.toLocaleString()} devices active
        </div>
      </div>
    </div>
  );
}
