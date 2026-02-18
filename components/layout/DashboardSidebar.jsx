"use client";

import { useState } from "react";
import { Map, FileInput, Database, ChevronDown, ChevronLeft, LogOut, Loader2, Settings, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarItem, SidebarDivider } from "./SidebarItems";

export default function DashboardSidebar({ 
  user, collapsed, setCollapsed, pathname, navigate, handleLogout, isLoggingOut, isMobile, setMobileOpen, getInitials 
}) {
  const [isDatabaseOpen, setDatabaseOpen] = useState(true);

  const handleDatabaseClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setDatabaseOpen(true);
    } else {
      setDatabaseOpen(!isDatabaseOpen);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-900">
      
      {/* Logo Section */}
      <div className={`h-16 flex items-center border-b border-slate-800/60 shrink-0 bg-slate-950/20 ${collapsed && !isMobile ? "justify-center" : "px-4 justify-between"}`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 overflow-hidden text-white">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-blue-600/20">E</div>
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight block leading-tight">E-Alumni</span>
              <span className="text-[10px] text-slate-500 block leading-tight">BBGTK DIY</span>
            </div>
          </div>
        )}
        
        {collapsed && !isMobile && (
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-600/20">E</div>
        )}
        
        {/* Toggle Button */}
        {!isMobile && (
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`h-7 w-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all absolute ${collapsed ? "-right-3.5" : "right-4"} top-4 z-[100] border border-slate-700 shadow-xl`}
          >
            <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Nav Content */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide overflow-x-hidden">
        <div className={`space-y-0.5 ${collapsed && !isMobile ? "px-2" : "px-3"}`}>
          <SidebarDivider label="Menu" collapsed={collapsed && !isMobile} />
          <SidebarItem icon={<Map size={17} />} label="Sebaran" active={pathname === "/sebaran"} onClick={() => navigate("/sebaran")} collapsed={collapsed && !isMobile} />
          <SidebarItem icon={<FileInput size={17} />} label="Input Data" active={pathname === "/input-data"} onClick={() => navigate("/input-data")} collapsed={collapsed && !isMobile} />
          
          <SidebarDivider label="Data" collapsed={collapsed && !isMobile} />

          {/* DATABASE ACCORDION */}
          <div className="space-y-0.5">
            <button 
              onClick={handleDatabaseClick}
              className={`flex w-full items-center rounded-lg transition-all duration-200 group
                ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5 justify-between"}
                ${(pathname === "/ptk" || pathname === "/diklat") ? "text-blue-400 bg-blue-600/10" : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <Database size={17} className="shrink-0" />
                {!collapsed && <span className="font-medium text-sm">Database</span>}
              </div>
              {!collapsed && (
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDatabaseOpen ? "rotate-180" : ""}`} />
              )}
            </button>

            {!collapsed && (
              <div className={`overflow-hidden transition-all duration-300 ${isDatabaseOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 space-y-0.5 border-l-2 border-slate-800 pl-3">
                  <button onClick={() => navigate("/ptk")} className={`flex w-full items-center gap-2 px-3 py-2 text-xs rounded-md transition-all ${pathname === "/ptk" ? "text-blue-400 font-bold bg-blue-600/5" : "text-slate-500 hover:text-slate-200"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${pathname === "/ptk" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" : "bg-slate-700"}`} /> Data PTK
                  </button>
                  <button onClick={() => navigate("/diklat")} className={`flex w-full items-center gap-2 px-3 py-2 text-xs rounded-md transition-all ${pathname === "/diklat" ? "text-blue-400 font-bold bg-blue-600/5" : "text-slate-500 hover:text-slate-200"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${pathname === "/diklat" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" : "bg-slate-700"}`} /> Data Diklat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer Logout Section */}
      <div className="mt-auto border-t border-slate-800/60 bg-slate-950/20 px-3 py-3 shrink-0">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-lg transition-all duration-200 group w-full text-left
            ${collapsed ? "justify-center p-2" : "px-3 py-2 hover:bg-red-500/10"}`}
        >
          <div className="relative">
             <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-800 group-hover:ring-red-500/50 transition-all">
                <AvatarFallback className="bg-blue-700 text-white text-[10px] font-bold">
                  {getInitials(user?.nama)}
                </AvatarFallback>
             </Avatar>
             {isLoggingOut && (
               <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center">
                 <Loader2 size={12} className="animate-spin text-white" />
               </div>
             )}
          </div>
          
          {!collapsed && (
            <div className="flex-1 overflow-hidden flex justify-between items-center">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.nama || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate group-hover:text-red-400 transition-colors">Logout Aplikasi</p>
              </div>
              <LogOut size={14} className="text-slate-600 group-hover:text-red-400 transition-colors shrink-0" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}