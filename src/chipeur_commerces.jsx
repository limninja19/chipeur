import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { addXP, addXPShop } from "./chipeur_xp";
import Avatar from "./Avatar";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

// ─── DONNÉES STATIQUES (modèle de démonstration uniquement) ───
const STATIC_COMMERCES = [];

// ─── THÈMES & SOUS-CATÉGORIES ───
const THEMES = [
  { key: "Tous",          emoji: "🛍️", match: [], short: "Tous" },
  { key: "Mode",          emoji: "👗", match: ["mode","prêt-à-porter","vêtement","chaussure","accessoire","lingerie"], short: "Mode" },
  { key: "Beauté",        emoji: "💄", match: ["beauté","bien-être","coiffure","esthétique","massage","spa","ongle","tatouage","barbier","nail"], short: "Beauté" },
  { key: "Restauration",  emoji: "🍽️", match: ["restauration","ambiance","traiteur","resto","café","boulangerie","pizza","kebab","bar","pub","brasserie","bistrot","lounge","cocktail","bière","terrasse","snack","sandwicherie","pâtisserie","salon de thé"], short: "Resto" },
  { key: "Alimentation",  emoji: "🧀", match: ["alimentation","épicerie","bio","fromagerie","boucherie","poissonnerie","fruits"], short: "Alim." },
  { key: "Artisan",       emoji: "🎨", match: ["artisan","créateur","bijoux","poterie","couture","bois","cuir","création","photographe","céramiste","relieur"], short: "Artisan" },
  { key: "Maison",        emoji: "🏠", match: ["maison","décoration","mobilier","bricolage","jardinage"], short: "Maison" },
  { key: "Sport",         emoji: "🏃", match: ["sport","loisirs","vélo","outdoor","jeux","fitness","gym","musculation","yoga","pilates","crossfit","salle","natation","danse","arts martiaux","boxe","escalade"], short: "Sport" },
  { key: "Culture",        emoji: "📚", match: ["culture","librairie","papeterie","cadeaux","art","musique"], short: "Culture" },
  { key: "Services",       emoji: "🔧", match: ["services","plomberie","électricité","informatique","pressing"], short: "Services" },
  { key: "Divertissement", emoji: "🎭", match: ["divertissement","cinéma","musée","piscine","théâtre","concert","bowling","escape","karting","médiathèque","bibliothèque","galerie","spectacle","accrobranche","patinoire","parc d'attractions","animation","aqua","laser"], short: "Divert." },
  { key: "Vie locale",     emoji: "🏛️", match: ["vie locale","administratif","mairie","préfecture","caf","cpam","pôle emploi","impôts","tribunal","gendarmerie","école","collège","lycée","université","office de tourisme","service public","maison des services","sécurité sociale","association","associatif","comité des fêtes","collectif","amicale","bénévole"], short: "Vie loc." },
  { key: "Autre",          emoji: "✨", match: [], short: "Autre", isAutre: true },
];

// Pour compat avec l'ancien code
const CATEGORIES = THEMES;

// ─── TUILES DE NAVIGATION PAR SECTION ───
const SECTION_TILES = [
  { key: "commerces",      emoji: "🏪", label: "Commerces",         desc: "Mode, Maison, Services…",        bg: "#FF5733" },
  { key: "beaute",         emoji: "💄", label: "Beauté & Bien-être", desc: "Coiffure, Spa, Esthétique",      bg: "#C2185B" },
  { key: "restauration",   emoji: "🍽️", label: "Resto & Ambiance",   desc: "Bar, Café, Boulangerie, Resto",  bg: "#E65100" },
  { key: "artisan",        emoji: "🎨", label: "Artisans",           desc: "Bijoux, Poterie, Créateurs",     bg: "#4527A0" },
  { key: "divertissement", emoji: "🎭", label: "Divertissement",     desc: "Cinéma, Piscine, Musée, Bowling",bg: "#1565C0" },
  { key: "vie_locale",     emoji: "🏛️", label: "Vie locale",         desc: "Mairie, CAF, École, Office…",   bg: "#2E7D32" },
  { key: "all",            emoji: "✨", label: "Tout voir",          desc: "Tous les membres",               bg: "#37474F" },
];

const SECTION_LABELS = {
  commerces:      { emoji: "🏪", label: "Commerces" },
  beaute:         { emoji: "💄", label: "Beauté & Bien-être" },
  restauration:   { emoji: "🍽️", label: "Resto & Ambiance" },
  artisan:        { emoji: "🎨", label: "Artisans & Créateurs" },
  divertissement: { emoji: "🎭", label: "Divertissement" },
  vie_locale:     { emoji: "🏛️", label: "Vie locale" },
  all:            { emoji: "✨", label: "Tous les membres" },
  nouveaux:       { emoji: "🆕", label: "Nouveaux membres" },
};

function matchesTheme(commerce, themeKey) {
  if (themeKey === "Tous") return true;
  const theme = THEMES.find(t => t.key === themeKey);
  if (!theme) return false;
  const haystack = [commerce.categorie, commerce.category, commerce.metier].filter(Boolean).join(" ").toLowerCase();
  if (theme.isAutre) {
    // "Autre" = ne correspond à aucun thème principal
    return !THEMES.filter(t => t.key !== "Tous" && !t.isAutre).some(t =>
      t.match.some(m => haystack.includes(m))
    );
  }
  return theme.match.some(m => haystack.includes(m));
}

function catEmoji(cat) {
  const found = CATEGORIES.find(c => c.key === cat);
  return found ? found.emoji : "🏪";
}

// ─── COVER PAR DÉFAUT PAR THÈME ───
const THEME_COVERS = {
  "Mode":          { grad: "#C471ED", emoji: "👗" },
  "Beauté":        { grad: "#FFAFBD", emoji: "💄" },
  "Restauration":  { grad: "#F7971E", emoji: "🍽️" },
  "Alimentation":  { grad: "#56AB2F", emoji: "🧀" },
  "Artisan":       { grad: "#2C5364", emoji: "🎨" },
  "Maison":        { grad: "#5D8A6B", emoji: "🏠" },
  "Sport":         { grad: "#1565C0", emoji: "🏃" },
  "Culture":       { grad: "#4A148C", emoji: "📚" },
  "Services":      { grad: "#37474F", emoji: "🔧" },
  "Autre":         { grad: "#C9A96E", emoji: "✨" },
  "default":       { grad: "#FF5733", emoji: "🏪" },
};

function getThemeCover(commerce) {
  const h = [commerce.categorie, commerce.category].filter(Boolean).join(" ").toLowerCase();
  for (const t of THEMES) {
    if (t.key === "Tous") continue;
    if (t.isAutre) continue;
    if (t.match.some(m => h.includes(m))) return THEME_COVERS[t.key] || THEME_COVERS.default;
  }
  // Si la cat correspond exactement à une clé
  const directKey = Object.keys(THEME_COVERS).find(k => h.includes(k.toLowerCase()));
  return THEME_COVERS[directKey] || THEME_COVERS.default;
}

function CoverImage({ src, commerce, height = 140, style = {} }) {
  if (src) {
    return <img src={src} alt={commerce?.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />;
  }
  const tc = getThemeCover(commerce || {});
  return (
    <div style={{ width: "100%", height: "100%", background: tc.grad, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <span style={{ fontSize: 52, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.18))" }}>{tc.emoji}</span>
    </div>
  );
}

function catLabel(cat) {
  if (!cat) return "Commerce";
  // Raccourcir pour l'affichage dans les cards
  return cat
    .replace(" & Prêt-à-porter", "")
    .replace(" & Bien-être", "")
    .replace(" & Traiteur", "")
    .replace(" & Alimentation", "")
    .replace(" & Loisirs", "")
    .replace(" & Maison", "")
    .replace(" de proximité", "");
}

// ─── CONVERTIR UN PROFIL SUPABASE EN COMMERCE ───
function profileToCommerce(p, postCount) {
  const cat = p.categorie || "Commerce";
  const metier = p.metier || catLabel(cat);
  const emoji = catEmoji(cat);
  return {
    id: p.id,
    category: cat,
    categorie: cat,
    metier,
    name: p.pseudo || "Commerce",
    cat: `${metier} · ${p.quartier || "Saint-Dié"}`,
    shortCat: `${emoji} ${metier} · ${p.quartier || "Saint-Dié"}`,
    desc: p.bio || "",
    shortDesc: p.bio ? p.bio.substring(0, 80) + (p.bio.length > 80 ? "…" : "") : "",
    cover: p.avatar_url || p.cover_url || (p.photo_urls && p.photo_urls[0]) || null,
    gallery: p.photo_urls || [],
    open_now: (() => {
      // 1. Priorité : periods Google (temps réel, jamais figé)
      const fromPeriods = computeOpenNowFromPeriods(p.current_opening_hours?.periods);
      if (fromPeriods !== null) return fromPeriods;
      // 2. Fallback : horaires manuels
      const fromHoraires = computeOpenNow(p.horaires);
      if (fromHoraires !== null) return fromHoraires;
      // 3. Rien de disponible → badge masqué
      return null;
    })(),
    vues: "—", int: "—",
    posts: postCount != null ? String(postCount) : "—",
    plan: p.plan || "premium",
    planBg: C.pill,
    planColor: C.ink2,
    vitrine_filtres: p.vitrine_filtres || [],
    tag: `#${cat}`,
    phone: p.phone || null,
    adresse: p.quartier || null,
    website: p.website || null,
    instagram: p.instagram || null,
    facebook: p.facebook || null,
    hours: Array.isArray(p.horaires) ? p.horaires.filter(h => h.h) : [],
    products: [],
    created_at: p.created_at || null,
    role: p.role || null,
    lieu_type: p.lieu_type || null,
  };
}

// ─── VITRINE DÉMO ───
const DEMO_COMMERCE = {
  id: "__demo__", isDemo: true,
  name: "La Petite Boutique",
  category: "Mode & Prêt-à-porter", categorie: "Mode & Prêt-à-porter",
  metier: "Boutique de mode, Accessoires, Prêt-à-porter femme",
  cat: "Boutique de mode · Saint-Dié-des-Vosges",
  shortCat: "👗 Boutique de mode · Saint-Dié",
  desc: "Une boutique de mode indépendante au cœur de Saint-Dié, spécialisée dans les créations locales et les pièces uniques. Nous aimons les matières nobles, les coupes intemporelles et les couleurs qui font du bien.",
  shortDesc: "Mode indépendante au cœur de Saint-Dié — créations locales et pièces uniques.",
  cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
  gallery: [], vues: "284", int: "47", posts: "5",
  plan: "premium", planBg: "rgba(255,87,51,0.12)", planColor: "#FF5733", tag: "#Mode",
  vitrine_filtres: ["Robes", "Pulls", "Accessoires", "Soldes", "Nouveautés"],
  phone: "03 29 56 78 90", adresse: "12 rue Thiers, Saint-Dié-des-Vosges",
  website: "https://lapetiteboutique.fr", instagram: "@lapetiteboutique_saintdie", facebook: "La Petite Boutique",
  hours: [
    { j: "Lundi", h: "Fermé" }, { j: "Mardi–Vendredi", h: "10h–19h" },
    { j: "Samedi", h: "10h–18h30" }, { j: "Dimanche", h: "Fermé" },
  ],
  products: [],
};

const DEMO_POSTS = [
  { id: "demo-1", author_id: "__demo__", magasin_id: "__demo__", content: "Nouvelle collection printemps-été 🌸 Des couleurs douces, des matières légères… On adore !", image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&fit=crop", post_type: "normal", created_at: new Date(Date.now() - 2*86400000).toISOString(), profiles: { pseudo: "La Petite Boutique", avatar_url: null }, tags: ["collection","printemps","mode"] },
  { id: "demo-2", author_id: "__demo__", magasin_id: "__demo__", content: "Focus sur nos accessoires de saison 🌼 Sacs, bijoux, foulards — tout est fait main !", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&fit=crop", post_type: "normal", product_label: "Montre dorée artisanale", product_price: "89€", product_detail: "Fabriquée par un artisan local des Vosges", created_at: new Date(Date.now() - 5*86400000).toISOString(), profiles: { pseudo: "La Petite Boutique", avatar_url: null }, tags: ["accessoires","artisanat"] },
  { id: "demo-3", author_id: "__demo__", magasin_id: "__demo__", content: "🎁 PROMO SPÉCIALE — 20% sur toute la collection hiver jusqu'à samedi ! À venir vite 😍", image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&fit=crop", post_type: "bonplan", created_at: new Date(Date.now() - 7*86400000).toISOString(), profiles: { pseudo: "La Petite Boutique", avatar_url: null }, tags: ["promo","soldes"] },
  { id: "demo-4", author_id: "voisin-demo", magasin_id: "__demo__", content: "J'ai trouvé ma robe de soirée ici, le service est top et les conseils vraiment personnalisés ❤️", image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&fit=crop", post_type: "normal", created_at: new Date(Date.now() - 10*86400000).toISOString(), profiles: { pseudo: "Marie_saintdie", avatar_url: null }, tags: ["avis","robe"] },
  { id: "demo-5", author_id: "__demo__", magasin_id: "__demo__", content: "Bienvenue dans notre boutique ! Voici un aperçu de notre espace ✨", image_url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&fit=crop", post_type: "normal", created_at: new Date(Date.now() - 14*86400000).toISOString(), profiles: { pseudo: "La Petite Boutique", avatar_url: null }, tags: ["boutique","bienvenue"] },
];

const DEMO_DEFIS = [
  { id: "demo-defi-1", user_id: "__demo__", title: "Montre ton look avec nos créations !", description: "Poste une photo de toi habillé·e avec une pièce de notre boutique et tente de gagner un bon d'achat de 50€ !", emoji: "👗", reward: "Bon d'achat 50€", ends_at: new Date(Date.now() + 14*86400000).toISOString(), ended: false, winner_post_id: null, photo_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&fit=crop" },
  { id: "demo-defi-2", user_id: "__demo__", title: "Plus belle déco de Noël 🎄", description: "Quelle est la plus belle déco de Noël de notre vitrine selon vous ?", emoji: "🎄", reward: "Panier garni", ends_at: new Date(Date.now() - 30*86400000).toISOString(), ended: true, winner_post_id: "demo-winner", photo_url: null },
];

// ─── LIGHTBOX SWIPEABLE PHOTOS BOUTIQUES ───
function ShopPhotosLightbox({ photos, merchants, startIndex = 0, onOpenShop, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef(null);

  const photo = photos[index];
  const shop = photo ? merchants.find(m => m.id === photo.author_id || m.id === photo.magasin_id) : null;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(photos.length - 1, i + 1));

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", display: "flex", flexDirection: "column" }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx > 60) prev();
        else if (dx < -60) next();
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", flexShrink: 0, zIndex: 10 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>
          {index + 1} / {photos.length}
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Photo */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {photo?.image_url && (
          <img
            src={photo.image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        )}

        {/* Flèches navigation */}
        {index > 0 && (
          <button onClick={prev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>‹</button>
        )}
        {index < photos.length - 1 && (
          <button onClick={next} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>›</button>
        )}

        {/* Dots */}
        {photos.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={() => setIndex(i)} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i === index ? C.accent : "rgba(255,255,255,0.35)", transition: "all 0.2s", cursor: "pointer" }} />
            ))}
          </div>
        )}
      </div>

      {/* Fiche boutique en bas */}
      {shop && (
        <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "16px 18px 36px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {/* Avatar / cover shop */}
            <div style={{ width: 46, height: 46, borderRadius: 12, overflow: "hidden", background: C.pill, flexShrink: 0 }}>
              <CoverImage src={shop.cover} commerce={shop} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>{shop.name}</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>{shop.metier || shop.category || "Commerce local"}</div>
            </div>
            {photo?.content && (
              <div style={{ fontSize: 10, color: C.ink2, maxWidth: 90, textAlign: "right", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{photo.content}</div>
            )}
          </div>

          <button
            onClick={() => { onOpenShop(shop); onClose(); }}
            style={{ width: "100%", background: C.pro, color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontFamily: syne, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Voir la boutique {shop.name} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── BANDEAU PHOTOS RÉCENTES DES BOUTIQUES ───
const PREVIEW_COUNT = 5;

function RecentShopPhotos({ onOpenShop, merchants }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!merchants || merchants.length === 0) return;
    const merchantIds = merchants.map(m => m.id);
    // Deux requêtes séparées :
    // 1. Posts publiés par le commerçant lui-même (toujours visibles)
    // 2. Posts voisins liés → uniquement ceux acceptés (linked_status = "accepted")
    Promise.all([
      supabase.from("posts")
        .select("id, image_url, content, author_id, created_at, magasin_id")
        .not("image_url", "is", null)
        .in("author_id", merchantIds)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase.from("posts")
        .select("id, image_url, content, author_id, created_at, magasin_id")
        .not("image_url", "is", null)
        .in("magasin_id", merchantIds)
        .not("author_id", "in", `(${merchantIds.join(",")})`)
        .eq("linked_status", "accepted")
        .order("created_at", { ascending: false })
        .limit(40),
    ]).then(([ownRes, linkedRes]) => {
      const own    = (ownRes.data    || []);
      const linked = (linkedRes.data || []);
      const merged = [...own, ...linked].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 60);
      setPhotos(merged);
      setLoading(false);
    });
  }, [merchants.length]);

  if (loading || photos.length === 0) return null;

  const preview = photos.slice(0, PREVIEW_COUNT);
  const remaining = photos.length - PREVIEW_COUNT;

  return (
    <>
      {lightboxIndex !== null && (
        <ShopPhotosLightbox
          photos={photos}
          merchants={merchants}
          startIndex={lightboxIndex}
          onOpenShop={onOpenShop}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div style={{ padding: "0 0 4px", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 16px" }}>
          📸 Dernières photos des boutiques
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none" }}>
          {preview.map((photo, i) => {
            const shop = merchants.find(m => m.id === photo.author_id || m.id === photo.magasin_id);
            if (!shop) return null;
            return (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                style={{ flexShrink: 0, width: 130, borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative", background: C.pill, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
              >
                <img src={photo.image_url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(26,23,20,0.8) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 11, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{shop.metier || shop.category}</div>
                </div>
              </div>
            );
          })}

          {/* Tuile "+ voir toutes" → ouvre le lightbox à la suite */}
          {remaining > 0 && (
            <div
              onClick={() => setLightboxIndex(PREVIEW_COUNT)}
              style={{ flexShrink: 0, width: 130, height: 130, borderRadius: 16, cursor: "pointer", background: "#FF5733", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
            >
              <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 28, color: "#fff" }}>+{remaining}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.3 }}>Voir toutes<br />les photos</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── CHIPS FILTRE CATÉGORIES (remplace le dropdown) ───
function CategoryChips({ active, onToggle }) {
  const isAll = active.size === 0 || (active.size === 1 && active.has("Tous"));
  return (
    <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 14px 10px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
      {THEMES.map(t => {
        const isOn = t.key === "Tous" ? isAll : active.has(t.key);
        return (
          <button
            key={t.key}
            onClick={() => onToggle(t.key)}
            style={{
              flexShrink: 0,
              fontSize: 12, fontWeight: 600,
              padding: "7px 14px", borderRadius: 20,
              border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: isOn ? C.ink : C.pill,
              color: isOn ? "#fff" : C.ink2,
              fontFamily: dm, transition: "background 0.15s, color 0.15s",
            }}
          >
            {t.emoji} {t.short}
          </button>
        );
      })}
    </div>
  );
}

// ─── CARTE GRILLE COMMERCE (2 colonnes) ───
function ComGridCard({ com, onClick }) {
  const themeEmoji = (() => {
    const h = [com.categorie, com.category, com.metier].filter(Boolean).join(" ").toLowerCase();
    for (const t of THEMES) {
      if (t.key === "Tous" || t.isAutre) continue;
      if (t.match.some(m => h.includes(m))) return t.emoji;
    }
    return "🏪";
  })();

  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${C.border}`, cursor: "pointer",
        boxShadow: "0 2px 8px rgba(26,23,20,0.06)",
      }}
    >
      {/* Cover */}
      <div style={{ position: "relative", width: "100%", height: 100, overflow: "hidden" }}>
        <CoverImage src={com.cover} commerce={com} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(26,23,20,0.68))" }} />
        {/* Emoji badge */}
        <div style={{ position: "absolute", top: 7, right: 7, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "3px 7px", fontSize: 13 }}>
          {themeEmoji}
        </div>
        {/* Badge Ouvert / Fermé + compteur photos (colonne en haut à gauche) */}
        <div style={{ position: "absolute", top: 7, left: 7, display: "flex", flexDirection: "column", gap: 4 }}>
          {com.open_now !== null && com.open_now !== undefined && (
            <div style={{ background: com.open_now ? "#22C55E" : "#EF4444", borderRadius: 7, padding: "2px 7px", display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: com.open_now ? 1 : 0.7 }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{com.open_now ? "Ouvert" : "Fermé"}</span>
            </div>
          )}
          {com.posts !== "—" && (
            <div style={{ background: "rgba(0,0,0,0.48)", borderRadius: 8, padding: "2px 7px", fontSize: 9, color: "#fff", fontFamily: dm, fontWeight: 600, alignSelf: "flex-start" }}>
              📸 {com.posts}
            </div>
          )}
        </div>
        {/* Nom en overlay bas */}
        <div style={{ position: "absolute", bottom: 7, left: 8, right: 8 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {com.name}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 10, color: C.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {catLabel(com.categorie || com.category || "Commerce")}
        </div>
        {com.adresse && (
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📍 {com.adresse}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CARD STRIP (carte horizontale pour les sections) ───
function StripCard({ com, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0, width: 150, borderRadius: 16, overflow: "hidden",
        cursor: "pointer", background: C.card, border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(26,23,20,0.06)",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: 100, overflow: "hidden" }}>
        <CoverImage src={com.cover} commerce={com} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(26,23,20,0.72))" }} />
        {com.open_now !== null && com.open_now !== undefined && (
          <div style={{ position: "absolute", top: 6, left: 6, background: com.open_now ? "#22C55E" : "#EF4444", borderRadius: 6, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>{com.open_now ? "Ouvert" : "Fermé"}</span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 6, left: 8, right: 8 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: "#fff", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {com.name}
          </div>
        </div>
      </div>
      <div style={{ padding: "6px 8px 8px" }}>
        <div style={{ fontSize: 10, color: C.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {catLabel(com.categorie || com.category || com.lieu_type || "Établissement")}
        </div>
        {com.adresse && (
          <div style={{ fontSize: 9, color: C.ink2, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📍 {com.adresse}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EN-TÊTE DE SECTION ───
function SectionHeader({ emoji, title, count, accent }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: accent || C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, padding: "0 16px" }}>
      {emoji} {title}
      <div style={{ flex: 1, height: 1, background: accent ? `${accent}33` : C.border }} />
      {count != null && <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: C.ink2 }}>{count}</span>}
    </div>
  );
}

// ─── SECTION STRIP HORIZONTAL ───
function SectionStrip({ emoji, title, items, onOpen, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ paddingTop: 16, paddingBottom: 4 }}>
      <SectionHeader emoji={emoji} title={title} count={`${items.length} inscrit${items.length > 1 ? "s" : ""}`} accent={accent} />
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {items.map((com, i) => (
          <StripCard key={com.id || i} com={com} onClick={() => onOpen(com)} />
        ))}
      </div>
    </div>
  );
}

// ─── NOUVEAUX MEMBRES ───
function NouveauxMembres({ items, onOpen, limit = 6, onVoirTout }) {
  if (!items || items.length === 0) return null;
  const sorted = [...items].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const visible = limit ? sorted.slice(0, limit) : sorted;
  if (visible.length === 0) return null;
  const hasMore = sorted.length > limit;
  return (
    <div style={{ paddingTop: 14, paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          🆕 Nouveaux membres
          <div style={{ flex: 1, height: 1, background: `${C.accent}33` }} />
        </div>
        {(hasMore || onVoirTout) && (
          <button onClick={onVoirTout} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, color: C.accent, cursor: "pointer", fontFamily: dm, padding: "0 0 0 8px", whiteSpace: "nowrap" }}>
            Voir tout →
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {visible.map((com, i) => (
          <div
            key={com.id || i}
            onClick={() => onOpen(com)}
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", width: 72 }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", border: `2px solid ${C.accent}22`, boxShadow: "0 2px 8px rgba(26,23,20,0.1)", background: C.pill }}>
              <CoverImage src={com.cover} commerce={com} />
            </div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 10, color: C.ink, textAlign: "center", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", width: "100%" }}>
              {com.name}
            </div>
            <div style={{ fontSize: 9, color: C.ink2, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
              {catLabel(com.categorie || com.category || "Commerce")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PHOTOS D'UNE SECTION (1 ligne + lightbox 20 photos) ───
function SectionPhotos({ merchants, onOpenShop }) {
  const [photos, setPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const merchantIds = (merchants || []).map(m => m.id).filter(id => id && !String(id).startsWith("__"));

  useEffect(() => {
    if (merchantIds.length === 0) return;
    setPhotos([]);
    supabase.from("posts")
      .select("id, image_url, content, author_id, created_at, magasin_id")
      .not("image_url", "is", null)
      .in("author_id", merchantIds)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setPhotos(data || []));
  }, [merchantIds.join(",")]);

  if (photos.length === 0) return null;
  const preview = photos.slice(0, 5);

  return (
    <>
      {lightboxIndex !== null && (
        <ShopPhotosLightbox
          photos={photos}
          merchants={merchants}
          startIndex={lightboxIndex}
          onOpenShop={onOpenShop}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <div style={{ paddingBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            📸 Dernières photos
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <button
            onClick={() => setLightboxIndex(0)}
            style={{ background: "none", border: "none", fontSize: 11, fontWeight: 700, color: C.accent, cursor: "pointer", fontFamily: dm, padding: "0 0 0 10px", whiteSpace: "nowrap" }}
          >
            Voir tout ({photos.length}) →
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {preview.map((photo, i) => {
            const shop = (merchants || []).find(m => m.id === photo.author_id || m.id === photo.magasin_id);
            if (!shop) return null;
            return (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                style={{ flexShrink: 0, width: 110, height: 110, borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative", background: C.pill, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              >
                <img src={photo.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(26,23,20,0.78))" }} />
                <div style={{ position: "absolute", bottom: 6, left: 7, right: 7 }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── TUILES CATÉGORIES ───
function CategoryTiles({ counts, onSelect }) {
  return (
    <div style={{ padding: "14px 16px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        🗺️ Découvrir par catégorie
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SECTION_TILES.map((t, idx) => {
          const count = counts[t.key] || 0;
          const isLast = idx === SECTION_TILES.length - 1;
          const isOdd = SECTION_TILES.length % 2 !== 0;
          return (
            <div
              key={t.key}
              onClick={() => onSelect(t.key)}
              style={{ background: t.bg, borderRadius: 18, padding: "14px 14px 12px", cursor: "pointer", minHeight: 100, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 3px 12px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden", ...(isLast && isOdd ? { gridColumn: "1 / -1", minHeight: 70, flexDirection: "row", alignItems: "center", gap: 14 } : {}) }}
            >
              <div style={{ fontSize: 28 }}>{t.emoji}</div>
              <div>
                <div style={{ fontFamily: syne, fontWeight: 600, fontSize: 13, color: "#fff", lineHeight: 1.3, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontFamily: dm, fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{t.desc}</div>
                {count > 0 && (
                  <div style={{ marginTop: 6, fontFamily: dm, fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.18)", display: "inline-block", padding: "2px 8px", borderRadius: 8 }}>
                    {count} membre{count > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───
function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Évén." },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {items.map(it => it.isFab ? (
        <div key="fab" onClick={onFab} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div>
      ) : (
        <div key={it.id} onClick={() => onNavigate(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer" }}>
          <div style={{ fontSize: 18 }}>{it.icon}</div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CARTE FEATURED ───
function FeaturedCard({ com, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 20, marginBottom: 12, overflow: "hidden", border: "1.5px solid rgba(255,87,51,0.25)", cursor: "pointer", boxShadow: "0 2px 12px rgba(255,87,51,0.08)" }}>
      <div style={{ position: "relative", width: "100%", height: 130, overflow: "hidden" }}>
        <CoverImage src={com.cover} commerce={com} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(26,23,20,0.6))" }} />
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,87,51,0.9)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>✦ Sponsorisé</div>
        <div style={{ position: "absolute", bottom: 10, left: 12 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", lineHeight: 1 }}>{com.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{com.shortCat}</div>
        </div>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 10 }}>{com.shortDesc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 10, color: C.ink2 }}>👁 {com.vues} vues</span>
            <span style={{ fontSize: 10, color: C.ink2 }}>💛 {com.int} intéressés</span>
          </div>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>Voir →</button>
        </div>
      </div>
    </div>
  );
}

// ─── CARTE COMMERCE ───
function ComCard({ com, onClick }) {
  // Chips de spécialités (max 3) depuis le champ metier stocké en CSV
  const specs = com.metier
    ? com.metier.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  // Emoji du thème détecté
  const themeEmoji = (() => {
    const h = [com.categorie, com.category, com.metier].filter(Boolean).join(" ").toLowerCase();
    for (const t of THEMES) {
      if (t.key === "Tous" || t.isAutre) continue;
      if (t.match.some(m => h.includes(m))) return t.emoji;
    }
    return "🏪";
  })();

  const catShort = catLabel(com.categorie || com.category || "");

  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 20, marginBottom: 12, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer", boxShadow: "0 2px 10px rgba(26,23,20,0.05)" }}>
      {/* Cover photo */}
      <div style={{ position: "relative", width: "100%", height: 140, overflow: "hidden" }}>
        <CoverImage src={com.cover} commerce={com} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(26,23,20,0.62))" }} />

        {/* Badge thème (haut droite) */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13 }}>{themeEmoji}</span>
          <span style={{ fontSize: 10, color: C.ink2, fontFamily: dm, fontWeight: 600 }}>{catShort}</span>
        </div>

        {/* Posts count (haut gauche) si dispo */}
        {com.posts !== "—" && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.5)", borderRadius: 10, padding: "4px 9px", fontSize: 10, color: "#fff", fontFamily: dm, fontWeight: 600 }}>
            📸 {com.posts}
          </div>
        )}

        {/* Nom + quartier en bas de la cover */}
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", lineHeight: 1.1 }}>{com.name}</div>
          {com.adresse && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>📍 {com.adresse}</div>
          )}
        </div>
      </div>

      {/* Corps de la carte */}
      <div style={{ padding: "12px 14px 14px" }}>
        {/* Bio courte */}
        {com.shortDesc && (
          <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {com.shortDesc}
          </div>
        )}

        {/* Chips de spécialités */}
        {specs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {specs.map(s => (
              <span key={s} style={{ fontSize: 10, fontWeight: 600, background: C.pill, color: C.ink2, padding: "3px 10px", borderRadius: 10 }}>{s}</span>
            ))}
          </div>
        )}

        {/* Footer : stat + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: C.ink2 }}>👁 {com.vues} vues</span>
          <div style={{ background: C.ink, color: "#fff", borderRadius: 10, padding: "6px 16px", fontSize: 11, fontWeight: 700, fontFamily: syne }}>
            Voir →
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODALE PHOTO ───
function PhotoModal({ item, comName, phone, onClose }) {
  if (!item) return null;
  const isReal = !!item.post; // true = post Supabase, false = donnée statique

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", flexDirection: "column" }}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 18, cursor: "pointer", zIndex: 201 }}
      >✕</button>

      {/* Photo grande */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0 0" }}>
        <img
          src={item.src}
          alt=""
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain", borderRadius: 12 }}
        />
      </div>

      {/* Fiche produit */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "22px 20px 40px" }}
      >
        {/* Nom + Prix */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, flex: 1, paddingRight: 12 }}>
            {isReal ? (item.post.content || comName) : (item.label || comName)}
          </div>
          {(isReal ? null : item.price) && (
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.accent, flexShrink: 0 }}>
              {isReal ? null : item.price}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, marginBottom: 6 }}>
          {isReal
            ? `Publié par ${comName}`
            : (item.detail || "")}
        </div>

        {/* Badge commerçant */}
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, background: C.proBg, color: C.pro, padding: "3px 10px", borderRadius: 8, marginBottom: 16 }}>
          ★ {comName}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10 }}>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ flex: 1, background: C.pill, color: C.ink, border: "none", borderRadius: 14, padding: 14, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: dm, textDecoration: "none", textAlign: "center" }}
            >
              📞 Appeler
            </a>
          )}
          <button style={{ flex: 2, background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>
            Je commande →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REACTIONS ───
const REACTIONS = [
  { type: "aime",       emoji: "❤️", label: "J'aime" },
  { type: "kiffe",      emoji: "🔥", label: "Je kiffe" },
  { type: "veux",       emoji: "🛒", label: "Je le veux" },
  { type: "style",      emoji: "✨", label: "Mon style" },
  { type: "recommande", emoji: "👍", label: "Je recommande" },
];

function Reactions({ postId, userId, authorId }) {
  const [counts, setCounts] = useState({});
  const [userReactions, setUserReactions] = useState(new Set());

  useEffect(() => {
    if (!postId) return;
    supabase.from("post_reactions").select("type").eq("post_id", postId)
      .then(({ data }) => {
        if (!data) return;
        const c = {};
        data.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
        setCounts(c);
      });
    if (!userId) return;
    supabase.from("post_reactions").select("type").eq("post_id", postId).eq("user_id", userId)
      .then(({ data }) => { if (data) setUserReactions(new Set(data.map(r => r.type))); });
  }, [postId, userId]);

  const handleReact = async (type) => {
    if (!userId || !postId) return;
    const wasActive = userReactions.has(type);
    setCounts(prev => { const next = { ...prev }; next[type] = wasActive ? Math.max(0, (next[type] || 1) - 1) : (next[type] || 0) + 1; return next; });
    setUserReactions(prev => { const next = new Set(prev); wasActive ? next.delete(type) : next.add(type); return next; });
    if (wasActive) {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId).eq("type", type);
    } else {
      await supabase.from("post_reactions").insert({ post_id: postId, user_id: userId, type });
      if (authorId && authorId !== userId) {
        addXP(authorId, 2, "reaction_received");
        supabase.from("notifications").upsert(
          { user_id: authorId, from_user_id: userId, type, reference_id: postId, read: false },
          { onConflict: "user_id,from_user_id,type,reference_id", ignoreDuplicates: true }
        ).then(() => {});
      }
    }
  };

  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {REACTIONS.map(r => {
        const count = counts[r.type] || 0;
        const active = userReactions.has(r.type);
        return (
          <button key={r.type} onClick={() => handleReact(r.type)} style={{
            padding: "6px 8px", borderRadius: 12,
            border: `1.5px solid ${active ? C.accent : C.border}`,
            background: active ? "#FFF0EB" : "transparent",
            cursor: userId ? "pointer" : "default", fontFamily: dm,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            color: active ? C.accent : C.ink, transition: "all 0.15s", minWidth: 44,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{r.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.2, color: active ? C.accent : C.ink2 }}>{r.label}</span>
            {count > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: active ? C.accent : C.ink2 }}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── MODAL ENRICHIR ───
function EnrichModal({ post, onClose, onSaved }) {
  const [label, setLabel] = useState(post.product_label || "");
  const [price, setPrice] = useState(post.product_price || "");
  const [detail, setDetail] = useState(post.product_detail || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("posts").update({
      product_label: label.trim() || null,
      product_price: price.trim() || null,
      product_detail: detail.trim() || null,
    }).eq("id", post.id);
    setSaving(false);
    if (error) {
      console.error("❌ Erreur enrichissement:", error);
      alert("Erreur lors de l'enregistrement : " + error.message);
      return;
    }
    onSaved({ ...post, product_label: label.trim(), product_price: price.trim(), product_detail: detail.trim() });
    onClose();
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    padding: "11px 14px", fontSize: 14, fontFamily: dm,
    color: C.ink, background: C.bg, outline: "none",
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>✦ Enrichir ce post</div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 20 }}>Ajoute des infos produit visibles sur ta vitrine</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>Nom du produit</div>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ex: Soin visage complet" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>Prix</div>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="ex: 45€" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>Détail</div>
          <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="ex: 60 min · Produits bio" style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: C.pill, color: C.ink, border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}>
            {saving ? "Enregistrement…" : "Enregistrer ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CARTE POST VITRINE ───
function EditPostModal({ post, onClose, onSaved }) {
  const [content, setContent]   = useState(post.content || "");
  const [imageUrl, setImageUrl] = useState(post.image_url || "");
  const [newFile, setNewFile]   = useState(null);
  const [preview, setPreview]   = useState(post.image_url || "");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    let finalUrl = imageUrl;
    // Upload nouvelle image si choisie
    if (newFile) {
      const ext = newFile.name.split(".").pop() || "jpg";
      const path = `posts/${post.author_id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, newFile, { upsert: false });
      if (upErr) { setError("Erreur upload : " + upErr.message); setSaving(false); return; }
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      finalUrl = data.publicUrl;
    }
    const { error: err } = await supabase
      .from("posts")
      .update({ content: content.trim(), image_url: finalUrl })
      .eq("id", post.id);
    if (err) { setError("Erreur : " + err.message); setSaving(false); return; }
    onSaved({ ...post, content: content.trim(), image_url: finalUrl });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: "20px 16px 40px", maxHeight: "88vh", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>✏️ Modifier le post</div>
          <button onClick={onClose} style={{ background: C.pill, border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>
        {/* Photo */}
        {preview && (
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
            <img src={preview} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
            <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>
              📷 Changer la photo
            </button>
          </div>
        )}
        {!preview && (
          <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 14, padding: "20px 0", textAlign: "center", cursor: "pointer", marginBottom: 10, background: C.bg }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: 12, color: C.ink2 }}>Ajouter une photo</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        {/* Texte */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Texte du post…"
          rows={4}
          style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: dm, color: C.ink, background: C.bg, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 12 }}
        />
        {error && <div style={{ fontSize: 11, color: "#E53935", marginBottom: 8 }}>{error}</div>}
        <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: saving ? "#ccc" : C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function VitrinePostCard({ post: initialPost, userId, comId, isOwner, onEnrich, onDelete }) {
  const [post, setPost]             = useState(initialPost);
  const [lightbox, setLightbox]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return diff + "min";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return Math.floor(diff / 1440) + "j";
  };
  const canEnrich = isOwner && post.magasin_id === comId;
  // Le commerçant peut supprimer/modifier ses propres posts ET tous les posts liés à sa vitrine
  const canManage = isOwner && (post.author_id === userId || post.magasin_id === comId);
  const hasEnrichment = post.product_label || post.product_price;

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await supabase.from("posts").delete().eq("id", post.id);
    onDelete(post.id);
  };

  return (
    <>
      {lightbox && post.image_url && (
        <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 18, cursor: "pointer" }}>✕</button>
          <img src={post.image_url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
        </div>
      )}
      {showEdit && (
        <EditPostModal
          post={post}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setPost(updated)}
        />
      )}
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
        {/* Header auteur */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }}>
          <Avatar pseudo={post.profiles?.pseudo} avatarUrl={post.profiles?.avatar_url} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontSize: 13, fontWeight: 700, color: C.ink }}>{post.profiles?.pseudo || "Voisin·e"}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{timeAgo(post.created_at)}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {canEnrich && (
              <button onClick={onEnrich} style={{
                background: hasEnrichment ? C.proBg : C.pill,
                color: hasEnrichment ? C.pro : C.ink2,
                border: "none", borderRadius: 10, padding: "5px 11px",
                fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer",
              }}>
                {hasEnrichment ? "✏️ Enrichi" : "✦ Enrichir"}
              </button>
            )}
            {canManage && (
              <button
                onClick={() => setShowEdit(true)}
                style={{ background: C.pill, color: C.ink2, border: "none", borderRadius: 10, padding: "5px 10px", fontSize: 13, cursor: "pointer" }}
                title="Modifier">✏️</button>
            )}
            {canManage && (
              <button
                onClick={handleDelete}
                onBlur={() => setConfirmDelete(false)}
                style={{
                  background: confirmDelete ? "#FEE2E2" : C.pill,
                  color: confirmDelete ? "#DC2626" : C.ink2,
                  border: "none", borderRadius: 10, padding: "5px 10px",
                  fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {confirmDelete ? "Confirmer ?" : "🗑"}
              </button>
            )}
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
          <div onClick={() => setLightbox(true)} style={{ width: "100%", paddingTop: "75%", position: "relative", cursor: "zoom-in" }}>
            <img src={post.image_url} alt={post.content} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Fiche produit enrichie */}
        {hasEnrichment && (
          <div style={{ margin: "10px 12px 4px", background: C.proBg, borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(10,61,46,0.1)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>{post.product_label}</div>
              {post.product_price && <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.accent, flexShrink: 0 }}>{post.product_price}</div>}
            </div>
            {post.product_detail && <div style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>{post.product_detail}</div>}
          </div>
        )}

        {/* Contenu texte */}
        <div style={{ padding: "10px 12px 6px" }}>
          {post.content && <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>{post.content}</div>}
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {post.tags.map(t => <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>)}
            </div>
          )}
        </div>

        {/* Réactions */}
        <div style={{ padding: "8px 12px 12px" }}>
          <Reactions postId={post.id} userId={userId} authorId={post.author_id} />
        </div>
      </div>
    </>
  );
}

// ─── MODAL DÉTAIL POST VITRINE ───
function PostDetailModal({ post, onClose, isOwner, comId, onEnrich }) {
  const hasEnrichment = post.product_label || post.product_price;
  const canEnrich = isOwner && post.magasin_id === comId;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: "24px 24px 0 0", width: "100%",
        maxHeight: "92vh", overflowY: "auto", paddingBottom: 32,
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* Photo */}
        {post.image_url && (
          <img src={post.image_url} alt="" style={{
            width: "100%", maxHeight: 360, objectFit: "cover", display: "block",
          }} />
        )}

        <div style={{ padding: "14px 16px 0" }}>
          {/* Fiche enrichissement commerçant */}
          {hasEnrichment && (
            <div style={{
              background: C.proBg, borderRadius: 14, padding: "12px 14px",
              border: "1px solid rgba(10,61,46,0.12)", marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.pro, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                ✦ Sélection de la boutique
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, flex: 1 }}>{post.product_label}</div>
                {post.product_price && (
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.accent, flexShrink: 0 }}>{post.product_price}</div>
                )}
              </div>
              {post.product_detail && (
                <div style={{ fontSize: 12, color: C.ink2, marginTop: 4, lineHeight: 1.5 }}>{post.product_detail}</div>
              )}
            </div>
          )}

          {/* Auteur + texte */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Avatar pseudo={post.profiles?.pseudo} avatarUrl={post.profiles?.avatar_url} size={28} />
            <div style={{ fontFamily: syne, fontSize: 13, fontWeight: 700, color: C.ink }}>{post.profiles?.pseudo || "Voisin·e"}</div>
          </div>
          {post.content && (
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, marginBottom: 10 }}>{post.content}</div>
          )}
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
              {post.tags.map(t => <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>)}
            </div>
          )}

          {/* Bouton enrichir pour le commerçant */}
          {canEnrich && (
            <button onClick={onEnrich} style={{
              width: "100%", background: hasEnrichment ? C.proBg : C.pro,
              color: hasEnrichment ? C.pro : "#fff",
              border: hasEnrichment ? `1px solid rgba(10,61,46,0.2)` : "none",
              borderRadius: 14, padding: "12px 0",
              fontSize: 13, fontWeight: 700, fontFamily: dm, cursor: "pointer",
            }}>
              {hasEnrichment ? "✏️ Modifier la fiche produit" : "✦ Enrichir ce post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL GESTION DES FILTRES VITRINE ───
function FilterManagerModal({ com, existingFilters, onClose, onSaved }) {
  const [filtres, setFiltres] = useState(existingFilters || []);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [newFilter, setNewFilter] = useState("");
  const [saving, setSaving] = useState(false);

  // Charger les tags IA les plus fréquents comme suggestions
  useEffect(() => {
    if (!com.id || com.isDemo) return;
    supabase.from("posts")
      .select("tags")
      .eq("author_id", com.id)
      .not("tags", "is", null)
      .then(({ data }) => {
        if (!data) return;
        const freq = {};
        data.flatMap(p => p.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; });
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([t]) => t)
          .filter(t => !(existingFilters || []).includes(t))
          .slice(0, 15);
        setSuggestedTags(sorted);
      });
  }, [com.id]);

  const addFilter = (f) => {
    const trimmed = (f || "").trim();
    if (!trimmed || filtres.includes(trimmed)) return;
    setFiltres(prev => [...prev, trimmed]);
    setSuggestedTags(prev => prev.filter(t => t !== trimmed));
    setNewFilter("");
  };

  const removeFilter = (f) => setFiltres(prev => prev.filter(t => t !== f));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ vitrine_filtres: filtres }).eq("id", com.id);
    setSaving(false);
    if (error) { alert("Erreur : " + error.message); return; }
    onSaved(filtres);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "0 20px 40px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 18px" }} />
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>⚙️ Filtres de ta vitrine</div>
        <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 20 }}>
          Ces filtres permettent aux voisins de trouver rapidement ce qu'ils cherchent dans ta boutique.
        </div>

        {/* Filtres actifs */}
        {filtres.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Filtres actifs</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {filtres.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,87,51,0.08)", border: "1.5px solid rgba(255,87,51,0.3)", borderRadius: 20, padding: "5px 8px 5px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: dm }}>{f}</span>
                  <button onClick={() => removeFilter(f)} style={{ background: "rgba(255,87,51,0.12)", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", color: C.accent, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajouter manuellement */}
        <div style={{ marginBottom: suggestedTags.length > 0 ? 20 : 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Ajouter un filtre</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newFilter}
              onChange={e => setNewFilter(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFilter(newFilter)}
              placeholder="ex : Robes, Brunch, Poterie…"
              style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontFamily: dm, color: C.ink, background: C.bg, outline: "none" }}
            />
            <button onClick={() => addFilter(newFilter)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>

        {/* Suggestions depuis les tags IA */}
        {suggestedTags.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.pro, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>✦ Détectés depuis tes photos (tags IA)</div>
            <div style={{ fontSize: 11, color: C.ink2, marginBottom: 10, lineHeight: 1.4 }}>Ces mots-clés ont été analysés automatiquement sur tes photos. Clique pour les ajouter.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestedTags.map(t => (
                <button key={t} onClick={() => addFilter(t)} style={{ background: C.proBg, border: `1px solid rgba(10,61,46,0.2)`, borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: C.pro, cursor: "pointer", fontFamily: dm }}>
                  + {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: C.pill, color: C.ink, border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}>
            {saving ? "Enregistrement…" : "Enregistrer ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHIPS VITRINE ───
const VITRINE_MODES = [
  { id: "galerie", label: "📷 Photos" },
  { id: "tout",    label: "Posts" },
  { id: "offres",  label: "🎯 Offres" },
  { id: "postes",  label: "📬 Liés",  ownerOnly: true },
  { id: "stats",   label: "📊 Stats", ownerOnly: true },
];

// Sous-catégories vitrine par type de commerce (plan mixe / premium)
const VITRINE_SUBFILTRES = {
  "Mode":         ["Robes", "Pulls", "Jupes", "T-shirts", "Vestes", "Accessoires", "Soldes"],
  "Beauté":       ["Soins", "Coiffure", "Ongles", "Maquillage", "Épilation", "Massage"],
  "Restauration": ["Entrées", "Plats", "Desserts", "Boissons", "Menus", "Spécialités"],
  "Alimentation": ["Fromages", "Charcuterie", "Boulangerie", "Bio", "Fruits", "Épicerie fine"],
  "Artisan":      ["Bijoux", "Poterie", "Textile", "Bois", "Cuir", "Peinture"],
  "Maison":       ["Déco", "Mobilier", "Luminaires", "Textile", "Jardinage"],
  "Sport":        ["Cardio", "Yoga", "Arts martiaux", "Outdoor", "Vélo", "Pilates"],
  "Culture":      ["Livres", "Musique", "Art", "Papeterie", "Cadeaux"],
  "Services":     ["Réparation", "Pressing", "Informatique", "Plomberie"],
  "Association":  ["Événements", "Bénévolat", "Actualités", "Adhésion", "Sport", "Culture"],
};

function VitrineChips({ activeMode, onChange, isOwner, counts = {} }) {
  const visible = VITRINE_MODES.filter(m => !m.ownerOnly || isOwner);
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px 8px", scrollbarWidth: "none", background: C.bg }}>
      {visible.map(m => {
        const isActive = activeMode === m.id;
        const count = counts[m.id];
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              flexShrink: 0, border: "none", borderRadius: 20, cursor: "pointer",
              padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: dm,
              background: isActive ? C.ink : C.pill,
              color:      isActive ? "#fff" : C.ink2,
              transition: "background 0.15s, color 0.15s",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {m.label}
            {count > 0 && (
              <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : C.accent, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", lineHeight: 1.4 }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── CARTE DÉFI (vitrine) ───
function DefiVitrine({ defi }) {
  const now = new Date();
  const enCours = !defi.ended && (!defi.ends_at || new Date(defi.ends_at) > now);
  const daysLeft = defi.ends_at && !defi.ended
    ? Math.max(0, Math.ceil((new Date(defi.ends_at) - now) / 86400000))
    : null;

  return (
    <div style={{
      background: C.card, borderRadius: 18, marginBottom: 10,
      border: `1.5px solid ${enCours ? "rgba(255,87,51,0.25)" : C.border}`,
      overflow: "hidden",
    }}>
      {defi.photo_url && (
        <div style={{ width: "100%", height: 120, overflow: "hidden" }}>
          <img src={defi.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>
            {defi.emoji || "🏆"} {defi.title}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8, flexShrink: 0,
            background: enCours ? "rgba(255,87,51,0.12)" : C.pill,
            color: enCours ? C.accent : C.ink2,
          }}>
            {enCours ? "En cours" : "Terminé"}
          </div>
        </div>
        {defi.description && (
          <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 8 }}>{defi.description}</div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {defi.reward && (
            <span style={{ fontSize: 11, background: C.proBg, color: C.pro, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>🎁 {defi.reward}</span>
          )}
          {enCours && daysLeft !== null && (
            <span style={{ fontSize: 11, background: "rgba(255,87,51,0.08)", color: C.accent, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>⏳ {daysLeft}j restants</span>
          )}
          {defi.winner_post_id && (
            <span style={{ fontSize: 11, background: C.proBg, color: C.pro, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>🥇 Gagnant désigné</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ONGLET VITRINE ───
function TabVitrine({ com, realPosts, loadingPosts, user, demoDefis, tagSearch = "" }) {
  const [posts, setPosts] = useState(realPosts);
  const [activeMode, setActiveMode] = useState("galerie");
  const [selectedPost, setSelectedPost] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [enrichingPost, setEnrichingPost] = useState(null);
  const [defis, setDefis] = useState(demoDefis || []);
  const [loadingDefis, setLoadingDefis] = useState(false);
  const [linkedPosts, setLinkedPosts] = useState([]);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [subFilter, setSubFilter] = useState("Tous");
  const [vitrineFilters, setVitrineFilters] = useState(
    com.vitrine_filtres && com.vitrine_filtres.length > 0 ? com.vitrine_filtres : null
  );
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const touchXVit = useRef(null);

  useEffect(() => { setPosts(realPosts); }, [realPosts]);

  // Charger les défis dès le montage (pour le compteur dans l'onglet Offres)
  useEffect(() => {
    if (com.isDemo || defis.length > 0) return;
    setLoadingDefis(true);
    supabase.from("defis").select("*")
      .eq("user_id", com.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDefis(data || []); setLoadingDefis(false); });
  }, [com.id]);

  // Réinitialiser le sous-filtre quand on change d'onglet
  useEffect(() => { setSubFilter("Tous"); }, [activeMode]);

  // Auto-initialiser les filtres depuis les tags IA si le commerçant n'en a pas encore configuré
  useEffect(() => {
    const isOwnerLocal = user?.id === com.id;
    if (!isOwnerLocal || com.isDemo || vitrineFilters !== null || !com.id) return;
    supabase.from("posts")
      .select("tags")
      .eq("author_id", com.id)
      .not("tags", "is", null)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const freq = {};
        data.flatMap(p => p.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; });
        const topTags = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([t]) => t)
          .slice(0, 8);
        if (topTags.length === 0) return;
        setVitrineFilters(topTags);
        // Sauvegarder silencieusement en base
        supabase.from("profiles").update({ vitrine_filtres: topTags }).eq("id", com.id).then(() => {});
      });
  }, [user?.id, com.id]);

  // Charger les posts liés quand on passe en mode "postes" (owner seulement)
  useEffect(() => {
    if (com.isDemo || activeMode !== "postes") return;
    setLoadingLinked(true);
    supabase.from("posts")
      .select("*, profiles(id, pseudo, avatar_url)")
      .eq("magasin_id", com.id)
      .in("linked_status", ["pending", "accepted"])
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setLinkedPosts(data || []);
        setLoadingLinked(false);
      });
  }, [activeMode, com.id]);

  const handleAcceptPost = async (post) => {
    // 1. Mettre à jour le statut du post
    await supabase.from("posts").update({ linked_status: "accepted" }).eq("id", post.id);
    // Analyse IA de la photo au moment de l'acceptation (fire & forget)
    // On passe le métier du commerce pour des tags contextualisés
    if (post.image_url) {
      supabase.functions.invoke("post-tag", {
        body: {
          post_id: post.id,
          image_url: post.image_url,
          metier: com.metier || "",
          categorie: com.categorie || com.category || "",
        }
      }).catch(() => {});
    }
    // 2. Créditer 10 XP Shop dans le wallet + profiles.xp_shop
    await addXPShop(post.author_id, com.id, 10);
    // 3. Notifier l'auteur (post accepté)
    await supabase.from("notifications").insert({
      user_id: post.author_id,
      from_user_id: com.id,
      type: "linked_accepted",
      reference_id: post.id,
      read: false,
    });
    // 4. Vérifier si le voisin vient de franchir un palier de 100 XP Shop
    const { data: wallet } = await supabase
      .from("merchant_xp_wallet")
      .select("points")
      .eq("user_id", post.author_id)
      .eq("merchant_id", com.id)
      .maybeSingle();
    if (wallet) {
      const pts = wallet.points;
      const prev = pts - 10;
      // Franchissement d'un palier (100, 200, 300…)
      if (Math.floor(pts / 100) > Math.floor(prev / 100)) {
        const bons = Math.floor(pts / 100);
        await supabase.from("notifications").insert({
          user_id: post.author_id,
          from_user_id: com.id,
          type: "xpshop_palier",
          reference_id: post.id,
          read: false,
          message: JSON.stringify({ bons, merchant_name: com.pseudo || "Le commerce", points: pts }),
        });
      }
    }
    // 5. Mettre à jour l'état local
    setLinkedPosts(prev => prev.map(p => p.id === post.id ? { ...p, linked_status: "accepted" } : p));
  };

  const handleRejectPost = async (post) => {
    await supabase.from("posts").update({ linked_status: "rejected" }).eq("id", post.id);
    setLinkedPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const isOwner = user?.id === com.id;

  // Sous-filtres : priorité aux filtres custom du commerçant, sinon détection auto par catégorie
  const subfiltres = (() => {
    if (vitrineFilters && vitrineFilters.length > 0) return vitrineFilters;
    const cat = (com.categorie || com.category || "").toLowerCase();
    for (const [themeKey, filters] of Object.entries(VITRINE_SUBFILTRES)) {
      const theme = THEMES.find(t => t.key === themeKey);
      if (theme && theme.match.some(m => cat.includes(m))) return filters;
    }
    return [];
  })();

  // Filtrage par recherche de tag IA ou sous-filtre catégorie
  const filterPosts = (postsArr) => {
    let result = postsArr;
    if (tagSearch.trim()) {
      const q = tagSearch.trim().toLowerCase();
      result = result.filter(p =>
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        p.product_label?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q)
      );
    }
    if (subFilter && subFilter !== "Tous") {
      const sf = subFilter.toLowerCase();
      result = result.filter(p =>
        p.tags?.some(t => t.toLowerCase().includes(sf)) ||
        p.product_label?.toLowerCase().includes(sf)
      );
    }
    return result;
  };

  // Listes filtrées
  const photoPosts = filterPosts(posts.filter(p => !!p.image_url));
  const filteredTout = filterPosts(posts);

  const defisEnCours  = defis.filter(d => !d.ended);
  const defisTermines = defis.filter(d => !!d.ended);

  const counts = {
    tout:    posts.length,
    offres:  posts.filter(p => p.post_type === "bonplan" || p.post_type === "promo").length + defis.length,
    galerie: photoPosts.length,
    postes:  linkedPosts.filter(p => p.linked_status === "pending").length,
  };

  return (
    <div style={{ padding: "0 0 100px" }}>
      {/* Chips mode */}
      <VitrineChips activeMode={activeMode} onChange={setActiveMode} isOwner={isOwner} counts={counts} />

      {/* ── Sous-filtres catégorie + bouton config owner ── */}
      {(com.plan === "mixe" || com.plan === "premium") && (activeMode === "galerie" || activeMode === "tout") && (subfiltres.length > 0 || isOwner) && (() => {
        const MAX_VISIBLE = 4;
        const allFilters = ["Tous", ...subfiltres];
        const hasMore = allFilters.length > MAX_VISIBLE + 1;
        const visibleFilters = showAllFilters ? allFilters : allFilters.slice(0, MAX_VISIBLE + 1);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px 10px", background: C.bg }}>
            {/* Chips filtres */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
              {subfiltres.length > 0 ? (
                <>
                  {visibleFilters.map(f => {
                    const isOn = subFilter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setSubFilter(f)}
                        style={{
                          flexShrink: 0,
                          border: `1.5px solid ${isOn ? C.accent : "transparent"}`,
                          borderRadius: 20, cursor: "pointer",
                          padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: dm,
                          background: isOn ? "rgba(255,87,51,0.08)" : C.pill,
                          color: isOn ? C.accent : C.ink2,
                          transition: "all 0.15s",
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                  {hasMore && (
                    <button
                      onClick={() => setShowAllFilters(v => !v)}
                      style={{
                        flexShrink: 0, border: "none", borderRadius: 20, cursor: "pointer",
                        padding: "5px 12px", fontSize: 11, fontWeight: 700, fontFamily: dm,
                        background: C.pill, color: C.ink2, transition: "all 0.15s",
                      }}
                    >
                      {showAllFilters ? "Moins −" : `+${allFilters.length - (MAX_VISIBLE + 1)}`}
                    </button>
                  )}
                </>
              ) : isOwner ? (
                <span style={{ fontSize: 12, color: C.ink2, fontStyle: "italic", alignSelf: "center" }}>
                  Aucun filtre — configure les tiens ⚙️
                </span>
              ) : null}
            </div>
            {/* Bouton config (owner uniquement) */}
            {isOwner && (
              <button
                onClick={() => setShowFilterManager(true)}
                style={{
                  flexShrink: 0, background: C.pill, border: "none", borderRadius: 10,
                  padding: "6px 10px", fontSize: 13, cursor: "pointer", color: C.ink2,
                  display: "flex", alignItems: "center", gap: 4,
                }}
                title="Gérer les filtres"
              >
                ⚙️ <span style={{ fontSize: 10, fontWeight: 600, fontFamily: dm }}>Filtres</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* ── Mode POSTS LIÉS (owner seulement) ── */}
      {activeMode === "postes" && isOwner && (
        <div style={{ padding: "0 16px" }}>
          {loadingLinked ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
          ) : (
            // Toujours afficher (même si linkedPosts est vide) pour expliquer le système
          linkedPosts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Explication système */}
              <div style={{ background: C.proBg, border: "1.5px solid rgba(10,61,46,0.2)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.pro, marginBottom: 8 }}>📬 Comment ça marche ?</div>
                {[
                  { e: "📸", t: "Un voisin poste une photo", d: "Il lie votre commerce depuis son post (Chope, Tu valides!!!, etc.)" },
                  { e: "🔔", t: "Vous êtes notifié", d: "Le post apparaît ici en attente de validation." },
                  { e: "✓", t: "Vous acceptez ou refusez", d: "Si vous acceptez, le post s'affiche dans votre vitrine et le voisin reçoit +10 XP Shop." },
                  { e: "🎁", t: "100 XP Shop = 5 € de bon d'achat", d: "Le voisin peut utiliser ses XP Shop comme bon d'achat uniquement dans votre boutique !" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.e}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.pro }}>{s.t}</div>
                      <div style={{ fontSize: 11, color: "#1A5C40", lineHeight: 1.4, marginTop: 1 }}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exemple de post fictif */}
              <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>Exemple de post à valider</div>
              <div style={{
                background: C.card, borderRadius: 18, border: `1.5px dashed rgba(26,23,20,0.15)`,
                overflow: "hidden", opacity: 0.8,
              }}>
                <div style={{ height: 120, background: "#C471ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>👗</div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                    <div>
                      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink }}>Marie_SDV</div>
                      <div style={{ fontSize: 10, color: C.ink2 }}>Il y a 2h · 🤔 Tu valides !!!</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, background: C.pill, color: C.ink2, borderRadius: 5, padding: "2px 6px" }}>EXEMPLE</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10 }}>J'hésite sur cette robe, vous en pensez quoi ? 👗</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button disabled style={{ border: "none", borderRadius: 12, padding: "10px 0", background: "rgba(10,61,46,0.15)", color: C.pro, fontWeight: 700, fontSize: 13, cursor: "not-allowed", fontFamily: dm }}>✓ Accepter · +10 XP Shop</button>
                    <button disabled style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 0", background: C.card, color: C.ink2, fontWeight: 600, fontSize: 13, cursor: "not-allowed", fontFamily: dm }}>✕ Refuser</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Compteur en attente */}
              {linkedPosts.filter(p => p.linked_status === "pending").length > 0 && (
                <div style={{ background: "rgba(255,87,51,0.08)", border: "1.5px solid rgba(255,87,51,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: C.accent, fontWeight: 600 }}>
                  📬 {linkedPosts.filter(p => p.linked_status === "pending").length} post{linkedPosts.filter(p => p.linked_status === "pending").length > 1 ? "s" : ""} en attente de validation
                </div>
              )}
              {linkedPosts.map(post => (
                <div key={post.id} style={{
                  background: C.card, borderRadius: 18, border: `1.5px solid ${post.linked_status === "accepted" ? "rgba(10,61,46,0.3)" : C.border}`,
                  marginBottom: 12, overflow: "hidden",
                }}>
                  {post.image_url && (
                    <div style={{ width: "100%", height: 160, overflow: "hidden", position: "relative" }}>
                      <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {post.post_type && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                          {post.post_type === "tuvalides" ? "🤔 Tu valides !!!" : post.post_type === "decouverte" ? "🛍️ Chope" : "💡 Post"}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ padding: "12px 14px" }}>
                    {/* Auteur */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                        {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : "👤"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink }}>{post.profiles?.pseudo || "Voisin·e"}</div>
                        <div style={{ fontSize: 10, color: C.ink2 }}>
                          {new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      {/* Badge statut */}
                      {post.linked_status === "accepted" && (
                        <div style={{ background: C.proBg, color: C.pro, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>✓ Accepté · +10 XP Shop 🎁</div>
                      )}
                    </div>
                    {post.content && (
                      <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 10 }}>{post.content}</div>
                    )}
                    {/* Actions */}
                    {post.linked_status === "pending" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button onClick={() => handleAcceptPost(post)} style={{
                          border: "none", borderRadius: 12, padding: "10px 0",
                          background: C.pro, color: "#fff",
                          fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: dm,
                        }}>✓ Accepter · +10 XP Shop</button>
                        <button onClick={() => handleRejectPost(post)} style={{
                          border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 0",
                          background: C.card, color: C.ink2,
                          fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: dm,
                        }}>✕ Refuser</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )
        )}
        </div>
      )}

      {/* ── Mode OFFRES (Promos + Défis regroupés) ── */}
      {activeMode === "offres" && (
        <div style={{ padding: "0 16px" }}>
          {(() => {
            const promos = posts.filter(p => p.post_type === "bonplan" || p.post_type === "promo");
            const hasContent = promos.length > 0 || defis.length > 0;
            if (!hasContent && !loadingDefis) return (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucune offre active</div>
                <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Les promos et défis de ce commerce apparaîtront ici.</div>
              </div>
            );
            return (
              <>
                {/* Promos */}
                {promos.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: dm, marginBottom: 10, marginTop: 4 }}>
                      🎁 Promos & bons plans
                    </div>
                    {promos.map(post => (
                      <VitrinePostCard key={post.id} post={post} userId={user?.id} comId={com.id} isOwner={isOwner} onEnrich={() => setEnrichingPost(post)} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
                    ))}
                  </>
                )}
                {/* Défis */}
                {loadingDefis ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
                ) : (
                  <>
                    {defisEnCours.length > 0 && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: dm, marginBottom: 10, marginTop: promos.length > 0 ? 18 : 4 }}>
                          🏆 Défis en cours
                        </div>
                        {defisEnCours.map(d => <DefiVitrine key={d.id} defi={d} />)}
                      </>
                    )}
                    {defisTermines.length > 0 && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: dm, marginBottom: 10, marginTop: defisEnCours.length > 0 ? 16 : 4 }}>
                          🏁 Défis terminés
                        </div>
                        {defisTermines.map(d => <DefiVitrine key={d.id} defi={d} />)}
                      </>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ── Mode GALERIE ── */}
      {activeMode === "galerie" && (
        loadingPosts ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
        ) : photoPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucune photo pour l'instant</div>
            <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Les photos partagées par le commerce et les voisins apparaîtront ici.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, padding: "0 2px" }}>
            {photoPosts.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                style={{ aspectRatio: "1", overflow: "hidden", cursor: "pointer", position: "relative", background: C.pill }}
              >
                <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {(post.product_label || post.product_price) && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: C.pro, borderRadius: 6, padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#fff" }}>✦</div>
                )}
                {(post.post_type === "bonplan" || post.post_type === "promo") && (
                  <div style={{ position: "absolute", top: 4, left: 4, background: C.accent, borderRadius: 6, padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#fff" }}>🎁</div>
                )}
                {post.tags?.length > 0 && (
                  <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "2px 6px", fontSize: 9, color: "#fff", fontWeight: 500 }}>
                    {post.tags[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Mode TOUT ── */}
      {activeMode === "tout" && (
        loadingPosts ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
        ) : filteredTout.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>
              {tagSearch || subFilter !== "Tous" ? "Aucun résultat" : "Vitrine vide pour l'instant"}
            </div>
            <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>
              {tagSearch || subFilter !== "Tous"
                ? "Essayez un autre mot-clé ou filtre."
                : "Soyez parmi les premiers à le découvrir et à réagir !"}
            </div>
          </div>
        ) : (
          <div style={{ padding: "0 16px" }}>
            {filteredTout.map(post => (
              <VitrinePostCard
                key={post.id}
                post={post}
                userId={user?.id}
                comId={com.id}
                isOwner={isOwner}
                onEnrich={() => setEnrichingPost(post)}
                onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </div>
        )
      )}

      {/* Lightbox galerie swipeable */}
      {lightboxIndex !== null && photoPosts.length > 0 && (() => {
        const prev = () => setLightboxIndex(i => Math.max(0, i - 1));
        const next = () => setLightboxIndex(i => Math.min(photoPosts.length - 1, i + 1));
        const photo = photoPosts[lightboxIndex];
        return (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", display: "flex", flexDirection: "column" }}
            onTouchStart={e => { touchXVit.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchXVit.current === null) return;
              const dx = e.changedTouches[0].clientX - touchXVit.current;
              touchXVit.current = null;
              if (dx > 60) prev(); else if (dx < -60) next();
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", flexShrink: 0 }}>
              <button onClick={() => setLightboxIndex(null)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>{lightboxIndex + 1} / {photoPosts.length}</div>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              {photo?.image_url && <img src={photo.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
              {lightboxIndex > 0 && <button onClick={prev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
              {lightboxIndex < photoPosts.length - 1 && <button onClick={next} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
              {photoPosts.length > 1 && (
                <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                  {photoPosts.map((_, i) => <div key={i} onClick={() => setLightboxIndex(i)} style={{ width: i === lightboxIndex ? 18 : 6, height: 6, borderRadius: 3, background: i === lightboxIndex ? C.accent : "rgba(255,255,255,0.35)", transition: "all 0.2s", cursor: "pointer" }} />)}
                </div>
              )}
            </div>
            {photo && (
              <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "14px 18px 28px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: photo.content || (photo.tags?.length > 0) ? 10 : 0 }}>
                  <Avatar pseudo={photo.profiles?.pseudo} avatarUrl={photo.profiles?.avatar_url} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>{photo.profiles?.pseudo || "Voisin·e"}</div>
                    <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>
                      {new Date(photo.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </div>
                  </div>
                </div>
                {photo.content && (
                  <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 10 }}>{photo.content}</div>
                )}
                {/* Tags IA */}
                {photo.tags && photo.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {photo.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: 11, background: C.pill, color: C.ink2, borderRadius: 8, padding: "3px 9px", fontWeight: 500 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal détail post (mode cartes/tout) */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isOwner={isOwner}
          comId={com.id}
          onEnrich={() => { setEnrichingPost(selectedPost); setSelectedPost(null); }}
        />
      )}

      {/* Modal enrichissement */}
      {enrichingPost && (
        <EnrichModal
          post={enrichingPost}
          onClose={() => setEnrichingPost(null)}
          onSaved={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
        />
      )}

      {/* ── Mode STATS (owner only) ── */}
      {activeMode === "stats" && isOwner && (
        <TabStats com={com} user={user} />
      )}

      {/* Modal gestion des filtres vitrine */}
      {showFilterManager && (
        <FilterManagerModal
          com={com}
          existingFilters={vitrineFilters || []}
          onClose={() => setShowFilterManager(false)}
          onSaved={(newFilters) => setVitrineFilters(newFilters)}
        />
      )}
    </div>
  );
}

// Calcule si le commerce est ouvert maintenant depuis les periods Google Places
// periods = [{ open: { day: 1, time: "0900" }, close: { day: 1, time: "1900" } }, ...]
// day: 0=Dimanche … 6=Samedi, time: "HHMM"
function computeOpenNowFromPeriods(periods) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = new Date();
  const dayIdx = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // ex: 1430

  for (const p of periods) {
    const openDay  = p.open?.day;
    const openTime = parseInt(p.open?.time  || "0000", 10);
    const closeDay = p.close?.day;
    const closeTime= parseInt(p.close?.time || "0000", 10);
    if (openDay === undefined) continue;

    if (openDay === dayIdx) {
      if (closeDay === dayIdx) {
        // Ouverture et fermeture le même jour
        if (currentTime >= openTime && currentTime < closeTime) return true;
      } else {
        // Ouvert aujourd'hui, ferme demain (ex: nuit)
        if (currentTime >= openTime) return true;
      }
    } else if (closeDay === dayIdx) {
      // Ouvert hier, ferme aujourd'hui
      if (currentTime < closeTime) return true;
    }
  }
  return false;
}

// Calcule si le commerce est ouvert maintenant à partir des horaires saisis manuellement
// Retourne true (ouvert), false (fermé), ou null (pas d'info)
function computeOpenNow(horaires) {
  if (!Array.isArray(horaires) || horaires.length === 0) return null;
  const DAYS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const now = new Date();
  const dayIdx = now.getDay();
  const currentDayFr = DAYS_FR[dayIdx];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse "9h30" ou "9h" → minutes depuis minuit
  const parseTime = (str) => {
    if (!str) return null;
    const m = str.trim().match(/^(\d{1,2})h(\d{2})?$/i);
    if (!m) return null;
    return parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0);
  };

  // Vérifie si le jour courant correspond à l'entrée (ex: "Lundi", "Lundi–Vendredi")
  const dayMatches = (j) => {
    if (!j) return false;
    const norm = (s) => s.trim().toLowerCase().substring(0, 3);
    if (norm(j) === norm(currentDayFr)) return true;
    const parts = j.split(/[–\-]/);
    if (parts.length === 2) {
      const from = DAYS_FR.findIndex(d => norm(d) === norm(parts[0]));
      const to   = DAYS_FR.findIndex(d => norm(d) === norm(parts[1]));
      if (from >= 0 && to >= 0) {
        return from <= to ? (dayIdx >= from && dayIdx <= to) : (dayIdx >= from || dayIdx <= to);
      }
    }
    return false;
  };

  const entry = horaires.find(h => dayMatches(h.j));
  if (!entry || !entry.h) return null;
  const hVal = entry.h.trim();
  if (hVal === "Fermé" || hVal === "—" || hVal === "") return false;

  // Supporte les plages avec pause déjeuner : "9h–12h / 14h–19h"
  const slots = hVal.split("/");
  for (const slot of slots) {
    const parts = slot.split(/[–\-]/);
    if (parts.length >= 2) {
      const open  = parseTime(parts[0]);
      const close = parseTime(parts[1]);
      if (open !== null && close !== null && currentMinutes >= open && currentMinutes < close) return true;
    }
  }
  return false;
}

// Calcule le texte "Ouvre lundi à 9h30" à partir du tableau d'horaires
function nextOpeningText(hours) {
  if (!hours || hours.length === 0) return null;
  const daysFr = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const currentDayIndex = new Date().getDay();
  for (let offset = 1; offset < 8; offset++) {
    const dayIndex = (currentDayIndex + offset) % 7;
    const dayName = daysFr[dayIndex];
    const entry = hours.find(h => h.j && h.j.toLowerCase().startsWith(dayName.toLowerCase().substring(0, 3)));
    if (entry && entry.h && entry.h !== "Fermé" && entry.h !== "—") {
      const openTime = entry.h.split(/[–\-\/]/)[0].trim();
      if (offset === 1) return `Ouvre demain à ${openTime}`;
      return `Ouvre ${dayName.toLowerCase()} à ${openTime}`;
    }
  }
  return null;
}

// ─── ONGLET INFOS ───
function TabInfos({ com }) {
  const rowStyle = {
    background: C.card, borderRadius: 16, padding: "14px 16px",
    marginBottom: 10, border: `1px solid ${C.border}`,
    display: "flex", alignItems: "flex-start", gap: 14,
  };
  const iconStyle = {
    width: 38, height: 38, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0,
  };

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {com.phone && (
        <div style={rowStyle}>
          <div style={{ ...iconStyle, background: "#E8F4FD" }}>📞</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 3 }}>TÉLÉPHONE</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>{com.phone}</div>
          </div>
          <a href={`tel:${com.phone.replace(/\s/g, "")}`} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: dm, textDecoration: "none", alignSelf: "center", flexShrink: 0 }}>
            Appeler
          </a>
        </div>
      )}

      {com.adresse && (
        <div style={rowStyle}>
          <div style={{ ...iconStyle, background: "#FEF3E0" }}>📍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 3 }}>ADRESSE</div>
            <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{com.adresse}</div>
          </div>
        </div>
      )}

      {com.hours && com.hours.length > 0 && (
        <div style={rowStyle}>
          <div style={{ ...iconStyle, background: C.proBg }}>🕐</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.ink2 }}>HORAIRES</span>
              {com.open_now !== null && com.open_now !== undefined && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: com.open_now ? "#DCFCE7" : "#FEE2E2", color: com.open_now ? "#16A34A" : "#DC2626" }}>
                  {com.open_now ? "● Ouvert maintenant" : (() => {
                    const next = nextOpeningText(com.hours);
                    return next ? `● Fermé · ${next}` : "● Fermé";
                  })()}
                </span>
              )}
            </div>
            {com.hours.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < com.hours.length - 1 ? 6 : 0, marginBottom: i < com.hours.length - 1 ? 6 : 0, borderBottom: i < com.hours.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>{h.j || "—"}</span>
                <span style={{ fontSize: 13, color: h.h === "Fermé" ? "#C0392B" : C.pro, fontWeight: 600 }}>{h.h || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {com.website && (
        <div style={rowStyle}>
          <div style={{ ...iconStyle, background: "#F3E8FF" }}>🌐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 3 }}>BOUTIQUE EN LIGNE</div>
            <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, wordBreak: "break-all" }}>{com.website.replace("https://", "")}</div>
          </div>
          <a href={com.website} target="_blank" rel="noreferrer" style={{ background: C.pill, color: C.ink, border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: dm, textDecoration: "none", alignSelf: "center", flexShrink: 0 }}>
            Visiter
          </a>
        </div>
      )}

      {com.gallery && com.gallery.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 10, letterSpacing: 0.4, display: "flex", alignItems: "center", gap: 6 }}>
            📷 PHOTOS DU COMMERCE
            <span style={{ fontSize: 9, background: "#F3F3F3", padding: "2px 6px", borderRadius: 6, color: C.ink2, fontWeight: 500 }}>Google</span>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
            {com.gallery.map((url, i) => (
              <div key={i} style={{ flexShrink: 0, width: 110, height: 110, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(com.instagram || com.facebook) && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 10, letterSpacing: 0.4 }}>RÉSEAUX SOCIAUX</div>
          <div style={{ display: "flex", gap: 10 }}>
            {com.instagram && (
              <div style={{ flex: 1, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📸</div>
                <div>
                  <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>INSTAGRAM</div>
                  <div style={{ fontSize: 12, color: C.ink, fontWeight: 600, marginTop: 1 }}>{com.instagram}</div>
                </div>
              </div>
            )}
            {com.facebook && (
              <div style={{ flex: 1, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👥</div>
                <div>
                  <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>FACEBOOK</div>
                  <div style={{ fontSize: 12, color: C.ink, fontWeight: 600, marginTop: 1 }}>{com.facebook}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!com.phone && !com.adresse && !com.website && !com.instagram && !com.facebook && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>
          Ce commerçant n'a pas encore renseigné ses coordonnées.
        </div>
      )}
    </div>
  );
}

// ─── ONGLET STATS (owner only) ───
function TabStats({ com }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30); // jours

  useEffect(() => {
    if (!com.id || com.isDemo) { setLoading(false); return; }
    const since = new Date(Date.now() - period * 86400000).toISOString();
    supabase
      .from("search_logs")
      .select("query, results_count, created_at")
      .eq("commerce_id", com.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        // Regrouper par query, compter les occurrences
        const freq = {};
        data.forEach(l => {
          const q = l.query.trim().toLowerCase();
          if (!freq[q]) freq[q] = { count: 0, results: l.results_count, last: l.created_at };
          freq[q].count++;
          if (l.created_at > freq[q].last) freq[q].last = l.created_at;
        });
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([query, info]) => ({ query, ...info }));
        setRows(sorted);
        setLoading(false);
      });
  }, [com.id, period]);

  const total = rows.reduce((acc, r) => acc + r.count, 0);
  const top = rows.slice(0, 12);

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* En-tête */}
      <div style={{ background: C.proBg, border: "1.5px solid rgba(10,61,46,0.15)", borderRadius: 18, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.pro, marginBottom: 4 }}>
          📊 Recherches produit
        </div>
        <div style={{ fontSize: 12, color: "#1A5C40", lineHeight: 1.5 }}>
          Ces données montrent ce que les voisins ont tapé sur Chipeur et qui a trouvé vos produits via les tags IA.
        </div>
      </div>

      {/* Sélecteur période */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => { setPeriod(d); setLoading(true); }}
            style={{
              border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
              fontFamily: dm, cursor: "pointer",
              background: period === d ? C.ink : C.pill,
              color: period === d ? "#fff" : C.ink2,
              transition: "all 0.15s",
            }}
          >
            {d}j
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 8 }}>
            Pas encore de données
          </div>
          <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>
            Les données apparaîtront ici quand des voisins chercheront des produits
            dans la barre de recherche principale et que leurs résultats incluront votre vitrine.
          </div>
        </div>
      ) : (
        <>
          {/* Compteur global */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 26, color: C.accent }}>{total}</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>recherches totales</div>
            </div>
            <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 26, color: C.pro }}>{rows.length}</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>mots-clés uniques</div>
            </div>
          </div>

          {/* Top recherches */}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12, fontFamily: dm }}>
            🔥 Top recherches
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top.map((r, i) => {
              const pct = Math.round((r.count / top[0].count) * 100);
              return (
                <div key={r.query} style={{ background: C.card, borderRadius: 14, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: i < 3 ? "rgba(255,87,51,0.12)" : C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i < 3 ? C.accent : C.ink2, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>{r.query}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, flexShrink: 0 }}>
                      {r.count}×
                    </div>
                  </div>
                  {/* Barre de progression */}
                  <div style={{ height: 4, borderRadius: 2, background: C.pill, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? C.accent : C.pro, borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conseil si données */}
          <div style={{ marginTop: 20, background: "rgba(255,87,51,0.06)", border: "1.5px solid rgba(255,87,51,0.15)", borderRadius: 16, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 4 }}>💡 Conseil</div>
            <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.6 }}>
              Pour apparaître dans plus de recherches, postez des photos de vos produits — les tags IA les indexent automatiquement.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── HELPER : détecte si un profil est une association / lieu local ───
function isLocaleProfile(com) {
  const cat = (com.categorie || com.category || "").toLowerCase();
  return com.role === "lieu" || cat.includes("association") || cat.includes("vie locale") || cat.includes("administratif");
}

// ─── VITRINE LOCALE (associations, mairies, lieux) ───
const CL = {
  accent: "#0A3D2E", accentBg: "#EBF5F0", accentLight: "rgba(10,61,46,0.10)",
};
const LOCALE_TABS = [
  { id: "actu",   label: "📰 Actus" },
  { id: "events", label: "📅 Événements" },
];

function VitrineLocale({ com, onBack, user }) {
  const [suivi, setSuivi]         = useState(false);
  const [activeTab, setActiveTab] = useState("actu");
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [defis, setDefis]         = useState([]);
  const [showInfos, setShowInfos] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Suivi
  useEffect(() => {
    if (!user?.id || !com.id) return;
    supabase.from("follows").select("id")
      .eq("follower_id", user.id).eq("following_id", com.id).maybeSingle()
      .then(({ data }) => { if (data) setSuivi(true); });
  }, [user?.id, com.id]);

  const handleSuivi = async () => {
    if (!user?.id || !com.id) return;
    const next = !suivi;
    setSuivi(next);
    if (next) {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: com.id });
    } else {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", com.id);
    }
  };

  // Charger les actus (posts)
  useEffect(() => {
    if (!com.id) return;
    setLoading(true);
    supabase.from("posts")
      .select("*, profiles:author_id(pseudo, avatar_url)")
      .eq("author_id", com.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, [com.id]);

  // Charger les événements (défis)
  useEffect(() => {
    if (!com.id) return;
    supabase.from("defis").select("*")
      .eq("user_id", com.id).order("created_at", { ascending: false })
      .then(({ data }) => setDefis(data || []));
  }, [com.id]);

  const typeLabel = (() => {
    const cat = (com.categorie || com.category || "").toLowerCase();
    if (cat.includes("mairie")) return "🏛️ Mairie";
    if (cat.includes("association")) return "🤝 Association";
    if (cat.includes("école") || cat.includes("college") || cat.includes("lycée")) return "🎓 Établissement scolaire";
    if (cat.includes("administratif") || cat.includes("vie locale")) return "🏛️ Service public";
    return "🏛️ Lieu local";
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Bannière */}
        <div style={{ position: "relative", width: "100%", height: "calc(190px + env(safe-area-inset-top, 0px))", overflow: "hidden" }}>
          <CoverImage src={com.cover} commerce={com} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(10,61,46,0.75) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", left: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>‹</button>
          <button onClick={handleSuivi} style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", right: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            {suivi ? "💚" : "🤍"}
          </button>
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.5, marginBottom: 4 }}>{typeLabel}</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 21, color: "#fff", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{com.name}</div>
              {com.metier && com.metier !== com.name && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{com.metier}</div>
              )}
            </div>
            <button onClick={() => setShowInfos(true)} style={{ background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 12, padding: "7px 13px", fontSize: 12, fontWeight: 700, fontFamily: dm, color: C.ink, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              ℹ️ Infos
            </button>
          </div>
        </div>

        {/* Bio si renseignée */}
        {com.desc && (
          <div style={{ background: CL.accentBg, borderBottom: `1px solid rgba(10,61,46,0.12)`, padding: "12px 16px" }}>
            <div style={{ fontSize: 13, color: CL.accent, lineHeight: 1.6, fontWeight: 500 }}>{com.desc}</div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "10px 16px 8px", background: C.bg, overflowX: "auto", scrollbarWidth: "none" }}>
          {LOCALE_TABS.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flexShrink: 0, border: "none", borderRadius: 20, cursor: "pointer",
                padding: "7px 16px", fontSize: 12, fontWeight: 600, fontFamily: dm,
                background: isActive ? CL.accent : C.pill,
                color: isActive ? "#fff" : C.ink2,
                transition: "all 0.15s",
              }}>{t.label}</button>
            );
          })}
        </div>

        {/* ── Onglet ACTUS ── */}
        {activeTab === "actu" && (
          <div style={{ padding: "8px 16px 100px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📰</div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucune actualité pour l'instant</div>
                <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Les actualités et annonces apparaîtront ici.</div>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} onClick={() => setSelectedPost(post)} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 12, overflow: "hidden", cursor: "pointer" }}>
                  {post.image_url && (
                    <div style={{ width: "100%", height: 180, overflow: "hidden" }}>
                      <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: post.content ? 8 : 0 }}>
                      <Avatar pseudo={post.profiles?.pseudo} avatarUrl={post.profiles?.avatar_url} size={28} />
                      <div>
                        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink }}>{post.profiles?.pseudo || com.name}</div>
                        <div style={{ fontSize: 10, color: C.ink2 }}>{new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</div>
                      </div>
                    </div>
                    {post.content && <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55 }}>{post.content}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Onglet ÉVÉNEMENTS ── */}
        {activeTab === "events" && (
          <div style={{ padding: "8px 16px 100px" }}>
            {defis.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun événement prévu</div>
                <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Les événements et activités apparaîtront ici.</div>
              </div>
            ) : (
              defis.map(d => {
                const now = new Date();
                const enCours = !d.ended && (!d.ends_at || new Date(d.ends_at) > now);
                const daysLeft = d.ends_at && !d.ended ? Math.max(0, Math.ceil((new Date(d.ends_at) - now) / 86400000)) : null;
                return (
                  <div key={d.id} style={{ background: C.card, borderRadius: 18, marginBottom: 12, border: `1.5px solid ${enCours ? "rgba(10,61,46,0.25)" : C.border}`, overflow: "hidden" }}>
                    {d.photo_url && <div style={{ width: "100%", height: 130, overflow: "hidden" }}><img src={d.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>{d.emoji || "📅"} {d.title}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: enCours ? CL.accentBg : C.pill, color: enCours ? CL.accent : C.ink2, flexShrink: 0 }}>
                          {enCours ? "En cours" : "Terminé"}
                        </div>
                      </div>
                      {d.description && <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 8 }}>{d.description}</div>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {d.reward && <span style={{ fontSize: 11, background: CL.accentBg, color: CL.accent, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>🎁 {d.reward}</span>}
                        {enCours && daysLeft !== null && <span style={{ fontSize: 11, background: CL.accentBg, color: CL.accent, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>⏳ {daysLeft}j restants</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal post */}
        {selectedPost && (
          <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} isOwner={user?.id === com.id} comId={com.id} onEnrich={() => {}} />
        )}
      </div>

      {/* Drawer Infos */}
      {showInfos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowInfos(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "relative", background: C.card, borderRadius: "22px 22px 0 0", paddingBottom: "env(safe-area-inset-bottom, 16px)", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 0" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>{com.name}</div>
              <button onClick={() => setShowInfos(false)} style={{ background: C.pill, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink2 }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              <TabInfos com={com} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VITRINE DÉTAIL ───
function VitrineScreen({ com, onBack, user }) {
  const [suivi, setSuivi] = useState(false);

  // Charger l'état de suivi depuis Supabase
  useEffect(() => {
    if (!user?.id || !com.id) return;
    supabase.from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", com.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setSuivi(true); });
  }, [user?.id, com.id]);

  const handleSuivi = async () => {
    if (!user?.id || !com.id) return;
    const prev = suivi;
    const next = !suivi;
    setSuivi(next);
    if (next) {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: com.id });
      if (error) { console.error("Erreur ajout follow:", error); setSuivi(prev); }
    } else {
      const { error } = await supabase.from("follows").delete()
        .eq("follower_id", user.id).eq("following_id", com.id);
      if (error) { console.error("Erreur suppression follow:", error); setSuivi(prev); }
    }
  };
  const [showInfos, setShowInfos] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [realPosts, setRealPosts] = useState(com.isDemo ? DEMO_POSTS : []);
  const [loadingPosts, setLoadingPosts] = useState(!com.isDemo);


  useEffect(() => {
    if (com.isDemo || !com.id) return;
    setLoadingPosts(true);

    async function loadPosts() {
      // 1a. Posts publiés par le commerce lui-même
      const { data: ownPosts } = await supabase
        .from("posts")
        .select("*, profiles:author_id(pseudo, avatar_url)")
        .eq("author_id", com.id)
        .order("created_at", { ascending: false });

      // 1b. Posts de voisins liés à ce commerce — uniquement ceux acceptés
      const { data: linkedAccepted } = await supabase
        .from("posts")
        .select("*, profiles:author_id(pseudo, avatar_url)")
        .eq("magasin_id", com.id)
        .neq("author_id", com.id)
        .eq("linked_status", "accepted")
        .order("created_at", { ascending: false });

      const directPosts = [...(ownPosts || []), ...(linkedAccepted || [])];

      // 2. Posts de réponse aux défis lancés par ce commerce
      const { data: merchantDefis } = await supabase
        .from("defis")
        .select("id")
        .eq("user_id", com.id);

      let defiPosts = [];
      if (merchantDefis && merchantDefis.length > 0) {
        const defiIds = merchantDefis.map(d => d.id);
        const { data } = await supabase
          .from("posts")
          .select("*, profiles:author_id(pseudo, avatar_url)")
          .in("defi_id", defiIds)
          .order("created_at", { ascending: false });
        defiPosts = data || [];
      }

      // Fusionner + dédoublonner par id + trier par date
      const seenIds = new Set();
      const allPosts = [...(directPosts || []), ...defiPosts]
        .filter(p => { if (seenIds.has(p.id)) return false; seenIds.add(p.id); return true; })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRealPosts(allPosts);
      setLoadingPosts(false);
    }

    loadPosts();
  }, [com.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Bannière */}
        <div style={{ position: "relative", width: "100%", height: "calc(200px + env(safe-area-inset-top, 0px))", overflow: "hidden" }}>
          <CoverImage src={com.cover} commerce={com} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(26,23,20,0.7) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", left: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>‹</button>
          {com.isDemo ? (
            <div style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", right: 14, background: "rgba(255,87,51,0.92)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 10, letterSpacing: 0.5 }}>✨ EXEMPLE</div>
          ) : (
            <button onClick={handleSuivi} style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top, 0px))", right: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              {suivi ? "❤️" : "🤍"}
            </button>
          )}
          {/* Nom + catégorie + bouton Infos */}
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 22, color: "#fff", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{com.name}</div>
              {(com.metier || com.category) && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{com.metier || com.category}</div>
              )}
            </div>
            <button onClick={() => setShowInfos(true)} style={{ background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 12, padding: "7px 13px", fontSize: 12, fontWeight: 700, fontFamily: dm, color: C.ink, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              ℹ️ Infos
            </button>
          </div>
        </div>

        {/* ── Barre de recherche par tags IA ── */}
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 14px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 12, fontSize: 15, color: C.ink2, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              style={{
                width: "100%", boxSizing: "border-box",
                border: `1.5px solid ${tagSearch ? C.accent : C.border}`,
                borderRadius: 14, padding: "10px 36px 10px 38px",
                fontSize: 13, fontFamily: dm, color: C.ink,
                background: C.bg, outline: "none",
                transition: "border-color 0.15s",
              }}
            />
            {tagSearch && (
              <button
                onClick={() => setTagSearch("")}
                style={{ position: "absolute", right: 10, background: C.pill, border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, color: C.ink2, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            )}
          </div>
        </div>

        {/* Bannière demo */}
        {com.isDemo && (
          <div style={{ margin: "12px 16px 0", background: "rgba(255,87,51,0.07)", border: "1px solid rgba(255,87,51,0.2)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.accent }}>Exemple de vitrine</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 1, lineHeight: 1.4 }}>Voici à quoi ressemble une vitrine remplie — posts, promos, défis et photos.</div>
            </div>
          </div>
        )}

        {/* Feed principal */}
        <TabVitrine com={com} realPosts={realPosts} loadingPosts={loadingPosts} user={user} demoDefis={com.isDemo ? DEMO_DEFIS : undefined} tagSearch={tagSearch} />
      </div>


      {/* ── DRAWER INFOS ── */}
      {showInfos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {/* Fond semi-transparent */}
          <div onClick={() => setShowInfos(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          {/* Panneau */}
          <div style={{ position: "relative", background: C.card, borderRadius: "22px 22px 0 0", paddingBottom: "env(safe-area-inset-bottom, 16px)", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
            {/* Poignée */}
            <div style={{ width: 38, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 0" }} />
            {/* En-tête */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 0" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>{com.name}</div>
              <button onClick={() => setShowInfos(false)} style={{ background: C.pill, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink2 }}>✕</button>
            </div>
            {/* Scroll */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              <TabInfos com={com} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GRILLE RÉSULTATS PRODUIT ───
function ProductSearchGrid({ results, loading, onOpenShop }) {
  if (loading) {
    return <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Recherche…</div>;
  }
  if (results.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun produit trouvé</div>
        <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Essaie un autre mot-clé (ex : robe, croissant, massage…)</div>
      </div>
    );
  }
  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 16px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        🛍️ Produits correspondants
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{results.length} résultat{results.length > 1 ? "s" : ""}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, padding: "0 2px" }}>
        {results.map((r) => (
          <div
            key={r.post_id}
            onClick={() => onOpenShop(r)}
            style={{ aspectRatio: "1", overflow: "hidden", cursor: "pointer", position: "relative", background: C.pill }}
          >
            {r.image_url ? (
              <img src={r.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏪</div>
            )}
            {/* Tag matché */}
            {r.matched_tag && (
              <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(255,87,51,0.88)", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                {r.matched_tag}
              </div>
            )}
            {/* Nom boutique */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", padding: "16px 5px 4px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 3px" }}>
                {r.commerce_nom}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function ChipeurCommerces({ setPage, user }) {
  const [screen, setScreen] = useState("list");
  const [selectedCom, setSelectedCom] = useState(null);
  const [activeCats, setActiveCats] = useState(new Set(["Tous"]));
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("commerce"); // "commerce" | "produit"
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const searchTimer = useRef(null);
  // null = accueil tuiles | "commerces" | "beaute" | "restauration" | "artisan" | "lieu" | "all" | "nouveaux"

  // ── Recherche produit : debounce 400ms + appel RPC + log ──
  useEffect(() => {
    if (searchMode !== "produit" || !search.trim() || search.trim().length < 2) {
      setProductResults([]);
      setLoadingProducts(false);
      return;
    }
    setLoadingProducts(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const q = search.trim();
      const { data, error } = await supabase.rpc("search_posts_by_tag", { query: q });
      const results = error ? [] : (data || []);
      setProductResults(results);
      setLoadingProducts(false);

      // Log fire-and-forget — une entrée par commerce trouvé
      const seen = new Set();
      for (const r of results) {
        if (!seen.has(r.commerce_id)) {
          seen.add(r.commerce_id);
          supabase.from("search_logs").insert({
            query: q,
            type: "produit",
            results_count: results.filter(x => x.commerce_id === r.commerce_id).length,
            commerce_id: r.commerce_id,
            user_id: user?.id || null,
          }).then(() => {});
        }
      }
      // Log si aucun résultat
      if (results.length === 0) {
        supabase.from("search_logs").insert({
          query: q,
          type: "produit",
          results_count: 0,
          user_id: user?.id || null,
        }).then(() => {});
      }
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search, searchMode]);

  const toggleCat = (key) => {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (key === "Tous") return new Set(["Tous"]);
      next.delete("Tous");
      if (next.has(key)) { next.delete(key); if (next.size === 0) return new Set(["Tous"]); }
      else next.add(key);
      return next;
    });
  };

  const goToSection = (key) => setActiveSection(key);
  const backToHome = () => setActiveSection(null);
  const [realMerchants, setRealMerchants] = useState([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Charger les vrais commerçants depuis Supabase
  // Filtre : role = "magasin" (set par le trigger auth) OU categorie non nulle (anciens comptes)
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, pseudo, bio, quartier, avatar_url, categorie, metier, phone, website, instagram, facebook, horaires, role, photo_urls, current_opening_hours, created_at, plan, vitrine_filtres")
      .or("role.eq.magasin,role.eq.lieu,categorie.not.is.null")
      .not("pseudo", "is", null)
      .neq("pseudo", "[Compte supprimé]")
      .then(async ({ data: rawProfiles }) => {
        const profiles = (rawProfiles || []).filter(p => p.pseudo && p.pseudo !== "[Compte supprimé]");
        if (!profiles || profiles.length === 0) {
          setLoadingMerchants(false);
          return;
        }
        const withCounts = await Promise.all(
          profiles.map(async p => {
            const { count } = await supabase
              .from("posts")
              .select("id", { count: "exact", head: true })
              .eq("author_id", p.id);
            return profileToCommerce(p, count);
          })
        );
        setRealMerchants(withCounts);
        setLoadingMerchants(false);
      });
  }, []);

  // Fusionner vrais marchands + statiques (pas de doublons)
  const allCommerces = [...realMerchants, ...STATIC_COMMERCES];

  // Filtrer par thèmes (multi) + recherche
  const isAllCats = activeCats.has("Tous");
  const filtered = allCommerces.filter(c => {
    if (!isAllCats && !Array.from(activeCats).some(k => matchesTheme(c, k))) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [c.name, c.desc, c.cat, c.metier, c.categorie].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const featured = filtered.find(c => c.featured);
  const others = filtered.filter(c => !c.featured);

  // ── Sections thématiques ──
  const beauteItems         = allCommerces.filter(c => matchesTheme(c, "Beauté"));
  const restoItems          = allCommerces.filter(c => matchesTheme(c, "Restauration"));
  const artisanItems        = allCommerces.filter(c => matchesTheme(c, "Artisan"));
  const divertissementItems = allCommerces.filter(c => matchesTheme(c, "Divertissement"));
  const vieLocaleItems      = allCommerces.filter(c => matchesTheme(c, "Vie locale") || (c.role === "lieu" && !matchesTheme(c, "Divertissement")));
  const specialIds          = new Set([...beauteItems, ...restoItems, ...artisanItems, ...divertissementItems, ...vieLocaleItems].map(c => c.id));
  const mainCommerces       = allCommerces.filter(c => !specialIds.has(c.id));
  const nouveauxItems       = [...allCommerces].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const sectionItemsMap = {
    commerces:      mainCommerces,
    beaute:         beauteItems,
    restauration:   restoItems,
    artisan:        artisanItems,
    divertissement: divertissementItems,
    vie_locale:     vieLocaleItems,
    all:            allCommerces,
    nouveaux:       nouveauxItems,
  };

  const tileCounts = {
    commerces:      mainCommerces.length,
    beaute:         beauteItems.length,
    restauration:   restoItems.length,
    artisan:        artisanItems.length,
    divertissement: divertissementItems.length,
    vie_locale:     vieLocaleItems.length,
    all:            allCommerces.length,
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "list" && (
        <>
          {/* ── HEADER ── */}
          <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>

            {/* Ligne logo / titre / compteur — ou bouton retour si section active */}
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px 8px", gap: 10 }}>
              {activeSection && !search ? (
                <>
                  <button onClick={backToHome} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink, padding: 0, lineHeight: 1 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>
                      {SECTION_LABELS[activeSection]?.emoji} {SECTION_LABELS[activeSection]?.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.ink2 }}>{(sectionItemsMap[activeSection] || []).length} membre{(sectionItemsMap[activeSection] || []).length > 1 ? "s" : ""}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="26" height="26" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs><linearGradient id="pinGradC" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FF5733"/><stop offset="100%" stopColor="#FF8C42"/></linearGradient></defs>
                      <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradC)"/>
                      <circle cx="36" cy="26" r="10" fill="white"/>
                      <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 19, lineHeight: 1, letterSpacing: -0.5, color: "#1A1A2E" }}>chi<span style={{ color: C.accent }}>p</span>eur</div>
                      <div style={{ fontFamily: dm, fontSize: 10, color: C.accent, lineHeight: 1.5, marginTop: 3 }}>Découvre ta ville, à travers tes voisins</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 11, color: C.ink2 }}>{allCommerces.length} vitrines</div>
                </>
              )}
            </div>

            {/* Toggle mode recherche */}
            <div style={{ display: "flex", margin: "0 14px 8px", background: C.pill, borderRadius: 12, padding: 3, gap: 2 }}>
              {[
                { id: "commerce", label: "🏪 Commerce" },
                { id: "produit",  label: "🛍️ Produit" },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSearchMode(m.id); setSearch(""); setProductResults([]); }}
                  style={{
                    flex: 1, border: "none", borderRadius: 10, padding: "6px 0",
                    fontSize: 12, fontWeight: 700, fontFamily: dm, cursor: "pointer",
                    background: searchMode === m.id ? C.card : "transparent",
                    color: searchMode === m.id ? C.ink : C.ink2,
                    boxShadow: searchMode === m.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {/* Barre de recherche */}
            <div style={{ margin: "0 14px 10px", display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 14, padding: "8px 14px", border: `1px solid ${search && searchMode === "produit" ? C.accent : C.border}`, transition: "border-color 0.15s" }}>
              <span style={{ fontSize: 13, color: C.ink2 }}>🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); if (e.target.value && searchMode === "commerce") setActiveSection(null); }}
                placeholder={searchMode === "commerce" ? "Recherche un commerce, artisan…" : "Recherche un produit : robe, pizza, massage…"}
                style={{ border: "none", outline: "none", fontSize: 13, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }}
              />
              {search && <span onClick={() => { setSearch(""); setProductResults([]); }} style={{ fontSize: 13, cursor: "pointer", color: C.ink2 }}>✕</span>}
            </div>
          </div>

          {/* ── CONTENU SCROLLABLE ── */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingMerchants ? (
              <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.ink2 }}>⏳ Chargement…</div>

            ) : searchMode === "produit" && search.trim() ? (
              /* ══ RECHERCHE PRODUIT ══ */
              <div style={{ padding: "8px 0" }}>
                <ProductSearchGrid
                  results={productResults}
                  loading={loadingProducts}
                  onOpenShop={(r) => {
                    // Trouver le commerce correspondant dans allCommerces ou construire un objet minimal
                    const found = allCommerces.find(c => c.id === r.commerce_id);
                    if (found) { setSelectedCom(found); setScreen("vitrine"); }
                    else {
                      // Commerce pas encore chargé, construire un objet minimal pour ouvrir la vitrine
                      setSelectedCom({
                        id: r.commerce_id,
                        name: r.commerce_nom,
                        categorie: r.commerce_cat,
                        category: r.commerce_cat,
                        metier: r.commerce_cat,
                        cat: r.commerce_cat,
                        cover: null,
                        plan: "premium",
                        vitrine_filtres: [],
                        gallery: [],
                        hours: [],
                        products: [],
                      });
                      setScreen("vitrine");
                    }
                  }}
                />
              </div>

            ) : searchMode === "commerce" && search.trim() ? (
              /* ══ RECHERCHE COMMERCE ══ */
              <div style={{ padding: "8px 16px 80px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  🔍 Résultats
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 16px" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucun résultat</div>
                    <div style={{ fontSize: 12, color: C.ink2 }}>Essaie un autre terme.</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {filtered.map((c, i) => <ComGridCard key={c.id || i} com={c} onClick={() => { setSelectedCom(c); setScreen("vitrine"); }} />)}
                  </div>
                )}
              </div>

            ) : activeSection ? (
              /* ══ VUE SECTION (catégorie sélectionnée) ══ */
              <div style={{ padding: "8px 0 80px" }}>
                {/* Photos de la section */}
                {activeSection !== "nouveaux" && (
                  <div style={{ padding: "8px 0 4px" }}>
                    <SectionPhotos
                      merchants={sectionItemsMap[activeSection] || []}
                      onOpenShop={(shop) => { setSelectedCom(shop); setScreen("vitrine"); }}
                    />
                  </div>
                )}
                <div style={{ padding: "0 16px" }}>
                {(sectionItemsMap[activeSection] || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 16px" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{SECTION_LABELS[activeSection]?.emoji}</div>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucun membre pour l'instant</div>
                    <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Les premiers membres de cette catégorie apparaîtront ici dès leur inscription.</div>
                  </div>
                ) : activeSection === "nouveaux" ? (
                  /* Nouveaux membres : vue liste verticale */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(sectionItemsMap.nouveaux || []).map((c, i) => (
                      <div key={c.id || i} onClick={() => { setSelectedCom(c); setScreen("vitrine"); }} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, borderRadius: 16, padding: "12px 14px", cursor: "pointer", border: `1px solid ${C.border}` }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: C.pill }}>
                          <CoverImage src={c.cover} commerce={c} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>{catLabel(c.categorie || c.category || "Commerce")}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.ink2 }}>›</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Section standard : grille 2 col */
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {(sectionItemsMap[activeSection] || []).map((c, i) => (
                      <ComGridCard key={c.id || i} com={c} onClick={() => { setSelectedCom(c); setScreen("vitrine"); }} />
                    ))}
                  </div>
                )}
                </div>
              </div>

            ) : (
              /* ══ ACCUEIL — TUILES ══ */
              <>
                {/* Tuiles catégories */}
                <CategoryTiles counts={tileCounts} onSelect={goToSection} />

                {/* DÉMO si aucun commerçant */}
                {realMerchants.length === 0 && (
                  <div style={{ padding: "12px 16px 4px" }}>
                    <SectionHeader emoji="✨" title="Exemple de vitrine" accent={C.accent} />
                    <div style={{ position: "relative" }}>
                      <ComCard com={DEMO_COMMERCE} onClick={() => { setSelectedCom(DEMO_COMMERCE); setScreen("vitrine"); }} />
                      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, background: "rgba(26,23,20,0.7)", borderRadius: 10, padding: "7px 12px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: dm }}>👆 Voir à quoi ressemble une vitrine complète</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ height: 80 }} />
              </>
            )}
          </div>
        </>
      )}

      {screen === "vitrine" && selectedCom && (
        isLocaleProfile(selectedCom)
          ? <VitrineLocale com={selectedCom} onBack={() => setScreen("list")} user={user} />
          : <VitrineScreen com={selectedCom} onBack={() => setScreen("list")} user={user} />
      )}

      <BottomNav active="commerces" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
