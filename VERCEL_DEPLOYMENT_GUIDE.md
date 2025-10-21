# 🚀 Guide de Déploiement Vercel - PhotoIA

## ✅ Changements Poussés sur GitHub

Commit: `02936ba` - ✨ UI/UX Improvements  
Branch: `master`  
Date: 20 octobre 2024

### Fichiers Modifiés/Ajoutés
- 34 fichiers modifiés
- 4,985 lignes ajoutées
- 159 lignes supprimées

---

## 🔧 Configuration Vercel Requise

### 1. Variables d'Environnement à Configurer

Allez sur **Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**

#### Variables Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

#### Variables Stripe
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (ou pk_test_... pour test)
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... pour test)
STRIPE_WEBHOOK_SECRET=whsec_... (à obtenir après configuration webhook)
```

#### Variables Replicate (IA)
```bash
REPLICATE_API_TOKEN=r8_...
```

#### Autres Variables
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

---

## 🎯 Étapes de Déploiement

### Méthode 1: Déploiement Automatique (Recommandé)

Si votre projet est déjà connecté à Vercel:

1. **Vercel détecte automatiquement** le push sur `master`
2. **Build démarre automatiquement**
3. **Déploiement en ~2-3 minutes**

✅ **C'est fait !** Vercel va automatiquement déployer les changements.

### Méthode 2: Déploiement Manuel

Si ce n'est pas encore configuré:

#### Via Dashboard Vercel

1. **Connecter le Repository**
   ```
   Vercel Dashboard → Add New Project
   → Import Git Repository
   → Sélectionner: mathisbaala/photoia
   ```

2. **Configuration Framework**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Ajouter les Variables d'Environnement**
   - Copier toutes les variables listées ci-dessus
   - Environment: Production, Preview, Development

4. **Deploy**
   - Cliquer sur "Deploy"
   - Attendre 2-3 minutes

#### Via CLI Vercel

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd /Users/mathisbaala/Projects/cours3/photoia
vercel --prod
```

---

## 🔄 Configuration Webhook Stripe

### Après le Premier Déploiement

1. **Obtenir l'URL de Webhook**
   ```
   https://votre-domaine.vercel.app/api/webhooks/stripe
   ```

2. **Configurer dans Stripe Dashboard**
   - Aller sur: https://dashboard.stripe.com/webhooks
   - Cliquer sur "Add endpoint"
   - URL: `https://votre-domaine.vercel.app/api/webhooks/stripe`
   - Events à écouter:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`

3. **Récupérer le Webhook Secret**
   - Cliquer sur le webhook créé
   - Copier "Signing secret" (commence par `whsec_...`)
   - Ajouter dans Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`

4. **Redéployer**
   - Après ajout du webhook secret
   - Vercel redéploie automatiquement ou:
   ```bash
   vercel --prod
   ```

---

## 🗄️ Migrations Supabase

### Tables à Créer (si pas déjà fait)

Exécuter dans **Supabase SQL Editor**:

#### 1. Table Credits
```sql
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON credits FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 2. Table Payments
```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_customer_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL,
  credits_purchased INTEGER NOT NULL,
  payment_method TEXT,
  description TEXT,
  payment_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

#### 3. Mise à Jour Table Projects
```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS model_id TEXT,
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 1;
```

---

## ✅ Checklist Post-Déploiement

### Tests à Effectuer

- [ ] **Page d'accueil** charge correctement
- [ ] **Login/Signup** fonctionnent
- [ ] **Dashboard** s'affiche avec animations
- [ ] **CreditsWidget** affiche le solde
- [ ] **ModelSelector** affiche les 3 modèles
- [ ] **BuyCreditsModal** s'ouvre et affiche les packs
- [ ] **Clic sur "Acheter"** redirige vers Stripe
- [ ] **Paiement test** fonctionne (mode test)
- [ ] **Webhook Stripe** reçoit les events
- [ ] **Crédits** sont ajoutés après paiement
- [ ] **Génération d'image** consomme les crédits
- [ ] **Page Billing** affiche l'historique
- [ ] **Admin Analytics** (si admin configuré)

### Vérifications Techniques

- [ ] Build Vercel: ✅ Success
- [ ] Pas d'erreurs dans les logs
- [ ] Variables d'environnement configurées
- [ ] Webhook Stripe configuré
- [ ] Tables Supabase créées
- [ ] RLS policies activées
- [ ] Performance: Lighthouse > 90
- [ ] Animations fluides (60fps)

---

## 🐛 Résolution de Problèmes

### Build Errors

**Erreur**: `Module not found`
```bash
# Solution: Vérifier les imports
npm run build
```

**Erreur**: `Type error in database.types.ts`
```bash
# Solution: Régénérer les types
npx supabase gen types typescript --project-id YOUR_ID > app/lib/database.types.ts
```

### Runtime Errors

**Erreur**: `Supabase connection failed`
```
Solution: Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Erreur**: `Stripe checkout session failed`
```
Solution: Vérifier STRIPE_SECRET_KEY et NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Erreur**: `Webhook signature verification failed`
```
Solution: Vérifier STRIPE_WEBHOOK_SECRET (commence par whsec_)
```

---

## 📊 Monitoring

### Logs Vercel

```
Vercel Dashboard → Votre projet → Logs
- Filtrer par erreurs
- Chercher "stripe", "supabase", "error"
```

### Stripe Dashboard

```
https://dashboard.stripe.com/test/logs
- Vérifier les events webhook
- Status: succeeded / failed
```

### Supabase Dashboard

```
https://app.supabase.com/project/YOUR_ID/logs
- Vérifier les queries
- Erreurs d'authentification
```

---

## 🎉 Résultat Attendu

Après déploiement réussi, vous devriez avoir:

✅ **Interface moderne** avec animations premium  
✅ **Système de crédits** fonctionnel  
✅ **Paiements Stripe** intégrés  
✅ **3 modèles IA** disponibles  
✅ **Dashboard admin** pour analytics  
✅ **Page billing** avec historique  
✅ **Toasts** pour feedback utilisateur  
✅ **Responsive** mobile/tablet/desktop  
✅ **Performance** optimale  

---

## 🚀 Prochaines Étapes

1. **Tester en Production** (mode test Stripe)
2. **Passer en Live** (clés live Stripe)
3. **Configurer domaine personnalisé** (optionnel)
4. **Ajouter monitoring** (Sentry, LogRocket)
5. **Analytics** (Google Analytics, Plausible)

---

## 📞 Support

**Problème avec le déploiement ?**

1. Vérifier les logs Vercel
2. Tester le build en local: `npm run build`
3. Vérifier toutes les variables d'environnement
4. S'assurer que les tables Supabase existent

**Tout fonctionne ?** 🎉

Votre site est maintenant live avec toutes les améliorations UI/UX !

---

**Date**: 20 octobre 2024  
**Version**: 2.0  
**Status**: Ready to Deploy 🚀
