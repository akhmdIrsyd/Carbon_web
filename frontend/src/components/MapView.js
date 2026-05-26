import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';

const severityColors = {
  Aman: '#27ae60',
  Waspada: '#f39c12',
  Siaga: '#e67e22',
  Berbahaya: '#e74c3c',
  'Sangat Berbahaya': '#8e44ad',
};

const FIXED_RADIUS = 2000;

function FitBounds({ regions }) {
  const map = useMap();
  useEffect(() => {
    if (regions.length > 0) {
      const bounds = regions.map((r) => [Number(r.latitude), Number(r.longitude)]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [regions, map]);
  return null;
}

export default function MapView({ regions = [], height = '400px' }) {
  const hasRegions = regions.length > 0;
  const defaultCenter = [-2.5, 118];
  const defaultZoom = 5;

  return (
    <MapContainer
      center={hasRegions ? [Number(regions[0].latitude), Number(regions[0].longitude)] : defaultCenter}
      zoom={hasRegions ? 10 : defaultZoom}
      style={{ height, width: '100%', borderRadius: 10, zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasRegions && <FitBounds regions={regions} />}
      {regions.map((region) => {
        const severity = region.latest_severity || 'Aman';
        const color = severityColors[severity] || '#27ae60';
        const total = region.total_carbon || 0;
        return (
          <Circle
            key={region.id}
            center={[Number(region.latitude), Number(region.longitude)]}
            radius={FIXED_RADIUS}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 3 }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{region.name}</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>
                  Total Karbon: <strong>{Number(total).toLocaleString()}</strong> ppm
                </div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>
                  Records: <strong>{region.record_count || 0}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  Keparahan: <span style={{ color, fontWeight: 700 }}>{severity}</span>
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}
