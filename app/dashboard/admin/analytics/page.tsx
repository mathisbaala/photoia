"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";
import Navigation from "@/components/Navigation";
import PageLoader from "@/components/PageLoader";
import { useToast, ToastContainer } from "@/components/Toast";

interface Analytics {
  totalRevenue: string;
  totalPayments: number;
  totalPaymentsAmount: string;
  activeSubscriptions: number;
  projectsCount: number;
  uniquePayingUsers: number;
  totalUsers: number;
  conversionRate: number;
  paymentsByType: Record<string, number>;
  revenueByDay: Record<string, number>;
  period: {
    start: string;
    end: string;
  };
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { error: toastError, success, toasts, removeToast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // TODO: Vérifier le rôle admin
    // if (user.user_metadata?.role !== 'admin') {
    //   router.push("/dashboard");
    //   return;
    // }

    loadAnalytics();
  }

  async function loadAnalytics() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  }

  if (loading) {
    return <PageLoader message="Chargement des analytics..." />;
  }

  if (error || !analytics) {
    return (
      <>
        <Navigation />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center animate-slideDown shadow-lg">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-800 font-semibold text-lg">{error || "Impossible de charger les analytics"}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 pt-24">
        <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📊 Analytics Admin
          </h1>
          <p className="text-gray-600 text-lg">
            Statistiques et revenus du mois en cours
          </p>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Revenus du mois</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Stripe Balance Transactions
            </p>
          </div>

          {/* Total Payments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Paiements réussis</span>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.totalPayments}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(analytics.totalPaymentsAmount)} total
            </p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Abonnements actifs</span>
              <span className="text-2xl">🔄</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.activeSubscriptions}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Abonnements Stripe
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Taux de conversion</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.conversionRate}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.uniquePayingUsers} / {analytics.totalUsers} utilisateurs
            </p>
          </div>
        </div>

        {/* Statistiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Projets créés */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🎨 Projets créés ce mois
            </h3>
            <p className="text-5xl font-bold text-purple-600">
              {analytics.projectsCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Générations d'images demandées
            </p>
          </div>

          {/* Répartition par type de paiement */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💳 Répartition des paiements
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.paymentsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {type === "generation" ? "🎨 Génération unique" : ""}
                    {type === "credits" ? "💎 Pack de crédits" : ""}
                    {type === "subscription" ? "🔄 Abonnement" : ""}
                    {!["generation", "credits", "subscription"].includes(type) ? type : ""}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(analytics.paymentsByType).length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  Aucun paiement ce mois
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Revenus par jour */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📅 Revenus par jour
          </h3>
          {Object.keys(analytics.revenueByDay).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.revenueByDay)
                .sort(([a], [b]) => {
                  const dateA = new Date(a.split("/").reverse().join("-"));
                  const dateB = new Date(b.split("/").reverse().join("-"));
                  return dateB.getTime() - dateA.getTime();
                })
                .map(([date, revenue]) => (
                  <div key={date} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{date}</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Aucun revenu enregistré ce mois
            </p>
          )}
        </div>

        {/* Période */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Période: {new Date(analytics.period.start).toLocaleDateString("fr-FR")} - {new Date(analytics.period.end).toLocaleDateString("fr-FR")}
        </div>
      </div>
    </div>
    </>
  );
}
