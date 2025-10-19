import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/credits
 * 
 * Récupère les crédits de l'utilisateur connecté
 */
export async function GET() {
  try {
    // Vérifier l'authentification
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 },
      );
    }

    // Récupérer les crédits de l'utilisateur
    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète." },
        { status: 500 },
      );
    }

    const { data: credits, error: creditsError } = await supabaseService
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") {
      // PGRST116 = pas de résultat trouvé
      console.error("Erreur lors de la récupération des crédits:", creditsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des crédits." },
        { status: 500 },
      );
    }

    // Si l'utilisateur n'a pas encore de crédits, créer l'entrée
    if (!credits) {
      const { data: newCredits, error: insertError } = await supabaseService
        .from("credits")
        .insert({
          user_id: user.id,
          credits_remaining: 0,
          total_purchased: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erreur lors de la création des crédits:", insertError);
        return NextResponse.json(
          { error: "Erreur lors de la création des crédits." },
          { status: 500 },
        );
      }

      return NextResponse.json({ credits: newCredits });
    }

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Erreur dans GET /api/credits:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/credits/use
 * 
 * Décrémenter un crédit pour l'utilisateur
 * À appeler lors d'une génération d'image
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
        { error: "Vous devez être connecté." },
        { status: 401 },
      );
    }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète." },
        { status: 500 },
      );
    }

    // Récupérer les crédits actuels
    const { data: credits, error: creditsError } = await supabaseService
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsError || !credits) {
      return NextResponse.json(
        { error: "Crédits introuvables." },
        { status: 404 },
      );
    }

    // Vérifier qu'il reste des crédits
    if (credits.credits_remaining <= 0) {
      return NextResponse.json(
        { error: "Vous n'avez plus de crédits disponibles." },
        { status: 400 },
      );
    }

    // Décrémenter les crédits
    const { data: updatedCredits, error: updateError } = await supabaseService
      .from("credits")
      .update({
        credits_remaining: credits.credits_remaining - 1,
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour des crédits:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de l'utilisation du crédit." },
        { status: 500 },
      );
    }

    return NextResponse.json({ 
      success: true, 
      credits: updatedCredits 
    });
  } catch (error) {
    console.error("Erreur dans POST /api/credits/use:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}
