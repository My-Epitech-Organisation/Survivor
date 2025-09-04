'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/news', label: 'News' },
    { href: '/events', label: 'Events' },
    { href: '/search', label: 'Advanced Search' },
    { href: '/about', label: 'About' },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleSwitchToStartup = () => {
    router.push('/startup/dashboard');
  };

  const handleSwitchToAdmin = () => {
    router.push('/admin/dashboard');
  }

  return (
    <nav className="bg-app-surface shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-app-blue-primary">
              JEB
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${pathname === item.href
                  ? 'text-app-blue-primary font-medium'
                  : 'text-app-text-secondary hover:text-app-blue-primary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Login */}
          <div className="hidden md:flex w-fit pl-8 items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'founder' && (
                  <button
                    onClick={handleSwitchToStartup}
                    className="font-medium text-app-blue-primary hover:text-app-blue-primary-hover transition-colors cursor-pointer"
                    >
                    Startup Area
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button
                    onClick={handleSwitchToAdmin}
                    className="font-medium text-app-blue-primary hover:text-app-blue-primary-hover transition-colors cursor-pointer"
                    >
                    Admin Area
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="font-bold text-app-text-secondary hover:text-app-red-primary transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="font-bold text-app-text-secondary hover:text-app-blue-primary">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-app-text-secondary hover:text-app-blue-primary focus:outline-none focus:text-app-blue-primary transition-colors"
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
          <div className="md:hidden border-t border-app-border-light bg-app-surface">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-app-blue-primary bg-app-blue-light'
                      : 'text-app-text-secondary hover:text-app-blue-primary hover:bg-app-surface-hover'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-app-border-light pt-2 space-y-1">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'founder' && (
                      <button
                        onClick={() => {
                          handleSwitchToStartup();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-app-blue-primary hover:text-app-blue-primary-hover hover:bg-app-blue-light transition-colors"
                      >
                        Startup Area
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          handleSwitchToAdmin();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-app-blue-primary hover:text-app-blue-primary-hover hover:bg-app-blue-light transition-colors"
                      >
                        Admin Area
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-app-text-secondary hover:text-app-red-primary hover:bg-app-surface-hover transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-bold text-app-text-secondary hover:text-app-blue-primary hover:bg-app-surface-hover transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
