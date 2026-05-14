# CHIPEUR — Contexte projet (à lire en début de session)

> Ce fichier est mis à jour au fur et à mesure des sessions. Il remplace le résumé de conversation.

---

## 🏘️ C'est quoi Chipeur ?

Application PWA hyperlocale pour **Saint-Dié-des-Vosges**. L'idée : créer du lien entre les habitants (voisins) et les commerces locaux. Les voisins postent, réagissent, participent à des défis photo. Les commerçants ont une vitrine, un tableau de bord, et gagnent de la visibilité via les interactions.

**Stack** : React (fichiers JSX uniques, pas de routing complexe) + Supabase (auth + base de données + stockage images) + Vercel (déploiement)

---

## 📁 Fichiers principaux

| Fichier | Rôle |
|---|---|
| `chipeur_fil.jsx` | Fil d'actualité, PostCard, réactions, "Je cherche" + recommandations |
| `chipeur_nouveau_post.jsx` | Création de post (types : actu, alerte, question, recherche) |
| `chipeur_profil_magasin.jsx` | Profil commerçant : dashboard, mentions, défis, plan |
| `chipeur_profil_voisin_1.jsx` | Profil voisin : posts, récompenses, crédits locaux |
| `chipeur_commerces.jsx` | Page annuaire des commerces |
| `chipeur_settings.jsx` | Paramètres + suppression de compte (soft-delete) |
| `chipeur_defis.jsx` | Défis photo communautaires avec vote swipe |
| `chipeur_xp.jsx` | Système XP (fonction `addXP`) |
| `supabase.js` | Client Supabase |
| `Avatar.jsx` | Composant avatar réutilisable |
| `NOTES.md` | Notes techniques ponctuelles |
| `CHIPEUR_CONTEXT.md` | CE fichier — contexte global |

---

## 👤 Rôles utilisateurs

- **Voisin** : role = null ou "voisin" — poste, réagit, participe aux défis
- **Magasin** : role = "magasin" — vitrine publique, tableau de bord, XP commerçant
- **Artisan** : role = "artisan" — même chose que magasin, badge différent

---

## 🗄️ Tables Supabase importantes

| Table | Usage |
|---|---|
| `profiles` | Tous les utilisateurs (pseudo, role, avatar, bio, quartier, deleted_at…) |
| `posts` | Posts du fil (post_type, content, image_url, magasin_id, magasin_nom, linked_status…) |
| `post_reactions` | Réactions sur les posts (type : feu, coeur, veux, alerte…) |
| `post_recommendations` | Recommandations commerçant sur posts "Je cherche" |
| `recommendation_votes` | Votes 👍/👎 sur les recommandations |
| `merchant_xp_wallet` | XP gagné par commerçant (100 XP = 5€ de crédits locaux) |
| `defis` | Défis photo créés par les commerçants |
| `defi_votes` | Votes swipe sur les photos des défis |

### Colonnes clés à connaître
- `profiles.deleted_at` — soft-delete (null = compte actif)
- `profiles.role` — null pour voisin, "magasin"/"artisan" pour commerçants
- `posts.post_type` — "actu", "alerte", "question", "recherche"
- `posts.linked_status` — "pending", "accepted", "refused" (lien post ↔ commerçant)
- `posts.magasin_id` — FK vers profiles quand le post est lié à un commerce

---

## ⚙️ Logiques métier importantes

### Soft-delete compte
Dans `chipeur_settings.jsx` → `handleDeleteAccount` :
- Met `pseudo` = "[Compte supprimé]"
- Null : bio, avatar, quartier, phone, website, instagram, facebook, role, categorie, metier
- Met `deleted_at` = now()
- Ne supprime PAS la ligne auth (pas de CASCADE) → choix intentionnel de Jenny

### Deux types de XP voisin

**XP normal** (`profiles.xp`) → pour la gloire, niveaux, classement
- Gagné via : streak connexion, posts, réactions, défis, pépites validées…
- Pas de valeur marchande pour l'instant (récompenses prévues plus tard)

**XP Shop** (`profiles.xp_shop` + `merchant_xp_wallet`) → valeur marchande
- Gagné uniquement quand un commerçant valide une photo reliée à son commerce
- 10 XP Shop par photo acceptée (`linked_status = "accepted"`)
- 100 XP Shop = 5 € de bon d'achat dans la boutique concernée
- Crédité via `addXPShop(userId, merchantId, amount)` dans `chipeur_xp.js`
- Stocké par commerce dans `merchant_xp_wallet` + total dans `profiles.xp_shop`

### Recommandations "Je cherche"
- Un voisin peut recommander un commerce sur un post `post_type = "recherche"`
- 1 seule recommandation par utilisateur par post (UNIQUE constraint)
- Chaque recommandation a ses propres 👍/👎
- Premier à recommander → +5 XP
- Visible sur le profil commerçant (TabMentions + TabDashboard)

### Filtres anti-comptes supprimés
**Ne pas utiliser** `.is("deleted_at", null)` dans les requêtes Supabase si la colonne n'est pas garantie d'exister.  
**Utiliser à la place** : `.neq("pseudo", "[Compte supprimé]")` + filtre JS côté client.

---

## 🔒 À activer plus tard

### Onglet "Mon plan" (profil commerçant)
Actuellement **grisé** pour éviter que les commerçants croient être facturés (affiche 9,90€/mois).  
Pour réactiver dans `chipeur_profil_magasin.jsx` → tableau `tabs` vers ligne 1679 :
```js
// Changer :
{ id: "plan", label: "Mon plan", disabled: true },
// En :
{ id: "plan", label: "Mon plan" },
```

---

## 🚀 Déploiement

- Repo Git → push sur `main` → Vercel déploie automatiquement
- Commande standard : `git add -A && git commit -m "..." && git push`
- Pour aller dans le dossier dans le terminal : `cd chipeur`

---

## 🤝 Comment travailler avec Jenny

### Style de communication
- Jenny écrit en français, souvent en messages courts
- Elle teste en temps réel et rapporte les erreurs textuellement (pas toujours le message exact)
- Elle dit "nickel" quand ça marche, "ça n'a pas marché" quand ça casse
- Elle peut demander "continue" si la session a été interrompue

### Ce qu'il faut faire
- **Toujours proposer le `git push`** à la fin de chaque modification
- **Toujours donner le SQL complet** quand une table ou colonne est à créer dans Supabase
- **Expliquer brièvement** ce que fait le changement après le code (1-3 phrases max)
- **Être direct** : pas de longues introductions, aller droit au but
- Quand il y a une erreur Supabase silencieuse → ajouter un `console.error` + affichage visible pour Jenny puisse diagnostiquer

### Ce qu'il ne faut pas faire
- Ne pas poser plusieurs questions à la fois
- Ne pas faire de longs pavés d'explication
- Ne pas utiliser `.is("deleted_at", null)` sans vérifier que la colonne existe
- Ne pas créer de nouveaux fichiers sans que Jenny le demande explicitement

### Rappel en début de session
Lire ce fichier + `NOTES.md` avant de commencer à coder.
