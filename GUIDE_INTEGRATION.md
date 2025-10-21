# 🔧 Guide d'intégration au Dashboard

Ce guide vous aide à intégrer les nouvelles fonctionnalités dans votre dashboard existant.

## 📁 Fichiers créés

### Migrations SQL (à exécuter dans Supabase)
```
migrations/
├── 003_create_credits_table.sql
└── 004_create_payments_table.sql
```

### APIs
```
app/api/
├── payments/route.ts              # GET: Liste des paiements
├── credits/route.ts               # GET: Crédits, POST: Utiliser 1 crédit
├── buy-credits/route.ts           # POST: Acheter un pack
├── admin/analytics/route.ts       # GET: Analytics admin
├── create-checkout-session/route.ts  # Modifié: prix dynamique
└── webhooks/stripe/route.ts       # Modifié: nouveaux événements
```

### Pages
```
app/dashboard/
├── billing/page.tsx               # Historique des paiements
└── admin/analytics/page.tsx       # Dashboard analytics
```

### Composants
```
app/components/
├── BuyCreditsModal.tsx            # Modal pour acheter des crédits
└── ModelSelector.tsx              # Sélecteur de modèle IA
```

### Librairies
```
app/lib/
├── email.ts                       # Service d'emails (nouveau)
└── ai-models.ts                   # Configuration modèles IA (nouveau)
```

---

## 🎯 Intégration dans le Dashboard principal

### Étape 1 : Afficher les crédits restants

Ajoutez ce code en haut de votre dashboard (`app/dashboard/page.tsx`) :

```tsx
"use client";

import { useEffect, useState } from "react";
import BuyCreditsModal from "@/components/BuyCreditsModal";

interface Credits {
  credits_remaining: number;
  total_purchased: number;
}

export default function Dashboard() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  async function loadCredits() {
    try {
      const response = await fetch("/api/credits");
      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Erreur chargement crédits:", error);
    }
  }

  return (
    <div>
      {/* Affichage des crédits */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-1">💎 Vos crédits</h3>
            <p className="text-3xl font-bold">
              {credits?.credits_remaining || 0} crédits restants
            </p>
          </div>
          <button
            onClick={() => setShowBuyModal(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Acheter des crédits
          </button>
        </div>
      </div>

      {/* Modal d'achat */}
      <BuyCreditsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={loadCredits}
      />

      {/* Reste de votre dashboard... */}
    </div>
  );
}
```

---

### Étape 2 : Ajouter le sélecteur de modèle

Dans votre formulaire de génération, ajoutez :

```tsx
import ModelSelector from "@/components/ModelSelector";
import { getDefaultModel } from "@/lib/ai-models";

export default function Dashboard() {
  const [selectedModel, setSelectedModel] = useState(getDefaultModel());

  // Lors de la création du projet et du paiement
  async function handleGenerate() {
    // 1. Créer le projet
    const projectResponse = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        // ... autres données
      }),
    });
    const { projectId } = await projectResponse.json();

    // 2. Créer la session de paiement avec le modèle sélectionné
    const checkoutResponse = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        modelId: selectedModel, // ← Nouveau paramètre
      }),
    });

    const { url } = await checkoutResponse.json();
    if (url) window.location.href = url;
  }

  return (
    <div>
      {/* Sélecteur de modèle */}
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Reste du formulaire... */}
      <button onClick={handleGenerate}>
        Générer
      </button>
    </div>
  );
}
```

---

### Étape 3 : Ajouter les liens de navigation

Dans votre menu/navigation :

```tsx
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/dashboard/billing">💳 Mes paiements</a>
  <a href="/dashboard/admin/analytics">📊 Analytics (Admin)</a>
</nav>
```

---

### Étape 4 : Utiliser les crédits lors de la génération

Modifiez votre API de génération (`app/api/generate/route.ts`) :

```typescript
export async function POST(request: Request) {
  // ... authentification ...

  // Vérifier si l'utilisateur a des crédits
  const creditsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/credits`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Si nécessaire
      },
    }
  );
  
  const { credits } = await creditsResponse.json();

  // Si l'utilisateur a des crédits, les utiliser au lieu de payer
  if (credits && credits.credits_remaining > 0) {
    // Utiliser 1 crédit
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/credits/use`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Continuer avec la génération
    // ... code de génération ...
  } else {
    // Sinon, rediriger vers le paiement
    return NextResponse.json({
      error: "Crédits insuffisants. Veuillez acheter des crédits ou payer à l'unité.",
      requiresPayment: true,
    });
  }
}
```

---

### Étape 5 : Gérer les notifications de succès

Ajoutez des toasts/notifications après achat de crédits :

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Après achat de crédits réussi
    if (searchParams.get("credits_purchased") === "true") {
      alert("✅ Crédits achetés avec succès !");
      // Ou utilisez un système de toast
      loadCredits(); // Recharger les crédits
    }

    // Si achat annulé
    if (searchParams.get("credits_canceled") === "true") {
      alert("❌ Achat annulé");
    }
  }, [searchParams]);

  // ...
}
```

---

## 🔄 Flux utilisateur complet

### Scénario 1 : Génération avec crédits

```
1. User a 10 crédits
2. Clique "Générer" (sans paiement)
3. 1 crédit est déduit
4. Génération lancée immédiatement
5. Reste 9 crédits
```

### Scénario 2 : Génération sans crédits

```
1. User a 0 crédit
2. Clique "Générer"
3. Modal : "Acheter des crédits" ou "Payer 2-5€ à l'unité"
4. User choisit un modèle (2€, 3€ ou 5€)
5. Paiement Stripe
6. Génération lancée
```

### Scénario 3 : Achat de crédits

```
1. User clique "Acheter des crédits"
2. Choisit un pack (10, 25 ou 50)
3. Paiement Stripe
4. Webhook ajoute les crédits
5. Redirection vers dashboard avec notification
```

---

## 🎨 Améliorations UI suggérées

### Widget de crédits compact

```tsx
<div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow">
  <span className="text-2xl">💎</span>
  <div>
    <p className="text-sm text-gray-600">Crédits</p>
    <p className="text-lg font-bold">{credits?.credits_remaining || 0}</p>
  </div>
  <button
    onClick={() => setShowBuyModal(true)}
    className="ml-4 bg-purple-600 text-white px-3 py-1 rounded text-sm"
  >
    +
  </button>
</div>
```

### Badge "Meilleur rapport qualité/prix"

```tsx
{selectedModel === "batouresearch/magic-image-refiner" && (
  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
    ⭐ Recommandé
  </span>
)}
```

### Comparaison de prix

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
  <h4 className="font-bold text-blue-900 mb-2">💡 Conseil</h4>
  <p className="text-sm text-blue-800">
    Acheter le Pack Pro (25 crédits) vous fait économiser 20% par rapport à l'achat à l'unité !
  </p>
</div>
```

---

## ✅ Checklist d'intégration

- [ ] Installer les migrations SQL dans Supabase
- [ ] Tester l'API `/api/credits`
- [ ] Tester l'API `/api/buy-credits`
- [ ] Afficher les crédits sur le dashboard
- [ ] Ajouter le sélecteur de modèle
- [ ] Intégrer la déduction de crédits dans `/api/generate`
- [ ] Ajouter les liens vers `/billing` et `/admin/analytics`
- [ ] Tester le flux complet d'achat de crédits
- [ ] Tester le flux de génération avec crédits
- [ ] Tester le flux de génération sans crédits
- [ ] Configurer les webhooks Stripe
- [ ] Tester les emails (dev mode d'abord)
- [ ] Ajouter des notifications/toasts
- [ ] Améliorer l'UX avec des loaders
- [ ] Documenter pour l'équipe

---

## 🐛 Résolution de problèmes

### Les types TypeScript sont cassés

```bash
# Régénérer les types depuis Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts
```

### Les webhooks ne fonctionnent pas localement

```bash
# Utiliser Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Les emails ne sont pas envoyés

En développement, c'est normal. Ils sont loggés dans la console. Configurer SendGrid pour la production.

---

**Bon développement ! 🚀**
