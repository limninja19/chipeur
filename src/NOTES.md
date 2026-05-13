# Notes Chipeur — À faire / À activer

## 🔒 Onglet "Mon plan" grisé
Dans `chipeur_profil_magasin.jsx`, l'onglet "Mon plan" est désactivé pour éviter que les commerçants croient être facturés (le 9,90€ visible).

**Pour le réactiver quand le plan sera prêt :**
Trouver la ligne dans le tableau `tabs` (vers ligne 1679) :
```js
{ id: "plan", label: "Mon plan", disabled: true },
```
Et retirer `disabled: true` :
```js
{ id: "plan", label: "Mon plan" },
```

---

## 🗄️ Tables Supabase créées manuellement
- `post_recommendations` — recommandations de commerces sur les posts "Je cherche"
- `recommendation_votes` — votes 👍/👎 sur chaque recommandation
- Politiques RLS ajoutées pour les deux tables

---

## 📌 À faire plus tard
- Activer la suppression de compte côté auth (actuellement soft-delete uniquement)
- Activer le plan commerçant et la facturation
