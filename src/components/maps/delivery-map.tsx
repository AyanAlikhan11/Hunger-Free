'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon paths
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DeliveryMap({
  pickup,
  dropoff,
  height = 360,
}: {
  pickup?: { lat: number | null; lng: number | null };
  dropoff?: { lat: number | null; lng: number | null };
  height?: number;
}) {
  const points = useMemo(() => {
    const arr: Array<[number, number]> = [];
    if (pickup?.lat != null && pickup?.lng != null) arr.push([pickup.lat, pickup.lng]);
    if (dropoff?.lat != null && dropoff?.lng != null) arr.push([dropoff.lat, dropoff.lng]);
    return arr;
  }, [pickup, dropoff]);

  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return [19.076, 72.8777];
    const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
    const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
    return [lat, lng];
  }, [points]);

  if (points.length === 0) return null;

  return (
    <div className="rounded-lg overflow-hidden border bg-white">
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={points.length > 1 ? 11 : 13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {pickup?.lat != null && pickup?.lng != null && (
            <Marker position={[pickup.lat, pickup.lng]} />
          )}
          {dropoff?.lat != null && dropoff?.lng != null && (
            <Marker position={[dropoff.lat, dropoff.lng]} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}