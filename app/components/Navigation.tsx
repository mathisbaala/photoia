"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Mes paiements", href: "/dashboard/billing", icon: "💳" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "📊", badge: "Admin" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              <span>📸</span>
              <span>PhotoIA</span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-100 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Bouton Déconnexion */}
            <Link
              href="/api/auth/logout"
              className="
                ml-4 px-4 py-2 rounded-lg font-medium
                text-gray-600 hover:bg-red-50 hover:text-red-600
                transition-all duration-200
              "
            >
              <span className="flex items-center gap-2">
                <span>🚪</span>
                <span>Déconnexion</span>
              </span>
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/api/auth/logout"
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                text-gray-600 hover:bg-red-50 hover:text-red-600
                transition-all duration-200
              "
            >
              <span className="text-xl">🚪</span>
              <span>Déconnexion</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
