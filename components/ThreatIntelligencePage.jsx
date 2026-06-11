const STATUS_BADGE = {
  Monitoring: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Escalated: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function PatternCard({ p }) {
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold text-gray-200">{p.type}</div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${STATUS_BADGE[p.status]}`}>{p.status.toUpperCase()}</span>
      </div>
      <div className="text-xs text-gray-400">{p.scamType}</div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500 mt-1">
        <div>Regions: <span className="text-gray-300">{p.regions}</span></div>
        <div>Calls: <span className="text-gray-300">{p.calls}</span></div>
        <div>Mimi success: <span className={p.successRate < 65 ? 'text-amber-400' : 'text-emerald-400'}>{p.successRate}%</span></div>
        <div>First seen: <span className="text-gray-300">{timeAgo(p.firstDetected)}</span></div>
      </div>
    </div>
  );
}

function ScamBreakdownChart() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: SCAM_BREAKDOWN.labels,
        datasets: [
          { label: 'Today', data: SCAM_BREAKDOWN.today, backgroundColor: '#3b82f6' },
          { label: '7-day avg', data: SCAM_BREAKDOWN.avg7day, backgroundColor: '#374151' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#ffffff10' } },
          y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#ffffff10' } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return <div className="h-72"><canvas ref={ref}></canvas></div>;
}

function ThreatIntelligencePage({ threatFeed, unknownLog, setUnknownLog }) {
  const handleClassify = (id, value) => {
    setUnknownLog(prev => prev.map(u => u.id === id ? { ...u, classified: value } : u));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Active Threat Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SEED_PATTERNS.map(p => <PatternCard key={p.id} p={p} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a1d27] border border-white/10 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Scam Type Breakdown</h2>
          <ScamBreakdownChart />
        </div>
        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4">
          <ThreatFeed items={threatFeed} full />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Unknown Classification Log</h2>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md px-4 py-2 text-sm text-blue-300 mb-3">
          Classifying unknown calls improves Mimi's detection accuracy.
        </div>
        <div className="bg-[#1a1d27] border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-white/10">
                <th className="px-3 py-2 font-medium">Call Time</th>
                <th className="px-3 py-2 font-medium">Duration</th>
                <th className="px-3 py-2 font-medium">Region</th>
                <th className="px-3 py-2 font-medium">Risk Score</th>
                <th className="px-3 py-2 font-medium">Transcript Excerpt</th>
                <th className="px-3 py-2 font-medium">Classification</th>
              </tr>
            </thead>
            <tbody>
              {unknownLog.map(u => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 font-mono text-gray-400">{new Date(u.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</td>
                  <td className="px-3 py-2 font-mono text-gray-400">{u.duration}</td>
                  <td className="px-3 py-2 text-gray-300">{u.region}</td>
                  <td className="px-3 py-2 font-mono text-amber-400">{u.riskScore}</td>
                  <td className="px-3 py-2 text-gray-500 italic max-w-md truncate">{u.transcript}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.classified || ''}
                      onChange={e => handleClassify(u.id, e.target.value)}
                      className="bg-[#0f1117] border border-white/10 rounded px-2 py-1 text-gray-300 text-xs"
                    >
                      <option value="">Unclassified</option>
                      {SCAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
