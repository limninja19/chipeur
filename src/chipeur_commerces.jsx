import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

// ─── DONNÉES STATIQUES (modèle de démonstration uniquement) ───
const STATIC_COMMERCES = [
  {
    id: null, category: "Beauté",
    name: "Studio Lara", cat: "Beauté · Place Saint-Épvre",
    shortCat: "Beauté & Soins · Place Saint-Épvre",
    desc: "Institut de beauté, ongles & soins visage naturels. Produits bio et cruelty-free uniquement.",
    shortDesc: "Institut de beauté, ongles & soins naturels.",
    cover: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=300&fit=crop",
    gallery: [
      { src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop", label: "Soin visage", price: "45€", detail: "60 min" },
      { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop", label: "Pose ongles gel", price: "35€", detail: "Toutes couleurs" },
      { src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop", label: "Maquillage", price: "50€", detail: "Événement spécial" },
      { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop", label: "Soin corps", price: "60€", detail: "90 min relaxation" },
      { src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop", label: "Épilation", price: "25€", detail: "Gambe complètes" },
      { src: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop", label: "Nail art", price: "40€", detail: "Design personnalisé" },
    ],
    vues: "184", int: "31", posts: "9",
    plan: "Mixte", planBg: C.proBg, planColor: C.pro,
    tag: "#Soins", role: "magasin",
    phone: "03 29 51 44 22",
    adresse: "3 Place Saint-Épvre, 88100 Saint-Dié-des-Vosges",
    website: null, instagram: "@studiolara_beauty", facebook: "Studio Lara Beauté",
    hours: [
      { j: "Mar – Ven", h: "9h – 19h" },
      { j: "Samedi", h: "9h – 17h" },
      { j: "Lun & Dim", h: "Fermé" },
    ],
    products: [
      { price: "45€", detail: "Soin visage complet · 60 min" },
      { price: "35€", detail: "Pose ongles gel · Toutes couleurs" },
    ],
  },
];

// ─── CATÉGORIES : mapping DB → affichage ───
const CATEGORIES = [
  { key: "Tous",                      emoji: "🛍️", match: [] },
  { key: "Mode & Prêt-à-porter",      emoji: "👗", match: ["Mode"] },
  { key: "Beauté & Bien-être",        emoji: "💄", match: ["Beauté", "Bien-être"] },
  { key: "Artisan",                   emoji: "🎨", match: ["Artisan"] },
  { key: "Restauration & Traiteur",   emoji: "🍽️", match: ["Restauration", "Traiteur", "Resto"] },
  { key: "Épicerie & Alimentation",   emoji: "🧀", match: ["Épicerie", "Alimentation"] },
  { key: "Sport & Loisirs",           emoji: "🏃", match: ["Sport", "Loisirs"] },
  { key: "Décoration & Maison",       emoji: "🏠", match: ["Décoration", "Maison"] },
  { key: "Services de proximité",     emoji: "🔧", match: ["Services"] },
];

function catEmoji(cat) {
  const found = CATEGORIES.find(c => c.key === cat);
  return found ? found.emoji : "🏪";
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
  const emoji = catEmoji(cat);
  const label = catLabel(cat);
  return {
    id: p.id,
    category: cat,
    categorie: cat,
    name: p.pseudo || "Commerce",
    cat: `${label} · ${p.quartier || "Saint-Dié"}`,
    shortCat: `${emoji} ${label} · ${p.quartier || "Saint-Dié"}`,
    desc: p.bio || "",
    shortDesc: p.bio ? p.bio.substring(0, 80) + (p.bio.length > 80 ? "…" : "") : "",
    cover: p.avatar_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop",
    gallery: [],
    vues: "—", int: "—",
    posts: postCount != null ? String(postCount) : "—",
    plan: "Découverte",
    planBg: C.pill,
    planColor: C.ink2,
    tag: `#${label}`,
    phone: null, adresse: p.quartier || null,
    website: null, instagram: null, facebook: null,
    hours: [], products: [],
  };
}

// ─── BOTTOM NAV ───
function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
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
        <img src={com.cover} alt={com.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(26,23,20,0.6))" }} />
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,87,51,0.9)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>✦ Sponsorisé</div>
        <div style={{ position: "absolute", top: 10, right: 10, background: com.planBg, color: com.planColor, fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>{com.plan}</div>
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
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 18, marginBottom: 10, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex" }}>
      <div style={{ width: 88, minWidth: 88, height: 88, overflow: "hidden" }}>
        <img src={com.cover} alt={com.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, padding: "11px 12px 10px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.2 }}>{com.name}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, background: com.planBg, color: com.planColor }}>{com.plan}</span>
        </div>
        <div style={{ fontSize: 10, color: C.ink2, marginBottom: 4 }}>{com.shortCat}</div>
        <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{com.shortDesc}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.ink2 }}>👁 {com.vues}</span>
          <span style={{ fontSize: 9, color: C.ink2 }}>📸 {com.posts} posts</span>
          <span style={{ fontSize: 9, background: C.pill, color: C.ink2, padding: "2px 7px", borderRadius: 6 }}>{com.tag}</span>
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

// ─── ONGLET VITRINE (avec filtres) ───
function TabVitrine({ com, realPosts, loadingPosts }) {
  const [activeFilter, setActiveFilter] = useState("tous");
  const [selectedItem, setSelectedItem] = useState(null);

  const filters = [
    { id: "tous", label: "✦ Tous" },
    { id: "collection", label: "📸 Collection" },
    { id: "nouveautes", label: "✨ Nouveautés" },
    { id: "bons_plans", label: "🎁 Bons plans" },
  ];

  // Construire la liste unifiée d'items
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let galleryItems = [];
  if (com.id && realPosts.length > 0) {
    // Vrais posts Supabase avec photo
    galleryItems = realPosts
      .filter(p => p.photo_url)
      .map(p => ({
        src: p.photo_url,
        label: p.content || com.name,
        price: null,
        detail: null,
        post: p,
        isNew: new Date(p.created_at) > sevenDaysAgo,
        isBonPlan: p.type === "bon plan",
      }));
  } else {
    // Données statiques
    galleryItems = (com.gallery || []).map((g, i) => ({
      ...g,
      post: null,
      isNew: i < 2,
      isBonPlan: false,
    }));
  }

  const filtered = activeFilter === "tous" ? galleryItems
    : activeFilter === "collection" ? galleryItems.filter(g => !g.isBonPlan)
    : activeFilter === "nouveautes" ? galleryItems.filter(g => g.isNew)
    : galleryItems.filter(g => g.isBonPlan);

  const showBonsPlans = (activeFilter === "tous" || activeFilter === "bons_plans") && com.products?.length > 0;

  return (
    <div style={{ padding: "0 16px 100px" }}>
      {/* Filtres pills */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", padding: "14px 0 12px" }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: dm, background: activeFilter === f.id ? C.ink : C.pill, color: activeFilter === f.id ? "#fff" : C.ink2, transition: "all 0.15s" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Galerie photos */}
      {loadingPosts ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
      ) : filtered.length > 0 ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>
              {activeFilter === "tous" ? "Dernière collection" : activeFilter === "nouveautes" ? "Nouveautés" : activeFilter === "bons_plans" ? "Bons plans" : "Collection"}
            </div>
            <span style={{ fontSize: 10, color: C.ink2 }}>{filtered.length} photo{filtered.length > 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 22 }}>
            {filtered.map((item, i) => (
              <div key={i} onClick={() => setSelectedItem(item)} style={{ borderRadius: 12, aspectRatio: "1", overflow: "hidden", cursor: "pointer", position: "relative" }}>
                <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {item.isNew && (
                  <div style={{ position: "absolute", top: 5, left: 5, background: C.accent, color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 6 }}>NEW</div>
                )}
                {item.price && (
                  <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>{item.price}</div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>
          Aucun contenu dans cette catégorie.
        </div>
      )}

      {/* Bons plans du moment (dans Tous et Bons plans) */}
      {showBonsPlans && (
        <>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 10 }}>Bons plans du moment</div>
          {com.products.map((p, i) => (
            <div key={i} style={{ background: C.proBg, borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, border: "1px solid rgba(10,61,46,0.1)" }}>
              <div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.pro }}>{p.price}</div>
                <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{p.detail}</div>
              </div>
              <button style={{ background: C.pro, color: "#fff", border: "none", borderRadius: 12, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: dm }}>
                Je commande →
              </button>
            </div>
          ))}
        </>
      )}

      {/* Modale photo */}
      <PhotoModal
        item={selectedItem}
        comName={com.name}
        phone={com.phone}
        onClose={() => setSelectedItem(null)}
      />
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
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 8 }}>HORAIRES</div>
            {com.hours.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < com.hours.length - 1 ? 6 : 0, marginBottom: i < com.hours.length - 1 ? 6 : 0, borderBottom: i < com.hours.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>{h.j}</span>
                <span style={{ fontSize: 13, color: h.h === "Fermé" ? "#C0392B" : C.pro, fontWeight: 600 }}>{h.h}</span>
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
function VitrineScreen({ com, onBack }) {
  const [suivi, setSuivi] = useState(false);
  const [activeTab, setActiveTab] = useState("vitrine");
  const [realPosts, setRealPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [realPostCount, setRealPostCount] = useState(null);

  useEffect(() => {
    if (!com.id) return;
    setLoadingPosts(true);
    supabase
      .from("posts")
      .select("*")
      .eq("author_id", com.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRealPosts(data || []);
        setRealPostCount(data?.length ?? 0);
        setLoadingPosts(false);
      });
  }, [com.id]);

  const displayPosts = realPostCount != null ? String(realPostCount) : com.posts;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Bannière */}
        <div style={{ position: "relative", width: "100%", height: 200, overflow: "hidden" }}>
          <img src={com.cover} alt={com.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(26,23,20,0.7) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, width: 34, height: 34, background: "rgba(255,255,255,0.9)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>‹</button>
          <div style={{ position: "absolute", top: 14, right: 14, background: com.planBg, color: com.planColor, fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>{com.plan}</div>
          <div style={{ position: "absolute", bottom: 14, left: 16 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 22, color: "#fff", lineHeight: 1 }}>{com.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{com.cat}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.card }}>
          {[{ n: com.vues, l: "vues" }, { n: com.int, l: "intéressés" }, { n: displayPosts, l: "posts" }].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink }}>{s.n}</div>
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

        {activeTab === "vitrine" && <TabVitrine com={com} realPosts={realPosts} loadingPosts={loadingPosts} />}
        {activeTab === "infos" && <TabInfos com={com} />}
      </div>

      {/* Bouton fixe */}
      <button onClick={() => setSuivi(!suivi)} style={{ position: "absolute", bottom: 90, left: 18, right: 18, border: "none", borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", background: suivi ? C.ink : C.accent, color: "#fff", transition: "all 0.2s", zIndex: 10 }}>
        {suivi ? "✓ Vitrine suivie" : "+ Suivre cette vitrine"}
      </button>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function ChipeurCommerces({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedCom, setSelectedCom] = useState(null);
  const [activeCat, setActiveCat] = useState("Tous");
  const [realMerchants, setRealMerchants] = useState([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Charger les vrais commerçants depuis Supabase (categorie non nulle = marchand)
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, pseudo, bio, quartier, avatar_url, categorie")
      .not("categorie", "is", null)
      .not("pseudo", "is", null)
      .then(async ({ data: profiles }) => {
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

  // Filtrer par catégorie
  const activeCatDef = CATEGORIES.find(c => c.key === activeCat) || CATEGORIES[0];
  const filtered = allCommerces.filter(c => {
    if (activeCat === "Tous") return true;
    const haystack = (c.categorie || c.category || "").toLowerCase();
    return activeCatDef.match.some(m => haystack.includes(m.toLowerCase()));
  });

  const featured = filtered.find(c => c.featured);
  const others = filtered.filter(c => !c.featured);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "list" && (
        <>
          <div style={{ background: C.bg, flexShrink: 0, paddingTop: 10 }}>
            <div style={{ padding: "4px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Commerces & Artisans 🏪</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>{filtered.length} vitrines</div>
            </div>
            {/* Recherche */}
            <div style={{ margin: "0 16px 10px", display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 16, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, color: C.ink2 }}>🔍</span>
              <input placeholder="Recherche un commerce ou artisan…" style={{ border: "none", outline: "none", fontSize: 14, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }} />
            </div>
            {/* Catégories */}
            <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  style={{
                    padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    fontFamily: dm,
                    background: activeCat === c.key ? C.ink : C.pill,
                    color: activeCat === c.key ? "#fff" : C.ink2,
                    transition: "all 0.15s",
                  }}
                >
                  {c.emoji} {c.key === "Tous" ? "Tous" : catLabel(c.key)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
            {loadingMerchants && (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: C.ink2 }}>
                ⏳ Chargement des commerçants…
              </div>
            )}
            {featured && <FeaturedCard com={featured} onClick={() => { setSelectedCom(featured); setScreen("vitrine"); }} />}
            {others.map((c, i) => (
              <ComCard key={i} com={c} onClick={() => { setSelectedCom(c); setScreen("vitrine"); }} />
            ))}
          </div>
        </>
      )}

      {screen === "vitrine" && selectedCom && (
        <VitrineScreen com={selectedCom} onBack={() => setScreen("list")} />
      )}

      <BottomNav active="commerces" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
