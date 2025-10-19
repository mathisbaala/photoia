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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-6 py-4 shadow-lg animate-pulse">
        <div className="h-12 bg-white/20 rounded"></div>
      </div>
    );
  }

  const remaining = credits?.credits_remaining || 0;
  const lowCredits = remaining < 5;

  return (
    <div
      className={`
        relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 
        rounded-2xl px-7 py-5 shadow-2xl
        transition-all duration-500 hover:shadow-purple-500/50 hover:shadow-2xl hover:scale-[1.03]
        animate-gradientShift backdrop-blur-lg border border-white/20
        ${isAnimating ? "animate-bounceIn" : ""}
        ${lowCredits ? "animate-pulseGlow" : ""}
      `}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
      
      <div className="relative flex items-center justify-between text-white">
        <div className="flex items-center gap-5">
          <div className={`text-5xl transition-transform duration-300 ${isAnimating ? "scale-110" : ""} animate-float`}>
            💎
          </div>
          <div>
            <p className="text-sm font-bold opacity-90 tracking-wide uppercase">Vos crédits</p>
            <p
              className={`
                text-4xl font-black tracking-tight
                transition-all duration-500
                ${lowCredits ? "text-yellow-300 animate-pulse" : ""}
              `}
            >
              {remaining}
              {lowCredits && (
                <span className="text-xs ml-3 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full font-bold animate-bounce inline-block">
                  ⚠️ Presque épuisés !
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onBuyClick}
          className="
            relative bg-white text-purple-600 px-7 py-3.5 rounded-xl font-bold text-base
            hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:text-white
            transition-all duration-300
            transform hover:scale-110 active:scale-95 hover:-translate-y-1
            shadow-xl hover:shadow-2xl
            group overflow-hidden
          "
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-shine pointer-events-none" />
          <span className="relative flex items-center gap-2">
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
            <span>Acheter</span>
          </span>
        </button>
      </div>

      {credits && credits.total_purchased > 0 && (
        <div className="relative mt-4 pt-3 border-t border-white/30 animate-fadeIn">
          <p className="text-white/90 text-sm font-medium flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span>
              Total acheté : <span className="font-black text-lg text-yellow-300">{credits.total_purchased}</span> crédits
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
