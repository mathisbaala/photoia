#!/bin/bash

# Script de nettoyage des secrets exposés sur GitHub
# ⚠️  Ce script va réécrire l'historique Git - utilisez avec précaution

set -e

echo "🔒 Nettoyage des secrets exposés dans l'historique Git"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur : Vous devez être dans le répertoire du projet${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATTENTION :${NC}"
echo "Ce script va :"
echo "  1. Supprimer .env.local de tout l'historique Git"
echo "  2. Réécrire l'historique (commit history)"
echo "  3. Force push sur GitHub"
echo ""
echo "Assurez-vous d'avoir :"
echo "  ✓ Une sauvegarde de votre travail"
echo "  ✓ Créé un nouveau token Replicate"
echo "  ✓ Mis à jour .env.local avec le nouveau token"
echo ""
read -p "Voulez-vous continuer ? (tapez 'oui' pour confirmer) : " confirm

if [ "$confirm" != "oui" ]; then
    echo -e "${YELLOW}Opération annulée${NC}"
    exit 0
fi

echo ""
echo "🗑️  Étape 1/4 : Suppression de .env.local de l'historique Git..."

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

echo -e "${GREEN}✅ .env.local supprimé de l'historique${NC}"
echo ""

echo "🧹 Étape 2/4 : Nettoyage des références..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo -e "${GREEN}✅ Références nettoyées${NC}"
echo ""

echo "📤 Étape 3/4 : Force push sur GitHub..."
git push origin --force --all
git push origin --force --tags

echo -e "${GREEN}✅ Historique réécrit sur GitHub${NC}"
echo ""

echo "✅ Étape 4/4 : Vérification finale..."

# Vérifier que .env.local n'est plus dans l'historique
if git log --all --full-history -- .env.local | grep -q "commit"; then
    echo -e "${RED}⚠️  Attention : .env.local est toujours dans l'historique${NC}"
    echo "Vérifiez manuellement avec : git log --all --full-history -- .env.local"
else
    echo -e "${GREEN}✅ .env.local a bien été supprimé de tout l'historique${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Nettoyage terminé avec succès !${NC}"
echo ""
echo "📋 Prochaines étapes :"
echo "  1. Allez sur https://replicate.com/account/api-tokens"
echo "  2. Supprimez l'ancien token (déjà désactivé)"
echo "  3. Vérifiez que le nouveau token est dans .env.local"
echo "  4. Testez votre application : npm run dev"
echo ""
echo "🔐 Vérifiez aussi vos autres secrets (Supabase, Stripe)"
echo "   Consultez : SECURITY_CHECKLIST.md"
echo ""
