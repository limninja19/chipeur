# CHIPEUR — Mémoire des modifications (Cowork + Claude Code)

## Stack technique
- React + Vite (JSX), PWA
- Supabase (auth + base de données)
- Vercel (déploiement automatique depuis GitHub)
- Repo GitHub : https://github.com/limninja19/chipeur
- URL prod : https://chipeur.vercel.app

---

## Modifications effectuées (session mai 2026)

### 1. Commerce — nouveau design listing (chipeur_commerces.jsx)
- Remplacé `BoutiquesDropdown` par `CategoryChips` (chips horizontaux scrollables)
- Remplacé `ComCard` (liste pleine largeur) par `ComGridCard` (grille 2 colonnes)
- `THEME_COVERS` : tous les gradients → couleurs plates

### 2. Suppression des dégradés sur toutes les pages
Fichiers modifiés : `chipeur_commerces.jsx`, `chipeur_onboarding.jsx`, `chipeur_defis.jsx`, `chipeur_fil.jsx`, `chipeur_mes_reductions.jsx`, `chipeur_profil_voisin_1.jsx`, `chipeur_profil_magasin.jsx`, `chipeur_nouveau_post.jsx`, `ChallengeUI.jsx`, `chipeur_settings.jsx`, `chipeur_notifications.jsx`, `chipeur_page_voisins.jsx`, `chipeur_sorties.jsx`, `InstallPWAModal.jsx`, `chipeur_creer_defi.jsx`, `FilTourModal.jsx`
- Règle : `linear-gradient(135deg, ...)` → première couleur plate
- Exceptions conservées : overlays photo (`to bottom, transparent...`), fades nav (`to top, rgba...`), barre XP

### 3. Réduction tailles titres onboarding (chipeur_onboarding.jsx)
- Screen1 subtitle : 24px → 18px
- Screen2 title : 22px → 17px
- Screen3 title : 22px → 17px

### 4. FilTourModal — titres allégés (FilTourModal.jsx)
- Label pill : fontWeight 600→500, fontSize 12→11px
- Titre slide : fontWeight 600→500, fontSize 15→14px

### 5. Bandeau XP Shop & réductions — profil voisin (chipeur_profil_voisin_1.jsx)
- Fond pâle `#FFF8F6` → bloc orange plein `#FF5733`
- Texte blanc, icône dans carré translucide, flèche semi-transparente

### 6. Fix iOS — écran blanc/noir première visite

#### main.jsx — réécriture complète de la logique SW
- Supprimé : `APP_VERSION`, localStorage version check, auto-reload
- Ajouté : `ErrorBoundary` React (écran d'erreur lisible au lieu du blanc)
- Ajouté : bannière "🔄 Nouvelle version disponible [Mettre à jour]"
- Tout le code SW enveloppé dans try/catch imbriqués
- `showUpdateBanner` utilise `createElement` (pas innerHTML) pour compatibilité iOS

#### vite.config.js — fix race condition SW iOS
- `registerType: 'autoUpdate'` → `'prompt'`
- `skipWaiting: false` + `clientsClaim: false` (évite la race condition première visite)
- `navigateFallback: '/index.html'`
- `runtimeCaching` pour Supabase en NetworkFirst

#### index.html — iOS PWA + fallback + diagnostic
- `viewport-fit=cover` ajouté
- 4 balises iOS PWA : `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon`
- Fallback HTML "🐾 Chargement..." visible si React ne monte pas (timeout 10s)
- Sonde diagnostic : capture les erreurs JS avant React (`window.__diagnosticLog`)

#### App.jsx:122
- `getSession()` sans catch → ajout `.catch(() => setUser(null))`
- Évite le splash screen infini si réseau échoue au démarrage iOS

#### chipeur_login.jsx:313
- Ajout guard `if (authErr || !user) throw new Error("Session expirée")`
- Évite crash `Cannot read property 'id' of null`

#### Safe area — 7 fichiers BottomNav
`paddingBottom: "env(safe-area-inset-bottom, 0px)"` ajouté sur tous les BottomNav :
- `chipeur_fil.jsx`, `chipeur_defis.jsx`, `chipeur_commerces.jsx`
- `chipeur_mes_reductions.jsx`, `chipeur_profil_voisin_1.jsx`
- `chipeur_profil_magasin.jsx`, `chipeur_sorties.jsx`

### 7. Google Analytics (index.html + vercel.json)
- ID de mesure : `G-M70T7LWPX6`
- Script gtag.js ajouté dans `<head>` de `index.html`
- CSP dans `vercel.json` mise à jour pour autoriser les domaines GA

### 8. Sécurité — vercel.json
- CSP complète (scripts, styles, fonts, images, connexions)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS 2 ans)
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy` : caméra/micro/paiement bloqués

---

## Couleurs du design system
- Accent orange : `#FF5733`
- Dark ink : `#1A1714`
- Pro green : `#0A3D2E`
- Background : `#F5F2EE`
- Gold : `#F7A72D`
- Ink2 (muted) : `#6B6560`

## Fonts
- Titres : `Syne` (700, 800)
- Corps : `DM Sans` (400, 500, 600)

---

## À faire / en attente
- Tester fix iOS écran blanc sur l'iPhone de la mère de Jenny
- Google Analytics : actif, données visibles sous 24-48h
- Fix 5 Claude Code (vite.config.js — séparer icônes `any` et `maskable`) : non appliqué
- Fix 6 Claude Code (`useProfile.js:22` — guard userId) : non appliqué
- Fix 7 Claude Code (`chipeur_messages.jsx:59` — behavior auto) : non appliqué
