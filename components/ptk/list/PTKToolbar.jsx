import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { FilterDialog } from "@/components/ptk/filter/FilterDialog";

export function PTKToolbar({
  search,
  setSearch,
  sorting,
  setSorting,
  onApplyFilter,
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="w-full md:w-60">
        <Select value={sorting} onValueChange={setSorting}>
          <SelectTrigger>
            <SelectValue placeholder="Urutkan..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
            <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
            <SelectItem value="sekolah_asc">Sekolah (A-Z)</SelectItem>
            <SelectItem value="status_asc">Status Kepegawaian (A-Z)</SelectItem>
            <SelectItem value="pelatihan_sudah">
              Pelatihan (Sudah - Belum)
            </SelectItem>
            <SelectItem value="pelatihan_belum">
              Pelatihan (Belum - Sudah)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex-1 w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <Input
          placeholder="Cari berdasarkan NIK atau Nama PTK..."
          className="pl-10 border-slate-200 focus-visible:ring-blue-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <FilterDialog onApplyFilter={onApplyFilter} />
    </div>
  );
}
