# 🛠️ Scripts et commandes utiles

## 📋 Commandes de développement

### Démarrer le projet
```bash
cd /Users/mathisbaala/Projects/cours3/photoia
npm run dev
```

### Vérifier les erreurs TypeScript
```bash
npm run typecheck
```

### Linter le code
```bash
npm run lint
npm run lint:fix
```

---

## 🗄️ Migrations Supabase

### 1. Créer la table credits
```bash
# Copier le contenu de migrations/003_create_credits_table.sql
# Aller dans Supabase Dashboard > SQL Editor
# Coller et exécuter
```

### 2. Créer la table payments
```bash
# Copier le contenu de migrations/004_create_payments_table.sql
# Aller dans Supabase Dashboard > SQL Editor
# Coller et exécuter
```

### 3. Régénérer les types TypeScript
```bash
# Remplacer YOUR_PROJECT_ID par votre ID Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts
```

---

## 💳 Configuration Stripe

### Installer Stripe CLI (macOS)
```bash
brew install stripe/stripe-cli/stripe
```

### Se connecter à Stripe
```bash
stripe login
```

### Écouter les webhooks localement
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Tester les webhooks
```bash
# Dans un autre terminal

# Test paiement réussi
stripe trigger payment_intent.succeeded

# Test paiement échoué
stripe trigger payment_intent.payment_failed

# Test annulation abonnement
stripe trigger customer.subscription.deleted

# Test checkout complété
stripe trigger checkout.session.completed
```

### Configurer le webhook en production
```bash
# Dans Stripe Dashboard > Developers > Webhooks
# Ajouter un endpoint : https://votre-domaine.com/api/webhooks/stripe
# Sélectionner ces événements :
# - checkout.session.completed
# - payment_intent.succeeded
# - payment_intent.payment_failed
# - customer.subscription.deleted

# Copier le webhook secret et l'ajouter à .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 📧 Configuration SendGrid (Production)

### Installer SendGrid
```bash
npm install @sendgrid/mail
```

### Obtenir la clé API
```bash
# 1. Créer un compte sur https://sendgrid.com
# 2. Aller dans Settings > API Keys
# 3. Créer une nouvelle API Key
# 4. Copier la clé
```

### Configurer les variables d'environnement
```bash
# Ajouter dans .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

### Vérifier l'email expéditeur
```bash
# Dans SendGrid Dashboard
# Settings > Sender Authentication
# Verify Single Sender
# Entrer votre email et vérifier
```

---

## 🧪 Tests

### Tester l'API des crédits
```bash
# GET crédits
curl http://localhost:3000/api/credits \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST utiliser 1 crédit
curl -X POST http://localhost:3000/api/credits/use \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tester l'API des paiements
```bash
# GET historique
curl http://localhost:3000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tester l'achat de crédits
```bash
# POST acheter pack
curl -X POST http://localhost:3000/api/buy-credits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"packId": "medium"}'
```

### Tester les analytics admin
```bash
curl http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Variables d'environnement

### .env.local (à créer)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App
NEXT_PUBLIC_URL=http://localhost:3000

# SendGrid (Production)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@photoia.com

# Replicate (IA)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

---

## 📊 Requêtes SQL utiles

### Voir tous les crédits des utilisateurs
```sql
SELECT 
  u.email,
  c.credits_remaining,
  c.total_purchased,
  c.updated_at
FROM credits c
JOIN auth.users u ON c.user_id = u.id
ORDER BY c.credits_remaining DESC;
```

### Voir tous les paiements du mois
```sql
SELECT 
  u.email,
  p.amount,
  p.status,
  p.payment_type,
  p.credits_purchased,
  p.created_at
FROM payments p
JOIN auth.users u ON p.user_id = u.id
WHERE p.created_at >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY p.created_at DESC;
```

### Statistiques de revenus
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  payment_type
FROM payments
WHERE status = 'succeeded'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at), payment_type
ORDER BY date DESC;
```

### Top utilisateurs par crédits achetés
```sql
SELECT 
  u.email,
  c.total_purchased,
  c.credits_remaining,
  COUNT(p.id) as total_payments,
  SUM(p.amount) as total_spent
FROM credits c
JOIN auth.users u ON c.user_id = u.id
LEFT JOIN payments p ON p.user_id = u.id AND p.status = 'succeeded'
GROUP BY u.email, c.total_purchased, c.credits_remaining
ORDER BY total_spent DESC
LIMIT 10;
```

---

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Démarrer en production
```bash
npm run start
```

### Déployer sur Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ou déployer en production
vercel --prod
```

### Configurer les variables d'environnement sur Vercel
```bash
# Via le dashboard Vercel
# Settings > Environment Variables
# Ajouter toutes les variables de .env.local
```

---

## 🐛 Debug

### Voir les logs Stripe
```bash
stripe logs tail
```

### Voir les logs Vercel
```bash
vercel logs
```

### Tester les webhooks avec un payload custom
```bash
stripe trigger payment_intent.succeeded \
  --add payment_intent:metadata[user_id]=USER_ID \
  --add payment_intent:metadata[payment_type]=credits \
  --add payment_intent:metadata[credits_purchased]=10
```

---

## 📦 Maintenance

### Nettoyer les dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les dépendances obsolètes
```bash
npm outdated
```

---

## 🔄 Workflow Git

### Créer une branche pour les nouvelles fonctionnalités
```bash
git checkout -b feature/credits-and-analytics
```

### Commit des changements
```bash
git add .
git commit -m "feat: Add credits system, billing page, analytics dashboard, and dynamic pricing"
```

### Push vers GitHub
```bash
git push origin feature/credits-and-analytics
```

### Créer une Pull Request
```bash
# Via GitHub interface
```

---

## 📝 Scripts package.json suggérés

Ajoutez ces scripts dans `package.json` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "lint:fix": "next lint --fix",
    "check": "npm run lint && npm run typecheck",
    
    // Nouveaux scripts
    "db:migrate": "echo 'Ouvrir Supabase Dashboard et exécuter les migrations'",
    "db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/webhooks/stripe",
    "stripe:test": "stripe trigger payment_intent.succeeded",
    "test:credits": "curl http://localhost:3000/api/credits",
    "test:payments": "curl http://localhost:3000/api/payments",
    "test:analytics": "curl http://localhost:3000/api/admin/analytics"
  }
}
```

---

## 🎯 Quick Start complet

### Première installation
```bash
# 1. Cloner et installer
cd /Users/mathisbaala/Projects/cours3/photoia
npm install

# 2. Créer .env.local avec toutes les variables

# 3. Exécuter les migrations SQL dans Supabase

# 4. Régénérer les types
npm run db:types

# 5. Démarrer le serveur
npm run dev

# 6. Dans un autre terminal, écouter les webhooks
npm run stripe:listen

# 7. Ouvrir http://localhost:3000
```

---

**Happy Coding! 🎉**
