"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import DiklatCardHeader from "./DiklatCardHeader";
import DiklatCardTabs from "./DiklatCardTabs";
import useDiklatEdit from "./useDiklatEdit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DiklatCard({ data, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const edit = useDiklatEdit(data, onRefresh);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "-";

  return (
    <div
      className={cn(
        "group border rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md",
        expanded
          ? "ring-2 ring-blue-100 border-blue-300"
          : "border-slate-200"
      )}
    >
      <DiklatCardHeader
        data={data}
        expanded={expanded}
        isEditing={edit.isEditing}
        setExpanded={setExpanded}
        formatDate={formatDate}
        onDelete={edit.handleDelete}
      />

      {expanded && (
        <DiklatCardTabs
          data={data}
          onRefresh={onRefresh}
          editProps={edit}
        />
      )}

      <AlertDialog open={edit.showDeleteDialog} onOpenChange={edit.setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Diklat</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus Diklat "{data.title}"?
              <br /><br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={edit.confirmDelete} className="bg-red-600 hover:bg-red-700">Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
