/**
 * Configuration des modèles IA disponibles avec leurs prix
 */

export const AI_MODELS = {
  "google/nano-banana": {
    id: "google/nano-banana",
    name: "Nano Banana",
    description: "Modèle rapide pour des transformations simples",
    price: 2.00,
    priceInCents: 200,
    provider: "Google",
    estimatedTime: "~10 secondes",
  },
  "batouresearch/magic-image-refiner": {
    id: "batouresearch/magic-image-refiner",
    name: "Magic Image Refiner",
    description: "Raffinement d'image de qualité professionnelle",
    price: 3.00,
    priceInCents: 300,
    provider: "Batouresearch",
    estimatedTime: "~20 secondes",
  },
  "zsxkib/qwen2-vl": {
    id: "zsxkib/qwen2-vl",
    name: "Qwen2 VL",
    description: "Modèle premium pour des résultats exceptionnels",
    price: 5.00,
    priceInCents: 500,
    provider: "Zsxkib",
    estimatedTime: "~30 secondes",
  },
} as const;

export type AIModelId = keyof typeof AI_MODELS;

export function getModelById(modelId: string) {
  return AI_MODELS[modelId as AIModelId] || null;
}

export function getDefaultModel(): AIModelId {
  return "batouresearch/magic-image-refiner";
}

export function getAllModels() {
  return Object.values(AI_MODELS);
}
