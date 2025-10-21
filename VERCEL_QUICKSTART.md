# Guide Rapide - Déploiement Vercel 🚀

## 1. Préparer le dépôt GitHub

✅ **Déjà fait !** Votre code est sur GitHub : https://github.com/mathisbaala/photoia

## 2. Déployer sur Vercel

### Option A : Interface Web (Recommandé)

1. **Aller sur [Vercel](https://vercel.com)** et se connecter avec GitHub
2. Cliquer sur **"Add New Project"**
3. **Importer** votre dépôt `mathisbaala/photoia`
4. Vercel détectera automatiquement Next.js
5. **Configurer les variables d'environnement** (voir section ci-dessous)
6. Cliquer sur **"Deploy"**
7. Attendre 2-3 minutes ⏱️
8. Votre app sera disponible sur `https://photoia-xxx.vercel.app`

### Option B : CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd /Users/mathisbaala/Projects/cours3/photoia
vercel --prod
```

## 3. Variables d'Environnement Vercel

Dans **Project Settings > Environment Variables**, ajoutez :

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51...
STRIPE_SECRET_KEY = sk_test_51...
STRIPE_WEBHOOK_SECRET = whsec_... (à configurer après)
```

### Replicate
```
REPLICATE_API_TOKEN = r8_...
```

### App URL
```
NEXT_PUBLIC_URL = https://votre-app.vercel.app
```

> ⚠️ **Important** : Mettez toutes les variables en **Production, Preview et Development**

## 4. Configurer le Webhook Stripe

Après le premier déploiement :

1. **Notez l'URL** de votre app : `https://photoia-xxx.vercel.app`

2. **Aller sur [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)**

3. Cliquer sur **"Add endpoint"**

4. **URL** : `https://photoia-xxx.vercel.app/api/webhooks/stripe`

5. **Sélectionner les événements** :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`

6. Cliquer sur **"Add endpoint"**

7. **Copier le webhook secret** (`whsec_...`)

8. **Retourner sur Vercel** > Environment Variables

9. **Ajouter/Mettre à jour** `STRIPE_WEBHOOK_SECRET`

10. **Redéployer** l'application

## 5. Vérification

### Checklist Post-Déploiement

- [ ] L'app se charge correctement
- [ ] La page de connexion fonctionne
- [ ] L'inscription crée un utilisateur dans Supabase
- [ ] Le dashboard s'affiche après connexion
- [ ] Le paiement Stripe redirige correctement
- [ ] Les webhooks Stripe fonctionnent (vérifier dans Stripe Dashboard)
- [ ] La génération d'image fonctionne

### Tester le Paiement

1. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
2. Date d'expiration : n'importe quelle date future
3. CVC : n'importe quel 3 chiffres
4. Email : n'importe quel email valide

### Vérifier les Webhooks

Dans [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks) :
- Les événements doivent avoir le statut ✅ Success
- Si ❌ Failed, vérifier le `STRIPE_WEBHOOK_SECRET`

## 6. Passer en Production

### Quand vous êtes prêt :

1. **Activer votre compte Stripe** (vérification d'identité)

2. **Obtenir les clés de production** :
   - `pk_live_...`
   - `sk_live_...`

3. **Créer un nouveau webhook** pour la production
   - URL : `https://photoia-xxx.vercel.app/api/webhooks/stripe`
   - Copier le nouveau `whsec_live_...`

4. **Mettre à jour les variables** Vercel avec les clés live

5. **Redéployer**

## 🐛 Dépannage

### Build Failed
- Vérifier les logs de build dans Vercel
- Tester localement : `npm run build`

### Variables d'environnement manquantes
- Vérifier qu'elles sont toutes définies
- Vérifier l'orthographe exacte
- Redéployer après modification

### Erreur 500 au runtime
- Vérifier les logs : Vercel Dashboard > Deployments > Functions
- Vérifier que Supabase est accessible
- Vérifier les clés API

### Webhook Stripe ne fonctionne pas
- Vérifier l'URL du webhook (doit finir par `/api/webhooks/stripe`)
- Vérifier le `STRIPE_WEBHOOK_SECRET`
- Consulter les logs dans Stripe Dashboard > Webhooks

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Déploiement Next.js](https://nextjs.org/docs/deployment)
- [Guide complet](./DEPLOYMENT.md)

## ✅ C'est Tout !

Votre application PhotoIA est maintenant en ligne ! 🎉

URL : https://photoia-xxx.vercel.app
