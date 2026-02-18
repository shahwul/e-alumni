import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function PTKSelectedActionsBar({ count, onClear, onAction }) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 border border-slate-700">
      <div className="flex flex-col">
        <span className="text-sm font-bold">{count} PTK Dipilih</span>
        <span className="text-[10px] text-slate-400">Siap diproses</span>
      </div>
      <div className="h-8 w-[1px] bg-slate-700 mx-2" />
      <Button 
        size="sm" 
        className="bg-blue-600 hover:bg-blue-500"
        onClick={onAction}
      >
        + Masukkan ke Kandidat
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 rounded-full hover:bg-slate-800 text-slate-400" 
        onClick={onClear}
      >
        <X size={16} />
      </Button>
    </div>
  );
}