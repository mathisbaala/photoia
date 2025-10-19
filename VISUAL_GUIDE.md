# 🎨 Guide Visuel des Améliorations UI/UX

## 📋 Table des Matières
1. [Composant PricingCard](#pricingcard)
2. [Modal BuyCredits](#buycredits)
3. [ModelSelector](#modelselector)
4. [CreditsWidget](#creditswidget)
5. [Dashboard Projets](#dashboard)

---

## 💎 PricingCard

### Structure Visuelle
```
┌─────────────────────────────────┐
│  🔥 Populaire  [Badge animé]    │
│                                  │
│  Pack Pro                        │
│  【25】crédits                   │
│  30€ (1.20€/crédit)             │
│                                  │
│  ┌──────────────────────┐       │
│  │  Acheter maintenant  │ ← CTA │
│  └──────────────────────┘       │
│                                  │
│  ✓ Valables 1 an                │
│  ✓ Tous les modèles             │
│  ✓ Support prioritaire          │
└─────────────────────────────────┘
     ↓ Hover Effects ↓
  🔸 Scale 1.05
  🔸 Translate Y -8px
  🔸 Shadow glow purple
  🔸 Shine effect
```

### Animations Appliquées
- **Entrée**: fadeIn
- **Badge populaire**: pulseGlow (infini)
- **Badge réduction**: glow (infini)
- **Hover card**: scale + translateY
- **Shine overlay**: translateX

### États
1. **Normal**: Border gray, background white
2. **Populaire**: Border purple, gradient background
3. **Sélectionné**: Border purple thick, glow
4. **Hover**: Scale + shadow + shine

---

## 🛒 BuyCreditsModal

### Layout
```
╔═══════════════════════════════════╗
║ 💎 Acheter des crédits      [×]  ║
║ Économisez jusqu'à 33%           ║
╠═══════════════════════════════════╣
║                                   ║
║  ┌────────┐ ┌────────┐ ┌────────┐║
║  │Starter │ │  Pro   │ │Business│║
║  │  10    │ │🔥 25  │ │   50   │║
║  │  15€   │ │  30€  │ │   50€  │║
║  └────────┘ └────────┘ └────────┘║
║                                   ║
║  💡 Pourquoi acheter?            ║
║  ✓ Économisez jusqu'à 33%        ║
║  ✓ Pas d'abonnement              ║
║  ✓ Crédits valables 1 an         ║
║  ✓ Tous les modèles inclus       ║
╚═══════════════════════════════════╝
```

### Hiérarchie Visuelle
1. **Titre**: Gradient purple-pink, taille 3xl
2. **Cards**: Grid 3 colonnes (responsive: 1 col mobile)
3. **Pack Pro**: Légèrement plus grand (populaire)
4. **Section info**: Gradient gray background

### Animations Timeline
```
Modal appear:       backdrop fadeIn
  └─ 0ms:          modal slideUp
  └─ 100ms:        card 1 appear
  └─ 200ms:        card 2 appear
  └─ 300ms:        card 3 appear
  └─ 400ms:        info section slideUp
```

---

## 🤖 ModelSelector

### Composants
```
╔══════════════════════════════════════╗
║ 🤖 Modèle IA sélectionné      [▼]  ║
╠══════════════════════════════════════╣
║ ✨ Choisissez votre modèle          ║
║                                      ║
║ ┌──────────┐ ┌──────────┐ ┌─────────┐
║ │ Flux     │ │⭐ Magic  │ │ Ideogram│
║ │ Schnell  │ │ Refiner  │ │ v2      │
║ │ 1€       │ │ 2€       │ │ 3€      │
║ │          │ │💎Meilleur│ │         │
║ └──────────┘ └──────────┘ └─────────┘
║                                      ║
║ 💡 Conseil: Achetez un pack!        ║
╚══════════════════════════════════════╝
```

### Design System
**En-tête**:
- Background: glassmorphism
- Emoji robot: animation float
- Titre: gradient text
- Hover: gradient background

**Cards modèles**:
- Border: 2px conditionnelle
- Background: glassmorphism
- Info badges: background blur
- Prix: gradient text clipped

**Badge Recommandé**:
- Position: absolute top-right
- Gradient: yellow-orange
- Animation: pulseGlow

### Interactions
```
Card Hover:
  scale: 1.0 → 1.05
  translateY: 0 → -8px
  shadow: soft → strong glow
  
Prix Hover:
  scale: 1.0 → 1.1
  
Checkmark (selected):
  animation: bounceIn
  background: gradient purple-pink
```

---

## 💳 CreditsWidget

### Layout Compact
```
╔════════════════════════════════╗
║ 💎  Vos crédits          [+]  ║
║     【25】             Acheter ║
║                                ║
║ 🎯 Total acheté: 50 crédits   ║
╚════════════════════════════════╝
```

### États Spéciaux

**Crédits normaux (≥5)**:
```
Background: gradient animé
Emoji: float animation
Nombre: font-black 4xl
Bouton: white bg, hover gradient jaune
```

**Crédits faibles (<5)**:
```
Background: gradient + pulseGlow
Badge alerte: ⚠️ Presque épuisés! (bounce)
Nombre: yellow-300 + pulse
Card: animation continue
```

### Effets Overlay
1. **Shine effect**: Barre blanche qui traverse
2. **Gradient shift**: Background qui bouge
3. **Hover widget**: scale 1.03
4. **Hover bouton**: 
   - Scale 1.1
   - TranslateY -4px
   - Gradient yellow-orange
   - Icône + rotation 90deg

---

## 📊 Dashboard - Cartes Projets

### Structure Card
```
╔════════════════════════════════════╗
║ "Transforme en cyberpunk"    ✅   ║
║ 20/10/2024 14:30                  ║
║                                    ║
║ ┌──────────┐ ┌──────────┐        ║
║ │ Original │ │ Résultat │        ║
║ │  Image   │ │  Image   │        ║
║ └──────────┘ └──────────┘        ║
║                                    ║
║ [Original] [Résultat]             ║
║ [Copier] [Réutiliser] [Supprimer]║
╚════════════════════════════════════╝
```

### Animations Séquentielles
```
Project Cards Grid:
  Card 1: fadeIn delay 0ms
  Card 2: fadeIn delay 100ms
  Card 3: fadeIn delay 200ms
  Card 4: fadeIn delay 300ms
  ...
```

### Hover Behaviors

**Sur la carte complète**:
```
transform: translateY(-8px) scale(1.02)
shadow: double layer (blur + glow)
background: opacity increase
border: purple glow
```

**Sur une image**:
```
transform: scale(1.05)
shadow: blue glow 24px
border: purple
cursor: pointer
```

**Sur un bouton**:
```
Before pseudo-element:
  - Cercle blanc expansion (ripple)
transform: translateY(-3px) scale(1.05)
shadow: color glow
```

### Status Badges
```
✅ Terminé:
  - Gradient blue
  - slideInFromRight
  - Static
  
⏳ En cours:
  - Gradient yellow-orange
  - slideInFromRight
  - pulse-soft (infini)
  
⚠️ Erreur:
  - Gradient red
  - slideInFromRight
  - shake (once)
```

---

## 🎯 Flow Utilisateur Optimisé

### Parcours d'Achat
```
1. User voit CreditsWidget (animated)
   └─ Crédits faibles? → Pulse glow
   
2. Click sur "Acheter"
   └─ Modal fadeIn + slideUp
   
3. Cards apparaissent en séquence
   └─ Pack Pro mis en avant (populaire)
   
4. Hover sur card
   └─ Scale + shine effect
   
5. Click sur card
   └─ Ripple effect + redirect Stripe
   
6. Retour après paiement
   └─ Toast success + widget update
```

### Feedback Visuel
```
Action          → Animation          → Durée
─────────────────────────────────────────────
Page load       → fadeIn            → 500ms
Card hover      → scale + translate → 300ms
Button click    → ripple + scale    → 600ms
Success         → bounceIn          → 500ms
Error           → shake             → 500ms
Copy            → bounceIn badge    → 500ms
```

---

## 🎨 Palette Complète

### Gradients Background
```css
/* Payment Flow */
from-purple-600 to-pink-600
from-purple-50 via-pink-50 to-blue-50

/* Success States */
from-green-400 to-emerald-500
from-teal-50 to-green-50

/* Warning States */
from-yellow-400 to-orange-500
from-yellow-50 to-orange-50

/* Error States */
from-red-500 to-red-700
from-red-50 to-red-100
```

### Glassmorphism Recipes
```css
/* Standard */
background: rgba(255,255,255,0.9)
backdrop-filter: blur(12px)
border: 1px solid rgba(255,255,255,0.2)

/* Premium */
background: rgba(255,255,255,0.95)
backdrop-filter: blur(18px)
border: 1px solid rgba(147,51,234,0.3)

/* Cards */
background: rgba(255,255,255,0.82)
backdrop-filter: blur(8px)
border: 1px solid rgba(148,163,184,0.25)
```

---

## 🚀 Performance Tips

### Animations Performantes
✅ **GPU-accelerated**:
- `transform: translate/scale/rotate`
- `opacity`
- `filter: blur/brightness`

❌ **Éviter**:
- `width/height` changes
- `top/left/right/bottom` changes
- `margin/padding` changes

### Optimisation CSS
```css
/* Bon */
.element {
  will-change: transform;
  transform: translateZ(0); /* Force GPU */
}

/* À éviter */
.element {
  will-change: contents; /* Trop large */
  animation: move 1s linear infinite; /* CPU */
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px → 1 colonne
- **Tablet**: 768px-1024px → 2 colonnes
- **Desktop**: > 1024px → 3 colonnes

### Adaptations Mobile
- Cards: Width 100%
- Buttons: Full width on mobile
- Modal: Max height 90vh avec scroll
- Animations: Réduit sur mobile (prefers-reduced-motion)

---

## ✨ Points Forts Conversion

### Éléments Psychologiques
1. **Urgence**: Badge "Économisez 33%" animé
2. **Autorité**: Badge "Recommandé" sur Pack Pro
3. **Rareté**: "Presque épuisés!" pour crédits faibles
4. **Preuve sociale**: "Populaire" badge
5. **Clarté**: Prix/crédit calculé automatiquement

### Hiérarchie Visuelle
```
Niveau 1: Badge Populaire (pulseGlow)
Niveau 2: Nombre crédits (gradient + scale)
Niveau 3: Prix (gradient text)
Niveau 4: Description
Niveau 5: Avantages (checkmarks)
Niveau 6: CTA Button (gradient + shine)
```

---

**Version**: 2.0  
**Date**: 20 octobre 2024  
**Status**: Production Ready ✅
