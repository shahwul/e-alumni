import { Menu, Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardTopbar({ user, setMobileOpen, pathname, getInitials }) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => setMobileOpen(true)} className="md:hidden h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-slate-400">E-Alumni</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700 capitalize">
            {pathname === "/ptk" ? "PTK" : pathname.replace("/", "").replace("-", " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2 pl-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-slate-700 leading-tight">{user?.nama || "User"}</p>
            <p className="text-[10px] text-slate-400 leading-tight uppercase">{user?.role || "Admin"}</p>
          </div>
          <Avatar className="h-8 w-8 ring-2 ring-slate-100">
            <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">{getInitials(user?.nama)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}