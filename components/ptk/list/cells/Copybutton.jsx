"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CopyButton({ row }) {
  const ptk = row.original;

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!ptk.nik) return;
    navigator.clipboard.writeText(ptk.nik);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return ptk.nik ? (
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
}
