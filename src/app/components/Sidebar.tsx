"use client";
import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, X, ShieldCheck } from "lucide-react";

/* Shared open/close state so the page header's menu button can toggle the sidebar on mobile */
const SidebarCtx = createContext<{ open: boolean; toggle: () => void; close: () => void }>({
  open: false, toggle: () => {}, close: () => {},
});
export const useSidebar = () => useContext(SidebarCtx);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen((o) => !o), close: () => setOpen(false) }}>
      {children}
    </SidebarCtx.Provider>
  );
}

const NAV: Array<{ label: string; href: string; icon: typeof LayoutDashboard; badge?: number }> = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  // { label: "Zones", href: "/zones", icon: MapPin },
  // { label: "Live Cameras", href: "/cameras", icon: Video },
  // { label: "Alerts & Incidents", href: "/alerts", icon: BellRing, badge: 12 }, // badge = mock open-alert count
  // { label: "Analytics", href: "/analytics", icon: BarChart3 },
  // { label: "Configuration", href: "/configuration", icon: Settings },
];

export default function Sidebar() {
  const { open, close } = useSidebar();
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={close} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3F2042] shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#D3A966]" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold tracking-tight text-[#12343B]">Sensilance</div>
              <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">AI Safety</div>
            </div>
          </div>
          <button 
            className="lg:hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-[#12343B] transition-colors" 
            onClick={close} 
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {NAV.map(({ label, href, icon: Icon, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link 
                key={label} 
                href={href} 
                onClick={close} 
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  active 
                    ? "bg-[#3F2042] text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#12343B]"
                }`}
              >
                {/* {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-[#D3A966]" />
                )} */}
                <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-[#D3A966]" : "text-gray-400 group-hover:text-[#D3A966]"}`} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D3A966] px-1.5 text-[10px] font-bold text-[#12343B] shadow-sm">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D3A966] to-[#b88f52] text-sm font-bold text-white shadow-sm">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#12343B]">Site Manager</div>
              <div className="truncate text-xs text-gray-500">manager@example.com</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}