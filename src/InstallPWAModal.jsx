import { useState, useEffect } from "react";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

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

// ── Illustration iOS ──────────────────────────────────────────────
function IlluIOS() {
  return (
    <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 280 }}>
      <rect x="60" y="10" width="160" height="180" rx="20" fill="#1A1A2E" />
      <rect x="66" y="24" width="148" height="152" rx="10" fill="#F5F2EE" />
      <rect x="110" y="22" width="60" height="10" rx="5" fill="#1A1A2E" />
      <rect x="66" y="34" width="148" height="24" fill="#FFFFFF" />
      <rect x="74" y="38" width="100" height="14" rx="7" fill="#EDEBE8" />
      <text x="124" y="47" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>chipeur.vercel.app</text>
      <rect x="74" y="65" width="60" height="50" rx="6" fill="#EDEBE8" opacity="0.5" />
      <rect x="74" y="120" width="140" height="8" rx="4" fill="#EDEBE8" opacity="0.4" />
      <rect x="74" y="133" width="100" height="8" rx="4" fill="#EDEBE8" opacity="0.4" />
      <rect x="66" y="154" width="148" height="22" fill="#FFFFFF" />
      <text x="82" y="169" textAnchor="middle" fontSize="14" fill="#6B6560">‹</text>
      <rect x="130" y="159" width="12" height="10" rx="2" fill="none" stroke="#007AFF" strokeWidth="1.5" />
      <line x1="136" y1="159" x2="136" y2="153" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M132,156 L136,152 L140,156" fill="none" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M136 144 L136 149" stroke="#FF5733" strokeWidth="2" strokeLinecap="round" />
      <circle cx="136" cy="138" r="8" fill="#FF5733" />
      <text x="136" y="142" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">1</text>
      <rect x="66" y="100" width="148" height="56" rx="10" fill="white" opacity="0.97" />
      <text x="140" y="115" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Copier le lien</text>
      <line x1="74" y1="119" x2="206" y2="119" stroke="#EDEBE8" strokeWidth="1" />
      <rect x="70" y="121" width="140" height="16" rx="4" fill="#FFF0EB" />
      <text x="140" y="133" textAnchor="middle" fontSize="7" fill="#FF5733" fontFamily={dm} fontWeight="700">Sur l'écran d'accueil</text>
      <line x1="74" y1="137" x2="206" y2="137" stroke="#EDEBE8" strokeWidth="1" />
      <text x="140" y="149" textAnchor="middle" fontSize="7" fill="#6B6560" fontFamily={dm}>Marquer-page</text>
      <circle cx="66" cy="129" r="8" fill="#FF5733" />
      <text x="66" y="133" textAnchor="middle" fontSize="9" fill="#fff" fontFamily={syne} fontWeight="700">2</text>
    </svg>
  );
}

// ── Modale principale ────────────────────────────────────────────
export default function InstallPWAModal({ onClose }) {
  const platform = detectPlatform();
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);
  const shouldSkip = isAlreadyInstalled() || platform === "desktop";

  useEffect(() => {
    if (shouldSkip) onClose?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (shouldSkip) return null;

  const isIOS = platform === "ios";
  // Sur Android, on utilise le prompt natif si disponible
  const nativePrompt = !isIOS ? window.__chipeurInstallPrompt : null;

  // ── CAS ANDROID avec prompt natif ────────────────────────────────
  const handleNativeInstall = async () => {
    if (!nativePrompt) return;
    setInstalling(true);
    try {
      nativePrompt.prompt();
      const { outcome } = await nativePrompt.userChoice;
      window.__chipeurInstallPrompt = null;
      if (outcome === "accepted") {
        setDone(true);
        setTimeout(() => onClose?.(), 1800);
      } else {
        onClose?.();
      }
    } catch (_) {
      onClose?.();
    }
  };

  // ── RENDU ANDROID natif ──────────────────────────────────────────
  if (!isIOS && nativePrompt) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(10,8,6,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}>
        <div style={{
          background: "#FFFFFF", borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px", width: "100%", maxWidth: 480,
          animation: "slideUp 0.3s ease",
        }}>
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          <div style={{ width: 40, height: 4, background: "#EDEBE8", borderRadius: 2, margin: "0 auto 24px" }} />

          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 20, color: "#1A1714", marginBottom: 6 }}>
                Chipeur est installé !
              </div>
              <div style={{ fontSize: 13, color: "#6B6560" }}>
                Tu le retrouveras sur ton écran d'accueil.
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📲</div>
                <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 20, color: "#1A1714", marginBottom: 6 }}>
                  Installer Chipeur
                </div>
                <div style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.5 }}>
                  Accède à Chipeur en 1 tap depuis ton écran d'accueil,<br />
                  comme une vraie application.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: "13px 0", borderRadius: 14, border: "1.5px solid #EDEBE8", background: "#fff", color: "#6B6560", fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Plus tard
                </button>
                <button
                  onClick={handleNativeInstall}
                  disabled={installing}
                  style={{ flex: 2, padding: "13px 0", borderRadius: 14, border: "none", background: "#FF5733", color: "#fff", fontFamily: syne, fontSize: 14, fontWeight: 800, cursor: installing ? "not-allowed" : "pointer", opacity: installing ? 0.7 : 1 }}
                >
                  {installing ? "⏳ Installation…" : "Installer l'app 🚀"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── RENDU iOS (ou Android sans prompt) — instructions manuelles ──
  const steps = isIOS ? [
    { n: "1", text: "Appuie sur le bouton Partager ⬆️ en bas de Safari" },
    { n: "2", text: "Choisis « Sur l'écran d'accueil »" },
    { n: "3", text: "Appuie sur « Ajouter » en haut à droite" },
  ] : [
    { n: "1", text: "Appuie sur les 3 points ⋮ en haut à droite de Chrome" },
    { n: "2", text: "Sélectionne « Ajouter à l'écran d'accueil »" },
    { n: "3", text: "Confirme en appuyant sur « Ajouter »" },
  ];

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
        <div style={{ width: 40, height: 4, background: "#EDEBE8", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 22, color: "#1A1714", marginBottom: 4 }}>
            Ajoute Chipeur sur ton écran 📱
          </div>
          <div style={{ fontSize: 13, color: "#6B6560" }}>Accès en 1 tap, comme une vraie appli !</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          {isIOS && <IlluIOS />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {steps.map((s, i) => (
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
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid #EDEBE8", background: "#fff", color: "#6B6560", fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Plus tard
          </button>
          <button
            onClick={onClose}
            style={{ flex: 2, padding: "12px 0", borderRadius: 14, border: "none", background: "#FF5733", color: "#fff", fontFamily: syne, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            J'ai compris ! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
