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

### 18. Refonte vitrine complète (chipeur_commerces.jsx — mai 2026)

#### Structure
- Suppression des onglets "Vitrine / Infos" → un seul feed `TabVitrine`
- Bannière plein cadre `calc(220px + safe-area-inset-top)` avec :
  - Bouton ‹ retour (top-left, décalé safe-area)
  - ♡ Suivre (top-right, rond blanc) — sauf mode démo
  - Nom commerce + catégorie (bottom-left)
  - Bouton "ℹ️ Infos" (bottom-right) → ouvre bottom drawer avec TabInfos
- Bottom drawer infos : fond semi-transparent, panneau qui monte, poignée, scroll
- Boutons fixes bas : `📞 Contacter` (lien tel:) + `🗺️ Y aller` (Google Maps)

#### VITRINE_MODES (ordre actuel)
```js
{ id: "galerie", label: "📷 Photos" },  // PAR DÉFAUT
{ id: "tout",    label: "Posts" },
{ id: "promos",  label: "🎁 Promos" },
{ id: "defis",   label: "🏆 Défis" },
{ id: "postes",  label: "📬 Liés", ownerOnly: true },
```

#### Comportement galerie (vue par défaut)
- Grille 3 colonnes de photos
- Clic → ouvre `PostDetailModal` (fiche produit complète, pas simple lightbox)
- Badge tag IA visible en bas-gauche de chaque photo (premier tag)
- Badge 🎁 si promo, ✦ si produit enrichi

#### Stats conditionnelles
- Si vitrine < 30j ET tous les stats à 0 → badge "🆕 Nouvelle vitrine"
- Sinon → stats non-nulles uniquement, "abonnés" → "voisins du quartier"

#### Horaires dynamiques
- `nextOpeningText(hours)` → "● Fermé · Ouvre lundi à 9h30"

#### Suppression de post
- Commerçant peut supprimer ses propres posts (bouton 🗑 dans VitrinePostCard)
- Double confirmation : 1er clic → "Confirmer ?", 2e clic → suppression

---

### 19. Analyse IA des photos (post-tag)

#### Fichiers
- `supabase/migrations/20260517_post_tags.sql` : `tags TEXT[]` sur `posts` + index GIN
- `supabase/functions/post-tag/index.ts` : Edge Function Claude Vision (haiku) → 5-8 mots-clés FR

#### Règles de déclenchement
- **Commerçant publie une photo** → `tagPhotoAsync()` fire & forget dans `chipeur_nouveau_post.jsx` (condition `profile?.role === "magasin"`)
- **Voisin poste + commerçant accepte** → tag déclenché dans `handleAcceptPost` dans `chipeur_commerces.jsx`
- **Voisin poste sans lien** → pas de tag
- **Défis** → à faire (tâche #31)

#### Secrets Supabase
- `ANTHROPIC_API_KEY` ✅ configuré

#### Affichage
- Tags en pills dans PostDetailModal / lightbox
- Premier tag visible sur la miniature en grille galerie

---

### 20. Refonte page vitrine commerçant (mai 2026)

#### chipeur_commerces.jsx
- **Banner** : suppression adresse/ville sous le nom → affiche `metier` ou `category` seulement
- **Barre de recherche** : remplace le bloc stats (posts/réactions/abonnés) — recherche par tags IA sur `post.tags`, `product_label`, `content`
- **Tabs** : `promos` + `défis` → regroupés dans `🎯 Offres` (promos d'abord, défis ensuite)
- **Sous-filtres catégorie** : `VITRINE_SUBFILTRES` — chips sous les tabs pour plan `mixe` / `premium` (ex. Mode → Robes, Pulls, Jupes…)
- **Champ `plan`** : `profileToCommerce` retourne `p.plan || "premium"` — défaut premium pendant phase test
- **Défis chargés au montage** (eager) pour alimenter le compteur de l'onglet Offres
- **Suppression des boutons fixes** Contacter / Y aller (accessibles via drawer ℹ️ Infos)

#### supabase/migrations/20260518_plan_profile.sql
- Colonne `plan TEXT DEFAULT 'premium' CHECK (IN découverte/mixe/premium)` sur `profiles`
- Migration à appliquer via interface Supabase → SQL Editor

#### supabase/migrations/20260518_vitrine_filtres.sql
- Colonne `vitrine_filtres TEXT[] DEFAULT '{}'` sur `profiles`
- Index GIN pour recherche rapide

### 21. Tags IA contextualisés par métier (mai 2026)

#### supabase/functions/post-tag/index.ts (réécrit)
- Reçoit `metier` et `categorie` en plus de `post_id` + `image_url`
- Si non fournis : fetch `author_id` depuis le post, puis profil commerçant depuis `profiles`
- Prompt contextualisé : "Ce post est publié par un commerce de type : X. Génère des tags pertinents pour CE type d'activité. Ignore les vêtements/personnes."
- Retourne `{ tags, metier, categorie }`

#### chipeur_commerces.jsx
- `handleAcceptPost` passe `metier` + `categorie` à `post-tag` invoke

#### chipeur_nouveau_post.jsx
- `tagPhotoAsync(postId, imageUrl, metier, categorie)` — signature étendue

### 22. Filtres vitrine custom + auto-init depuis tags IA (mai 2026)

#### chipeur_commerces.jsx
- `FilterManagerModal` : modal pour gérer les filtres custom (ajouter/retirer, suggestions depuis tags IA)
- `TabVitrine` : auto-init des filtres depuis les tags IA si le commerçant n'en a pas (sauvegarde silencieuse)
- `vitrineFilters` : priorité filtres custom, sinon `VITRINE_SUBFILTRES` par catégorie
- Bouton ⚙️ Filtres visible seulement pour l'owner (plan mixe/premium)

### 23. Recherche produit + stats vitrine (mai 2026)

#### supabase/migrations/20260518_search_logs.sql
- Table `search_logs` (id, query, type, results_count, user_id, commerce_id, created_at)
- RPC `search_posts_by_tag(query TEXT)` : cherche posts dont les tags contiennent la query, retourne post + info commerce
- RLS : insert ouvert, select restreint owner par commerce_id

#### chipeur_commerces.jsx
- **VITRINE_MODES** : ajout `{ id: "stats", label: "📊 Stats", ownerOnly: true }`
- **`TabStats`** : onglet owner-only, top recherches qui ont trouvé les produits du commerce (depuis search_logs), sélecteur période 7/30/90j, barres de progression
- **`ProductSearchGrid`** : grille 3 colonnes de photos produit avec tag matché + nom commerce, clic → ouvre vitrine
- **`ChipeurCommerces`** : toggle 🏪 Commerce / 🛍️ Produit avant la barre de recherche ; mode produit → debounce 400ms → RPC `search_posts_by_tag` → `ProductSearchGrid` + log dans `search_logs` (par commerce trouvé)

---

## À faire / prochaine session

### 🏆 Tags IA pour les défis commerçants (tâche #31)
- Migration SQL : `tags TEXT[]` sur table `defis`
- Appeler `post-tag` (ou variante) après création d'un défi avec photo par un commerçant
- Afficher les tags sur les cartes défis dans la vitrine

### 🎬 Feature vidéo / Reels — À planifier
Demandée par Jenny. Chantier estimé à 1-2 jours de travail.

**Règles métier :**
- Voisins : 1 vidéo max par post, durée max **10 secondes**
- Commerçants : jusqu'à **10 min de vidéo au total**, durée max **1 min par vidéo**
- Stockage : Supabase Storage bucket `post-videos` (public)

### Autres
- Tester fix iOS écran blanc sur l'iPhone de la mère de Jenny
- Fix vite.config.js — séparer icônes `any` et `maskable`
- Fix `useProfile.js:22` — guard userId
- Fix `chipeur_messages.jsx:59` — behavior auto

---

## Comment travailler avec Jenny

**Profil :** Jenny est la fondatrice de Chipeur. Elle a une vision produit très claire mais des connaissances techniques limitées. Elle ne code pas elle-même.

**Ce qui fonctionne bien :**
- Expliquer les choix techniques en langage simple, sans jargon
- Lui donner des commandes exactes à copier-coller dans le terminal
- Lui dire exactement où cliquer dans les interfaces (Supabase, Vercel, GitHub)
- Faire les modifications directement dans les fichiers sans lui demander de les éditer
- Valider ses idées UX et proposer des améliorations concrètes ("fais au mieux")
- Poser une seule question à la fois si besoin de clarification

**Ce qu'il faut éviter :**
- Supposer qu'elle sait où trouver quelque chose dans une interface
- Lui donner du code à copier dans des fichiers (faire les edits directement)
- Les explications trop longues ou trop techniques
- Demander trop de confirmations — quand elle dit "go" ou "fais au mieux", on y va

**Workflow typique :**
1. Jenny décrit ce qu'elle veut en langage naturel
2. Claude fait les modifications dans les fichiers directement
3. Claude donne la commande git exacte à lancer
4. Jenny copie-colle dans son terminal Windows (`C:\Users\jenny\chipeur`)
5. Vercel déploie automatiquement après le push

**Terminal :** Windows CMD, dossier `C:\Users\jenny\chipeur`
**Supabase CLI :** non installée — utiliser l'interface web Supabase pour les fonctions et migrations
