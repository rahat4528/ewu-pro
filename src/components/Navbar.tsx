"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  Compass,
  GraduationCap,
  History,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
  Bookmark,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Offered Courses", href: "/dashboard/offered-courses", icon: Search },
    { label: "Advising Planner", href: "/dashboard/advising-planner", icon: Calendar, highlight: true },
    { label: "CGPA Calculator", href: "/dashboard/cgpa-calculator", icon: GraduationCap },
    { label: "Archive", href: "/dashboard/previous-courses", icon: History },
    { label: "Saved Plans", href: "/dashboard/plans", icon: Bookmark },
    { label: "Admin", href: "/admin", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1C4370] text-white shadow-md border-b border-[#264e7c] transition-colors" role="navigation" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" aria-label="EWU Pro Home">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#1CAF9A] shadow-inner group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  EWU<span className="text-[#1CAF9A]">Pro</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#1CAF9A]/20 text-[#1CAF9A] rounded border border-[#1CAF9A]/30">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] text-white/70 font-medium">
                East West University Advising Companion
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1" role="menubar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#1CAF9A] text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  } ${item.highlight && !isActive ? "text-[#1CAF9A] font-extrabold" : ""}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "opacity-80"}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-300" aria-hidden="true" /> : <Moon className="w-5 h-5 text-white/90" aria-hidden="true" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-white/10 bg-[#17385e] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#1CAF9A] text-white"
                    : "text-white/80 hover:bg-white/10 text-white"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
