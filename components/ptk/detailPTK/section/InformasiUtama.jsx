import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InformasiUtama({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<User className="h-4 w-4" />}
          title="Informasi Utama"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="Nama Lengkap"
            pusat={pusat?.nama_lengkap}
            pelita={pelita?.nama_lengkap}
            mode={mode}
            copyable
          />
          <InfoItem
            label="NIK"
            pusat={pusat?.nik}
            pelita={pelita?.nik}
            mode={mode}
            copyable
          />
          <InfoItem
            label="NUPTK"
            pusat={pusat?.nuptk}
            pelita={pelita?.nuptk}
            mode={mode}
          />
          <InfoItem
            label="NIP"
            pusat={pusat?.nip}
            pelita={pelita?.nip}
            mode={mode}
          />
          <InfoItem
            label="Jenis PTK"
            pusat={pusat?.jenis_ptk}
            pelita={pelita?.jenis_ptk}
            mode={mode}
          />
          <InfoItem
            label="Jabatan PTK"
            pusat={pusat?.jabatan_ptk}
            pelita={pelita?.jabatan_ptk}
            mode={mode}
          />
          <InfoItem
            label="Status Kepegawaian"
            pusat={pusat?.status_kepegawaian}
            pelita={pelita?.status_kepegawaian}
            mode={mode}
          />
        </div>

        <div className="mt-5">
          {pusat?.pernah_pelatihan ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
              Sudah Pernah Pelatihan
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
              Belum Pernah Pelatihan
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
}
