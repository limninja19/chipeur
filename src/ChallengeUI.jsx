import React from "react";

const HOT_DROP_DAYS_THRESHOLD = 7;
const HOT_DROP_FILL_THRESHOLD = 0.8;

const CATEGORY_COLORS = {
  Mode:    { from: "#FF6B35", to: "#E94B2C", pattern: "stripes" },
  Resto:   { from: "#A78BFA", to: "#7C3AED", pattern: "dots" },
  Beauté:  { from: "#FB7185", to: "#E11D48", pattern: "stripes" },
  Maison:  { from: "#34D399", to: "#059669", pattern: "dots" },
  Loisirs: { from: "#FBBF24", to: "#D97706", pattern: "stripes" },
  Default: { from: "#FF6B35", to: "#E94B2C", pattern: "stripes" },
};

const getCategoryColors = (category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;

export const isHotDrop = (challenge) => {
  if (!challenge) return false;
  const fillRatio = (challenge.participants_count || 0) / (challenge.target_count || 1);
  return (challenge.days_remaining || 0) < HOT_DROP_DAYS_THRESHOLD || fillRatio > HOT_DROP_FILL_THRESHOLD;
};

// Les animations sont définies dans index.css — plus besoin d'injection HTML
const InjectAnimations = () => null;

// ── ChallengeMedia ───────────────────────────────────────────────
export const ChallengeMedia = ({ photoUrl, merchantName, category, height = 160 }) => {
  const colors = getCategoryColors(category);
  const initial = (merchantName || "C").charAt(0).toUpperCase();
  const patternId = `pat-${(category || "d")}-${Math.random().toString(36).slice(2, 6)}`;

  if (photoUrl) {
    return (
      <div style={{ height, backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        role="img" aria-label={`Photo ${merchantName}`} />
    );
  }
  return (
    <div style={{ height, background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse"
            width={colors.pattern === "stripes" ? 40 : 20} height={colors.pattern === "stripes" ? 40 : 20}
            patternTransform={colors.pattern === "stripes" ? "rotate(45)" : ""}>
            {colors.pattern === "stripes"
              ? <line x1="0" y1="0" x2="0" y2="40" stroke="#FFF" strokeWidth="2" opacity="0.15" />
              : <circle cx="10" cy="10" r="1.5" fill="#FFF" opacity="0.2" />}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div style={{ fontSize: height * 0.78, fontWeight: 900, color: "rgba(255,255,255,0.92)", fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: -8, position: "relative", lineHeight: 1 }}>
        {initial}
      </div>
    </div>
  );
};

// ── RewardBadge ──────────────────────────────────────────────────
export const RewardBadge = ({ amount, accentColor = "#E94B2C", size = "sm" }) => {
  const dims = size === "lg"
    ? { padding: "10px 14px", labelSize: 10, amountSize: 28 }
    : { padding: "6px 10px",  labelSize: 8,  amountSize: 18 };
  return (
    <div style={{ background: "#FFF", borderRadius: 10, padding: dims.padding, boxShadow: "0 3px 10px rgba(0,0,0,0.18)", display: "inline-block" }}>
      <div style={{ fontSize: dims.labelSize, fontWeight: 800, color: accentColor, letterSpacing: 1.2, marginBottom: 1 }}>À GAGNER</div>
      <div style={{ fontSize: dims.amountSize, fontWeight: 900, color: "#1A1A1A", lineHeight: 1, letterSpacing: -0.5 }}>{amount}</div>
    </div>
  );
};

// ── NormalCard — design SPLIT : photo haut / texte bas ───────────
const NormalCard = ({ challenge, onClick }) => {
  const colors = getCategoryColors(challenge.category);
  const PHOTO_H = 148;

  return (
    <button type="button" onClick={onClick}
      style={{ width: 230, flexShrink: 0, background: "#FFF", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(26,23,20,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.09)", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}
      aria-label={`Défi : ${challenge.title}`}>

      {/* ── PHOTO ── */}
      <div style={{ position: "relative", height: PHOTO_H, flexShrink: 0 }}>
        <ChallengeMedia photoUrl={challenge.photo_url} merchantName={challenge.merchant_name} category={challenge.category} height={PHOTO_H} />
        {/* Badge récompense */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <RewardBadge amount={challenge.reward_amount} accentColor={colors.to} size="sm" />
        </div>
        {/* Timer */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "4px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: "#FFF" }}>
          ⏱ {challenge.days_remaining}j
        </div>
      </div>

      {/* ── TEXTE ── */}
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 4, background: "#FFF" }}>
        {challenge.merchant_name && (
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.to, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {challenge.merchant_name}
          </div>
        )}
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1714", lineHeight: 1.25, letterSpacing: -0.2 }}>
          {challenge.title}
        </div>
        <div style={{ fontSize: 11, color: "#6B6560", marginTop: 2 }}>
          🎁 {challenge.reward_description}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: "#6B6560", fontWeight: 600 }}>
            👥 {challenge.participants_count}/{challenge.target_count}
          </div>
          <div style={{ background: colors.to, color: "#FFF", padding: "7px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
            Participer →
          </div>
        </div>
      </div>
    </button>
  );
};

// ── HotDropCard — full-bleed dramatique ─────────────────────────
export const HotDropCard = ({ challenge, onClick }) => {
  const fillPercent = Math.min(100, Math.round(((challenge.participants_count || 0) / (challenge.target_count || 1)) * 100));
  return (
    <button type="button" onClick={onClick}
      style={{ width: 230, height: 300, background: "#0a0a0a", borderRadius: 18, overflow: "hidden", flexShrink: 0, fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(255,107,53,0.35)", position: "relative", border: "2px solid #FF6B35", padding: 0, cursor: "pointer", textAlign: "left" }}>
      <InjectAnimations />
      <div style={{ position: "absolute", inset: 0 }}>
        <ChallengeMedia photoUrl={challenge.photo_url} merchantName={challenge.merchant_name} category={challenge.category} height={300} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(10,10,10,0.95) 100%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#FF6B35", padding: "5px 12px", fontSize: 9, fontWeight: 900, letterSpacing: 2, display: "flex", justifyContent: "space-between", color: "#0a0a0a", textTransform: "uppercase" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", animation: "chipeur-pulse 1.5s ease-in-out infinite", display: "inline-block" }} />
          {challenge.days_remaining < HOT_DROP_DAYS_THRESHOLD ? "LAST CALL" : "ALMOST FULL"}
        </span>
        <span>{challenge.days_remaining}J · {fillPercent}%</span>
      </div>
      <div style={{ position: "absolute", top: 36, left: 12 }}>
        <div style={{ background: "#FF6B35", borderRadius: 10, padding: "6px 10px", boxShadow: "0 4px 16px rgba(255,107,53,0.5)" }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: "#0a0a0a", letterSpacing: 1.5, marginBottom: 1 }}>PRIZE</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0a0a0a", lineHeight: 1 }}>{challenge.reward_amount}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#FFF", marginBottom: 3, lineHeight: 1.2 }}>{challenge.title}</div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${fillPercent}%`, height: "100%", background: "linear-gradient(90deg,#FF6B35,#FFB199,#FF6B35)", backgroundSize: "200% 100%", animation: "chipeur-shimmer 2s linear infinite" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#FF6B35", color: "#0a0a0a", padding: "8px 14px", borderRadius: 999, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Claim →</div>
        </div>
      </div>
    </button>
  );
};

// ── ChallengeCard — switch auto HotDrop ──────────────────────────
export const ChallengeCard = ({ challenge, onClick, forceMode = null }) => {
  const useHot = forceMode === "hot" || (forceMode !== "normal" && isHotDrop(challenge));
  return useHot
    ? <HotDropCard challenge={challenge} onClick={onClick} />
    : <NormalCard  challenge={challenge} onClick={onClick} />;
};
