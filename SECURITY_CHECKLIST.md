# 🔐 Checklist de sécurité après exposition de secrets

## ✅ Actions immédiates

### 1. Replicate API Token
- [ ] **Générer un nouveau token** sur https://replicate.com/account/api-tokens
- [ ] **Mettre à jour** `.env.local` avec le nouveau token
- [ ] **Supprimer l'ancien token** de Replicate (déjà désactivé automatiquement)
- [ ] **Nettoyer l'historique Git** (voir ci-dessous)

### 2. Stripe API Keys
⚠️ **Vérifiez si vos clés Stripe ont aussi été exposées**

- [ ] Vérifier l'historique : `git log --all -S "sk_test_" --source --all`
- [ ] Si exposé : **Générer de nouvelles clés** sur https://dashboard.stripe.com/apikeys
- [ ] Si exposé : **Révoquer les anciennes clés** dans Stripe Dashboard
- [ ] Mettre à jour `.env.local` avec les nouvelles clés

### 3. Supabase Keys
⚠️ **Vérifiez si vos clés Supabase ont aussi été exposées**

- [ ] Vérifier l'historique : `git log --all -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --source --all`
- [ ] Si `SUPABASE_SERVICE_ROLE_KEY` exposé : **DANGER - Régénérer immédiatement**
  - Aller sur https://app.supabase.com/project/veulahermznmcjnokeua/settings/api
  - Cliquez sur "Reset" pour la Service Role Key
  - Mettre à jour `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` est publique par nature (pas de danger)

## 🧹 Nettoyage de l'historique Git

### Option 1 : Script automatisé (recommandé)

```bash
cd /Users/mathisbaala/Projects/cours3/photoia
chmod +x cleanup-secrets.sh
./cleanup-secrets.sh
```

### Option 2 : Commandes manuelles

```bash
cd /Users/mathisbaala/Projects/cours3/photoia

# Supprimer .env.local de l'historique
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Nettoyer les références
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

### Option 3 : Supprimer le dépôt et recommencer (plus simple)

Si le projet est récent et n'a pas beaucoup d'historique :

```bash
# 1. Sauvegarder le code actuel
cd /Users/mathisbaala/Projects/cours3/photoia
cp -r . ../photoia-backup

# 2. Supprimer le dépôt GitHub
# Aller sur https://github.com/mathisbaala/photoia/settings
# Scroll jusqu'à "Danger Zone" > "Delete this repository"

# 3. Supprimer le dossier .git local
rm -rf .git

# 4. Réinitialiser Git
git init
git add .
git commit -m "Initial commit (secrets removed)"

# 5. Créer un nouveau dépôt sur GitHub et pusher
git remote add origin git@github.com:mathisbaala/photoia.git
git branch -M main
git push -u origin main
```

## 🔍 Vérifications post-nettoyage

### Vérifier que les secrets ne sont plus dans l'historique

```bash
# Vérifier .env.local
git log --all --full-history -- .env.local

# Si résultat vide = ✅ Bon
# Si résultat affiché = ❌ Recommencer le nettoyage

# Chercher le token Replicate
git log --all -S "r8_9aItlihXX0H6Muu6Y0cB0QJt4JBJ8LE4XARVe" --source --all

# Chercher les clés Stripe
git log --all -S "sk_test_51SIqbr" --source --all

# Chercher la service role key Supabase
git log --all -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldWxhaGVybXpubWNqbm9rZXVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI" --source --all
```

## 🛡️ Prévention future

### 1. Vérifier le .gitignore

Assurez-vous que `.env*` est bien dans `.gitignore` :

```bash
# Vérifier
cat .gitignore | grep "\.env"

# Si absent, ajouter
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
git add .gitignore
git commit -m "chore: ensure env files are ignored"
```

### 2. Utiliser des hooks Git pre-commit

Installez `git-secrets` pour détecter les secrets avant commit :

```bash
# Installation
brew install git-secrets

# Configuration
cd /Users/mathisbaala/Projects/cours3/photoia
git secrets --install
git secrets --register-aws

# Ajouter des patterns personnalisés
git secrets --add 'r8_[A-Za-z0-9]{40}'  # Replicate
git secrets --add 'sk_test_[A-Za-z0-9]{99}'  # Stripe secret
git secrets --add 'pk_test_[A-Za-z0-9]{99}'  # Stripe public
```

### 3. Scanner le dépôt régulièrement

```bash
# Installer gitleaks
brew install gitleaks

# Scanner le dépôt
cd /Users/mathisbaala/Projects/cours3/photoia
gitleaks detect --source . --verbose

# Scanner l'historique complet
gitleaks detect --source . --log-opts="--all"
```

### 4. Utiliser des variables d'environnement en production

- **Vercel** : Settings > Environment Variables
- **Netlify** : Site settings > Build & deploy > Environment
- **Railway** : Variables tab
- **Render** : Environment > Environment Variables

⚠️ **Ne JAMAIS hardcoder les secrets dans le code**

## 📋 Checklist finale

Avant de considérer la situation résolue :

- [ ] Nouveau token Replicate généré et testé
- [ ] Nouvelles clés Stripe générées (si exposées) et testées
- [ ] Nouvelle Service Role Key Supabase générée (si exposée) et testée
- [ ] `.env.local` supprimé de l'historique Git
- [ ] Force push effectué sur GitHub
- [ ] Vérification : `git log --all --full-history -- .env.local` retourne vide
- [ ] Application testée : `npm run dev` fonctionne
- [ ] `.gitignore` contient `.env*`
- [ ] (Optionnel) `git-secrets` ou `gitleaks` installé

## 🆘 Si vous avez besoin d'aide

1. **Problème de nettoyage Git** : Créez un nouveau dépôt (Option 3)
2. **Clés compromises** : Régénérez TOUTES les clés immédiatement
3. **Application ne fonctionne plus** : Vérifiez que `.env.local` contient les nouveaux secrets

---

**📅 Date de l'incident** : 16 octobre 2025
**🔑 Secrets exposés** : REPLICATE_API_TOKEN (désactivé par Replicate)
**✅ Statut** : En cours de résolution
