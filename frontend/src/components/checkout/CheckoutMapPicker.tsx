"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753];

function useFixLeafletIcons() {
  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);
}

function MapClickMarker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [internal, setInternal] = useState<[number, number] | null>(position);

  useEffect(() => {
    setInternal(position);
  }, [position]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setInternal([lat, lng]);
      onChange(lat, lng);
    },
  });

  if (!internal) return null;

  return (
    <Marker
      position={internal}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const ll = e.target.getLatLng();
          setInternal([ll.lat, ll.lng]);
          onChange(ll.lat, ll.lng);
        },
      }}
    />
  );
}

type Props = {
  onPositionChange: (lat: number, lng: number) => void;
  onClear: () => void;
  hasLink: boolean;
  labelHint: string;
};

export default function CheckoutMapPicker({ onPositionChange, onClear, hasLink, labelHint }: Props) {
  useFixLeafletIcons();
  const [marker, setMarker] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (hasLink) {
      setMarker(null);
      onClear();
    }
  }, [hasLink, onClear]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{labelHint}</p>
      <div className="overflow-hidden rounded-lg border border-input">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          className="h-[220px] w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickMarker
            position={marker}
            onChange={(lat, lng) => {
              setMarker([lat, lng]);
              onPositionChange(lat, lng);
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
