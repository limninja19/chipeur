import { useState } from "react";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

// Détection plateforme
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isAlreadyInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

// ── Illustration Android ──────────────────────────────────────────
function IlluAndroid() {
  return (
    <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 280 }}>
      {/* Téléphone */}
      <rect x="60" y="10" width="160" height="180" rx="16" fill="#1A1A2E" />
      <rect x="66" y="24" width="148" height="152" rx="8" fill="#F5F2EE" />
      {/* Barre du haut Chrome */}
      <rect x="66" y="24" width="148" height="28" rx="8" fill="#FFFFFF" />
      <rect x="66" y="38" width="148" height="14" fill="#FFFFFF" />
      <rect x="74" y="30" width="90" height="14" rx="7" fill="#EDEBE8" />
      {/* Texte URL */}
      <text x="119" y="40" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>chipeur.vercel.app</text>
      {/* Icône 3 points → flèche vers elles */}
      <circle cx="202" cy="37" r="2" fill="#6B6560" />
      <circle cx="208" cy="37" r="2" fill="#6B6560" />
      <circle cx="214" cy="37" r="2" fill="#6B6560" />
      {/* Flèche rouge pointant vers les 3 points */}
      <path d="M214 20 L214 28" stroke="#FF5733" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#FF5733" />
        </marker>
      </defs>
      {/* Étiquette "1" */}
      <circle cx="214" cy="14" r="8" fill="#FF5733" />
      <text x="214" y="18" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">1</text>

      {/* Menu déroulant */}
      <rect x="150" y="48" width="60" height="70" rx="8" fill="white" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }} />
      <text x="180" y="64" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Favoris</text>
      <line x1="155" y1="68" x2="205" y2="68" stroke="#EDEBE8" strokeWidth="1" />
      <text x="180" y="80" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Partager</text>
      <line x1="155" y1="84" x2="205" y2="84" stroke="#EDEBE8" strokeWidth="1" />
      {/* Option "Ajouter" surlignée */}
      <rect x="152" y="87" width="56" height="14" rx="4" fill="#FFF0EB" />
      <text x="180" y="97" textAnchor="middle" fontSize="6.5" fill="#FF5733" fontFamily={dm} fontWeight="700">Ajouter écran accueil</text>
      <line x1="155" y1="101" x2="205" y2="101" stroke="#EDEBE8" strokeWidth="1" />
      <text x="180" y="112" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Historique</text>
      {/* Étiquette "2" + flèche */}
      <circle cx="148" cy="94" r="8" fill="#FF5733" />
      <text x="148" y="98" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">2</text>
      <path d="M154 94 L150 94" stroke="#FF5733" strokeWidth="1.5" strokeLinecap="round" />

      {/* Contenu page en dessous */}
      <rect x="74" y="58" width="66" height="50" rx="6" fill="#EDEBE8" opacity="0.5" />
      <rect x="74" y="115" width="140" height="8" rx="4" fill="#EDEBE8" opacity="0.5" />
      <rect x="74" y="128" width="100" height="8" rx="4" fill="#EDEBE8" opacity="0.5" />
      <rect x="74" y="141" width="120" height="8" rx="4" fill="#EDEBE8" opacity="0.5" />

      {/* Bouton home physique */}
      <circle cx="140" cy="196" r="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    </svg>
  );
}

// ── Illustration iOS ──────────────────────────────────────────────
function IlluIOS() {
  return (
    <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 280 }}>
      {/* Téléphone */}
      <rect x="60" y="10" width="160" height="180" rx="20" fill="#1A1A2E" />
      <rect x="66" y="24" width="148" height="152" rx="10" fill="#F5F2EE" />
      {/* Notch */}
      <rect x="110" y="22" width="60" height="10" rx="5" fill="#1A1A2E" />
      {/* Barre Safari */}
      <rect x="66" y="34" width="148" height="24" fill="#FFFFFF" />
      <rect x="74" y="38" width="100" height="14" rx="7" fill="#EDEBE8" />
      <text x="124" y="47" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>chipeur.vercel.app</text>

      {/* Contenu page */}
      <rect x="74" y="65" width="60" height="50" rx="6" fill="#EDEBE8" opacity="0.5" />
      <rect x="74" y="120" width="140" height="8" rx="4" fill="#EDEBE8" opacity="0.4" />
      <rect x="74" y="133" width="100" height="8" rx="4" fill="#EDEBE8" opacity="0.4" />

      {/* Barre basse Safari avec bouton partage */}
      <rect x="66" y="154" width="148" height="22" fill="#FFFFFF" />
      {/* Bouton retour */}
      <text x="82" y="169" textAnchor="middle" fontSize="14" fill="#6B6560">‹</text>
      {/* Icône partage (carré + flèche) */}
      <rect x="130" y="159" width="12" height="10" rx="2" fill="none" stroke="#007AFF" strokeWidth="1.5" />
      <line x1="136" y1="159" x2="136" y2="153" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M132,156 L136,152 L140,156" fill="none" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Flèche "1" vers bouton partage */}
      <path d="M136 144 L136 149" stroke="#FF5733" strokeWidth="2" strokeLinecap="round" />
      <circle cx="136" cy="138" r="8" fill="#FF5733" />
      <text x="136" y="142" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">1</text>

      {/* Sheet iOS bas */}
      <rect x="66" y="100" width="148" height="56" rx="10" fill="white" opacity="0.97" style={{ filter: "drop-shadow(0 -4px 16px rgba(0,0,0,0.12))" }} />
      {/* Options */}
      <text x="140" y="115" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Copier le lien</text>
      <line x1="74" y1="119" x2="206" y2="119" stroke="#EDEBE8" strokeWidth="1" />
      {/* Option "Sur l'écran d'accueil" surlignée */}
      <rect x="70" y="121" width="140" height="16" rx="4" fill="#FFF0EB" />
      <text x="140" y="133" textAnchor="middle" fontSize="7" fill="#FF5733" fontFamily={dm} fontWeight="700">Sur l'écran d'accueil</text>
      <line x1="74" y1="137" x2="206" y2="137" stroke="#EDEBE8" strokeWidth="1" />
      <text x="140" y="149" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Marquer-page</text>
      {/* Étiquette "2" */}
      <circle cx="66" cy="129" r="8" fill="#FF5733" />
      <text x="66" y="133" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">2</text>
    </svg>
  );
}

// ── Illustration Desktop ─────────────────────────────────────────
function IlluDesktop() {
  return (
    <div style={{ textAlign: "center", padding: "20px 0", fontSize: 60 }}>💻</div>
  );
}

// ── Modale principale ────────────────────────────────────────────
export default function InstallPWAModal({ onClose }) {
  const platform = detectPlatform();
  const [step, setStep] = useState(0);

  if (isAlreadyInstalled()) {
    onClose?.();
    return null;
  }

  if (platform === "desktop") {
    onClose?.();
    return null;
  }

  const isIOS = platform === "ios";

  const steps = isIOS ? [
    {
      title: "Ajoute Chipeur sur ton écran 📱",
      subtitle: "Accès en 1 tap, comme une vraie appli !",
      illu: <IlluIOS />,
      steps: [
        { n: "1", text: "Appuie sur le bouton Partager ⬆️ en bas de Safari" },
        { n: "2", text: "Choisis « Sur l'écran d'accueil »" },
        { n: "3", text: "Appuie sur « Ajouter » en haut à droite" },
      ],
    },
  ] : [
    {
      title: "Ajoute Chipeur sur ton écran 📱",
      subtitle: "Accès en 1 tap, comme une vraie appli !",
      illu: <IlluAndroid />,
      steps: [
        { n: "1", text: "Appuie sur les 3 points ⋮ en haut à droite" },
        { n: "2", text: "Sélectionne « Ajouter à l'écran d'accueil »" },
        { n: "3", text: "Confirme en appuyant sur « Ajouter »" },
      ],
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,8,6,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 36px", width: "100%", maxWidth: 480,
        animation: "slideUp 0.3s ease",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "#EDEBE8", borderRadius: 2, margin: "0 auto 20px" }} />

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 22, color: "#1A1714", marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ fontSize: 13, color: "#6B6560" }}>{current.subtitle}</div>
        </div>

        {/* Illustration */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          {current.illu}
        </div>

        {/* Étapes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {current.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#FF5733", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: syne, fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>{s.n}</div>
              <div style={{ fontSize: 13, color: "#1A1714", lineHeight: 1.4 }}>{s.text}</div>
            </div>
          ))}
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #EDEBE8", background: "#fff", color: "#6B6560", fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Plus tard
          </button>
          <button
            onClick={onClose}
            style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#FF5733,#F7A72D)", color: "#fff", fontFamily: syne, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            J'ai compris ! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
