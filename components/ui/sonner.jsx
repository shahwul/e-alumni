"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast font-sans3 flex gap-3 p-4 !rounded-[20px] !bg-white !border-slate-100 !shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
          description: "text-slate-500 text-[11px]",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          success: "!text-green-600 !border-green-100 !bg-green-50/50",
          error: "!text-red-600 !border-red-100 !bg-red-50/50",
          info: "!text-blue-600 !border-blue-100 !bg-blue-50/50",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-slate-400" />,
      }}
      {...props} 
    />
  );
}

export { Toaster }