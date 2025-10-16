import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient, PRICE_PER_GENERATION_EUR } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * 
 * Endpoint webhook pour recevoir les événements Stripe.
 * IMPORTANT : Cet endpoint est public et vérifie la signature du webhook.
 * 
 * Configuration du webhook dans Stripe Dashboard :
 * - URL: https://votre-domaine.com/api/webhooks/stripe
 * - Événements à écouter: checkout.session.completed
 * 
 * Pour le développement local, utilisez Stripe CLI :
 * stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET n'est pas définie.");
    return NextResponse.json(
      { error: "Configuration du webhook Stripe incomplète." },
      { status: 500 },
    );
  }

  try {
    // Récupérer le corps de la requête en tant que texte brut
    const body = await request.text();
    
    // Récupérer la signature Stripe depuis les headers
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Signature Stripe manquante dans les headers.");
      return NextResponse.json(
        { error: "Signature manquante." },
        { status: 400 },
      );
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signature invalide";
      console.error("Erreur de vérification de signature webhook Stripe:", errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 },
      );
    }

    // Traiter l'événement
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    }

    // Retourner une réponse de succès
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook Stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du webhook." },
      { status: 500 },
    );
  }
}

/**
 * Traite l'événement checkout.session.completed
 * Met à jour le projet avec le statut de paiement
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const projectId = session.metadata?.project_id;

  if (!projectId) {
    console.error("project_id manquant dans les metadata de la session:", session.id);
    return;
  }

  const supabaseService = getSupabaseServiceClient();
  if (!supabaseService) {
    console.error("Configuration Supabase incomplète côté serveur.");
    return;
  }

  try {
    // Mettre à jour le projet avec le statut de paiement
    const { error } = await supabaseService
      .from("projects")
      .update({
        payment_status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string | null,
        payment_amount: PRICE_PER_GENERATION_EUR,
        status: "pending", // Le projet est prêt à être généré
      })
      .eq("id", projectId);

    if (error) {
      console.error("Erreur lors de la mise à jour du projet après paiement:", error);
      return;
    }

    console.log(`✅ Paiement confirmé pour le projet ${projectId}`);
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
  }
}
