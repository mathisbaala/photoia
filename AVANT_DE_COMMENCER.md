# ⚠️ Notes Importantes - Avant de démarrer

## 🔴 Action Requise : Régénérer les types TypeScript

### Problème actuel
Les nouvelles tables `credits` et `payments` ont été créées, mais les types TypeScript de Supabase n'ont pas encore été régénérés. Vous verrez donc des erreurs TypeScript dans certains fichiers.

### ✅ Solution (OBLIGATOIRE)

Exécutez cette commande pour régénérer les types :

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts
```

Ou via l'URL :

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > app/lib/database.types.ts
```

**Fichiers concernés** :
- `app/api/credits/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/payments/route.ts`

### Après régénération

✅ Toutes les erreurs TypeScript disparaîtront  
✅ Autocomplétion fonctionnera pour `credits` et `payments`  
✅ Le projet compilera sans warnings

---

## 📋 Checklist de démarrage

### 1. Configuration Supabase

```sql
-- ✅ Exécuter les migrations SQL dans l'ordre :
-- 1. migrations/003_create_credits_table.sql
-- 2. migrations/004_create_payments_table.sql
```

Vérifier que les tables existent :
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('credits', 'payments');
```

### 2. Configuration Stripe

#### Webhooks à configurer

**Développement local** :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Production** :
1. Aller sur https://dashboard.stripe.com/webhooks
2. Ajouter l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Sélectionner ces événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
4. Copier le webhook secret dans `.env.local`

### 3. Variables d'environnement

Vérifier que `.env.local` contient :

```env
# Supabase (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (REQUIS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_URL=http://localhost:3000

# SendGrid (OPTIONNEL - mode dev = console.log)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### 4. Régénérer les types TypeScript

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts
```

### 5. Installer et démarrer

```bash
npm install
npm run dev
```

---

## 🧪 Tests à effectuer

### Test 1 : Système de crédits

1. Se connecter au dashboard
2. Vérifier que le widget de crédits s'affiche
3. Cliquer sur "Acheter des crédits"
4. Compléter l'achat avec la carte test : `4242 4242 4242 4242`
5. Vérifier que les crédits sont ajoutés

### Test 2 : Génération avec modèles IA

1. Sélectionner un modèle (Nano Banana / Magic Refiner / Qwen2)
2. Upload une image
3. Entrer un prompt
4. Cliquer sur "Générer"
5. Vérifier qu'1 crédit est déduit
6. Vérifier que l'image est générée

### Test 3 : Historique des paiements

1. Aller sur `/dashboard/billing`
2. Vérifier que tous les paiements apparaissent
3. Vérifier les statuts (badges colorés)
4. Cliquer sur les liens de reçus

### Test 4 : Analytics Admin

1. Aller sur `/dashboard/admin/analytics`
2. Vérifier les KPIs
3. Vérifier les graphiques
4. Vérifier la période affichée

### Test 5 : Webhooks

1. Effectuer un achat de crédits
2. Vérifier les logs du terminal
3. Confirmer que le webhook a été reçu
4. Vérifier que les données sont en base

---

## 🐛 Problèmes connus et solutions

### Erreur : "Property 'credits_remaining' does not exist"

**Cause** : Types TypeScript non régénérés  
**Solution** : Exécuter `npx supabase gen types typescript`

### Erreur : "Invalid signature" sur webhook

**Cause** : `STRIPE_WEBHOOK_SECRET` incorrect ou manquant  
**Solution** : Copier le bon secret depuis `stripe listen` ou dashboard Stripe

### Erreur : "Insufficient credits"

**Cause** : Solde de crédits à 0  
**Solution** : Acheter des crédits via le widget ou la modal

### Emails ne s'envoient pas

**Cause** : Mode développement actif  
**Solution** : C'est normal ! Les emails s'affichent dans la console en mode dev. Pour activer SendGrid en production, ajouter `SENDGRID_API_KEY`.

### Page blanche après paiement

**Cause** : Webhook pas configuré correctement  
**Solution** : Vérifier que le webhook est actif et que la signature est bonne

---

## 📊 Monitoring en production

### Supabase

Vérifier régulièrement :
- Nombre d'utilisateurs
- Crédits distribués
- Paiements réussis/échoués

```sql
-- Dashboard queries
SELECT COUNT(*) as total_users FROM auth.users;
SELECT SUM(credits_remaining) as credits_actifs FROM credits;
SELECT SUM(amount) as revenu_total FROM payments WHERE status = 'succeeded';
```

### Stripe

Dashboard à surveiller :
- Paiements réussis/échoués
- Taux de conversion
- Revenus par jour/semaine/mois
- Webhooks en échec

### Application

Logs à surveiller :
- Erreurs de génération IA
- Timeouts Replicate
- Erreurs de webhooks
- Échecs de paiement

---

## 🚀 Passage en production

### Checklist finale

- [ ] Types TypeScript régénérés
- [ ] Toutes les migrations SQL exécutées
- [ ] Variables d'environnement configurées
- [ ] Webhooks Stripe en production configurés
- [ ] SendGrid activé (si souhaité)
- [ ] Tests manuels réussis
- [ ] Build de production OK : `npm run build`
- [ ] Déployé sur Vercel
- [ ] Domaine personnalisé configuré
- [ ] SSL actif (HTTPS)

### Commandes de déploiement

```bash
# Build local pour tester
npm run build
npm start

# Déploiement Vercel
vercel --prod
```

---

## 📚 Documentation de référence

Pour toute question, consulter :

1. **AMELIORATIONS_UX_UI.md** - Détails des composants UI
2. **NOUVELLES_FONCTIONNALITES.md** - Description des features
3. **QUICKSTART_NEW_FEATURES.md** - Guide rapide
4. **COMMANDES_UTILES.md** - Toutes les commandes
5. **SYNTHESE_COMPLETE_V2.md** - Vue d'ensemble complète

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Migrations SQL
# Exécuter 003 et 004 dans Supabase SQL Editor

# 2. Régénérer types
npx supabase gen types typescript --project-id YOUR_ID > app/lib/database.types.ts

# 3. Configurer .env.local
cp .env.example .env.local
# Remplir avec vos vraies clés

# 4. Webhooks Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copier le whsec_xxx dans .env.local

# 5. Lancer
npm install
npm run dev

# 6. Tester
# Ouvrir http://localhost:3000
# Créer un compte
# Acheter des crédits (carte: 4242 4242 4242 4242)
# Générer une image
```

---

**Status actuel** : ⚠️ Types à régénérer  
**Après régénération** : ✅ READY FOR PRODUCTION

**Date** : 19 octobre 2025  
**Version** : 2.0
