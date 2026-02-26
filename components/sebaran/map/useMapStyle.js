import { useCallback } from "react";
import { KAB_COLORS, HEATMAP_COLORS } from "@/lib/constants";

function getHeatColor(value, max) {
  if (!value || max === 0) return "#e2e8f0";

  const intensity = value / max;

  for (let i = 0; i < HEATMAP_COLORS.length; i++) {
    if (intensity > HEATMAP_COLORS[i].threshold) {
      return HEATMAP_COLORS[i].color;
    }
  }

  return "#fef08a";
}

export function useMapStyle({
  heatmapEnable,
  loading,
  maxValue,
  valueMap,
  selectedKab,
  selectedKec,
}) {
  return useCallback(
    (feature) => {
      const props = feature.properties;
      const kabCode = props.code.substring(0, 5);
      const kecName = props.name?.toUpperCase();
      const baseColor = KAB_COLORS[kabCode] || "#cbd5e1";

      const isSameKab = kabCode === selectedKab;
      const isSameKec = selectedKec && kecName === selectedKec.toUpperCase();

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

        return {
          fillColor: "#e2e8f0",
          fillOpacity: 0.85,
          weight: 1,
          color: "#fff",
        };
      }

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
}
