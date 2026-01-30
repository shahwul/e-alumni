import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { Briefcase } from "lucide-react";

export default function Kepegawaian({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<Briefcase className="h-4 w-4" />}
          title="Kepegawaian"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="Pangkat / Golongan"
            pusat={pusat?.pangkat_golongan}
            pelita={pelita?.pangkat_golongan}
            mode={mode}
          />
          <InfoItem
            label="SK CPNS"
            pusat={pusat?.sk_cpns}
            pelita={pelita?.sk_cpns}
            mode={mode}
          />
          <InfoItem
            label="Tanggal CPNS"
            pusat={pusat?.tanggal_cpns}
            pelita={pelita?.tanggal_cpns}
            mode={mode}
          />
          <InfoItem
            label="SK Pengangkatan"
            pusat={pusat?.sk_pengangkatan}
            pelita={pelita?.sk_pengangkatan}
            mode={mode}
          />
          <InfoItem
            label="TMT Pengangkatan"
            pusat={pusat?.tmt_pengangkatan}
            pelita={pelita?.tmt_pengangkatan}
            mode={mode}
          />
          <InfoItem
            label="TMT Tugas"
            pusat={pusat?.tmt_tugas}
            pelita={pelita?.tmt_tugas}
            mode={mode}
          />
          <InfoItem
            label="Masa Kerja (Tahun)"
            pusat={pusat?.masa_kerja}
            pelita={pelita?.masa_kerja}
            mode={mode}
          />
        </div>
      </SectionCard>
    </>
  );
}
