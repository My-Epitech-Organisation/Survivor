"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X, UserRound, LogOut } from "lucide-react";
import { JEBLogo } from "./svg/JEBLogo";

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/news", label: "News" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/users", label: "Users" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSwitchToPublic = () => {
    router.push("/");
  };

  const handleSwitchToProfile = () => {
    router.push("/profile");
  };

  return (
    <nav className="bg-app-surface shadow-sm border-b border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/admin/dashboard"
              className="group flex items-end text-3xl font-heading font-black italic text-jeb-primary hover:text-jeb-hover transition-colors"
            >
              <div className="flex items-center">
                <JEBLogo className="w-15 h-auto" color="currentColor" />
                JEB
              </div>
              <span className="ml-2 text-sm text-app-text-secondary group-hover:text-jeb-hover not-italic mb-1 transition-colors">Admin</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-heading transition-colors ${
                  pathname === item.href
                    ? "text-jeb-primary font-semibold"
                    : "text-app-text-secondary hover:text-jeb-primary font-medium"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleSwitchToPublic}
              className="font-heading font-medium text-app-text-secondary hover:text-jeb-primary transition-colors cursor-pointer"
            >
              Public Area
            </button>
            <button
              onClick={handleSwitchToProfile}
              className="font-heading font-bold text-app-text-secondary hover:text-jeb-primary transition-colors cursor-pointer"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="font-heading font-bold text-app-text-secondary hover:text-app-red-primary transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-app-text-secondary hover:text-jeb-primary focus:outline-none focus:text-jeb-primary transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-app-border bg-app-surface">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-heading block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-jeb-primary bg-app-blue-light"
                      : "text-app-text-secondary hover:text-jeb-primary hover:bg-app-surface-hover"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-app-border pt-2 space-y-1">
                <button
                  onClick={() => {
                    handleSwitchToPublic();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-app-text-secondary hover:text-jeb-primary hover:bg-app-surface-hover transition-colors cursor-pointer"
                >
                  Public Area
                </button>
                <button
                  onClick={() => {
                    handleSwitchToProfile();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-app-text-secondary hover:text-jeb-primary hover:bg-app-surface-hover transition-colors cursor-pointer"
                >
                  <UserRound/>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-app-text-secondary hover:text-app-red-primary hover:bg-app-surface-hover transition-colors cursor-pointer"
                >
                  <LogOut/>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
