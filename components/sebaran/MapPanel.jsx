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

  function getHeatColor(value, max) {
    if (!value || max === 0) return "#e2e8f0";

    const intensity = value / max;

    if (intensity > 0.8) return "#e93e3a"; // Merah Tua
    if (intensity > 0.6) return "#ef4444"; // Merah Terang
    if (intensity > 0.4) return "#f97316"; // Oranye
    if (intensity > 0.2) return "#eab308"; // Kuning
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
        if (!loading && maxValue > 0) {
          const key = selectedKab ? `${kabCode}|${kecName}` : kecName;

          const value = valueMap[key] || 0;

          return {
            fillColor: getHeatColor(value, maxValue),
            fillOpacity: isSameKec ? 1 : 0.85,
            weight: isSameKec ? 3 : 1,
            color: isSameKec ? "#4f46e5" : "#fff",
          };
        }

        return {
          fillColor: "#f8fafc",
          fillOpacity: 0.6,
          weight: 1,
          color: "#e2e8f0",
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
            finalKecName = match; // canonical casing
          }
        }

        onSelect(kabCode, finalKecName);
      },

      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          fillOpacity: 0.95,
        });
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
