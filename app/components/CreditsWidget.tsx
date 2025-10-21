"use client";

import { useEffect, useState } from "react";

interface Credits {
  credits_remaining: number;
  total_purchased: number;
}

interface CreditsWidgetProps {
  onBuyClick: () => void;
}

export default function CreditsWidget({ onBuyClick }: CreditsWidgetProps) {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  async function loadCredits() {
    try {
      setLoading(true);
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        
        // Animation lors du chargement
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    } catch (error) {
      console.error("Erreur chargement crédits:", error);
    } finally {
      setLoading(false);
    }
  }

  // Rafraîchir les crédits toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(loadCredits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const remaining = credits?.credits_remaining || 0;
  const lowCredits = remaining < 5;

  return (
    <div
      className={`
        relative overflow-hidden bg-white/95 backdrop-blur-xl
        rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50
        transition-all duration-300 hover:shadow-xl hover:border-purple-300/50
        ${isAnimating ? "animate-scaleIn" : ""}
        ${lowCredits ? "border-orange-300/70 bg-orange-50/30" : ""}
      `}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-3xl transition-transform duration-300 ${isAnimating ? "scale-110" : ""}`}>
            💎
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Vos crédits
            </p>
            <p
              className={`
                text-3xl font-black tracking-tight
                transition-all duration-300
                ${lowCredits ? "text-orange-600" : "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"}
              `}
            >
              {remaining}
              {lowCredits && (
                <span className="text-xs ml-2 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-bold inline-block border border-orange-300">
                  ⚠️ Faible
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onBuyClick}
          className="
            relative bg-gradient-to-r from-purple-600 to-pink-600
            text-white px-5 py-2.5 rounded-xl font-semibold text-sm
            hover:from-purple-700 hover:to-pink-700
            transition-all duration-200
            transform hover:scale-105 active:scale-95
            shadow-md hover:shadow-lg
            group
          "
        >
          <span className="relative flex items-center gap-2">
            <span className="text-lg transition-transform duration-200 group-hover:rotate-90">+</span>
            <span>Acheter</span>
          </span>
        </button>
      </div>

      {credits && credits.total_purchased > 0 && (
        <div className="relative mt-3 pt-3 border-t border-gray-200">
          <p className="text-gray-600 text-xs font-medium flex items-center gap-1.5">
            <span className="text-sm">📊</span>
            <span>
              Total acheté : <span className="font-bold text-purple-600">{credits.total_purchased}</span> crédits
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
