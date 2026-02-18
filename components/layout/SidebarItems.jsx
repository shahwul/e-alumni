import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarItem({ icon, label, active = false, onClick, collapsed }) {
  const base = `flex w-full items-center gap-3 rounded-lg transition-all duration-200 group relative
    ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5"}
    ${active ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}`;

  const button = (
    <button onClick={onClick} className={base}>
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="font-medium text-sm truncate">{label}</span>}
      {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-300" />}
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return button;
}

export function SidebarDivider({ label, collapsed }) {
  if (collapsed) return <div className="my-3 mx-auto w-6 h-px bg-slate-800" />;
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}