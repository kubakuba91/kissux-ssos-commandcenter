const STATUS_COLORS_MAP = {
  resolved: '#3fb950',
  active: '#fbbf24',
  ignored: '#f85149',
};

function GeoMap({ mapDots }) {
  const { useState, useMemo } = React;
  const [hoverRegion, setHoverRegion] = useState(null);

  const byRegion = useMemo(() => {
    const groups = {};
    for (const dot of mapDots) {
      if (!groups[dot.region]) groups[dot.region] = [];
      groups[dot.region].push(dot);
    }
    return groups;
  }, [mapDots]);

  const usaClip = 'polygon(8% 30%, 12% 15%, 25% 8%, 45% 5%, 65% 8%, 80% 12%, 95% 20%, 98% 35%, 92% 45%, 95% 60%, 85% 75%, 75% 85%, 78% 95%, 65% 90%, 55% 95%, 45% 88%, 30% 92%, 20% 80%, 10% 65%, 5% 50%)';

  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col">
      <div className="text-sm font-semibold text-gray-200 mb-1">Geographic Activity</div>
      <div className="text-xs text-gray-500 mb-3">Live call distribution by region</div>
      <div className="relative w-full aspect-[16/10] bg-[#0f1117] rounded-md overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" style={{ clipPath: usaClip }} />
        <div className="absolute inset-0 border border-white/10" style={{ clipPath: usaClip }} />

        {Object.entries(byRegion).map(([regionName, dots]) => {
          const region = REGIONS.find(r => r.name === regionName);
          if (!region) return null;
          return (
            <div
              key={regionName}
              className="absolute"
              style={{ left: `${region.x}%`, top: `${region.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoverRegion(regionName)}
              onMouseLeave={() => setHoverRegion(null)}
            >
              <div className="relative" style={{ width: 28, height: 28 }}>
                {dots.slice(0, 6).map((dot, i) => (
                  <span
                    key={dot.id}
                    className="absolute rounded-full transition-colors duration-500"
                    style={{
                      width: 9, height: 9,
                      background: STATUS_COLORS_MAP[dot.status],
                      left: 9 + (i % 3) * 5 - (i % 3 === 1 ? 2 : 0),
                      top: 9 + Math.floor(i / 3) * 5,
                      boxShadow: `0 0 6px ${STATUS_COLORS_MAP[dot.status]}`,
                      opacity: 0.9,
                    }}
                  />
                ))}
              </div>
              {hoverRegion === regionName && (
                <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 w-48 bg-[#0f1117] border border-white/10 rounded-md shadow-xl p-2.5 text-xs">
                  <div className="font-semibold text-gray-200 mb-1">{regionName}</div>
                  <div className="text-gray-400 mb-1.5">
                    {dots.filter(d => d.status === 'active').length} active ·{' '}
                    {dots.filter(d => d.status === 'resolved').length} resolved ·{' '}
                    {dots.filter(d => d.status === 'ignored').length} ignored
                  </div>
                  <div className="space-y-0.5">
                    {Object.entries(dots.reduce((acc, d) => {
                      acc[d.scamType] = (acc[d.scamType] || 0) + 1;
                      return acc;
                    }, {})).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-gray-500 font-mono">
                        <span>{type}</span><span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Active</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Mimi intervened, user stayed on</div>
      </div>
    </div>
  );
}
