#!/bin/bash

# 🚀 Script de Vérification Pré-Déploiement Vercel
# PhotoIA - Version 2.0

echo "🔍 Vérification de l'état du projet avant déploiement..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de vérification
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "📦 1. Vérification des dépendances..."
npm list next react typescript > /dev/null 2>&1
check "Dépendances Next.js, React, TypeScript installées"

echo ""
echo "🔨 2. Test du build..."
npm run build > /dev/null 2>&1
check "Build Next.js réussi"

echo ""
echo "📁 3. Vérification des fichiers essentiels..."

# Composants
[ -f "app/components/PricingCard.tsx" ]
check "PricingCard.tsx existe"

[ -f "app/components/BuyCreditsModal.tsx" ]
check "BuyCreditsModal.tsx existe"

[ -f "app/components/CreditsWidget.tsx" ]
check "CreditsWidget.tsx existe"

[ -f "app/components/ModelSelector.tsx" ]
check "ModelSelector.tsx existe"

# API Routes
[ -f "app/api/buy-credits/route.ts" ]
check "API buy-credits existe"

[ -f "app/api/credits/route.ts" ]
check "API credits existe"

[ -f "app/api/payments/route.ts" ]
check "API payments existe"

[ -f "app/api/webhooks/stripe/route.ts" ]
check "Webhook Stripe existe"

# Lib
[ -f "app/lib/database.types.ts" ]
check "database.types.ts existe"

[ -f "app/lib/ai-models.ts" ]
check "ai-models.ts existe"

[ -f "app/lib/credit-packs.ts" ]
check "credit-packs.ts existe"

# CSS
[ -f "app/globals.css" ]
check "globals.css existe"

echo ""
echo "🎨 4. Vérification des animations CSS..."
if grep -q "@keyframes glow" app/globals.css; then
    check "Animation 'glow' présente"
else
    echo -e "${RED}✗${NC} Animation 'glow' manquante"
    ((ERRORS++))
fi

if grep -q "@keyframes gradientShift" app/globals.css; then
    check "Animation 'gradientShift' présente"
else
    echo -e "${RED}✗${NC} Animation 'gradientShift' manquante"
    ((ERRORS++))
fi

if grep -q "@keyframes pulseGlow" app/globals.css; then
    check "Animation 'pulseGlow' présente"
else
    echo -e "${RED}✗${NC} Animation 'pulseGlow' manquante"
    ((ERRORS++))
fi

echo ""
echo "🔐 5. Vérification des variables d'environnement..."

if [ -f ".env.local" ]; then
    check ".env.local existe"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        check "Variable SUPABASE_URL configurée"
    else
        warn "Variable SUPABASE_URL manquante dans .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        check "Variable STRIPE_PUBLISHABLE_KEY configurée"
    else
        warn "Variable STRIPE_PUBLISHABLE_KEY manquante"
    fi
    
    if grep -q "STRIPE_SECRET_KEY" .env.local; then
        check "Variable STRIPE_SECRET_KEY configurée"
    else
        warn "Variable STRIPE_SECRET_KEY manquante"
    fi
else
    warn "Fichier .env.local n'existe pas"
    echo "   ℹ️  C'est normal, les variables seront sur Vercel"
fi

echo ""
echo "📝 6. Vérification Git..."
git status > /dev/null 2>&1
check "Repository Git initialisé"

if git rev-parse --verify HEAD > /dev/null 2>&1; then
    check "Commit présent"
    
    # Vérifier si on est à jour avec origin
    git fetch origin > /dev/null 2>&1
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        check "Branch synchronisée avec origin"
    else
        warn "Branch locale différente de origin"
        echo "   ℹ️  Exécutez: git push origin master"
    fi
fi

echo ""
echo "📋 7. Vérification de la documentation..."
[ -f "README.md" ]
check "README.md existe"

[ -f "VERCEL_DEPLOYMENT_GUIDE.md" ]
check "Guide de déploiement existe"

[ -f "UI_IMPROVEMENTS_SUMMARY.md" ]
check "Documentation UI existe"

echo ""
echo "🎯 8. Vérification de la configuration Vercel..."
[ -f ".vercelignore" ]
check ".vercelignore existe"

[ -f "package.json" ]
check "package.json existe"

if grep -q "\"build\": \"next build\"" package.json; then
    check "Script build configuré"
else
    echo -e "${RED}✗${NC} Script build non configuré"
    ((ERRORS++))
fi

if grep -q "\"start\": \"next start\"" package.json; then
    check "Script start configuré"
else
    warn "Script start non configuré"
fi

echo ""
echo "================================"
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "================================"
echo -e "${GREEN}✓ Succès:${NC} $SUCCESS"
echo -e "${YELLOW}⚠ Avertissements:${NC} $WARNINGS"
echo -e "${RED}✗ Erreurs:${NC} $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 PRÊT POUR LE DÉPLOIEMENT !${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Aller sur https://vercel.com/dashboard"
    echo "2. Connecter le repository GitHub"
    echo "3. Configurer les variables d'environnement"
    echo "4. Cliquer sur Deploy !"
    echo ""
    echo "📖 Guide complet: VERCEL_DEPLOYMENT_GUIDE.md"
else
    echo -e "${RED}⚠️  DES ERREURS ONT ÉTÉ DÉTECTÉES${NC}"
    echo ""
    echo "Veuillez corriger les erreurs avant de déployer."
    echo "Consultez VERCEL_DEPLOYMENT_GUIDE.md pour plus d'aide."
fi

echo ""
exit $ERRORS
