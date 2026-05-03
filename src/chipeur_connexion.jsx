import { useState } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE",
  card: "#FFFFFF",
  ink: "#1A1714",
  ink2: "#6B6560",
  accent: "#FF5733",
  accent2: "#F7A72D",
  border: "rgba(26,23,20,0.08)",
  borderFocus: "rgba(255,87,51,0.4)",
};

function Logo() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="16" fill="#FF5733"/>
      <text x="26" y="34" textAnchor="middle" fontFamily="Syne" fontWeight="800" fontSize="22" fill="white">C</text>
    </svg>
  );
}

export default function Connexion({ setPage, onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: `1.5px solid ${focusedField === field ? C.borderFocus : C.border}`,
    background: C.card,
    fontFamily: "DM Sans",
    fontSize: 15,
    color: C.ink,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    onAuth();
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    if (!pseudo.trim()) { setError("Choisis un pseudo."); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { pseudo } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess("Vérifie ta boîte mail pour confirmer ton compte !");
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess("Lien de réinitialisation envoyé sur " + email);
  }

  async function handleGoogle() {
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      {/* Carte centrale */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: C.card,
        borderRadius: 28,
        padding: "36px 28px 32px",
        boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
      }}>
        {/* Logo + titre */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <Logo />
          <div style={{
            marginTop: 14,
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: 26,
            color: C.ink,
            letterSpacing: "-0.5px",
          }}>chipeur</div>
          <div style={{
            marginTop: 4,
            fontSize: 13,
            color: C.ink2,
            textAlign: "center",
          }}>
            {mode === "login" && "Bon retour dans ton quartier 👋"}
            {mode === "signup" && "Rejoins ta communauté de voisins"}
            {mode === "reset" && "On te renvoie un mot de passe"}
          </div>
        </div>

        {success ? (
          <div style={{
            background: "#EDFFF4",
            border: "1.5px solid #34C759",
            borderRadius: 14,
            padding: "14px 16px",
            color: "#1A6B3A",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 1.5,
          }}>
            ✅ {success}
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => { setSuccess(""); setMode("login"); }}
                style={{ color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
                Retour à la connexion
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleReset}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {mode === "signup" && (
              <input
                type="text"
                placeholder="Ton pseudo 🏘️"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                onFocus={() => setFocusedField("pseudo")}
                onBlur={() => setFocusedField(null)}
                style={inputStyle("pseudo")}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={inputStyle("email")}
              required
            />

            {mode !== "reset" && (
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={inputStyle("password")}
                required
              />
            )}

            {error && (
              <div style={{
                background: "#FFF0EE",
                border: "1.5px solid #FF5733",
                borderRadius: 12,
                padding: "10px 14px",
                color: "#C0392B",
                fontSize: 13,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4,
              padding: "15px",
              borderRadius: 14,
              background: loading ? "#ccc" : C.accent,
              color: "#fff",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}>
              {loading ? "⏳ Chargement..." :
                mode === "login" ? "Se connecter" :
                mode === "signup" ? "Créer mon compte" :
                "Envoyer le lien"}
            </button>

            {/* Google */}
            {mode !== "reset" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ color: C.ink2, fontSize: 12 }}>ou</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <button type="button" onClick={handleGoogle} disabled={loading} style={{
                  padding: "13px",
                  borderRadius: 14,
                  background: "#fff",
                  border: `1.5px solid ${C.border}`,
                  color: C.ink,
                  fontFamily: "DM Sans",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-7.8 19.5-19.5 0-1.3-.1-2.7-.4-4z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.6 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4.5 24 4.5c-7.8 0-14.5 4.4-17.7 10.2z"/>
                    <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-1.9 13.5-5L31.1 33c-2 1.4-4.5 2-7.1 2-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.4 39 16.2 43.5 24 43.5z"/>
                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.4 5.5C41.3 36 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
                  </svg>
                  Continuer avec Google
                </button>
              </>
            )}
          </form>
        )}

        {/* Liens bas */}
        {!success && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button type="button" onClick={() => { setError(""); setMode("reset"); }}
                  style={{ color: C.ink2, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                  Mot de passe oublié ?
                </button>
                <button type="button" onClick={() => setPage("inscription")}
                  style={{ color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
                  Pas encore de compte ? Rejoindre
                </button>
              </>
            )}
            {mode === "signup" && (
              <button type="button" onClick={() => { setError(""); setMode("login"); }}
                style={{ color: C.ink2, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                Déjà un compte ? Se connecter
              </button>
            )}
            {mode === "reset" && (
              <button type="button" onClick={() => { setError(""); setMode("login"); }}
                style={{ color: C.ink2, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                ← Retour à la connexion
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tagline bas */}
      <div style={{
        marginTop: 24,
        fontFamily: "Syne Mono, monospace",
        fontSize: 11,
        color: C.ink2,
        letterSpacing: "0.05em",
      }}>
        🏘️ Ton quartier, tes bons plans
      </div>
    </div>
  );
}
