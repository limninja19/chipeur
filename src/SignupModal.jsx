import { useState } from "react";
import { supabase } from "./supabase";
import { addXP } from "./chipeur_xp";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", border: "rgba(26,23,20,0.08)", pill: "#EDEBE8",
};
const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

// Années disponibles dans le sélecteur
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

function getAge(birthYear) {
  return currentYear - birthYear;
}

export default function SignupModal({ onClose, onSuccess, onMerchant, triggerLabel }) {
  const [step, setStep]           = useState("type");     // type | age | credentials
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail]         = useState("");
  const [mdp, setMdp]             = useState("");
  const [pseudo, setPseudo]       = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptParent, setAcceptParent] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const age        = birthYear ? getAge(parseInt(birthYear)) : null;
  const isMinor    = age !== null && age < 18;
  const isBlocked  = age !== null && age < 15;
  const need15to17 = age !== null && age >= 15 && age < 18;

  // Validation mot de passe
  const pwdHas8   = mdp.length >= 8;
  const pwdHasMaj = /[A-Z]/.test(mdp);
  const pwdHasNum = /[0-9]/.test(mdp);
  const pwdOk     = pwdHas8 && pwdHasMaj && pwdHasNum;

  const handleAgeNext = () => {
    if (!birthYear) { setError("Choisis ton année de naissance."); return; }
    if (isBlocked) return; // bloqué, pas de suite
    setError("");
    setStep("credentials");
  };

  const handleCredentialsNext = (onValid) => {
    if (!email.trim() || !pwdOk || !pseudo.trim()) {
      setError("Remplis tous les champs correctement.");
      return;
    }
    if (!acceptCGU) { setError("Accepte les CGU pour continuer."); return; }
    if (need15to17 && !acceptParent) {
      setError("L'autorisation parentale est obligatoire.");
      return;
    }
    setError("");
    onValid?.();
  };

  const handleSignup = async (accountType) => {
    setLoading(true);
    setError("");

    // Vérifier pseudo disponible
    const { data: existingPseudo } = await supabase
      .from("profiles").select("id").eq("pseudo", pseudo.trim()).maybeSingle();
    if (existingPseudo) {
      setError("Ce pseudo est déjà pris, choisis-en un autre.");
      setLoading(false);
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password: mdp,
      options: {
        data: {
          pseudo: pseudo.trim(),
          role: accountType,
          birth_year: parseInt(birthYear),
        },
      },
    });

    if (signupError) { setError(signupError.message); setLoading(false); return; }

    if (data?.user) {
      const ageVal = getAge(parseInt(birthYear));
      const refId  = sessionStorage.getItem("chipeur_ref");

      await supabase.from("profiles").upsert({
        id:           data.user.id,
        pseudo:       pseudo.trim(),
        role:         accountType,
        birth_year:   parseInt(birthYear),
        age_category: ageVal < 18 ? "minor_restricted" : "adult",
        ...(refId && refId !== data.user.id ? { invited_by: refId } : {}),
      });

      await addXP(data.user.id, 50, "inscription");

      if (refId && refId !== data.user.id) {
        await addXP(refId, 20, "invitation_acceptee");
        sessionStorage.removeItem("chipeur_ref");
      }
    }

    setLoading(false);
    onSuccess?.();
  };

  return (
    // Overlay
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,23,20,0.6)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      {/* Modale */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: C.card, borderRadius: "24px 24px 0 0",
          padding: "24px 24px 40px", fontFamily: dm,
        }}
      >
        {/* Barre de drag + bouton fermer */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 40, height: 4, background: C.pill, borderRadius: 2 }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{ background: C.pill, border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 16, cursor: "pointer", color: C.ink2, display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
        </div>

        {/* ── ÉTAPE 0 : CHOIX TYPE ── */}
        {step === "type" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 6 }}>
                {triggerLabel || "Rejoins la communauté de Saint-Dié !"}
              </div>
              <div style={{ fontSize: 12, color: C.ink2 }}>Tu es plutôt…</div>
            </div>

            {[
              { type: "voisin",      icon: "🏘️", label: "Voisin·e",               desc: "Je découvre et partage les bons plans du quartier" },
              { type: "magasin",     icon: "🏪", label: "J'ai un Magasin",          desc: "Je présente mon enseigne et touche mes clients du quartier" },
              { type: "association", icon: "🏛️", label: "Association / Lieu local", desc: "Mairie, association sportive ou culturelle, collectif citoyen…" },
            ].map(t => (
              <div
                key={t.type}
                onClick={() => {
                  if (t.type === "voisin") {
                    setStep("age");
                  } else {
                    // Commerçant / Association → ferme la modale et va sur la page inscription complète
                    onClose();
                    onMerchant?.(t.type);
                  }
                }}
                style={{
                  border: `2px solid ${C.border}`, borderRadius: 18, padding: "16px 18px",
                  marginBottom: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{ fontSize: 32 }}>{t.icon}</div>
                <div>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>{t.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 18, color: C.ink2 }}>›</div>
              </div>
            ))}

            <div style={{ textAlign: "center", marginTop: 4 }}>
              <span
                onClick={() => { onClose(); }}
                style={{ fontSize: 12, color: C.ink2, cursor: "pointer", textDecoration: "underline" }}
              >
                J'ai déjà un compte → Se connecter
              </span>
            </div>
          </>
        )}

        {/* ── ÉTAPE 1 : ÂGE (voisin seulement) ── */}
        {step === "age" && (
          <>
            <button onClick={() => setStep("type")} style={{ background: "none", border: "none", fontSize: 13, color: C.ink2, cursor: "pointer", marginBottom: 12, padding: 0, fontFamily: dm }}>‹ Retour</button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 6 }}>
                Une dernière chose…
              </div>
              <div style={{ fontSize: 12, color: C.ink2 }}>Ton année de naissance</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                Ton année de naissance
              </label>
              <select
                value={birthYear}
                onChange={e => { setBirthYear(e.target.value); setError(""); }}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 14,
                  border: `1.5px solid ${C.border}`, fontSize: 15,
                  fontFamily: dm, background: C.bg, color: C.ink, outline: "none",
                }}
              >
                <option value="">-- Sélectionne --</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Bloqué < 15 ans */}
            {isBlocked && (
              <div style={{ background: "#FFF5F2", border: "1.5px solid #FFCCC4", borderRadius: 14, padding: "14px 16px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>👋</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                  Chipeur est accessible à partir de 15 ans.
                </div>
                <div style={{ fontSize: 12, color: C.ink2 }}>Reviens nous voir bientôt !</div>
              </div>
            )}

            {error && <div style={{ fontSize: 12, color: C.accent, marginBottom: 8 }}>⚠️ {error}</div>}

            {!isBlocked && (
              <button
                onClick={handleAgeNext}
                disabled={!birthYear}
                style={{
                  width: "100%", padding: 14, borderRadius: 16,
                  background: birthYear ? C.accent : C.pill,
                  color: birthYear ? "#fff" : C.ink2,
                  border: "none", fontSize: 15, fontWeight: 700,
                  fontFamily: dm, cursor: birthYear ? "pointer" : "not-allowed",
                }}
              >Continuer →</button>
            )}
          </>
        )}

        {/* ── ÉTAPE 2 : EMAIL + MDP ── */}
        {step === "credentials" && (
          <>
            <button onClick={() => setStep("age")} style={{ background: "none", border: "none", fontSize: 13, color: C.ink2, cursor: "pointer", marginBottom: 12, padding: 0, fontFamily: dm }}>‹ Retour</button>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 4 }}>
              Crée ton compte
            </div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 20 }}>
              {need15to17 ? "Compte 15-17 ans 🧑" : ""}
            </div>

            {[
              { label: "PSEUDO", val: pseudo, set: setPseudo, placeholder: "Ton pseudo dans le quartier", type: "text" },
              { label: "EMAIL",  val: email,  set: setEmail,  placeholder: "ton@email.fr", type: "email" },
              { label: "MOT DE PASSE", val: mdp, set: setMdp, placeholder: "8 caractères minimum", type: "password" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: dm, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {/* Indicateurs mot de passe */}
            {mdp.length > 0 && (
              <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { ok: pwdHas8,   label: "8 caractères minimum" },
                  { ok: pwdHasMaj, label: "1 majuscule" },
                  { ok: pwdHasNum, label: "1 chiffre" },
                ].map(({ ok, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: ok ? "#16a34a" : C.accent }}>
                    <span>{ok ? "✅" : "❌"}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CGU */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={acceptCGU} onChange={e => setAcceptCGU(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>J'accepte les <span style={{ color: C.accent, fontWeight: 600 }}>CGU</span> et la <span style={{ color: C.accent, fontWeight: 600 }}>politique de confidentialité</span></span>
            </label>

            {/* Autorisation parentale 15-17 */}
            {need15to17 && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={acceptParent} onChange={e => setAcceptParent(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>Je confirme avoir l'autorisation de mes parents</span>
              </label>
            )}

            {error && <div style={{ fontSize: 12, color: C.accent, marginBottom: 8 }}>⚠️ {error}</div>}

            <button
              onClick={() => handleCredentialsNext(() => handleSignup("voisin"))}
              style={{ width: "100%", padding: 14, borderRadius: 16, background: C.accent, color: "#fff", border: "none", fontSize: 15, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginTop: 4 }}
            >{loading ? "⏳ Création…" : "Créer mon compte →"}</button>
            {error && <div style={{ fontSize: 12, color: C.accent, marginTop: 8 }}>⚠️ {error}</div>}
            {loading && <div style={{ textAlign: "center", fontSize: 13, color: C.ink2, marginTop: 4 }}>⏳ Création du compte…</div>}
          </>
        )}

        {/* Création du compte voisin au clic sur "Continuer" dans credentials */}
      </div>
    </div>
  );
}
