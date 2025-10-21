"use client";

import { useState } from "react";

interface CreditPack {
  id: string;
  credits: number;
  price: number;
  priceInCents: number;
  name: string;
  description: string;
  discount?: string;
  popular?: boolean;
  savings?: string;
}

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CREDIT_PACKS: CreditPack[] = [
  {
    id: "small",
    credits: 10,
    price: 15.0,
    priceInCents: 1500,
    name: "Starter",
    description: "Parfait pour débuter",
    savings: "1,50€/crédit",
  },
  {
    id: "medium",
    credits: 25,
    price: 30.0,
    priceInCents: 3000,
    name: "Pro",
    description: "Notre offre la plus populaire",
    discount: "-20%",
    popular: true,
    savings: "1,20€/crédit",
  },
  {
    id: "large",
    credits: 50,
    price: 50.0,
    priceInCents: 5000,
    name: "Business",
    description: "Le meilleur rapport qualité/prix",
    discount: "-33%",
    savings: "1,00€/crédit",
  },
];

export default function BuyCreditsModal({
  isOpen,
  onClose,
  onSuccess,
}: BuyCreditsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string>("medium");

  async function handlePurchase() {
    if (!selectedPack || loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selectedPack }),
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

  const selectedPackData = CREDIT_PACKS.find(p => p.id === selectedPack);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choisissez votre pack de crédits
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sélectionnez l'offre qui correspond à vos besoins
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slideUp">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {CREDIT_PACKS.map((pack, index) => {
              const isSelected = selectedPack === pack.id;
              
              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  disabled={loading}
                  className={`
                    relative p-6 rounded-2xl border-2 text-left
                    transition-all duration-300 ease-out
                    ${isSelected 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    group
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Popular Badge */}
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                      ⭐ Populaire
                    </div>
                  )}

                  {/* Discount Badge */}
                  {pack.discount && (
                    <div className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">{pack.discount}</span>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  <div className={`
                    absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected 
                      ? 'border-purple-600 bg-purple-600' 
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Pack Name */}
                  <div className="mb-4 mt-2">
                    <h3 className={`text-lg font-bold transition-colors ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                      Pack {pack.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                  </div>

                  {/* Credits */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black transition-colors ${isSelected ? 'text-purple-600' : 'text-gray-900'}`}>
                        {pack.credits}
                      </span>
                      <span className="text-lg text-gray-600 font-medium">crédits</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{pack.price}€</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pack.savings}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Valable 1 an</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Tous les modèles IA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Support prioritaire</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary & CTA */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Récapitulatif
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedPackData && (
                    <>
                      Pack {selectedPackData.name} • {selectedPackData.credits} crédits
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">
                  {selectedPackData?.price}€
                </div>
                {selectedPackData?.discount && (
                  <div className="text-sm font-semibold text-green-600">
                    Économie {selectedPackData.discount}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !selectedPack}
              className={`
                w-full py-4 rounded-xl font-bold text-base
                transition-all duration-200
                ${loading || !selectedPack
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Redirection vers le paiement...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Continuer vers le paiement</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Paiement sécurisé</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Livraison instant.</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
