"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Map,
  FileInput,
  Database,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  Menu,
  BarChart2,
  Settings,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// --- TOOLTIP saat sidebar collapsed ---
function Tooltip({ label, children }) {
  if (!label) return children;
  return (
    <div className="relative group/tooltip overflow-hidden">
      {children}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none
        bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap
        opacity-0 group-hover/tooltip:opacity-100 translate-x-1 group-hover/tooltip:translate-x-0
        transition-all duration-150 border border-slate-700">
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
      </div>
    </div>
  );
}

// --- SIDEBAR ITEM ---
function SidebarItem({ icon, label, active = false, onClick, collapsed }) {
  const base = `flex w-full items-center gap-3 rounded-lg transition-all duration-200 group relative
    ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5"}
    ${active
      ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
    }`;

  const btn = (
    <button onClick={onClick} className={base}>
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="font-medium text-sm truncate">{label}</span>}
      {!collapsed && active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-300" />
      )}
    </button>
  );

  return collapsed ? <Tooltip label={label}>{btn}</Tooltip> : btn;
}

// --- DIVIDER dengan label ---
function SidebarDivider({ label, collapsed }) {
  if (collapsed) return <div className="my-3 mx-auto w-6 h-px bg-slate-800" />;
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

// --- LAYOUT UTAMA ---
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDatabaseOpen, setDatabaseOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // --- STATE USER DATA ---
  const [user, setUser] = useState(null);

  // 1. Ambil Data User Saat Mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };
    fetchUser();
  }, [router]);

  // 2. Fungsi Inisial Nama
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh(); 
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navigate = (path) => {
    router.push(path);
    setMobileOpen(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo + Toggle */}
      <div className={`h-16 flex items-center border-b border-slate-800/60 shrink-0 bg-slate-950/20
        ${collapsed && !isMobile ? "justify-center px-0" : "px-4 justify-between"}`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-blue-900/40 text-white">E</div>
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight block leading-tight">E-Alumni</span>
              <span className="text-[10px] text-slate-500 block leading-tight">BBGTK DIY</span>
            </div>
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/40 text-white">E</div>
        )}
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)} className={`h-7 w-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 shrink-0 ${collapsed ? "absolute -right-3.5 top-4 shadow-md border border-slate-700/50 z-10" : ""}`}>
            <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className={`space-y-0.5 ${collapsed && !isMobile ? "px-2" : "px-3"}`}>
          <SidebarDivider label="Menu" collapsed={collapsed && !isMobile} />
          <SidebarItem icon={<Map size={17} />} label="Sebaran & Infografis" active={pathname === "/sebaran"} onClick={() => navigate("/sebaran")} collapsed={collapsed && !isMobile} />
          <SidebarItem icon={<FileInput size={17} />} label="Input Data" active={pathname === "/input-data"} onClick={() => navigate("/input-data")} collapsed={collapsed && !isMobile} />
          <SidebarDivider label="Data" collapsed={collapsed && !isMobile} />
          
          {/* Database Accordion (Logika tetap sama dengan props baru) */}
          {collapsed && !isMobile ? (
             <div className="space-y-0.5">
               <Tooltip label="Database">
                 <button onClick={() => setDatabaseOpen(!isDatabaseOpen)} className={`flex w-10 mx-auto items-center justify-center rounded-lg py-2.5 transition-all duration-200 ${(pathname === "/ptk" || pathname === "/diklat") ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}`}><Database size={17} /></button>
               </Tooltip>
               {isDatabaseOpen && (
                 <div className="space-y-0.5 mt-1">
                   <Tooltip label="Data PTK"><button onClick={() => navigate("/ptk")} className={`flex w-10 mx-auto items-center justify-center rounded-lg py-2 text-[11px] font-bold transition-all duration-200 ${pathname === "/ptk" ? "bg-blue-600/80 text-white" : "text-slate-500 hover:bg-slate-800 hover:text-white"}`}>P</button></Tooltip>
                   <Tooltip label="Data Diklat"><button onClick={() => navigate("/diklat")} className={`flex w-10 mx-auto items-center justify-center rounded-lg py-2 text-[11px] font-bold transition-all duration-200 ${pathname === "/diklat" ? "bg-blue-600/80 text-white" : "text-slate-500 hover:bg-slate-800 hover:text-white"}`}>D</button></Tooltip>
                 </div>
               )}
             </div>
          ) : (
            <div>
              <button onClick={() => setDatabaseOpen(!isDatabaseOpen)} className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${(pathname === "/ptk" || pathname === "/diklat") && !isDatabaseOpen ? "text-blue-400 bg-blue-600/10" : "text-slate-400 hover:bg-slate-800/80 hover:text-white"}`}>
                <div className="flex items-center gap-3"><Database size={17} className="shrink-0" /><span className="font-medium text-sm">Database</span></div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDatabaseOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDatabaseOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-slate-800 pl-3">
                  {[{ label: "Data PTK", path: "/ptk" }, { label: "Data Diklat", path: "/diklat" }].map(({ label, path }) => (
                    <button key={path} onClick={() => navigate(path)} className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-150 ${pathname === path ? "bg-blue-600/15 text-blue-400 border border-blue-600/20" : "text-slate-500 hover:text-white hover:bg-slate-800/70"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${pathname === path ? "bg-blue-400" : "bg-slate-700"}`} />{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SidebarDivider label="Lainnya" collapsed={collapsed && !isMobile} />
          <SidebarItem icon={<Settings size={17} />} label="Pengaturan" active={pathname === "/settings"} onClick={() => navigate("/settings")} collapsed={collapsed && !isMobile} />
        </div>
      </nav>

      {/* Footer User Info - WIRING API DATA */}
      <div className="h-[60px] border-t border-slate-800/60 bg-slate-950/20 shrink-0 flex items-center px-3">
        <div 
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-red-500/10 transition-colors cursor-pointer group w-full ${isLoggingOut ? "opacity-50" : ""}`}
        >
          <Tooltip label={collapsed && !isMobile ? "Logout" : null}>
            <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-700 group-hover:ring-red-500 transition-all">
              <AvatarFallback className="bg-blue-700 text-white text-[10px] font-bold">
                {user ? getInitials(user.nama) : "..."}
              </AvatarFallback>
            </Avatar>
          </Tooltip>
          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.nama || "Memuat..."}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">
                  {user?.email || "bbgtk@diy.id"}
                </p>
              </div>
              {isLoggingOut ? <Loader2 size={12} className="animate-spin text-red-400" /> : <LogOut size={14} className="text-slate-600 group-hover:text-red-400 transition-colors" />}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`hidden md:flex flex-col bg-slate-900 text-white shrink-0 relative transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}><SidebarContent /></aside>
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 md:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}><SidebarContent isMobile /></aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="md:hidden h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Menu size={20} /></button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">E-Alumni</span><span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700 capitalize">{pathname === "/ptk" ? "PTK" : pathname.replace("/", "").replace("-", " ")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative hidden sm:flex items-center">
              <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Cari data..." className="h-9 pl-9 pr-4 rounded-lg bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white outline-none text-sm w-44 focus:w-56 transition-all duration-300 text-slate-700 placeholder:text-slate-400" />
            </div>

            <button className="relative h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Bell size={18} /><span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" /></button>

            {/* Avatar Header - WIRING API DATA */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 ml-1">
              <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-blue-500 transition-all cursor-pointer">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {user ? getInitials(user.nama) : "..."}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-700 leading-tight">
                   {user?.nama || "User"}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight uppercase tracking-tighter">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-2 px-4 md:px-6 lg:px-8 bg-slate-50">
          <div className="mx-auto max-w-8xl">{children}</div>
        </main>
      </div>
    </div>
  );
}