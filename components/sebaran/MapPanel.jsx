"use client";

import dynamic from "next/dynamic";
import { KAB_COLORS, KAB_CODE_TO_NAME, YOGYA_BOUNDS } from "../../lib/constants";
import "leaflet/dist/leaflet.css";
import { useMemo, useRef, useEffect } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

export default function MapPanel({
  geoJsonData,
  selectedKab,
  selectedKec,
  heatmapData,
  loadingHeatmap,
  wilayahData,
  heatmapEnable = true,
  onSelect,
}) {
  const geoJsonRef = useRef();

  const valueMap = useMemo(() => {
    if (!heatmapData || loadingHeatmap) return {};
    const map = {};
    heatmapData.forEach((item) => {
      if (item.name) map[item.name.toUpperCase()] = item.value;
    });
    return map;
  }, [heatmapData, loadingHeatmap]);

  const maxValue = useMemo(() => {
    if (!heatmapData?.length || loadingHeatmap) return 0;
    return Math.max(...heatmapData.map((d) => d.value), 1);
  }, [heatmapData, loadingHeatmap]);

  function getHeatColor(value, max) {
    if (!value || max === 0) return "#f8fafc"; 
    const intensity = value / max;
    if (intensity > 0.8) return "#1e3a8a";
    if (intensity > 0.6) return "#2563eb";
    if (intensity > 0.4) return "#3b82f6";
    if (intensity > 0.2) return "#93c5fd";
    return "#dbeafe";
  }

  const mapStyle = (feature) => {
    const props = feature.properties;
    const kabCode = props.code.substring(0, 5);
    const kabName = KAB_CODE_TO_NAME[kabCode]?.toUpperCase();
    const kecName = props.name?.toUpperCase();

    const lookupName = selectedKab ? kecName : kabName;
    const val = valueMap[lookupName] || 0;

    if (heatmapEnable && !loadingHeatmap && val > 0) {
      return {
        fillColor: getHeatColor(val, maxValue),
        fillOpacity: 0.85,
        weight: 1,
        color: "#fff",
      };
    }

    const isSameKec = selectedKec && kecName === selectedKec.toUpperCase();
    if (isSameKec) {
      return {
        fillColor: "#f1f5f9",
        fillOpacity: 0.2,
        weight: 3,
        color: "#4f46e5", 
      };
    }

    return {
      fillColor: "#f8fafc", 
      fillOpacity: 0.6,
      weight: 0.5,
      color: "#cbd5e1",
    };
  };

  const onEachFeature = (feature, layer) => {
    const kabCode = feature.properties.code.substring(0, 5);
    layer.bindTooltip(`${feature.properties.name}, ${KAB_CODE_TO_NAME[kabCode]}`, { sticky: true });

    layer.on({
      click: () => {
        const targetKabName = KAB_CODE_TO_NAME[kabCode];
        const kabData = wilayahData.find((w) => w.kabupaten === targetKabName);
        let finalKecName = feature.properties.name;
        if (kabData?.kecamatan) {
          const match = kabData.kecamatan.find((k) => k.toUpperCase() === finalKecName.toUpperCase());
          if (match) finalKecName = match;
        }
        onSelect(kabCode, finalKecName);
      },
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.95 });
        if (!navigator.maxTouchPoints) e.target.bringToFront(); 
      },
      mouseout: (e) => {
        geoJsonRef.current?.resetStyle(e.target);
      },
    });
  };

  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer) => geoJsonRef.current.resetStyle(layer));
    }
  }, [valueMap, maxValue, selectedKab, selectedKec, loadingHeatmap]);

  return (
    <div className="flex-1 bg-slate-100 rounded-xl border relative overflow-hidden">
      {/* Loading Overlay */}
      {loadingHeatmap && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 px-3 py-2 rounded-lg shadow-lg border flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-blue-700">Memperbarui Heatmap...</span>
        </div>
      )}

      {geoJsonData ? (
        <MapContainer 
          center={[-7.88, 110.45]} 
          zoom={10} 
          minZoom={9}
          maxZoom={13}
          maxBounds={YOGYA_BOUNDS} 
          className="h-full w-full"
        >
          <GeoJSON
            ref={geoJsonRef}
            key={`geojson-${selectedKab}-${loadingHeatmap}-${heatmapData?.length}`}
            data={geoJsonData}
            style={mapStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
          Memuat data peta...
        </div>
      )}
    </div>
  );
}