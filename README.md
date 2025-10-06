# VisionCraft Studio 📸✨

Éditeur d’images propulsé par l’IA, construit avec **Next.js 15**, **TypeScript**, **Supabase** et **Replicate**.

## Aperçu du produit
- Téléversez une image d’entrée.
- Décrivez la transformation souhaitée via un prompt.
- Générez un nouveau visuel (modèle Replicate `google/nano-banana`).
- Les images d’origine et générées sont stockées dans Supabase Storage.
- Chaque traitement est logué dans la table `projects` (statut, prompt, URLs).

## Structure du projet
```
app/
  page.tsx                 → UI principale (upload, preview, actions)
  layout.tsx               → Layout global + métadonnées
  globals.css              → Styles généraux
  api/generate/route.ts    → API route pour la génération IA
  lib/
    database.types.ts      → Typage Supabase (table projects)
    supabase-client.ts     → Client Supabase côté navigateur
    supabase-admin.ts      → Client Supabase service role
    replicate.ts           → Client Replicate
migrations/
  001_create_projects.sql  → Script SQL pour la table `projects`
.env.local (à créer)        → Variables d’environnement
```

## Prérequis
- Node.js 20+
- Compte [Supabase](https://supabase.com)
- Compte [Replicate](https://replicate.com)

## Variables d’environnement
Crée un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://veulahermznmcjnokeua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldWxhaGVybXpubWNqbm9rZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDMzNTMsImV4cCI6MjA3NDM3OTM1M30.pvrwYi3HwDEkewcgCZ4Owm3vgBZhfgVowY1R4raxabA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldWxhaGVybXpubWNqbm9rZXVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwMzM1MywiZXhwIjoyMDc0Mzc5MzUzfQ.yFJhTDyhGda8HvOQ_2oI_6hbPhE-vFC_X1X85iKjyNI
REPLICATE_API_TOKEN=r8_9aItlihXX0H6Muu6Y0cB0QJt4JBJ8LE4XARVe
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images
```

## Installation locale
```bash
npm install
npm run dev
```
Site dispo sur [http://localhost:3000](http://localhost:3000).

## Scripts npm
- `npm run dev` : serveur de dev
- `npm run build` : build production
- `npm run start` : serveur production
- `npm run lint` : lint Next.js

## Déploiement
1. Déploie sur Vercel (ou autre) après avoir installé les dépendances.
2. Renseigne les variables d’environnement dans le dashboard.
3. Crée les buckets Supabase `input-images` et `output-images`.
4. Exécute le script `migrations/001_create_projects.sql` sur Supabase :
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

## Notes
- Les dépendances n’ont pas été installées dans cet environnement (pas d’accès réseau) : exécute `npm install` en local.
- L’API `/api/generate` nécessite les buckets et la table configurés pour fonctionner.

Bonne création visuelle ✨
