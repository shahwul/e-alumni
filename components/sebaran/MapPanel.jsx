"use client";

import dynamic from "next/dynamic";
import {
  KAB_COLORS,
  KAB_CODE_TO_NAME,
  YOGYA_BOUNDS,
} from "../../lib/constants";
import "leaflet/dist/leaflet.css";
import { useMemo, useRef, useEffect, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

// Konstanta palet warna heatmap agar mudah diakses oleh Legend
const HEATMAP_COLORS = [
  { threshold: 0.9, color: "#7f1d1d", label: "Intensitas > 90%" }, // Merah Marun Gelap
  { threshold: 0.8, color: "#991b1b", label: "Intensitas > 80%" },
  { threshold: 0.7, color: "#b91c1c", label: "Intensitas > 70%" },
  { threshold: 0.6, color: "#dc2626", label: "Intensitas > 60%" },
  { threshold: 0.5, color: "#ef4444", label: "Intensitas > 50%" }, // Merah Terang
  { threshold: 0.4, color: "#ea580c", label: "Intensitas > 40%" },
  { threshold: 0.3, color: "#f97316", label: "Intensitas > 30%" }, // Oranye
  { threshold: 0.2, color: "#eab308", label: "Intensitas > 20%" }, // Kuning Gelap
  { threshold: 0.0, color: "#fef08a", label: "Intensitas > 0%" }, // Kuning Pucat
];

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
  const geoJsonRef = useRef(null);

  const { data, loading } = useAnalytics({
    metric: "alumni",
    kab: selectedKab || undefined,
    year: selectedYear,
    diklat: selectedDiklat,
    groupBy: "Kecamatan",
    caller: "Mapper",
  });

  const valueMap = useMemo(() => {
    if (!data?.length) return {};
    const map = {};
    data.forEach((item) => {
      if (!item.name) return;
      const kecUpper = item.name.toUpperCase();
      const key = selectedKab ? `${selectedKab}|${kecUpper}` : kecUpper;
      map[key] = Number(item.value);
    });
    return map;
  }, [data, selectedKab]);

  const maxValue = useMemo(() => {
    if (!data?.length) return 0;
    return Math.max(...data.map((d) => Number(d.value)), 1);
  }, [data]);

  // Fungsi getHeatColor yang baru dengan 9 tingkat warna
  function getHeatColor(value, max) {
    if (!value || max === 0) return "#e2e8f0"; // Abu-abu jika benar-benar nol

    const intensity = value / max;

    // Looping array warna dari atas ke bawah (paling tinggi ke paling rendah)
    for (let i = 0; i < HEATMAP_COLORS.length; i++) {
      if (intensity > HEATMAP_COLORS[i].threshold) {
        return HEATMAP_COLORS[i].color;
      }
    }

    // Fallback yang seharusnya tidak pernah tersentuh
    return "#fef08a";
  }

  const mapStyle = useCallback(
    (feature) => {
      const props = feature.properties;
      const kabCode = props.code.substring(0, 5);
      const kecName = props.name?.toUpperCase();
      const baseColor = KAB_COLORS[kabCode] || "#cbd5e1";

      const isSameKab = kabCode === selectedKab;
      const isSameKec = selectedKec && kecName === selectedKec.toUpperCase();

      // -------------------------------
      // HEATMAP MODE (exclusive)
      // -------------------------------
      if (heatmapEnable) {
        if (selectedKab && !isSameKab) {
          return {
            fillColor: "#e2e8f0",
            fillOpacity: 0.5,
            weight: 0.5,
            color: "#ffffff",
          };
        }

        if (!loading) {
          const key = selectedKab ? `${kabCode}|${kecName}` : kecName;
          const value = valueMap[key] || 0;

          return {
            fillColor: getHeatColor(value, maxValue),
            fillOpacity: isSameKec ? 1 : 0.85,
            weight: isSameKec ? 3 : 1,
            color: isSameKec ? "#4f46e5" : "#fff",
          };
        }

        // Default state loading (abu-abu/nol)
        return {
          fillColor: "#e2e8f0",
          fillOpacity: 0.85,
          weight: 1,
          color: "#fff",
        };
      }

      // -------------------------------
      // NORMAL MODE
      // -------------------------------
      if (isSameKab && isSameKec) {
        return {
          fillColor: "#4f46e5",
          fillOpacity: 1,
          weight: 3,
          color: "#fff",
        };
      }

      if (isSameKab) {
        return {
          fillColor: baseColor,
          fillOpacity: 0.8,
          weight: 1,
          color: "#fff",
        };
      }

      if (selectedKab) {
        return {
          fillColor: "#94a3b8",
          fillOpacity: 0.2,
          weight: 0.5,
          color: "#fff",
        };
      }

      return {
        fillColor: baseColor,
        fillOpacity: 0.6,
        weight: 1,
        color: "#fff",
      };
    },
    [heatmapEnable, loading, maxValue, valueMap, selectedKab, selectedKec],
  );

  const onEachFeature = (feature, layer) => {
    const kabCode = feature.properties.code.substring(0, 5);

    layer.bindTooltip(
      `${feature.properties.name}, ${KAB_CODE_TO_NAME[kabCode]}`,
      { sticky: true },
    );

    layer.on({
      click: () => {
        const kecNameGeo = feature.properties.name;
        const kabCode = feature.properties.code.substring(0, 5);
        const targetKabName = KAB_CODE_TO_NAME[kabCode];

        let finalKecName = kecNameGeo;
        const kabData = wilayahData.find((w) => w.kabupaten === targetKabName);

        if (kabData?.kecamatan) {
          const match = kabData.kecamatan.find(
            (k) => k.toUpperCase() === kecNameGeo.toUpperCase(),
          );
          if (match) {
            finalKecName = match;
          }
        }
        onSelect(kabCode, finalKecName);
      },
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.95 });
        if (!navigator.maxTouchPoints) e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(latestStyleRef.current(e.target.feature));
      },
    });
  };

  const latestStyleRef = useRef(mapStyle);

  useEffect(() => {
    latestStyleRef.current = mapStyle;
  }, [mapStyle]);

  return (
    <div className="flex-1 bg-slate-100 rounded-xl border relative">
      {heatmapEnable && (
        <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-200 pointer-events-none">
          <h4 className="font-semibold text-sm text-slate-700 mb-3">
            Skala Persebaran Alumni
          </h4>

          {/* Kontainer Horizontal untuk Skala */}
          <div className="flex flex-col gap-1.5">
            {/* Teks Indikator */}
            <div className="flex justify-between text-[11px] text-slate-500 font-medium px-0.5">
              <span>Rendah</span>
              <span>Tinggi</span>
            </div>

            {/* Baris Blok Warna Horizontal */}
            <div className="flex">
              {/* Array di-reverse agar kuning di kiri, merah di kanan */}
              <span className="w-6 h-3.5 border border-slate-200 bg-[#e2e8f0] shadow-sm"></span>
              {[...HEATMAP_COLORS].reverse().map((item, index) => (
                <span
                  key={index}
                  className="w-6 h-3.5 border-y border-r first:border-l border-black/5 shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></span>
              ))}
            </div>
          </div>
        </div>
      )}

      {geoJsonData ? (
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
            ref={geoJsonRef}
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
