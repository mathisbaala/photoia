"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 group"
            >
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
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium
                    transition-all duration-300 transform hover:scale-105
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-purple-500 text-white"
                    }`}>
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
                ml-4 px-4 py-2 rounded-xl font-medium
                text-gray-600 hover:bg-red-50 hover:text-red-600
                transition-all duration-300 transform hover:scale-105
                flex items-center gap-2
              "
            >
              <span>Déconnexion</span>
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg animate-fadeIn">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-auto font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-purple-500 text-white"
                    }`}>
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
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                text-gray-600 hover:bg-red-50 hover:text-red-600
                transition-all duration-300
              "
            >
              <span>Déconnexion</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
