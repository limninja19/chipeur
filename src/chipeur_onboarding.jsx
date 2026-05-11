import { useState, useRef } from "react";

const C = {
  bg:     "#F5F2EE",
  accent: "#FF5733",
  gold:   "#F7A72D",
  ink:    "#1A1714",
  ink2:   "#6B6660",
  card:   "#FFFFFF",
  pill:   "#EDEAE6",
  pro:    "#0A3D2E",
};
const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

const REACTIONS = [
  { emoji: "❤️",  label: "J'aime"         },
  { emoji: "🔥",  label: "Je kiffe"        },
  { emoji: "🛒",  label: "Je le veux"      },
  { emoji: "✨",  label: "C'est mon style"  },
  { emoji: "👍",  label: "Je recommande"   },
];

// ─── Écran 1 ────────────────────────────────────────────────────────────────
function Screen1() {
  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.ink,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px", boxSizing: "border-box", textAlign: "center",
    }}>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 44,
        color: C.accent, letterSpacing: "-2px", marginBottom: 28,
      }}>
        chipeur
      </div>

      <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 28 }}>🏘️</div>

      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 26,
        color: "#FFFFFF", lineHeight: 1.2, marginBottom: 14,
      }}>
        Le quartier dans ta poche
      </div>

      <div style={{
        fontFamily: dm, fontSize: 15,
        color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 280,
      }}>
        Découvre ta ville d'un autre œil — les instants de tes voisins, les produits de tes commerçants et artisans, les bons plans du quartier. Et partage les tiens.
      </div>

      <div style={{
        marginTop: 36,
        background: "rgba(255,87,51,0.12)",
        border: "1px solid rgba(255,87,51,0.3)",
        borderRadius: 30, padding: "8px 20px",
        fontFamily: syne, fontWeight: 700, fontSize: 11,
        color: C.accent, letterSpacing: "0.1em",
      }}>
        📍 SAINT-DIÉ-DES-VOSGES
      </div>
    </div>
  );
}

// ─── Écran 2 ────────────────────────────────────────────────────────────────
function Screen2() {
  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 20px 80px", boxSizing: "border-box",
    }}>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 22,
        color: C.ink, textAlign: "center", marginBottom: 6,
      }}>
        Voisins &amp; Commerçants
      </div>
      <div style={{
        fontFamily: dm, fontSize: 13, color: C.ink2,
        textAlign: "center", marginBottom: 24, lineHeight: 1.5,
      }}>
        Deux façons de participer à la vie locale
      </div>

      {/* Voisin */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: `1.5px solid ${C.pill}`, padding: "18px 16px",
        marginBottom: 12, boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🏘️</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>Voisin</span>
          <span style={{
            fontFamily: dm, fontSize: 10, fontWeight: 600,
            color: C.pro, background: "#EBF5F0",
            padding: "2px 9px", borderRadius: 20,
          }}>gratuit</span>
        </div>
        <div style={{ fontFamily: dm, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
          Partage tes chopes, bons plans et sorties avec ta communauté. Réagis, commente et accumule des XP.
        </div>
      </div>

      {/* Commerçant */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: "1.5px solid rgba(10,61,46,0.18)", padding: "18px 16px",
        boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🏪</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>
          Commerçant
        </div>
        <div style={{ fontFamily: dm, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
          Crée des défis photo, anime ta communauté de clients et gagne en visibilité dans le quartier.
        </div>
      </div>
    </div>
  );
}

// ─── Écran 3 ────────────────────────────────────────────────────────────────
function Screen3({ onDone }) {
  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 20px 40px", boxSizing: "border-box",
    }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🎮</div>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 22,
        color: C.ink, textAlign: "center", marginBottom: 6,
      }}>
        Réagis, participe, gagne
      </div>
      <div style={{
        fontFamily: dm, fontSize: 13, color: C.ink2,
        textAlign: "center", marginBottom: 22, lineHeight: 1.5,
      }}>
        Plus qu'une appli, un jeu local
      </div>

      {/* Réactions */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: `1.5px solid ${C.pill}`, padding: "14px",
        marginBottom: 10, boxSizing: "border-box",
      }}>
        <div style={{
          fontFamily: syne, fontWeight: 700, fontSize: 10,
          color: C.ink2, letterSpacing: "0.07em", marginBottom: 10,
        }}>
          LES 5 RÉACTIONS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {REACTIONS.map(r => (
            <div key={r.emoji} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: C.bg, borderRadius: 20, padding: "5px 10px",
              fontFamily: dm, fontSize: 12, color: C.ink,
            }}>
              <span style={{ fontSize: 14 }}>{r.emoji}</span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Défis */}
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #FF5733, #F7A72D)",
        borderRadius: 20, padding: "14px 16px",
        marginBottom: 24, boxSizing: "border-box",
      }}>
        <div style={{
          fontFamily: syne, fontWeight: 700, fontSize: 13,
          color: "#fff", marginBottom: 5,
        }}>
          🏆 Défis
        </div>
        <div style={{
          fontFamily: dm, fontSize: 12,
          color: "rgba(255,255,255,0.85)", lineHeight: 1.55,
        }}>
          Participe aux défis des commerçants locaux et tente de gagner des récompenses dans ton quartier.
        </div>
      </div>

      {/* CTA final */}
      <button
        onClick={onDone}
        style={{
          width: "100%", background: C.accent, color: "#fff",
          border: "none", borderRadius: 16, padding: "15px 0",
          fontFamily: syne, fontWeight: 700, fontSize: 16,
          cursor: "pointer", letterSpacing: "-0.3px",
        }}
      >
        C'est parti →
      </button>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const startX = useRef(null);
  const TOTAL  = 3;

  function next() { setStep(s => Math.min(s + 1, TOTAL - 1)); }
  function prev() { setStep(s => Math.max(s - 1, 0)); }

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -50) next();
    else if (dx > 50) prev();
    startX.current = null;
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: "fixed", inset: 0, overflow: "hidden", userSelect: "none" }}
    >
      {/* Bouton Passer */}
      <button
        onClick={onDone}
        style={{
          position: "absolute", top: 20, right: 16, zIndex: 20,
          background: step === 0 ? "rgba(255,255,255,0.12)" : "rgba(107,102,96,0.1)",
          border: "none", borderRadius: 20, padding: "6px 14px",
          fontFamily: dm, fontSize: 12,
          color: step === 0 ? "rgba(255,255,255,0.55)" : C.ink2,
          cursor: "pointer",
        }}
      >
        Passer
      </button>

      {/* Slides */}
      <div style={{
        display: "flex",
        width: "300%",
        height: "100%",
        transform: `translateX(${-step * (100 / 3)}%)`,
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <Screen1 />
        <Screen2 />
        <Screen3 onDone={onDone} />
      </div>

      {/* Barre de navigation (dots + Suivant) */}
      {step < 2 && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 24px 44px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: step === 0
            ? "linear-gradient(to top, rgba(26,23,20,0.75) 0%, transparent 100%)"
            : "linear-gradient(to top, rgba(245,242,238,1) 55%, transparent 100%)",
          pointerEvents: "none",
        }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: 6,
                width: i === step ? 22 : 6,
                borderRadius: 3,
                background: i === step
                  ? C.accent
                  : (step === 0 ? "rgba(255,255,255,0.25)" : C.pill),
                transition: "all 0.25s ease",
              }} />
            ))}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={next}
            style={{
              pointerEvents: "auto",
              background: C.accent, color: "#fff",
              border: "none", borderRadius: 14, padding: "11px 22px",
              fontFamily: syne, fontWeight: 700, fontSize: 14,
              cursor: "pointer",
            }}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Dots seuls sur l'écran 3 (le CTA est dans la slide) */}
      {step === 2 && (
        <div style={{
          position: "absolute", bottom: 44, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 6,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: 6, width: i === 2 ? 22 : 6, borderRadius: 3,
              background: i === 2 ? C.accent : C.pill,
              transition: "all 0.25s ease",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
