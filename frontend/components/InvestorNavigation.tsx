"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { JEBLogo } from "./svg/JEBLogo";
import { ThemeToggle } from "./ui/theme-toggle";

export default function InvestorNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/investor/messaging", label: "Messaging" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSwitchToPublic = () => {
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/investor/messaging"
              className="group flex items-end text-3xl font-heading font-black italic text-jeb-primary hover:text-jeb-hover transition-colors"
            >
              <div className="flex items-center">
                <JEBLogo className="w-15 h-auto" color="currentColor" />
                JEB
              </div>
              <span className="ml-2 text-sm text-gray-500 group-hover:text-jeb-hover not-italic mb-1 transition-colors">Investor</span>
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
            <ThemeToggle />
            <button
              onClick={handleSwitchToPublic}
              className="font-heading font-medium text-gray-600 hover:text-jeb-primary transition-colors cursor-pointer"
            >
              Public Area
            </button>
            <button
              onClick={handleLogout}
              className="font-heading font-bold text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-jeb-primary focus:outline-none focus:text-jeb-primary transition-colors"
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
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-heading block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-jeb-primary bg-blue-50"
                      : "text-gray-600 hover:text-jeb-primary hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 space-y-1">
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    handleSwitchToPublic();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-jeb-primary hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Public Area
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
