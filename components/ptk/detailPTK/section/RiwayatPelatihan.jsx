import React from "react";
import { SectionCard, SectionHeader, InfoItem } from "../SubComponentPTK";
import { GraduationCap } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function RiwayatPelatihan({ mode, pusat, pelita }) {
  const data = mode === "pelita" ? pelita : pusat;

  const isEmpty = !data || data.length === 0;

  return (
    <SectionCard mode={mode}>
      <SectionHeader
        icon={<GraduationCap className="h-4 w-4" />}
        title="Riwayat Pelatihan"
        mode={mode}
      />

      {isEmpty ? (
        <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
          —
        </div>
      ) : (
        <Accordion type="multiple" className="mt-4">
          {data.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.nama}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoItem
                    label="Tahun"
                    pusat={item?.tahun}
                    pelita={item?.tahun}
                    mode={mode}
                  />
                  <InfoItem
                    label="Angkatan"
                    pusat={item?.angkatan}
                    pelita={item?.angkatan}
                    mode={mode}
                  />
                  <InfoItem
                    label="Status"
                    pusat={item?.status}
                    pelita={item?.status}
                    mode={mode}
                  />
                  <InfoItem
                    label="Nilai Akhir"
                    pusat={item?.nilai_akhir}
                    pelita={item?.nilai_akhir}
                    mode={mode}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </SectionCard>
  );
}
