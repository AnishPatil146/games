"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";

interface AdminNavProps {
  adminEmail?: string;
}

export function AdminNav({ adminEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/curator/login");
    } catch {
      router.push("/curator/login");
    }
  };

  const navItems = [
    {
      href: "/curator",
      label: "Overview & Analytics",
      icon: LayoutDashboard,
      active: pathname === "/curator",
    },
    {
      href: "/curator/players",
      label: "Player Directory",
      icon: Users,
      active: pathname.startsWith("/curator/players"),
    },
  ];

  return (
    <div className="w-full border-b border-[#E8E2D8] bg-[#FAF8F5] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] font-semibold text-[#1C1917] hover:opacity-75 transition-opacity"
          >
            THE UNWRITTEN
          </Link>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#EDF0EB] text-[#5B6356] font-medium">
            CURATOR PORTAL
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium uppercase tracking-wider transition-all ${
                  item.active
                    ? "bg-[#1C1917] text-[#FAF8F5]"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4EFE7]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Identity & Sign Out */}
        <div className="flex items-center space-x-3">
          {adminEmail && (
            <span className="hidden md:inline text-xs text-[#78716C] font-mono">
              {adminEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-[#78716C] hover:text-[#A37070] transition-colors rounded hover:bg-[#F2ECE2]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
