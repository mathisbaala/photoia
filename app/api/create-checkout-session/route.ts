import { NextResponse } from "next/server";
import { getStripeClient, PRICE_PER_GENERATION, PRICE_PER_GENERATION_EUR } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import { supabaseRoute } from "@/lib/supabase-route";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/create-checkout-session
 * 
 * Crée une session Stripe Checkout pour un projet existant.
 * Le projet doit avoir été créé au préalable avec payment_status='pending'.
 * 
 * Body: { projectId: string }
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
        { error: "Vous devez être connecté pour effectuer un paiement." },
        { status: 401 },
      );
    }

    // Récupérer le projectId
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Le projectId est requis." },
        { status: 400 },
      );
    }

    // Récupérer le projet et vérifier l'appartenance
    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète côté serveur." },
        { status: 500 },
      );
    }

    const { data: projectData, error: projectError } = await supabaseService
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: "Projet introuvable." },
        { status: 404 },
      );
    }

    const project = projectData as Database["public"]["Tables"]["projects"]["Row"];

    // Vérifier que le projet appartient à l'utilisateur
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à payer pour ce projet." },
        { status: 403 },
      );
    }

    // Vérifier que le projet n'a pas déjà été payé
    if (project.payment_status === "paid") {
      return NextResponse.json(
        { error: "Ce projet a déjà été payé." },
        { status: 400 },
      );
    }

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
              name: "Génération d'image IA",
              description: "Transformation d'image par intelligence artificielle",
            },
            unit_amount: PRICE_PER_GENERATION,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: {
        project_id: projectId,
        user_id: user.id,
      },
      client_reference_id: user.id,
    });

    // Mettre à jour le projet avec l'ID de la session
    await supabaseService
      .from("projects")
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: "pending",
        payment_amount: PRICE_PER_GENERATION_EUR,
      })
      .eq("id", projectId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la session de paiement." },
      { status: 500 },
    );
  }
}
