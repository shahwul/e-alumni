"use client";

import dynamic from "next/dynamic";
import {
  KAB_COLORS,
  KAB_CODE_TO_NAME,
  YOGYA_BOUNDS,
} from "../../lib/constants";
import "leaflet/dist/leaflet.css";
import { useMemo, useRef, useEffect } from "react";

import { useAnalytics } from "@/hooks/useAnalytics";

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
  selectedYear,
  selectedDiklat,
  wilayahData,
  heatmapEnable = true,
  onSelect,
}) {
  const geoJsonRef = useRef();
  
  const { data, loading, error } = useAnalytics({
    metric: "alumni",
    kab: selectedKab,
    year: selectedYear,
    diklat: selectedDiklat,
    groupBy: "Kecamatan",
  });

  const valueMap = useMemo(() => {
    if (!data) return {};

    const map = {};
    data.forEach((kec) => {
      map[kec.name.toUpperCase()] = kec.value;
    });
    console.log("Valuemap", map);
    return map;
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data?.length) return 0;
    return Math.max(...data.map((d) => d.value));
  }, [data]);
  console.log("MaxValue", maxValue);

  function getHeatColor(value, max) {
    if (!value || max === 0) return "#e2e8f0";

    const intensity = value / max; // 0–1

    if (intensity > 0.8) return "#1e3a8a";
    if (intensity > 0.6) return "#2563eb";
    if (intensity > 0.4) return "#3b82f6";
    if (intensity > 0.2) return "#93c5fd";
    return "#dbeafe";
  }

  const mapStyle = (feature) => {
    const kabCode = feature.properties.code.substring(0, 5);
    const kecName = feature.properties.name;
    const upperKec = kecName.toUpperCase();

    if (heatmapEnable) {
      const value = valueMap?.[upperKec] || 0;
      return {
        fillColor: getHeatColor(value, maxValue),
        fillOpacity: 0.85,
        weight: 1,
        color: "#fff",
      };
    }

    const baseColor = KAB_COLORS[kabCode] || "#cbd5e1";
    const isSameKab = kabCode === selectedKab;
    const isSameKec =
      selectedKec && kecName.toUpperCase() === selectedKec.toUpperCase();

    // Selected kecamatan (strong highlight)
    if (isSameKab && isSameKec) {
      return {
        fillColor: "#4f46e5",
        fillOpacity: 1,
        weight: 3,
        color: "#fff",
      };
    }

    // Selected kabupaten
    if (isSameKab) {
      return {
        fillColor: baseColor,
        fillOpacity: 0.8,
        weight: 1,
        color: "#fff",
      };
    }

    // Other kabupaten when one is selected
    if (selectedKab) {
      return {
        fillColor: "#94a3b8",
        fillOpacity: 0.2,
        weight: 0.5,
        color: "#fff",
      };
    }

    // Default
    return {
      fillColor: baseColor,
      fillOpacity: 0.6,
      weight: 1,
      color: "#fff",
    };
  };

  const onEachFeature = (feature, layer) => {
    const kabCode = feature.properties.code.substring(0, 5);

    layer.bindTooltip(
      `${feature.properties.name}, ${KAB_CODE_TO_NAME[kabCode]}`,
      {
        sticky: true,
      },
    );

    layer.on({
      click: () => {
        const kecNameGeo = feature.properties.name;
        const targetKabName = KAB_CODE_TO_NAME[kabCode];
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

      mouseover: (e) => {
              console.log("Values and maxValue", valueMap, maxValue);
        e.target.setStyle({
          weight: 3,
          color: "#fff",
          fillOpacity: 0.95,
        });
        e.target.bringToFront();
      },

      mouseout: (e) => {
        // Always restore from canonical style function
        geoJsonRef.current?.resetStyle();
      },
    });
  };

  useEffect(() => {
    if (!geoJsonRef.current) return;

    geoJsonRef.current.eachLayer((layer) => {
      geoJsonRef.current.resetStyle(layer);
    });
  }, [valueMap, maxValue, heatmapEnable]);

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
            ref={geoJsonRef}
            key={
              selectedKab +
              selectedKec +
              selectedYear +
              selectedDiklat +
              wilayahData.length +
              heatmapEnable
            }
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
