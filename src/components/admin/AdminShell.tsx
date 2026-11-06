"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Compass,
  Database,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";

interface AdminShellProps {
  adminEmail: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/participants",
    label: "Participants",
    icon: Users,
  },
  {
    href: "/solo",
    label: "Solo Storyboard",
    icon: Sparkles,
  },
  {
    href: "/admin/senior",
    label: "Senior Mode",
    icon: Compass,
  },
  {
    href: "/admin/junior",
    label: "Junior Mode",
    icon: GraduationCap,
  },
  {
    href: "/admin/subjects",
    label: "Subjects",
    icon: BookOpen,
  },
  {
    href: "/admin/questions",
    label: "Question Bank",
    icon: Database,
  },
  {
    href: "/admin/attempts",
    label: "Attempts",
    icon: ClipboardList,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AdminShell({ adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  const isRouteActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F3EC] text-[#1C1917]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#141210] text-[#FAF7F2] border-r border-[#2B2723]">
        <div className="px-5 h-16 flex items-center justify-between border-b border-[#2B2723]">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full border border-zinc-600 overflow-hidden shadow-sm flex-shrink-0">
              <Image
                src="/brand/logo-header.png"
                alt="THE UNWRITTEN"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-[#FAF7F2] font-semibold">
                THE UNWRITTEN
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#9E2A2B] mt-0.5 font-mono font-bold">
                COMMAND CENTRE
              </span>
            </div>
          </div>
          <Shield className="w-4 h-4 text-zinc-500" aria-hidden="true" />
        </div>

        <nav
          aria-label="Administrator navigation"
          className="flex-1 px-3 py-5 space-y-1 overflow-y-auto"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "bg-[#FAF7F2] text-[#141210] font-semibold"
                    : "text-[#A89F93] hover:text-[#FAF7F2] hover:bg-[#1F1C19]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2B2723] space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-[11px] text-[#A89F93] hover:text-[#FAF7F2] rounded-sm hover:bg-[#1F1C19] transition-colors"
          >
            <span>Open Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-3 py-2 bg-[#1C1916] rounded-sm border border-[#2B2723]">
            <span className="block text-[9px] uppercase tracking-[0.2em] text-[#8A8178]">
              Authorized Curator
            </span>
            <span className="block text-xs text-[#E7E0D3] truncate mt-0.5 font-mono">
              {adminEmail}
            </span>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#D8A7A4] hover:text-[#FAF7F2] hover:bg-[#9E6B68]/25 border border-[#2B2723] rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#141210] text-[#FAF7F2] border-b border-[#2B2723] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-full border border-zinc-600 overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src="/brand/logo-header.png"
              alt="THE UNWRITTEN"
              fill
              priority
              className="object-contain"
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.24em] font-semibold">
            THE UNWRITTEN <span className="text-[#9E2A2B]">/ CONTROL</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle administrator menu"
          className="p-2 text-[#D6CEC0] hover:text-[#FAF7F2] cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141210] text-[#FAF7F2] border-b border-[#2B2723] px-4 py-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-[0.16em] ${
                  active
                    ? "bg-[#FAF7F2] text-[#141210] font-semibold"
                    : "text-[#D6CEC0] hover:bg-[#1F1C19]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#2B2723] flex items-center justify-between px-2">
            <span className="text-xs font-mono text-[#A89F93] truncate">
              {adminEmail}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-xs uppercase tracking-[0.14em] text-[#D8A7A4] py-1.5 px-3 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Analytical Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
