"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  FileInput, 
  Database, 
  ChevronDown, 
  Bell, 
  Search,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// --- KOMPONEN SIDEBAR ITEM (Kecil-kecil biar rapi) ---
function SidebarItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// --- LAYOUT UTAMA ---
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDatabaseOpen, setDatabaseOpen] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Buat mobile responsive

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR (KIRI) ================= */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
        } bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 fixed md:relative z-50 h-full`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
              E
            </div>
            <span className="text-xl font-bold tracking-tight">E-Alumni</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <SidebarItem icon={<Map size={18} />} label="Sebaran & Infografis" active={pathname === '/sebaran'} onClick={() => router.push('/sebaran')} />
          <SidebarItem icon={<FileInput size={18} />} label="Input Data" active={pathname === '/input-data'} onClick={() => router.push('/input-data')} />

          {/* Menu Database (Accordion) */}
          <div className="pt-2">
            <button 
              onClick={() => setDatabaseOpen(!isDatabaseOpen)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Database size={18} />
                <span className="font-medium text-sm">Database</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isDatabaseOpen ? "rotate-180" : ""}`} 
              />
            </button>
            
            {/* Sub Menu */}
            {isDatabaseOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3 animate-in slide-in-from-top-2 duration-200">
                <div onClick={() => router.push('/ptk')} className={`block px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${pathname === '/ptk' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  Data PTK
                </div>
                <div onClick={() => router.push('/diklat')} className={`block px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${pathname === '/diklat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  Data Diklat
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Sidebar (Optional) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
           <p className="text-xs text-slate-500 text-center">© 2025 BBGTK DIY</p>
        </div>
      </aside>


      {/* ================= CONTENT WRAPPER (KANAN) ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">


        {/* --- MAIN CONTENT AREA (TENGAH) --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
           {/* Ini tempat tabel PTK kamu nanti muncul */}
           <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
              {children}
           </div>
        </main>

      </div>
    </div>
  );
}