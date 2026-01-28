"use client";

import dynamic from "next/dynamic";
import { KAB_COLORS, CODE_TO_NAME, YOGYA_BOUNDS } from "./helpers/constants";
import "leaflet/dist/leaflet.css";
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

export default function MapPanel({
  geoJsonData,
  selectedKab,
  selectedKec,
  wilayahData,
  onSelect,
}) {
  const mapStyle = (feature) => {
    const kabCode = feature.properties.code.substring(0, 5);
    const baseColor = KAB_COLORS[kabCode] || "#cbd5e1";

    if (selectedKab && kabCode !== selectedKab)
      return { fillColor: "#94a3b8", fillOpacity: 0.2 };

    return { fillColor: baseColor, fillOpacity: 0.8, weight: 1, color: "#fff" };
  };

  const onEachFeature = (feature, layer) => {
    const kabCode = feature.properties.code.substring(0, 5);
    layer.bindTooltip(`${feature.properties.name}, ${CODE_TO_NAME[kabCode]}`, {
      sticky: true,
    });
    layer.on({
      click: () => {
        const kecNameGeo = feature.properties.name;
        const targetKabName = CODE_TO_NAME[kabCode];
        const kabData = wilayahData.find((w) => w.kabupaten === targetKabName);
        let finalKecName = kecNameGeo;
        if (kabData?.kecamatan) {
          const match = kabData.kecamatan.find(
            (k) => k.toUpperCase() === kecNameGeo.toUpperCase(),
          );
          if (match) finalKecName = match;
        }
        onSelect(kabCode, finalKecName);
      },

      // Fix Set target colors on mouseout
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, color: "#fff", fillOpacity: 0.9 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        if (
          !selectedKec ||
          e.target.feature.properties.name.toUpperCase() !==
            selectedKec.toUpperCase()
        ) {
          e.target.setStyle({
            weight: 1,
            color: "white",
            fillOpacity: 0.8,
          });
        }
      },
    });
  };

  return (
    <div className="flex-1 bg-slate-100 rounded-xl border relative">
      {geoJsonData ? (
        <MapContainer
          center={[-7.88, 110.45]}
          zoom={10}
          minZoom={9}
          maxZoom={13}
          maxBounds={YOGYA_BOUNDS}
          maxBoundsViscosity={1.0}
          className="h-full"
        >
          <GeoJSON
            key={selectedKab + selectedKec + wilayahData.length}
            data={geoJsonData}
            style={mapStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-400">
          Memuat peta…
        </div>
      )}
    </div>
  );
}
