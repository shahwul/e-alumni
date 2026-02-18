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
  sorting = [],        
  onSortingChange,     
  enableRowClick = true,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, 
    enableMultiSort: true,

    onSortingChange: (updater) => {
      const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
      if (onSortingChange) {
        onSortingChange(nextSorting);
      }
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.nik || row.id,
    state: {
      rowSelection,
      sorting,
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
                className={`hover:bg-slate-50 transition-colors ${enableRowClick ? 'cursor-pointer' : ''}`}
                onClick={(e) => {
                  if (!enableRowClick) return;
                  const target = e.target;
                  if (
                    target.closest("button") ||   
                    target.closest("[role='checkbox']") ||
                    target.closest("a") ||                
                    target.closest("input")               
                  ) {
                    return;
                  }
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