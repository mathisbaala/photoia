import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/analytics
 * 
 * Récupère les analytics pour le dashboard admin
 * (À sécuriser avec un rôle admin en production)
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

    // TODO: Vérifier le rôle admin
    // const isAdmin = user.user_metadata?.role === 'admin';
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    // }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète." },
        { status: 500 },
      );
    }

    const stripe = getStripeClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);

    // 1. Total revenue du mois (via Stripe Balance Transactions)
    const balanceTransactions = await stripe.balanceTransactions.list({
      created: { gte: startOfMonthTimestamp },
      limit: 100,
    });

    const totalRevenue = balanceTransactions.data
      .filter(tx => tx.type === "charge" && tx.status === "available")
      .reduce((sum, tx) => sum + tx.net / 100, 0);

    // 2. Nombre de paiements réussis ce mois (depuis la DB)
    const { data: paymentsData, error: paymentsError } = await supabaseService
      .from("payments")
      .select("*", { count: "exact" })
      .eq("status", "succeeded")
      .gte("created_at", startOfMonth.toISOString());

    const totalPayments = paymentsData?.length || 0;
    const totalPaymentsAmount = paymentsData?.reduce((sum, p: any) => sum + p.amount, 0) || 0;

    // 3. Nombre d'abonnements actifs (via Stripe)
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });
    const activeSubscriptions = subscriptions.data.length;

    // 4. Nombre de projets créés ce mois
    const { count: projectsCount } = await supabaseService
      .from("projects")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // 5. Nombre d'utilisateurs uniques ayant payé ce mois
    const uniquePayingUsers = new Set(
      paymentsData?.map((p: any) => p.user_id) || []
    ).size;

    // 6. Taux de conversion (approximation: utilisateurs payants / total utilisateurs)
    const { count: totalUsers } = await supabaseService
      .from("projects")
      .select("user_id", { count: "exact", head: true });

    const uniqueUsers = totalUsers || 1; // Éviter division par zéro
    const conversionRate = ((uniquePayingUsers / uniqueUsers) * 100).toFixed(2);

    // 7. Répartition par type de paiement
    const paymentsByType = paymentsData?.reduce((acc: any, p: any) => {
      acc[p.payment_type] = (acc[p.payment_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // 8. Revenus par jour ce mois (pour le graphique)
    const revenueByDay: Record<string, number> = {};
    paymentsData?.forEach((p: any) => {
      const date = new Date(p.created_at).toLocaleDateString("fr-FR");
      revenueByDay[date] = (revenueByDay[date] || 0) + p.amount;
    });

    return NextResponse.json({
      analytics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalPayments,
        totalPaymentsAmount: totalPaymentsAmount.toFixed(2),
        activeSubscriptions,
        projectsCount: projectsCount || 0,
        uniquePayingUsers,
        totalUsers: uniqueUsers,
        conversionRate: parseFloat(conversionRate),
        paymentsByType,
        revenueByDay,
        period: {
          start: startOfMonth.toISOString(),
          end: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Erreur dans GET /api/admin/analytics:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}
