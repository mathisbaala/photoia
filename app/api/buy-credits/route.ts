import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { supabaseRoute } from "@/lib/supabase-route";
import { CREDIT_PACKS } from "@/lib/credit-packs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/buy-credits
 * 
 * Crée une session Stripe Checkout pour acheter un pack de crédits
 * 
 * Body: { packId: "small" | "medium" | "large" }
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour acheter des crédits." },
        { status: 401 },
      );
    }

    // Récupérer le packId
    const body = await request.json();
    const { packId } = body;

    if (!packId || !CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS]) {
      return NextResponse.json(
        { error: "Pack de crédits invalide." },
        { status: 400 },
      );
    }

    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];

    // Créer la session Stripe Checkout
    const stripe = getStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: pack.name,
              description: pack.description,
            },
            unit_amount: pack.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        payment_type: "credits",
        credits_purchased: pack.credits.toString(),
        pack_id: packId,
      },
      success_url: `${baseUrl}/dashboard?credits_purchased=true`,
      cancel_url: `${baseUrl}/dashboard?credits_canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/buy-credits
 * 
 * Retourne la liste des packs de crédits disponibles
 */
export async function GET() {
  return NextResponse.json({ packs: CREDIT_PACKS });
}
