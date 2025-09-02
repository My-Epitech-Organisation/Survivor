'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function StartupNavigation() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { href: '/startup/dashboard', label: 'Dashboard' },
        { href: '/startup/profile', label: 'Profile' },
        { href: '/startup/messaging', label: 'Messaging' },
        { href: '/startup/opportunities', label: 'Opportunities' },
    ];

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleSwitchToPublic = () => {
        window.location.href = '/';
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/startup/dashboard" className="text-2xl font-bold text-blue-600">
                            JEB <span className="text-sm text-gray-500">Startup</span>
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
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleSwitchToPublic}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            Public Area
                        </button>
                        <button
                            onClick={handleLogout}
                            className="font-bold text-gray-600 hover:text-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
