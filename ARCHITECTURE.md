# 🔄 Architecture du système de paiement Stripe

## Flow complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1. Clique "Générer (2€)"
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (page.tsx)                              │
│  • Crée un projet avec payment_status='pending'                     │
│  • Sauvegarde image/prompt dans localStorage                        │
│  • Appelle POST /api/create-checkout-session                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 2. projectId
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              API: /api/create-checkout-session                       │
│  • Vérifie l'authentification                                       │
│  • Vérifie que project.user_id === user.id                          │
│  • Vérifie que payment_status !== 'paid'                            │
│  • Crée une Stripe Checkout Session                                 │
│    - Prix: 200 centimes (2€) hardcodé                              │
│    - metadata: { project_id, user_id }                              │
│  • Retourne l'URL Stripe                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 3. URL Stripe
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       STRIPE CHECKOUT                                │
│  • Formulaire de paiement sécurisé                                  │
│  • User entre carte 4242 4242 4242 4242                            │
│  • Stripe traite le paiement                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         4a. Succès │                           │ 4b. Webhook
                    ▼                           ▼
    ┌───────────────────────┐   ┌──────────────────────────────────┐
    │  Redirect /dashboard  │   │  POST /api/webhooks/stripe       │
    │  ?session_id=xxx      │   │  • Vérifie signature webhook     │
    └───────────────────────┘   │  • Récupère project_id metadata  │
                                │  • Met à jour payment_status     │
                                │    = 'paid' dans Supabase        │
                                └──────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (après paiement)                        │
│  • Détecte session_id dans URL                                      │
│  • Vérifie payment_status='paid' dans Supabase                      │
│  • Affiche "✅ Paiement confirmé"                                   │
│  • Affiche bouton "Lancer la génération"                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 5. Clique "Lancer la génération"
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (génération)                            │
│  • Récupère image/prompt du localStorage                            │
│  • Appelle POST /api/generate avec projectId                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 6. FormData (projectId, image, prompt)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API: /api/generate                                │
│  • Vérifie l'authentification                                       │
│  • Si projectId fourni:                                             │
│    - Récupère le projet                                             │
│    - Vérifie user_id === auth.uid()                                 │
│    - ⚠️  Vérifie payment_status === 'paid'                          │
│  • Upload image vers Supabase Storage                               │
│  • Appelle Replicate AI                                             │
│  • Upload résultat vers Supabase Storage                            │
│  • Met à jour output_image_url, status='completed'                  │
│  • Retourne l'URL de l'image générée                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 7. { outputUrl }
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (résultat)                              │
│  • Affiche "✅ Génération terminée"                                 │
│  • Affiche l'image générée                                          │
│  • Nettoie localStorage                                             │
│  • Recharge la liste des projets                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Sécurité appliquée

### 1. Montant hardcodé serveur-side ✅
```typescript
// app/lib/stripe.ts
export const PRICE_PER_GENERATION = 200; // 2.00 EUR
```
Le client ne peut jamais modifier le prix.

### 2. Vérification de l'appartenance ✅
```typescript
if (project.user_id !== user.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```
Un user ne peut payer/générer que ses propres projets.

### 3. Signature des webhooks ✅
```typescript
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  webhookSecret
);
```
Seuls les webhooks signés par Stripe sont acceptés.

### 4. Vérification du paiement ✅
```typescript
if (project.payment_status !== "paid") {
  return NextResponse.json({ error: "Payment required" }, { status: 402 });
}
```
L'IA ne génère que si le paiement est confirmé.

## Base de données Supabase

```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY,
  created_at timestamp,
  user_id uuid REFERENCES auth.users(id),
  
  -- Colonnes existantes
  input_image_url text,
  output_image_url text,
  prompt text,
  status text DEFAULT 'processing',
  
  -- ✨ Nouvelles colonnes Stripe
  payment_status text DEFAULT 'pending',          -- pending | paid | failed
  payment_amount numeric,                         -- 2.00
  stripe_payment_intent_id text,                  -- pi_xxx
  stripe_checkout_session_id text                 -- cs_xxx
);
```

## Variables d'environnement requises

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # De stripe listen

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_URL=http://localhost:3000

# Replicate (déjà configuré)
REPLICATE_API_TOKEN=r8_xxx
```

## Fichiers créés/modifiés

### Nouveaux fichiers
- ✨ `app/lib/stripe.ts` - Client Stripe
- ✨ `app/api/create-checkout-session/route.ts` - Création session
- ✨ `app/api/webhooks/stripe/route.ts` - Réception webhooks
- ✨ `migrations/add_stripe_payment_columns.sql` - Migration DB
- ✨ `STRIPE_SETUP.md` - Documentation complète
- ✨ `QUICKSTART_STRIPE.md` - Guide rapide
- ✨ `ARCHITECTURE.md` - Ce fichier

### Fichiers modifiés
- 🔧 `app/api/generate/route.ts` - Vérification paiement
- 🔧 `app/dashboard/page.tsx` - UI paiement
- 🔧 `app/lib/database.types.ts` - Types Stripe
- 🔧 `.env.local` - Clés Stripe

## Points d'attention

### ⚠️ Avant de déployer en production

1. **Créer un webhook en production**
   - Dashboard Stripe > Webhooks > Add endpoint
   - URL: `https://votre-domaine.com/api/webhooks/stripe`
   - Événement: `checkout.session.completed`

2. **Mettre à jour les variables d'environnement**
   - Remplacer `STRIPE_WEBHOOK_SECRET` par le secret production
   - Mettre à jour `NEXT_PUBLIC_URL` avec le domaine de prod

3. **Tester en mode test**
   - Utilisez toujours les clés `pk_test_` et `sk_test_` pour les tests
   - Passez aux clés `pk_live_` et `sk_live_` uniquement en prod

4. **Configurer les emails Stripe**
   - Dashboard Stripe > Settings > Emails
   - Activer les confirmations de paiement

## 🎯 Prochaines améliorations possibles

- [ ] Historique des paiements dans le dashboard
- [ ] Remboursements depuis l'interface
- [ ] Crédits prépayés (acheter 10 générations)
- [ ] Webhooks supplémentaires (payment_intent.succeeded, etc.)
- [ ] Gestion des erreurs de paiement
- [ ] Mode d'essai gratuit (1 génération gratuite)
