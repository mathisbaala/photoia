# VisionCraft Studio (PhotoIA) 📸✨

![CI badge](https://github.com/mathisbaala/photoia/actions/workflows/ci.yml/badge.svg)

Éditeur d’images propulsé par l’IA, construit avec **Next.js 15**, **TypeScript**, **Supabase** et **Replicate**. Téléversez une photo, décrivez la transformation désirée et laissez l’IA générer un visuel cohérent. Les originaux comme les rendus finaux sont historisés dans Supabase pour suivre chaque itération.

## Sommaire
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d’environnement](#variables-denvironnement)
- [Scripts npm](#scripts-npm)
- [Structure du projet](#structure-du-projet)
- [Flux GitHub & CI/CD](#flux-github--cicd)
- [Déploiement](#déploiement)
- [Sécurité & bonnes pratiques](#sécurité--bonnes-pratiques)

## Fonctionnalités principales
- Téléversement sécurisé dans Supabase Storage (buckets `input-images` et `output-images`).
- Génération rapide via le modèle Replicate `google/nano-banana`.
- Historisation des prompts, statuts et URLs dans la table `projects`.
- UI guidée : dropzone animée, compteur de prompt, téléchargements directs du rendu IA.
- Workflow GitHub Actions prêt à l’emploi (lint + typecheck + build sur chaque branche).

## Stack technique
- **Framework** : Next.js 15 / App Router
- **Langages** : TypeScript, CSS Modules
- **Backend** : API Routes Next.js, Supabase (PostgreSQL + Storage)
- **IA** : Replicate SDK
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

## Variables d’environnement
Le fichier `.env.example` récapitule les variables indispensables :

```env
NEXT_PUBLIC_SUPABASE_URL=<votre-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<votre-service-role-key>
REPLICATE_API_TOKEN=<votre-token-replicate>
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images
```

## Scripts npm
- `npm run dev` : serveur de développement
- `npm run build` : build production
- `npm run start` : serveur production
- `npm run lint` : lint Next.js / ESLint
- `npm run lint:fix` : lint avec auto-correction
- `npm run typecheck` : vérification TypeScript sans émission
- `npm run check` : lint + typecheck

## Structure du projet
```
app/
  components/          → UI réutilisables (AccentPill, PreviewPanel, GithubCallout…)
  content/features.tsx → Copy/features affichées sur la page
  api/generate/        → Route POST qui orchestre Supabase & Replicate
  lib/                 → Clients Supabase, Replicate, types
  page.tsx             → Interface principale
  globals.css          → Styles globaux
migrations/
  001_create_projects.sql → Schéma de la table `projects`
.env.example             → Modèle d’environnement sans secrets
```

## Flux GitHub & CI/CD
- **CI** : `.github/workflows/ci.yml` lance `npm ci`, `npm run lint`, `npm run typecheck` et `npm run build` sur chaque push/pull request.
- **Secrets recommandés** : définis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_INPUT_BUCKET`, `SUPABASE_OUTPUT_BUCKET` et `REPLICATE_API_TOKEN` dans les *Actions secrets* du dépôt GitHub pour refléter ton environnement.
- **Qualité de code** : `.editorconfig` harmonise les contributions; `.nvmrc` garantit la bonne version de Node.

## Déploiement
1. Déploie sur Vercel (ou autre) après avoir installé les dépendances.
2. Renseigne les variables d’environnement dans le dashboard (mêmes clés que ci-dessus).
3. Crée les buckets Supabase `input-images` et `output-images` si besoin.
4. Exécute `migrations/001_create_projects.sql` pour créer la table `projects` :
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
