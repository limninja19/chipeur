import { useState } from "react";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";
const C = { accent: "#FF5733", ink: "#1A1714", ink2: "#6B6560", border: "rgba(26,23,20,0.08)", card: "#FFFFFF", bg: "#F5F2EE" };

const SECTIONS = [
  {
    emoji: "🏠",
    label: "Le Fil",
    color: "#FF5733",
    bg: "#FFF4F1",
    title: "Le Fil — le cœur de l'appli",
    desc: "Tous les posts de tes voisins : découvertes mode, bons plans, pépites locales. Like, réagis, commente !",
    illu: (
      <svg viewBox="0 0 240 120" style={{ width: "100%" }}>
        {/* Post card */}
        <rect x="20" y="10" width="200" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        {/* Avatar */}
        <circle cx="44" cy="30" r="12" fill="#FF5733" />
        <text x="44" y="35" textAnchor="middle" fontSize="12">👤</text>
        {/* Pseudo + date */}
        <rect x="62" y="23" width="60" height="8" rx="4" fill="#EDEBE8" />
        <rect x="62" y="35" width="40" height="6" rx="3" fill="#EDEBE8" opacity="0.6" />
        {/* Image */}
        <rect x="28" y="50" width="80" height="50" rx="10" fill="#EDEBE8" />
        <text x="68" y="82" textAnchor="middle" fontSize="22">👗</text>
        {/* Contenu texte */}
        <rect x="118" y="50" width="90" height="8" rx="4" fill="#EDEBE8" />
        <rect x="118" y="64" width="70" height="8" rx="4" fill="#EDEBE8" opacity="0.6" />
        {/* Réactions */}
        <text x="122" y="92" fontSize="12">❤️</text>
        <text x="140" y="92" fontSize="12">🔥</text>
        <text x="158" y="92" fontSize="12">🛒</text>
        {/* Badge +10 XP */}
        <rect x="170" y="82" width="38" height="14" rx="7" fill="#FFF8E8" />
        <text x="189" y="93" textAnchor="middle" fontSize="8" fill="#B45309" fontFamily={syne} fontWeight="700">+10 XP 🏪</text>
      </svg>
    ),
  },
  {
    emoji: "📅",
    label: "Événements",
    color: "#7C3AED",
    bg: "#F5F0FF",
    title: "Sorties & Événements",
    desc: "Brocantes, concerts, fêtes de quartier… Découvre ce qui se passe à Saint-Dié et rejoins les sorties !",
    illu: (
      <svg viewBox="0 0 240 120" style={{ width: "100%" }}>
        <rect x="20" y="10" width="200" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        <rect x="28" y="18" width="184" height="60" rx="10" fill="#F5F0FF" />
        <text x="120" y="58" textAnchor="middle" fontSize="32">🎪</text>
        <rect x="28" y="85" width="110" height="10" rx="5" fill="#EDEBE8" />
        <rect x="28" y="100" width="70" height="8" rx="4" fill="#EDEBE8" opacity="0.6" />
        <rect x="170" y="82" width="40" height="22" rx="11" fill="#7C3AED" />
        <text x="190" y="97" textAnchor="middle" fontSize="9" fill="white" fontFamily={syne} fontWeight="700">Je viens</text>
      </svg>
    ),
  },
  {
    emoji: "📸",
    label: "Publier",
    color: "#FFFFFF",
    bg: "#FF5733",
    title: "Publier — le bouton +",
    desc: "Appuie sur le bouton orange + pour poster une photo, signaler un bon plan, créer un défi ou une sortie.",
    illu: (
      <svg viewBox="0 0 240 120" style={{ width: "100%" }}>
        <rect x="20" y="10" width="200" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        {[
          { x: 30, y: 20, emoji: "📸", label: "Chope !" },
          { x: 100, y: 20, emoji: "✅", label: "Tu valides" },
          { x: 170, y: 20, emoji: "🏆", label: "Défi" },
          { x: 30, y: 72, emoji: "📅", label: "Sortie" },
          { x: 100, y: 72, emoji: "🏪", label: "Lieu" },
          { x: 170, y: 72, emoji: "💡", label: "Bon plan" },
        ].map((it, i) => (
          <g key={i}>
            <rect x={it.x} y={it.y} width="60" height="46" rx="12" fill="#F5F2EE" />
            <text x={it.x + 30} y={it.y + 24} textAnchor="middle" fontSize="18">{it.emoji}</text>
            <text x={it.x + 30} y={it.y + 40} textAnchor="middle" fontSize="8" fill="#6B6560" fontFamily={dm}>{it.label}</text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    emoji: "🏪",
    label: "Commerces",
    color: "#0A3D2E",
    bg: "#EBF5F0",
    title: "Commerces du quartier",
    desc: "Explore les boutiques locales de Saint-Dié. Poste une photo d'un article → si le commerçant valide → tu gagnes des XP Shop 🎁",
    illu: (
      <svg viewBox="0 0 240 120" style={{ width: "100%" }}>
        <rect x="20" y="10" width="200" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        {[
          { x: 28, emoji: "👗", name: "Mode & Co", xp: "42" },
          { x: 128, emoji: "📚", name: "Librairie", xp: "80" },
        ].map((com, i) => (
          <g key={i}>
            <rect x={com.x} y="18" width="84" height="92" rx="12" fill="#F5F2EE" />
            <rect x={com.x + 8} y="26" width="68" height="48" rx="8" fill="#EBF5F0" />
            <text x={com.x + 42} y="58" textAnchor="middle" fontSize="26">{com.emoji}</text>
            <text x={com.x + 42} y="84" textAnchor="middle" fontSize="9" fill="#1A1714" fontFamily={syne} fontWeight="700">{com.name}</text>
            <rect x={com.x + 16} y="90" width="52" height="14" rx="7" fill="#0A3D2E" />
            <text x={com.x + 42} y="101" textAnchor="middle" fontSize="8" fill="white" fontFamily={dm} fontWeight="600">{com.xp} XP Shop</text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    emoji: "👤",
    label: "Profil & Voisins",
    color: "#FF5733",
    bg: "#FFF4F1",
    title: "Ton profil & les Voisins",
    desc: "Ton profil : tes posts, ton XP gloire, tes XP Shop, tes réductions. L'onglet Voisins pour découvrir qui habite près de toi !",
    illu: (
      <svg viewBox="0 0 240 120" style={{ width: "100%" }}>
        {/* Profil */}
        <rect x="20" y="10" width="94" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        <circle cx="67" cy="38" r="18" fill="#FF5733" opacity="0.15" />
        <text x="67" y="44" textAnchor="middle" fontSize="22">👤</text>
        <rect x="32" y="62" width="70" height="8" rx="4" fill="#EDEBE8" />
        <div />
        <rect x="28" y="76" width="24" height="20" rx="6" fill="#FFF4F1" />
        <text x="40" y="90" textAnchor="middle" fontSize="7" fill="#FF5733" fontFamily={syne} fontWeight="700">XP</text>
        <rect x="58" y="76" width="24" height="20" rx="6" fill="#EBF5F0" />
        <text x="70" y="90" textAnchor="middle" fontSize="6" fill="#0A3D2E" fontFamily={syne} fontWeight="700">Shop</text>
        <rect x="88" y="76" width="24" height="20" rx="6" fill="#FFF8E8" />
        <text x="100" y="90" textAnchor="middle" fontSize="7" fill="#B45309" fontFamily={syne} fontWeight="700">#3</text>
        {/* Voisins */}
        <rect x="126" y="10" width="94" height="100" rx="16" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        <text x="173" y="30" textAnchor="middle" fontSize="10" fill="#6B6560" fontFamily={syne} fontWeight="700">Voisins</text>
        {[
          { y: 38, e: "👩", n: "Sophie", xp: "340" },
          { y: 62, e: "👨", n: "Marc", xp: "210" },
          { y: 86, e: "👧", n: "Léa", xp: "95" },
        ].map((v, i) => (
          <g key={i}>
            <text x="138" y={v.y + 10} fontSize="14">{v.e}</text>
            <text x="158" y={v.y + 8} fontSize="8" fill="#1A1714" fontFamily={dm} fontWeight="600">{v.n}</text>
            <text x="158" y={v.y + 18} fontSize="7" fill="#FF5733" fontFamily={syne} fontWeight="700">⚡ {v.xp} XP</text>
          </g>
        ))}
      </svg>
    ),
  },
];

export default function FilTourModal({ onClose, setPage }) {
  const [step, setStep] = useState(0);
  const current = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(10,8,6,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: C.card, borderRadius: "24px 24px 0 0",
        padding: "20px 20px 36px", width: "100%", maxWidth: 480,
        animation: "slideUp 0.3s ease",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "#EDEBE8", borderRadius: 2, margin: "0 auto 16px" }} />

        {/* Indicateurs de progression */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {SECTIONS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ height: 4, borderRadius: 2, cursor: "pointer", transition: "all 0.3s", width: i === step ? 24 : 12, background: i === step ? C.accent : "#EDEBE8" }} />
          ))}
        </div>

        {/* Contenu */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: current.bg, borderRadius: 20, padding: "6px 14px", marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{current.emoji}</span>
            <span style={{ fontFamily: syne, fontWeight: 800, fontSize: 14, color: current.color === "#FFFFFF" ? C.accent : current.color }}>{current.label}</span>
          </div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 6 }}>{current.title}</div>
          <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, marginBottom: 12 }}>{current.desc}</div>
        </div>

        {/* Illustration */}
        <div style={{ marginBottom: 20 }}>{current.illu}</div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #EDEBE8", background: "#fff", color: C.ink2, fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ← Retour
            </button>
          )}
          {step === 0 && (
            <button onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #EDEBE8", background: "#fff", color: C.ink2, fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Passer
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) { onClose(); }
              else setStep(s => s + 1);
            }}
            style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg, #FF5733, #F7A72D)`, color: "#fff", fontFamily: syne, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            {isLast ? "C'est parti ! 🚀" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}
