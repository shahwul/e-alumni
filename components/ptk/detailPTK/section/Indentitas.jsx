import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { IdCard } from "lucide-react";

const formatGender = (code) => {
  if (!code) return "-";
  const cleanCode = String(code).toUpperCase().trim();

  if (cleanCode === "L") return "Laki-Laki";
  if (cleanCode === "P") return "Perempuan";

  return code;
};

export default function Identitas({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<IdCard className="h-4 w-4" />}
          title="Identitas"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="Jenis Kelamin"
            pusat={formatGender(pusat?.jenis_kelamin)}
            pelita={formatGender(pelita?.jenis_kelamin)}
            mode={mode}
          />
          <InfoItem
            label="Tempat Lahir"
            pusat={pusat?.tempat_lahir}
            pelita={pelita?.tempat_lahir}
            mode={mode}
          />
          <InfoItem
            label="Tanggal Lahir"
            pusat={pusat?.tanggal_lahir}
            pelita={pelita?.tanggal_lahir}
            mode={mode}
          />
          <InfoItem
            label="Agama"
            pusat={pusat?.agama}
            pelita={pelita?.agama}
            mode={mode}
          />
        </div>
      </SectionCard>
    </>
  );
}
