// components/ui/data-table.jsx
"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTable({
  columns,
  data,
  rowSelection = {}, 
  setRowSelection, 
  sorting = [],        // Default array kosong
  onSortingChange,     // Handler dari parent
  enableRowClick = true,
}) {
  const table = useReactTable({
    data, 
    columns,
    getCoreRowModel: getCoreRowModel(),

    // --- SETUP SORTING SERVER-SIDE ---
    manualSorting: true,          // Wajib true agar tabel tidak sort lokal
    onSortingChange: onSortingChange, 
    
    // --- SETUP SELEKSI ---
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.nik || row.id, // ID Unik Row

    // --- STATE ---
    state: {
      rowSelection,
      sorting, // Masukkan state sorting ke sini
    },
  })

  return (
    <div className="w-full bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {

                const customWidth = header.column.columnDef.meta?.className || "";

                return (
                  <TableHead 
                    key={header.id} 
                    className={`sticky top-0 z-20 bg-slate-50 shadow-sm font-bold text-slate-700 ${customWidth}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                
                // 1. TAMBAHKAN CLASS INTERAKTIF
                className={`hover:bg-slate-50 transition-colors ${enableRowClick ? 'cursor-pointer' : ''}`}

                // 2. LOGIC KLIK BARIS (CLICK-TO-SELECT)
                onClick={(e) => {
                  if (!enableRowClick) return;
                  const target = e.target;
                  
                  // PENGAMAN: Jangan select row jika yang diklik adalah elemen interaktif lain
                  if (
                    target.closest("button") ||           // Tombol (Action/Copy)
                    target.closest("[role='checkbox']") || // Checkbox bawaan
                    target.closest("a") ||                // Link (jika ada)
                    target.closest("input")               // Input field (jika ada)
                  ) {
                    return;
                  }

                  // Toggle seleksi baris ini
                  row.toggleSelected(!row.getIsSelected());
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const customWidth = cell.column.columnDef.meta?.className || "";
                  
                  return (
                    <TableCell key={cell.id} className={customWidth}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}