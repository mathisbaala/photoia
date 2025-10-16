import Stripe from "stripe";

/**
 * Initialise et retourne un client Stripe configuré côté serveur.
 * Utilisé pour créer des sessions de paiement et traiter les webhooks.
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY n'est pas définie dans les variables d'environnement.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-09-30.clover",
    typescript: true,
  });
}

/**
 * Prix par génération d'image (en centimes d'euro).
 * Hardcodé côté serveur pour des raisons de sécurité.
 */
export const PRICE_PER_GENERATION = 200; // 2.00 EUR

/**
 * Prix par génération d'image (en euros).
 */
export const PRICE_PER_GENERATION_EUR = PRICE_PER_GENERATION / 100;
