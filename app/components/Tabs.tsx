"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
}: TabsProps) {
  const renderDefault = () => (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300
              ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );

  const renderPills = () => (
    <div className="bg-gray-100 p-1 rounded-lg inline-flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-all duration-300
            ${
              activeTab === tab.id
                ? "bg-white text-purple-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`
                ml-1 py-0.5 px-2 rounded-full text-xs font-semibold
                ${activeTab === tab.id ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-600"}
              `}>
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );

  const renderUnderline = () => (
    <div className="flex space-x-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            pb-3 font-medium text-sm transition-all duration-300 relative
            ${
              activeTab === tab.id
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-2 bg-purple-100 text-purple-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                {tab.badge}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 animate-scaleIn"></span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {variant === "default" && renderDefault()}
      {variant === "pills" && renderPills()}
      {variant === "underline" && renderUnderline()}
    </div>
  );
}
