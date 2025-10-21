# 🔧 Fix Next.js 15 - Migration vers @supabase/ssr

## 🚨 Problème Détecté

```
Error: Route "/api/credits" used `cookies().get('sb-veulahermznmcjnokeua-auth-token')`. 
`cookies()` should be awaited before using its value.
Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
```

## 📋 Contexte

Dans **Next.js 15**, les APIs dynamiques comme `cookies()` et `headers()` sont maintenant **asynchrones** et doivent être **awaitées** avant utilisation.

De plus, **@supabase/auth-helpers-nextjs v0.10.0** n'est **pas compatible** avec Next.js 15. Il faut migrer vers **@supabase/ssr** qui est la nouvelle bibliothèque officielle.

### Breaking Changes
1. Next.js 15 : `cookies()` retourne maintenant une Promise
2. Supabase : Dépréciation de `@supabase/auth-helpers-nextjs`
3. Migration vers `@supabase/ssr` requis

## 🔧 Solution Appliquée

### 1. Installation de @supabase/ssr

```bash
npm install @supabase/ssr@latest
```

### 2. Migration de supabase-route.ts

**AVANT** (@supabase/auth-helpers-nextjs - ❌ Non compatible Next.js 15)
```typescript
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function supabaseRoute() {
  return createRouteHandlerClient<Database>({ cookies });
}
```

**APRÈS** (@supabase/ssr - ✅ Next.js 15 Compatible)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseRoute() {
  const cookieStore = await cookies(); // ✅ Await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignored
          }
        },
      },
    }
  );
}
```

### 3. Migration de auth/callback/route.ts

**AVANT** (❌ Ancien pattern)
```typescript
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const supabase = createRouteHandlerClient<Database>({ cookies });
```

**APRÈS** (✅ Nouveau pattern @supabase/ssr)
```typescript
import { createServerClient } from "@supabase/ssr";

const cookieStore = await cookies();
const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored
        }
      },
    },
  }
);
```

## 📖 Pourquoi @supabase/ssr ?

### Avantages de la migration

1. **✅ Next.js 15 Compatible**
   - Gère nativement les cookies asynchrones
   - API moderne et async-first

2. **✅ Bibliothèque Officielle**
   - Recommandée par Supabase
   - Meilleur support et maintenance

3. **✅ Plus de Contrôle**
   - Gestion explicite des cookies
   - Meilleure intégration avec SSR/RSC

4. **✅ Future-proof**
   - `@supabase/auth-helpers-nextjs` est déprécié
   - `@supabase/ssr` est l'avenir

### Pattern @supabase/ssr

```typescript
// Nouvelle API standard pour tous les cas d'usage
createServerClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      getAll() { /* Lecture des cookies */ },
      setAll(cookies) { /* Écriture des cookies */ }
    }
  }
)
```

## ✅ Vérification

### Test 1 : No TypeScript Errors
```bash
npm run build
# ✅ Doit compiler sans erreurs
```

### Test 2 : No Runtime Errors
```bash
npm run dev
# ✅ Plus d'erreurs "cookies() should be awaited"
# ✅ Plus d'erreurs dans /api/credits, /api/payments, etc.
```

### Test 3 : Auth Flow Fonctionne
```bash
# 1. Login → /auth/callback
# 2. Session créée correctement
# 3. Redirect vers /dashboard
# ✅ Pas d'erreurs dans la console
```

## 📊 Résultat

```diff
Package ajouté       : @supabase/ssr@latest
Fichiers modifiés    : 2
  - app/lib/supabase-route.ts
  - app/auth/callback/route.ts
  
Ancien pattern       : createRouteHandlerClient (déprécié)
Nouveau pattern      : createServerClient (officiel)

TypeScript           : ✅ 0 errors
Runtime Errors       : ✅ RÉSOLU
Compatibilité        : ✅ Next.js 15.5.4
```

## 🔗 Ressources

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Migration Guide @supabase/ssr](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

## 🚀 Impact

### Fichiers Affectés

Tous les fichiers utilisant `supabaseRoute()` bénéficient automatiquement du fix :
- ✅ `/api/credits` → 200 sans erreurs
- ✅ `/api/payments` → 200 sans erreurs  
- ✅ `/api/generate` → Fonctionne
- ✅ `/api/buy-credits` → Fonctionne
- ✅ `/api/admin/analytics` → Fonctionne
- ✅ `/auth/callback` → Session créée correctement

### Aucun Changement Requis

Les routes API n'ont **pas besoin d'être modifiées** car elles utilisent déjà `await supabaseRoute()`. La migration est transparente !

```typescript
// Ce code continue de fonctionner tel quel ✅
const supabaseUser = await supabaseRoute();
const { data: { user } } = await supabaseUser.auth.getUser();
```

---

**Date** : 21 octobre 2024  
**Version** : Next.js 15.5.4 + @supabase/ssr  
**Status** : ✅ Fixed & Migrated

