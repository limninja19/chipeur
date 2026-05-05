// ─── THÈMES & MINI DÉFIS — fichier partagé ───────────────────────
// Utilisé par chipeur_profil_voisin_1.jsx (édition)
//          et chipeur_page_voisins.jsx (lecture profil autre voisin)

export const THEMES = [
  {
    id: "lifestyle", label: "🌿 Lifestyle", color: "#4CAF50",
    defis: [
      { id: "ls_animal",   emoji: "🐾", q: "Mon animal de compagnie",       sugs: ["Un chien", "Un chat", "Pas d'animal", "Plusieurs !"] },
      { id: "ls_endroit",  emoji: "📍", q: "Mon endroit préféré",            sugs: ["Le marché", "Un café du coin", "La forêt", "Mon canapé"] },
      { id: "ls_routine",  emoji: "☀️", q: "Ma routine du matin",            sugs: ["Café + lecture", "Sport d'abord", "Slow morning", "Levé(e) en vitesse !"] },
      { id: "ls_playlist", emoji: "🎵", q: "Ma playlist du moment",          sugs: ["R&B / Soul", "Indie / Rock", "Hip-hop", "Classique"] },
      { id: "ls_weekend",  emoji: "🏡", q: "Mon week-end idéal",             sugs: ["Sortie en nature", "Restau entre amis", "Marché + flânerie", "Cinéma / jeux"] },
      { id: "ls_citation", emoji: "💬", q: "Ma citation du moment",          sugs: ["Un proverbe", "Une phrase d'auteur", "Parole de chanson", "La mienne !"] },
    ]
  },
  {
    id: "gastro", label: "🍽️ Gastro", color: "#FF7043",
    defis: [
      { id: "ga_resto",   emoji: "🍽️", q: "Mon resto préféré",              sugs: ["Un resto local", "Un kebab", "Je cuisine !", "Livraison only"] },
      { id: "ga_plat",    emoji: "🍳", q: "Mon plat signature",              sugs: ["Un plat de famille", "Recette perso", "Spécialité locale", "Je m'améliore !"] },
      { id: "ga_cafe",    emoji: "☕", q: "Mon café du coin",                sugs: ["Un café local", "La boulangerie", "Le marché couvert", "À la maison"] },
      { id: "ga_marche",  emoji: "🧺", q: "Mon indispensable au marché",    sugs: ["Fruits & légumes", "Les fromages", "La boucherie", "Les fleurs"] },
      { id: "ga_douceur", emoji: "🍰", q: "Ma douceur préférée",            sugs: ["Gâteau maison", "Pâtisserie locale", "Carré de choco", "Les glaces !"] },
      { id: "ga_boisson", emoji: "🥂", q: "Ma boisson du moment",           sugs: ["Café le matin", "Infusion détente", "En terrasse", "Jus fait maison"] },
    ]
  },
  {
    id: "mode", label: "👗 Mode", color: "#9C27B0",
    defis: [
      { id: "mo_pepite",     emoji: "✨", q: "Ma pépite mode du mois",      sugs: ["Une veste vintage", "Des sneakers", "Un accessoire", "Une collab locale"] },
      { id: "mo_boutique",   emoji: "🏪", q: "Ma boutique chouchoute",       sugs: ["Boutique locale", "Vintage / frip", "En ligne", "Les marchés"] },
      { id: "mo_style",      emoji: "👑", q: "Mon style en un mot",          sugs: ["Casual chic", "Street style", "Boho", "Classique"] },
      { id: "mo_accessoire", emoji: "👜", q: "Mon accessoire fétiche",       sugs: ["Un sac iconique", "Des bijoux", "Une casquette", "Des lunettes"] },
      { id: "mo_inspi",      emoji: "🌟", q: "Mon inspo mode",               sugs: ["Les réseaux", "Gens dans la rue", "Les magazines", "Mon instinct !"] },
      { id: "mo_saison",     emoji: "🍂", q: "Ma tenue de saison",           sugs: ["Oversize + boots", "Robe + veste", "Jean + pull", "Je crée mon look"] },
    ]
  },
  {
    id: "local", label: "🏙️ Saint-Dié", color: "#1565C0",
    defis: [
      { id: "lo_coin",     emoji: "🗺️", q: "Mon coin secret de la ville",  sugs: ["Un parc caché", "Une ruelle tranquille", "Un point de vue", "Le long de la Meurthe"] },
      { id: "lo_commerce", emoji: "🏪", q: "Mon commerce favori",           sugs: ["Boutique locale", "L'épicerie", "La librairie", "Le marché"] },
      { id: "lo_balade",   emoji: "🚶", q: "Ma balade préférée",            sugs: ["Le long des Vosges", "Centre-ville", "La forêt", "Le long de la rivière"] },
      { id: "lo_souvenir", emoji: "📸", q: "Mon meilleur souvenir local",   sugs: ["Une fête de quartier", "Un événement", "Une rencontre", "Un moment spécial"] },
      { id: "lo_fierte",   emoji: "⭐", q: "Ma fierté locale",              sugs: ["La gastronomie", "Les gens du coin", "La nature", "La culture"] },
      { id: "lo_futur",    emoji: "🔮", q: "Mon rêve pour Saint-Dié",       sugs: ["Plus d'animations", "Nouveaux commerces", "Espaces verts", "Vie de quartier"] },
    ]
  },
];

// Tableau plat de tous les défis (pour state + recherche par id)
export const miniDefisAll = THEMES.flatMap(t =>
  t.defis.map(d => ({ ...d, theme: t.id }))
);
