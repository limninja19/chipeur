/**
 * Script : inserer_photos_atelier_mona.js
 * Lance depuis le dossier chipeur : node inserer_photos_atelier_mona.js
 * Installe d'abord si besoin : npm install @supabase/supabase-js
 */

// Pas de dépendance — utilise fetch natif de Node 18+
// Les clés sont lues depuis les variables d'environnement (fichier .env.local)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("❌ Variables d'environnement manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises.");
  process.exit(1);
}

const HEADERS = {
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
};

async function query(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: HEADERS,
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${txt}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── 40 photos Unsplash : mode, rue, magasin, chez soi ─────────────────────
const PHOTOS = [
  // Mode / rue
  { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=750&fit=crop", desc: "Nouvelle tenue trouvée chez Atelier Mona 🛍️ Trop contente de ce look !", pseudo: "Léa" },
  { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop", desc: "Look du jour signé Atelier Mona ✨ #ModeSaintDié", pseudo: "Clara" },
  { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop", desc: "Shopping matinal à l'Atelier, coup de cœur total 💛", pseudo: "Sophie" },
  { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop", desc: "Ce manteau je ne pouvais pas le laisser là-bas 😍", pseudo: "Inès" },
  { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop", desc: "Sortie shopping avec ma sœur, on a trouvé des pépites !", pseudo: "Marine" },
  { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop", desc: "Ma nouvelle robe pour les beaux jours ☀️ #AtélierMona", pseudo: "Julie" },
  { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=750&fit=crop", desc: "Tenue 100% locale, fière de mon look du weekend 🌿", pseudo: "Emma" },
  { url: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=750&fit=crop", desc: "Le sourire quand tu trouves exactement ce que tu cherchais 😊", pseudo: "Camille" },
  { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop", desc: "Journée mode à Saint-Dié 🏡 #Local #Chipeur", pseudo: "Lucie" },
  { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop", desc: "Ce top à pois c'est ma nouvelle obsession 🖤", pseudo: "Anaïs" },
  // En magasin
  { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b3?w=600&h=750&fit=crop", desc: "Dans la boutique, trop dur de choisir ! Finalement j'ai tout pris 😂", pseudo: "Manon" },
  { url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=750&fit=crop", desc: "L'essayage du samedi matin chez Mona 🛍️ Must do !", pseudo: "Chloé" },
  { url: "https://images.unsplash.com/photo-1524504388515-6a7b69a4b7b7?w=600&h=750&fit=crop", desc: "Ambiance cocooning dans la boutique, j'adore l'atmosphère !", pseudo: "Sarah" },
  { url: "https://images.unsplash.com/photo-1613677135043-a2512fbf49fa?w=600&h=750&fit=crop", desc: "Le rayon accessoires m'a ruinée mais j'assume 💅", pseudo: "Alice" },
  { url: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=750&fit=crop", desc: "Nouvelle pièce pour ma garde-robe ✂️ Qualité irréprochable", pseudo: "Laura" },
  { url: "https://images.unsplash.com/photo-1571867424488-4565932edb41?w=600&h=750&fit=crop", desc: "Défi Atelier Mona relevé ! Ma tenue préférée du mois 🏆", pseudo: "Nina" },
  { url: "https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=600&h=750&fit=crop", desc: "Selfie cabine d'essayage chez Mona 📸 Trop craquante cette robe", pseudo: "Jade" },
  { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop", desc: "Look professionnel chic, parfait pour le bureau ! 💼", pseudo: "Céline" },
  { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=750&fit=crop", desc: "Je suis venue pour regarder et je repars avec 3 sacs 😅", pseudo: "Nora" },
  { url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=750&fit=crop", desc: "Coup de cœur absolu pour cette veste en lin ☀️", pseudo: "Lola" },
  // Chez soi / essayage maison
  { url: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=600&h=750&fit=crop", desc: "Unboxing de ma commande Atelier Mona 📦 Tout est parfait !", pseudo: "Eva" },
  { url: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&h=750&fit=crop", desc: "Premier essayage à la maison, validé à 100% ! ✅", pseudo: "Margot" },
  { url: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop", desc: "Ma chambre transformée en cabine d'essayage 😂 #Défi", pseudo: "Zoe" },
  { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop", desc: "La robe de l'été 2026 selon moi 🌸 Merci Atelier Mona !", pseudo: "Pauline" },
  { url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&h=750&fit=crop", desc: "Petite séance photo maison pour partager mon look 📷", pseudo: "Elisa" },
  // Street style / extérieur
  { url: "https://images.unsplash.com/photo-1562572159-4efd90232ece?w=600&h=750&fit=crop", desc: "Balade dans Saint-Dié avec mon nouveau look ☀️ #Chipeur", pseudo: "Rose" },
  { url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=750&fit=crop", desc: "Journée ensoleillée, tenue légère de chez Mona 🌿", pseudo: "Iris" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop", desc: "Portrait avec ma nouvelle tenue dans les Vosges 🏔️", pseudo: "Ambre" },
  { url: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=600&h=750&fit=crop", desc: "Style décontracté pour ce dimanche en famille 💛", pseudo: "Lou" },
  { url: "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&h=750&fit=crop", desc: "Look automne-hiver, je suis prête pour la saison froide ! 🍂", pseudo: "Mathilde" },
  { url: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600&h=750&fit=crop", desc: "Quand ta tenue fait des jaloux dans la rue 😎 #AtélierMona", pseudo: "Violette" },
  { url: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=750&fit=crop", desc: "Coup de soleil, look d'été 🌞 Robe trouvée chez Mona !", pseudo: "Suzanne" },
  { url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop", desc: "Vibe citadine avec mes nouvelles pièces locales 🏙️", pseudo: "Fanny" },
  { url: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=600&h=750&fit=crop", desc: "Ce sourire quand on porte quelque chose qui nous ressemble ❤️", pseudo: "Estelle" },
  { url: "https://images.unsplash.com/photo-1469460340997-2f854421e72f?w=600&h=750&fit=crop", desc: "Minimaliste mais stylée, merci Atelier Mona 🖤", pseudo: "Diane" },
  { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop", desc: "Weekend look parfait pour une sortie dans les Vosges 🌲", pseudo: "Nathalie" },
  { url: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&h=750&fit=crop", desc: "Ma sœur m'a emmenée là-bas et on est ressorties avec plein de sacs 😂", pseudo: "Coralie" },
  { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop", desc: "Mon look préféré de la saison, trouvé dans notre belle boutique locale ✨", pseudo: "Aurélie" },
  { url: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=600&h=750&fit=crop", desc: "Merci Atelier Mona pour ce pull tout doux 🧡 parfait pour l'automne", pseudo: "Gabrielle" },
  { url: "https://images.unsplash.com/photo-1506956191951-7a88da4435e5?w=600&h=750&fit=crop", desc: "J'ai relevé le défi ! Ma pièce coup de cœur de ce mois 🏆✨", pseudo: "Hélène" },
];

async function main() {
  console.log("🔍 Recherche du défi Atelier Mona...");

  // 1. Trouver le défi Atelier Mona
  let defis;
  try {
    defis = await query('defis?select=id,title,merchant_name&or=(merchant_name.ilike.*mona*,title.ilike.*mona*)');
  } catch(e) {
    console.error("❌ Erreur chargement défis:", e.message);
    // Afficher tous les défis pour aider
    try {
      const all = await query('defis?select=id,title,merchant_name');
      console.log("📋 Défis existants:", JSON.stringify(all, null, 2));
    } catch(_) {}
    process.exit(1);
  }

  if (!defis || defis.length === 0) {
    console.error("❌ Aucun défi Atelier Mona trouvé.");
    const all = await query('defis?select=id,title,merchant_name');
    console.log("📋 Défis existants:", JSON.stringify(all, null, 2));
    process.exit(1);
  }

  const defi = defis[0];
  console.log(`✅ Défi trouvé : "${defi.title}" (${defi.merchant_name}) — ID: ${defi.id}`);

  // 2. Trouver des profils existants
  const profiles = await query('profiles?select=id,pseudo&limit=50');
  if (!profiles || profiles.length === 0) {
    console.error("❌ Pas de profils trouvés");
    process.exit(1);
  }
  console.log(`👥 ${profiles.length} profils trouvés`);

  // 3. Insérer les 40 posts
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < PHOTOS.length; i++) {
    const photo = PHOTOS[i];
    const profile = profiles[i % profiles.length];

    const postData = {
      author_id: profile.id,
      content: photo.desc,
      image_url: photo.url,
      post_type: "decouverte",
      defi_id: defi.id,
      location: "Saint-Dié-des-Vosges",
      tags: ["#AtélierMona", "#Défi", "#ModeSaintDié"],
      created_at: new Date(Date.now() - (PHOTOS.length - i) * 3 * 60 * 60 * 1000).toISOString(),
    };

    try {
      await query('posts', {
        method: "POST",
        body: JSON.stringify(postData),
      });
      console.log(`  ✅ Photo ${i + 1}/40 insérée (auteur: ${profile.pseudo})`);
      inserted++;
    } catch(e) {
      console.warn(`  ⚠️  Photo ${i + 1} échouée (${profile.pseudo}) : ${e.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Terminé ! ${inserted} photos insérées, ${failed} échecs.`);
}

main().catch(console.error);
