import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/payments
 * 
 * Récupère l'historique des paiements de l'utilisateur connecté
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

    // Récupérer les paiements de l'utilisateur depuis Supabase
    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète." },
        { status: 500 },
      );
    }

    const { data: payments, error: paymentsError } = await supabaseService
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Erreur lors de la récupération des paiements:", paymentsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des paiements." },
        { status: 500 },
      );
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error("Erreur dans GET /api/payments:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}
