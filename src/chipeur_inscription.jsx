import { useState } from "react";
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
          <a href="mailto:contact@chipeur.fr?subject=Inscription mineur" style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
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
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptRGPD, setAcceptRGPD] = useState(false);
  const canProceed = prenom.trim() && email.trim() && mdp.length >= 6 && acceptCGU && acceptRGPD;

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
      <Field label="MOT DE PASSE" type="password" placeholder="6 caractères minimum" value={mdp} onChange={setMdp} />

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

// ─── SCREEN 3 : INSCRIPTION MAGASIN ───
function ScreenMagasin({ onBack, onValidate, loading }) {
  const [selectedPlan, setSelectedPlan] = useState("test");
  const [focused, setFocused] = useState(null);
  const [nomMagasin, setNomMagasin] = useState("");
  const [categorie, setCategorie] = useState("");
  const [metier, setMetier] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [acceptCGUM, setAcceptCGUM] = useState(false);

  const METIER_SUGGESTIONS = {
    "Mode & Prêt-à-porter":    ["Boutique de mode", "Prêt-à-porter femme", "Prêt-à-porter homme", "Accessoires", "Lingerie", "Chaussures"],
    "Beauté & Bien-être":      ["Institut de beauté", "Coiffeur", "Barbier", "Esthéticienne", "Nail art", "Spa & massages", "Tatoueur"],
    "Artisan":                 ["Photographe", "Graphiste", "Céramiste", "Bijoutier", "Menuisier", "Couturier", "Illustrateur", "Potier"],
    "Restauration & Traiteur": ["Restaurant", "Boulangerie", "Pâtisserie", "Traiteur", "Pizzeria", "Kebab", "Salon de thé", "Food truck"],
    "Épicerie & Alimentation": ["Épicerie fine", "Fromagerie", "Boucherie", "Primeur", "Cave à vins", "Bio & vrac"],
    "Sport & Loisirs":         ["Salle de sport", "Coach sportif", "Yoga & pilates", "Arts martiaux", "Vélo", "Randonnée"],
    "Décoration & Maison":     ["Décoration intérieure", "Mobilier", "Luminaires", "Plantes & fleurs", "Bricolage", "Antiquités"],
    "Services de proximité":   ["Imprimerie", "Pressing", "Cordonnerie", "Serrurier", "Électricien", "Plombier", "Garde d'enfants"],
    "Autre":                   [],
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
            <option value="" disabled>Catégorie…</option>
            <option>Mode & Prêt-à-porter</option>
            <option>Beauté & Bien-être</option>
            <option>Artisan</option>
            <option>Restauration & Traiteur</option>
            <option>Épicerie & Alimentation</option>
            <option>Sport & Loisirs</option>
            <option>Décoration & Maison</option>
            <option>Services de proximité</option>
            <option>Autre</option>
          </select>
        </div>
        {/* Métier précis */}
        <input
          placeholder={categorie ? "Ton métier précis (ex : Photographe, Boulangerie…)" : "Sélectionne d'abord une catégorie"}
          value={metier}
          disabled={!categorie}
          onChange={e => setMetier(e.target.value)}
          onFocus={() => setFocused("metier")}
          onBlur={() => setFocused(null)}
          style={{ ...inputStyle("metier"), opacity: categorie ? 1 : 0.5 }}
        />
        {/* Suggestions de métier selon catégorie */}
        {categorie && (METIER_SUGGESTIONS[categorie] || []).length > 0 && !metier && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, marginTop: -4 }}>
            {(METIER_SUGGESTIONS[categorie] || []).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setMetier(s)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 11,
                  border: `1.5px solid ${COLORS.border}`, background: COLORS.card,
                  color: COLORS.ink2, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >{s}</button>
            ))}
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
        <textarea
          placeholder="Présentation courte (max 200 car.)"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
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
              {plan.trial && (
                <div style={{
                  position: "absolute", top: -1, right: 12,
                  background: COLORS.pro, color: "#fff",
                  fontSize: 9, fontWeight: 700, padding: "3px 8px",
                  borderRadius: "0 0 8px 8px", letterSpacing: 0.3,
                  fontFamily: "'DM Sans', sans-serif",
                }}>🎁 Offre pilote</div>
              )}
              {plan.popular && !plan.trial && (
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
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18,
                  color: plan.trial ? COLORS.pro : COLORS.accent,
                }}>
                  {plan.price}{" "}
                  {!plan.trial && <span style={{
                    fontSize: 11, fontWeight: 400, color: COLORS.ink2,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>/mois</span>}
                  {plan.trial && <span style={{
                    fontSize: 10, fontWeight: 400, color: COLORS.pro,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>pendant 3 mois</span>}
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
          onClick={() => onValidate({ nom: nomMagasin, cat: categorie, metier: metier.trim() || categorie, adr: adresse, desc: description, plan: selectedPlan })}
          disabled={loading || !nomMagasin.trim() || !acceptCGUM}
          style={{
            width: "100%", background: loading || !nomMagasin.trim() || !acceptCGUM ? "#ccc" : COLORS.accent,
            color: "#fff", border: "none",
            borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading || !nomMagasin.trim() || !acceptCGUM ? "not-allowed" : "pointer", marginTop: 8,
            transition: "background 0.2s",
          }}>
          {loading ? "⏳ Création du compte…" : "Choisir ce plan et continuer →"}
        </button>
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
  const [screen, setScreen] = useState("age");
  const [ageRange, setAgeRange] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [creds, setCreds] = useState({ prenom: "", email: "", mdp: "" });
  const [signupError, setSignupError] = useState("");
  const [loadingSignup, setLoadingSignup] = useState(false);

  const handleChoose = async (type) => {
    setAccountType(type);
    if (type === "voisin") {
      setLoadingSignup(true);
      const { data, error } = await supabase.auth.signUp({
        email: creds.email,
        password: creds.mdp,
        options: { data: { pseudo: creds.prenom, age_range: ageRange } },
      });
      if (!error && data?.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          pseudo: creds.prenom,
          age_range: ageRange,
        });
        await addXP(data.user.id, 50, "inscription");
      }
      setLoadingSignup(false);
      if (error) { setSignupError(error.message); return; }
      setScreen("success");
    } else {
      setScreen("magasin");
    }
  };

  const handleMagasinValidate = async ({ nom, cat, metier, adr, desc, plan }) => {
    setSignupError("");
    setLoadingSignup(true);

    // 1. Créer le compte Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.mdp,
      options: {
        data: {
          pseudo: nom,
          role: "magasin",
        },
      },
    });

    if (error) {
      setSignupError(error.message);
      setLoadingSignup(false);
      return;
    }

    // 2. Mettre à jour le profil avec les infos du magasin
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        pseudo: nom,
        bio: desc || "",
        quartier: adr || "",
        categorie: cat || "Autre",
        metier: metier || cat || "Commerce",
        age_range: ageRange,
      });
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

        {screen === "magasin" && (
          <ScreenMagasin
            onBack={() => setScreen("choix")}
            onValidate={handleMagasinValidate}
            loading={loadingSignup}
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
