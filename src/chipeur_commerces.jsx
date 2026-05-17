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
  { key: "Beauté",        emoji: "💄", match: ["beauté","bien-être","coiffure","esthétique","massage","spa","ongle","tatouage"], short: "Beauté" },
  { key: "Restauration",  emoji: "🍽️", match: ["restauration","traiteur","resto","café","boulangerie","pizza","kebab"], short: "Resto" },
  { key: "Alimentation",  emoji: "🧀", match: ["alimentation","épicerie","bio","fromagerie","boucherie","poissonnerie","fruits"], short: "Alim." },
  { key: "Artisan",       emoji: "🎨", match: ["artisan","bijoux","poterie","couture","bois","cuir","création"], short: "Artisan" },
  { key: "Maison",        emoji: "🏠", match: ["maison","décoration","mobilier","bricolage","jardinage"], short: "Maison" },
  { key: "Sport",         emoji: "🏃", match: ["sport","loisirs","vélo","outdoor","jeux"], short: "Sport" },
  { key: "Culture",       emoji: "📚", match: ["culture","librairie","papeterie","cadeaux","art","musique"], short: "Culture" },
  { key: "Services",      emoji: "🔧", match: ["services","plomberie","électricité","informatique","pressing"], short: "Services" },
  { key: "Autre",         emoji: "✨", match: [], short: "Autre", isAutre: true },
];

// Pour compat avec l'ancien code
const CATEGORIES = THEMES;

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
    open_now: p.current_opening_hours?.open_now ?? null,
    vues: "—", int: "—",
    posts: postCount != null ? String(postCount) : "—",
    plan: "Découverte",
    planBg: C.pill,
    planColor: C.ink2,
    tag: `#${cat}`,
    phone: p.phone || null,
    adresse: p.quartier || null,
    website: p.website || null,
    instagram: p.instagram || null,
    facebook: p.facebook || null,
    hours: Array.isArray(p.horaires) ? p.horaires.filter(h => h.h) : [],
    products: [],
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
  plan: "Mixte", planBg: "rgba(255,87,51,0.12)", planColor: "#FF5733", tag: "#Mode",
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
        {/* Badge Ouvert / Fermé */}
        {com.open_now !== null && com.open_now !== undefined && (
          <div style={{ position: "absolute", top: 7, left: 7, background: com.open_now ? "#22C55E" : "#EF4444", borderRadius: 7, padding: "2px 7px", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: com.open_now ? 1 : 0.7 }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{com.open_now ? "Ouvert" : "Fermé"}</span>
          </div>
        )}
        {/* Posts count */}
        {com.posts !== "—" && (
          <div style={{ position: "absolute", top: 7, left: 7, background: "rgba(0,0,0,0.48)", borderRadius: 8, padding: "3px 7px", fontSize: 9, color: "#fff", fontFamily: dm, fontWeight: 600 }}>
            📸 {com.posts}
          </div>
        )}
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
function VitrinePostCard({ post, userId, comId, isOwner, onEnrich }) {
  const [lightbox, setLightbox] = useState(false);
  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return diff + "min";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return Math.floor(diff / 1440) + "j";
  };
  const canEnrich = isOwner && post.magasin_id === comId;
  const hasEnrichment = post.product_label || post.product_price;

  return (
    <>
      {lightbox && post.image_url && (
        <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 18, cursor: "pointer" }}>✕</button>
          <img src={post.image_url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
        </div>
      )}
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
        {/* Header auteur */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }}>
          <Avatar pseudo={post.profiles?.pseudo} avatarUrl={post.profiles?.avatar_url} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontSize: 13, fontWeight: 700, color: C.ink }}>{post.profiles?.pseudo || "Voisin·e"}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{timeAgo(post.created_at)}</div>
          </div>
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

// ─── CHIPS VITRINE ───
const VITRINE_MODES = [
  { id: "galerie", label: "Photos" },
  { id: "tout",    label: "🃏 Posts" },
  { id: "promos",  label: "🎁 Promos" },
  { id: "defis",   label: "🏆 Défis" },
  { id: "postes",  label: "📬 Liés", ownerOnly: true },
];

function VitrineChips({ activeMode, onChange, isOwner }) {
  const visible = VITRINE_MODES.filter(m => !m.ownerOnly || isOwner);
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px 8px", scrollbarWidth: "none", background: C.bg }}>
      {visible.map(m => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              flexShrink: 0, border: "none", borderRadius: 20, cursor: "pointer",
              padding: "7px 16px", fontSize: 12, fontWeight: 600, fontFamily: dm,
              background: isActive ? C.ink : C.pill,
              color:      isActive ? "#fff" : C.ink2,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {m.label}
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
function TabVitrine({ com, realPosts, loadingPosts, user, demoDefis }) {
  const [posts, setPosts] = useState(realPosts);
  const [activeMode, setActiveMode] = useState("galerie");
  const [selectedPost, setSelectedPost] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [enrichingPost, setEnrichingPost] = useState(null);
  const [defis, setDefis] = useState(demoDefis || []);
  const [loadingDefis, setLoadingDefis] = useState(false);
  const [linkedPosts, setLinkedPosts] = useState([]);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const touchXVit = useRef(null);

  useEffect(() => { setPosts(realPosts); }, [realPosts]);

  // Charger les défis quand on passe en mode défis (sauf démo)
  useEffect(() => {
    if (com.isDemo || activeMode !== "defis" || defis.length > 0) return;
    setLoadingDefis(true);
    supabase.from("defis").select("*")
      .eq("user_id", com.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDefis(data || []); setLoadingDefis(false); });
  }, [activeMode, com.id]);

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

  // Listes filtrées
  const photoPosts = posts.filter(p => !!p.image_url);
  const filtered = activeMode === "galerie"  ? photoPosts
    : activeMode === "cartes"  ? posts
    : activeMode === "promos"  ? posts.filter(p => p.post_type === "bonplan" || p.post_type === "promo")
    : posts; // "tout" = tout

  const defisEnCours  = defis.filter(d => !d.ended);
  const defisTermines = defis.filter(d => !!d.ended);

  return (
    <div style={{ padding: "0 0 100px" }}>
      {/* Chips mode */}
      <VitrineChips activeMode={activeMode} onChange={setActiveMode} isOwner={isOwner} />

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

      {/* ── Mode DÉFIS ── */}
      {activeMode === "defis" && (
        <div style={{ padding: "0 16px" }}>
          {loadingDefis ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
          ) : defis.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>
              Aucun défi lancé pour l'instant.
            </div>
          ) : (
            <>
              {defisEnCours.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: dm, marginBottom: 10, marginTop: 4 }}>
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
        </div>
      )}

      {/* ── Mode GALERIE ── */}
      {activeMode === "galerie" && (
        loadingPosts ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
        ) : photoPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>Aucune photo pour l'instant.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, padding: "0 2px" }}>
            {photoPosts.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => setLightboxIndex(idx)}
                style={{ aspectRatio: "1", overflow: "hidden", cursor: "pointer", position: "relative", background: C.pill }}
              >
                <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {(post.product_label || post.product_price) && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: C.pro, borderRadius: 6, padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#fff" }}>✦</div>
                )}
                {(post.post_type === "bonplan" || post.post_type === "promo") && (
                  <div style={{ position: "absolute", top: 4, left: 4, background: C.accent, borderRadius: 6, padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#fff" }}>🎁</div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Mode TOUT, CARTES, PROMOS ── */}
      {(activeMode === "tout" || activeMode === "cartes" || activeMode === "promos") && (
        loadingPosts ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>
            {activeMode === "promos" ? "Aucune promo pour l'instant." : "Aucun contenu pour l'instant."}
          </div>
        ) : (
          <div style={{ padding: "0 16px" }}>
            {filtered.map(post => (
              <VitrinePostCard
                key={post.id}
                post={post}
                userId={user?.id}
                comId={com.id}
                isOwner={isOwner}
                onEnrich={() => setEnrichingPost(post)}
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
              <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "14px 18px 32px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar pseudo={photo.profiles?.pseudo} avatarUrl={photo.profiles?.avatar_url} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>{photo.profiles?.pseudo || "Voisin·e"}</div>
                    {photo.content && <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{photo.content}</div>}
                  </div>
                </div>
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
    </div>
  );
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
                  {com.open_now ? "● Ouvert maintenant" : "● Fermé"}
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
  const [activeTab, setActiveTab] = useState("vitrine");
  const [realPosts, setRealPosts] = useState(com.isDemo ? DEMO_POSTS : []);
  const [loadingPosts, setLoadingPosts] = useState(!com.isDemo);
  const [realPostCount, setRealPostCount] = useState(com.isDemo ? DEMO_POSTS.length : null);
  const [followersCount, setFollowersCount] = useState(com.isDemo ? 12 : null);
  const [reactionsCount, setReactionsCount] = useState(com.isDemo ? 47 : null);

  useEffect(() => {
    if (com.isDemo || !com.id) return;
    // Abonnés
    supabase.from("follows").select("id", { count: "exact", head: true })
      .eq("following_id", com.id)
      .then(({ count }) => setFollowersCount(count ?? 0));
  }, [com.id]);

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
      setRealPostCount(allPosts.length);
      setLoadingPosts(false);

      // Réactions totales
      if (allPosts.length > 0) {
        const ids = allPosts.map(p => p.id);
        supabase.from("post_reactions").select("id", { count: "exact", head: true })
          .in("post_id", ids)
          .then(({ count }) => setReactionsCount(count ?? 0));
      } else {
        setReactionsCount(0);
      }
    }

    loadPosts();
  }, [com.id]);

  const displayPosts = realPostCount != null ? String(realPostCount) : com.posts;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Bannière */}
        <div style={{ position: "relative", width: "100%", height: 200, overflow: "hidden" }}>
          <CoverImage src={com.cover} commerce={com} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(26,23,20,0.7) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>‹</button>
          {com.isDemo && (
            <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,87,51,0.92)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 10, letterSpacing: 0.5 }}>✨ EXEMPLE</div>
          )}
          <div style={{ position: "absolute", bottom: 14, left: 16 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 22, color: "#fff", lineHeight: 1 }}>{com.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{com.cat}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.card }}>
          {[
            { n: displayPosts,                   l: "posts",     icon: "📸" },
            { n: reactionsCount ?? "—",          l: "réactions", icon: "❤️" },
            { n: followersCount ?? "—",          l: "abonnés",   icon: "👥" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.ink2, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}` }}>
          {[{ id: "vitrine", label: "🖼 Vitrine" }, { id: "infos", label: "ℹ️ Infos" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "12px 0 10px", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, fontFamily: dm, cursor: "pointer", color: activeTab === t.id ? C.accent : C.ink2, borderBottom: `2.5px solid ${activeTab === t.id ? C.accent : "transparent"}`, transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "vitrine" && (
          <>
            {com.isDemo && (
              <div style={{ margin: "12px 16px 0", background: "rgba(255,87,51,0.07)", border: "1px solid rgba(255,87,51,0.2)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>✨</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.accent }}>Exemple de vitrine</div>
                  <div style={{ fontSize: 11, color: C.ink2, marginTop: 1, lineHeight: 1.4 }}>Voici à quoi ressemble une vitrine remplie — posts, promos, défis et infos.</div>
                </div>
              </div>
            )}
            <TabVitrine com={com} realPosts={realPosts} loadingPosts={loadingPosts} user={user} demoDefis={com.isDemo ? DEMO_DEFIS : undefined} />
          </>
        )}
        {activeTab === "infos" && <TabInfos com={com} />}
      </div>

      {/* Bouton fixe */}
      <button onClick={handleSuivi} style={{ position: "absolute", bottom: 90, left: 18, right: 18, border: "none", borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", background: suivi ? C.ink : C.accent, color: "#fff", transition: "all 0.2s", zIndex: 10 }}>
        {suivi ? "✓ Vitrine suivie" : "+ Suivre cette vitrine"}
      </button>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function ChipeurCommerces({ setPage, user }) {
  const [screen, setScreen] = useState("list");
  const [selectedCom, setSelectedCom] = useState(null);
  const [activeCats, setActiveCats] = useState(new Set(["Tous"]));
  const [search, setSearch] = useState("");

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
  const [realMerchants, setRealMerchants] = useState([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Charger les vrais commerçants depuis Supabase
  // Filtre : role = "magasin" (set par le trigger auth) OU categorie non nulle (anciens comptes)
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, pseudo, bio, quartier, avatar_url, categorie, metier, phone, website, instagram, facebook, horaires, role")
      .or("role.eq.magasin,categorie.not.is.null")
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

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "list" && (
        <>
          {/* ── HEADER style fil ── */}
          <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="26" height="26" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="pinGradC" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FF5733"/><stop offset="100%" stopColor="#FF8C42"/></linearGradient></defs>
                  <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradC)"/>
                  <circle cx="36" cy="26" r="10" fill="white"/>
                  <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
                </svg>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 19, lineHeight: 1, letterSpacing: -0.5, color: "#1A1A2E" }}>chi<span style={{ color: C.accent }}>p</span>eur</div>
                  <div style={{ fontFamily: dm, fontSize: 10, color: C.accent, lineHeight: 1.5, marginTop: 3 }}>Découvre ta ville,<br />à travers tes voisins</div>
                </div>
              </div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Boutiques 🏪</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>{filtered.length} vitrines</div>
            </div>

            {/* Recherche */}
            <div style={{ margin: "0 14px 8px", display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 14, padding: "8px 14px", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.ink2 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Recherche un commerce, artisan…" style={{ border: "none", outline: "none", fontSize: 13, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }} />
              {search && <span onClick={() => setSearch("")} style={{ fontSize: 13, cursor: "pointer", color: C.ink2 }}>✕</span>}
            </div>

            {/* Chips filtres catégories */}
            <CategoryChips active={activeCats} onToggle={toggleCat} />
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingMerchants ? (
              <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.ink2 }}>⏳ Chargement…</div>
            ) : (
              <>
                {/* ── Bandeau photos récentes ── */}
                {isAllCats && !search && (
                  <div style={{ padding: "12px 0 8px" }}>
                    <RecentShopPhotos
                      merchants={realMerchants}
                      onOpenShop={(shop) => { setSelectedCom(shop); setScreen("vitrine"); }}
                    />
                  </div>
                )}

                {/* ── Section DÉMO en premier ── */}
                {!search && (
                  <div style={{ padding: "8px 16px 4px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      ✨ Exemple de vitrine
                      <div style={{ flex: 1, height: 1, background: "rgba(255,87,51,0.2)" }} />
                      <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: C.ink2 }}>aperçu</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <ComCard com={DEMO_COMMERCE} onClick={() => { setSelectedCom(DEMO_COMMERCE); setScreen("vitrine"); }} />
                      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, background: "rgba(26,23,20,0.7)", borderRadius: 10, padding: "7px 12px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: dm }}>👆 Voir à quoi ressemble une vitrine complète</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Bandeau "bientôt" si peu de contenu ── */}
                {!search && realMerchants.length > 0 && realMerchants.length < 8 && (
                  <div style={{ margin: "4px 16px 4px", background: C.proBg, border: `1px solid rgba(10,61,46,0.12)`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🌱</span>
                    <div>
                      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.pro }}>Les vitrines arrivent !</div>
                      <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, lineHeight: 1.4 }}>Les commerçants de Saint-Dié rejoignent Chipeur — les vitrines se mettent en place.</div>
                    </div>
                  </div>
                )}

                {/* ── Liste boutiques ── */}
                <div style={{ padding: "8px 16px 80px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    🏪 Les boutiques
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{filtered.length} inscrit{filtered.length > 1 ? "s" : ""}</span>
                  </div>

                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 16px" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
                      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucun commerce trouvé</div>
                      <div style={{ fontSize: 12, color: C.ink2 }}>Essaie un autre filtre ou une autre recherche.</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {filtered.map((c, i) => (
                        <ComGridCard key={i} com={c} onClick={() => { setSelectedCom(c); setScreen("vitrine"); }} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {screen === "vitrine" && selectedCom && (
        <VitrineScreen com={selectedCom} onBack={() => setScreen("list")} user={user} />
      )}

      <BottomNav active="commerces" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
