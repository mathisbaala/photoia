// Configuration des packs de crédits disponibles
export const CREDIT_PACKS = {
  small: {
    credits: 10,
    price: 15.00, // 15€ pour 10 crédits
    priceInCents: 1500,
    name: "Pack Starter",
    description: "10 générations d'images IA",
  },
  medium: {
    credits: 25,
    price: 30.00, // 30€ pour 25 crédits (économie de 7.50€)
    priceInCents: 3000,
    name: "Pack Pro",
    description: "25 générations d'images IA",
    discount: "Économisez 20%",
  },
  large: {
    credits: 50,
    price: 50.00, // 50€ pour 50 crédits (économie de 25€)
    priceInCents: 5000,
    name: "Pack Business",
    description: "50 générations d'images IA",
    discount: "Économisez 33%",
  },
} as const;

export type CreditPackType = keyof typeof CREDIT_PACKS;
