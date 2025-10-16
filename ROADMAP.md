# 🚀 Roadmap & Améliorations - PhotoIA

Ce document liste les améliorations possibles pour faire évoluer PhotoIA d'un MVP à un produit complet.

---

## 🎯 Améliorations prioritaires

### 1. 📊 Page Historique des paiements (`/billing`)

**Objectif** : Permettre aux utilisateurs de consulter leur historique de paiements et télécharger leurs factures.

**Implémentation** :

```typescript
// app/billing/page.tsx
import { getStripeClient } from "@/lib/stripe";

export default async function BillingPage() {
  const stripe = getStripeClient();
  const user = await getCurrentUser(); // depuis Supabase
  
  // Récupérer le customer_id Stripe de l'utilisateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();
  
  if (!profile?.stripe_customer_id) {
    return <div>Aucun historique de paiement</div>;
  }
  
  // Récupérer les paiements
  const paymentIntents = await stripe.paymentIntents.list({
    customer: profile.stripe_customer_id,
    limit: 100,
  });
  
  return (
    <div>
      <h1>Historique des paiements</h1>
      {paymentIntents.data.map((payment) => (
        <div key={payment.id}>
          <p>Date : {new Date(payment.created * 1000).toLocaleDateString()}</p>
          <p>Montant : {payment.amount / 100}€</p>
          <p>Statut : {payment.status}</p>
          {payment.charges.data[0]?.receipt_url && (
            <a href={payment.charges.data[0].receipt_url} target="_blank">
              📄 Télécharger la facture
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Migration nécessaire** :
```sql
-- Ajouter stripe_customer_id à la table profiles (ou créer la table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id text UNIQUE,
  created_at timestamp DEFAULT now()
);
```

**Modifications requises** :
- Modifier `/api/create-checkout-session` pour créer/associer un customer Stripe
- Sauvegarder `stripe_customer_id` dans la table `profiles` après le premier paiement

---

### 2. 🔔 Webhooks de sécurité et notifications

**Objectif** : Gérer les échecs de paiement et envoyer des notifications par email.

**Webhooks à ajouter dans `/api/webhooks/stripe/route.ts`** :

```typescript
// Gérer les échecs de paiement
if (event.type === "payment_intent.payment_failed") {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const userEmail = paymentIntent.receipt_email || paymentIntent.metadata?.user_email;
  
  // Envoyer un email via SendGrid ou Supabase Edge Function
  await sendPaymentFailedEmail(userEmail, {
    amount: paymentIntent.amount / 100,
    reason: paymentIntent.last_payment_error?.message,
  });
}

// Gérer les annulations d'abonnement (si vous ajoutez des abonnements)
if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  // Récupérer l'email du customer
  const customer = await stripe.customers.retrieve(customerId);
  
  await sendSubscriptionCanceledEmail(customer.email);
}
```

**Service d'emails recommandé** :
- **Option 1** : Supabase Edge Functions (gratuit, intégré)
- **Option 2** : SendGrid (100 emails/jour gratuits)
- **Option 3** : Resend (simple et moderne)

**Exemple avec Supabase Edge Function** :
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { to, subject, html } = await req.json();
  
  // Utiliser l'API SMTP de votre choix
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@photoia.com" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

### 3. 📈 Dashboard Analytics (Admin)

**Objectif** : Vue d'ensemble des métriques business pour les administrateurs.

**Créer une page `/admin/analytics`** :

```typescript
// app/admin/analytics/page.tsx
import { getStripeClient } from "@/lib/stripe";

export default async function AnalyticsPage() {
  const stripe = getStripeClient();
  
  // Récupérer les transactions du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const transactions = await stripe.balanceTransactions.list({
    created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
    limit: 100,
  });
  
  // Calculer les métriques
  const totalRevenue = transactions.data.reduce((sum, tx) => sum + tx.amount, 0) / 100;
  const totalPayments = transactions.data.length;
  
  // Récupérer les stats depuis Supabase
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  
  const { count: payingUsers } = await supabase
    .from("projects")
    .select("user_id", { count: "exact", head: true })
    .eq("payment_status", "paid")
    .not("user_id", "is", null);
  
  const conversionRate = ((payingUsers / totalUsers) * 100).toFixed(2);
  
  return (
    <div className="analytics-dashboard">
      <h1>📊 Analytics</h1>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Revenue du mois</h3>
          <p className="metric-value">{totalRevenue}€</p>
        </div>
        
        <div className="metric-card">
          <h3>Paiements</h3>
          <p className="metric-value">{totalPayments}</p>
        </div>
        
        <div className="metric-card">
          <h3>Utilisateurs</h3>
          <p className="metric-value">{totalUsers}</p>
        </div>
        
        <div className="metric-card">
          <h3>Taux de conversion</h3>
          <p className="metric-value">{conversionRate}%</p>
        </div>
      </div>
      
      {/* Graphiques avec Chart.js ou Recharts */}
    </div>
  );
}
```

**Sécurité** : Ajouter un rôle `admin` dans Supabase et protéger cette route.

---

## 💡 Améliorations spécifiques "Paiement à la génération"

### 4. 🎫 Système de packs de crédits

**Objectif** : Permettre l'achat de packs (10 générations pour 15€) pour réduire le coût unitaire.

**Migration SQL** :
```sql
-- Table pour gérer les crédits
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining int DEFAULT 0,
  total_credits_purchased int DEFAULT 0,
  last_purchase_at timestamp,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- Table pour l'historique des crédits
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount int, -- positif = achat, négatif = consommation
  type text, -- 'purchase', 'usage'
  project_id uuid REFERENCES projects(id),
  stripe_payment_intent_id text,
  created_at timestamp DEFAULT now()
);
```

**Packs proposés** :
```typescript
// app/lib/credit-packs.ts
export const CREDIT_PACKS = [
  { id: "pack_1", credits: 1, price: 200, label: "1 génération" },
  { id: "pack_5", credits: 5, price: 900, label: "5 générations", discount: "10%" },
  { id: "pack_10", credits: 10, price: 1500, label: "10 générations", discount: "25%" },
  { id: "pack_25", credits: 25, price: 3000, label: "25 générations", discount: "40%" },
];
```

**Interface dashboard** :
```typescript
// Afficher les crédits restants
const { data: credits } = await supabase
  .from("user_credits")
  .select("credits_remaining")
  .eq("user_id", user.id)
  .single();

<div className="credits-badge">
  ⭐ {credits?.credits_remaining || 0} crédits restants
</div>

// Bouton d'achat de pack
<button onClick={() => buyPack("pack_10")}>
  Acheter 10 crédits (15€)
</button>
```

**Modifier l'API generate** :
```typescript
// Vérifier les crédits au lieu du paiement
const { data: userCredits } = await supabase
  .from("user_credits")
  .select("credits_remaining")
  .eq("user_id", user.id)
  .single();

if (userCredits.credits_remaining <= 0) {
  return NextResponse.json(
    { error: "Crédits insuffisants. Achetez un pack !" },
    { status: 402 }
  );
}

// Décrémenter les crédits après génération réussie
await supabase
  .from("user_credits")
  .update({ credits_remaining: userCredits.credits_remaining - 1 })
  .eq("user_id", user.id);

// Logger la transaction
await supabase
  .from("credit_transactions")
  .insert({
    user_id: user.id,
    amount: -1,
    type: "usage",
    project_id: projectId,
  });
```

---

### 5. 🎨 Prix dynamique selon le modèle IA

**Objectif** : Proposer plusieurs modèles IA à différents prix.

**Configuration des modèles** :
```typescript
// app/lib/ai-models.ts
export const AI_MODELS = [
  {
    id: "nano-banana",
    name: "Nano Banana (Standard)",
    provider: "google/nano-banana",
    price: 200, // 2€
    description: "Transformations rapides et de qualité",
    features: ["Rapide", "Bon rapport qualité/prix"],
  },
  {
    id: "magic-refiner",
    name: "Magic Refiner (Premium)",
    provider: "batouresearch/magic-image-refiner",
    price: 300, // 3€
    description: "Qualité supérieure avec plus de détails",
    features: ["Haute qualité", "Meilleurs détails"],
  },
  {
    id: "qwen2-vl",
    name: "Qwen2 VL (Pro)",
    provider: "zsxkib/qwen2-vl",
    price: 500, // 5€
    description: "Meilleure IA du marché",
    features: ["Excellence", "Résultats exceptionnels"],
  },
];
```

**Interface de sélection** :
```typescript
// app/dashboard/page.tsx
<div className="model-selector">
  <label>Choisissez un modèle IA :</label>
  {AI_MODELS.map((model) => (
    <div key={model.id} className="model-card">
      <input
        type="radio"
        name="ai-model"
        value={model.id}
        checked={selectedModel === model.id}
        onChange={() => setSelectedModel(model.id)}
      />
      <div>
        <h3>{model.name}</h3>
        <p>{model.description}</p>
        <p className="price">{model.price / 100}€</p>
        <ul>
          {model.features.map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
      </div>
    </div>
  ))}
</div>

<button onClick={handleGenerate}>
  Générer ({AI_MODELS.find(m => m.id === selectedModel)?.price / 100}€)
</button>
```

**Modifier l'API create-checkout-session** :
```typescript
// Récupérer le prix depuis le modèle choisi
const modelId = body.modelId;
const selectedModel = AI_MODELS.find((m) => m.id === modelId);

if (!selectedModel) {
  return NextResponse.json({ error: "Modèle invalide" }, { status: 400 });
}

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: `Génération avec ${selectedModel.name}`,
        },
        unit_amount: selectedModel.price, // Prix dynamique
      },
      quantity: 1,
    },
  ],
  metadata: {
    project_id: projectId,
    model_id: modelId, // Sauvegarder le modèle choisi
  },
  // ...
});
```

**Modifier l'API generate** :
```typescript
// Utiliser le modèle sauvegardé dans le projet
const { data: project } = await supabase
  .from("projects")
  .select("model_id")
  .eq("id", projectId)
  .single();

const selectedModel = AI_MODELS.find((m) => m.id === project.model_id);

// Appeler le bon modèle Replicate
const output = await replicate.run(selectedModel.provider, {
  input: { image: inputPublic.publicUrl, prompt },
});
```

**Migration SQL** :
```sql
ALTER TABLE public.projects
ADD COLUMN model_id text DEFAULT 'nano-banana';
```

---

## 🎁 Améliorations bonus

### 6. Programme de parrainage

- Offrir 3 crédits gratuits pour chaque ami parrainé
- Table `referrals` avec `referrer_id`, `referred_id`, `status`
- Code promo unique par utilisateur

### 7. Mode abonnement mensuel

- Offre "Illimité" à 19€/mois
- Table `subscriptions` avec `plan`, `status`, `current_period_end`
- Webhook `customer.subscription.created`

### 8. Galerie publique

- Permettre aux utilisateurs de rendre leurs créations publiques
- Page `/gallery` avec les meilleures générations
- Système de likes et de partage

### 9. API publique

- Endpoint `/api/v1/generate` avec authentification par token
- Rate limiting (ex: 100 requêtes/heure)
- Documentation Swagger/OpenAPI

### 10. Tests A/B sur les prix

- Tester différents prix selon le segment d'utilisateurs
- Analyser le taux de conversion
- Optimiser le pricing

---

## 📚 Ressources

- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Replicate Models](https://replicate.com/explore)
- [SendGrid Docs](https://docs.sendgrid.com/)

---

**Prochaine étape recommandée** : Commencer par l'amélioration #4 (Packs de crédits) car elle améliore directement le business model et l'expérience utilisateur.
