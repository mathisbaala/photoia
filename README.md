# VisionCraft Studio (PhotoIA) 📸✨

![CI badge](https://github.com/mathisbaala/photoia/actions/workflows/ci.yml/badge.svg)

Éditeur d'images propulsé par l'IA, construit avec **Next.js 15**, **TypeScript**, **Supabase**, **Replicate** et **Stripe**. Téléversez une photo, décrivez la transformation désirée, payez 2€ et laissez l'IA générer un visuel cohérent. Les originaux comme les rendus finaux sont historisés dans Supabase pour suivre chaque itération.

## ✨ Nouveautés (Octobre 2025)

🎉 **Paiement Stripe intégré** : Système de paiement à la génération (2€ par image)
- Stripe Checkout avec webhooks sécurisés
- Vérification du paiement avant génération
- Historique complet dans Supabase
- Documentation complète dans `STRIPE_SETUP.md`

## Sommaire
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts npm](#scripts-npm)
- [Structure du projet](#structure-du-projet)
- [Paiement Stripe](#paiement-stripe)
- [Flux GitHub & CI/CD](#flux-github--cicd)
- [Déploiement](#déploiement)
- [Sécurité & bonnes pratiques](#sécurité--bonnes-pratiques)
- [Roadmap](#roadmap)

## Fonctionnalités principales
- 💳 **Paiement sécurisé** : Intégration Stripe avec modèle "pay-per-generation" (2€)
- 🔐 **Authentification** : Supabase Auth avec protection des routes
- 📤 **Téléversement sécurisé** : Supabase Storage (buckets `input-images` et `output-images`)
- 🎨 **Génération IA** : Modèle Replicate `google/nano-banana`
- 📊 **Historisation** : Prompts, statuts, URLs et paiements dans la table `projects`
- ✨ **UI moderne** : Dropzone animée, compteur de prompt, téléchargements directs
- ⚙️ **CI/CD** : GitHub Actions (lint + typecheck + build sur chaque branche)

## Stack technique
- **Framework** : Next.js 15 / App Router
- **Langages** : TypeScript, CSS Modules
- **Backend** : API Routes Next.js, Supabase (PostgreSQL + Storage)
- **Paiement** : Stripe Checkout + Webhooks
- **IA** : Replicate SDK (google/nano-banana)
- **Qualité** : ESLint, TypeScript strict, GitHub Actions CI

## Démarrage rapide
1. **Prérequis**
   - Node.js 20+ (`.nvmrc` fourni)
   - Comptes [Supabase](https://supabase.com) et [Replicate](https://replicate.com)

2. **Installation**
   ```bash
   nvm use            # charge Node 20 si nvm est installé
   npm install
   cp .env.example .env.local
   ```
   Remplis ensuite `.env.local` avec tes identifiants Supabase et Replicate.

3. **Lancement**
   ```bash
   npm run dev
   ```
   L’interface est disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement
Le fichier `.env.example` récapitule les variables indispensables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<votre-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<votre-service-role-key>
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images

# Replicate
REPLICATE_API_TOKEN=<votre-token-replicate>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<votre-pk-test>
STRIPE_SECRET_KEY=<votre-sk-test>
NEXT_PUBLIC_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=<whsec-depuis-stripe-cli>
```

**📚 Voir `STRIPE_SETUP.md` pour la configuration complète de Stripe.**

## Scripts npm
- `npm run dev` : serveur de développement
- `npm run build` : build production
- `npm run start` : serveur production
- `npm run lint` : lint Next.js / ESLint
- `npm run lint:fix` : lint avec auto-correction
- `npm run typecheck` : vérification TypeScript sans émission
- `npm run check` : lint + typecheck

## Paiement Stripe

### Flow complet

1. User clique sur **"Générer (2€)"**
2. Un projet est créé avec `payment_status='pending'`
3. Redirection vers **Stripe Checkout**
4. Après paiement, webhook `checkout.session.completed` met à jour le projet
5. User revient sur dashboard et clique **"Lancer la génération"**
6. L'API vérifie `payment_status='paid'` avant de générer l'image

### Documentation

- **Setup complet** : `STRIPE_SETUP.md`
- **Guide rapide** : `QUICKSTART_STRIPE.md`
- **Architecture** : `ARCHITECTURE.md`
- **Migration SQL** : `migrations/add_stripe_payment_columns.sql`

### Sécurité

✅ Montant hardcodé côté serveur (2€)  
✅ Vérification de signature des webhooks  
✅ Vérification du paiement avant génération  
✅ Isolation par `user_id`

## Structure du projet
```
app/
  components/            → UI réutilisables (AccentPill, PreviewPanel, GithubCallout…)
  context/               → AuthProvider & hook `useAuth`
  content/features.tsx   → Copy/features affichées sur la page
  api/
    generate/            → Route POST qui orchestre Supabase & Replicate
    delete/              → Route DELETE pour nettoyer projets + fichiers
    create-checkout-session/  → Création session Stripe Checkout
    webhooks/stripe/     → Réception webhooks Stripe (checkout.session.completed)
  dashboard/page.tsx     → Tableau de bord authentifié (upload + galerie + paiement)
  login/page.tsx         → Page de connexion email/mot de passe
  signup/page.tsx        → Page d'inscription
  lib/
    supabase-*.ts        → Clients Supabase (browser, route handler, service)
    stripe.ts            → Client Stripe + configuration prix
    database.types.ts    → Types TypeScript générés depuis Supabase
  page.tsx               → Landing avec CTA vers /signup
  globals.css            → Styles globaux
migrations/
  001_create_projects.sql → Schéma de la table `projects`
  002_secure_projects.sql → Colonne `user_id`, index & policies RLS
  add_stripe_payment_columns.sql → Colonnes Stripe (payment_status, etc.)
.env.example              → Modèle d'environnement sans secrets
middleware.ts             → Protection /dashboard et /api (sauf webhooks Stripe)
cleanup-secrets.sh        → Script de nettoyage des secrets Git
```

## Flux GitHub & CI/CD
- **CI** : `.github/workflows/ci.yml` lance `npm ci`, `npm run lint`, `npm run typecheck` et `npm run build` sur chaque push/pull request.
- **Secrets recommandés** : définis les variables d'environnement dans les *Actions secrets* du dépôt GitHub.
- **Qualité de code** : `.editorconfig` harmonise les contributions; `.nvmrc` garantit la bonne version de Node.

## Déploiement

### 1. Déploiement sur Vercel

```bash
# Déployer automatiquement depuis GitHub
# Ou manuellement avec Vercel CLI :
vercel --prod
```

### 2. Variables d'environnement

Configurez toutes les variables listées dans [Variables d'environnement](#variables-denvironnement).

### 3. Configuration Supabase

```sql
-- Exécutez les migrations dans l'ordre :
-- 1. migrations/001_create_projects.sql
-- 2. migrations/002_secure_projects.sql
-- 3. migrations/add_stripe_payment_columns.sql
```

Créez les buckets Storage :
- `input-images` (public)
- `output-images` (public)

### 4. Configuration Stripe

**En développement** :
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**En production** :
1. Allez sur [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Ajoutez un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Événement : `checkout.session.completed`
4. Copiez le webhook secret dans `STRIPE_WEBHOOK_SECRET`

📚 **Guide détaillé** : Consultez `QUICKSTART_STRIPE.md`

## Roadmap

Consultez `ROADMAP.md` pour les améliorations prévues :
- 📊 Historique des paiements (`/billing`)
- 🔔 Webhooks supplémentaires (échecs de paiement, etc.)
- 📈 Dashboard analytics admin
- 🎫 Système de packs de crédits
- 🎨 Choix du modèle IA avec prix dynamique

## Sécurité & bonnes pratiques

⚠️ **IMPORTANT** :
- ❌ Ne committez JAMAIS de secrets (`.env.local` est dans `.gitignore`)
- 🔄 Régénérez les clés si elles ont été exposées publiquement
- 📊 Surveillez la consommation Replicate
- 🔐 Utilisez Row Level Security (RLS) sur Supabase
- ✅ Vérifiez les signatures des webhooks Stripe

**En cas d'exposition de secrets** : Consultez `SECURITY_CHECKLIST.md`

---

## 📚 Documentation

- 📖 **Setup Stripe** : `STRIPE_SETUP.md` - Configuration complète de Stripe
- 🚀 **Quick Start** : `QUICKSTART_STRIPE.md` - Démarrage rapide
- 🏗️ **Architecture** : `ARCHITECTURE.md` - Schéma d'architecture détaillé
- 🗺️ **Roadmap** : `ROADMAP.md` - Améliorations futures
- 🔒 **Sécurité** : `SECURITY_CHECKLIST.md` - Checklist sécurité

---

**Bonne création visuelle ✨**
```
```
app/
  components/            → UI réutilisables (AccentPill, PreviewPanel, GithubCallout…)
  context/               → AuthProvider & hook `useAuth`
  content/features.tsx   → Copy/features affichées sur la page
  api/
    generate/            → Route POST qui orchestre Supabase & Replicate
    delete/              → Route DELETE pour nettoyer projets + fichiers
  dashboard/page.tsx     → Tableau de bord authentifié (upload + galerie)
  login/page.tsx         → Page de connexion email/mot de passe
  signup/page.tsx        → Page d’inscription
  lib/                   → Clients Supabase (browser, route handler, service) & types
  page.tsx               → Landing avec CTA vers /signup
  globals.css            → Styles globaux
migrations/
  001_create_projects.sql → Schéma de la table `projects`
  002_secure_projects.sql → Colonne `user_id`, index & policies RLS
.env.example              → Modèle d’environnement sans secrets
middleware.ts             → Protection /dashboard et /api via Supabase RLS
```

## Flux GitHub & CI/CD
- **CI** : `.github/workflows/ci.yml` lance `npm ci`, `npm run lint`, `npm run typecheck` et `npm run build` sur chaque push/pull request.
- **Secrets recommandés** : définis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_INPUT_BUCKET`, `SUPABASE_OUTPUT_BUCKET` et `REPLICATE_API_TOKEN` dans les *Actions secrets* du dépôt GitHub pour refléter ton environnement.
- **Qualité de code** : `.editorconfig` harmonise les contributions; `.nvmrc` garantit la bonne version de Node.

## Déploiement
1. Déploie sur Vercel (ou autre) après avoir installé les dépendances.
2. Renseigne les variables d’environnement dans le dashboard (mêmes clés que ci-dessus).
3. Crée les buckets Supabase `input-images` et `output-images` si besoin.
4. Exécute `migrations/001_create_projects.sql` puis `migrations/002_secure_projects.sql` pour créer et sécuriser la table `projects` :
   ```sql
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP DEFAULT now(),
     input_image_url TEXT NOT NULL,
     output_image_url TEXT,
     prompt TEXT NOT NULL,
     status TEXT DEFAULT 'processing'
   );
   ```

## Sécurité & bonnes pratiques
- Ne commite jamais de clés réelles : uniquement `.env.example` est versionné.
- Régénère les clés Supabase/Replicate si elles ont déjà été partagées publiquement.
- Surveille la consommation de crédits Replicate; l’API renvoie une erreur explicite en cas de quota insuffisant.
- Pense à ajouter des tests end-to-end (Playwright / Cypress) pour couvrir les scénarios critiques.

Bonne création visuelle ✨
