'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

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
    window.location.href = '/startup/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
        <div className="flex justify-between h-16 w-full">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JEB
            </Link>
          </div>
          <div className="flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${pathname === item.href
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex w-fit pl-8 items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleSwitchToStartup}
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Startup Area
              </button>
              <button
                onClick={handleLogout}
                className="font-bold text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="font-bold text-gray-600 hover:text-blue-600">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
