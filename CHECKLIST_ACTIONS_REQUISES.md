# ✅ CHECKLIST RAPIDE - À FAIRE MAINTENANT

## 🎯 Ce qu'il vous reste à faire (30-45 minutes)

---

## ÉTAPE 1 : SUPABASE (15 minutes)

### A. Obtenir votre Project ID
1. Aller sur https://supabase.com/dashboard
2. Ouvrir votre projet PhotoIA
3. **Settings** → **General** → **Reference ID**
4. Copier le Project ID (exemple : `abcdefghijklmnop`)

### B. Régénérer les types TypeScript

```bash
cd /Users/mathisbaala/Projects/cours3/photoia

npx supabase gen types typescript \
  --project-id VOTRE_PROJECT_ID \
  > app/lib/database.types.ts
```

**Remplacer `VOTRE_PROJECT_ID`** par celui copié à l'étape A.

✅ **Résultat attendu** : Fichier `app/lib/database.types.ts` créé, plus d'erreurs TypeScript

---

## ÉTAPE 2 : STRIPE WEBHOOKS LOCAUX (5 minutes)

### A. Installer Stripe CLI (si pas déjà fait)

**macOS** :
```bash
brew install stripe/stripe-cli/stripe
```

**Autres OS** : Voir `SETUP_COMPLET_SERVICES.md`

### B. Lancer le webhook forwarding

**Terminal 1** (garder ouvert) :
```bash
npm run dev
```

**Terminal 2** (garder ouvert) :
```bash
cd /Users/mathisbaala/Projects/cours3/photoia
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Vous recevrez un secret qui ressemble à : `whsec_xxxxxxxxxxxxx`

### C. Mettre à jour .env.local

Copier le secret reçu et le mettre dans `.env.local` :
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Sauvegarder et relancer `npm run dev`.

✅ **Résultat attendu** : Les webhooks Stripe fonctionnent localement

---

## ÉTAPE 3 : TESTER LE FLOW COMPLET (10 minutes)

Avec les 2 terminaux ouverts (dev server + stripe listen) :

### Test 1 : Créer un compte
1. Ouvrir http://localhost:3000
2. S'inscrire avec email/mot de passe
3. Se connecter

✅ **Attendu** : Redirection vers dashboard

### Test 2 : Acheter des crédits
1. Cliquer sur "Acheter des crédits"
2. Choisir un pack
3. Utiliser carte test : `4242 4242 4242 4242`
   - Expiration : n'importe quelle date future
   - CVC : 123
4. Compléter le paiement

✅ **Attendu** : 
- Dans Terminal 2 : voir les webhooks reçus
- Les crédits apparaissent dans le dashboard
- Email de confirmation dans la console

### Test 3 : Générer une image
1. Sélectionner un modèle IA
2. Uploader une image
3. Entrer un prompt
4. Cliquer "Générer"

✅ **Attendu** :
- Les crédits se déduisent
- L'image est générée
- Elle apparaît dans la liste

### Test 4 : Vérifier l'historique
1. Cliquer sur "Historique des paiements"
2. Voir le paiement effectué

✅ **Attendu** : Table avec le paiement, montant, date, statut

---

## ÉTAPE 4 : VÉRIFIER LA BUILD (5 minutes)

```bash
npm run build
```

✅ **Attendu** : Build réussi sans erreur

---

## ÉTAPE 5 : PRÉPARER LA PRODUCTION (5-10 minutes)

### A. Récupérer les clés Stripe PRODUCTION

1. Aller sur https://dashboard.stripe.com
2. Activer le mode **Live** (toggle en haut à droite)
3. **Developers** → **API keys**
4. Noter :
   - `pk_live_xxxxx` (Publishable key)
   - `sk_live_xxxxx` (Secret key)

### B. Configurer le webhook de production

1. **Developers** → **Webhooks**
2. **Add endpoint**
3. URL : `https://VOTRE-DOMAINE.vercel.app/api/webhooks/stripe`
   (vous aurez le domaine après déploiement Vercel)
4. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. **Add endpoint**
6. Copier le **Signing secret** : `whsec_xxxxx`

✅ **Attendu** : Webhook configuré, signing secret copié

---

## ÉTAPE 6 : DÉPLOYER SUR VERCEL (10 minutes)

### A. Installer Vercel CLI

```bash
npm i -g vercel
```

### B. Configurer les variables

1. Aller sur https://vercel.com
2. Créer un compte si nécessaire
3. Importer votre projet :
   - Depuis GitHub : connecter le repo
   - Ou en local : `vercel` (suivre les étapes)

4. **Settings** → **Environment Variables**

Ajouter **toutes** ces variables (mode Production) :

```bash
# Supabase (mêmes valeurs que local)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe PRODUCTION (clés live récupérées à l'étape 5A)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (celui de l'étape 5B)

# Replicate (même valeur que local)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App URL (sera fourni par Vercel après déploiement)
NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app

# SendGrid (optionnel - laisser vide pour l'instant)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### C. Déployer

```bash
cd /Users/mathisbaala/Projects/cours3/photoia
vercel --prod
```

Suivre les instructions.

✅ **Attendu** : URL de production fournie

### D. Mettre à jour le webhook Stripe

1. Retourner sur Stripe Dashboard
2. **Developers** → **Webhooks**
3. Éditer l'endpoint créé à l'étape 5B
4. Remplacer l'URL par l'URL Vercel réelle
5. Sauvegarder

✅ **Attendu** : Webhook pointe vers votre app Vercel

---

## ÉTAPE 7 : TESTER EN PRODUCTION (5 minutes)

1. Ouvrir l'URL Vercel
2. Créer un compte
3. Acheter des crédits (carte test si mode test activé)
4. Générer une image
5. Vérifier l'historique

✅ **Attendu** : Tout fonctionne comme en local

---

## 📊 RÉCAPITULATIF DE VOTRE ÉTAT ACTUEL

### ✅ Ce qui est FAIT
- [x] Code complet (19 composants, 6 APIs)
- [x] Design system moderne
- [x] Documentation exhaustive
- [x] Migrations SQL prêtes
- [x] .env.local configuré
- [x] Projet Supabase existant

### ⏳ Ce qu'il reste à FAIRE

```
Configuration (30 min):
[ ] 1. Régénérer types Supabase (5 min)
[ ] 2. Configurer webhooks Stripe locaux (5 min)
[ ] 3. Tester le flow complet en local (10 min)
[ ] 4. Vérifier la build (5 min)
[ ] 5. Récupérer clés Stripe production (5 min)

Déploiement (15 min):
[ ] 6. Configurer variables Vercel (5 min)
[ ] 7. Déployer sur Vercel (5 min)
[ ] 8. Tester en production (5 min)

TOTAL: 45 minutes maximum
```

---

## 🚨 ORDRE D'EXÉCUTION

**Faites dans cet ordre précis** :

```
1. Régénérer types Supabase
   ↓
2. npm run build (vérifier que ça compile)
   ↓
3. Lancer stripe listen dans un terminal
   ↓
4. npm run dev dans un autre terminal
   ↓
5. Tester localement (achat + génération)
   ↓
6. Récupérer clés Stripe production
   ↓
7. Configurer Vercel
   ↓
8. Déployer
   ↓
9. Tester en production
   ↓
10. ✅ TERMINÉ !
```

---

## 💡 COMMANDES EXACTES

Pour copier-coller directement :

```bash
# 1. Régénérer types (remplacer YOUR_PROJECT_ID)
cd /Users/mathisbaala/Projects/cours3/photoia
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/lib/database.types.ts

# 2. Build
npm run build

# 3. Terminal 1 - Dev server
npm run dev

# 4. Terminal 2 - Stripe (dans un nouveau terminal)
cd /Users/mathisbaala/Projects/cours3/photoia
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 5. Déploiement Vercel
npm i -g vercel
vercel --prod
```

---

## 📞 AIDE

### Si erreur "Invalid Project ID"
→ Vérifier le Project ID dans Supabase → Settings → General → Reference ID

### Si erreur "Webhook signature failed"
→ Vérifier que `STRIPE_WEBHOOK_SECRET` est bien le secret du `stripe listen`

### Si erreur "Model not found"
→ Vérifier `REPLICATE_API_TOKEN` dans .env.local

### Si problème de build
→ Vérifier que les types Supabase sont bien générés

### Pour plus de détails
→ Voir `SETUP_COMPLET_SERVICES.md`

---

## ✅ VALIDATION

Vous saurez que tout est OK quand :

```
Local:
✅ npm run build → succès
✅ npm run dev → serveur démarre
✅ stripe listen → reçoit les webhooks
✅ Achat de crédits → crédits ajoutés
✅ Génération d'image → fonctionne

Production:
✅ vercel --prod → déploiement réussi
✅ URL accessible
✅ Achat en prod → fonctionne
✅ Génération en prod → fonctionne
✅ Webhooks Stripe → reçus
```

---

## 🎯 COMMENCEZ MAINTENANT !

**Étape 1** : Récupérer votre Supabase Project ID et régénérer les types.

C'est le seul blocage actuel. Tout le reste est prêt ! 🚀

**Temps estimé total : 45 minutes**

---

**Dernière mise à jour** : 19 octobre 2025  
**Version** : 2.1  
**Status** : ✅ Checklist complète
