import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { MapPin } from "lucide-react";

export default function Wilayah({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<MapPin className="h-4 w-4" />}
          title="Wilayah"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="Kode Pos"
            pusat={pusat?.kode_pos}
            pelita={pelita?.kode_pos}
            mode={mode}
          />
          <InfoItem
            label="Kecamatan"
            pusat={pusat?.kecamatan}
            pelita={pelita?.kecamatan}
            mode={mode}
          />
          <InfoItem
            label="Kabupaten / Kota"
            pusat={pusat?.kabupaten_kota}
            pelita={pelita?.kabupaten_kota}
            mode={mode}
          />
          <InfoItem
            label="NPSN"
            pusat={pusat?.npsn}
            pelita={pelita?.npsn}
            mode={mode}
          />
        </div>
      </SectionCard>
    </>
  );
}
