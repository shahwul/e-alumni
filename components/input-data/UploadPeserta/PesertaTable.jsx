// components/UploadPeserta/PesertaTable.jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, RefreshCw, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PesertaTable({ data, onCellChange, onSync, onDelete, onScrollTo, rowRefs }) {
  return (
    <div className="bg-white border rounded-md max-h-[400px] overflow-auto relative shadow-sm scroll-smooth">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="w-[40px] text-center">#</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[165px]">NIK</TableHead>
            <TableHead className="w-[200px]">Identitas Peserta</TableHead>
            <TableHead className="w-[180px]">Jabatan & Gol</TableHead>
            <TableHead className="w-[180px]">Unit Kerja</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => {
            const db = row.db_data || {};
            const isNamaBeda = db.nama && row.Nama !== db.nama;
            const isJabatanBeda = (db.jabatan && row.Jabatan !== db.jabatan) || (db.golongan && row.Golongan !== db.golongan);
            const isSekolahBeda = db.npsn && row.NPSN !== db.npsn;
            const hasDiff = isNamaBeda || isJabatanBeda || isSekolahBeda;

            return (
              <TableRow
                key={idx}
                ref={(el) => rowRefs.current.set(idx, el)}
                className={cn("border-b transition-colors duration-300", !row.isValid ? "bg-red-50/60" : "hover:bg-slate-50")}
              >
                {/* 1. NOMOR */}
                <TableCell className="text-xs text-slate-500 text-center align-top py-4">{idx + 1}</TableCell>

                {/* 2. STATUS */}
                <TableCell className="align-top py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger>
                            {row.isValid ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">Valid</Badge>
                            ) : row.status_msg.includes("Sudah Terdaftar") ? (
                                // BADGE KHUSUS SUDAH TERDAFTAR (WARNA BIRU/ORANGE)
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                                    Terdaftar
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="whitespace-nowrap">Invalid</Badge>
                            )}
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>{row.status_msg}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {row.isDuplicate && (
                      <Button
                        variant="outline" size="sm"
                        className="h-6 text-[10px] px-2 bg-yellow-50 text-yellow-700 border-yellow-300 w-full justify-start"
                        onClick={() => onScrollTo(row.duplicateTarget)}
                      >
                        <Copy className="w-3 h-3 mr-1.5" /> Ke #{row.duplicateTarget + 1}
                      </Button>
                    )}
                  </div>
                </TableCell>

                {/* 3. NIK */}
                <TableCell className="align-top py-4">
                  <Input
                    value={row.NIK || ""}
                    onChange={(e) => onCellChange(idx, "NIK", e.target.value)}
                    className={cn("h-9 text-xs font-mono", row.isDuplicate && "border-red-500 text-red-600 bg-red-50")}
                    placeholder="NIK"
                  />
                  {row.isDuplicate && <span className="text-[10px] text-red-500 font-medium block mt-1">Duplikat</span>}
                </TableCell>

                {/* 4. IDENTITAS */}
                <TableCell className="align-top py-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={row.Nama || ""}
                        onChange={(e) => onCellChange(idx, "Nama", e.target.value)}
                        disabled={row.isLocked}
                        className={cn("h-9 text-xs", isNamaBeda && !row.isLocked && "border-orange-300 bg-orange-50")}
                      />
                      {isNamaBeda && !row.isLocked && (
                        <div className="text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">DB: {db.nama}</div>
                      )}
                    </div>
                    {hasDiff && !row.isLocked && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 bg-blue-50 border border-blue-200" onClick={() => onSync(idx)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>

                {/* 5. JABATAN */}
                <TableCell className="align-top py-4">
                  <div className="space-y-2">
                    <Input
                      value={row.Jabatan || ""}
                      onChange={(e) => onCellChange(idx, "Jabatan", e.target.value)}
                      className={cn("h-8 text-[11px]", isJabatanBeda && !row.isLocked && "border-orange-300 bg-orange-50")}
                      placeholder="Jabatan"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">GOL:</span>
                      <Input
                        value={row.Golongan || ""}
                        onChange={(e) => onCellChange(idx, "Golongan", e.target.value)}
                        className="h-7 text-[11px] w-20"
                        placeholder="-"
                      />
                    </div>
                  </div>
                </TableCell>

                {/* 6. UNIT KERJA */}
                <TableCell className="align-top py-4">
                  <div className="space-y-1.5">
                    <Input
                      value={row.NPSN || ""}
                      onChange={(e) => onCellChange(idx, "NPSN", e.target.value)}
                      className={cn("h-9 text-xs w-[120px]", isSekolahBeda && !row.isLocked && "border-orange-300 bg-orange-50")}
                      placeholder="NPSN"
                    />
                    <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 min-h-[32px] flex items-center">
                      <span className="text-[11px] font-medium text-slate-700 line-clamp-2" title={row.sekolah_auto}>
                        {row.sekolah_auto || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* 7. DELETE */}
                <TableCell className="align-top py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600" onClick={() => onDelete(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}