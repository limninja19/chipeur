import React from "react";

/**
 * ChallengeUI v2 — Composants partagés défis Chipeur
 * Adapté pour la table "defis" (pas "challenges")
 */

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
  const daysLow  = (challenge.days_remaining || 0) < HOT_DROP_DAYS_THRESHOLD;
  const fillHigh = fillRatio > HOT_DROP_FILL_THRESHOLD;
  return daysLow || fillHigh;
};

const PULSE_CSS = `
@keyframes chipeur-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}
@keyframes chipeur-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`;

const InjectAnimations = () => (
  <style dangerouslySetInnerHTML={{ __html: PULSE_CSS }} />
);

// ── ChallengeMedia ───────────────────────────────────────────────
export const ChallengeMedia = ({ photoUrl, merchantName, category, height = 160 }) => {
  const colors = getCategoryColors(category);
  const initial = (merchantName || "C").charAt(0).toUpperCase();
  const patternId = `pat-${(category || "default")}-${Math.random().toString(36).slice(2, 7)}`;

  if (photoUrl) {
    return (
      <div
        style={{ height, backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}
        role="img" aria-label={`Photo ${merchantName}`}
      />
    );
  }

  return (
    <div style={{ height, background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse"
            width={colors.pattern === "stripes" ? 40 : 20}
            height={colors.pattern === "stripes" ? 40 : 20}
            patternTransform={colors.pattern === "stripes" ? "rotate(45)" : ""}>
            {colors.pattern === "stripes"
              ? <line x1="0" y1="0" x2="0" y2="40" stroke="#FFF" strokeWidth="2" opacity="0.15" />
              : <circle cx="10" cy="10" r="1.5" fill="#FFF" opacity="0.2" />}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div style={{ fontSize: height * 0.85, fontWeight: 900, color: "rgba(255,255,255,0.95)", fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: -8, position: "relative", textShadow: "0 4px 20px rgba(0,0,0,0.15)", lineHeight: 1 }}>
        {initial}
      </div>
    </div>
  );
};

// ── RewardBadge ──────────────────────────────────────────────────
export const RewardBadge = ({ amount, accentColor = "#E94B2C", size = "sm" }) => {
  const dims = size === "lg"
    ? { padding: "12px 16px", labelSize: 11, amountSize: 32 }
    : { padding: "8px 12px",  labelSize: 9,  amountSize: 22 };
  return (
    <div style={{ background: "#FFF", borderRadius: 12, padding: dims.padding, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "inline-block" }}>
      <div style={{ fontSize: dims.labelSize, fontWeight: 800, color: accentColor, letterSpacing: 1.5, marginBottom: 1 }}>À GAGNER</div>
      <div style={{ fontSize: dims.amountSize, fontWeight: 900, color: "#1A1A1A", lineHeight: 1, letterSpacing: -1 }}>{amount}</div>
    </div>
  );
};

// ── NormalCard ───────────────────────────────────────────────────
const NormalCard = ({ challenge, onClick }) => {
  const colors = getCategoryColors(challenge.category);
  return (
    <button type="button" onClick={onClick}
      style={{ width: 240, height: 320, background: "#1A1A1A", borderRadius: 20, overflow: "hidden", flexShrink: 0, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", position: "relative", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
      aria-label={`Défi : ${challenge.title}`}>
      <div style={{ position: "absolute", inset: 0 }}>
        <ChallengeMedia photoUrl={challenge.photo_url} merchantName={challenge.merchant_name} category={challenge.category} height={320} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.88) 100%)" }} />

      {/* TOP */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <RewardBadge amount={challenge.reward_amount} accentColor={colors.to} size="sm" />
        <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "4px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: "#FFF" }}>
          ⏱ {challenge.days_remaining}j
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
        {challenge.merchant_name && (
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, marginBottom: 3 }}>
            {challenge.merchant_name.toUpperCase()}
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 800, color: "#FFF", marginBottom: 4, lineHeight: 1.2, letterSpacing: -0.3 }}>
          {challenge.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginBottom: 12 }}>
          🎁 {challenge.reward_description}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
            {challenge.participants_count}/{challenge.target_count} voisins
          </div>
          <div style={{ background: "#FFF", color: "#1A1A1A", padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
            Participer →
          </div>
        </div>
      </div>
    </button>
  );
};

// ── HotDropCard ──────────────────────────────────────────────────
export const HotDropCard = ({ challenge, onClick }) => {
  const fillPercent = Math.min(100, Math.round(((challenge.participants_count || 0) / (challenge.target_count || 1)) * 100));
  return (
    <button type="button" onClick={onClick}
      style={{ width: 240, height: 320, background: "#0a0a0a", borderRadius: 20, overflow: "hidden", flexShrink: 0, fontFamily: "system-ui, sans-serif", boxShadow: "0 8px 28px rgba(255,107,53,0.35), 0 4px 12px rgba(0,0,0,0.3)", position: "relative", border: "2px solid #FF6B35", padding: 0, cursor: "pointer", textAlign: "left" }}
      aria-label={`Défi urgent : ${challenge.title}`}>
      <InjectAnimations />
      <div style={{ position: "absolute", inset: 0 }}>
        <ChallengeMedia photoUrl={challenge.photo_url} merchantName={challenge.merchant_name} category={challenge.category} height={320} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(10,10,10,0.95) 100%)" }} />

      {/* Bandeau LAST CALL */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#FF6B35", color: "#0a0a0a", padding: "6px 12px", fontSize: 9, fontWeight: 900, letterSpacing: 2, display: "flex", justifyContent: "space-between", alignItems: "center", textTransform: "uppercase" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a0a0a", animation: "chipeur-pulse 1.5s ease-in-out infinite", display: "inline-block" }} />
          {challenge.days_remaining < HOT_DROP_DAYS_THRESHOLD ? "LAST CALL" : "ALMOST FULL"}
        </span>
        <span>{challenge.days_remaining}J · {fillPercent}%</span>
      </div>

      {/* Badge récompense */}
      <div style={{ position: "absolute", top: 40, left: 12 }}>
        <div style={{ background: "#FF6B35", borderRadius: 10, padding: "7px 11px", boxShadow: "0 4px 16px rgba(255,107,53,0.5)" }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: "#0a0a0a", letterSpacing: 1.5, marginBottom: 1 }}>PRIZE</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0a0a0a", lineHeight: 1, letterSpacing: -1 }}>{challenge.reward_amount}</div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
        {challenge.merchant_name && (
          <div style={{ fontSize: 9, fontWeight: 900, color: "#FF6B35", letterSpacing: 2, marginBottom: 3 }}>
            {challenge.merchant_name.toUpperCase()}
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 900, color: "#FFF", marginBottom: 4, lineHeight: 1.2 }}>{challenge.title}</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#FF8B5E", marginBottom: 3, fontWeight: 800, letterSpacing: 1 }}>
            <span>{challenge.participants_count}/{challenge.target_count} SPOTS</span>
            <span>{fillPercent}% FULL</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${fillPercent}%`, height: "100%", background: "linear-gradient(90deg, #FF6B35, #FFB199, #FF6B35)", backgroundSize: "200% 100%", animation: "chipeur-shimmer 2s linear infinite" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#FF6B35", color: "#0a0a0a", padding: "9px 14px", borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase" }}>
            Claim →
          </div>
        </div>
      </div>
    </button>
  );
};

// ── ChallengeCard (auto HotDrop) ─────────────────────────────────
export const ChallengeCard = ({ challenge, onClick, forceMode = null }) => {
  const useHot = forceMode === "hot" || (forceMode !== "normal" && isHotDrop(challenge));
  return useHot
    ? <HotDropCard challenge={challenge} onClick={onClick} />
    : <NormalCard  challenge={challenge} onClick={onClick} />;
};
