import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { FileText } from "lucide-react";

export default function RiwayatPendidikanSertifikasi({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<FileText className="h-4 w-4" />}
          title="Riwayat Pendidikan & Sertifikasi"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="Jenjang Pendidikan Terakhir"
            pusat={pusat?.jenjang_terakhir}
            pelita={pelita?.jenjang_terakhir}
            mode={mode}
          />
          <InfoItem
            label="Bidang Pendidikan"
            pusat={pusat?.bidang_pendidikan}
            pelita={pelita?.bidang_pendidikan}
            mode={mode}
          />
          <InfoItem
            label="Sertifikasi"
            pusat={pusat?.sertifikasi}
            pelita={pelita?.sertifikasi}
            mode={mode}
          />
          <InfoItem
            label="Tugas Tambahan"
            pusat={pusat?.tugas_tambahan_jabatan_ptk}
            pelita={pelita?.tugas_tambahan_jabatan_ptk}
            mode={mode}
          />
        </div>
      </SectionCard>
    </>
  );
}
