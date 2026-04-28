import { useState } from "react";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);

const commerces = [
  { emoji: "🧵", name: "Atelier Mona", cat: "Mode · Rue des Ponts · Nancy Centre", desc: "Créations locales, tissus naturels & petites séries. Chaque pièce est pensée pour durer et portée avec intention.", vues: "238", int: "47", posts: "12", plan: "★ Premium", planBg: "#FFF3E0", planColor: "#E65100", logoBg: "#FEF3E0", shortCat: "Mode · Rue des Ponts", shortDesc: "Créations locales, tissus naturels. Nouvelle collection automne disponible vendredi.", featured: true, tag: "#Artisanal" },
  { emoji: "👕", name: "Secondhand Co.", cat: "Mode · Rue Thiers", desc: "Vêtements vintage & seconde main sélectionnés avec soin. Nouveaux arrivages chaque mardi et vendredi.", vues: "310", int: "63", posts: "24", plan: "Mixte", planBg: C.proBg, planColor: C.pro, logoBg: "#F0EBE3", shortCat: "Mode · Rue Thiers", shortDesc: "Vêtements vintage & seconde main sélectionnés avec soin", tag: "#Vintage" },
  { emoji: "💄", name: "Studio Lara", cat: "Beauté · Place Saint-Épvre", desc: "Institut de beauté, ongles & soins visage naturels. Produits bio et cruelty-free uniquement.", vues: "184", int: "31", posts: "9", plan: "Mixte", planBg: C.proBg, planColor: C.pro, logoBg: "#F7EEF7", shortCat: "Beauté · Place Saint-Épvre", shortDesc: "Institut de beauté, ongles & soins visage naturels", tag: "#Soins" },
  { emoji: "👟", name: "TrendBox", cat: "Mode · Grande Rue", desc: "Sneakers & streetwear, toutes les dernières sorties et les classics qui ne déçoivent jamais.", vues: "96", int: "18", posts: "6", plan: "Découverte", planBg: C.pill, planColor: C.ink2, logoBg: "#E8F4FD", shortCat: "Mode · Grande Rue", shortDesc: "Sneakers & streetwear, toutes les dernières sorties", tag: "#Sneakers" },
  { emoji: "🍜", name: "Maison Fuji", cat: "Restauration · Rue Stanislas", desc: "Ramen & izakaya japonais, produits frais du marché local. Formule déjeuner 12€ du mardi au vendredi.", vues: "310", int: "62", posts: "18", plan: "Mixte", planBg: C.proBg, planColor: C.pro, logoBg: "#FEF3E0", shortCat: "Restauration · Rue Stanislas", shortDesc: "Ramen & izakaya japonais, produits frais locaux", tag: "#Japonais" },
];

// ─── STATUS BAR ───
function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
      <span>9:41</span><span>●●●</span>
    </div>
  );
}

// ─── FAB MENU ───
function FabMenu({ open, onClose }) {
  if (!open) return null;
  const items = [
    { icon: "📸", label: "Nouveau post" },
    { icon: "📅", label: "Nouvelle sortie" },
    { icon: "🏆", label: "Créer un défi", pro: true },
  ];
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(26,23,20,0.4)", display: "flex",
      flexDirection: "column", justifyContent: "flex-end", padding: "0 0 90px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        display: "flex", flexDirection: "column", gap: 6,
        alignItems: "center", padding: "0 60px 12px",
      }}>
        {items.map((item, i) => (
          <button key={i} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            background: C.card, border: "none", borderRadius: 14,
            padding: "12px 16px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{item.label}</span>
            {item.pro && (
              <span style={{ fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro, padding: "2px 6px", borderRadius: 6, marginLeft: "auto" }}>PRO</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
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
    <div style={{
      height: 80, background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0,
    }}>
      {items.map(item => {
        if (item.isFab) return (
          <div key="fab" onClick={onFab} style={{
            width: 50, height: 50, borderRadius: 25, background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer",
          }}>+</div>
        );
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, fontSize: 9, color: active === item.id ? C.accent : C.ink2, cursor: "pointer",
          }}>
            <div style={{ fontSize: 18 }}>{item.icon}</div>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── FEATURED CARD ───
function FeaturedCard({ com, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 18, marginBottom: 10, overflow: "hidden",
      border: "1.5px solid rgba(232,73,10,0.3)", cursor: "pointer",
    }}>
      <div style={{
        width: "100%", height: 90, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 56, position: "relative", background: com.logoBg,
      }}>
        {com.emoji}
        <div style={{
          position: "absolute", top: 8, right: 8, background: "rgba(230,81,0,0.9)",
          color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
        }}>Sponsorisé</div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: C.ink }}>{com.name}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: com.planBg, color: com.planColor }}>{com.plan}</span>
        </div>
        <div style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>{com.shortCat}</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 4, lineHeight: 1.4 }}>{com.shortDesc}</div>
        <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
          background: C.accent, color: "#fff", border: "none", borderRadius: 10,
          padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", marginTop: 10,
        }}>Voir la vitrine →</button>
      </div>
    </div>
  );
}

// ─── COMMERCE CARD ───
function ComCard({ com, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 18, marginBottom: 10, overflow: "hidden",
      border: `1px solid ${C.border}`, cursor: "pointer", display: "flex",
    }}>
      <div style={{
        width: 80, minWidth: 80, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 32, background: com.logoBg,
      }}>{com.emoji}</div>
      <div style={{ flex: 1, padding: "12px 12px 10px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: C.ink }}>{com.name}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, background: com.planBg, color: com.planColor }}>{com.plan}</span>
        </div>
        <div style={{ fontSize: 11, color: C.ink2, marginBottom: 6 }}>{com.shortCat}</div>
        <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{com.shortDesc}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 10, color: C.ink2, display: "flex", alignItems: "center", gap: 3 }}>👁 {com.vues} vues</span>
          <span style={{ fontSize: 10, color: C.ink2, display: "flex", alignItems: "center", gap: 3 }}>💛 {com.int} intéressés</span>
          <span style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "2px 7px", borderRadius: 6 }}>{com.tag}</span>
        </div>
      </div>
    </div>
  );
}

// ─── VITRINE DETAIL ───
function VitrineScreen({ com, onBack }) {
  const [suivi, setSuivi] = useState(false);
  const thumbs = [
    { emoji: "🧵", label: "Nouvelle collection", bg: "#FEF3E0" },
    { emoji: "🧥", label: "Manteau laine", bg: "#F0EBE3" },
    { emoji: "👗", label: "Robe mérinos", bg: "#F7EEF7" },
    { emoji: "🧣", label: "Accessoires", bg: "#E8F4FD" },
  ];
  const products = [
    { price: "89€", unit: "/ pièce", detail: "Robe laine mérinos · Taille S–XL" },
    { price: "145€", unit: "/ pièce", detail: "Manteau camel · Édition limitée" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Banner */}
      <div style={{
        width: "100%", height: 140, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 72, flexShrink: 0, position: "relative",
        background: com.logoBg,
      }}>
        <button onClick={onBack} style={{
          position: "absolute", top: 12, left: 12, width: 32, height: 32,
          background: "rgba(255,255,255,0.85)", borderRadius: "50%", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, cursor: "pointer",
        }}>‹</button>
        {com.emoji}
        <span style={{
          position: "absolute", top: 12, right: 12, fontSize: 9, fontWeight: 700,
          padding: "3px 9px", borderRadius: 8, background: com.planBg, color: com.planColor,
        }}>{com.plan}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 100px" }}>
        <div style={{ padding: "14px 0 0" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: C.ink }}>{com.name}</div>
          <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>{com.cat}</div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          {[
            { n: com.vues, l: "vues actives" },
            { n: com.int, l: "intéressés" },
            { n: com.posts, l: "posts" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.pill, borderRadius: 12, padding: "8px 12px", textAlign: "center", flex: 1 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: C.ink }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.ink2, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 14 }}>{com.desc}</div>

        {/* Posts grid */}
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 10 }}>Derniers posts</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {thumbs.map((t, i) => (
            <div key={i} style={{
              borderRadius: 12, aspectRatio: "1", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 32, cursor: "pointer", position: "relative",
              overflow: "hidden", background: t.bg,
            }}>
              {t.emoji}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(26,23,20,0.5)", color: "#fff", fontSize: 10,
                fontWeight: 600, padding: "5px 8px", backdropFilter: "blur(2px)",
              }}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* Pro layer products */}
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 10 }}>Bons plans du moment</div>
        {products.map((p, i) => (
          <div key={i} style={{
            background: C.proBg, borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 8, border: "1px solid rgba(10,61,46,0.1)",
          }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: C.pro }}>
                {p.price} <span style={{ fontSize: 11, fontWeight: 400, color: C.ink2 }}>{p.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{p.detail}</div>
            </div>
            <button style={{
              background: C.pro, color: "#fff", border: "none", borderRadius: 12,
              padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Je commande →</button>
          </div>
        ))}
      </div>

      {/* Suivre button */}
      <button onClick={() => setSuivi(!suivi)} style={{
        position: "absolute", bottom: 90, left: 18, right: 18,
        border: "none", borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "center",
        background: suivi ? C.ink : C.accent, color: "#fff",
        transition: "all 0.2s", zIndex: 10,
      }}>{suivi ? "✓ Vitrine suivie" : "+ Suivre cette vitrine"}</button>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurCommerces({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedCom, setSelectedCom] = useState(null);
  const [activeCat, setActiveCat] = useState("Tous");
  const [fabOpen, setFabOpen] = useState(false);

  const cats = ["Tous", "Mode 👗", "Beauté 💄", "Resto 🍜", "Sport 🏃"];
  const featured = commerces.find(c => c.featured);
  const others = commerces.filter(c => !c.featured);

  const openVitrine = (com) => { setSelectedCom(com); setScreen("vitrine"); };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>

        {screen === "list" && (
          <>
            {/* Search */}
            <div style={{
              margin: "10px 16px 0", display: "flex", alignItems: "center", gap: 8,
              background: C.card, borderRadius: 16, padding: "10px 14px",
              border: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 14, color: C.ink2 }}>🔍</span>
              <input placeholder="Recherche un commerce…" style={{
                border: "none", outline: "none", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", color: C.ink, flex: 1,
                background: "transparent",
              }} />
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: 6, padding: "10px 16px 0", overflowX: "auto", flexShrink: 0 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setActiveCat(c)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif",
                  background: activeCat === c ? C.ink : C.pill,
                  color: activeCat === c ? "#fff" : C.ink2,
                  transition: "all 0.2s",
                }}>{c}</button>
              ))}
            </div>

            {/* Section header */}
            <div style={{
              padding: "12px 16px 8px", display: "flex",
              alignItems: "center", justifyContent: "space-between", flexShrink: 0,
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>Vitrines du quartier</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>{commerces.length} commerces</div>
            </div>

           {/* Feed */}
<div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
  {featured && <FeaturedCard com={featured} onClick={() => setPage("profilMagasin")} />}
  {others.map((c, i) => <ComCard key={i} com={c} onClick={() => setPage("profilMagasin")} />)}
</div>
          </>
        )}

        {screen === "vitrine" && selectedCom && (
          <VitrineScreen com={selectedCom} onBack={() => setScreen("list")} />
        )}

        <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} />
        <BottomNav onFab={() => setFabOpen(!fabOpen)} />
    </div>
  );
}
