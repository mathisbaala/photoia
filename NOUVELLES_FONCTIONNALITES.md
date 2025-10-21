# 🎉 Nouvelles fonctionnalités PhotoIA

## 📋 Résumé des améliorations

Ce document décrit toutes les nouvelles fonctionnalités ajoutées au projet PhotoIA.

---

## 1. 💳 Historique des paiements

### Page `/dashboard/billing`

Une nouvelle page dédiée à l'historique des paiements de l'utilisateur.

**Fonctionnalités :**
- Liste de tous les paiements effectués
- Affichage : date, description, type, montant, statut, facture PDF
- Badges colorés pour les statuts (réussi, en attente, échoué, etc.)
- Total des paiements réussis
- Téléchargement des factures PDF Stripe

**Fichiers créés :**
- `app/dashboard/billing/page.tsx` - Interface utilisateur
- `app/api/payments/route.ts` - API pour récupérer les paiements

**Table Supabase :**
- `payments` - Stocke tous les paiements avec métadonnées complètes

---

## 2. 🔔 Webhooks de sécurité

### Événements gérés

Le webhook Stripe a été étendu pour gérer plus d'événements.

**Nouveaux événements :**

#### `payment_intent.succeeded`
- Enregistre le paiement dans la table `payments`
- Récupère l'URL de la facture PDF
- **Envoie un email de confirmation** à l'utilisateur

#### `payment_intent.payment_failed`
- Enregistre l'échec dans la table `payments`
- **Envoie un email d'alerte** à l'utilisateur avec la raison de l'échec
- Suggère de mettre à jour le moyen de paiement

#### `customer.subscription.deleted`
- **Envoie un email de confirmation** d'annulation
- Indique la date de fin d'accès aux services

**Fichiers modifiés :**
- `app/api/webhooks/stripe/route.ts` - Gestion des webhooks
- `app/lib/email.ts` - Templates d'emails (nouveau fichier)

**Configuration requise :**
```bash
# Dans Stripe Dashboard, ajouter ces événements au webhook :
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
- customer.subscription.deleted
```

---

## 3. 📊 Dashboard Analytics Admin

### Page `/dashboard/admin/analytics`

Un tableau de bord complet pour les administrateurs.

**Métriques affichées :**

### KPIs principaux
- **💰 Revenus du mois** - Via Stripe Balance Transactions
- **✅ Nombre de paiements réussis** - Avec montant total
- **🔄 Abonnements actifs** - Nombre d'abonnements Stripe actifs
- **📈 Taux de conversion** - Utilisateurs payants / Total utilisateurs

### Statistiques détaillées
- **🎨 Projets créés** - Nombre de générations demandées
- **💳 Répartition par type** - Génération unique, packs, abonnements
- **📅 Revenus par jour** - Graphique temporel

**Fichiers créés :**
- `app/dashboard/admin/analytics/page.tsx` - Interface admin
- `app/api/admin/analytics/route.ts` - API analytics

**TODO :** Sécuriser avec un rôle admin
```typescript
const isAdmin = user.user_metadata?.role === 'admin';
if (!isAdmin) {
  return redirect('/dashboard');
}
```

---

## 4. 💎 Système de crédits

### Packs de crédits disponibles

Les utilisateurs peuvent acheter des packs de crédits à l'avance.

**Packs proposés :**

| Pack | Crédits | Prix | Prix/crédit | Économie |
|------|---------|------|-------------|----------|
| **Starter** | 10 | 15€ | 1,50€ | - |
| **Pro** | 25 | 30€ | 1,20€ | 20% |
| **Business** | 50 | 50€ | 1,00€ | 33% |

**Fonctionnalités :**
- Achat de crédits via Stripe Checkout
- Décrément automatique à chaque génération
- Affichage des crédits restants sur le dashboard
- Crédits valables à vie (pas d'expiration)

**Fichiers créés :**
- `app/api/buy-credits/route.ts` - Achat de packs
- `app/api/credits/route.ts` - Gestion des crédits
- `app/components/BuyCreditsModal.tsx` - Modal d'achat

**Table Supabase :**
- `credits` - Stocke les crédits par utilisateur

**Flux d'utilisation :**
```
1. Utilisateur clique "Acheter des crédits"
2. Choisit un pack (10, 25 ou 50 crédits)
3. Paiement via Stripe
4. Webhook ajoute les crédits à l'utilisateur
5. À chaque génération, 1 crédit est déduit
```

---

## 5. 🤖 Prix dynamique selon le modèle IA

### Sélection du modèle

Les utilisateurs peuvent choisir parmi 3 modèles IA avec des prix différents.

**Modèles disponibles :**

#### 1. Google Nano Banana - 2€
- Modèle rapide pour transformations simples
- Temps estimé : ~10 secondes
- Idéal pour tests rapides

#### 2. Batouresearch Magic Image Refiner - 3€ ⭐
- Raffinement de qualité professionnelle
- Temps estimé : ~20 secondes
- **Modèle par défaut** (meilleur rapport qualité/prix)

#### 3. Zsxkib Qwen2 VL - 5€ 👑
- Modèle premium pour résultats exceptionnels
- Temps estimé : ~30 secondes
- Pour les projets professionnels

**Fonctionnalités :**
- Sélecteur visuel de modèle sur le dashboard
- Prix ajusté automatiquement dans Stripe
- Métadonnées du modèle enregistrées avec le projet

**Fichiers créés/modifiés :**
- `app/lib/ai-models.ts` - Configuration des modèles (nouveau)
- `app/components/ModelSelector.tsx` - Sélecteur de modèle (nouveau)
- `app/api/create-checkout-session/route.ts` - Modifié pour prix dynamique

---

## 📦 Migrations Supabase

### Nouvelles tables

#### Table `credits`
```sql
-- migrations/003_create_credits_table.sql
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### Table `payments`
```sql
-- migrations/004_create_payments_table.sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL,
  payment_method TEXT,
  description TEXT,
  receipt_url TEXT,
  payment_type TEXT DEFAULT 'generation',
  credits_purchased INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

**Installation :**
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Exécuter `003_create_credits_table.sql`
4. Exécuter `004_create_payments_table.sql`

---

## 🚀 Prochaines étapes

### Configuration des emails (Production)

Pour envoyer de vrais emails, configurer SendGrid :

```bash
npm install @sendgrid/mail
```

```typescript
// Dans app/lib/email.ts, décommenter :
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: options.to,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: options.subject,
  html: options.html,
});
```

**Variables d'environnement :**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@photoia.com
```

### Sécurisation du dashboard admin

Ajouter un système de rôles :

```typescript
// Dans Supabase, ajouter un champ role à user_metadata
const { data } = await supabase.auth.updateUser({
  data: { role: 'admin' }
});

// Protéger les routes admin
if (user.user_metadata?.role !== 'admin') {
  return redirect('/dashboard');
}
```

### Intégration des crédits dans la génération

Modifier `app/api/generate/route.ts` :

```typescript
// Avant de générer, vérifier les crédits
const creditsResponse = await fetch('/api/credits');
const { credits } = await creditsResponse.json();

if (credits.credits_remaining <= 0) {
  return NextResponse.json({ error: "Plus de crédits" }, { status: 402 });
}

// Après génération réussie, décrémenter
await fetch('/api/credits/use', { method: 'POST' });
```

---

## 🧪 Tests

### Tester les webhooks localement

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Dans un autre terminal, déclencher un événement
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger customer.subscription.deleted
```

### Tester les paiements

Utiliser les cartes de test Stripe :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **Authentification** : `4000 0025 0000 3155`

---

## 📊 Architecture mise à jour

```
PhotoIA
├── Paiement unique (avec choix du modèle)
│   ├── 2€ - Google Nano Banana
│   ├── 3€ - Magic Image Refiner (défaut)
│   └── 5€ - Qwen2 VL (premium)
│
├── Packs de crédits
│   ├── 10 crédits - 15€
│   ├── 25 crédits - 30€ (20% off)
│   └── 50 crédits - 50€ (33% off)
│
├── Historique des paiements
│   └── /dashboard/billing
│
├── Analytics Admin
│   └── /dashboard/admin/analytics
│
└── Webhooks
    ├── checkout.session.completed
    ├── payment_intent.succeeded → Email
    ├── payment_intent.payment_failed → Email
    └── customer.subscription.deleted → Email
```

---

## ✅ Checklist de déploiement

- [ ] Exécuter les migrations SQL dans Supabase
- [ ] Configurer les webhooks Stripe avec les nouveaux événements
- [ ] Tester localement avec Stripe CLI
- [ ] Configurer SendGrid (ou autre service email)
- [ ] Ajouter les variables d'environnement
- [ ] Tester les packs de crédits
- [ ] Tester le sélecteur de modèles
- [ ] Vérifier la page billing
- [ ] Vérifier les analytics admin
- [ ] Ajouter un système de rôles pour l'admin
- [ ] Intégrer la déduction de crédits dans /api/generate
- [ ] Tester tous les webhooks en production
- [ ] Documenter les nouveaux endpoints API

---

## 📝 Notes importantes

1. **TypeScript** : Les erreurs TypeScript liées aux tables `credits` et `payments` sont normales jusqu'à ce que les types soient régénérés depuis Supabase.

2. **Emails** : En développement, les emails sont loggés dans la console. Configurer SendGrid pour la production.

3. **Admin** : Le dashboard analytics n'a pas encore de protection par rôle. À implémenter avant la production.

4. **Crédits** : Le système de crédits est créé mais pas encore intégré dans le flux de génération. À connecter dans `/api/generate`.

5. **Webhooks** : Tester intensivement avec Stripe CLI avant de déployer.

---

**Développé avec ❤️ pour PhotoIA**
