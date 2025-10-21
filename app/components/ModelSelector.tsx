"use client";

import { useState } from "react";
import { getAllModels } from "@/lib/ai-models";

const AI_MODELS = getAllModels();

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden mb-6 border border-purple-200/50 animate-fadeIn">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-float group-hover:scale-110 transition-transform duration-300">🤖</span>
          <div className="text-left">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Modèle IA sélectionné
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {currentModel?.name} - {currentModel?.price}€
            </p>
          </div>
        </div>
        <span className={`text-2xl transition-all duration-300 ${isExpanded ? "rotate-180" : ""} group-hover:text-purple-600`}>
          ▼
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-purple-100 bg-gradient-to-b from-white/50 to-purple-50/30 animate-slideUp">
          <p className="text-gray-700 mb-6 mt-4 text-center font-medium">
            ✨ Choisissez le modèle qui correspond à vos besoins et votre budget
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AI_MODELS.map((model, index) => {
              const isSelected = selectedModel === model.id;
              const isRecommended = index === 1; // Magic Image Refiner

              return (
                <button
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={`
                    relative text-left p-6 rounded-2xl border-2 transition-all duration-300
                    transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl
                    backdrop-blur-lg animate-fadeIn group
                    ${
                      isSelected
                        ? "border-purple-600 bg-gradient-to-br from-purple-100/80 to-pink-100/80 shadow-xl scale-105 animate-glow"
                        : "border-gray-200 hover:border-purple-400 bg-white/80 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50"
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge Recommandé */}
                  {isRecommended && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulseGlow">
                      ⭐ Recommandé
                    </div>
                  )}

                  {/* Checkmark si sélectionné */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-bounceIn">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-gray-900 text-lg pr-8 group-hover:text-purple-700 transition-colors">
                      {model.name}
                    </h4>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                      {model.price}€
                    </span>
                    <span className="text-sm text-gray-600 ml-2 font-medium">
                      / génération
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 min-h-[40px] leading-relaxed">
                    {model.description}
                  </p>

                  {/* Infos */}
                  <div className="flex flex-col gap-2.5 text-xs mb-4">
                    <div className="flex items-center gap-2 text-gray-600 bg-white/60 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <span className="text-base">🏢</span>
                      <span className="font-medium">{model.provider}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-white/60 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <span className="text-base">⏱️</span>
                      <span className="font-medium">{model.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Prix/qualité */}
                  {index === 0 && (
                    <div className="pt-3 border-t border-blue-200/50">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50/50 rounded-lg px-3 py-2">
                        <span className="text-base">💡</span>
                        <span>Idéal pour les tests rapides</span>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="pt-3 border-t border-purple-200/50">
                      <div className="flex items-center gap-2 text-xs text-purple-600 font-bold bg-purple-50/50 rounded-lg px-3 py-2 animate-shine">
                        <span className="text-base">💎</span>
                        <span>Meilleur rapport qualité/prix</span>
                      </div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="pt-3 border-t border-pink-200/50">
                      <div className="flex items-center gap-2 text-xs text-pink-600 font-bold bg-pink-50/50 rounded-lg px-3 py-2">
                        <span className="text-base">👑</span>
                        <span>Qualité professionnelle maximale</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Info supplémentaire */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm backdrop-blur-sm animate-slideUp" style={{ animationDelay: "300ms" }}>
            <div className="flex gap-4">
              <span className="text-3xl animate-pulse-soft">💡</span>
              <div>
                <h4 className="font-bold text-blue-900 mb-2 text-base">💰 Astuce économie</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>Achetez un pack de crédits</strong> pour économiser jusqu'à <strong className="text-purple-600">33%</strong> sur vos générations ! Plus vous achetez, plus vous économisez.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
