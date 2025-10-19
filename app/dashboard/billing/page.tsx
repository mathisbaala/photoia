"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";
import Navigation from "@/components/Navigation";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import { useToast, ToastContainer } from "@/components/Toast";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  credits_purchased: number;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
}

export default function BillingPage() {
  const router = useRouter();
  const { error: toastError, success, toasts, removeToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
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

    loadPayments();
  }

  async function loadPayments() {
    try {
      setLoading(true);
      const response = await fetch("/api/payments");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des paiements");
      }

      const data = await response.json();
      setPayments(data.payments);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      succeeded: { label: "✅ Réussi", className: "bg-green-100 text-green-800" },
      pending: { label: "⏳ En attente", className: "bg-yellow-100 text-yellow-800" },
      failed: { label: "❌ Échoué", className: "bg-red-100 text-red-800" },
      canceled: { label: "🚫 Annulé", className: "bg-gray-100 text-gray-800" },
      refunded: { label: "↩️ Remboursé", className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  }

  function getPaymentTypeLabel(type: string, credits: number) {
    switch (type) {
      case "generation":
        return "Génération unique";
      case "credits":
        return `Pack de ${credits} crédits`;
      case "subscription":
        return "Abonnement";
      default:
        return type;
    }
  }

  if (loading) {
    return <PageLoader message="Chargement de votre historique..." />;
  }

  return (
    <>
      <Navigation />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 pt-24">
        <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            💳 Historique des paiements
          </h1>
          <p className="text-gray-600 text-lg">
            Retrouvez tous vos paiements et factures
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 animate-slideDown">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Liste des paiements */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg">
            <EmptyState
              icon="💸"
              title="Aucun paiement"
              description="Vous n'avez pas encore effectué de paiement. Commencez à créer des images IA maintenant !"
              actionLabel="Commencer à créer"
              onAction={() => router.push("/dashboard")}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Facture
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment, index) => (
                    <tr 
                      key={payment.id} 
                      className="hover:bg-purple-50/50 transition-colors"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.description || "Paiement PhotoIA"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getPaymentTypeLabel(payment.payment_type, payment.credits_purchased)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.receipt_url ? (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                          >
                            📄 Télécharger
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Résumé amélioré */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-6 border-t-2 border-purple-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total des paiements réussis
                  </p>
                  <p className="text-xs text-gray-500">
                    {payments.filter((p) => p.status === "succeeded").length} transaction(s)
                  </p>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatAmount(
                    payments
                      .filter((p) => p.status === "succeeded")
                      .reduce((sum, p) => sum + p.amount, 0),
                    "eur"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
