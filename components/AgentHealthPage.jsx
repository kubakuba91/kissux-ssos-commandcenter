function PerformanceChart() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: AGENT_PERFORMANCE.labels,
        datasets: [
          { label: 'Intervention Success', data: AGENT_PERFORMANCE.interventionSuccess, borderColor: '#3fb950', backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 },
          { label: 'Resolution Rate', data: AGENT_PERFORMANCE.resolutionRate, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 },
          { label: 'Unknown Classification', data: AGENT_PERFORMANCE.unknownRate, borderColor: '#fbbf24', backgroundColor: 'transparent', tension: 0.3, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#6b7280', font: { size: 9 }, maxTicksLimit: 10 }, grid: { color: '#ffffff08' } },
          y: { ticks: { color: '#6b7280', font: { size: 10 }, callback: v => v + '%' }, grid: { color: '#ffffff10' } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return <div className="h-80"><canvas ref={ref}></canvas></div>;
}

function ConfidenceHistogram() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: CONFIDENCE_HISTOGRAM.labels,
        datasets: [{
          label: 'Calls',
          data: CONFIDENCE_HISTOGRAM.values,
          backgroundColor: CONFIDENCE_HISTOGRAM.values.map((_, i) => i >= 6 ? '#3fb950' : i >= 4 ? '#fbbf24' : '#f85149'),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { display: false } },
          y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#ffffff10' } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return <div className="h-64"><canvas ref={ref}></canvas></div>;
}

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-md p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold font-mono text-white">{value}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function AgentHealthPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">Mimi Performance Over Time</h2>
        <div className="text-xs text-gray-500 mb-3">30-day trend — degradation may indicate scam scripts evolving beyond Mimi's current model</div>
        <PerformanceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-100 mb-1">Classification Confidence Distribution</h2>
          <div className="text-xs text-gray-500 mb-3">Today — healthy systems skew toward high confidence</div>
          <ConfidenceHistogram />
        </div>

        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Device Coverage</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatBox label="Total Enrolled Devices" value={DEVICE_COVERAGE.total.toLocaleString()} />
            <StatBox label="Active Today" value={DEVICE_COVERAGE.activeToday.toLocaleString()} />
          </div>
          <div className="text-xs text-gray-500 mb-2">Last-seen distribution</div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="< 1hr" value={DEVICE_COVERAGE.last1hr.toLocaleString()} />
            <StatBox label="1–24hr" value={DEVICE_COVERAGE.last24hr.toLocaleString()} />
            <StatBox label="24hr+" value={DEVICE_COVERAGE.over24hr.toLocaleString()} />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">Model Feedback Summary</h2>
        <div className="text-xs text-gray-500 mb-3">Operator classification corrections this week — feeds back into model improvement</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-white/10 text-xs">
              <th className="px-3 py-2 font-medium">Original Classification</th>
              <th className="px-3 py-2 font-medium"></th>
              <th className="px-3 py-2 font-medium">Corrected Classification</th>
              <th className="px-3 py-2 font-medium text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_FEEDBACK.map((f, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 text-gray-300">
                <td className="px-3 py-2 font-mono">{f.from}</td>
                <td className="px-3 py-2 text-gray-600">→</td>
                <td className="px-3 py-2 font-mono">{f.to}</td>
                <td className="px-3 py-2 text-right font-mono text-amber-400">{f.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
