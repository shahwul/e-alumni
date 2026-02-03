import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PTKHeader({ onExport }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Data Pendidik & Tenaga Kependidikan
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Kelola data guru, pantau status pelatihan, dan riwayat diklat.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={onExport}>
          <Download size={16} /> Export
        </Button>
      </div>
    </div>
  );
}
