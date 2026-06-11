function Sparkline({ data, color }) {
  const w = 80, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function Delta({ value, goodWhenUp = true, suffix = '%' }) {
  const up = value >= 0;
  const good = goodWhenUp ? up : !up;
  const color = good ? 'text-emerald-400' : 'text-red-400';
  const arrow = up ? '▲' : '▼';
  return (
    <span className={`text-xs font-mono ${color}`}>
      {arrow} {Math.abs(value)}{suffix} vs yesterday
    </span>
  );
}

function KpiCard({ title, value, valueClass, children, highlight, pulse }) {
  return (
    <div className={`bg-[#1a1d27] border rounded-lg p-4 flex flex-col gap-2 transition-colors ${
      highlight ? 'border-amber-500/50' : 'border-white/10'
    } ${pulse ? 'animate-pulse-border' : ''}`}>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</div>
      <div className={`text-2xl font-bold font-mono ${valueClass || 'text-white'}`}>{value}</div>
      {children}
    </div>
  );
}

function KpiCards({ kpis }) {
  const fmtMoney = (n) => '$' + n.toLocaleString('en-US');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard title="Mimi Resolved (Today)" value={kpis.mimiResolved}>
        <div className="flex items-center justify-between">
          <Sparkline data={kpis.mimiResolvedSpark} color="#3fb950" />
          <Delta value={kpis.mimiResolvedDelta} />
        </div>
      </KpiCard>

      <KpiCard
        title="Active Escalations"
        value={kpis.activeEscalations}
        valueClass={kpis.activeEscalations > 0 ? 'text-amber-400' : 'text-white'}
        highlight={kpis.activeEscalations > 0}
      >
        <Delta value={kpis.activeEscalationsDelta} goodWhenUp={false} suffix="" />
      </KpiCard>

      <KpiCard title="Intervention Success Rate" value={`${kpis.interventionRate}%`}>
        <Delta value={kpis.interventionRateDelta} suffix="pt" />
      </KpiCard>

      <KpiCard title="Money Saved" value={fmtMoney(kpis.moneySaved)} valueClass="text-emerald-400 text-3xl">
        <div className="text-xs text-gray-500 font-mono">Cumulative · confirmed interventions</div>
      </KpiCard>

      <KpiCard
        title="Money At Risk"
        value={fmtMoney(kpis.moneyAtRisk)}
        valueClass="text-red-400 text-3xl"
        pulse={kpis.moneyAtRisk > 50000}
      >
        <div className="text-xs text-gray-500 font-mono">Active unresolved calls</div>
      </KpiCard>
    </div>
  );
}
