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

### 9. Fix iOS — supabase.js (SecurityError localStorage)
- `supabase.js` : ajout d'un adapteur `safeStorage` passé à `auth: { storage: safeStorage }`
- Empêche le crash `SecurityError: The operation is insecure` sur iOS WebView / navigation privée
- Cause racine : `createClient()` appelle `localStorage` en interne dès le démarrage

### 10. safeStorage.js — nouveau fichier
- Wrapper sécurisé pour tous les appels `localStorage` de l'app
- Tous les fichiers qui utilisaient `localStorage` directement ont été migrés vers `safeStorage`

### 11. Changement de type de compte (chipeur_settings.jsx)
- Dans les paramètres du profil, bouton "Changer de type de compte"
- Voisin → commerçant : redirige vers l'inscription commerçant
- Commerçant → voisin : supprime l'entrée dans `magasins`, remet `role: "voisin"` dans `profiles` ET dans `user_metadata`
- `App.jsx` : routing profil basé uniquement sur `profile.role` (table), plus sur `user.user_metadata.role` (obsolète après switch)

### 12. Événements — photos multiples + fix null content (chipeur_sorties.jsx)
- `content: caption.trim() || null` → `content: caption.trim() || ""` (fix erreur NOT NULL Supabase)
- `PhotoUploadOverlay` réécrit : sélection multiple, grille de preview, suppression individuelle, barre de progression

### 13. Classement XP gloire — déplacé dans page Voisins
- `BandeauClassement` retiré du fil (`chipeur_fil.jsx`)
- Composant recréé dans `chipeur_page_voisins.jsx` avec click adapté (`openVoisin` interne)
- Placé tout en haut de la liste scrollable dans la page Voisins
- Design identique : header dark collapsible, top 5, médailles, lot du mois

### 14. Souvenirs de sorties — collapsible (chipeur_fil.jsx)
- `BandeauSortiesPhotos` redesigné avec le même pattern dark header que le classement
- Header sombre avec compteur "X sortie(s) · Y photo(s)", fermé par défaut
- Clic pour dérouler la liste des événements avec photos

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

### 15. Import Google Business Profile (mai 2026)

#### Nouveaux fichiers
- `supabase/migrations/20260517_google_places.sql` — colonnes Google dans `profiles`
- `supabase/functions/places-search/index.ts` — proxy Text Search → 5 résultats
- `supabase/functions/places-details/index.ts` — détails + upload 3 photos → Supabase Storage `merchant-photos`
- `supabase/functions/places-refresh-hours/index.ts` — cron quotidien (03h UTC), rafraîchit `current_opening_hours`

#### Modifications
- `chipeur_inscription.jsx`
  - Nouvel écran `ScreenGoogleSearch` intercalé entre "choix" et "magasin"
  - Flow magasin : "choix" → **google_search** → "magasin" → "success"
  - `ScreenMagasin` : accept `initialData` prop, badge "Fiche Google importée", champs phone/website pré-remplis
  - `handleMagasinValidate` : enregistre `google_place_id`, `google_data`, `opening_hours`, `current_opening_hours`, `photo_urls`, `lat`, `lng`
  - Lien de secours "Mon commerce n'est pas sur Google → saisie manuelle"
- `chipeur_profil_magasin.jsx`
  - Composant `GoogleResyncCard` dans le dashboard (visible si `google_place_id` non null)
  - Bouton "Resynchroniser avec Google" → appelle `places-details` + met à jour Supabase
  - `GoogleLinkModal` : permet aux commerçants existants de lier leur fiche Google
  - `convertGoogleHours()` : convertit `weekday_text` Google → format chipeur `[{j, h}]`
  - Resync/Link met aussi à jour `quartier` (depuis `address`) et `horaires`
  - Section "Photos du commerce" dans `EditProfilScreen` : voir, ajouter, supprimer les `photo_urls`

### 16. Fiche commerce enrichie (chipeur_commerces.jsx)
- `profileToCommerce` : `gallery` ← `p.photo_urls`, `cover` fallback sur `photo_urls[0]`, `open_now` depuis `current_opening_hours`
- `ComGridCard` : badge "Ouvert"/"Fermé" (vert/rouge) visible sur les cards grille quand `open_now` est connu
- `TabInfos` : badge "● Ouvert maintenant" / "● Fermé" à côté du titre HORAIRES
- `TabInfos` : section galerie "📷 PHOTOS DU COMMERCE" affichant les `photo_urls` Google

#### Secrets Supabase à ajouter
- `GOOGLE_PLACES_API_KEY` (Google Cloud Console → Identifiants)

#### Bucket Storage à créer
- `merchant-photos` (public)

---

### 17. Refonte page Commerces — sections thématiques (chipeur_commerces.jsx)

Branche git : `feat/page-commerces-sections` (créer avec `git checkout -b feat/page-commerces-sections`)

#### Nouveaux fichiers
- `supabase/migrations/20260517_lieu_role.sql` — index sur `role = 'lieu'` + colonne `lieu_type TEXT`

#### Logique de la page
- **Vue d'ensemble** (aucun filtre actif) → sections empilées :
  1. 📸 Bandeau photos récentes (inchangé)
  2. 🆕 Nouveaux membres — strip horizontal, derniers 6 inscrits (tri `created_at`)
  3. 🏪 Commerces — grille 2 colonnes (Mode, Alim, Maison, Services, Sport, Culture, Autre)
  4. 💄 Beauté & Bien-être — strip horizontal (visible si ≥1 membre)
  5. 🍽️ Restauration — strip horizontal (visible si ≥1 membre)
  6. 🎨 Artisans & Créateurs — strip horizontal (visible si ≥1 membre)
  7. 🏛️ Vie locale — strip horizontal, accent vert pro (role = 'lieu') (visible si ≥1 membre)
- **Vue filtrée** (chip catégorie ou recherche active) → grille 2 col flat (comportement précédent)
- Sections 4-7 n'apparaissent que si elles ont du contenu (évite les sections vides)

#### Nouveaux composants
- `StripCard` — carte 150×130px pour les strips horizontaux
- `SectionHeader` — en-tête de section réutilisable (emoji + titre + séparateur + compteur)
- `SectionStrip` — section horizontale scrollable (utilise StripCard)
- `NouveauxMembres` — strip avatars 64×64px avec nom + catégorie en dessous

#### Modifications
- `profileToCommerce` : ajoute `created_at`, `role`, `lieu_type`
- Supabase query : ajoute `created_at, lieu_type` au SELECT + `role.eq.lieu` au OR filter
- Nouveau rôle `lieu` pour médiathèque, musée, piscine, théâtre, cinéma, etc.

### 18. Refonte vitrine (chipeur_commerces.jsx)

- `VITRINE_MODES` réordonné : Posts (tout) en premier, puis Promos, Défis, Photos, Liés
- Onglet par défaut : `activeMode` passe de `"galerie"` à `"tout"`
- **Badge compteurs** sur chaque chip : `counts = { tout, promos, defis, galerie, postes }` passé à `VitrineChips`
- **Stats conditionnelles** : si vitrine < 30j et tous à 0 → badge "🆕 Nouvelle vitrine · 📍 Commerce vérifié". Si stats existent : on affiche uniquement les non-nulles, "abonnés" → "voisins du quartier"
- **♡ Suivre** déplacé dans le bandeau photo (top-right, bouton rond), plus de bouton flottant "Suivre cette vitrine"
- **Boutons bas de page** : `📞 Contacter` (lien tel:) + `🗺️ Y aller` (Google Maps search sur nom + Saint-Dié-des-Vosges)
- **États vides** retravaillés : emoji grand + titre + sous-titre pour chaque onglet (posts, promos, défis, galerie)
- **Horaires dynamiques** : helper `nextOpeningText(hours)` → affiche "● Fermé · Ouvre lundi à 9h30" dans `TabInfos`

---

### 19. Analyse IA des photos (post-tag)

- `supabase/migrations/20260517_post_tags.sql` : colonne `tags TEXT[]` sur `posts` + index GIN
- `supabase/functions/post-tag/index.ts` : Edge Function — reçoit `post_id` + `image_url`, appelle Claude Vision (haiku), retourne 5-8 mots-clés FR, met à jour `posts.tags`
- `chipeur_nouveau_post.jsx` : helper `tagPhotoAsync()` appelé en fire & forget après chaque insert avec image (flow decouverte/bonplan)
- Secret Supabase à ajouter : `ANTHROPIC_API_KEY`
- Tags affichés dans la lightbox vitrine (sous le contenu du post)

### 20. Refonte vitrine — drawer Infos + bannière simplifiée

- Suppression des onglets "Vitrine / Infos"
- `VitrineScreen` : bannière plein cadre (220px + safe-area) avec bouton "ℹ️ Infos" en bas-droite → ouvre un bottom drawer
- Bottom drawer : fond semi-transparent, panneau qui monte, poignée, contenu `TabInfos`
- Seul `TabVitrine` est affiché en contenu principal (plus de `activeTab`)
- Lightbox enrichie : date du post, tags IA en pills sous le contenu

---

## À faire / en attente
- Tester fix iOS écran blanc sur l'iPhone de la mère de Jenny
- Google Analytics : actif, données visibles sous 24-48h
- Fix 5 Claude Code (vite.config.js — séparer icônes `any` et `maskable`) : non appliqué
- Fix 6 Claude Code (`useProfile.js:22` — guard userId) : non appliqué
- Fix 7 Claude Code (`chipeur_messages.jsx:59` — behavior auto) : non appliqué

### 🎬 Feature vidéo / Reels — À planifier
Demandée par Jenny. Chantier estimé à 1-2 jours de travail.

**Règles métier :**
- Voisins : 1 vidéo max par post, durée max **10 secondes**
- Commerçants : jusqu'à **10 min de vidéo au total** (ex : 20 vidéos de 30s), durée max **1 min par vidéo**
- Stockage : Supabase Storage (abonnement payant Jenny — bucket à créer `post-videos`, public)

**Travail à faire :**
1. Migration SQL : colonne `video_url TEXT` + `media_type TEXT DEFAULT 'image'` sur table `posts`
2. Colonne `video_seconds_used INT DEFAULT 0` sur table `profiles` (quota commerçants)
3. Mise à jour `PhotoZone` dans `chipeur_nouveau_post.jsx` : accepter `video/*`, valider durée via `videoEl.duration`, afficher preview `<video>`
4. Upload vers bucket Supabase `post-videos` (pas `images`)
5. Mise à jour affichage dans `chipeur_fil.jsx` : rendu `<video autoPlay muted loop playsInline>` si `media_type === 'video'`
6. Même mise à jour dans `chipeur_commerces.jsx` (vitrine), `chipeur_profil_voisin_1.jsx` (profil voisin)
7. Vérifier et décrémenter/incrémenter `video_seconds_used` à chaque publication commerçant
8. Compression côté client : pas d'API native navigateur — envisager un service tiers (Cloudflare Stream, Mux) ou accepter la taille brute avec une limite de 50 Mo/vidéo
