function OverviewPage({ sim }) {
  return (
    <div className="space-y-6">
      <KpiCards kpis={sim.kpis} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GeoMap mapDots={sim.mapDots} />
        <ThreatFeed items={sim.threatFeed} />
        <ActivityStream items={sim.activityStream} />
      </div>
    </div>
  );
}

function App() {
  const { useState } = React;
  const [page, setPage] = useState('overview');
  const sim = useSimulation();

  const titles = {
    overview: 'Overview',
    threat: 'Threat Intelligence',
    fleet: 'Fleet Health',
    reports: 'Reports',
  };

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-gray-100">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 p-6 max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{titles[page]}</h1>
          <div className="text-xs text-gray-500 font-mono mt-1">SSOS Command Center · Fleet-scale Mimi oversight</div>
        </div>
        {page === 'overview' && <OverviewPage sim={sim} />}
        {page === 'threat' && <ThreatIntelligencePage threatFeed={sim.threatFeed} unknownLog={sim.unknownLog} setUnknownLog={sim.setUnknownLog} />}
        {page === 'fleet' && <FleetHealthPage />}
        {page === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
