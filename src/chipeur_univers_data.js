// ─── THÈMES & MINI DÉFIS — fichier partagé ───────────────────────
// Utilisé par chipeur_profil_voisin_1.jsx (édition)
//          et chipeur_page_voisins.jsx (lecture profil autre voisin)

export const THEMES = [
  {
    id: "style",
    label: "🌱 Style de vie",
    color: "#22c55e",
    defis: [
      { id: "st_animal",      emoji: "🐾", q: "Mon animal de compagnie",                  sugs: ["Un chien", "Un chat", "Pas d'animal", "Plusieurs !"] },
      { id: "st_endroit",     emoji: "📍", q: "Mon endroit préféré à Saint-Dié",           sugs: ["Le marché", "Un café du coin", "La forêt", "Mon canapé"] },
      { id: "st_matin",       emoji: "☀️", q: "Ma routine du matin",                       sugs: ["Café + lecture", "Sport d'abord", "Slow morning", "Levé(e) en vitesse !"] },
      { id: "st_playlist",    emoji: "🎵", q: "Ma playlist du moment",                     sugs: ["R&B / Soul", "Indie / Rock", "Hip-hop", "Classique"] },
      { id: "st_sport",       emoji: "🏃", q: "Mon sport ou activité du dimanche",         sugs: ["Running", "Vélo", "Yoga / méditation", "Marche en forêt"] },
      { id: "st_lecture",     emoji: "📚", q: "Ce que je lis en ce moment",                sugs: ["Un roman", "Un essai", "Des BD / mangas", "Rien pour l'instant"] },
      { id: "st_soir",        emoji: "🌙", q: "Mon rituel du soir",                        sugs: ["Série / film", "Lecture calme", "Balade", "J'improvise !"] },
      { id: "st_deplacement", emoji: "🚗", q: "Comment je me déplace en ville",            sugs: ["À pied", "À vélo", "En voiture", "Transports en commun"] },
    ]
  },
  {
    id: "gastro",
    label: "🍽️ Gastro",
    color: "#f97316",
    defis: [
      { id: "ga_resto",    emoji: "🍕", q: "Mon resto préféré à Saint-Dié",               sugs: ["Un resto local", "Une pizzeria", "Un asiatique", "Je cuisine !"] },
      { id: "ga_plat",     emoji: "🥘", q: "Mon plat du dimanche",                         sugs: ["Un plat de famille", "Recette perso", "Spécialité vosgienne", "On commande !"] },
      { id: "ga_cuisine",  emoji: "🧑‍🍳", q: "Je cuisine plutôt...",                      sugs: ["Sucré", "Salé", "Les deux !", "Je ne cuisine pas"] },
      { id: "ga_marche",   emoji: "🛒", q: "Mon marché ou producteur local préféré",       sugs: ["Le marché couvert", "Un producteur bio", "L'AMAP du quartier", "Le marché hebdo"] },
      { id: "ga_cafe",     emoji: "☕", q: "Mon café ou boulangerie du matin",             sugs: ["Un café local", "La boulangerie du coin", "À la maison", "En chemin"] },
      { id: "ga_apero",    emoji: "🍷", q: "Mon apéro idéal",                              sugs: ["Charcuterie + fromages", "Tapas", "Cocktails maison", "Jus naturels"] },
      { id: "ga_recette",  emoji: "🥗", q: "Ma recette secrète (ou pas)",                 sugs: ["Une quiche maison", "Un plat vosgien", "Mon dessert signature", "Je ne révèle rien !"] },
      { id: "ga_gateau",   emoji: "🍰", q: "Le gâteau que je ramène toujours",             sugs: ["Un gâteau au chocolat", "Une tarte maison", "Des cookies", "Du commerce !"] },
    ]
  },
  {
    id: "mode",
    label: "👗 Mode",
    color: "#a855f7",
    defis: [
      { id: "mo_chine",      emoji: "🛍️", q: "Je chine plutôt...",                        sugs: ["Vide-grenier", "Boutique vintage", "En ligne", "Un peu des deux !"] },
      { id: "mo_style",      emoji: "✨", q: "Mon style en un mot",                        sugs: ["Casual chic", "Street style", "Boho", "Classique"] },
      { id: "mo_pepite",     emoji: "💎", q: "Ma dernière belle trouvaille",               sugs: ["Une veste vintage", "Des sneakers", "Un bijou unique", "Un accessoire parfait"] },
      { id: "mo_piece",      emoji: "👟", q: "La pièce que je ne pourrais pas jeter",     sugs: ["Mon manteau iconique", "Une paire de chaussures", "Un jean parfait", "Un héritage de famille"] },
      { id: "mo_couleur",    emoji: "🎨", q: "Ma couleur signature",                       sugs: ["Noir intemporel", "Tons neutres", "Couleurs vives", "Ça dépend !"] },
      { id: "mo_boutique",   emoji: "🏪", q: "La boutique locale que j'adore",            sugs: ["Boutique de mode locale", "Créateur artisan", "Concept store", "La friperie du coin"] },
      { id: "mo_durable",    emoji: "♻️", q: "Mon rapport à la mode durable",             sugs: ["Je privilégie le seconde main", "Je répare avant de jeter", "J'achète moins mais mieux", "J'apprends"] },
      { id: "mo_accessoire", emoji: "🧣", q: "L'accessoire que je porte toujours",        sugs: ["Une montre", "Des bijoux", "Un sac iconique", "Ma casquette / chapeau"] },
    ]
  },
  {
    id: "local",
    label: "📍 Ancrage local",
    color: "#ef4444",
    defis: [
      { id: "lo_coin",       emoji: "🤫", q: "Mon coin secret dans la ville",              sugs: ["Un parc caché", "Une ruelle tranquille", "Un point de vue", "Le long de la Meurthe"] },
      { id: "lo_commerce",   emoji: "🏪", q: "Le commerce qui me manquerait le plus",      sugs: ["La boulangerie", "La librairie", "L'épicerie de quartier", "Un café local"] },
      { id: "lo_souvenir",   emoji: "💭", q: "Mon souvenir de Saint-Dié",                  sugs: ["Une fête de quartier", "Un événement local", "Une rencontre mémorable", "Un moment en famille"] },
      { id: "lo_nature",     emoji: "🌳", q: "Mon coin nature préféré dans les Vosges",    sugs: ["La forêt vosgienne", "Un lac de montagne", "Les crêtes", "Le long de la Meurthe"] },
      { id: "lo_evenement",  emoji: "🎭", q: "L'événement local que j'attends chaque année", sugs: ["Le Festival de Géographie", "Les marchés de Noël", "Les brocantes", "Les fêtes de quartier"] },
      { id: "lo_quartier",   emoji: "🏘️", q: "Ce que j'aime dans mon quartier",           sugs: ["L'ambiance conviviale", "Les commerces de proximité", "La tranquillité", "Les voisins"] },
      { id: "lo_manque",     emoji: "💡", q: "Ce qui manque selon moi à la ville",         sugs: ["Plus d'animations", "Nouveaux commerces", "Espaces verts", "Vie de quartier active"] },
      { id: "lo_avance",     emoji: "🤝", q: "Un voisin ou commerce à mettre en avant",    sugs: ["Un artisan local", "Une boutique de quartier", "Un voisin serviable", "Une association"] },
    ]
  },
  {
    id: "loisirs",
    label: "🎮 Loisirs",
    color: "#06b6d4",
    defis: [
      { id: "le_film",       emoji: "🎬", q: "Le film qui m'a marqué cette année",         sugs: ["Un film français", "Un blockbuster", "Un documentaire", "Une série"] },
      { id: "le_jeu",        emoji: "🎮", q: "Mon jeu ou appli du moment",                 sugs: ["Un jeu vidéo", "Un jeu de société", "Une appli créative", "Je ne joue pas"] },
      { id: "le_creativite", emoji: "🎨", q: "Ma créativité s'exprime comment",            sugs: ["Dessin / peinture", "Musique", "Écriture", "DIY / cuisine"] },
      { id: "le_voyage",     emoji: "🌍", q: "Mon dernier voyage ou coup de cœur",         sugs: ["Une ville française", "Un pays étranger", "Les Vosges", "Un road-trip"] },
      { id: "le_photo",      emoji: "📸", q: "Ce que je photographie souvent",             sugs: ["La nature", "L'architecture", "La nourriture", "Les gens / moments"] },
      { id: "le_artiste",    emoji: "🎤", q: "L'artiste que j'écoute en boucle",           sugs: ["Un artiste français", "Un groupe international", "Du jazz / soul", "Je varie !"] },
      { id: "le_livre",      emoji: "📖", q: "Mon livre de chevet actuel",                 sugs: ["Un roman", "Un essai", "Un manga / BD", "Je n'en ai pas en ce moment"] },
      { id: "le_hobby",      emoji: "🏆", q: "Mon hobby caché",                            sugs: ["La cuisine créative", "La collection", "Le jardinage", "Quelque chose d'inattendu !"] },
    ]
  },
  {
    id: "valeurs",
    label: "💚 Valeurs",
    color: "#10b981",
    defis: [
      { id: "va_ecolo",       emoji: "♻️", q: "Mon geste écolo du quotidien",              sugs: ["Tri des déchets", "Vélo ou marche", "Consommation locale", "Achats seconde main"] },
      { id: "va_cause",       emoji: "🤲", q: "Une cause qui me tient à cœur",             sugs: ["L'environnement", "La solidarité locale", "L'éducation", "Les droits humains"] },
      { id: "va_croyance",    emoji: "💬", q: "Ce en quoi je crois vraiment",              sugs: ["La force du collectif", "Le respect de la nature", "La bienveillance", "Le pouvoir du local"] },
      { id: "va_changement",  emoji: "🌱", q: "Un changement que j'ai fait récemment",     sugs: ["Moins de plastique", "Plus de local", "Ralentir", "M'engager bénévolement"] },
      { id: "va_communaute",  emoji: "🙌", q: "Ce que j'aime dans ma communauté",          sugs: ["L'entraide", "Les échanges locaux", "La diversité", "Les projets collectifs"] },
    ]
  },
];

// Tableau plat de tous les défis (pour state + recherche par id)
export const miniDefisAll = THEMES.flatMap(t =>
  t.defis.map(d => ({ ...d, theme: t.id }))
);
