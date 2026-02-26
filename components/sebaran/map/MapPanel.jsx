"use client";

import { useRef, useEffect } from "react";
import { KAB_CODE_TO_NAME } from "@/lib/constants";
import MapView from "./MapView";
import MapLegend from "./MapLegend";
import { useHeatMapData } from "./useHeatMapData";
import { useMapStyle } from "./useMapStyle";

export default function MapPanel(props) {
  const {
    geoJsonData,
    selectedKab,
    selectedKec,
    selectedYear,
    selectedDiklat,
    wilayahData,
    heatmapEnable = true,
    onSelect,
  } = props;

  const { valueMap, maxValue, loading } = useHeatMapData({
    selectedKab,
    selectedYear,
    selectedDiklat,
  });

  const mapStyle = useMapStyle({
    heatmapEnable,
    loading,
    maxValue,
    valueMap,
    selectedKab,
    selectedKec,
  });

  const latestStyleRef = useRef(mapStyle);

  useEffect(() => {
    latestStyleRef.current = mapStyle;
  }, [mapStyle]);

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

  return (
    <div className="flex-1 bg-slate-100 rounded-xl border relative">
      <MapLegend show={heatmapEnable} />
      <MapView
        geoJsonData={geoJsonData}
        mapStyle={mapStyle}
        onEachFeature={onEachFeature}
      />
    </div>
  );
}
