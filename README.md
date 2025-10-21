# PhotoIA - Générateur d'Images IA 📸✨# PhotoIA v2.1 📸✨



Application web de génération d'images propulsée par l'IA, avec paiement Stripe et authentification Supabase.![CI badge](https://github.com/mathisbaala/photoia/actions/workflows/ci.yml/badge.svg)

![Version](https://img.shields.io/badge/version-2.1-blue)

## 🚀 Démarrage Rapide![Status](https://img.shields.io/badge/status-production--ready-green)



### Prérequis**Plateforme de génération d'images IA professionnelle** avec système de crédits, modèles multiples et paiements Stripe.



- Node.js 20+Construite avec **Next.js 15**, **TypeScript**, **Supabase**, **Replicate** et **Stripe**. Interface moderne, fluide et responsive avec un design system complet.

- Compte [Supabase](https://supabase.com)

- Compte [Stripe](https://stripe.com) (mode test)---

- Compte [Replicate](https://replicate.com)

## 🎉 Version 2.1 - Octobre 2025

### Installation

### ✨ Nouveautés majeures

```bash

# 1. Cloner le projet**🎨 Design System Complet (19 composants)**

git clone https://github.com/mathisbaala/photoia.git- Phase 1 : Features business (crédits, paiements, analytics)

cd photoia- Phase 2 : UI professionnelle (7 composants)

- Phase 3 : Design system (6 composants réutilisables)

# 2. Installer les dépendances

npm install**💳 Système de Crédits Flexible**

- 3 packs de crédits (10, 25, 50)

# 3. Configurer l'environnement- Stripe Checkout intégré

cp .env.example .env.local- Webhooks sécurisés

# Éditer .env.local avec vos clés- Emails automatiques



# 4. Lancer le serveur**🤖 3 Modèles IA avec Pricing Dynamique**

npm run dev- Basic (2€), Pro (3€), Expert (5€)

```- Sélecteur de modèle interactif

- Descriptions détaillées

Ouvrir http://localhost:3000

**📊 Dashboard Admin Complet**

## ⚙️ Configuration- Analytics de revenus

- Métriques de conversion

### Variables d'Environnement- Historique des paiements



```bash---

# Supabase

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co## 📚 Documentation Complète

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ...> **🚀 Nouveau sur le projet ?** Commencez par [`CHECKLIST_ACTIONS_REQUISES.md`](./CHECKLIST_ACTIONS_REQUISES.md)



# Stripe| Document | Description | Priorité |

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...|----------|-------------|----------|

STRIPE_SECRET_KEY=sk_test_...| **[CHECKLIST_ACTIONS_REQUISES.md](./CHECKLIST_ACTIONS_REQUISES.md)** | Ce qu'il faut faire MAINTENANT (45 min) | 🔴 URGENT |

STRIPE_WEBHOOK_SECRET=whsec_...| **[SETUP_COMPLET_SERVICES.md](./SETUP_COMPLET_SERVICES.md)** | Configuration complète des services externes | 🔴 URGENT |

| **[QUEST_CE_QUI_MANQUE.md](./QUEST_CE_QUI_MANQUE.md)** | État actuel et prochaines étapes | 🔴 URGENT |

# Replicate| [LIVRAISON_COMPLETE_V2.1.md](./LIVRAISON_COMPLETE_V2.1.md) | Résumé final du projet | 🟡 Important |

REPLICATE_API_TOKEN=r8_...| [INDEX_DOCUMENTATION_V2.1.md](./INDEX_DOCUMENTATION_V2.1.md) | Index complet de toute la doc | 🟡 Important |

| [ROADMAP_COMPLETE.md](./ROADMAP_COMPLETE.md) | Timeline et métriques du projet | ⚪ Lecture |

# App

NEXT_PUBLIC_URL=http://localhost:3000**15 documents disponibles** avec guides, exemples et troubleshooting complets.

```

---

### Configuration Supabase**15 documents disponibles** avec guides, exemples et troubleshooting complets.



1. Créez un projet Supabase---

2. Exécutez les migrations SQL (dans l'ordre) :

   - `migrations/001_create_projects.sql`## 📋 Table des Matières

   - `migrations/002_secure_projects.sql`

   - `migrations/004_create_payments_table.sql`- [Fonctionnalités Principales](#fonctionnalités-principales)

   - `migrations/add_stripe_payment_columns.sql`- [Stack Technique](#stack-technique)

- [Démarrage Rapide](#démarrage-rapide)

### Configuration Stripe (Développement)- [Configuration Complète](#configuration-complète)

- [Scripts npm](#scripts-npm)

```bash- [Structure du Projet](#structure-du-projet)

# Installer Stripe CLI- [Design System](#design-system)

brew install stripe/stripe-cli/stripe- [Tests](#tests)

- [Déploiement](#déploiement)

# Écouter les webhooks- [FAQ](#faq)

stripe listen --forward-to localhost:3000/api/webhooks/stripe

```---



## 📦 Stack Technique## ✨ Fonctionnalités Principales



- **Framework** : Next.js 15 (App Router)### 💳 Système de Crédits

- **Language** : TypeScript- **3 packs** : 10 crédits (10€), 25 crédits (24€), 50 crédits (45€)

- **Database** : Supabase (PostgreSQL)- **Stripe Checkout** : Paiement sécurisé avec carte

- **Auth** : Supabase Auth- **Webhooks** : Ajout automatique des crédits

- **Paiement** : Stripe Checkout + Webhooks- **Historique complet** : Tous les paiements tracés

- **IA** : Replicate (magic-image-refiner)- **Widget temps réel** : Affichage des crédits restants

- **Styling** : CSS Modules

- **Déploiement** : Vercel### 🤖 Génération IA Multi-Modèles

- **Basic (2€/image)** : `google/nano-banana` - Rapide et économique

## 🚢 Déploiement sur Vercel- **Pro (3€/image)** : `batouresearch/magic-image-refiner` - Qualité supérieure

- **Expert (5€/image)** : `zsxkib/qwen2-vl` - Meilleure qualité possible

Consultez le guide détaillé : [DEPLOYMENT.md](./DEPLOYMENT.md)- **Sélecteur interactif** : Cartes expandables avec descriptions

- **Pricing dynamique** : Débité automatiquement des crédits

### Résumé Rapide

### 📊 Dashboard Admin

1. Connectez votre repo GitHub à Vercel- **Analytics de revenus** : Total, par période, taux de conversion

2. Configurez les variables d'environnement- **Métriques détaillées** : Nombre de transactions, montant moyen

3. Déployez- **Répartition** : Par type de pack, graphiques visuels

4. Configurez le webhook Stripe avec votre URL de production- **Historique** : Liste complète des paiements avec filtres



## 📝 Scripts NPM### 🎨 Interface Moderne

- **19 composants UI** : Navigation, Toasts, Modals, Cards, Badges...

```bash- **8 animations CSS** : Smooth et optimisées GPU

npm run dev         # Développement- **Design system complet** : Couleurs, variantes, tailles cohérentes

npm run build       # Build production- **Fully responsive** : Mobile, tablette, desktop

npm run start       # Serveur production- **Dark mode ready** : Architecture préparée

npm run lint        # Linter

npm run typecheck   # Vérification TypeScript### � Sécurité

```- **Authentification Supabase** : Email/password avec session

- **RLS policies** : Accès base de données sécurisé

## 🎨 Fonctionnalités- **Webhooks signés** : Vérification Stripe signature

- **Service role key** : Jamais exposée côté client

- ✅ Génération d'images IA- **CORS configuré** : Protection contre les requêtes malveillantes

- ✅ Authentification (inscription/connexion)

- ✅ Paiement Stripe par génération (3€)---

- ✅ Dashboard utilisateur

- ✅ Historique des projets## 🛠 Stack Technique

- ✅ Upload d'images

- ✅ Téléchargement des résultats### Frontend

```

## 📂 Structure du Projet├─ Next.js 15 .................. App Router, RSC, Server Actions

├─ React 18 .................... Server & Client Components

```├─ TypeScript .................. Strict mode, types complets

app/├─ Tailwind CSS ................ Utility-first styling

  ├── api/                    # API Routes└─ CSS Animations .............. 8 keyframes optimisées GPU

  │   ├── create-checkout-session/```

  │   ├── generate/

  │   ├── projects/### Backend

  │   └── webhooks/```

  ├── components/             # Composants React├─ Next.js API Routes .......... 6 endpoints sécurisés

  ├── dashboard/              # Dashboard utilisateur├─ Supabase PostgreSQL ......... Base de données relationnelle

  ├── lib/                    # Utilitaires├─ Supabase Auth ............... Authentification complète

  ├── login/                  # Page de connexion├─ Supabase Storage ............ Stockage d'images sécurisé

  └── signup/                 # Page d'inscription└─ Stripe API .................. Paiements & webhooks

migrations/                   # Migrations SQL```

```

### Services Externes

## 🔒 Sécurité```

├─ Replicate API ............... 3 modèles IA configurés

- ✅ Authentification Supabase├─ Stripe Checkout ............. Paiement sécurisé

- ✅ Row Level Security (RLS)├─ SendGrid .................... Emails transactionnels (opt.)

- ✅ Vérification des webhooks Stripe└─ Vercel ...................... Hébergement & déploiement

- ✅ Variables d'environnement sécurisées```

- ✅ Validation côté serveur

---

## 📚 Documentation

## 🚀 Démarrage Rapide

- [Guide de déploiement](./DEPLOYMENT.md)

- [Variables d'environnement](./.env.example)### Prérequis

- Node.js 18+ et npm

## 🤝 Contribution- Compte Supabase (gratuit)

- Compte Stripe (mode test gratuit)

Les contributions sont les bienvenues ! N'oubliez pas de :- Compte Replicate (pay-as-you-go)



1. Créer une branche pour votre feature### Installation (5 minutes)

2. Tester localement

3. Vérifier le linting : `npm run lint````bash

4. Vérifier TypeScript : `npm run typecheck`# 1. Cloner le projet

git clone https://github.com/mathisbaala/photoia.git

## 📄 Licencecd photoia



UNLICENSED - Projet privé# 2. Installer les dépendances

npm install

---

# 3. Configurer les variables d'environnement

**Développé avec ❤️ par Mathis Baala**cp .env.example .env.local

# Éditer .env.local avec vos clés

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir http://localhost:3000

### ⚠️ Configuration Requise

**Avant que tout fonctionne**, vous devez :

1. **Régénérer les types Supabase** (5 min)
```bash
npx supabase gen types typescript \
  --project-id VOTRE_PROJECT_ID \
  > app/lib/database.types.ts
```

2. **Configurer les webhooks Stripe** (5 min)
```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. **Exécuter les migrations SQL** (2 min)
   - Dans Supabase SQL Editor
   - Exécuter `migrations/003_create_credits_table.sql`
   - Exécuter `migrations/004_create_payments_table.sql`

📖 **Guide détaillé** : [`CHECKLIST_ACTIONS_REQUISES.md`](./CHECKLIST_ACTIONS_REQUISES.md)

---

## ⚙️ Configuration Complète

### Variables d'Environnement

Créer `.env.local` à la racine :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Mode Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Replicate
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid (Optionnel)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### Configuration des Services

| Service | Guide | Temps |
|---------|-------|-------|
| Supabase | [`SETUP_COMPLET_SERVICES.md`](./SETUP_COMPLET_SERVICES.md) (Section 1) | 15 min |
| Stripe | [`SETUP_COMPLET_SERVICES.md`](./SETUP_COMPLET_SERVICES.md) (Section 2) | 10 min |
| Replicate | [`SETUP_COMPLET_SERVICES.md`](./SETUP_COMPLET_SERVICES.md) (Section 3) | 5 min |
| Vercel | [`SETUP_COMPLET_SERVICES.md`](./SETUP_COMPLET_SERVICES.md) (Section 4) | 15 min |

**Total : 45 minutes de configuration**

---
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
