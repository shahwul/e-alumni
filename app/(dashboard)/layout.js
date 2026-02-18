"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) setUser(await res.json());
      else router.push("/login");
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) { 
        router.push("/login"); 
        router.refresh(); 
    }
    setIsLoggingOut(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans relative">
      
      {/* --- 1. OVERLAY MOBILE --- */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* --- 2. SIDEBAR MOBILE (DRAWER) --- */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-[110] md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <DashboardSidebar 
          user={user} 
          collapsed={false} 
          isMobile={true}
          setMobileOpen={setMobileOpen}
          pathname={pathname} 
          navigate={(path) => {
            router.push(path);
            setMobileOpen(false); 
          }} 
          getInitials={getInitials}
          handleLogout={handleLogout} 
          isLoggingOut={isLoggingOut}
        />
      </aside>

      {/* --- 3. SIDEBAR DESKTOP --- */}
      <aside className={`hidden md:flex flex-col bg-slate-900 transition-all duration-300 relative z-30 ${collapsed ? "w-16" : "w-64"} overflow-visible`}>
        <DashboardSidebar 
            user={user} 
            collapsed={collapsed} 
            setCollapsed={setCollapsed}
            pathname={pathname} 
            navigate={router.push} 
            getInitials={getInitials}
            handleLogout={handleLogout} 
            isLoggingOut={isLoggingOut}
        />
      </aside>

      {/* --- 4. AREA KONTEN UTAMA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <DashboardTopbar 
          user={user} 
          setMobileOpen={setMobileOpen} 
          pathname={pathname} 
          getInitials={getInitials} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {children}
          <Toaster position="top-center" richColors />
        </main>
      </div>
      
    </div>
  );
}