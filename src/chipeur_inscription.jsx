import { useState } from "react";
import { supabase } from "./supabase";

const COLORS = {
  bg: "#F5F2EE",
  card: "#FFFFFF",
  ink: "#1A1714",
  ink2: "#6B6560",
  accent: "#FF5733",
  accent2: "#F7A72D",
  pro: "#0A3D2E",
  proBg: "#EBF5F0",
  pill: "#EDEBE8",
  border: "rgba(26,23,20,0.08)",
  borderFocus: "rgba(232,73,10,0.4)",
};

// ─── STATUS BAR ───
function StatusBar({ light }) {
  return (
    <div style={{
      padding: "12px 28px 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 11,
      fontWeight: 600,
      color: light ? "#fff" : COLORS.ink,
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 10 }}>
        <span>▲▲▲</span>
        <div style={{
          width: 20, height: 10,
          border: `1.5px solid ${light ? "#fff" : COLORS.ink}`,
          borderRadius: 3,
          position: "relative",
          display: "inline-block",
        }}>
          <div style={{
            width: "70%", height: "100%",
            background: light ? "#fff" : COLORS.ink,
            borderRadius: 1.5,
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── STEP DOTS ───
function StepDots({ current }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: current === 0 ? 28 : 20 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: i === current ? 32 : 24,
          height: 4,
          borderRadius: 2,
          background: i === current ? COLORS.accent : i < current ? COLORS.ink2 : COLORS.pill,
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

// ─── INPUT FIELD ───
function Field({ label, type = "text", placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: COLORS.ink2,
        marginBottom: 5, letterSpacing: 0.2,
        fontFamily: "'DM Sans', sans-serif",
      }}>{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: COLORS.card,
          border: `1.5px solid ${focused ? COLORS.borderFocus : COLORS.border}`,
          borderRadius: 14,
          padding: "13px 16px",
          fontSize: 15,
          fontFamily: "'DM Sans', sans-serif",
          color: COLORS.ink,
          outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── SCREEN 1 : INSCRIPTION ───
function ScreenInscription({ onNext }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");

  return (
    <div style={{
      flex: 1, overflowY: "auto", padding: "28px 24px 32px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26,
        color: COLORS.ink, textAlign: "center", marginBottom: 6,
      }}>
        chi<span style={{ color: COLORS.accent }}>p</span>eur
      </div>
      <div style={{
        fontSize: 13, color: COLORS.ink2, textAlign: "center", marginBottom: 32,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Rejoins le fil mode de ton quartier
      </div>
      <StepDots current={0} />
      <Field label="PRÉNOM" placeholder="Comment tu t'appelles ?" value={prenom} onChange={setPrenom} />
      <Field label="EMAIL" type="email" placeholder="ton@email.fr" value={email} onChange={setEmail} />
      <Field label="MOT DE PASSE" type="password" placeholder="8 caractères minimum" value={mdp} onChange={setMdp} />
      <button onClick={() => onNext({ prenom, email, mdp })} style={{
        width: "100%", background: COLORS.accent, color: "#fff", border: "none",
        borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 8,
      }}>
        Créer mon compte →
      </button>
      <div style={{
        textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.ink2,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Déjà un compte ?{" "}
        <span style={{ color: COLORS.accent, fontWeight: 600, cursor: "pointer" }}>
          Se connecter
        </span>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, margin: "20px 0",
      }}>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        <span style={{ fontSize: 12, color: COLORS.ink2, fontFamily: "'DM Sans', sans-serif" }}>ou</span>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
      </div>
      <button style={{
        width: "100%", background: COLORS.pill, color: COLORS.ink, border: "none",
        borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
      }}>
        Continuer avec Google
      </button>
    </div>
  );
}

// ─── SCREEN 2 : CHOIX COMPTE ───
function ScreenChoixCompte({ onChoose }) {
  const [hovered, setHovered] = useState(null);

  const Card = ({ type, icon, iconBg, title, desc }) => (
    <div
      onClick={() => onChoose(type)}
      onMouseEnter={() => setHovered(type)}
      onMouseLeave={() => setHovered(null)}
      style={{
        background: COLORS.card,
        borderRadius: 20,
        border: `2px solid ${hovered === type ? "rgba(232,73,10,0.3)" : COLORS.border}`,
        padding: 20,
        marginBottom: 12,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "border-color 0.2s, transform 0.15s",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, flexShrink: 0, background: iconBg,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16,
          color: COLORS.ink, marginBottom: 3,
        }}>{title}</div>
        <div style={{
          fontSize: 12, color: COLORS.ink2, lineHeight: 1.4,
          fontFamily: "'DM Sans', sans-serif",
        }}>{desc}</div>
      </div>
      <div style={{ fontSize: 18, color: COLORS.ink2 }}>›</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 32px", display: "flex", flexDirection: "column" }}>
      <StepDots current={1} />
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
        color: COLORS.ink, marginBottom: 6,
      }}>Tu es plutôt…</div>
      <div style={{
        fontSize: 13, color: COLORS.ink2, marginBottom: 24, lineHeight: 1.5,
        fontFamily: "'DM Sans', sans-serif",
      }}>Ce choix détermine comment tu utilises Chipeur. Tu ne pourras pas le changer ensuite.</div>
      <Card
        type="voisin"
        icon="🏘️"
        iconBg="#E8F4FD"
        title="Je suis Voisin·e"
        desc="Je partage mes découvertes mode du quartier et je suis les bons plans locaux."
      />
      <Card
        type="magasin"
        icon="🏪"
        iconBg="#FEF3E0"
        title="J'ai un Magasin"
        desc="Je présente mon enseigne, mes collections et je touche mes clients du quartier."
      />
      <div style={{
        fontSize: 11, color: COLORS.ink2, textAlign: "center",
        marginTop: 8, opacity: 0.7, fontFamily: "'DM Sans', sans-serif",
      }}>ℹ Ton compte est créé — pas de retour possible.</div>
    </div>
  );
}

// ─── SCREEN 3 : INSCRIPTION MAGASIN ───
function ScreenMagasin({ onBack, onValidate }) {
  const [selectedPlan, setSelectedPlan] = useState("mixte");
  const [focused, setFocused] = useState(null);

  const inputStyle = (name) => ({
    width: "100%",
    background: COLORS.card,
    border: `1.5px solid ${focused === name ? COLORS.borderFocus : COLORS.border}`,
    borderRadius: 14,
    padding: "13px 16px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: COLORS.ink,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    marginBottom: 10,
  });

  const plans = [
    {
      id: "deco", name: "Découverte", price: "9,90€",
      features: [
        { text: "✓ Vitrine publique", type: "ok" },
        { text: "✓ Pro Layer", type: "ok" },
        { text: "✓ Vue active", type: "ok" },
        { text: "— Bons plans ciblés", type: "off" },
        { text: "— Contenu sponsorisé", type: "off" },
      ],
    },
    {
      id: "mixte", name: "Mixte", price: "29,90€", popular: true,
      features: [
        { text: "✓ Vitrine publique", type: "ok" },
        { text: "✓ Pro Layer", type: "ok" },
        { text: "✓ Bons plans ciblés", type: "star" },
        { text: "✓ Sponsorisé", type: "star" },
        { text: "✓ ROI complet", type: "ok" },
      ],
    },
    {
      id: "premium", name: "Premium", price: "59,90€",
      features: [
        { text: "✓ Tout Mixte", type: "ok" },
        { text: "✓ ROI avancé", type: "star" },
        { text: "✓ Support prioritaire", type: "star" },
        { text: "✓ Vouchers mensuels", type: "star" },
      ],
    },
  ];

  const featBg = { ok: "#E8F4FD", star: COLORS.proBg, off: COLORS.pill };
  const featColor = { ok: "#1565C0", star: COLORS.pro, off: COLORS.ink2 };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", fontSize: 13, color: COLORS.ink2,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>‹ Retour</button>
      </div>
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 20px 32px",
        display: "flex", flexDirection: "column",
      }}>
        <StepDots current={2} />
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18,
          color: COLORS.ink, marginBottom: 4,
        }}>Ton enseigne</div>
        <div style={{
          fontSize: 12, color: COLORS.ink2, marginBottom: 20,
          fontFamily: "'DM Sans', sans-serif",
        }}>Ces infos apparaîtront sur ta page Vitrine publique.</div>

        <div style={{
          fontSize: 11, fontWeight: 700, color: COLORS.ink2,
          letterSpacing: 0.8, textTransform: "uppercase",
          marginBottom: 10, marginTop: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>Informations</div>

        <input
          placeholder="Nom de l'enseigne"
          onFocus={() => setFocused("nom")}
          onBlur={() => setFocused(null)}
          style={inputStyle("nom")}
        />
        <div style={{ position: "relative", marginBottom: 10 }}>
          <select style={{
            ...inputStyle("cat"),
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            marginBottom: 0,
          }}>
            <option value="" disabled selected>Catégorie…</option>
            <option>Mode</option>
            <option>Beauté</option>
            <option>Restauration</option>
            <option>Sport</option>
            <option>Autre</option>
          </select>
        </div>
        <input
          placeholder="Adresse"
          onFocus={() => setFocused("adr")}
          onBlur={() => setFocused(null)}
          style={inputStyle("adr")}
        />
        <textarea
          placeholder="Présentation courte (max 200 car.)"
          rows={2}
          onFocus={() => setFocused("desc")}
          onBlur={() => setFocused(null)}
          style={{ ...inputStyle("desc"), resize: "none", marginBottom: 20 }}
        />

        <div style={{
          fontSize: 11, fontWeight: 700, color: COLORS.ink2,
          letterSpacing: 0.8, textTransform: "uppercase",
          marginBottom: 10, marginTop: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>Choix du plan</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: COLORS.card,
                borderRadius: 16,
                border: `2px solid ${selectedPlan === plan.id ? COLORS.accent : COLORS.border}`,
                padding: "14px 14px",
                cursor: "pointer",
                transition: "border-color 0.2s",
                position: "relative",
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -1, right: 12,
                  background: COLORS.accent, color: "#fff",
                  fontSize: 9, fontWeight: 700, padding: "3px 8px",
                  borderRadius: "0 0 8px 8px", letterSpacing: 0.3,
                  fontFamily: "'DM Sans', sans-serif",
                }}>Recommandé</div>
              )}
              <div style={{
                display: "flex", alignItems: "baseline",
                justifyContent: "space-between", marginBottom: 8,
              }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.ink,
                }}>{plan.name}</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.accent,
                }}>
                  {plan.price}{" "}
                  <span style={{
                    fontSize: 11, fontWeight: 400, color: COLORS.ink2,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>/mois</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {plan.features.map((f, i) => (
                  <span key={i} style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 6,
                    background: featBg[f.type], color: featColor[f.type],
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{f.text}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onValidate} style={{
          width: "100%", background: COLORS.accent, color: "#fff", border: "none",
          borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 16,
        }}>Choisir ce plan et continuer →</button>
      </div>
    </div>
  );
}

// ─── SCREEN 4 : SUCCESS ───
function ScreenSuccess({ accountType, onRestart, onFinish }) {
  const msg = accountType === "voisin"
    ? "Ton compte Voisin·e est prêt. Rejoins le fil du quartier !"
    : "Ton compte est prêt. Rejoins le fil du quartier et commence à partager.";

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", textAlign: "center", gap: 16,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", background: COLORS.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "#fff",
      }}>✓</div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.ink,
      }}>Bienvenue sur Chipeur !</div>
      <div style={{
        fontSize: 14, color: COLORS.ink2, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}>{msg}</div>
      <button onClick={() => onFinish && onFinish()} style={{
        background: COLORS.ink, color: "#fff", border: "none",
        borderRadius: 16, padding: "14px 32px", fontSize: 14, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 8,
      }}>Voir le Fil →</button>
      <div
        onClick={onRestart}
        style={{
          marginTop: 12, fontSize: 11, color: COLORS.ink2, opacity: 0.6,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}
      >← retour début pour tester</div>
    </div>
  );
}

// ─── APP SHELL ───
export default function ChipeurInscription({ setPage, onAuth }) {
  const [screen, setScreen] = useState("inscription");
  const [accountType, setAccountType] = useState(null);
  const [creds, setCreds] = useState({ prenom: "", email: "", mdp: "" });
  const [signupError, setSignupError] = useState("");

  const handleChoose = async (type) => {
    setAccountType(type);
    if (type === "voisin") {
      const { error } = await supabase.auth.signUp({
        email: creds.email,
        password: creds.mdp,
        options: { data: { pseudo: creds.prenom } },
      });
      if (error) { setSignupError(error.message); return; }
      setScreen("success");
    } else {
      setScreen("magasin");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: COLORS.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
    }}>

        {signupError && (
          <div style={{ padding: "10px 16px", background: "#FFF0EE", color: "#C0392B", fontSize: 13, textAlign: "center" }}>⚠️ {signupError}</div>
        )}
        {screen === "inscription" && (
          <ScreenInscription onNext={(d) => { setCreds(d); setScreen("choix"); }} />
        )}

        {screen === "choix" && (
          <ScreenChoixCompte onChoose={handleChoose} />
        )}

        {screen === "magasin" && (
          <ScreenMagasin
            onBack={() => setScreen("choix")}
            onValidate={() => setScreen("success")}
          />
        )}

        {screen === "success" && (
          <ScreenSuccess
            accountType={accountType}
            onRestart={() => { setScreen("inscription"); setAccountType(null); }}
            onFinish={() => onAuth ? onAuth() : setPage("fil")}
          />
        )}
    </div>
  );
}
