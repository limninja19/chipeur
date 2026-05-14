import { useState, useRef, useEffect } from "react";

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

// ─── Écran 1 — Accroche forte ────────────────────────────────────────────────
function Screen1() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.ink,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 28px", boxSizing: "border-box", textAlign: "center",
    }}>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 44,
        color: C.accent, letterSpacing: "-2px", marginBottom: 20,
      }}>
        chipeur
      </div>

      <div style={{ fontSize: 66, lineHeight: 1, marginBottom: 20 }}>🏘️</div>

      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 24,
        color: "#FFFFFF", lineHeight: 1.2, marginBottom: 12,
      }}>
        Le quartier dans ta poche
      </div>

      <div style={{
        fontFamily: dm, fontSize: 14,
        color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 280,
        marginBottom: 28,
      }}>
        Partage, réagis, participe à la vie locale. Et en plus…
      </div>

      {/* Teaser accrocheur */}
      <div style={{
        background: "linear-gradient(135deg, #FF5733, #F7A72D)",
        borderRadius: 18, padding: "14px 18px",
        width: "100%", boxSizing: "border-box", marginBottom: 28,
      }}>
        <div style={{
          fontFamily: syne, fontWeight: 800, fontSize: 16,
          color: "#fff", marginBottom: 5,
        }}>
          🎁 Gagne des bons d'achat
        </div>
        <div style={{
          fontFamily: dm, fontSize: 12,
          color: "rgba(255,255,255,0.88)", lineHeight: 1.5,
        }}>
          Chipeur te récompense en vraie monnaie locale utilisable dans tes commerces de quartier.
        </div>
      </div>

      {/* Indicateur swipe animé */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        opacity: pulse ? 1 : 0.4,
        transition: "opacity 0.4s ease",
      }}>
        <div style={{
          fontFamily: dm, fontSize: 12, color: "rgba(255,255,255,0.6)",
        }}>
          Glisse pour découvrir
        </div>
        <div style={{ fontSize: 18 }}>👉</div>
      </div>

      <div style={{
        marginTop: 24,
        background: "rgba(255,87,51,0.12)",
        border: "1px solid rgba(255,87,51,0.3)",
        borderRadius: 30, padding: "6px 16px",
        fontFamily: syne, fontWeight: 700, fontSize: 10,
        color: C.accent, letterSpacing: "0.1em",
      }}>
        📍 SAINT-DIÉ-DES-VOSGES
      </div>
    </div>
  );
}

// ─── Écran 2 — XP Shop + Sorties (le hook) ──────────────────────────────────
function Screen2() {
  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 20px 80px", boxSizing: "border-box",
    }}>
      <div style={{ fontSize: 42, marginBottom: 12 }}>🎁</div>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 22,
        color: C.ink, textAlign: "center", marginBottom: 6,
      }}>
        Explore & gagne des récompenses
      </div>
      <div style={{
        fontFamily: dm, fontSize: 13, color: C.ink2,
        textAlign: "center", marginBottom: 20, lineHeight: 1.5,
      }}>
        Ton quartier te récompense vraiment
      </div>

      {/* XP → bons d'achat */}
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #FF5733, #F7A72D)",
        borderRadius: 20, padding: "16px 16px",
        marginBottom: 10, boxSizing: "border-box",
      }}>
        <div style={{
          fontFamily: syne, fontWeight: 700, fontSize: 14,
          color: "#fff", marginBottom: 6,
        }}>
          🏆 XP Shop → Bons d'achat
        </div>
        <div style={{
          fontFamily: dm, fontSize: 12,
          color: "rgba(255,255,255,0.9)", lineHeight: 1.6,
        }}>
          Prends en photo un article d'un commerce local et relie-le. Le commerçant valide → tu gagnes des XP convertibles en bons d'achat dans sa boutique.
        </div>
        <div style={{
          marginTop: 10, background: "rgba(255,255,255,0.2)",
          borderRadius: 10, padding: "5px 12px", display: "inline-block",
          fontFamily: syne, fontWeight: 800, fontSize: 11, color: "#fff",
        }}>
          100 XP = 5 € de bon d'achat 🎉
        </div>
      </div>

      {/* Sorties */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: `1.5px solid ${C.pill}`, padding: "14px 16px",
        boxSizing: "border-box",
      }}>
        <div style={{
          fontFamily: syne, fontWeight: 700, fontSize: 13,
          color: C.ink, marginBottom: 5,
        }}>
          📅 Sorties & événements
        </div>
        <div style={{
          fontFamily: dm, fontSize: 12, color: C.ink2, lineHeight: 1.55,
        }}>
          Vide-greniers, marchés, fêtes, concerts… Retrouve tout ce qui se passe dans le quartier.
        </div>
      </div>
    </div>
  );
}

// ─── Écran 3 — Voisins & Commerçants + CTA ──────────────────────────────────
function Screen3({ onDone }) {
  return (
    <div style={{
      width: "33.333%", flexShrink: 0, height: "100%",
      background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 20px 40px", boxSizing: "border-box",
    }}>
      <div style={{
        fontFamily: syne, fontWeight: 800, fontSize: 22,
        color: C.ink, textAlign: "center", marginBottom: 6,
      }}>
        Voisins &amp; Commerçants
      </div>
      <div style={{
        fontFamily: dm, fontSize: 13, color: C.ink2,
        textAlign: "center", marginBottom: 20, lineHeight: 1.5,
      }}>
        Deux façons de participer à la vie locale
      </div>

      {/* Voisin */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: `1.5px solid ${C.pill}`, padding: "16px",
        marginBottom: 10, boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏘️</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>Voisin</span>
          <span style={{
            fontFamily: dm, fontSize: 10, fontWeight: 600,
            color: C.pro, background: "#EBF5F0",
            padding: "2px 9px", borderRadius: 20,
          }}>gratuit</span>
        </div>
        <div style={{ fontFamily: dm, fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>
          Partage tes trouvailles, accumule des XP Shop et échange-les en bons d'achat chez tes commerçants.
        </div>
      </div>

      {/* Commerçant */}
      <div style={{
        width: "100%", background: C.card, borderRadius: 20,
        border: "1.5px solid rgba(10,61,46,0.18)", padding: "16px",
        marginBottom: 24, boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏪</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>
          Commerçant
        </div>
        <div style={{ fontFamily: dm, fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>
          Crée des défis photo, valide les posts de tes clients et gagne en visibilité dans le quartier.
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
            ? "linear-gradient(to top, rgba(26,23,20,0.85) 0%, transparent 100%)"
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

          {/* Bouton Suivant — texte différent sur écran 1 pour inciter */}
          <button
            onClick={next}
            style={{
              pointerEvents: "auto",
              background: C.accent, color: "#fff",
              border: "none", borderRadius: 14,
              padding: step === 0 ? "11px 18px" : "11px 22px",
              fontFamily: syne, fontWeight: 700,
              fontSize: step === 0 ? 13 : 14,
              cursor: "pointer",
            }}
          >
            {step === 0 ? "Je veux mes bons d'achat 🎁" : "Suivant →"}
          </button>
        </div>
      )}

      {/* Dots seuls sur l'écran 3 */}
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
