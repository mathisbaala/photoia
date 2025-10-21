# 🛠️ Commandes Utiles - PhotoIA

## 📦 Installation et Setup

### Installation des dépendances
```bash
cd /Users/mathisbaala/Projects/cours3/photoia
npm install
```

### Régénérer les types TypeScript Supabase
```bash
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > app/lib/database.types.ts
```

### Variables d'environnement
Copier et configurer:
```bash
cp .env.example .env.local
# Puis éditer .env.local avec vos vraies clés
```

---

## 🚀 Développement

### Démarrer le serveur de développement
```bash
npm run dev
```
→ Ouvre http://localhost:3000

### Build de production
```bash
npm run build
```

### Démarrer en mode production
```bash
npm start
```

### Linter
```bash
npm run lint
```

---

## 🗄️ Supabase

### Appliquer les migrations
```sql
-- Dans le SQL Editor de Supabase
-- Exécuter dans l'ordre:
-- 1. migrations/003_create_credits_table.sql
-- 2. migrations/004_create_payments_table.sql
```

### Vérifier les tables
```sql
-- Lister les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Voir la structure de credits
SELECT * FROM credits LIMIT 5;

-- Voir la structure de payments
SELECT * FROM payments LIMIT 5;
```

### Tester les RLS policies
```sql
-- En tant qu'utilisateur authentifié
SELECT * FROM credits WHERE user_id = auth.uid();
SELECT * FROM payments WHERE user_id = auth.uid();
```

---

## 💳 Stripe

### Stripe CLI - Installation
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Autres OS: https://stripe.com/docs/stripe-cli
```

### Login Stripe CLI
```bash
stripe login
```

### Forward webhooks localement
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Tester un webhook
```bash
# Simuler checkout.session.completed
stripe trigger checkout.session.completed

# Simuler payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Simuler payment_intent.payment_failed
stripe trigger payment_intent.payment_failed
```

### Voir les événements récents
```bash
stripe events list --limit 10
```

### Dashboard Stripe
```bash
open https://dashboard.stripe.com
```

---

## 📧 SendGrid

### Tester l'envoi d'email (mode dev)
Les emails s'affichent dans la console. Pour tester en production:

```bash
# Ajouter dans .env.local
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

### Vérifier l'API SendGrid
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@votredomaine.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

---

## 🧪 Tests manuels

### Test du flow complet

1. **Créer un compte**:
```bash
# Aller sur /login et créer un compte
# Vérifier l'email dans Supabase Auth
```

2. **Acheter des crédits**:
```bash
# Dashboard → Widget crédits → Acheter
# Utiliser carte test: 4242 4242 4242 4242
# Date: n'importe quelle date future
# CVC: n'importe quel 3 chiffres
```

3. **Vérifier les crédits**:
```sql
SELECT * FROM credits WHERE user_id = 'YOUR_USER_ID';
```

4. **Vérifier le paiement**:
```sql
SELECT * FROM payments WHERE user_id = 'YOUR_USER_ID';
```

5. **Générer une image**:
```bash
# Sélectionner un modèle
# Upload une image
# Entrer un prompt
# Générer (1 crédit déduit)
```

6. **Vérifier l'historique**:
```bash
# Aller sur /dashboard/billing
# Voir tous les paiements
```

---

## 🔍 Debugging

### Voir les logs Next.js
```bash
npm run dev
# Les logs apparaissent dans le terminal
```

### Voir les erreurs TypeScript
```bash
npx tsc --noEmit
```

### Inspecter la database
```sql
-- Nombre total de crédits distribués
SELECT SUM(credits_remaining) FROM credits;

-- Revenu total
SELECT SUM(amount) FROM payments WHERE status = 'succeeded';

-- Utilisateurs avec le plus de crédits
SELECT user_id, credits_remaining 
FROM credits 
ORDER BY credits_remaining DESC 
LIMIT 10;

-- Derniers paiements
SELECT * FROM payments 
ORDER BY created_at DESC 
LIMIT 20;
```

### Clear cache Next.js
```bash
rm -rf .next
npm run dev
```

---

## 📊 Analytics

### Stripe Dashboard
```bash
# Voir les revenus
open https://dashboard.stripe.com/test/payments

# Voir les clients
open https://dashboard.stripe.com/test/customers

# Voir les webhooks
open https://dashboard.stripe.com/test/webhooks
```

### Supabase Dashboard
```bash
# Auth users
open https://supabase.com/dashboard/project/YOUR_PROJECT/auth/users

# Database tables
open https://supabase.com/dashboard/project/YOUR_PROJECT/editor

# Storage
open https://supabase.com/dashboard/project/YOUR_PROJECT/storage/buckets
```

---

## 🚀 Déploiement Vercel

### Installation Vercel CLI
```bash
npm i -g vercel
```

### Login Vercel
```bash
vercel login
```

### Déployer en preview
```bash
vercel
```

### Déployer en production
```bash
vercel --prod
```

### Configurer les variables d'environnement
```bash
# Via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
# etc.

# Ou via dashboard: https://vercel.com/dashboard
```

### Voir les logs
```bash
vercel logs
```

### Voir les déploiements
```bash
vercel ls
```

---

## 🔧 Maintenance

### Update des dépendances
```bash
# Vérifier les updates disponibles
npm outdated

# Update mineur
npm update

# Update majeur (attention!)
npm install next@latest react@latest react-dom@latest
```

### Backup database
```bash
# Via Supabase dashboard
# Settings → Database → Create backup
```

### Export des paiements
```sql
-- Exporter tous les paiements en CSV
COPY (
  SELECT * FROM payments 
  ORDER BY created_at DESC
) TO '/tmp/payments.csv' WITH CSV HEADER;
```

---

## 🎨 Personnalisation UI

### Changer les couleurs
Éditer `app/globals.css`:
```css
:root {
  --accent: #9333EA; /* Primary purple */
  --accent-hover: #A855F7; /* Lighter purple */
  /* Modifier ces valeurs */
}
```

### Changer les animations
Éditer les keyframes dans `app/globals.css`:
```css
@keyframes fadeIn {
  /* Modifier la durée ou l'easing */
}
```

### Ajouter un nouveau modèle IA
Éditer `app/lib/ai-models.ts`:
```typescript
export const AI_MODELS = {
  // Ajouter un nouveau modèle ici
  "nouveau-modele": {
    id: "nouveau-modele",
    name: "Nouveau Modèle",
    price: 4.00,
    // ...
  },
};
```

---

## 📱 Tests responsive

### Chrome DevTools
```
F12 → Toggle device toolbar (Cmd+Shift+M)
Tester: iPhone 12, iPad Pro, Desktop
```

### Simulateurs mobiles
```bash
# iOS Simulator (macOS uniquement)
open -a Simulator

# Android Studio Emulator
# Lancer depuis Android Studio
```

---

## 🐛 Résolution de problèmes courants

### Erreur: "Cannot find module '@/components/...'"
```bash
# Vérifier les imports
# S'assurer que les fichiers existent
# Relancer le serveur
npm run dev
```

### Erreur TypeScript sur Supabase types
```bash
# Régénérer les types
npx supabase gen types typescript --project-id YOUR_ID > app/lib/database.types.ts
```

### Webhook Stripe ne fonctionne pas localement
```bash
# Utiliser Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copier le webhook secret affiché
# L'ajouter dans .env.local comme STRIPE_WEBHOOK_SECRET
```

### Erreur 401 sur les APIs
```bash
# Vérifier que l'utilisateur est connecté
# Vérifier le middleware d'auth
# Vérifier les RLS policies dans Supabase
```

### Build error en production
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Ressources

### Documentation
- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Support
- Next.js Discord: https://nextjs.org/discord
- Supabase Discord: https://discord.supabase.com
- Stripe Support: https://support.stripe.com

---

**Dernière mise à jour**: 19 octobre 2025  
**Version du projet**: 2.0
