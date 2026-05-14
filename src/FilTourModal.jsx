import { useState } from "react";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

// ── Mini bottom nav identique à l'appli ─────────────────────────
function MiniNav({ active }) {
  const items = [
    { id: "fil",       icon: "🏠", label: "Fil" },
    { id: "evenement", icon: "📅", label: "Évén." },
    { id: "fab",       isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil",    icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", background: "#fff", borderTop: "1px solid rgba(26,23,20,0.08)", padding: "6px 0 4px", borderRadius: "0 0 14px 14px" }}>
      {items.map(it => it.isFab
        ? <div key="fab" style={{ width: 36, height: 36, borderRadius: "50%", background: "#FF5733", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", marginTop: -10, boxShadow: "0 2px 8px rgba(255,87,51,0.4)" }}>+</div>
        : <div key={it.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <div style={{ fontSize: 16, filter: active === it.id ? "none" : "grayscale(0.3)", opacity: active === it.id ? 1 : 0.45 }}>{it.icon}</div>
            <div style={{ fontSize: 8, fontFamily: dm, fontWeight: active === it.id ? 700 : 400, color: active === it.id ? "#FF5733" : "#6B6560" }}>{it.label}</div>
          </div>
      )}
    </div>
  );
}

// ── Slide 1 : Le Fil ────────────────────────────────────────────
function IlluFil() {
  return (
    <div style={{ background: "#F5F2EE", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)" }}>
      {/* Header appli */}
      <div style={{ background: "#fff", padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(26,23,20,0.06)" }}>
        <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 14, color: "#FF5733" }}>chipeur</div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ fontSize: 14 }}>🔔</div>
          <div style={{ fontSize: 14 }}>💬</div>
          <div style={{ background: "#F5F2EE", borderRadius: 20, padding: "2px 8px", fontSize: 8, fontFamily: dm, color: "#6B6560", display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 10 }}>👤</span> Voisins
          </div>
        </div>
      </div>
      {/* Post card */}
      <div style={{ margin: "6px 8px", background: "#fff", borderRadius: 12, padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FF5733", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontFamily: syne, fontWeight: 700 }}>J</div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, fontFamily: dm, color: "#1A1714" }}>jenny88</div>
            <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>Saint-Dié · 2h</div>
          </div>
          <div style={{ marginLeft: "auto", background: "#FFF4F1", borderRadius: 8, padding: "2px 6px", fontSize: 8, color: "#FF5733", fontFamily: dm, fontWeight: 600 }}>📸 Chope !</div>
        </div>
        <div style={{ background: "#F5F2EE", borderRadius: 8, height: 52, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, overflow: "hidden" }}>
          <div style={{ fontSize: 26 }}>👗</div>
        </div>
        <div style={{ fontSize: 9, color: "#1A1714", fontFamily: dm, marginBottom: 6 }}>Superbe robe trouvée chez Mode &amp; Co ! 😍</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>❤️</div>
          <div style={{ fontSize: 13 }}>🔥</div>
          <div style={{ fontSize: 13 }}>🛒</div>
          <div style={{ marginLeft: "auto", background: "#FFF8E8", borderRadius: 8, padding: "2px 7px", fontSize: 8, color: "#B45309", fontFamily: syne, fontWeight: 700 }}>+10 XP Shop 🏪</div>
        </div>
      </div>
      {/* 2e post simplifié */}
      <div style={{ margin: "0 8px 6px", background: "#fff", borderRadius: 12, padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0A3D2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontFamily: syne, fontWeight: 700 }}>H</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, fontFamily: dm, color: "#1A1714" }}>Hello Chipeur <span style={{ background: "#EBF5F0", color: "#0A3D2E", fontSize: 7, padding: "1px 5px", borderRadius: 5, fontWeight: 600 }}>Commerçant</span></div>
            <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>Saint-Dié · 2j</div>
          </div>
        </div>
      </div>
      <MiniNav active="fil" />
    </div>
  );
}

// ── Slide 2 : Événements ────────────────────────────────────────
function IlluEvenements() {
  return (
    <div style={{ background: "#F5F2EE", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)" }}>
      <div style={{ background: "#fff", padding: "8px 10px", borderBottom: "1px solid rgba(26,23,20,0.06)" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: "#1A1714" }}>📅 Sorties & Événements</div>
      </div>
      {/* Event card */}
      <div style={{ margin: "6px 8px", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ background: "linear-gradient(135deg,#1A1A2E,#FF5733)", height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 24 }}>🎪</span>
        </div>
        <div style={{ padding: "6px 8px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#1A1714", fontFamily: dm }}>Marché des Artisans</div>
          <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>📍 Saint-Dié · Samedi 10h</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
            <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>👥 12 participants</div>
            <div style={{ background: "#FF5733", color: "#fff", fontSize: 8, padding: "3px 8px", borderRadius: 8, fontFamily: dm, fontWeight: 600 }}>Je viens</div>
          </div>
        </div>
      </div>
      <div style={{ margin: "0 8px 6px", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ background: "linear-gradient(135deg,#1A1A2E,#7C3AED)", height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18 }}>🎶</span>
        </div>
        <div style={{ padding: "5px 8px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#1A1714", fontFamily: dm }}>Concert de jazz</div>
          <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>📍 Place Gilles de la Tourette</div>
        </div>
      </div>
      <MiniNav active="evenement" />
    </div>
  );
}

// ── Slide 3 : Publier ───────────────────────────────────────────
function IlluPublier() {
  const types = [
    { e: "📸", l: "Chope !", bg: "#FFF4F1", c: "#FF5733" },
    { e: "✅", l: "Tu valides", bg: "#EBF5F0", c: "#0A3D2E" },
    { e: "🏆", l: "Défi", bg: "#FFF8E8", c: "#B45309" },
    { e: "📅", l: "Sortie", bg: "#F0F0FF", c: "#5B21B6" },
    { e: "🏪", l: "Lieu", bg: "#EBF5F0", c: "#0A3D2E" },
    { e: "💡", l: "Bon plan", bg: "#FFF8E8", c: "#B45309" },
  ];
  return (
    <div style={{ background: "#F5F2EE", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)" }}>
      <div style={{ background: "#fff", padding: "8px 10px", borderBottom: "1px solid rgba(26,23,20,0.06)", textAlign: "center" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: "#1A1714" }}>Que veux-tu partager ?</div>
      </div>
      <div style={{ padding: "6px 8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {types.map((t, i) => (
          <div key={i} style={{ background: t.bg, borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{t.e}</div>
            <div style={{ fontSize: 8, fontFamily: dm, fontWeight: 600, color: t.c, marginTop: 2 }}>{t.l}</div>
          </div>
        ))}
      </div>
      <MiniNav active="fab" />
    </div>
  );
}

// ── Slide 4 : Commerces ─────────────────────────────────────────
function IlluCommerces() {
  return (
    <div style={{ background: "#F5F2EE", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)" }}>
      <div style={{ background: "#fff", padding: "8px 10px", borderBottom: "1px solid rgba(26,23,20,0.06)" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: "#1A1714" }}>🏪 Commerces du quartier</div>
      </div>
      <div style={{ padding: "6px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {[
          { e: "👗", n: "Mode & Co", xp: "42 XP Shop" },
          { e: "📚", n: "La Librairie", xp: "80 XP Shop" },
          { e: "🥐", n: "Boulangerie", xp: "15 XP Shop" },
          { e: "💈", n: "Le Barbier", xp: "33 XP Shop" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "7px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ background: "#EBF5F0", borderRadius: 8, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{c.e}</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, fontFamily: dm, color: "#1A1714" }}>{c.n}</div>
            <div style={{ background: "#0A3D2E", borderRadius: 6, padding: "2px 5px", marginTop: 3, display: "inline-block" }}>
              <span style={{ fontSize: 7, color: "#fff", fontFamily: dm, fontWeight: 600 }}>{c.xp}</span>
            </div>
          </div>
        ))}
      </div>
      <MiniNav active="commerces" />
    </div>
  );
}

// ── Slide 5 : Profil & Voisins ──────────────────────────────────
function IlluProfil() {
  return (
    <div style={{ background: "#F5F2EE", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)" }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#FF5733,#F7A72D)", height: 40, position: "relative" }}>
        <div style={{ position: "absolute", bottom: -18, left: 10, width: 36, height: 36, borderRadius: "50%", background: "#FF5733", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontFamily: syne, fontWeight: 700 }}>J</div>
      </div>
      <div style={{ background: "#fff", padding: "22px 10px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: syne, color: "#1A1714" }}>jenny88</div>
        <div style={{ fontSize: 8, color: "#6B6560", fontFamily: dm }}>Saint-Dié-des-Vosges</div>
        {/* Stats */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(26,23,20,0.08)", borderBottom: "1px solid rgba(26,23,20,0.08)", marginTop: 6, padding: "5px 0" }}>
          {[
            { n: "12", l: "posts" },
            { n: "#4", l: "classement", c: "#F7A72D" },
            { n: "340", l: "⚡ XP gloire", c: "#FF5733" },
            { n: "52", l: "🏪 XP Shop", c: "#0A3D2E" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? "1px solid rgba(26,23,20,0.08)" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 700, fontFamily: syne, color: s.c || "#1A1714" }}>{s.n}</div>
              <div style={{ fontSize: 7, color: "#6B6560", fontFamily: dm }}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Bandeau XP Shop */}
        <div style={{ marginTop: 6, background: "linear-gradient(135deg,#FFF8F6,#FFF0EB)", borderRadius: 8, padding: "5px 8px", display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,87,51,0.15)" }}>
          <span style={{ fontSize: 12 }}>🎁</span>
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, fontFamily: syne, color: "#1A1714" }}>Mes XP Shop & réductions</div>
            <div style={{ fontSize: 7, color: "#6B6560", fontFamily: dm }}>Bons d'achat & offres du quartier</div>
          </div>
          <div style={{ marginLeft: "auto", background: "#FF5733", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>→</div>
        </div>
      </div>
      <MiniNav active="profil" />
    </div>
  );
}

// ── Données des slides ───────────────────────────────────────────
const SLIDES = [
  {
    navId: "fil",
    color: "#FF5733",
    bgPill: "#FFF4F1",
    emoji: "🏠",
    label: "Le Fil",
    title: "Le Fil — le cœur de l'appli",
    desc: "Tous les posts de tes voisins : découvertes mode, bons plans, pépites locales. Like, réagis, commente !",
    illu: <IlluFil />,
  },
  {
    navId: "evenement",
    color: "#7C3AED",
    bgPill: "#F0F0FF",
    emoji: "📅",
    label: "Événements",
    title: "Sorties & Événements",
    desc: "Brocantes, concerts, fêtes de quartier… Découvre ce qui se passe à Saint-Dié et rejoins les sorties !",
    illu: <IlluEvenements />,
  },
  {
    navId: "fab",
    color: "#FF5733",
    bgPill: "#FFF4F1",
    emoji: "+",
    label: "Publier",
    title: "Le bouton + pour tout partager",
    desc: "Photo d'article, bon plan, défi photo, sortie, lieu à découvrir… Le bouton orange + lance tout !",
    illu: <IlluPublier />,
  },
  {
    navId: "commerces",
    color: "#0A3D2E",
    bgPill: "#EBF5F0",
    emoji: "🏪",
    label: "Commerces",
    title: "Les commerces du quartier",
    desc: "Explore les boutiques locales. Poste une photo d'un article → si le commerçant valide → tu gagnes des XP Shop 🎁",
    illu: <IlluCommerces />,
  },
  {
    navId: "profil",
    color: "#FF5733",
    bgPill: "#FFF4F1",
    emoji: "👤",
    label: "Profil & Voisins",
    title: "Ton profil & tes voisins",
    desc: "Consulte ton XP gloire, tes XP Shop, tes bons d'achat disponibles. Découvre qui habite près de toi !",
    illu: <IlluProfil />,
  },
];

// ── Modale principale ────────────────────────────────────────────
export default function FilTourModal({ onClose, setPage }) {
  const [step, setStep] = useState(0);
  const s = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(26,23,20,0.72)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: "22px 22px 0 0",
        padding: "16px 16px 32px", width: "100%", maxWidth: 480,
        animation: "slideUp 0.3s ease",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "#EDEBE8", borderRadius: 2, margin: "0 auto 14px" }} />

        {/* Indicateurs */}
        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 14 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ height: 3, borderRadius: 2, cursor: "pointer", transition: "all 0.25s", width: i === step ? 22 : 10, background: i === step ? s.color : "#EDEBE8" }} />
          ))}
        </div>

        {/* Label section */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ background: s.bgPill, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: s.emoji === "+" ? 14 : 16, fontWeight: s.emoji === "+" ? 800 : "normal", color: s.color, fontFamily: syne }}>{s.emoji}</span>
            <span style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: s.color }}>{s.label}</span>
          </div>
        </div>

        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: "#1A1714", marginBottom: 4 }}>{s.title}</div>
        <div style={{ fontSize: 12, color: "#6B6560", lineHeight: 1.5, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</div>

        {/* Illustration */}
        <div style={{ marginBottom: 16 }}>{s.illu}</div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 8 }}>
          {step > 0
            ? <button onClick={() => setStep(p => p - 1)} style={{ flex: 1, padding: "11px 0", borderRadius: 13, border: "1.5px solid #EDEBE8", background: "#fff", color: "#6B6560", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Retour</button>
            : <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 13, border: "1.5px solid #EDEBE8", background: "#fff", color: "#6B6560", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Passer</button>
          }
          <button onClick={() => isLast ? onClose() : setStep(p => p + 1)}
            style={{ flex: 2, padding: "11px 0", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#FF5733,#F7A72D)", color: "#fff", fontFamily: syne, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {isLast ? "C'est parti ! 🚀" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}
