'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

// Fix Leaflet marker icon paths (Next.js bundling)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const OSM_ATTRIBUTION =
  '© OpenStreetMap contributors';

export default function MapPicker({
  value,
  onChange,
  height = 320,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
  height?: number;
}) {
  const centerTuple = useMemo(() => {
    const lat = value?.lat ?? 19.076;
    const lng = value?.lng ?? 72.8777;
    return [lat, lng] as [number, number];
  }, [value?.lat, value?.lng]);

  const markerPos = value ? ([value.lat, value.lng] as [number, number]) : null;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      onChange({ lat, lng });
    });
  };

  return (
    <div className="rounded-lg overflow-hidden border bg-white">
      <div className="p-3 flex items-center justify-between border-b">
        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          Pick location on map
        </div>
        <Button type="button" variant="outline" className="h-8" onClick={useMyLocation}>
          Use my location
        </Button>
      </div>

      <div style={{ height }}>
        <MapContainer
          center={centerTuple}
          zoom={value ? 14 : 11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution={OSM_ATTRIBUTION}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={onChange} />

          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>
    </div>
  );
}