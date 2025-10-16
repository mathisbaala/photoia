# 🎨 PhotoIA - Paiement Stripe intégré

## 📋 Vue d'ensemble

Le système de paiement Stripe a été intégré avec succès dans PhotoIA avec le modèle **"paiement à la génération"**. Chaque génération d'image coûte **2,00 EUR**.

## 🔄 Flow de paiement

```
1. User clique sur "Générer (2€)" sur le dashboard
   ↓
2. Un projet est créé avec payment_status='pending'
   ↓
3. Redirection vers Stripe Checkout
   ↓
4. User complète le paiement
   ↓
5. Stripe envoie un webhook checkout.session.completed
   ↓
6. Le projet est mis à jour avec payment_status='paid'
   ↓
7. User revient sur /dashboard
   ↓
8. Bouton "Lancer la génération" apparaît
   ↓
9. L'API génère l'image (après vérification du paiement)
```

## 📁 Fichiers créés

### 1. `/app/lib/stripe.ts`
Initialise le client Stripe côté serveur avec la clé secrète.

### 2. `/app/api/create-checkout-session/route.ts`
Crée une session Stripe Checkout pour un projet donné.
- Vérifie l'authentification
- Vérifie que le projet appartient à l'utilisateur
- Crée une session de paiement avec metadata (project_id)

### 3. `/app/api/webhooks/stripe/route.ts`
Reçoit les webhooks Stripe (checkout.session.completed).
- **IMPORTANT**: Vérifie la signature du webhook pour la sécurité
- Met à jour le projet avec payment_status='paid'
- Endpoint public mais sécurisé par la vérification de signature

### 4. `/app/api/generate/route.ts` (modifié)
Vérifie que payment_status='paid' avant de générer l'image.

### 5. `/app/dashboard/page.tsx` (modifié)
- Bouton "Générer (2€)" pour initier le paiement
- Détection du retour après paiement
- Bouton "Lancer la génération" après paiement réussi

### 6. `/app/lib/database.types.ts` (mis à jour)
Ajout des colonnes de paiement dans les types TypeScript.

## 🔧 Configuration

### Variables d'environnement (.env.local)

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_xxxxx... # À configurer (voir ci-dessous)
```

### Schéma de base de données Supabase

Les colonnes suivantes ont été ajoutées à la table `projects` :

```sql
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
```

**⚠️ IMPORTANT**: Exécutez cette migration dans votre base Supabase si ce n'est pas déjà fait.

## 🚀 Configuration des webhooks

### En développement local (avec Stripe CLI)

1. **Installer Stripe CLI** :
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Ou téléchargez depuis : https://stripe.com/docs/stripe-cli
   ```

2. **Se connecter à Stripe** :
   ```bash
   stripe login
   ```

3. **Démarrer le serveur Next.js** :
   ```bash
   cd /Users/mathisbaala/Projects/cours3/photoia
   npm run dev
   ```

4. **Écouter les webhooks dans un nouveau terminal** :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. **Copier le webhook secret** :
   La commande `stripe listen` affichera un secret commençant par `whsec_...`
   Copiez-le et mettez à jour `STRIPE_WEBHOOK_SECRET` dans `.env.local`

6. **Redémarrer le serveur** :
   ```bash
   # Ctrl+C puis
   npm run dev
   ```

### En production

1. Allez dans le [Dashboard Stripe](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Ajouter un endpoint"
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à écouter : `checkout.session.completed`
5. Copiez le "Signing secret" et ajoutez-le dans vos variables d'environnement de production

## 🧪 Tester le flow

1. Lancez le serveur : `npm run dev`
2. Lancez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Connectez-vous sur http://localhost:3000/dashboard
4. Sélectionnez une image et un prompt
5. Cliquez sur "Générer (2€)"
6. Vous serez redirigé vers Stripe Checkout
7. Utilisez une [carte de test Stripe](https://stripe.com/docs/testing) :
   - Numéro : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
8. Complétez le paiement
9. Vous serez redirigé vers le dashboard
10. Cliquez sur "Lancer la génération"
11. L'image sera générée !

## 🔒 Sécurité

✅ **Le montant est hardcodé côté serveur** (2€ / 200 centimes)
✅ **Vérification de l'appartenance du projet** (user_id)
✅ **Signature des webhooks vérifiée** (protection contre les webhooks malveillants)
✅ **Vérification du paiement avant génération** (payment_status='paid')
✅ **Authentification requise** pour toutes les opérations

## 📊 Suivi des paiements

Vous pouvez suivre tous les paiements dans :
- [Dashboard Stripe > Paiements](https://dashboard.stripe.com/payments)
- Votre table Supabase `projects` (colonnes `payment_status`, `payment_amount`, etc.)

## 🐛 Dépannage

### "STRIPE_WEBHOOK_SECRET n'est pas définie"
→ Vérifiez que vous avez bien lancé `stripe listen` et copié le secret dans `.env.local`

### "Webhook Error: No signatures found matching the expected signature"
→ Le webhook secret est incorrect. Relancez `stripe listen` et copiez le nouveau secret.

### "Le paiement est requis avant de générer l'image"
→ Le webhook n'a pas encore été reçu ou traité. Vérifiez les logs de Stripe CLI.

### Le projet n'est pas mis à jour après le paiement
→ Vérifiez que le webhook est bien configuré et que les logs n'affichent pas d'erreur.

## 📚 Ressources

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Cartes de test Stripe](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

✨ **Le système de paiement est maintenant opérationnel !**
