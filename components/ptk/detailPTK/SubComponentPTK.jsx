import { useState } from "react";
import { AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SectionCard({ children, mode }) {
  const accent =
    mode === "pelita"
      ? "bg-green-50 border border-green-200"
      : "bg-blue-50 border border-blue-200";

  return (
    <section className={`rounded-xl p-4 sm:p-5 ${accent}`}>{children}</section>
  );
}

export function SectionHeader({ icon, title, mode }) {
  const titleColor = mode === "pelita" ? "text-green-700" : "text-blue-700";

  return (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
    </div>
  );
}

export function InfoItem({ label, pusat, pelita, mode, copyable = false }) {
  const beda = pusat !== pelita;
  const value = mode === "terpusat" ? pusat : pelita;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const CopyButton = () =>
    copyable && value ? (
      <TooltipProvider>
        <Tooltip open={copied || undefined}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-pointer hover:bg-slate-200"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{copied ? "Copied" : "Copy"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>

      {mode === "terpusat" ? (
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{pusat || "-"}</p>
          <CopyButton />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">
              {pelita || "-"}
            </p>

            <CopyButton />

            {beda && pelita && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600">
                <AlertCircle className="h-3 w-3" />
                Berbeda
              </span>
            )}
          </div>

          {beda && pelita && (
            <p className="text-xs text-slate-400">Data pusat: {pusat || "-"}</p>
          )}
        </>
      )}
    </div>
  );
}
