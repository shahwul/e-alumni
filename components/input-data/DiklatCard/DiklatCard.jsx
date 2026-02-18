"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import DiklatCardHeader from "./DiklatCardHeader";
import DiklatCardTabs from "./DiklatCardTabs";
import useDiklatEdit from "./useDiklatEdit";
import { is } from "date-fns/locale";

export default function DiklatCard({ data, onRefresh, isExpanded, onExpand }) {
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
        isExpanded
          ? "ring-2 ring-blue-100 border-blue-300"
          : "border-slate-200"
      )}
    >
      <DiklatCardHeader
        data={data}
        expanded={isExpanded}
        setExpanded={onExpand}
        isEditing={edit.isEditing}
        formatDate={formatDate}
      />

      {isExpanded && (
        <DiklatCardTabs
          data={data}
          onRefresh={onRefresh}
          editProps={edit}
        />
      )}
    </div>
  );
}
