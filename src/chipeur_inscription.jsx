import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { addXP } from "./chipeur_xp";

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

// ─── CHECKBOX LÉGAL ───
function CheckboxLegal({ checked, onChange, children }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        marginBottom: 12, cursor: "pointer",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? COLORS.accent : COLORS.border}`,
        background: checked ? COLORS.accent : COLORS.card,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ fontSize: 11, color: COLORS.ink2, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
        {children}
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

// ─── CHAMP MOT DE PASSE AVEC ŒIL ───
function PasswordField({ label, placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const borderColor = error ? "#E53935" : focused ? COLORS.borderFocus : COLORS.border;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: COLORS.ink2,
        marginBottom: 5, letterSpacing: 0.2,
        fontFamily: "'DM Sans', sans-serif",
      }}>{label}</div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: COLORS.card,
            border: `1.5px solid ${borderColor}`,
            borderRadius: 14,
            padding: "13px 48px 13px 16px",
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            color: COLORS.ink,
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 14, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: COLORS.ink2, padding: 4, lineHeight: 1,
          }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {error && (
        <div style={{ fontSize: 11, color: "#E53935", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN 0 : VÉRIFICATION D'ÂGE ───
function ScreenAge({ onNext }) {
  const [age, setAge] = useState(null); // null | "moins15" | "15-17" | "18plus"
  const [acceptParental, setAcceptParental] = useState(false);

  const AGE_OPTIONS = [
    { id: "moins15", label: "J'ai moins de 15 ans",     emoji: "🧒" },
    { id: "15-17",   label: "J'ai entre 15 et 17 ans",  emoji: "🧑" },
    { id: "18plus",  label: "J'ai 18 ans ou plus",      emoji: "🙋" },
  ];

  const canProceed =
    age === "18plus" ||
    (age === "15-17" && acceptParental);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 24px 32px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.ink, textAlign: "center", marginBottom: 6 }}>
        chi<span style={{ color: COLORS.accent }}>p</span>eur
      </div>
      <div style={{ fontSize: 13, color: COLORS.ink2, textAlign: "center", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
        Rejoins le fil mode de ton quartier
      </div>

      <div style={{ background: COLORS.card, borderRadius: 20, border: `1px solid ${COLORS.border}`, padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.ink, marginBottom: 6 }}>Avant tout…</div>
        <div style={{ fontSize: 13, color: COLORS.ink2, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
          Pour respecter la loi et protéger les mineurs, nous avons besoin de connaître ta tranche d'âge.
        </div>
      </div>

      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: COLORS.ink2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
        Tu as…
      </div>

      {AGE_OPTIONS.map(opt => (
        <div
          key={opt.id}
          onClick={() => { setAge(opt.id); setAcceptParental(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: age === opt.id ? "#FFF8F6" : COLORS.card,
            border: `2px solid ${age === opt.id ? COLORS.accent : COLORS.border}`,
            borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 26 }}>{opt.emoji}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.ink, flex: 1 }}>{opt.label}</div>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${age === opt.id ? COLORS.accent : COLORS.border}`,
            background: age === opt.id ? COLORS.accent : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {age === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
          </div>
        </div>
      ))}

      {/* Moins de 15 ans — message de blocage */}
      {age === "moins15" && (
        <div style={{ background: "#FFF0EE", border: `1.5px solid rgba(232,73,10,0.3)`, borderRadius: 16, padding: 16, marginTop: 4 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.accent, marginBottom: 8 }}>
            🔒 Inscription non disponible
          </div>
          <div style={{ fontSize: 13, color: COLORS.ink2, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
            Chipeur est réservé aux personnes de 15 ans et plus. Si tu as moins de 15 ans, un de tes parents doit s'inscrire à ta place et autoriser ton utilisation.
          </div>
          <a href="mailto:jennytassotto@gmail.com?subject=Inscription mineur" style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            📧 Contacter Chipeur pour une demande parentale
          </a>
        </div>
      )}

      {/* 15-17 ans — consentement parental */}
      {age === "15-17" && (
        <div style={{ background: "#FFFBEA", border: `1.5px solid rgba(247,167,45,0.4)`, borderRadius: 16, padding: 14, marginTop: 4 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#B45309", marginBottom: 8 }}>
            ⚠️ Autorisation parentale requise
          </div>
          <div style={{ fontSize: 12, color: COLORS.ink2, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
            Entre 15 et 17 ans, tu peux utiliser Chipeur mais tu dois avoir l'autorisation de tes parents pour créer un compte et publier des photos.
          </div>
          <CheckboxLegal checked={acceptParental} onChange={setAcceptParental}>
            <span style={{ fontWeight: 700 }}>Mes parents m'autorisent</span> à utiliser Chipeur et à publier des photos sur la plateforme. J'ai leur accord pour créer ce compte.
          </CheckboxLegal>
        </div>
      )}

      <button
        onClick={() => canProceed && onNext(age)}
        disabled={!canProceed}
        style={{
          width: "100%", background: canProceed ? COLORS.accent : "#ccc", color: "#fff",
          border: "none", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: canProceed ? "pointer" : "not-allowed",
          marginTop: 16, transition: "background 0.2s",
        }}
      >
        Continuer →
      </button>
    </div>
  );
}

// ─── SCREEN 1 : INSCRIPTION ───
function ScreenInscription({ onNext, ageRange }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [mdpConfirm, setMdpConfirm] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptRGPD, setAcceptRGPD] = useState(false);
  const pwdHas8    = mdp.length >= 8;
  const pwdHasMaj  = /[A-Z]/.test(mdp);
  const pwdHasNum  = /[0-9]/.test(mdp);
  const pwdOk      = pwdHas8 && pwdHasMaj && pwdHasNum;
  const pwdMatch   = mdpConfirm.length > 0 && mdp === mdpConfirm;
  const pwdMismatch = mdpConfirm.length > 0 && mdp !== mdpConfirm;
  const canProceed = prenom.trim() && email.trim() && pwdOk && pwdMatch && acceptCGU && acceptRGPD;

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
      <PasswordField
        label="MOT DE PASSE"
        placeholder="8 caractères minimum"
        value={mdp}
        onChange={setMdp}
      />
      <div style={{ marginBottom: 14, marginTop: -6, display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { ok: pwdHas8,   label: "8 caractères minimum" },
          { ok: pwdHasMaj, label: "1 majuscule (ex : M)" },
          { ok: pwdHasNum, label: "1 chiffre (ex : 3)" },
        ].map(({ ok, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: mdp.length === 0 ? COLORS.ink2 : ok ? "#16a34a" : COLORS.accent }}>
            <span>{mdp.length === 0 ? "○" : ok ? "✅" : "❌"}</span>
            <span style={{ fontWeight: mdp.length > 0 && !ok ? 600 : 400 }}>{label}</span>
          </div>
        ))}
      </div>
      <PasswordField
        label="CONFIRMER LE MOT DE PASSE"
        placeholder="Répète ton mot de passe"
        value={mdpConfirm}
        onChange={setMdpConfirm}
        error={pwdMismatch ? "Les mots de passe ne correspondent pas." : null}
      />
      {pwdMatch && (
        <div style={{ fontSize: 11, color: "#16a34a", marginTop: -12, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
          ✅ Les mots de passe correspondent !
        </div>
      )}

      {ageRange === "15-17" && (
        <div style={{ background: "#FFFBEA", border: "1.5px solid rgba(247,167,45,0.4)", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 11, color: "#B45309", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          🧑 Compte mineur (15-17 ans) — L'autorisation parentale a bien été prise en compte.
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <CheckboxLegal checked={acceptCGU} onChange={setAcceptCGU}>
          J'ai lu et j'accepte les{" "}
          <a href="/cgu.html" target="_blank" onClick={e => e.stopPropagation()} style={{ color: COLORS.accent, fontWeight: 600 }}>
            Conditions Générales d'Utilisation
          </a>.
        </CheckboxLegal>
        <CheckboxLegal checked={acceptRGPD} onChange={setAcceptRGPD}>
          J'ai lu et j'accepte la{" "}
          <a href="/politique-confidentialite.html" target="_blank" onClick={e => e.stopPropagation()} style={{ color: COLORS.accent, fontWeight: 600 }}>
            Politique de confidentialité
          </a>{" "}
          et le traitement de mes données personnelles conformément au RGPD.
        </CheckboxLegal>
      </div>

      <button
        onClick={() => canProceed && onNext({ prenom, email, mdp })}
        disabled={!canProceed}
        style={{
          width: "100%", background: canProceed ? COLORS.accent : "#ccc", color: "#fff", border: "none",
          borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: canProceed ? "pointer" : "not-allowed", marginTop: 8,
          transition: "background 0.2s",
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

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2.5 : RECHERCHE GOOGLE BUSINESS
// Intercalé entre le choix "J'ai un magasin" et le formulaire commerçant.
// ─────────────────────────────────────────────────────────────────────────────

// URL de base pour les Edge Functions (sans slash final)
const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En-têtes communs pour appeler les Edge Functions
const fnHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// ── Composant miniature résultat ─────────────────────────────────────────────
function PlaceResult({ place, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(place)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        borderRadius: 16,
        border: `2px solid ${isSelected ? COLORS.accent : COLORS.border}`,
        background: isSelected ? "#FFF8F6" : COLORS.card,
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 10,
      }}
    >
      {/* Miniature photo */}
      <div style={{
        width: 52, height: 52, borderRadius: 12, flexShrink: 0,
        background: COLORS.pill, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>
        {place.photo_url
          ? <img src={place.photo_url} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🏪"}
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
          color: COLORS.ink, marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{place.name}</div>
        <div style={{
          fontSize: 11, color: COLORS.ink2, lineHeight: 1.4,
          fontFamily: "'DM Sans', sans-serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{place.address}</div>
      </div>

      {/* Radio */}
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${isSelected ? COLORS.accent : COLORS.border}`,
        background: isSelected ? COLORS.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
      </div>
    </div>
  );
}

// ── Écran principal recherche Google ────────────────────────────────────────
function ScreenGoogleSearch({ onBack, onSelect, onSkip }) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [error, setError]         = useState("");
  const debounceRef               = useRef(null);

  // ── Recherche debounced (300ms) ────────────────────────────────────────────
  const search = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${SUPABASE_FN_URL}/places-search?q=${encodeURIComponent(q.trim())}`,
        { headers: fnHeaders }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de recherche");
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) {
        setError("Aucun résultat. Essaie avec le nom exact ou l'adresse.");
      }
    } catch (e) {
      setError("Impossible de contacter Google. Vérifie ta connexion.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => search(query), 300);
    } else {
      setResults([]);
      setError("");
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // ── Confirmation du lieu sélectionné → fetch détails ────────────────────
  const handleConfirm = async () => {
    if (!selected) return;
    setLoadingDetails(true);
    setError("");
    try {
      const res = await fetch(
        `${SUPABASE_FN_URL}/places-details?place_id=${encodeURIComponent(selected.place_id)}`,
        { headers: fnHeaders }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      onSelect(data); // passe toutes les infos au formulaire
    } catch (e) {
      setError("Impossible de charger les détails. Réessaie ou saisis manuellement.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Bouton retour */}
      <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", fontSize: 13, color: COLORS.ink2,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>‹ Retour</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 32px", display: "flex", flexDirection: "column" }}>
        <StepDots current={2} />

        {/* Titre */}
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.ink, marginBottom: 4 }}>
          Trouve ton commerce
        </div>
        <div style={{ fontSize: 13, color: COLORS.ink2, marginBottom: 22, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
          On pré-remplit ta fiche depuis Google. Plus rapide que tout saisir à la main !
        </div>

        {/* Champ de recherche */}
        <div style={{ position: "relative", marginBottom: 6 }}>
          <input
            type="text"
            placeholder="Nom du commerce, adresse…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            autoFocus
            style={{
              width: "100%", background: COLORS.card,
              border: `1.5px solid ${COLORS.borderFocus}`,
              borderRadius: 14, padding: "13px 42px 13px 16px",
              fontSize: 15, fontFamily: "'DM Sans', sans-serif",
              color: COLORS.ink, outline: "none", boxSizing: "border-box",
            }}
          />
          {/* Icône loupe / spinner */}
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 18, pointerEvents: "none",
          }}>
            {loading ? "⏳" : "🔍"}
          </div>
        </div>

        {/* Message d'erreur / "aucun résultat" */}
        {error && (
          <div style={{
            fontSize: 12, color: COLORS.ink2, marginBottom: 12, marginTop: 2,
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
          }}>⚠️ {error}</div>
        )}

        {/* Résultats */}
        {results.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {results.map(place => (
              <PlaceResult
                key={place.place_id}
                place={place}
                isSelected={selected?.place_id === place.place_id}
                onSelect={p => { setSelected(p); setError(""); }}
              />
            ))}
          </div>
        )}

        {/* Bouton Confirmer */}
        {selected && (
          <button
            onClick={handleConfirm}
            disabled={loadingDetails}
            style={{
              width: "100%",
              background: loadingDetails ? "#ccc" : COLORS.accent,
              color: "#fff", border: "none", borderRadius: 16,
              padding: 15, fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loadingDetails ? "not-allowed" : "pointer",
              marginTop: 8, transition: "background 0.2s",
            }}
          >
            {loadingDetails ? "⏳ Chargement de la fiche…" : `Utiliser « ${selected.name} » →`}
          </button>
        )}

        {/* Lien de secours — saisie manuelle */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.ink2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Mon commerce n'est pas sur Google ?
          </div>
          <button
            onClick={onSkip}
            style={{
              background: "none", border: `1.5px solid ${COLORS.border}`,
              borderRadius: 12, padding: "10px 20px",
              fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              color: COLORS.ink2, cursor: "pointer",
            }}
          >
            ✏️ Saisie manuelle
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 3 : INSCRIPTION MAGASIN ───
function ScreenMagasin({ onBack, onValidate, loading, initialData }) {
  const isFromGoogle = Boolean(initialData?.place_id);

  const [selectedPlan, setSelectedPlan] = useState("test");
  const [focused, setFocused] = useState(null);
  const [nomMagasin, setNomMagasin] = useState(initialData?.name ?? "");
  const [categorie, setCategorie] = useState("");
  const [metiersSelected, setMetiersSelected] = useState([]);
  const [metierCustom, setMetierCustom] = useState("");
  const [adresse, setAdresse] = useState(initialData?.address ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [description, setDescription] = useState("");
  const [acceptCGUM, setAcceptCGUM] = useState(false);

  const METIER_SUGGESTIONS = {
    // ── Commerces ──
    "Mode & Prêt-à-porter":       ["Boutique de mode", "Prêt-à-porter femme", "Prêt-à-porter homme", "Accessoires", "Lingerie", "Chaussures", "Maroquinerie"],
    "Alimentation & Épicerie":    ["Épicerie fine", "Fromagerie", "Boucherie", "Primeur", "Cave à vins", "Bio & vrac", "Poissonnerie", "Traiteur"],
    "Décoration & Maison":        ["Décoration intérieure", "Mobilier", "Luminaires", "Plantes & fleurs", "Bricolage", "Antiquités", "Literie"],
    "Sport & Fitness":            ["Salle de sport", "Fitness & Musculation", "Yoga & pilates", "Arts martiaux", "Natation", "Danse", "Escalade", "Coach sportif"],
    "Services de proximité":      ["Imprimerie", "Pressing", "Cordonnerie", "Serrurier", "Électricien", "Plombier", "Garde d'enfants", "Informatique", "Auto"],
    "Culture & Librairie":        ["Librairie", "Papeterie", "Disquaire", "Galerie d'art", "Instruments de musique", "Cadeaux & souvenirs"],
    // ── Beauté ──
    "Beauté & Bien-être":         ["Institut de beauté", "Coiffeur", "Barbier", "Esthéticienne", "Nail art", "Spa & massages", "Tatoueur", "Onglerie"],
    // ── Resto & Ambiance ──
    "Restauration & Ambiance":    ["Restaurant", "Boulangerie", "Pâtisserie", "Bar", "Pub", "Brasserie", "Café", "Bistrot", "Pizzeria", "Kebab", "Salon de thé", "Food truck", "Cocktail bar", "Lounge"],
    // ── Artisans ──
    "Artisan & Créateur":         ["Photographe", "Graphiste", "Céramiste", "Bijoutier", "Menuisier", "Couturier", "Illustrateur", "Potier", "Sculpteur", "Relieur", "Luthier"],
    // ── Divertissement ──
    "Divertissement":             ["Cinéma", "Musée", "Piscine", "Théâtre", "Salle de concert", "Bowling", "Escape game", "Karting", "Médiathèque", "Bibliothèque", "Patinoire", "Accrobranche", "Laser game", "Aquaparc"],
    // ── Vie locale ──
    "Vie locale & Administratif": ["Mairie", "Office de tourisme", "CAF", "CPAM", "Pôle emploi", "Centre des impôts", "Gendarmerie", "École", "Collège", "Lycée", "Université", "Maison des services", "Tribunal"],
    // ── Autre ──
    "Autre":                      [],
  };

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
      id: "test", name: "Je teste", price: "Gratuit", trial: true,
      features: [
        { text: "✓ 3 mois offerts", type: "star" },
        { text: "✓ Plan Mixte complet", type: "star" },
        { text: "✓ Vitrine + Sponsorisé", type: "ok" },
        { text: "✓ Bons plans ciblés", type: "ok" },
        { text: "→ 29,90€/mois ensuite", type: "off" },
      ],
    },
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

        {/* Badge "Données importées depuis Google" */}
        {isFromGoogle && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#E8F5E9", border: "1.5px solid #A5D6A7",
            borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 20 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#2E7D32" }}>
                Fiche Google importée
              </div>
              <div style={{ fontSize: 11, color: "#4CAF50", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                Tous les champs sont éditables — modifie ce que tu veux.
              </div>
            </div>
          </div>
        )}

        <div style={{
          fontSize: 11, fontWeight: 700, color: COLORS.ink2,
          letterSpacing: 0.8, textTransform: "uppercase",
          marginBottom: 10, marginTop: 4,
          fontFamily: "'DM Sans', sans-serif",
        }}>Informations</div>

        <input
          placeholder="Nom de l'enseigne"
          value={nomMagasin}
          onChange={e => setNomMagasin(e.target.value)}
          onFocus={() => setFocused("nom")}
          onBlur={() => setFocused(null)}
          style={inputStyle("nom")}
        />
        <div style={{ position: "relative", marginBottom: 10 }}>
          <select
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            onFocus={() => setFocused("cat")}
            onBlur={() => setFocused(null)}
            style={{
              ...inputStyle("cat"),
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              marginBottom: 0,
            }}>
            <option value="" disabled>Choisir une catégorie…</option>
            <optgroup label="🏪 Commerces">
              <option>Mode & Prêt-à-porter</option>
              <option>Alimentation & Épicerie</option>
              <option>Décoration & Maison</option>
              <option>Sport & Fitness</option>
              <option>Services de proximité</option>
              <option>Culture & Librairie</option>
            </optgroup>
            <optgroup label="💄 Beauté & Bien-être">
              <option>Beauté & Bien-être</option>
            </optgroup>
            <optgroup label="🍽️ Resto & Ambiance">
              <option>Restauration & Ambiance</option>
            </optgroup>
            <optgroup label="🎨 Artisans">
              <option>Artisan & Créateur</option>
            </optgroup>
            <optgroup label="🎭 Divertissement">
              <option>Divertissement</option>
            </optgroup>
            <optgroup label="🏛️ Vie locale">
              <option>Vie locale & Administratif</option>
            </optgroup>
            <optgroup label="✨ Autre">
              <option>Autre</option>
            </optgroup>
          </select>
        </div>
        {/* Spécialités — chips multi-sélection */}
        {categorie && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink2, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
              Tes spécialités <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(choisis une ou plusieurs)</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {(METIER_SUGGESTIONS[categorie] || []).map(s => {
                const on = metiersSelected.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMetiersSelected(prev => on ? prev.filter(m => m !== s) : [...prev, s])}
                    style={{
                      padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${on ? COLORS.accent : COLORS.border}`,
                      background: on ? "#FFF0EB" : COLORS.card,
                      color: on ? COLORS.accent : COLORS.ink2,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >{on ? "✓ " : ""}{s}</button>
                );
              })}
            </div>

            {/* Champ custom "Ajouter..." */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                placeholder="Ajouter une spécialité…"
                value={metierCustom}
                onChange={e => setMetierCustom(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && metierCustom.trim()) {
                    setMetiersSelected(prev => prev.includes(metierCustom.trim()) ? prev : [...prev, metierCustom.trim()]);
                    setMetierCustom("");
                  }
                }}
                onFocus={() => setFocused("metier")}
                onBlur={() => setFocused(null)}
                style={{ ...inputStyle("metier"), flex: 1, marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (metierCustom.trim()) {
                    setMetiersSelected(prev => prev.includes(metierCustom.trim()) ? prev : [...prev, metierCustom.trim()]);
                    setMetierCustom("");
                  }
                }}
                style={{ padding: "12px 16px", borderRadius: 14, background: COLORS.accent, color: "#fff", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
              >+</button>
            </div>

            {/* Tags custom ajoutés */}
            {metiersSelected.filter(m => !(METIER_SUGGESTIONS[categorie] || []).includes(m)).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {metiersSelected.filter(m => !(METIER_SUGGESTIONS[categorie] || []).includes(m)).map(m => (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "#FFF0EB", border: `1.5px solid ${COLORS.accent}`, fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>
                    {m}
                    <span onClick={() => setMetiersSelected(prev => prev.filter(x => x !== m))} style={{ cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <input
          placeholder="Adresse"
          value={adresse}
          onChange={e => setAdresse(e.target.value)}
          onFocus={() => setFocused("adr")}
          onBlur={() => setFocused(null)}
          style={inputStyle("adr")}
        />
        <input
          placeholder="Téléphone (optionnel)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onFocus={() => setFocused("phone")}
          onBlur={() => setFocused(null)}
          style={inputStyle("phone")}
          type="tel"
        />
        <input
          placeholder="Site web (optionnel)"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          onFocus={() => setFocused("web")}
          onBlur={() => setFocused(null)}
          style={inputStyle("web")}
          type="url"
        />
        <textarea
          placeholder="Présentation courte (max 200 car.)"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          onFocus={() => setFocused("desc")}
          onBlur={() => setFocused(null)}
          style={{ ...inputStyle("desc"), resize: "none", marginBottom: 20 }}
        />

        {/* Plans masqués temporairement — à réactiver lors du lancement commercial */}
        <div style={{
          background: COLORS.pro + "15",
          border: `1.5px solid ${COLORS.pro}30`,
          borderRadius: 16,
          padding: "14px 16px",
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ fontSize: 28 }}>🎁</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.pro, marginBottom: 2 }}>
              C'est gratuit pour démarrer
            </div>
            <div style={{ fontSize: 12, color: COLORS.ink2, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              Crée ta vitrine, publie tes posts et touche tes premiers voisins sans engagement.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <CheckboxLegal checked={acceptCGUM} onChange={setAcceptCGUM}>
            J'accepte les{" "}
            <a href="/cgu-marchands.html" target="_blank" onClick={e => e.stopPropagation()} style={{ color: COLORS.accent, fontWeight: 600 }}>
              Conditions Générales d'Utilisation Marchands
            </a>
            , notamment les obligations liées à la publication de contenu commercial, à l'exactitude des informations produits et aux modalités d'abonnement.
          </CheckboxLegal>
        </div>

        <button
          onClick={() => onValidate({
            nom: nomMagasin,
            cat: categorie,
            metier: metiersSelected.join(", ") || categorie,
            adr: adresse,
            phone,
            website,
            desc: description,
            plan: selectedPlan,
            // Données Google pour audit et resync
            google_place_id:       initialData?.place_id       ?? null,
            google_data:           initialData?.raw            ?? null,
            opening_hours:         initialData?.opening_hours  ?? null,
            current_opening_hours: initialData?.current_opening_hours ?? null,
            photo_urls:            initialData?.photo_urls     ?? [],
            lat:                   initialData?.lat            ?? null,
            lng:                   initialData?.lng            ?? null,
          })}
          disabled={loading || !nomMagasin.trim() || !acceptCGUM}
          style={{
            width: "100%", background: loading || !nomMagasin.trim() || !acceptCGUM ? "#ccc" : COLORS.accent,
            color: "#fff", border: "none",
            borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading || !nomMagasin.trim() || !acceptCGUM ? "not-allowed" : "pointer", marginTop: 8,
            transition: "background 0.2s",
          }}>
          {loading ? "⏳ Création du compte…" : "Créer ma vitrine gratuitement →"}
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN 4 : SUCCESS ───
function ScreenSuccess({ accountType, onRestart, onFinish }) {
  const isMerchant = accountType === "magasin";
  const msg = isMerchant
    ? "Ton compte commerçant est prêt ! Tu peux dès maintenant personnaliser ta vitrine."
    : "Ton compte Voisin·e est prêt. Rejoins le fil du quartier !";

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", textAlign: "center", gap: 16,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: isMerchant ? COLORS.pro : COLORS.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "#fff",
      }}>{isMerchant ? "🏪" : "✓"}</div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.ink,
      }}>Bienvenue sur Chipeur !</div>
      <div style={{
        fontSize: 14, color: COLORS.ink2, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}>{msg}</div>

      {isMerchant ? (
        <>
          {/* CTA principal : créer sa vitrine */}
          <button onClick={() => onFinish && onFinish("profil")} style={{
            background: COLORS.pro, color: "#fff", border: "none",
            borderRadius: 16, padding: "14px 24px", fontSize: 14, fontWeight: 700,
            fontFamily: "'Syne', sans-serif", cursor: "pointer", marginTop: 8, width: "100%",
          }}>Créer ma vitrine maintenant 🏪</button>
          {/* CTA secondaire : aller au fil */}
          <button onClick={() => onFinish && onFinish("fil")} style={{
            background: "transparent", color: COLORS.ink2, border: `1.5px solid ${COLORS.border}`,
            borderRadius: 16, padding: "12px 24px", fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer", width: "100%",
          }}>Explorer le fil d'abord →</button>
        </>
      ) : (
        <button onClick={() => onFinish && onFinish("fil")} style={{
          background: COLORS.ink, color: "#fff", border: "none",
          borderRadius: 16, padding: "14px 32px", fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 8,
        }}>Voir le Fil →</button>
      )}
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
  const [screen, setScreen] = useState("age");
  const [ageRange, setAgeRange] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [creds, setCreds] = useState({ prenom: "", email: "", mdp: "" });
  const [signupError, setSignupError] = useState("");
  const [loadingSignup, setLoadingSignup] = useState(false);
  // Données pré-remplies depuis Google Places (null si saisie manuelle)
  const [googleData, setGoogleData] = useState(null);

  const handleChoose = async (type) => {
    setAccountType(type);
    if (type === "voisin") {
      setLoadingSignup(true);
      // Vérifier que le pseudo est disponible
      const { data: existingPseudo } = await supabase
        .from("profiles")
        .select("id")
        .eq("pseudo", creds.prenom.trim())
        .maybeSingle();
      if (existingPseudo) {
        setSignupError("Ce pseudo est déjà pris. Choisis-en un autre !");
        setLoadingSignup(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: creds.email,
        password: creds.mdp,
        options: { data: { pseudo: creds.prenom, age_range: ageRange } },
      });
      if (!error && data?.user) {
        const refId = sessionStorage.getItem("chipeur_ref");
        await supabase.from("profiles").upsert({
          id: data.user.id,
          pseudo: creds.prenom,
          age_range: ageRange,
          ...(refId && refId !== data.user.id ? { invited_by: refId } : {}),
        });
        await addXP(data.user.id, 50, "inscription");
        // Récompense l'invitant (+20 XP)
        if (refId && refId !== data.user.id) {
          await addXP(refId, 20, "invitation_acceptee");
          sessionStorage.removeItem("chipeur_ref");
        }
      }
      setLoadingSignup(false);
      if (error) { setSignupError(error.message); return; }
      setScreen("success");
    } else {
      // → étape intermédiaire : recherche Google Business
      setScreen("google_search");
    }
  };

  const handleMagasinValidate = async ({
    nom, cat, metier, adr, phone, website, desc, plan,
    google_place_id, google_data, opening_hours, current_opening_hours,
    photo_urls, lat, lng,
  }) => {
    setSignupError("");
    setLoadingSignup(true);

    // Vérifier que le pseudo (nom) est disponible
    const { data: existingNom } = await supabase
      .from("profiles")
      .select("id")
      .eq("pseudo", nom.trim())
      .maybeSingle();
    if (existingNom) {
      setSignupError("Ce nom est déjà utilisé. Choisis un autre nom pour ta boutique !");
      setLoadingSignup(false);
      return;
    }

    // 1. Créer le compte Supabase Auth
    // On inclut toutes les infos dans les métadonnées pour que le trigger Supabase les copie
    // dans le profil même si l'upsert manuel échoue ensuite (ex: vérification email requise)
    const catFinal = cat || "Autre";
    const metierFinal = metier.trim() || cat || "Commerce";
    const { data, error } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.mdp,
      options: {
        data: {
          pseudo: nom,
          role: "magasin",
          categorie: catFinal,
          metier: metierFinal,
          quartier: adr || "",
          bio: desc || "",
        },
      },
    });

    if (error) {
      setSignupError(error.message);
      setLoadingSignup(false);
      return;
    }

    // 2. Mettre à jour le profil avec les infos du magasin (complète le trigger auth)
    if (data?.user) {
      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id:                     data.user.id,
        pseudo:                 nom,
        bio:                    desc || "",
        quartier:               adr || "",
        categorie:              catFinal,
        metier:                 metierFinal,
        age_range:              ageRange,
        role:                   "magasin",
        // Champs Google Places (null si saisie manuelle)
        phone:                  phone || null,
        website:                website || null,
        lat:                    lat || null,
        lng:                    lng || null,
        google_place_id:        google_place_id || null,
        google_data:            google_data || null,
        google_synced_at:       google_place_id ? new Date().toISOString() : null,
        opening_hours:          opening_hours || null,
        current_opening_hours:  current_opening_hours || null,
        photo_urls:             photo_urls?.length > 0 ? photo_urls : null,
      });
      if (upsertErr) console.warn("Upsert profil magasin:", upsertErr.message);
    }

    setLoadingSignup(false);
    setScreen("success");
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
        {screen === "age" && (
          <ScreenAge onNext={(age) => { setAgeRange(age); setScreen("inscription"); }} />
        )}

        {screen === "inscription" && (
          <ScreenInscription ageRange={ageRange} onNext={(d) => { setCreds(d); setScreen("choix"); }} />
        )}

        {screen === "choix" && (
          <ScreenChoixCompte onChoose={handleChoose} />
        )}

        {screen === "google_search" && (
          <ScreenGoogleSearch
            onBack={() => setScreen("choix")}
            onSkip={() => { setGoogleData(null); setScreen("magasin"); }}
            onSelect={(data) => { setGoogleData(data); setScreen("magasin"); }}
          />
        )}

        {screen === "magasin" && (
          <ScreenMagasin
            onBack={() => setScreen("google_search")}
            onValidate={handleMagasinValidate}
            loading={loadingSignup}
            initialData={googleData}
          />
        )}

        {screen === "success" && (
          <ScreenSuccess
            accountType={accountType}
            onRestart={() => { setScreen("inscription"); setAccountType(null); }}
            onFinish={(dest) => {
              if (onAuth) { onAuth(); }
              setPage(dest === "profil" ? "profil" : "fil");
            }}
          />
        )}
    </div>
  );
}
