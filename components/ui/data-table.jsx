// components/ui/data-table.jsx
"use client"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
                return (
                  <TableHead key={header.id}>
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
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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