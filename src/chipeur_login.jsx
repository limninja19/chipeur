import { useState } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", borderFocus: "rgba(232,73,10,0.4)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const PLANS = [
  {
    id: "decouverte", name: "Découverte", price: "9,90€", popular: false,
    feats: [
      { label: "Vitrine publique", ok: true },
      { label: "Pro Layer", ok: true },
      { label: "Vue active", ok: true },
      { label: "Bons plans ciblés", ok: false },
      { label: "Contenu sponsorisé", ok: false },
    ],
  },
  {
    id: "mixte", name: "Mixte", price: "29,90€", popular: true,
    feats: [
      { label: "Vitrine publique", ok: true },
      { label: "Pro Layer", ok: true },
      { label: "Bons plans ciblés", ok: true, star: true },
      { label: "Sponsorisé", ok: true, star: true },
      { label: "ROI complet", ok: true },
    ],
  },
  {
    id: "premium", name: "Premium", price: "59,90€", popular: false,
    feats: [
      { label: "Tout Mixte", ok: true },
      { label: "ROI avancé", ok: true, star: true },
      { label: "Support prioritaire", ok: true, star: true },
      { label: "Vouchers mensuels", ok: true, star: true },
    ],
  },
];

function StepDots({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: 4, borderRadius: 2,
          width: i === step ? 32 : 24,
          background: i < step ? C.ink2 : i === step ? C.accent : C.pill,
          transition: "all 0.2s",
        }} />
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>}
      {children}
    </div>
  );
}

const inputStyle = (focused) => ({
  width: "100%", background: C.card, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
  borderRadius: 14, padding: "13px 16px", fontSize: 15, fontFamily: dm,
  color: C.ink, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
});

function Input({ type = "text", placeholder, value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
      {...props}
    />
  );
}

function PrimaryBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", background: disabled ? "#ccc" : C.accent, color: "#fff",
        border: "none", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 600,
        fontFamily: dm, cursor: disabled ? "not-allowed" : "pointer", marginTop: 6,
        transition: "opacity 0.2s", ...style,
      }}
    >
      {children}
    </button>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 12 }}>
      {msg}
    </div>
  );
}

/* ───── SCREEN 1 : INSCRIPTION / CONNEXION ───── */
function Screen1({ onSuccess, isLogin, setIsLogin }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email || !password) { setError("Remplis l'email et le mot de passe."); return; }
    if (!isLogin && !prenom) { setError("Indique ton prénom."); return; }
    if (!isLogin && password.length < 8) { setError("Le mot de passe doit faire au moins 8 caractères."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onSuccess({ type: "login" });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { prenom } },
        });
        if (err) throw err;
        onSuccess({ type: "signup", prenom });
      }
    } catch (err) {
      const msgs = {
        "Invalid login credentials": "Email ou mot de passe incorrect.",
        "Email not confirmed": "Vérifie ta boîte mail pour confirmer ton compte.",
        "User already registered": "Un compte existe déjà avec cet email.",
      };
      setError(msgs[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) { setError(err.message); setLoading(false); }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px 40px", display: "flex", flexDirection: "column" }}>
      {/* Logo complet : icône + wordmark */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 }}>
        <svg width="44" height="44" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGradLogin" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5733"/>
              <stop offset="100%" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
          <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradLogin)"/>
          <circle cx="36" cy="26" r="10" fill="white"/>
          <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: -1, color: "#1A1A2E" }}>
            chi<span style={{ color: C.accent }}>p</span>eur
          </div>
          <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 8, letterSpacing: 3, color: C.accent, textTransform: "uppercase" }}>
            Découvre · Chope · Partage
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: C.ink2, textAlign: "center", marginBottom: 28, marginTop: 8 }}>
        {isLogin ? "Content de te revoir 👋" : "Rejoins le fil mode de ton quartier"}
      </div>

      <StepDots step={0} />
      <ErrorMsg msg={error} />

      {!isLogin && (
        <Field label="Prénom">
          <Input placeholder="Comment tu t'appelles ?" value={prenom} onChange={setPrenom} />
        </Field>
      )}
      <Field label="Email">
        <Input type="email" placeholder="ton@email.fr" value={email} onChange={setEmail} />
      </Field>
      <Field label="Mot de passe">
        <Input type="password" placeholder={isLogin ? "Ton mot de passe" : "8 caractères minimum"} value={password} onChange={setPassword} />
      </Field>

      <PrimaryBtn onClick={handleSubmit} disabled={loading}>
        {loading ? "Chargement…" : isLogin ? "Se connecter →" : "Créer mon compte →"}
      </PrimaryBtn>

      <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.ink2 }}>
        {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
        <span
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          style={{ color: C.accent, fontWeight: 600, cursor: "pointer" }}
        >
          {isLogin ? "S'inscrire" : "Se connecter"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 12, color: C.ink2 }}>ou</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: "100%", background: C.pill, color: C.ink, border: "none",
          borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500,
          fontFamily: dm, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </button>
    </div>
  );
}

/* ───── SCREEN 2 : CHOIX TYPE DE COMPTE ───── */
function Screen2({ onChoose }) {
  const [selected, setSelected] = useState(null);

  function choose(type) {
    setSelected(type);
    setTimeout(() => onChoose(type), 180);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 40px", display: "flex", flexDirection: "column" }}>
      <StepDots step={1} />
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 6 }}>Tu es plutôt…</div>
      <div style={{ fontSize: 13, color: C.ink2, marginBottom: 24, lineHeight: 1.5 }}>
        Ce choix détermine comment tu utilises Chipeur. Tu ne pourras pas le changer ensuite.
      </div>

      {[
        { type: "voisin", icon: "🏘️", iconBg: "#E8F4FD", title: "Je suis Voisin·e", desc: "Je partage mes découvertes mode du quartier et je suis les bons plans locaux." },
        { type: "magasin", icon: "🏪", iconBg: "#FEF3E0", title: "J'ai un Magasin", desc: "Je présente mon enseigne, mes collections et je touche mes clients du quartier." },
      ].map(({ type, icon, iconBg, title, desc }) => (
        <div
          key={type}
          onClick={() => choose(type)}
          style={{
            background: C.card, borderRadius: 20, border: `2px solid ${selected === type ? C.accent : C.border}`,
            padding: 20, marginBottom: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 16,
            transition: "border-color 0.2s, transform 0.15s",
            transform: selected === type ? "scale(0.98)" : "scale(1)",
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.4 }}>{desc}</div>
          </div>
          <div style={{ fontSize: 18, color: C.ink2 }}>›</div>
        </div>
      ))}

      <div style={{ fontSize: 11, color: C.ink2, textAlign: "center", marginTop: 8, opacity: 0.7 }}>
        ℹ Ton compte est créé — pas de retour possible.
      </div>
    </div>
  );
}

/* ───── SCREEN 3 : INSCRIPTION MAGASIN ───── */
function Screen3({ onBack, onSuccess }) {
  const [enseigne, setEnseigne] = useState("");
  const [categorie, setCategorie] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("mixte");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!enseigne || !categorie || !adresse) { setError("Remplis le nom, la catégorie et l'adresse."); return; }
    setError("");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from("magasins").insert({
        user_id: user.id,
        enseigne,
        categorie,
        adresse,
        description,
        plan,
      });
      if (err) throw err;
      onSuccess("magasin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectStyle = {
    width: "100%", background: C.card, border: `1.5px solid ${C.border}`,
    borderRadius: 14, padding: "13px 16px", fontSize: 14, fontFamily: dm,
    color: C.ink, outline: "none", appearance: "none", boxSizing: "border-box",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 13, color: C.ink2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: dm }}>‹ Retour</button>
      </div>
      <div style={{ padding: "16px 20px 40px", display: "flex", flexDirection: "column" }}>
        <StepDots step={2} />
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 4 }}>Ton enseigne</div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Ces infos apparaîtront sur ta page Vitrine publique.</div>

        <ErrorMsg msg={error} />

        <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>Informations</div>

        <Field>
          <Input placeholder="Nom de l'enseigne" value={enseigne} onChange={setEnseigne} />
        </Field>
        <Field>
          <select value={categorie} onChange={e => setCategorie(e.target.value)} style={selectStyle}>
            <option value="" disabled>Catégorie…</option>
            {["Mode", "Beauté", "Restauration", "Sport", "Autre"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field>
          <Input placeholder="Adresse" value={adresse} onChange={setAdresse} />
        </Field>
        <Field>
          <textarea
            placeholder="Présentation courte (max 200 car.)"
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            rows={2}
            style={{ ...inputStyle(false), fontSize: 14, resize: "none" }}
          />
        </Field>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.8, textTransform: "uppercase", margin: "8px 0 10px" }}>Choix du plan</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PLANS.map(p => (
            <div
              key={p.id}
              onClick={() => setPlan(p.id)}
              style={{
                background: C.card, borderRadius: 16, border: `2px solid ${plan === p.id ? C.accent : C.border}`,
                padding: 14, cursor: "pointer", position: "relative", transition: "border-color 0.2s",
              }}
            >
              {p.popular && (
                <div style={{ position: "absolute", top: -1, right: 12, background: C.accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: "0 0 8px 8px", letterSpacing: 0.3 }}>Recommandé</div>
              )}
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>{p.name}</div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.accent }}>
                  {p.price} <span style={{ fontSize: 11, fontWeight: 400, color: C.ink2, fontFamily: dm }}>/mois</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {p.feats.map((f, i) => (
                  <span key={i} style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 6,
                    background: !f.ok ? C.pill : f.star ? C.proBg : "#E8F4FD",
                    color: !f.ok ? C.ink2 : f.star ? C.pro : "#1565C0",
                  }}>
                    {f.ok ? "✓ " : "— "}{f.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement…" : "Choisir ce plan et continuer →"}
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ───── SCREEN 4 : SUCCESS ───── */
function Screen4({ type, onGo }) {
  const isMagasin = type === "magasin";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff" }}>✓</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 22, color: C.ink }}>Bienvenue sur Chipeur !</div>
      <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.6, maxWidth: 280 }}>
        {isMagasin
          ? "Ta vitrine est prête. Tu peux maintenant présenter ton enseigne aux voisins du quartier."
          : "Ton compte Voisin·e est prêt. Rejoins le fil du quartier et commence à partager !"}
      </div>
      <button
        onClick={onGo}
        style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 16, padding: "14px 32px", fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer", marginTop: 8 }}
      >
        Voir le Fil →
      </button>
    </div>
  );
}

/* ───── MAIN EXPORT ───── */
export default function ChipeurLogin({ setPage }) {
  const [screen, setScreen] = useState("auth"); // auth | choix | magasin | success
  const [isLogin, setIsLogin] = useState(false);
  const [accountType, setAccountType] = useState(null);

  async function handleAuthSuccess({ type, prenom }) {
    if (type === "login") {
      // Connexion directe → on vérifie le type de compte en base
      setPage("fil");
      return;
    }
    // Inscription → on sauvegarde le prénom dans le profil
    const { data: { user } } = await supabase.auth.getUser();
    if (user && prenom) {
      await supabase.from("profiles").upsert({ id: user.id, prenom, role: null });
    }
    setScreen("choix");
  }

  async function handleChoix(type) {
    setAccountType(type);
    if (type === "voisin") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ role: "voisin" }).eq("id", user.id);
      setScreen("success");
    } else {
      setScreen("magasin");
    }
  }

  async function handleMagasinSuccess() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ role: "magasin" }).eq("id", user.id);
    setScreen("success");
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      {screen === "auth" && (
        <Screen1
          onSuccess={handleAuthSuccess}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
        />
      )}
      {screen === "choix" && (
        <Screen2 onChoose={handleChoix} />
      )}
      {screen === "magasin" && (
        <Screen3
          onBack={() => setScreen("choix")}
          onSuccess={handleMagasinSuccess}
        />
      )}
      {screen === "success" && (
        <Screen4
          type={accountType}
          onGo={() => setPage("fil")}
        />
      )}
    </div>
  );
}
