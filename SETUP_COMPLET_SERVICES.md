# 🔧 Setup Complet - Services Externes

Ce guide détaille **toutes les étapes** pour configurer Supabase, Stripe, Vercel, SendGrid et Replicate.

---

## 📋 Checklist Globale

```
Services Externes:
[ ] 1. Supabase - Base de données + Auth + Storage
[ ] 2. Stripe - Paiements
[ ] 3. Replicate - IA
[ ] 4. Vercel - Déploiement
[ ] 5. SendGrid - Emails (optionnel)

Configuration:
[ ] 6. Variables d'environnement
[ ] 7. Webhooks Stripe
[ ] 8. Types TypeScript
[ ] 9. Tests locaux
[ ] 10. Déploiement production
```

---

## 1️⃣ SUPABASE - Base de données

### Étape 1.1 : Créer le projet
1. Aller sur https://supabase.com
2. Cliquer sur "New Project"
3. Choisir un nom : `photoia-prod` (ou autre)
4. Choisir une région proche : `Europe West (Ireland)`
5. Choisir un mot de passe fort
6. Attendre 2-3 minutes que le projet soit créé

### Étape 1.2 : Récupérer les clés
1. Aller dans **Settings** → **API**
2. Noter ces valeurs :

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (PRIVÉE - jamais exposer)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 1.3 : Configurer le stockage
1. Aller dans **Storage**
2. Créer un bucket : `projects`
3. Configurer comme **public**
4. Policies RLS :

```sql
-- Policy pour upload (authentifié)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- Policy pour lecture (public)
CREATE POLICY "Anyone can read projects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'projects');
```

### Étape 1.4 : Exécuter les migrations SQL
1. Aller dans **SQL Editor**
2. Créer une nouvelle query
3. Copier-coller le contenu de `migrations/003_create_credits_table.sql`
4. Exécuter (Run)
5. Répéter avec `migrations/004_create_payments_table.sql`

### Étape 1.5 : Vérifier les tables
Dans **Table Editor**, vous devez voir :
- ✅ `credits` (user_id, credits_remaining, total_purchased...)
- ✅ `payments` (user_id, stripe_payment_intent_id, amount...)
- ✅ `projects` (devrait déjà exister)

### Étape 1.6 : Régénérer les types TypeScript

```bash
# Récupérer votre Project ID
# Settings → General → Reference ID

# Installer Supabase CLI si pas fait
npm install -g supabase

# Générer les types
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > app/lib/database.types.ts
```

**✅ Supabase configuré !**

---

## 2️⃣ STRIPE - Paiements

### Étape 2.1 : Créer le compte
1. Aller sur https://stripe.com
2. Créer un compte (gratuit)
3. Compléter les informations business

### Étape 2.2 : Récupérer les clés (Mode Test)
1. Aller dans **Developers** → **API keys**
2. Noter ces valeurs :

```bash
# Publishable key (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx

# Secret key (PRIVÉE)
STRIPE_SECRET_KEY=sk_test_51xxxxx
```

### Étape 2.3 : Installer Stripe CLI (pour webhooks locaux)

**macOS** :
```bash
brew install stripe/stripe-cli/stripe
```

**Linux** :
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows** :
```powershell
scoop install stripe
```

### Étape 2.4 : Configurer les webhooks locaux

```bash
# Se connecter à Stripe
stripe login

# Lancer le forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Vous recevrez un **webhook signing secret** :
```
Ready! Your webhook signing secret is whsec_xxxxx
```

Copiez-le dans votre `.env.local` :
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Étape 2.5 : Tester un paiement

Utilisez ces cartes de test :
```
Succès :          4242 4242 4242 4242
3D Secure requis: 4000 0027 6000 3184
Décliné :         4000 0000 0000 0002

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

### Étape 2.6 : Configurer les webhooks en production

1. Aller dans **Developers** → **Webhooks**
2. Cliquer sur **Add endpoint**
3. URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
4. Sélectionner ces événements :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Copier le **Signing secret** généré
6. L'ajouter dans les variables Vercel

**✅ Stripe configuré !**

---

## 3️⃣ REPLICATE - IA

### Étape 3.1 : Créer le compte
1. Aller sur https://replicate.com
2. S'inscrire (GitHub OAuth recommandé)
3. Gratuit pour démarrer (crédits offerts)

### Étape 3.2 : Obtenir l'API Token
1. Aller sur https://replicate.com/account/api-tokens
2. Cliquer sur **Create token**
3. Donner un nom : `photoia-prod`
4. Copier le token :

```bash
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 3.3 : Vérifier les modèles
Les 3 modèles configurés dans `app/lib/ai-models.ts` :
- ✅ `google/nano-banana` (Basic - 2€)
- ✅ `batouresearch/magic-image-refiner` (Pro - 3€)
- ✅ `zsxkib/qwen2-vl` (Expert - 5€)

Tous sont disponibles sur Replicate sans configuration supplémentaire.

### Étape 3.4 : Monitoring
- Dashboard : https://replicate.com/account
- Voir les prédictions en temps réel
- Suivre les coûts

**✅ Replicate configuré !**

---

## 4️⃣ VERCEL - Déploiement

### Étape 4.1 : Préparer le projet

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Vérifier que le build fonctionne
npm run build
```

### Étape 4.2 : Premier déploiement

```bash
# Déployer en dev
vercel

# Suivre les instructions
# Choisir le projet existant ou en créer un nouveau
```

### Étape 4.3 : Configurer les variables d'environnement

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter **TOUTES** ces variables :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (celui de production)

# Replicate
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL de l'app
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app

# SendGrid (optionnel)
SENDGRID_API_KEY=SG.xxxxx (si vous l'utilisez)
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

**Important** : Sélectionner **Production, Preview, Development** pour chaque variable.

### Étape 4.4 : Déployer en production

```bash
# Déploiement production
vercel --prod

# Ou via Git
git push origin master
# (si vous avez connecté Vercel à votre repo GitHub)
```

### Étape 4.5 : Configurer le domaine (optionnel)
1. Dans **Settings** → **Domains**
2. Ajouter votre domaine custom
3. Suivre les instructions DNS

**✅ Vercel configuré !**

---

## 5️⃣ SENDGRID - Emails (Optionnel)

### Mode actuel : Dev Mode
Le projet fonctionne en **mode développement** pour les emails :
- Les emails sont affichés dans la console
- Aucune configuration requise
- Parfait pour tester

### Pour activer SendGrid en production

#### Étape 5.1 : Créer le compte
1. Aller sur https://sendgrid.com
2. Créer un compte (gratuit pour 100 emails/jour)

#### Étape 5.2 : Créer une API Key
1. Aller dans **Settings** → **API Keys**
2. Créer une clé avec accès **Full Access**
3. Copier la clé :

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Étape 5.3 : Vérifier un sender
1. Aller dans **Settings** → **Sender Authentication**
2. Vérifier un email ou un domaine
3. Configurer :

```bash
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

#### Étape 5.4 : Tester
```bash
# Dans app/lib/email.ts, vérifier que DEV_MODE = false
```

**✅ SendGrid configuré !** (optionnel)

---

## 6️⃣ CONFIGURATION - Variables d'environnement

### Fichier `.env.local` (développement)

Créer/modifier le fichier `.env.local` à la racine :

```bash
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# STRIPE (Mode Test)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ===========================================
# REPLICATE
# ===========================================
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===========================================
# APP
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# SENDGRID (Optionnel - laissez vide pour mode dev)
# ===========================================
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### Vérifier le fichier

```bash
cat .env.local
```

**⚠️ JAMAIS commit ce fichier !** (il est dans `.gitignore`)

---

## 7️⃣ TESTS LOCAUX

### Test 1 : Démarrage

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev
```

Ouvrir http://localhost:3000

### Test 2 : Webhooks Stripe

**Terminal 1** :
```bash
npm run dev
```

**Terminal 2** :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test 3 : Flow complet

1. ✅ Créer un compte (email + mot de passe)
2. ✅ Acheter des crédits (carte test 4242...)
3. ✅ Vérifier que les crédits apparaissent
4. ✅ Sélectionner un modèle IA
5. ✅ Uploader une image
6. ✅ Générer une image
7. ✅ Vérifier l'historique des paiements
8. ✅ Voir les analytics (si admin)

### Test 4 : Vérifier les logs

```bash
# Logs Supabase
# Dans Supabase Dashboard → Logs

# Logs Stripe
stripe logs tail

# Logs Vercel (après déploiement)
vercel logs
```

---

## 8️⃣ DÉPLOIEMENT PRODUCTION

### Checklist avant déploiement

```
Code:
[ ] npm run build → succès
[ ] Types TypeScript régénérés
[ ] .env.local configuré
[ ] Tests locaux réussis

Supabase:
[ ] Migrations SQL exécutées
[ ] Storage configuré
[ ] RLS policies actives
[ ] Variables notées

Stripe:
[ ] Clés de production récupérées
[ ] Webhook production configuré
[ ] Endpoint testé

Vercel:
[ ] Toutes les variables configurées
[ ] Domaine configuré (si custom)
[ ] Build preview testé
```

### Commandes de déploiement

```bash
# 1. Commit final
git add .
git commit -m "feat: PhotoIA v2.1 ready for production"
git push origin master

# 2. Déployer
vercel --prod

# 3. Vérifier
vercel inspect [URL]
```

### Après le déploiement

1. ✅ Tester le flow complet en production
2. ✅ Vérifier les webhooks Stripe
3. ✅ Surveiller les logs Vercel
4. ✅ Tester sur mobile
5. ✅ Vérifier les performances (Lighthouse)

---

## 9️⃣ MONITORING & MAINTENANCE

### Supabase
- Dashboard : https://supabase.com/dashboard
- Surveiller : Database size, Auth users, Storage usage
- Limite gratuite : 500 MB database, 1 GB storage

### Stripe
- Dashboard : https://dashboard.stripe.com
- Surveiller : Paiements, Échecs, Remboursements
- Activer : Radar (anti-fraude)

### Replicate
- Dashboard : https://replicate.com/account
- Surveiller : Crédits utilisés, Coût par prédiction
- Limite gratuite : Varie selon le modèle

### Vercel
- Dashboard : https://vercel.com/dashboard
- Surveiller : Bandwidth, Function executions
- Limite gratuite : 100 GB bandwidth/mois

### SendGrid
- Dashboard : https://app.sendgrid.com
- Surveiller : Emails envoyés, Bounces, Spam
- Limite gratuite : 100 emails/jour

---

## 🔟 TROUBLESHOOTING

### Erreur : "Invalid API key" (Supabase)
- Vérifier `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vérifier que le projet Supabase est actif
- Régénérer les clés si nécessaire

### Erreur : "Webhook signature verification failed" (Stripe)
- Vérifier `STRIPE_WEBHOOK_SECRET`
- Relancer `stripe listen` pour obtenir un nouveau secret
- En prod, vérifier l'endpoint dans Stripe Dashboard

### Erreur : "Model not found" (Replicate)
- Vérifier `REPLICATE_API_TOKEN`
- Vérifier les noms de modèles dans `app/lib/ai-models.ts`
- Vérifier les crédits Replicate

### Erreur : "Table does not exist"
- Exécuter les migrations SQL dans Supabase
- Régénérer les types TypeScript
- Vérifier les RLS policies

### Erreur : "Not enough credits"
- Vérifier la table `credits`
- Vérifier que le webhook Stripe fonctionne
- Tester un achat de crédits

---

## 📊 RÉCAPITULATIF

### Services à configurer

| Service | Obligatoire | Coût | Temps |
|---------|-------------|------|-------|
| Supabase | ✅ Oui | Gratuit | 15 min |
| Stripe | ✅ Oui | Gratuit (test) | 10 min |
| Replicate | ✅ Oui | Pay-as-you-go | 5 min |
| Vercel | ✅ Oui | Gratuit | 10 min |
| SendGrid | ⚪ Non | Gratuit (100/j) | 10 min |

**Total : ~40-50 minutes de configuration**

### Ordre recommandé

1. **Supabase** (base de données)
2. **Stripe** (paiements)
3. **Replicate** (IA)
4. **Vercel** (déploiement)
5. **SendGrid** (optionnel, plus tard)

### Coûts estimés

**Mode gratuit** (parfait pour démarrer) :
- Supabase : Gratuit jusqu'à 500 MB
- Stripe : Gratuit (2.9% + 0.30€ par transaction)
- Replicate : ~0.10€ par image générée
- Vercel : Gratuit jusqu'à 100 GB bandwidth
- SendGrid : Gratuit jusqu'à 100 emails/jour

**Pour 100 utilisateurs/mois** :
- 300 images générées : ~30€ (Replicate)
- 50 transactions : ~4.50€ (Stripe fees)
- **Total : ~35€/mois**

---

## ✅ VALIDATION FINALE

Une fois tout configuré, vous devez avoir :

```
Services:
✅ Supabase : Projet créé, migrations exécutées
✅ Stripe : Webhooks locaux fonctionnels
✅ Replicate : Token actif
✅ Vercel : Variables configurées
✅ SendGrid : Activé ou mode dev

Fichiers:
✅ .env.local : Toutes les variables
✅ app/lib/database.types.ts : Types générés
✅ migrations/ : Exécutées dans Supabase

Tests:
✅ npm run dev → fonctionne
✅ stripe listen → fonctionne
✅ Achat de crédits → succès
✅ Génération d'image → succès
✅ Historique → affiche les paiements

Production:
✅ vercel --prod → déployé
✅ Webhooks Stripe → configurés
✅ Tests en prod → réussis
```

---

## 🚀 PRÊT !

Une fois cette checklist complète, PhotoIA est **100% opérationnel** !

**Prochaines étapes** :
1. Lancer en production
2. Inviter des beta-testeurs
3. Monitorer les métriques
4. Itérer selon les retours

**Besoin d'aide ?**
- Supabase : https://supabase.com/docs
- Stripe : https://stripe.com/docs
- Replicate : https://replicate.com/docs
- Vercel : https://vercel.com/docs

---

**Dernière mise à jour** : 19 octobre 2025  
**Version** : 2.1  
**Status** : ✅ Guide complet
