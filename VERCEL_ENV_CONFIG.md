# ⚙️ Configuration Vercel - Variables d'Environnement

## 📋 Variables Requises

Copiez-collez ces variables dans **Vercel Dashboard** → **Settings** → **Environment Variables**

---

## 🗄️ Supabase (Base de données)

```bash
# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Clé anonyme publique (safe pour le front-end)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.xxxxxxxxxxxxxxxxxxxxxxxxxx

# Clé service role (NE PAS partager, côté serveur uniquement)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Où trouver ?**
1. Aller sur: https://app.supabase.com
2. Sélectionner votre projet
3. Settings → API
4. Copier les 3 valeurs

---

## 💳 Stripe (Paiements)

### Mode Test (pour commencer)

```bash
# Clé publique (safe pour le front-end)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clé secrète (NE PAS partager, côté serveur uniquement)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Où trouver ?**
1. Aller sur: https://dashboard.stripe.com/test/apikeys
2. Copier "Publishable key" et "Secret key"

### Webhook Secret (à configurer APRÈS le premier déploiement)

```bash
# Secret de signature webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Comment obtenir ?**
1. Déployer d'abord sur Vercel
2. Obtenir l'URL: `https://votre-projet.vercel.app/api/webhooks/stripe`
3. Aller sur: https://dashboard.stripe.com/test/webhooks
4. Ajouter endpoint avec cette URL
5. Sélectionner events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
6. Copier le "Signing secret"
7. L'ajouter dans Vercel et redéployer

---

## 🤖 Replicate (IA)

```bash
# Token API Replicate
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Où trouver ?**
1. Aller sur: https://replicate.com/account/api-tokens
2. Copier votre token (ou en créer un nouveau)

---

## 🌐 Autres (Optionnel)

```bash
# URL de votre application (sera généré par Vercel)
NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app

# Environnement (Vercel le définit automatiquement)
NODE_ENV=production
```

---

## ✅ Checklist de Configuration

Avant de déployer, assurez-vous d'avoir:

- [ ] ✅ NEXT_PUBLIC_SUPABASE_URL
- [ ] ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY
- [ ] ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (mode test)
- [ ] ✅ STRIPE_SECRET_KEY (mode test)
- [ ] ✅ REPLICATE_API_TOKEN
- [ ] ⏳ STRIPE_WEBHOOK_SECRET (après premier deploy)

---

## 🔒 Sécurité

### Variables Publiques (NEXT_PUBLIC_*)
- ✅ Safe pour le front-end
- ✅ Visibles dans le bundle JavaScript
- ✅ Peuvent être exposées

### Variables Privées (sans préfixe)
- ⚠️ NE JAMAIS partager
- ⚠️ Côté serveur uniquement
- ⚠️ Ne pas commiter dans Git

---

## 📖 Documentation Complète

Pour plus de détails, consultez:
- **READY_TO_DEPLOY.md** - Guide rapide
- **VERCEL_DEPLOYMENT_GUIDE.md** - Guide complet
- **UI_IMPROVEMENTS_SUMMARY.md** - Changements UI/UX

---

**Prêt ?** → Déployez sur Vercel ! 🚀
