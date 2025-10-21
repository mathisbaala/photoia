# Déploiement PhotoIA sur Vercel

## 📋 Prérequis

1. Un compte [Vercel](https://vercel.com)
2. Un compte [Supabase](https://supabase.com)
3. Un compte [Stripe](https://stripe.com)
4. Un compte [Replicate](https://replicate.com)

## 🔧 Configuration des services

### 1. Supabase

1. Créez un nouveau projet sur Supabase
2. Exécutez les migrations SQL dans l'ordre :
   - `migrations/001_create_projects.sql`
   - `migrations/002_secure_projects.sql`
   - `migrations/004_create_payments_table.sql`
   - `migrations/add_stripe_payment_columns.sql`

3. Récupérez vos credentials :
   - URL du projet
   - Clé anonyme (anon key)
   - Clé de service (service_role key)

### 2. Stripe

1. Créez un compte Stripe (ou utilisez le mode test)
2. Récupérez vos clés API :
   - Clé publique (`pk_test_...` ou `pk_live_...`)
   - Clé secrète (`sk_test_...` ou `sk_live_...`)
3. Configurez un webhook :
   - URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
   - Événements à écouter : `checkout.session.completed`, `payment_intent.succeeded`
   - Récupérez le secret du webhook (`whsec_...`)

### 3. Replicate

1. Créez un compte sur Replicate
2. Générez un token API
3. Le modèle utilisé : `batouresearch/magic-image-refiner`

## 🚀 Déploiement sur Vercel

### Option 1 : Via l'interface Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre dépôt GitHub
4. Configurez les variables d'environnement (voir ci-dessous)
5. Cliquez sur "Deploy"

### Option 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

## 🔐 Variables d'environnement Vercel

Configurez ces variables dans les paramètres de votre projet Vercel :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Replicate
REPLICATE_API_TOKEN=r8_...

# App URL (après déploiement)
NEXT_PUBLIC_URL=https://votre-app.vercel.app
```

## 🔄 Configuration du webhook Stripe

Après le premier déploiement :

1. Notez l'URL de votre application Vercel
2. Allez dans Stripe Dashboard > Developers > Webhooks
3. Ajoutez un endpoint : `https://votre-app.vercel.app/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copiez le secret du webhook (`whsec_...`)
6. Ajoutez-le dans les variables d'environnement Vercel

## ✅ Vérification

Après le déploiement :

1. Testez l'inscription/connexion
2. Testez la création d'un projet
3. Testez le paiement Stripe
4. Vérifiez que les webhooks fonctionnent
5. Testez la génération d'image

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifiez que les URLs et clés sont correctes
- Assurez-vous que les migrations SQL ont été exécutées

### Erreur de paiement Stripe
- Vérifiez que le webhook est correctement configuré
- Testez avec une carte de test Stripe : `4242 4242 4242 4242`

### Erreur de génération d'image
- Vérifiez que votre token Replicate est valide
- Assurez-vous d'avoir des crédits sur Replicate

## 📚 Documentation

- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Replicate](https://replicate.com/docs)
- [Vercel](https://vercel.com/docs)
