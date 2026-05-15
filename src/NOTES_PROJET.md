# 📋 Notes projet Chipeur
_Dernière mise à jour : 14 mai 2026_

---

## ✅ Modifications effectuées

### 🎯 XP Shop & Réductions
- **chipeur_mes_reductions.jsx** — réécriture complète en 2 onglets :
  - Onglet 1 "Mes XP Shop" : barre de progression par commerçant, badge DISPONIBLE à 100 XP
  - Onglet 2 "Bons plans du quartier" : offres actives
  - Typographie allégée (fontWeight réduit, tailles plus petites)
- **chipeur_commerces.jsx** — notification automatique quand un voisin franchit un palier de 100 XP Shop (bons d'achat disponibles)
- **chipeur_commerces.jsx** — section "Vos ambassadeurs locaux" dans le profil commerçant (liste des voisins avec leurs XP Shop)
- Labels corrigés partout : "+10 XP Shop", "100 XP Shop = 5 € de bon d'achat"

### 🏅 Profil voisin
- **chipeur_profil_voisin_1.jsx** — stats cliquables dans le tableau récapitulatif :
  - Publications → onglet Publications
  - Classement → page Voisins
  - XP gloire → onglet Récompenses
  - XP Shop → page Mes Réductions
- **chipeur_profil_voisin_1.jsx** — onglet Récompenses nettoyé : section XP Shop supprimée, parrainage + tableau XP gloire + trophées
- Typographie allégée dans les onglets

### 🏆 Défis
- **SwipeVoteModal.jsx** — +5 XP gloire accordés après avoir voté sur un défi

### 📰 Fil
- **chipeur_fil.jsx** — fix posts de comptes supprimés : filtrés dans les 3 requêtes
- **chipeur_fil.jsx** — label classement : "⚡ {xp_month} XP gloire"
- **chipeur_fil.jsx** — variable `const syne` manquante ajoutée (bug crash écran blanc)
- **chipeur_fil.jsx** — ruban de catégorie sur les images déplacé de gauche → **droite**
- **chipeur_fil.jsx** — typographie allégée : "On les attend avec impatience", "Classement de mai", "Les défis commerçants arrivent !"
- **chipeur_fil.jsx** — menu déroulant mis à jour pour coller aux types de NouveauPost :
  - ✅ Chope / Lieux / Je cherche → filtre normal dans le fil
  - ✅ Défis → filtre les photos de défis + badge "🗳️ N votes" sur chaque image
  - ✅ Tu valides → navigation vers la page Défis (jeu de swipe), pas de sélection noire
  - ✅ Événement → navigation vers la page Sorties, pas de sélection noire
  - Supprimé : "Bons plans", "Autour de moi"

### 🔔 Notifications
- **chipeur_notifications.jsx** — ajout des types `linked_accepted` (photo validée, +10 XP Shop) et `xpshop_palier` (bon d'achat disponible)
- Notification `xpshop_palier` : carte orange avec "🎉 Bon d'achat disponible !", navigation vers Mes Réductions
- Fix colonne utilisée : `message` (TEXT) au lieu de `extra` qui n'existe pas

### 🚀 Première connexion (modales)
- **InstallPWAModal.jsx** — NOUVEAU fichier : pop-up expliquant comment installer l'appli sur l'écran d'accueil
  - Détection plateforme : iOS (Safari → "Sur l'écran d'accueil") / Android (3 points → "Ajouter à l'écran d'accueil")
  - Illustrations SVG avec étapes numérotées
  - Ignoré si déjà installé en PWA standalone ou sur desktop
  - Fix : `onClose()` via `useEffect` (pas pendant le rendu → évite écran blanc)
- **FilTourModal.jsx** — NOUVEAU fichier : 5 slides de présentation de l'appli
  - Slides : Le Fil / Événements / Publier / Commerces / Profil & Voisins
  - Mini-téléphones fidèles au vrai design (couleurs #F5F2EE, cartes blanches, nav orange)
  - Titres allégés (fontWeight 600, fontSize 15)
- **App.jsx** — enchaînement : Onboarding → InstallPWAModal → FilTourModal (chacun une seule fois via localStorage)

---

## 🕐 Modifications à venir (backlog)

### 🔔 Push Notifications PWA
- **Objectif** : notifier les utilisateurs même quand l'app est fermée
- **Solution recommandée** : OneSignal (gratuit jusqu'à 10 000 abonnés)
- **Étapes** :
  1. Créer un compte OneSignal et configurer le projet Web Push
  2. Ajouter le Service Worker OneSignal dans `/public`
  3. Intégrer le SDK OneSignal dans l'app
  4. Connecter les événements Supabase (nouvelle notif → push OneSignal)
- **Effort estimé** : 2-3h

### 📍 "Autour de moi" — géolocalisation intelligente
- **Problème actuel** : pas de comparaison automatique entre la ville de l'utilisateur et la ville des posts/commerces
- **Ce qui manque** :
  - Sur le **Fil** : remettre le filtre "Autour de moi" qui compare `user.quartier` au `post.location` (au lieu de montrer tout le bassin)
  - Sur la page **Commerces** : bandeau "Dans ta ville" mettant en avant les commerçants dont le `quartier` = `user.quartier`
- **Option GPS** : utiliser `navigator.geolocation` pour détecter la ville automatiquement sans que l'utilisateur la saisisse
- **Effort estimé** : 1-2h pour le fil + commerces

### 🤔 Page "Tu valides" (jeu de swipe dédié)
- **Objectif** : créer une expérience swipe pour les posts de type `post_type = "tuvalides"` (similaire au SwipeVoteModal des défis)
- Le chip "Tu valides" dans le menu navigue actuellement vers la page Défis (solution temporaire)
- **Effort estimé** : 3-4h (nouveau composant SwipeTuValidesModal)

### 🔗 Partage du lien de parrainage
- Bouton dans le profil voisin pour partager son lien `?ref=UUID`
- Utiliser l'API Web Share (`navigator.share`) sur mobile
- **Effort estimé** : 1h

---

## 🗄️ Infos techniques utiles

### Tables Supabase utilisées
- `profiles` : id, pseudo, avatar_url, role, xp, xp_shop, quartier, has_seen_onboarding
- `posts` : id, author_id, post_type, content, image_url, location, defi_id, evenement_id, tags, created_at
- `merchant_xp_wallet` : id, user_id, merchant_id, points (int4), updated_at
- `notifications` : id, user_id, from_user_id, type, reference_id, read, message (TEXT, JSON), created_at
- `defi_votes` : id, defi_id, post_id, voter_id, vote

### localStorage (clés de session)
- `chipeur_onboarding_done_v2` : onboarding vu
- `chipeur_install_shown_v1` : pop-up installation PWA vu
- `chipeur_fil_tour_v1` : tour des 5 slides vu

### Palette de couleurs
- Fond : `#F5F2EE`
- Cartes : `#FFFFFF`
- Accent orange : `#FF5733`
- Pro (commerçant) : `#0A3D2E`
- Or : `#F7A72D`
- Pill/bordure : `#EDEBE8`
- Texte principal : `#1A1714`
- Texte secondaire : `#6B6560`

### Types de posts (`post_type`)
- `decouverte` → Chope !
- `lieu` → Lieux
- `recherche` → Je cherche
- `tuvalides` → Tu valides
- `defi_photo` → photo soumise à un défi
- `bonplan` → Bon plan
- `evenement` → lié à un événement via `evenement_id`
