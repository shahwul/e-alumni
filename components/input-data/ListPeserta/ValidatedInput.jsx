// components/list-peserta/ValidatedInput.jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ValidatedInput({ label, field, value, onChange, placeholder, isLoading, status }) {
  return (
    <div className="space-y-1 relative">
        <div className="flex justify-between items-center">
            <Label className="text-[10px] text-slate-500 uppercase font-semibold">{label}</Label>
            {!isLoading && status.msg && (
                <span className={cn("text-[9px] font-medium", status.isValid ? "text-green-600" : "text-red-500")}>
                    {status.msg}
                </span>
            )}
        </div>
        <div className="relative">
            <Input 
                value={value || ''} 
                onChange={(e) => onChange(field, e.target.value)} 
                className={cn(
                    "h-8 text-xs bg-white pr-8", 
                    !status.isValid ? "border-red-500 focus-visible:ring-red-200" : 
                    (status.msg && status.isValid) ? "border-green-500 focus-visible:ring-green-200" : ""
                )}
                placeholder={placeholder}
            />
            <div className="absolute right-2.5 top-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-blue-500"/> : 
                 (!status.isValid) ? <AlertCircle className="h-4 w-4 text-red-500"/> :
                 (status.msg && status.isValid) ? <CheckCircle className="h-4 w-4 text-green-500"/> : null
                }
            </div>
        </div>
    </div>
  );
}