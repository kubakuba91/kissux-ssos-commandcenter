const STATUS_COLORS_MAP = {
  resolved: '#3fb950',
  active: '#fbbf24',
  ignored: '#f85149',
};

const STATUS_LABELS_MAP = {
  resolved: 'Resolved',
  active: 'Active',
  ignored: 'Mimi intervened, user stayed on',
};

// Continental-US view; OpenStreetMap data via CARTO's free dark basemap.
const US_CENTER = [39.5, -98.35];
const US_ZOOM = 4;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function GeoMap({ mapDots }) {
  const { useRef, useEffect } = React;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Initialise the Leaflet map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current || typeof L === 'undefined') return;

    const map = L.map(containerRef.current, {
      center: US_CENTER,
      zoom: US_ZOOM,
      minZoom: 3,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // Re-render markers whenever the live call data changes.
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    for (const dot of mapDots) {
      if (typeof dot.lat !== 'number' || typeof dot.lng !== 'number') continue;
      const color = STATUS_COLORS_MAP[dot.status] || '#9ca3af';
      const marker = L.circleMarker([dot.lat, dot.lng], {
        radius: 6,
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.85,
      });
      marker.bindPopup(
        `<div style="font-weight:600;margin-bottom:2px;">${dot.region}</div>` +
        `<div style="color:#9ca3af;">${dot.scamType}</div>` +
        `<div style="color:${color};margin-top:2px;">${STATUS_LABELS_MAP[dot.status] || dot.status}</div>`
      );
      marker.bindTooltip(`${dot.region} · ${dot.scamType}`, { direction: 'top', opacity: 0.9 });
      layer.addLayer(marker);
    }
  }, [mapDots]);

  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col">
      <div className="text-sm font-semibold text-gray-200 mb-1">Geographic Activity</div>
      <div className="text-xs text-gray-500 mb-3">Live call distribution by region</div>
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] rounded-md overflow-hidden border border-white/5 z-0"
      />
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Active</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Mimi intervened, user stayed on</div>
      </div>
    </div>
  );
}
