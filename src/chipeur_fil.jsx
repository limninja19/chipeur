import { useState } from "react";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Syne+Mono&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);

// ─── STATUS BAR ───
function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
      <span>9:41</span><span>●●●</span>
    </div>
  );
}

// ─── APP HEADER ───
function AppHeader({ setPage, profile }) {
  const voisins = [
    { emoji: "👩", bg: "#FEF3E0" },
    { emoji: "👩‍🦰", bg: "#F7EEF7" },
    { emoji: "🧑", bg: "#E8F4FD" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 6px", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGradFil" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5733"/>
              <stop offset="100%" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
          <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradFil)"/>
          <circle cx="36" cy="26" r="10" fill="white"/>
          <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: -0.5, color: "#1A1A2E" }}>
            chi<span style={{ color: C.accent }}>p</span>eur
          </div>
          <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 7, letterSpacing: 2, color: C.accent, textTransform: "uppercase", lineHeight: 1.2 }}>
            Découvre · Chope · Partage
          </div>
          {profile?.pseudo && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.ink2, marginTop: 1 }}>Bonjour {profile.pseudo} 👋</div>}
        </div>
      </div>
      {/* Droite : avatars voisins + icônes */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Avatars voisins actifs — cliquable → page voisins */}
        <div onClick={() => setPage("voisins")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          {voisins.map((v, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: "50%",
              background: v.bg, border: `2px solid ${C.bg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, marginLeft: i === 0 ? 0 : -8,
              position: "relative", zIndex: 3 - i,
            }}>{v.emoji}</div>
          ))}
          <div style={{ marginLeft: 5, fontSize: 10, fontWeight: 600, color: C.ink2 }}>+24</div>
        </div>
        <span style={{ cursor: "pointer", fontSize: 20 }}>🔔</span>
        <span style={{ cursor: "pointer", fontSize: 20 }}>💬</span>
      </div>
    </div>
  );
}

// ─── FIL TABS ───
function FilTabs({ active, onSelect, setPage }) {
  const tabs = [
    { id: "Tout", label: "Tout" },
    { id: "Trouvailles", label: "Trouvailles" },
    { id: "Lieux", label: "Lieux" },
    { id: "Bons plans", label: "Bons plans" },
    { id: "Défis", label: "Défis" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 12px 10px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => t.id === "Défis" ? setPage("defis") : onSelect(t.id)}
          style={{
            fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 20,
            border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            background: active === t.id ? C.ink : C.pill,
            color: active === t.id ? "#fff" : C.ink2,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── BANDEAU DÉFIS ───
function DefiCard({ d, setPage }) {
  const pct = Math.round((d.current / d.total) * 100);
  return (
    <div style={{
      flexShrink: 0, width: 190, borderRadius: 18, overflow: "hidden",
      cursor: "pointer", background: d.grad, position: "relative",
    }}>
      {/* Fond décoratif emoji géant */}
      <div style={{
        position: "absolute", right: -8, top: -6,
        fontSize: 64, opacity: 0.15, lineHeight: 1,
        pointerEvents: "none", userSelect: "none",
      }}>{d.icon}</div>

      <div style={{ padding: "12px 12px 10px", position: "relative" }}>
        {/* Ligne haute : XP badge + timer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{
            background: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)",
            borderRadius: 8, padding: "2px 8px",
            fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3,
          }}>⚡ +{d.xp} XP</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>⏱ {d.timeLeft}</div>
        </div>

        {/* Titre */}
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
          color: "#fff", lineHeight: 1.2, marginBottom: 10,
        }}>{d.title}</div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 6 }}>
          <div style={{
            height: 5, borderRadius: 3,
            background: "rgba(255,255,255,0.25)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${pct}%`,
              background: "rgba(255,255,255,0.85)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              👥 {d.current} participants
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
              objectif {d.total}
            </div>
          </div>
        </div>

        {/* Bouton participer */}
        <button onClick={() => setPage("defis")} style={{
          width: "100%", marginTop: 4,
          padding: "7px 0", borderRadius: 10,
          background: "rgba(255,255,255,0.95)",
          color: d.btnColor, border: "none",
          fontSize: 11, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer", letterSpacing: 0.2,
        }}>Participer →</button>
      </div>
    </div>
  );
}

function BandeauDefis({ setPage }) {
  const defis = [
    {
      icon: "👗",
      title: "Montre ta pépite du mois",
      current: 128, total: 200,
      xp: 20,
      timeLeft: "3 jours",
      grad: "linear-gradient(135deg,#FF5733 0%,#FF8C42 100%)",
      btnColor: "#FF5733",
    },
    {
      icon: "🌿",
      title: "Look seconde main du mois",
      current: 64, total: 100,
      xp: 15,
      timeLeft: "6 jours",
      grad: "linear-gradient(135deg,#7C3AED 0%,#A855F7 100%)",
      btnColor: "#7C3AED",
    },
    {
      icon: "📸",
      title: "Photo de quartier",
      current: 31, total: 50,
      xp: 10,
      timeLeft: "9 jours",
      grad: "linear-gradient(135deg,#0F766E 0%,#14B8A6 100%)",
      btnColor: "#0F766E",
    },
  ];
  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase",
        letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
      }}>
        🏆 Défis en cours
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {defis.map((d, i) => <DefiCard key={i} d={d} setPage={setPage} />)}
      </div>
    </div>
  );
}

// ─── REACTIONS ───
function Reactions({ defaultActive }) {
  const [active, setActive] = useState(defaultActive || null);
  const emojis = ["🔥", "😍", "👀"];
  return (
    <div style={{ display: "flex", gap: 4, flex: 1 }}>
      {emojis.map(e => (
        <button key={e} onClick={() => setActive(e === active ? null : e)} style={{
          fontSize: 13, padding: "5px 9px", borderRadius: 12,
          border: `1px solid ${e === active ? C.accent : C.border}`,
          background: e === active ? "#FFF0EB" : "transparent",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>{e}</button>
      ))}
    </div>
  );
}

// ─── INTEREST BUTTON ───
function InterestBtn({ defaultActive }) {
  const [active, setActive] = useState(defaultActive || false);
  return (
    <button onClick={() => setActive(!active)} style={{
      padding: "6px 14px", borderRadius: 12, fontSize: 11, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      border: `1.5px solid ${active ? C.accent : C.border}`,
      background: active ? "#FFF0EB" : "transparent",
      color: active ? C.accent : C.ink,
      cursor: "pointer",
    }}>{active ? "✓ Intéressée" : "Intéressée ?"}</button>
  );
}

// ─── LIGHTBOX ───
function Lightbox({ src, alt, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        background: "rgba(255,255,255,0.15)", border: "none",
        color: "#fff", fontSize: 20, width: 38, height: 38,
        borderRadius: "50%", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>✕</button>
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "100%", maxHeight: "90vh",
          objectFit: "contain", borderRadius: 12,
        }}
      />
    </div>
  );
}

// ─── POST CARD VOISIN ───
function PostVoisin({ setPage }) {
  const [lightbox, setLightbox] = useState(false);
  const imgSrc = "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop&crop=center";

  return (
    <>
      {lightbox && <Lightbox src={imgSrc} alt="Robe lin Camille R." onClose={() => setLightbox(false)} />}
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
        {/* Header */}
        <div onClick={() => setPage("profil")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>😊</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700 }}>Camille R.</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>Quartier des Arts · 2h</div>
          </div>
        </div>
        {/* Image cliquable */}
        <div
          onClick={() => setLightbox(true)}
          style={{ width: "100%", paddingTop: "100%", background: C.pill, position: "relative", cursor: "zoom-in" }}
        >
          <img
            src={imgSrc}
            alt="Camille R. - robe lin vide-grenier"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(26,23,20,0.5)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }}>👁 24 vues</div>
          <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,23,20,0.45)", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 10 }}>🔍 Agrandir</div>
        </div>
        {/* Body */}
        <div style={{ padding: "8px 12px" }}>
          <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>Trouvé cette robe lin incroyable au vide-grenier ce matin !</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["Lin", "Vintage", "Vide-grenier"].map(t => (
              <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 6, padding: "8px 12px 10px", alignItems: "center" }}>
          <Reactions defaultActive="🔥" />
          <InterestBtn />
        </div>
      </div>
    </>
  );
}

// ─── POST CARD VITRINE ───
function PostVitrine() {
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👗</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700 }}>Atelier Mona</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ background: C.proBg, color: C.pro, fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 6 }}>★ Vitrine</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.ink2 }}>1h</div>
      </div>
      {/* Image */}
      <div style={{ width: "100%", paddingTop: "75%", background: C.pill, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>👒</div>
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(26,23,20,0.5)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }}>👁 87 vues</div>
      </div>
      {/* Body */}
      <div style={{ padding: "8px 12px 0" }}>
        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>Nouvelle collection chapeaux paille — été 2026</div>
      </div>
      {/* Pro Layer */}
      <div style={{
        background: C.proBg, margin: "8px 12px", borderRadius: 12, padding: "8px 10px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: C.pro }}>45€</div>
          <div style={{ fontSize: 10, color: C.pro, opacity: 0.8 }}>S · M · L</div>
        </div>
        <button style={{
          background: C.pro, color: "#fff", border: "none", borderRadius: 10,
          padding: "7px 12px", fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
        }}>Je commande →</button>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px 10px", alignItems: "center" }}>
        <Reactions />
        <InterestBtn defaultActive={true} />
      </div>
    </div>
  );
}

// ─── FAB MENU OVERLAY ───
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
      flexDirection: "column", justifyContent: "flex-end",
      padding: "0 0 90px",
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
              <span style={{
                fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro,
                padding: "2px 6px", borderRadius: 6, marginLeft: "auto",
              }}>PRO</span>
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
        if (item.isFab) {
          return (
            <div key="fab" onClick={onFab} style={{
              width: 50, height: 50, borderRadius: 25, background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div>
          );
        }
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

export default function Fil({ setPage, profile }) {
  const [activeTab, setActiveTab] = useState("Tout");
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      <AppHeader setPage={setPage} profile={profile} />
      <FilTabs active={activeTab} onSelect={setActiveTab} setPage={setPage} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
        <BandeauDefis setPage={setPage} />
        <PostVoisin setPage={setPage} />
        <PostVitrine />
        <PostVoisin setPage={setPage} />
      </div>
      {fabOpen && <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} />}
      <BottomNav active="fil" onNavigate={setPage} onFab={() => setFabOpen(!fabOpen)} />
    </div>
  );
}
