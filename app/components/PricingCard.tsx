"use client";

import React from "react";

interface PricingCardProps {
  name: string;
  credits: number;
  price: number;
  description: string;
  discount?: string;
  isPopular?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export default function PricingCard({
  name,
  credits,
  price,
  description,
  discount,
  isPopular = false,
  isSelected = false,
  onClick,
}: PricingCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer
        transform transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-2
        ${isSelected ? "scale-105 -translate-y-2" : ""}
      `}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-lg opacity-60 animate-pulseGlow" />
            <div className="relative px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
              ⭐ POPULAIRE
            </div>
          </div>
        </div>
      )}

      {/* Card Container */}
      <div
        className={`
          relative overflow-hidden rounded-2xl
          border-2 transition-all duration-300
          ${
            isSelected
              ? "border-purple-500 shadow-2xl shadow-purple-500/20"
              : isPopular
              ? "border-purple-300 shadow-xl"
              : "border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl"
          }
          bg-white backdrop-blur-xl
        `}
      >
        {/* Animated Background Gradient */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50
            ${isSelected ? "opacity-100" : ""}
          `}
        />

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Content */}
        <div className="relative p-8">
          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 right-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-md opacity-50 animate-glow" />
                <div className="relative px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full">
                  {discount}
                </div>
              </div>
            </div>
          )}

          {/* Plan Name */}
          <h3
            className={`
              text-2xl font-bold mb-2 transition-colors duration-300
              ${isSelected || isPopular ? "text-purple-600" : "text-gray-800 group-hover:text-purple-600"}
            `}
          >
            {name}
          </h3>

          {/* Credits Count with Animation */}
          <div className="flex items-baseline gap-2 mb-4">
            <span
              className={`
                text-5xl font-black transition-all duration-300
                bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent
                group-hover:scale-110
                ${isSelected ? "scale-110" : ""}
              `}
            >
              {credits}
            </span>
            <span className="text-gray-500 text-lg font-medium">crédits</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 min-h-[48px]">{description}</p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span
                className={`
                  text-4xl font-bold transition-colors duration-300
                  ${isSelected ? "text-purple-600" : "text-gray-900 group-hover:text-purple-600"}
                `}
              >
                {price}€
              </span>
              <span className="text-gray-500">/pack</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(price / credits).toFixed(2)}€ par crédit
            </p>
          </div>

          {/* CTA Button */}
          <button
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg
              transition-all duration-300 transform
              ${
                isSelected || isPopular
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                  : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white"
              }
              hover:scale-105 active:scale-95
              relative overflow-hidden group/button
            `}
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700" />
            
            <span className="relative flex items-center justify-center gap-2">
              {isSelected ? (
                <>
                  <span>✓</span>
                  <span>Sélectionné</span>
                </>
              ) : (
                <>
                  <span>Choisir ce pack</span>
                  <span className="transform group-hover/button:translate-x-1 transition-transform">
                    →
                  </span>
                </>
              )}
            </span>
          </button>

          {/* Value Indicators */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span>
                <span>Crédits valables 1 an</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span>
                <span>Accès à tous les modèles IA</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span>
                <span>Support prioritaire</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Animated Border Glow on Hover */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${isSelected ? "opacity-100" : ""}
            pointer-events-none
          `}
          style={{
            background: `
              linear-gradient(90deg, 
                transparent, 
                rgba(147, 51, 234, 0.3), 
                transparent
              )
            `,
            backgroundSize: "200% 100%",
            animation: isSelected || isPopular ? "shine 3s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}
