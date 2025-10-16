# 🚀 Guide de démarrage rapide - Paiement Stripe

## Étape 1 : Migration de la base de données

Exécutez le script SQL dans Supabase :

```bash
# Ouvrez le SQL Editor dans Supabase Dashboard
# https://app.supabase.com/project/veulahermznmcjnokeua/sql

# Puis exécutez le contenu du fichier :
# migrations/add_stripe_payment_columns.sql
```

## Étape 2 : Configuration des webhooks locaux

```bash
# Terminal 1 : Démarrer le serveur Next.js
cd /Users/mathisbaala/Projects/cours3/photoia
npm run dev

# Terminal 2 : Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La commande Stripe CLI affichera quelque chose comme :
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

## Étape 3 : Mettre à jour .env.local

Copiez le webhook secret et mettez à jour `.env.local` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...  # Remplacez par le vrai secret
```

Redémarrez le serveur (`Ctrl+C` puis `npm run dev` dans le Terminal 1).

## Étape 4 : Tester le paiement

1. Ouvrez http://localhost:3000/dashboard
2. Connectez-vous
3. Uploadez une image
4. Entrez un prompt
5. Cliquez sur **"Générer (2€)"**
6. Vous serez redirigé vers Stripe Checkout
7. Utilisez la carte de test : `4242 4242 4242 4242`
8. Complétez le paiement
9. Vous revenez sur le dashboard
10. Cliquez sur **"Lancer la génération"**
11. ✨ Votre image est générée !

## 📊 Vérifier le webhook

Dans le Terminal 2 (Stripe CLI), vous devriez voir :

```
[200] POST http://localhost:3000/api/webhooks/stripe [evt_xxx]
  checkout.session.completed
```

## ✅ Checklist de vérification

- [ ] Migration SQL exécutée dans Supabase
- [ ] Stripe CLI installé (`brew install stripe/stripe-cli/stripe`)
- [ ] `stripe login` effectué
- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Stripe CLI en écoute (`stripe listen ...`)
- [ ] STRIPE_WEBHOOK_SECRET mis à jour dans `.env.local`
- [ ] Serveur redémarré après la mise à jour
- [ ] Test de paiement réussi

## 🎉 C'est prêt !

Votre système de paiement Stripe est maintenant opérationnel.

---

**Besoin d'aide ?** Consultez `STRIPE_SETUP.md` pour la documentation complète.
