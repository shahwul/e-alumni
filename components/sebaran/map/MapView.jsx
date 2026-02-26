"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { YOGYA_BOUNDS } from "@/lib/constants";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

export default function MapView({ geoJsonData, mapStyle, onEachFeature }) {
  if (!geoJsonData) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Memuat peta…
      </div>
    );
  }

  return (
    <MapContainer
      center={[-7.88, 110.45]}
      zoom={10}
      minZoom={9}
      maxZoom={13}
      maxBounds={YOGYA_BOUNDS}
      maxBoundsViscosity={1.0}
      className="h-full z-[100]"
    >
      <GeoJSON
        data={geoJsonData}
        style={mapStyle}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
