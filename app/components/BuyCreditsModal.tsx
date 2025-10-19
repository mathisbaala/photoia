"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";

interface CreditPack {
  credits: number;
  price: number;
  priceInCents: number;
  name: string;
  description: string;
  discount?: string;
}

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CREDIT_PACKS: Record<string, CreditPack> = {
  small: {
    credits: 10,
    price: 15.0,
    priceInCents: 1500,
    name: "Pack Starter",
    description: "Parfait pour découvrir PhotoIA",
  },
  medium: {
    credits: 25,
    price: 30.0,
    priceInCents: 3000,
    name: "Pack Pro",
    description: "Le meilleur rapport qualité/prix",
    discount: "Économisez 20%",
  },
  large: {
    credits: 50,
    price: 50.0,
    priceInCents: 5000,
    name: "Pack Business",
    description: "Pour les utilisateurs intensifs",
    discount: "Économisez 33%",
  },
};

export default function BuyCreditsModal({
  isOpen,
  onClose,
  onSuccess,
}: BuyCreditsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>("medium");

  async function handleBuyPack(packId: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'achat");
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💎 Acheter des crédits
            </h2>
            <p className="text-gray-600 mt-1">
              Choisissez le pack qui vous convient et économisez jusqu'à 33%
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              name={CREDIT_PACKS.small.name}
              credits={CREDIT_PACKS.small.credits}
              price={CREDIT_PACKS.small.price}
              description={CREDIT_PACKS.small.description}
              isSelected={selectedPack === "small"}
              onClick={() => {
                setSelectedPack("small");
                handleBuyPack("small");
              }}
            />
            <PricingCard
              name={CREDIT_PACKS.medium.name}
              credits={CREDIT_PACKS.medium.credits}
              price={CREDIT_PACKS.medium.price}
              description={CREDIT_PACKS.medium.description}
              discount={CREDIT_PACKS.medium.discount}
              isPopular={true}
              isSelected={selectedPack === "medium"}
              onClick={() => {
                setSelectedPack("medium");
                handleBuyPack("medium");
              }}
            />
            <PricingCard
              name={CREDIT_PACKS.large.name}
              credits={CREDIT_PACKS.large.credits}
              price={CREDIT_PACKS.large.price}
              description={CREDIT_PACKS.large.description}
              discount={CREDIT_PACKS.large.discount}
              isSelected={selectedPack === "large"}
              onClick={() => {
                setSelectedPack("large");
                handleBuyPack("large");
              }}
            />
          </div>

          <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm animate-slideUp">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span>Pourquoi acheter des crédits ?</span>
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-700 animate-fadeIn" style={{ animationDelay: "100ms" }}>
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span><strong>Économisez jusqu'à 33%</strong> sur vos générations</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 animate-fadeIn" style={{ animationDelay: "200ms" }}>
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span><strong>Pas d'abonnement</strong>, payez uniquement ce que vous utilisez</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 animate-fadeIn" style={{ animationDelay: "300ms" }}>
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span><strong>Crédits valables 1 an</strong> sans limite d'utilisation</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 animate-fadeIn" style={{ animationDelay: "400ms" }}>
                <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                <span><strong>Tous les modèles inclus</strong>, explorez toute la créativité IA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
