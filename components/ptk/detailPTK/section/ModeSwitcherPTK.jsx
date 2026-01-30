"use client";
import { cn } from "@/lib/utils";
import { Database, Sparkles } from "lucide-react";

export default function ModeSwitcherPTK({ mode, setMode }) {
  return (
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-lg text-slate-900">Sumber Data</h4>

      <div className="flex items-center bg-slate-100 p-1 rounded-lg border">
        <button
          onClick={() => setMode("terpusat")}
          className={cn(
            "px-3 py-1 text-xs rounded-md",
            mode === "terpusat"
              ? "bg-white shadow text-blue-700"
              : "text-slate-500",
          )}
        >
          <Database className="inline text-lg w-3 mr-1" />
          Pusat
        </button>

        <button
          onClick={() => setMode("pelita")}
          className={cn(
            "px-3 py-1 text-xs rounded-md",
            mode === "pelita"
              ? "bg-white shadow text-green-700"
              : "text-slate-500",
          )}
        >
          <Sparkles className="inline h-3 w-3 mr-1" />
          Pelita
        </button>
      </div>
    </div>
  );
}
