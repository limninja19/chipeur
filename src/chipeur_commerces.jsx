import { useState } from "react";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const commerces = [
  {
    name: "Le Croc Vosgien", cat: "Fast Food · 20 Rue de la Concorde · Saint-Dié",
    shortCat: "Fast Food · Sandwichs · Saint-Dié-des-Vosges",
    desc: "Le incontournable de Saint-Dié ! Sandwichs chauds, kebabs et filet américain préparés avec des produits frais. Noté 4.4/5 par plus de 400 clients. À emporter ou sur place.",
    shortDesc: "Sandwichs chauds, kebabs & filet américain. Le meilleur fast food de Saint-Dié !",
    cover: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=300&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1619881590739-3e849dce9b72?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1561050501-a97c4fe1cd31?w=400&h=400&fit=crop",
    ],
    vues: "412", int: "89", posts: "31",
    plan: "★ Premium", planBg: "#FFF3E0", planColor: "#E65100",
    featured: true, tag: "#FastFood",
    phone: "03 29 56 12 34",
    adresse: "20 Rue de la Concorde, 88100 Saint-Dié-des-Vosges",
    website: "https://lecroc-vosgien.fr",
    instagram: "@lecroc_vosgien",
    facebook: "Le Croc Vosgien",
    hours: [
      { j: "Lun – Ven", h: "11h – 22h" },
      { j: "Samedi", h: "11h – 23h" },
      { j: "Dimanche", h: "Fermé" },
    ],
    products: [
      { price: "7,50€", detail: "Sandwich chaud maison · Formule midi" },
      { price: "9,90€", detail: "Kebab complet · Sauce au choix" },
    ],
  },
  {
    name: "Diez", cat: "Mode · Saint-Dié-des-Vosges",
    shortCat: "Boutique Mode · Saint-Dié-des-Vosges",
    desc: "Boutique de prêt-à-porter tendance au cœur de Saint-Dié. Collections femme et homme renouvelées chaque saison, avec des marques accessibles et des pièces coup de cœur.",
    shortDesc: "Prêt-à-porter tendance femme & homme. Collections renouvelées chaque saison.",
    cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
    ],
    vues: "187", int: "42", posts: "15",
    plan: "Mixte", planBg: C.proBg, planColor: C.pro,
    tag: "#Mode",
    phone: "03 29 55 78 90",
    adresse: "12 Grande Rue, 88100 Saint-Dié-des-Vosges",
    website: "https://diez-mode.fr",
    instagram: "@diez_saintedie",
    facebook: "Diez Mode",
    hours: [
      { j: "Lun", h: "14h – 19h" },
      { j: "Mar – Sam", h: "10h – 19h" },
      { j: "Dimanche", h: "Fermé" },
    ],
    products: [
      { price: "39€", detail: "Robe tendance · Nouvelle collection" },
      { price: "55€", detail: "Veste mi-saison · Plusieurs coloris" },
    ],
  },
  {
    name: "Studio Lara", cat: "Beauté · Place Saint-Épvre",
    shortCat: "Beauté & Soins · Place Saint-Épvre",
    desc: "Institut de beauté, ongles & soins visage naturels. Produits bio et cruelty-free uniquement.",
    shortDesc: "Institut de beauté, ongles & soins naturels.",
    cover: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=300&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    ],
    vues: "184", int: "31", posts: "9",
    plan: "Mixte", planBg: C.proBg, planColor: C.pro,
    tag: "#Soins",
    phone: "03 29 51 44 22",
    adresse: "3 Place Saint-Épvre, 88100 Saint-Dié-des-Vosges",
    website: null,
    instagram: "@studiolara_beauty",
    facebook: "Studio Lara Beauté",
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
  {
    name: "TrendBox", cat: "Mode · Grande Rue",
    shortCat: "Sneakers & Streetwear · Grande Rue",
    desc: "Sneakers & streetwear, toutes les dernières sorties et les classics qui ne déçoivent jamais.",
    shortDesc: "Sneakers & streetwear. Dernières sorties et classics.",
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=300&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
    ],
    vues: "96", int: "18", posts: "6",
    plan: "Découverte", planBg: C.pill, planColor: C.ink2,
    tag: "#Sneakers",
    phone: "03 29 58 32 11",
    adresse: "8 Grande Rue, 88100 Saint-Dié-des-Vosges",
    website: "https://trendbox-shop.fr",
    instagram: "@trendbox_saintedie",
    facebook: null,
    hours: [
      { j: "Lun – Sam", h: "10h – 19h30" },
      { j: "Dimanche", h: "Fermé" },
    ],
    products: [
      { price: "120€", detail: "Nike Air Max 90 · Du 38 au 46" },
      { price: "89€", detail: "New Balance 574 · Coloris exclusif" },
    ],
  },
  {
    name: "Maison Fuji", cat: "Restauration · Rue Stanislas",
    shortCat: "Ramen & Izakaya · Rue Stanislas",
    desc: "Ramen & izakaya japonais, produits frais du marché local. Formule déjeuner 12€ du mardi au vendredi.",
    shortDesc: "Ramen & izakaya japonais. Formule déj. 12€ mar–ven.",
    cover: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=300&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=400&fit=crop",
    ],
    vues: "310", int: "62", posts: "18",
    plan: "Mixte", planBg: C.proBg, planColor: C.pro,
    tag: "#Japonais",
    phone: "03 29 56 90 45",
    adresse: "15 Rue Stanislas, 88100 Saint-Dié-des-Vosges",
    website: "https://maison-fuji.fr",
    instagram: "@maisonfuji_saintedie",
    facebook: "Maison Fuji",
    hours: [
      { j: "Mar – Ven", h: "12h – 14h · 19h – 22h" },
      { j: "Sam – Dim", h: "19h – 22h30" },
      { j: "Lundi", h: "Fermé" },
    ],
    products: [
      { price: "12€", detail: "Formule déjeuner · Mar–Ven midi" },
      { price: "16€", detail: "Ramen Tonkotsu · Soirée uniquement" },
    ],
  },
];

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

// ─── CARTE FEATURED (grande) ───
function FeaturedCard({ com, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 20, marginBottom: 12, overflow: "hidden", border: "1.5px solid rgba(255,87,51,0.25)", cursor: "pointer", boxShadow: "0 2px 12px rgba(255,87,51,0.08)" }}>
      {/* Photo couverture */}
      <div style={{ position: "relative", width: "100%", height: 130, overflow: "hidden" }}>
        <img src={com.cover} alt={com.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(26,23,20,0.6))" }} />
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,87,51,0.9)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>
          ✦ Sponsorisé
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: com.planBg, color: com.planColor, fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8 }}>
          {com.plan}
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 12 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", lineHeight: 1 }}>{com.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{com.shortCat}</div>
        </div>
      </div>
      {/* Corps */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 10 }}>{com.shortDesc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 10, color: C.ink2 }}>👁 {com.vues} vues</span>
            <span style={{ fontSize: 10, color: C.ink2 }}>💛 {com.int} intéressés</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onClick(); }} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>
            Voir →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CARTE COMMERCE (compacte avec photo) ───
function ComCard({ com, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 18, marginBottom: 10, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex" }}>
      {/* Photo carrée */}
      <div style={{ width: 88, minWidth: 88, height: 88, overflow: "hidden", position: "relative" }}>
        <img src={com.cover} alt={com.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Infos */}
      <div style={{ flex: 1, padding: "11px 12px 10px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.2 }}>{com.name}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, background: com.planBg, color: com.planColor }}>{com.plan}</span>
        </div>
        <div style={{ fontSize: 10, color: C.ink2, marginBottom: 4 }}>{com.shortCat}</div>
        <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{com.shortDesc}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.ink2 }}>👁 {com.vues}</span>
          <span style={{ fontSize: 9, color: C.ink2 }}>💛 {com.int}</span>
          <span style={{ fontSize: 9, background: C.pill, color: C.ink2, padding: "2px 7px", borderRadius: 6 }}>{com.tag}</span>
        </div>
      </div>
    </div>
  );
}

// ─── VITRINE DÉTAIL — onglet Vitrine ───
function TabVitrine({ com }) {
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {/* Description */}
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 18 }}>{com.desc}</div>

      {/* Galerie dernière collection */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>Dernière collection</div>
        <span style={{ fontSize: 10, color: C.ink2 }}>{com.gallery.length} photos</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 22 }}>
        {com.gallery.map((src, i) => (
          <div key={i} style={{ borderRadius: 12, aspectRatio: "1", overflow: "hidden" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>

      {/* Bons plans */}
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
    </div>
  );
}

// ─── VITRINE DÉTAIL — onglet Infos ───
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

      {/* Téléphone */}
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

      {/* Adresse */}
      {com.adresse && (
        <div style={rowStyle}>
          <div style={{ ...iconStyle, background: "#FEF3E0" }}>📍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 3 }}>ADRESSE</div>
            <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{com.adresse}</div>
          </div>
        </div>
      )}

      {/* Horaires */}
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

      {/* Site web */}
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

      {/* Réseaux sociaux */}
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
    </div>
  );
}

// ─── VITRINE DÉTAIL (avec onglets) ───
function VitrineScreen({ com, onBack }) {
  const [suivi, setSuivi] = useState(false);
  const [activeTab, setActiveTab] = useState("vitrine");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Bannière photo */}
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
          {[{ n: com.vues, l: "vues" }, { n: com.int, l: "intéressés" }, { n: com.posts, l: "posts" }].map((s, i) => (
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

        {/* Contenu onglet */}
        {activeTab === "vitrine" && <TabVitrine com={com} />}
        {activeTab === "infos" && <TabInfos com={com} />}
      </div>

      {/* Bouton fixe */}
      <button onClick={() => setSuivi(!suivi)} style={{ position: "absolute", bottom: 90, left: 18, right: 18, border: "none", borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", background: suivi ? C.ink : C.accent, color: "#fff", transition: "all 0.2s", zIndex: 10 }}>
        {suivi ? "✓ Vitrine suivie" : "+ Suivre cette vitrine"}
      </button>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurCommerces({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedCom, setSelectedCom] = useState(null);
  const [activeCat, setActiveCat] = useState("Tous");

  const cats = ["Tous", "Mode 👗", "Beauté 💄", "Resto 🍜", "Sport 🏃"];
  const featured = commerces.find(c => c.featured);
  const others = commerces.filter(c => !c.featured);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "list" && (
        <>
          {/* Header fixe : status + titre + recherche + catégories */}
          <div style={{ background: C.bg, flexShrink: 0, paddingTop: 10 }}>
            <div style={{ padding: "4px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Commerces 🏪</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>{commerces.length} vitrines</div>
            </div>
            {/* Barre de recherche */}
            <div style={{ margin: "0 16px 10px", display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 16, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, color: C.ink2 }}>🔍</span>
              <input placeholder="Recherche un commerce…" style={{ border: "none", outline: "none", fontSize: 14, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }} />
            </div>
            {/* Catégories */}
            <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
              {cats.map(c => (
                <button key={c} onClick={() => setActiveCat(c)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: dm, background: activeCat === c ? C.ink : C.pill, color: activeCat === c ? "#fff" : C.ink2, transition: "all 0.15s" }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Feed scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
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
