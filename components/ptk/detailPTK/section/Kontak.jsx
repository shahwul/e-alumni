import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { Phone } from "lucide-react";

export default function Kontak({ mode, pusat, pelita }) {
  return (
    <>
      <SectionCard mode={mode}>
        <SectionHeader
          icon={<Phone className="h-4 w-4" />}
          title="Kontak"
          mode={mode}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <InfoItem
            label="No. HP"
            pusat={pusat?.no_hp}
            pelita={pelita?.no_hp}
            mode={mode}
          />
          <InfoItem
            label="Email"
            pusat={pusat?.email}
            pelita={pelita?.email}
            mode={mode}
          />
        </div>
      </SectionCard>
    </>
  );
}
