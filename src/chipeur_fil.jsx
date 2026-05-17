import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { useUnreadNotifs } from "./chipeur_notifications";
import { useUnreadMessages } from "./chipeur_messages";
import { addXP } from "./chipeur_xp";
import safeStorage from "./safeStorage";
import AuthGate from "./AuthGate";
import { ChallengeCard } from "./ChallengeUI";
import SwipeVoteModal from "./SwipeVoteModal";
import Avatar from "./Avatar";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};


// ─── APP HEADER ───
function AppHeader({ setPage, profile, user, requireAuth }) {
  const unreadNotifs = useUnreadNotifs(user?.id);
  const unreadMessages = useUnreadMessages(user?.id);

  const voisins = [
    { emoji: "👩", bg: "#FEF3E0" },
    { emoji: "🧑", bg: "#E8F4FD" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 6px", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGradFil" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5733"/>
              <stop offset="100%" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
          <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradFil)"/>
          <circle cx="36" cy="26" r="10" fill="white"/>
          <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: -0.5, color: "#1A1A2E" }}>
            chi<span style={{ color: C.accent }}>p</span>eur
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: -0.1, color: C.accent, lineHeight: 1.6, marginTop: 5 }}>
            Découvre ta ville,<br />à travers tes voisins
          </div>
        </div>
      </div>

      {/* Centre : bonjour pseudo */}
      {profile?.pseudo && (
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.ink2, padding: "0 8px" }}>
          Bonjour {profile.pseudo} 👋
        </div>
      )}

      {/* Droite : icônes + voisins en dessous */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>

        {/* Ligne 1 : boutons auth ou cloche + messages */}
        {!user ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage("connexion")}
              style={{
                background: "transparent", border: `1.5px solid ${C.border}`,
                borderRadius: 20, padding: "6px 12px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", color: C.ink2,
              }}
            >Se connecter</button>
            <button
              onClick={() => requireAuth?.(() => {})}
              style={{
                background: C.accent, border: "none",
                borderRadius: 20, padding: "6px 12px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", color: "#fff",
              }}
            >Rejoindre 🔥</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Cloche notifications */}
            <div onClick={() => setPage("notifications")} style={{ position: "relative", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>
              🔔
              {unreadNotifs > 0 && (
                <div style={{
                  position: "absolute", top: -4, right: -6,
                  background: C.accent, color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  border: "1.5px solid #fff",
                }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</div>
              )}
            </div>
            {/* Messages */}
            <div onClick={() => setPage("messages")} style={{ position: "relative", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>
              💬
              {unreadMessages > 0 && (
                <div style={{
                  position: "absolute", top: -4, right: -6,
                  background: C.accent, color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  border: "1.5px solid #fff",
                }}>{unreadMessages > 9 ? "9+" : unreadMessages}</div>
              )}
            </div>
          </div>
        )}

        {/* Ligne 2 : bouton Voisins (toujours visible) */}
        <div onClick={() => setPage("voisins")} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: C.pill, borderRadius: 20, padding: "4px 10px" }}>
          <span style={{ fontSize: 14 }}>🫣</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.ink2, fontFamily: "'DM Sans', sans-serif" }}>Voisins</span>
        </div>

      </div>
    </div>
  );
}

// ─── FIL DROPDOWN FILTRE ───────────────────────────────────────
// nav: null  → filtre dans le fil (chip sélectionnable)
// nav: "xxx" → navigation vers une autre page (pas de sélection)
const CHIPS = [
  { id: "all",        label: "Tout le fil",   nav: null      },
  { id: "chope",      label: "📸 Chope !",    nav: null      },
  { id: "lieux",      label: "📍 Lieux",       nav: null      },
  { id: "je_cherche", label: "🔍 Je cherche", nav: null      },
  { id: "defis",      label: "🏆 Défis",      nav: null      },
  { id: "tuvalides",  label: "🤔 Tu valides", nav: "defis"   },
  { id: "evenements", label: "📅 Événement",  nav: "sorties" },
];

function FilDropdown({ active, onToggle, setPage }) {
  const [open, setOpen] = useState(false);

  // Libellé du bouton : liste les filtres actifs
  const activeChips = CHIPS.filter(c => active.has(c.id));
  const label = activeChips.map(c => c.label).join(", ") || "Tout le fil";

  return (
    <div style={{ padding: "2px 12px 10px", flexShrink: 0, position: "relative" }}>

      {/* Bouton dérouleur */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          width: "100%", boxSizing: "border-box",
          background: active.has("all") ? C.pill : C.ink,
          color: active.has("all") ? C.ink2 : "#fff",
          border: "none", borderRadius: 20,
          padding: "9px 16px",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
          {label}
        </span>
        <svg width="14" height="18" viewBox="0 0 72 90" fill="none" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinDropdown" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5733"/>
              <stop offset="100%" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
          <path d="M36 4C22 4 11 15 11 29C11 46 36 82 36 82C36 82 61 46 61 29C61 15 50 4 36 4Z" fill={active.has("all") ? "#BBBAB8" : "rgba(255,255,255,0.7)"}/>
          <circle cx="36" cy="29" r="11" fill={active.has("all") ? "#F5F2EE" : "rgba(255,255,255,0.25)"}/>
        </svg>
      </button>

      {/* Panneau déroulé */}
      {open && (
        <>
          {/* Overlay transparent pour fermer au clic extérieur */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 12, right: 12,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: "12px 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 51,
            display: "flex", flexWrap: "wrap", gap: 8,
          }}>
            {CHIPS.map(chip => {
              const isOn = active.has(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    if (chip.nav) { setOpen(false); setPage(chip.nav); }
                    else onToggle(chip.id);
                  }}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 20,
                    border: chip.nav ? `1.5px solid ${C.accent}` : "none",
                    cursor: "pointer", whiteSpace: "nowrap",
                    background: isOn ? C.ink : (chip.nav ? "transparent" : C.pill),
                    color: isOn ? "#fff" : (chip.nav ? C.accent : C.ink2),
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── VILLES DU BASSIN DÉODATIEN ────────────────────────────────
const BASIN_CITIES = [
  "Saint-Dié-des-Vosges", "Saint-Dié",
  "Senones", "Raon-l'Étape", "Étival-Clairefontaine",
  "Fraize", "Bruyères", "Ban-de-Laveline", "La Bresse",
  "Gérardmer", "Corcieux", "Moyenmoutier",
];

const ZONE_OPTIONS = [
  { id: "tout",     label: "🌍 Tout le fil" },
  { id: "bassin",   label: "📍 Saint-Dié et alentours" },
  { id: "saint-die",label: "🏙️ Saint-Dié-des-Vosges" },
  { id: "senones",  label: "Senones" },
  { id: "raon",     label: "Raon-l'Étape" },
  { id: "etival",   label: "Étival-Clairefontaine" },
  { id: "fraize",   label: "Fraize" },
  { id: "bruyeres", label: "Bruyères" },
  { id: "ban",      label: "Ban-de-Laveline" },
  { id: "gérardmer",label: "Gérardmer" },
];

// ─── FILTRE ZONE ────────────────────────────────────────────────
function VilleSelect({ zone, setZone }) {
  const isFiltered = zone !== "tout";
  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      <select
        value={zone}
        onChange={e => setZone(e.target.value)}
        style={{
          width: "100%", padding: "7px 14px", borderRadius: 20,
          border: `1.5px solid ${isFiltered ? C.accent : C.border}`,
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
          color: isFiltered ? C.accent : C.ink2,
          background: isFiltered ? "#FFF3F0" : C.card,
          outline: "none", cursor: "pointer", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
          paddingRight: 34,
        }}
      >
        {ZONE_OPTIONS.map(o => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── BANDEAU DÉFIS ───────────────────────────────────────────────
const EMOJI_TO_CATEGORY = {
  "👗":"Mode","👠":"Mode","👜":"Mode","🛍️":"Mode","🧥":"Mode","✂️":"Beauté",
  "💄":"Beauté","🧖":"Beauté","💅":"Beauté",
  "🍕":"Resto","🥗":"Resto","🍷":"Resto","☕":"Resto","🧁":"Resto","🍽️":"Resto",
  "🏠":"Maison","🪵":"Maison","🏺":"Maison","🛋️":"Maison",
  "🎭":"Loisirs","🏃":"Loisirs","⚽":"Loisirs","📸":"Loisirs","🎨":"Loisirs",
};

function daysRemaining(ends_at) {
  if (!ends_at) return 30;
  const diff = new Date(ends_at) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function extractRewardAmount(reward) {
  if (!reward) return "🎁";
  const m = reward.match(/(\d+)\s*€/);
  return m ? `${m[1]}€` : reward.split(" ").slice(0, 2).join(" ");
}

function BandeauDefis({ setPage, user }) {
  const [defis, setDefis]       = useState([]);
  const [voteDefi, setVoteDefi] = useState(null);
  const [showMerchantInfo, setShowMerchantInfo] = useState(false);
  const [infoTab, setInfoTab] = useState("voisin");

  useEffect(() => {
    supabase.from("defis")
      .select("*")
      .eq("ended", false)
      .order("created_at", { ascending: false })
      .then(async ({ data: defisData }) => {
        if (!defisData || defisData.length === 0) return;

        // Récupérer les pseudos des créateurs
        const userIds = [...new Set(defisData.map(d => d.user_id).filter(Boolean))];
        let pseudoMap = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles").select("id, pseudo").in("id", userIds);
          (profiles || []).forEach(p => { pseudoMap[p.id] = p.pseudo; });
        }

        const mapped = defisData.map((d) => ({
          id:                 d.id,
          title:              d.title,
          type:               d.type || "merchant",
          creator_name:       pseudoMap[d.user_id] || d.merchant_name || "Chipeur",
          photo_url:          d.photo_url || null,
          days_remaining:     daysRemaining(d.ends_at),
          reward_amount:      extractRewardAmount(d.reward),
          reward_description: d.reward || "Récompense surprise",
        }));
        setDefis(mapped);
      });
  }, []);

  const voisinDefis   = defis.filter(d => d.type === "voisin");
  const merchantDefis = defis.filter(d => d.type !== "voisin");

  if (defis.length === 0) return null;

  const DefiCard = ({ d }) => (
    <div style={{ flexShrink: 0, width: 160, display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        onClick={() => setPage("defis")}
        style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 3px 10px rgba(0,0,0,0.08)" }}
      >
        <div style={{ position: "relative", height: 120 }}>
          {d.photo_url ? (
            <img src={d.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ height: 120, background: "#FF5733", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: "rgba(255,255,255,0.9)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                {(d.title || "C").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {d.reward_amount && (
            <div style={{ position: "absolute", top: 8, left: 8, background: "#fff", borderRadius: 8, padding: "4px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
              <div style={{ fontSize: 7, fontWeight: 800, color: "#E94B2C", letterSpacing: 1 }}>À GAGNER</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1714", lineHeight: 1 }}>{d.reward_amount}</div>
            </div>
          )}
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "3px 7px", fontSize: 9, fontWeight: 700, color: "#fff" }}>
            ⏱ {d.days_remaining}j
          </div>
        </div>
        <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 10, color: C.ink2, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>
            {d.type === "voisin" ? "🏘️" : "🏪"} {d.creator_name}
          </span>
          <span style={{ background: C.accent, color: "#fff", borderRadius: 20, padding: "5px 10px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>Participer →</span>
        </div>
      </div>
      <button
        onClick={() => setVoteDefi(d)}
        style={{ background: "#FF5733", border: "none", borderRadius: 12, padding: "8px 0", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%" }}
      >🗳️ Voter</button>
    </div>
  );

  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      {voteDefi && <SwipeVoteModal d={voteDefi} user={user} onClose={() => setVoteDefi(null)} />}

      {/* ── MODALE EXPLICATION DÉFIS COMMERÇANTS ── */}
      {showMerchantInfo && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.6)", display: "flex", alignItems: "flex-end", zIndex: 200 }} onClick={() => setShowMerchantInfo(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#F5F2EE", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", boxSizing: "border-box", maxHeight: "88vh", overflowY: "auto" }}>
              {/* Poignée */}
              <div style={{ width: 36, height: 4, background: "rgba(26,23,20,0.15)", borderRadius: 2, margin: "0 auto 16px" }} />

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#0A3D2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏪</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 15, color: "#1A1714", lineHeight: 1.2 }}>Les défis commerçants arrivent !</div>
                  <div style={{ fontSize: 12, color: "#6B6660", marginTop: 2 }}>Comment ça marche ?</div>
                </div>
              </div>

              {/* Onglets Voisin / Commerçant */}
              <div style={{ display: "flex", background: "rgba(26,23,20,0.07)", borderRadius: 14, padding: 4, marginBottom: 20 }}>
                {[{ id: "voisin", label: "🏘️ Je suis voisin" }, { id: "commercant", label: "🏪 Je suis commerçant" }].map(t => (
                  <button key={t.id} onClick={() => setInfoTab(t.id)} style={{
                    flex: 1, padding: "8px 0", border: "none", borderRadius: 11, cursor: "pointer",
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                    background: infoTab === t.id ? "#fff" : "transparent",
                    color: infoTab === t.id ? "#1A1714" : "#6B6660",
                    boxShadow: infoTab === t.id ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.2s",
                  }}>{t.label}</button>
                ))}
              </div>

              {/* ── VUE VOISIN ── */}
              {infoTab === "voisin" && (
                <>
                  {[
                    { emoji: "📣", title: "Un commerçant lance un défi", desc: "Un commerce de ton quartier propose un thème photo et une récompense à gagner." },
                    { emoji: "📸", title: "Tu participes avec une photo", desc: "Publie ta photo en réponse au défi. Elle apparaît dans le fil et les autres voisins peuvent voter pour toi." },
                    { emoji: "🗳️", title: "Les voisins votent", desc: "La communauté swipe et vote pour les meilleures photos pendant toute la durée du défi." },
                    { emoji: "🏆", title: "Le commerçant choisit le gagnant", desc: "À la clôture, il sélectionne le podium. Les 3 premiers gagnent des XP et une récompense locale !" },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1.5px solid rgba(26,23,20,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{step.emoji}</div>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#1A1714", marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 12, color: "#6B6660", lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "#FFF8E8", border: "1.5px solid #F7A72D", borderRadius: 16, padding: "12px 14px", marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#B45309", marginBottom: 6 }}>🏆 Récompenses XP</div>
                    <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.7 }}>
                      🥇 1er : <b>50 XP</b> · 🥈 2e : <b>20 XP</b> · 🥉 3e : <b>10 XP</b><br />
                      + récompense offerte par le commerçant
                    </div>
                  </div>
                  <button onClick={() => setShowMerchantInfo(false)} style={{ width: "100%", background: "#1A1714", color: "#fff", border: "none", borderRadius: 16, padding: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>J'ai hâte ! 🔥</button>
                </>
              )}

              {/* ── VUE COMMERÇANT ── */}
              {infoTab === "commercant" && (
                <>
                  <div style={{ background: "#0A3D2E", borderRadius: 16, padding: "16px 14px", marginBottom: 20, color: "#fff" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Rejoins Chipeur et booste ta visibilité locale 🚀</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                      En créant un défi, tu t'inscris sur Chipeur et obtiens ta <b>vitrine gratuite</b> — visible par tous les voisins de Saint-Dié.
                    </div>
                  </div>

                  {[
                    { emoji: "🏪", title: "Ta vitrine sur Chipeur", desc: "Un espace dédié à ton commerce : photos, description, bons plans, lien, et tous tes défis passés et en cours." },
                    { emoji: "📣", title: "Tu lances un défi photo", desc: "Choisis un thème, une durée et une récompense. Les voisins participent et parlent de toi dans le fil !" },
                    { emoji: "👥", title: "La communauté s'engage", desc: "Tes clients potentiels votent, partagent et découvrent ton commerce de façon naturelle et locale." },
                    { emoji: "🎁", title: "Tu choisis ta récompense", desc: "Bon de réduction, produit offert, invitation… Tu décides ce que tu offres au gagnant." },
                    { emoji: "📈", title: "Tu gagnes en notoriété", desc: "Chaque défi laisse une trace dans le fil et sur ta vitrine. Plus tu t'impliques, plus tu es visible." },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EBF5F0", border: "1.5px solid #0A3D2E22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{step.emoji}</div>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#1A1714", marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 12, color: "#6B6660", lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ background: "#EBF5F0", border: "1.5px solid #0A3D2E44", borderRadius: 16, padding: "12px 14px", marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#0A3D2E", marginBottom: 4 }}>✅ Entièrement gratuit</div>
                    <div style={{ fontSize: 12, color: "#1A5C40", lineHeight: 1.6 }}>
                      L'inscription et la création de ta vitrine sont <b>100% gratuites</b>. Sois parmi les premiers commerçants sur Chipeur !
                    </div>
                  </div>

                  {/* CTA principal : créer son compte */}
                  <button
                    onClick={() => { setShowMerchantInfo(false); setPage("inscription"); }}
                    style={{ width: "100%", background: "#0A3D2E", color: "#fff", border: "none", borderRadius: 16, padding: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10 }}
                  >Je crée mon compte commerçant 🏪</button>

                  {/* CTA secondaire : contact par mail */}
                  <a
                    href="mailto:jennytassotto@gmail.com?subject=Chipeur%20-%20Je%20veux%20ma%20vitrine&body=Bonjour%2C%0A%0AJe%20suis%20int%C3%A9ress%C3%A9%28e%29%20par%20Chipeur%20pour%20mon%20commerce.%0A%0AMon%20commerce%20:%20%0AMon%20t%C3%A9l%C3%A9phone%20:%20%0A%0AMerci%20!"
                    style={{ display: "block", width: "100%", boxSizing: "border-box", textAlign: "center", background: "transparent", color: "#0A3D2E", border: "1.5px solid #0A3D2E44", borderRadius: 16, padding: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none", marginBottom: 10 }}
                  >📩 Nous contacter pour en savoir plus</a>

                  <button onClick={() => setShowMerchantInfo(false)} style={{ width: "100%", background: "transparent", color: "#6B6660", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "'Syne', sans-serif", padding: "6px 0" }}>Pas maintenant</button>
                </>
              )}
            </div>
          </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        🏆 Défis en cours
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
        {/* Défis voisins */}
        {voisinDefis.map(d => <DefiCard key={d.id} d={d} />)}

        {/* Défis commerçants ou teaser */}
        {merchantDefis.length > 0
          ? merchantDefis.map(d => <DefiCard key={d.id} d={d} />)
          : (
            <div style={{ flexShrink: 0, width: 160 }} onClick={() => { setInfoTab("voisin"); setShowMerchantInfo(true); }}>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 3px 10px rgba(0,0,0,0.08)", cursor: "pointer" }}>
                {/* Zone visuelle */}
                <div style={{
                  height: 120, position: "relative",
                  background: "#0A3D2E",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  {/* Icônes décoratives */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🏪</span>
                    <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🏆</span>
                    <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🎁</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, color: "#fff", textAlign: "center", lineHeight: 1.3, padding: "0 10px" }}>
                    On les attend avec impatience !
                  </div>
                  {/* Badge */}
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "3px 8px", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
                    BIENTÔT
                  </div>
                </div>
                {/* Bas de carte */}
                <div style={{ background: C.card, padding: "9px 10px" }}>
                  <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.4, textAlign: "center", marginBottom: 6 }}>
                    Les défis commerçants arrivent dans ton quartier 🛍️
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#FFF0EB", borderRadius: 10, padding: "5px 8px" }}>
                    <span style={{ fontSize: 10 }}>👆</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>Voir les règles du jeu</span>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

// ─── BANDEAU SORTIES PHOTOS (collapsible) ───
function BandeauSortiesPhotos({ setPage, setSelectedSortieId }) {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    supabase
      .from("posts")
      .select("id, image_url, evenement_id, sorties:evenement_id(id, title, date_text, type)")
      .not("evenement_id", "is", null)
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const byEvent = {};
        data.forEach(post => {
          if (!post.sorties) return;
          const ev = post.sorties;
          if (!ev.date_text) return;
          const parts = ev.date_text.split("/");
          if (parts.length !== 3) return;
          const evDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          evDate.setHours(0, 0, 0, 0);
          const diff = Math.floor((today - evDate) / (1000 * 60 * 60 * 24));
          if (diff < 0 || diff > 7) return;
          if (!byEvent[ev.id]) byEvent[ev.id] = { ev, photos: [] };
          byEvent[ev.id].photos.push(post);
        });
        const result = Object.values(byEvent).filter(e => e.photos.length > 0);
        setEvents(result);
      });
  }, []);

  if (events.length === 0) return null;

  const totalPhotos = events.reduce((sum, { photos }) => sum + photos.length, 0);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header cliquable */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: C.ink, borderRadius: open ? "18px 18px 0 0" : 18,
          padding: "12px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: syne, fontWeight: 600, fontSize: 13, color: "#fff" }}>
            📸 Souvenirs de sorties
          </div>
          <div style={{ fontFamily: dm, fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            {events.length} sortie{events.length > 1 ? "s" : ""} · {totalPhotos} photo{totalPhotos > 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>{open ? "▲" : "▼"}</div>
      </div>

      {/* Liste déroulée */}
      {open && (
        <div style={{
          background: C.card, borderRadius: "0 0 18px 18px",
          border: `1px solid ${C.border}`, borderTop: "none",
          padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8,
        }}>
          {events.map(({ ev, photos }) => (
            <div
              key={ev.id}
              onClick={() => { setSelectedSortieId(ev.id); setPage("sorties"); }}
              style={{
                background: C.bg, borderRadius: 14, padding: "10px 12px",
                border: `1px solid ${C.border}`, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {photos.slice(0, 2).map(p => (
                  <div key={p.id} style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: C.pill }}>
                    <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                {photos.length > 2 && (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: C.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 13,
                  }}>
                    +{photos.length - 2}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: 11, color: C.ink2 }}>
                  {photos.length} photo{photos.length > 1 ? "s" : ""} partagée{photos.length > 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ fontSize: 16, color: C.ink2, flexShrink: 0 }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REACTIONS ───
const REACTIONS = [
  { type: "aime",       emoji: "❤️", label: "J'aime" },
  { type: "kiffe",      emoji: "🔥", label: "Je kiffe" },
  { type: "veux",       emoji: "🛒", label: "Je le veux" },
  { type: "style",      emoji: "✨", label: "Mon style" },
  { type: "recommande", emoji: "👍", label: "Je recommande" },
];

// ─── MODAL QUI A RÉAGI ───
function ReactorsModal({ postId, reactionType, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const reaction = REACTIONS.find(r => r.type === reactionType);

  useEffect(() => {
    supabase
      .from("post_reactions")
      .select("user_id")
      .eq("post_id", postId)
      .eq("type", reactionType)
      .then(async ({ data: reactions }) => {
        const userIds = (reactions || []).map(r => r.user_id).filter(Boolean);
        if (userIds.length === 0) { setList([]); setLoading(false); return; }
        const { data: profiles } = await supabase
          .from("profiles")
          .select("pseudo, avatar_url")
          .in("id", userIds);
        setList(profiles || []);
        setLoading(false);
      });
  }, [postId, reactionType]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 480, padding: "16px 20px 40px",
          maxHeight: "60vh", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.pill, margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{reaction?.emoji}</span>
          {reaction?.label}
          <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500 }}>· {list.length} voisin{list.length > 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 12 }}>Personne encore</div>
          ) : list.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < list.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <Avatar pseudo={p.pseudo} avatarUrl={p.avatar_url} size={38} />
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, color: C.ink }}>{p.pseudo || "Voisin"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reactions({ postId, userId, authorId, user }) {
  const [counts, setCounts] = useState({});
  const [userReactions, setUserReactions] = useState(new Set());
  const [reactorsFor, setReactorsFor] = useState(null); // type de réaction dont on affiche la liste

  useEffect(() => {
    if (!postId) return;
    // Charger les comptages
    supabase
      .from("post_reactions")
      .select("type")
      .eq("post_id", postId)
      .then(({ data }) => {
        if (!data) return;
        const c = {};
        data.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
        setCounts(c);
      });
    // Charger les réactions de l'utilisateur (peut en avoir plusieurs)
    if (!userId) return;
    supabase
      .from("post_reactions")
      .select("type")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setUserReactions(new Set(data.map(r => r.type)));
      });
  }, [postId, userId]);

  const handleReact = async (type) => {
    if (!userId || !postId) return;
    const wasActive = userReactions.has(type);

    // Mise à jour optimiste
    setCounts(prev => {
      const next = { ...prev };
      next[type] = wasActive ? Math.max(0, (next[type] || 1) - 1) : (next[type] || 0) + 1;
      return next;
    });
    setUserReactions(prev => {
      const next = new Set(prev);
      wasActive ? next.delete(type) : next.add(type);
      return next;
    });

    if (wasActive) {
      const { error } = await supabase.from("post_reactions").delete()
        .eq("post_id", postId).eq("user_id", userId).eq("type", type);
      if (error) console.error("❌ DELETE reaction:", error);
    } else {
      const { error } = await supabase.from("post_reactions")
        .insert({ post_id: postId, user_id: userId, type });
      if (error) {
        console.error("❌ INSERT reaction:", error);
      } else {
        console.log("✅ Réaction sauvegardée:", type, "postId:", postId, "userId:", userId);
        // +2 XP à l'auteur du post + notification
        if (authorId && authorId !== userId) {
          // Ajout correct via addXP (met à jour xp + level + xp_log)
          addXP(authorId, 2, "reaction_received");
          // Notif pour l'auteur du post (une seule par type pour ce post)
          supabase.from("notifications").upsert(
            { user_id: authorId, from_user_id: userId, type, reference_id: postId, read: false },
            { onConflict: "user_id,from_user_id,type,reference_id", ignoreDuplicates: true }
          ).then(() => {});
        }
      }
    }
  };

  // Réactions avec au moins 1 vote
  const activeTypes = REACTIONS.filter(r => (counts[r.type] || 0) > 0);
  const totalReactions = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <>
      {reactorsFor && (
        <ReactorsModal postId={postId} reactionType={reactorsFor} onClose={() => setReactorsFor(null)} />
      )}

      {/* ── Boutons de réaction ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: activeTypes.length > 0 ? 8 : 0 }}>
        {REACTIONS.map(r => {
          const active = userReactions.has(r.type);
          return (
            <AuthGate key={r.type} user={user} onSuccess={() => handleReact(r.type)}>
              <button
                onClick={() => handleReact(r.type)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "6px 12px", borderRadius: 20,
                  border: `1.5px solid ${active ? C.accent : C.border}`,
                  background: active ? C.accent : C.pill,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                  boxShadow: active ? "0 2px 8px rgba(255,87,51,0.25)" : "none",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>{r.emoji}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, lineHeight: 1,
                  color: active ? "#fff" : C.ink2,
                }}>{r.label}</span>
              </button>
            </AuthGate>
          );
        })}
      </div>

      {/* ── Compteurs sous les boutons (style dialogue) ── */}
      {activeTypes.length > 0 && (
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          padding: "8px 12px", borderRadius: 14,
          background: C.bg, border: `1px solid ${C.border}`,
        }}>
          {activeTypes.map(r => {
            const count = counts[r.type] || 0;
            const active = userReactions.has(r.type);
            return (
              <div
                key={r.type}
                onClick={() => setReactorsFor(r.type)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14 }}>{r.emoji}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: active ? C.accent : C.ink,
                }}>{count}</span>
                <span style={{ fontSize: 11, color: C.ink2 }}>{r.label}</span>
                {r !== activeTypes[activeTypes.length - 1] && (
                  <span style={{ fontSize: 10, color: C.border, marginLeft: 2 }}>·</span>
                )}
              </div>
            );
          })}
          <span style={{ fontSize: 11, color: C.ink2, marginLeft: "auto" }}>
            {totalReactions} réaction{totalReactions > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </>
  );
}

// ─── LIGHTBOX ───
function Lightbox({ src, alt, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        background: "rgba(255,255,255,0.15)", border: "none",
        color: "#fff", fontSize: 20, width: 38, height: 38,
        borderRadius: "50%", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>✕</button>
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "100%", maxHeight: "90vh",
          objectFit: "contain", borderRadius: 12,
        }}
      />
    </div>
  );
}

// ─── RENDU TEXTE AVEC LIENS CLIQUABLES ───
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
function renderTextWithLinks(text) {
  if (!text) return null;
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{ color: "#FF5733", textDecoration: "underline", wordBreak: "break-all" }}>
        {part}
      </a>
    ) : part
  );
}

function LinkPreviewCard({ url }) {
  let domain = "";
  try { domain = new URL(url).hostname.replace("www.", ""); } catch {}
  const isYoutube = domain.includes("youtube") || domain.includes("youtu.be");
  const isInsta = domain.includes("instagram");
  const isFacebook = domain.includes("facebook");
  const icon = isYoutube ? "▶️" : isInsta ? "📸" : isFacebook ? "📘" : "🔗";
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#F5F2EE", borderRadius: 12, padding: "10px 12px",
        marginTop: 8, textDecoration: "none",
        border: "1px solid rgba(26,23,20,0.08)",
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1714", marginBottom: 1 }}>
          {domain || "Voir le lien"}
        </div>
        <div style={{ fontSize: 10, color: "#6B6560", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url}
        </div>
      </div>
      <span style={{ fontSize: 14, color: "#6B6560", flexShrink: 0 }}>›</span>
    </a>
  );
}

// ─── POST CARD RÉEL (Supabase) ───
function PostCard({ post, setPage, userId, setSelectedVoisinId, user, requireAuth }) {
  const [lightbox, setLightbox] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwnPost = post.author_id === userId;

  useEffect(() => {
    if (!userId || isOwnPost || !post.author_id) return;
    supabase.from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .eq("following_id", post.author_id)
      .maybeSingle()
      .then(({ data }) => setFollowed(!!data));
  }, [userId, post.author_id]);

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) { requireAuth?.(() => {}); return; }
    const prev = followed;
    setFollowed(!prev);
    if (prev) {
      const { error } = await supabase.from("follows").delete()
        .eq("follower_id", userId).eq("following_id", post.author_id);
      if (error) setFollowed(prev);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: userId, following_id: post.author_id });
      if (error) { setFollowed(prev); return; }
      supabase.from("notifications").insert({
        user_id: post.author_id, from_user_id: userId, type: "follow", read: false,
      }).then(() => {});
    }
  };

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return diff + "min";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return Math.floor(diff / 1440) + "j";
  };

  return (
    <>
      {lightbox && post.image_url && <Lightbox src={post.image_url} alt={post.content} onClose={() => setLightbox(false)} />}
      <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
        {/* Header — gauche cliquable, droite bouton suivre */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 8px" }}>
          {/* Partie gauche cliquable → profil */}
          <div
            onClick={() => {
              if (post.author_id === userId) {
                setPage("profil");
              } else {
                requireAuth?.(() => {
                  setSelectedVoisinId?.(post.author_id);
                  setPage("voisins");
                }) ?? (setSelectedVoisinId?.(post.author_id), setPage("voisins"));
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer", minWidth: 0 }}
          >
            <Avatar pseudo={post.profiles?.pseudo} avatarUrl={post.profiles?.avatar_url} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700 }}>{post.profiles?.pseudo || "Voisin·e"}</span>
                {["magasin", "artisan", "commercant"].includes(post.profiles?.role) && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                    background: post.profiles.role === "artisan" ? "#F5F3FF" : "#EBF5F0",
                    color: post.profiles.role === "artisan" ? "#7C3AED" : "#0A3D2E",
                  }}>
                    {post.profiles.role === "artisan" ? "🎨 Artisan" : "🏪 Commerçant"}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: C.ink2 }}>{post.location || "Saint-Dié"} · {timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          {/* Icône profil — uniquement si ce n'est pas notre propre post */}
          {!isOwnPost && (
            <div style={{ position: "relative", flexShrink: 0, marginLeft: 8 }}>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: `1.5px solid ${C.border}`,
                  background: C.pill, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15,
                }}
              >👤</button>
              {menuOpen && (
                <>
                  {/* Overlay transparent pour fermer */}
                  <div
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
                    style={{ position: "fixed", inset: 0, zIndex: 99 }}
                  />
                  <div style={{
                    position: "absolute", top: 38, right: 0, zIndex: 100,
                    background: C.card, borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    overflow: "hidden", minWidth: 160,
                  }}>
                    <div
                      onClick={e => {
                        e.stopPropagation(); setMenuOpen(false);
                        if (user) {
                          setSelectedVoisinId?.(post.author_id);
                          setPage("voisins");
                        } else {
                          requireAuth?.(() => {
                            setSelectedVoisinId?.(post.author_id);
                            setPage("voisins");
                          });
                        }
                      }}
                      style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}
                    >👁️ Voir le compte</div>
                    <div
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); handleFollow(e); }}
                      style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: followed ? C.ink2 : C.accent, display: "flex", alignItems: "center", gap: 8 }}
                    >{followed ? "✓ Suivi" : "➕ Suivre le compte"}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Image si présente */}
        {post.image_url && (() => {
          const ribbon = post.defi_id
            ? { label: "🏆 Défi",     bg: "rgba(180,83,9,0.88)"   }
            : post.post_type === "decouverte"
            ? { label: "🛍️ Chope",   bg: "rgba(255,87,51,0.88)"  }
            : post.post_type === "lieu"
            ? { label: "📍 Lieu",     bg: "rgba(10,61,46,0.88)"   }
            : post.post_type === "bonplan"
            ? { label: "💸 Bon plan", bg: "rgba(91,33,182,0.88)"  }
            : null;
          return (
            <div onClick={() => setLightbox(true)} style={{ width: "100%", paddingTop: "80%", position: "relative", cursor: "zoom-in", overflow: "hidden" }}>
              <img src={post.image_url} alt={post.content} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Ruban diagonal en coin */}
              {ribbon && (
                <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, overflow: "hidden", pointerEvents: "none" }}>
                  <div style={{
                    position: "absolute", top: 20, right: -28, width: 120,
                    background: ribbon.bg,
                    backdropFilter: "blur(4px)",
                    transform: "rotate(45deg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "5px 0",
                    fontSize: 10, fontWeight: 600, color: "#fff",
                    letterSpacing: 0.3,
                  }}>{ribbon.label}</div>
                </div>
              )}
              {post.vote_count !== undefined && (
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(26,23,20,0.55)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10 }}>
                  🗳️ {post.vote_count} vote{post.vote_count !== 1 ? "s" : ""}
                </div>
              )}
              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,23,20,0.45)", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 10 }}>🔍 Agrandir</div>
            </div>
          );
        })()}
        {/* Bandeau "Je cherche" */}
        {post.post_type === "recherche" && (
          <div style={{ margin: "0 12px 6px", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0369A1" }}>Je cherche</span>
            <span style={{ fontSize: 10, color: "#0369A1", opacity: 0.7 }}>— aide ce voisin !</span>
          </div>
        )}
        {/* Tag commerce lié */}
        {post.magasin_nom && (
          <div style={{ margin: "0 12px 6px", display: "inline-flex", alignItems: "center", gap: 5,
            background: post.linked_status === "accepted" ? "rgba(10,61,46,0.07)" : "rgba(255,87,51,0.07)",
            border: `1px solid ${post.linked_status === "accepted" ? "rgba(10,61,46,0.2)" : "rgba(255,87,51,0.2)"}`,
            borderRadius: 10, padding: "4px 10px" }}>
            <span style={{ fontSize: 12 }}>🏪</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: post.linked_status === "accepted" ? "#0A3D2E" : "#FF5733" }}>
              {post.magasin_nom}
            </span>
            {post.linked_status !== "accepted" && (
              <span style={{ fontSize: 9, color: "#FF5733", opacity: 0.7 }}>· en attente</span>
            )}
          </div>
        )}
        {/* Contenu */}
        <div style={{ padding: "10px 12px 6px" }}>
          {post.content
            ? <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>{renderTextWithLinks(post.content)}</div>
            : post.image_url && <div style={{ fontSize: 11, color: C.ink2, fontStyle: "italic", marginBottom: 6 }}>📷 Photo sans description</div>
          }
          {post.link_url && <LinkPreviewCard url={post.link_url} />}
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {post.tags.filter(t => t !== "Je cherche 🔍").map(t => <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>)}
            </div>
          )}
        </div>
        {/* Actions — masquées pour "Je cherche" */}
        {post.post_type !== "recherche" && (
          <div style={{ padding: "8px 12px 10px" }}>
            <Reactions postId={post.id} userId={userId} authorId={post.author_id || post.profiles?.id} user={user} />
          </div>
        )}
        {/* Section recommandations pour "Je cherche" */}
        {post.post_type === "recherche" && (
          <RechercheRecommandations post={post} user={user} requireAuth={requireAuth} />
        )}
      </div>
    </>
  );
}


// ─── RECOMMANDATIONS SUR "JE CHERCHE" ───
function RechercheRecommandations({ post, user, requireAuth }) {
  const [recs, setRecs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [merchants, setMerchants]   = useState([]);
  const [search, setSearch]         = useState("");
  const [myVotes, setMyVotes]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dupError, setDupError]     = useState("");
  const isAuthor = user?.id === post.author_id;

  const normalize = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  const loadRecs = async () => {
    const { data, error } = await supabase
      .from("post_recommendations")
      .select("*, profiles!post_recommendations_user_id_fkey(pseudo, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (error) {
      // fallback : requête sans join si le FK name ne correspond pas
      const { data: d2 } = await supabase
        .from("post_recommendations")
        .select("id, post_id, user_id, magasin_id, magasin_nom, created_at")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
      if (!d2) { setLoading(false); return; }
      const ids = d2.map(r => r.id);
      let votes = [];
      if (ids.length > 0) {
        const { data: vd } = await supabase
          .from("recommendation_votes").select("recommendation_id, vote")
          .in("recommendation_id", ids);
        votes = vd || [];
      }
      setRecs(d2.map(r => ({
        ...r,
        profiles: null,
        up_count:   votes.filter(v => v.recommendation_id === r.id && v.vote === "up").length,
        down_count: votes.filter(v => v.recommendation_id === r.id && v.vote === "down").length,
      })));
      setLoading(false);
      return;
    }
    if (!data) { setLoading(false); return; }
    const ids = data.map(r => r.id);
    let votes = [];
    if (ids.length > 0) {
      const { data: vd } = await supabase
        .from("recommendation_votes").select("recommendation_id, vote")
        .in("recommendation_id", ids);
      votes = vd || [];
    }
    setRecs(data.map(r => ({
      ...r,
      up_count:   votes.filter(v => v.recommendation_id === r.id && v.vote === "up").length,
      down_count: votes.filter(v => v.recommendation_id === r.id && v.vote === "down").length,
    })));
    setLoading(false);
  };

  const loadMyVotes = async () => {
    const { data } = await supabase.from("recommendation_votes")
      .select("recommendation_id, vote").eq("user_id", user.id);
    if (data) {
      const m = {};
      data.forEach(v => { m[v.recommendation_id] = v.vote; });
      setMyVotes(m);
    }
  };

  useEffect(() => { loadRecs(); }, [post.id]);
  useEffect(() => { if (user?.id) loadMyVotes(); }, [user?.id]);

  // IDs et noms déjà recommandés pour CE post (pour éviter les doublons)
  const recommendedIds  = new Set(recs.filter(r => r.magasin_id).map(r => r.magasin_id));
  const recommendedNoms = recs.map(r => normalize(r.magasin_nom));

  const handleOpenPicker = () => {
    if (!user) { requireAuth?.(() => {}); return; }
    if (!merchants.length) {
      supabase.from("profiles").select("id, pseudo, avatar_url")
        .in("role", ["magasin", "artisan"])
        .neq("pseudo", "[Compte supprimé]")
        .not("pseudo", "is", null)
        .order("pseudo")
        .then(({ data }) => setMerchants((data || []).filter(m => m.pseudo && m.pseudo !== "[Compte supprimé]")));
    }
    setDupError(""); setShowPicker(true);
  };

  const handleRecommend = async (magasinId, magasinNom) => {
    if (!user?.id || submitting) return;
    // Bloquer si ce commerce est déjà recommandé sur ce post
    if (magasinId && recommendedIds.has(magasinId)) {
      setDupError("Ce commerce a déjà été recommandé pour ce post."); return;
    }
    if (recommendedNoms.includes(normalize(magasinNom))) {
      setDupError(`"${magasinNom}" a déjà été recommandé pour ce post.`); return;
    }
    setSubmitting(true);
    const isFirst = recs.length === 0;
    const { error } = await supabase.from("post_recommendations").insert({
      post_id: post.id, user_id: user.id,
      magasin_id: magasinId || null, magasin_nom: magasinNom,
    });
    setSubmitting(false);
    if (error) {
      console.error("post_recommendations insert error:", error);
      if (error.code === "23505") {
        setDupError("Tu as déjà fait une recommandation pour ce post.");
      } else {
        setDupError("Erreur : " + (error.message || "impossible d'enregistrer la recommandation."));
      }
      return;
    }
    if (isFirst) addXP(user.id, 5, "premiere_recommandation");
    setShowPicker(false); setSearch(""); setDupError("");
    loadRecs();
    if (user?.id) loadMyVotes();
  };

  const handleVote = async (recId, voteType) => {
    if (!user) { requireAuth?.(() => {}); return; }
    const prev = myVotes[recId];
    if (prev === voteType) {
      await supabase.from("recommendation_votes")
        .delete().eq("recommendation_id", recId).eq("user_id", user.id);
      setMyVotes(m => { const n = { ...m }; delete n[recId]; return n; });
    } else {
      await supabase.from("recommendation_votes")
        .upsert({ recommendation_id: recId, user_id: user.id, vote: voteType },
          { onConflict: "recommendation_id,user_id" });
      setMyVotes(m => ({ ...m, [recId]: voteType }));
    }
    loadRecs();
  };

  const myRec = recs.find(r => r.user_id === user?.id);

  // Liste filtrée : exclut les commerces déjà recommandés + applique la recherche
  const filtered = merchants.filter(m => {
    if (recommendedIds.has(m.id)) return false; // déjà recommandé → masqué
    if (search.trim()) return normalize(m.pseudo).includes(normalize(search));
    return true;
  });

  // Pour la saisie libre : vérifier si le nom est déjà utilisé
  const freeTextAlreadyUsed = search.trim() && recommendedNoms.includes(normalize(search.trim()));

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 12px 12px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: recs.length > 0 ? 8 : 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#0369A1" }}>
          🤝 {loading ? "…" : recs.length === 0 ? "Sois le premier à recommander !" : `${recs.length} recommandation${recs.length > 1 ? "s" : ""}`}
        </div>
        {!isAuthor && !myRec && !showPicker && (
          <button onClick={handleOpenPicker} style={{
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
            border: "none", background: "#0EA5E9", color: "#fff",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>+ Je recommande{recs.length === 0 ? " · +5 XP ⚡" : ""}</button>
        )}
      </div>

      {/* Liste des recommandations — chacune avec ses propres 👍/👎 */}
      {recs.map(rec => {
        const isOwn = rec.user_id === user?.id;
        return (
          <div key={rec.id} style={{
            background: isOwn ? "#EFF6FF" : C.pill,
            borderRadius: 12, padding: "8px 10px", marginBottom: 6,
          }}>
            {/* Ligne commerce + auteur */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isOwn ? 0 : 6 }}>
              <span style={{ fontSize: 18 }}>🏪</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.magasin_nom}</div>
                <div style={{ fontSize: 10, color: C.ink2 }}>recommandé par {rec.profiles?.pseudo || "Voisin·e"}</div>
              </div>
              {isOwn && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: "#0369A1", fontWeight: 600, background: "#DBEAFE", padding: "2px 8px", borderRadius: 8 }}>Ma reco</span>
                  <button onClick={async () => {
                    await supabase.from("post_recommendations").delete().eq("id", rec.id).eq("user_id", user.id);
                    loadRecs();
                  }} style={{
                    fontSize: 11, color: "#E53935", background: "none", border: "none",
                    cursor: "pointer", padding: "2px 4px", lineHeight: 1,
                  }} title="Supprimer ma recommandation">✕</button>
                </div>
              )}
            </div>
            {/* Votes 👍/👎 — visibles sur toutes les recos sauf la sienne (elle est déjà votée implicitement) */}
            {!isOwn && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleVote(rec.id, "up")} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  background: myVotes[rec.id] === "up" ? "#D1FAE5" : C.card,
                  border: `1.5px solid ${myVotes[rec.id] === "up" ? "#34C759" : C.border}`,
                  borderRadius: 10, padding: "5px 0", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, color: myVotes[rec.id] === "up" ? "#16a34a" : C.ink2,
                  transition: "all 0.15s",
                }}>👍 {rec.up_count || 0}</button>
                <button onClick={() => handleVote(rec.id, "down")} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  background: myVotes[rec.id] === "down" ? "#FEE2E2" : C.card,
                  border: `1.5px solid ${myVotes[rec.id] === "down" ? "#E53935" : C.border}`,
                  borderRadius: 10, padding: "5px 0", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, color: myVotes[rec.id] === "down" ? "#E53935" : C.ink2,
                  transition: "all 0.15s",
                }}>👎 {rec.down_count || 0}</button>
              </div>
            )}
            {/* Afficher les compteurs même sur sa propre reco */}
            {isOwn && (rec.up_count > 0 || rec.down_count > 0) && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#16a34a" }}>👍 {rec.up_count || 0}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#E53935" }}>👎 {rec.down_count || 0}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Picker inline */}
      {showPicker && (
        <div style={{ background: C.card, borderRadius: 12, border: "1.5px solid #0EA5E9", marginTop: 8, overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
            <input
              autoFocus
              value={search}
              onChange={() => { setDupError(""); }}
              onInput={e => setSearch(e.target.value)}
              placeholder="Chercher ou taper le nom du commerce…"
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 10px",
                borderRadius: 10, border: `1px solid ${C.border}`,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: C.ink, background: C.bg, outline: "none",
              }}
            />
          </div>
          {dupError && (
            <div style={{ padding: "6px 14px", background: "#FEF2F2", fontSize: 11, color: "#E53935", fontWeight: 600 }}>⚠️ {dupError}</div>
          )}
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {filtered.length > 0 ? filtered.map((m, i) => (
              <div key={m.id} onClick={() => handleRecommend(m.id, m.pseudo)} style={{
                padding: "9px 14px", cursor: "pointer",
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                fontSize: 12, fontWeight: 600, color: C.ink,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 14 }}>🏪</span>
                }
                {m.pseudo}
              </div>
            )) : search.trim() ? (
              <div style={{ padding: "10px 14px" }}>
                {freeTextAlreadyUsed ? (
                  <div style={{ fontSize: 11, color: "#E53935", fontWeight: 600 }}>⚠️ Ce commerce a déjà été recommandé.</div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: C.ink2, marginBottom: 8 }}>Pas encore inscrit sur Chipeur.</div>
                    <button onClick={() => handleRecommend(null, search.trim())} disabled={submitting} style={{
                      width: "100%", background: "#EFF6FF", border: "1.5px solid #0EA5E9",
                      borderRadius: 10, padding: "8px", fontSize: 12, fontWeight: 700,
                      color: "#0369A1", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>Recommander "{search.trim()}"</button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ padding: "12px 14px", fontSize: 12, color: C.ink2 }}>
                {merchants.length === 0 ? "Aucun commerce inscrit pour l'instant" : "Tous les commerces ont déjà été recommandés !"}
              </div>
            )}
          </div>
          <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => { setShowPicker(false); setSearch(""); setDupError(""); }} style={{
              width: "100%", background: C.pill, border: "none", borderRadius: 10,
              padding: "7px", fontSize: 12, color: C.ink2, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TU VALIDES ?! — NOTIF BANNER ───
function TuValidesNotif({ user }) {
  const [post, setPost] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => safeStorage.getItem("chipeur_tuvalides_notif_off") === "1"
  );

  useEffect(() => {
    if (dismissed) return;
    const lastSeen = safeStorage.getItem("chipeur_tuvalides_last_seen") || "";
    supabase.from("posts")
      .select("id, created_at, profiles(pseudo), tags, image_url")
      .eq("post_type", "tuvalides")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (!lastSeen || data.created_at > lastSeen) setPost(data);
      });
  }, [dismissed]);

  if (dismissed || !post) return null;

  return (
    <div style={{
      background: "#8B5CF6",
      borderRadius: 14, padding: "10px 14px", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>🤔</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
          {post.profiles?.pseudo} a posté un « Tu valides ?! »
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
          {post.tags?.[0] ? post.tags[0] + " · " : ""}Donne ton avis !
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <button onClick={() => {
          safeStorage.setItem("chipeur_tuvalides_last_seen", post.created_at);
          setPost(null);
        }} style={{
          background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 20,
          padding: "4px 10px", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer",
        }}>✕</button>
        <button onClick={() => {
          safeStorage.setItem("chipeur_tuvalides_notif_off", "1");
          setDismissed(true);
        }} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.7)",
          fontSize: 9, cursor: "pointer", padding: "2px 0", fontFamily: "'DM Sans', sans-serif",
        }}>Ne plus m'alerter</button>
      </div>
    </div>
  );
}

// ─── TU VALIDES ?! — CARD ───
function TuValidesCard({ post, user }) {
  const [ouiCount, setOuiCount] = useState(0);
  const [nonCount, setNonCount] = useState(0);
  const [myVote, setMyVote] = useState(null); // "tv_oui" | "tv_non" | null

  useEffect(() => {
    supabase.from("post_reactions")
      .select("type, user_id")
      .eq("post_id", post.id)
      .in("type", ["tv_oui", "tv_non"])
      .then(({ data }) => {
        let oui = 0, non = 0;
        (data || []).forEach(r => {
          if (r.type === "tv_oui") oui++;
          else non++;
          if (user?.id && r.user_id === user.id) setMyVote(r.type);
        });
        setOuiCount(oui);
        setNonCount(non);
      });
  }, [post.id, user?.id]);

  const handleVote = async (type) => {
    if (!user?.id) return;
    const prev = myVote;
    // Optimistic update
    if (prev === type) {
      setMyVote(null);
      if (type === "tv_oui") setOuiCount(c => Math.max(0, c - 1));
      else setNonCount(c => Math.max(0, c - 1));
    } else {
      if (prev) {
        if (prev === "tv_oui") setOuiCount(c => Math.max(0, c - 1));
        else setNonCount(c => Math.max(0, c - 1));
      }
      setMyVote(type);
      if (type === "tv_oui") setOuiCount(c => c + 1);
      else setNonCount(c => c + 1);
    }
    // Supprimer l'ancien vote, puis insérer le nouveau si différent
    await supabase.from("post_reactions")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .in("type", ["tv_oui", "tv_non"]);
    if (prev !== type) {
      await supabase.from("post_reactions")
        .insert({ post_id: post.id, user_id: user.id, type });
    }
  };

  const total = ouiCount + nonCount;
  const ouiPct = total > 0 ? Math.round((ouiCount / total) * 100) : 50;

  return (
    <div style={{
      background: C.card, borderRadius: 18,
      border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 10,
    }}>
      {post.image_url && (
        <div style={{ width: "100%", paddingTop: "65%", position: "relative", overflow: "hidden" }}>
          <img src={post.image_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Author badge */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            borderRadius: 20, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>👤 {post.profiles?.pseudo || "Voisin·e"}</div>
          {/* Category chips overlay */}
          {post.tags?.length > 0 && (
            <div style={{ position: "absolute", bottom: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {post.tags.map(t => (
                <span key={t} style={{
                  background: "rgba(139,92,246,0.85)", color: "#fff",
                  fontSize: 10, fontWeight: 700, padding: "3px 8px",
                  borderRadius: 10, backdropFilter: "blur(4px)",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: "12px 14px" }}>
        {!post.image_url && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>
              👤 {post.profiles?.pseudo || "Voisin·e"}
            </span>
            {post.tags?.map(t => (
              <span key={t} style={{ background: "#F5F3FF", color: "#7C3AED", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 10 }}>{t}</span>
            ))}
          </div>
        )}
        {post.content && (
          <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, marginBottom: 10 }}>{post.content}</div>
        )}
        {/* Barre de progression */}
        {total > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.ink2, marginBottom: 4 }}>
              <span style={{ color: "#16A34A", fontWeight: 700 }}>✅ Oui {ouiPct}%</span>
              <span>{total} vote{total > 1 ? "s" : ""}</span>
              <span style={{ color: "#DC2626", fontWeight: 700 }}>❌ Non {100 - ouiPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#FFE4E4", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${ouiPct}%`,
                background: "linear-gradient(90deg,#22C55E,#86EFAC)",
                borderRadius: 3, transition: "width 0.4s",
              }} />
            </div>
          </div>
        )}
        {/* Boutons vote */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={() => handleVote("tv_oui")} style={{
            border: "none", borderRadius: 14, padding: "12px 0",
            background: myVote === "tv_oui" ? "#22C55E" : "#F0FDF4",
            color: myVote === "tv_oui" ? "#fff" : "#16A34A",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            boxShadow: myVote === "tv_oui" ? "0 4px 12px rgba(34,197,94,0.35)" : "none",
          }}>
            ✅ Oui{ouiCount > 0 ? ` (${ouiCount})` : ""}
          </button>
          <button onClick={() => handleVote("tv_non")} style={{
            border: "none", borderRadius: 14, padding: "12px 0",
            background: myVote === "tv_non" ? "#EF4444" : "#FFF1F2",
            color: myVote === "tv_non" ? "#fff" : "#DC2626",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            boxShadow: myVote === "tv_non" ? "0 4px 12px rgba(239,68,68,0.35)" : "none",
          }}>
            ❌ Non{nonCount > 0 ? ` (${nonCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BANDEAU CLASSEMENT DU MOIS ─────────────────────────────────────────────
const MEDALS = ["🥇", "🥈", "🥉"];
const MONTH_NAMES = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

function BandeauClassement({ user, setSelectedVoisinId, setPage }) {
  const [top, setTop] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [open, setOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthLabel = MONTH_NAMES[new Date().getMonth()];

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, pseudo, avatar_url, xp_month, xp_month_label")
      .eq("xp_month_label", currentMonth)
      .neq("pseudo", "[Compte supprimé]")
      .gt("xp_month", 0)
      .order("xp_month", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) return;
        setTop(data);
        if (user?.id) {
          const rank = data.findIndex(p => p.id === user.id);
          setMyRank(rank >= 0 ? rank + 1 : null);
        }
      });
  }, [user?.id]);

  if (top.length === 0) return null;

  const topThree = top.slice(0, 3);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header cliquable */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: C.ink, borderRadius: 18,
          padding: "12px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: syne, fontWeight: 600, fontSize: 13, color: "#fff" }}>
            🏆 Classement de {monthLabel}
          </div>
          <div style={{ fontFamily: dm, fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            {myRank ? `Tu es ${myRank}${myRank === 1 ? "er" : "e"} · ` : ""}Top {topThree.length} du mois
          </div>
        </div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>{open ? "▲" : "▼"}</div>
      </div>

      {/* Podium déroulé */}
      {open && (
        <div style={{
          background: C.card, borderRadius: "0 0 18px 18px",
          border: `1px solid ${C.border}`, borderTop: "none",
          padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10,
        }}>
          {top.slice(0, 5).map((p, i) => {
            const isMe = p.id === user?.id;
            return (
              <div
                key={p.id}
                onClick={() => { if (p.id !== user?.id) { setSelectedVoisinId(p.id); setPage("voisins"); } else setPage("profil"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: isMe ? "rgba(255,87,51,0.06)" : "transparent",
                  borderRadius: 12, padding: "6px 8px", cursor: "pointer",
                  border: isMe ? `1px solid rgba(255,87,51,0.2)` : "1px solid transparent",
                }}
              >
                <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 18, width: 28, textAlign: "center" }}>
                  {i < 3 ? MEDALS[i] : `${i + 1}.`}
                </div>
                {p.avatar_url
                  ? <img src={p.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>
                    {p.pseudo}{isMe ? " (toi)" : ""}
                  </div>
                </div>
                <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 13, color: C.accent }}>
                  ⚡ {p.xp_month} XP gloire
                </div>
              </div>
            );
          })}

          {/* Message lot */}
          <div style={{
            background: "rgba(255,87,51,0.06)", border: "1px dashed rgba(255,87,51,0.25)",
            borderRadius: 12, padding: "10px 12px", marginTop: 4,
          }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 11, color: C.accent, marginBottom: 3 }}>
              🎁 Lot du mois
            </div>
            <div style={{ fontFamily: dm, fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>
              Le voisin le plus actif de {monthLabel} gagne une surprise offerte par nos partenaires locaux. Sois le plus actif !
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BANDEAU INCITATION XP SHOP ───
function BandeauXPShop({ setPage, user, profile }) {
  const isMagasin = ["magasin", "artisan", "commercant"].includes(profile?.role);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user && !isMagasin && safeStorage.getItem("chipeur_xpshop_hint_v2") !== "1") {
      setVisible(true);
    }
  }, [user, isMagasin]);

  if (!visible) return null;

  return (
    <div style={{
      background: "#FF5733",
      borderRadius: 18, padding: "14px 16px", margin: "8px 0",
      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
    }} onClick={() => { setPage("nouveau"); }}>
      <div style={{ fontSize: 32, flexShrink: 0 }}>🎁</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 3 }}>
          Gagne des bons d'achat !
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>
          Prends en photo un article d'un commerce local et relie-le. Si le commerçant valide → tu gagnes des XP Shop utilisables en bon d'achat uniquement chez lui. 📸
        </div>
        <div style={{
          display: "inline-block", marginTop: 8,
          background: "rgba(255,255,255,0.25)", borderRadius: 10,
          padding: "4px 10px", fontFamily: "'Syne', sans-serif",
          fontWeight: 700, fontSize: 11, color: "#fff",
        }}>
          Poster maintenant →
        </div>
      </div>
      <div
        onClick={e => { e.stopPropagation(); safeStorage.setItem("chipeur_xpshop_hint_v2", "1"); setVisible(false); }}
        style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", flexShrink: 0, padding: 4, cursor: "pointer" }}
      >✕</div>
    </div>
  );
}

// ─── TU VALIDES ?! — BANDEAU ───
function BandeauTuValides({ user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase.from("posts")
      .select("id, content, image_url, created_at, tags, profiles(pseudo, avatar_url)")
      .eq("post_type", "tuvalides")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data || []));
  }, []);

  if (posts.length === 0) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase",
        letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
      }}>
        🤔 Tu valides !!!
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      {posts.map(p => <TuValidesCard key={p.id} post={p} user={user} />)}
    </div>
  );
}

// ─── BOTTOM NAV ───
function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Évén." },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{
      height: 80, background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {items.map(item => {
        if (item.isFab) {
          return (
            <div key="fab" onClick={onFab} style={{
              width: 50, height: 50, borderRadius: 25, background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div>
          );
        }
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, fontSize: 9, color: active === item.id ? C.accent : C.ink2, cursor: "pointer",
          }}>
            <div style={{ fontSize: 18 }}>{item.icon}</div>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Fil({ setPage, profile, user, setSelectedVoisinId, requireAuth, setSelectedSortieId }) {
  const [activeFilters, setActiveFilters] = useState(new Set(["all"]));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Toggle chip : "all" remet à zéro, les autres excluent "all"
  const toggleChip = (id) => {
    setActiveFilters(prev => {
      if (id === "all") return new Set(["all"]);
      const next = new Set(prev);
      next.delete("all");
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) next.add("all"); // si tout décoché → retour "Tout le fil"
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const scrollRef = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (diff > 70) {
      setRefreshing(true);
      loadPosts();
      setTimeout(() => setRefreshing(false), 1200);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setFetchError(null);
    const nearbyOn = activeFilters.has("nearby");

    // ── Filtre "Défis" : photos soumises aux défis + comptage des votes ──
    if (activeFilters.has("defis")) {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(id, pseudo, avatar_url, role), link_url")
        .not("defi_id", "is", null)
        .order("created_at", { ascending: false });
      if (error) setFetchError(error.message);
      const defiPosts = (data || []).filter(p => p.profiles && p.profiles.pseudo !== "[Compte supprimé]");
      // Récupérer le nombre de votes pour chaque photo
      if (defiPosts.length > 0) {
        const ids = defiPosts.map(p => p.id);
        const { data: votesData } = await supabase
          .from("defi_votes").select("post_id").in("post_id", ids);
        const vc = {};
        (votesData || []).forEach(v => { vc[v.post_id] = (vc[v.post_id] || 0) + 1; });
        setPosts(defiPosts.map(p => ({ ...p, vote_count: vc[p.id] || 0 })));
      } else {
        setPosts(defiPosts);
      }
      setLoading(false);
      return;
    }

    // ── Fil normal (exclut defi_photo du flux principal ; tuvalides y apparaît) ──
    const { data: voisinDefis } = await supabase
      .from("defis").select("id").eq("type", "voisin");
    const voisinDefiIds = (voisinDefis || []).map(d => d.id);

    let q = supabase
      .from("posts")
      .select("*, profiles(id, pseudo, avatar_url, role), link_url")
      .neq("post_type", "defi_photo")
      .is("evenement_id", null)
      .or("visibility.is.null,visibility.eq.public") // exclut les posts "vitrine seulement"
      .order("created_at", { ascending: false });
    if (nearbyOn) q = q.in("location", BASIN_CITIES);
    const { data: mainPosts, error } = await q;

    if (error) { setFetchError(error.message); console.error("Posts error:", error); }
    // Filtrer les posts de comptes supprimés
    const filtered = (mainPosts || []).filter(p => p.profiles && p.profiles.pseudo !== "[Compte supprimé]");

    // Enrichir les posts liés à un commerce dont magasin_nom n'est pas encore stocké (anciens posts)
    const needName = [...new Set(filtered.filter(p => p.magasin_id && !p.magasin_nom).map(p => p.magasin_id))];
    if (needName.length > 0) {
      const { data: merchants } = await supabase.from("profiles").select("id, pseudo").in("id", needName);
      const nameMap = {};
      (merchants || []).forEach(m => { nameMap[m.id] = m.pseudo; });
      setPosts(filtered.map(p => (p.magasin_id && !p.magasin_nom && nameMap[p.magasin_id])
        ? { ...p, magasin_nom: nameMap[p.magasin_id] } : p));
    } else {
      setPosts(filtered);
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [activeFilters]);

  // Filtrage client-side selon les chips actifs
  const TYPE_MAP = { chope: "decouverte", lieux: "lieu", je_cherche: "recherche" };
  const activeTypes = Object.entries(TYPE_MAP)
    .filter(([id]) => activeFilters.has(id))
    .map(([, type]) => type);
  const filteredPosts = activeFilters.has("all") || activeTypes.length === 0
    ? posts
    : posts.filter(p => activeTypes.includes(p.post_type));

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      <AppHeader setPage={setPage} profile={profile} user={user} requireAuth={requireAuth} />
      <FilDropdown active={activeFilters} onToggle={toggleChip} setPage={setPage} />
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}
      >
        {refreshing && (
          <div style={{ textAlign: "center", padding: "10px 0 4px", fontSize: 12, color: C.accent, fontWeight: 600 }}>
            ↻ Actualisation…
          </div>
        )}
        <BandeauDefis setPage={setPage} user={user} />
        <BandeauSortiesPhotos setPage={setPage} setSelectedSortieId={setSelectedSortieId} />
        <BandeauXPShop setPage={setPage} user={user} profile={profile} />
        <TuValidesNotif user={user} />
        <BandeauTuValides user={user} />

        {/* Séparateur discret avant le fil de posts */}
        <div style={{ height: 1, background: C.border, margin: "4px 0 8px" }} />

{fetchError && (
          <div style={{ background: "#FFF0EE", border: "1px solid #FF5733", borderRadius: 12, padding: "12px 14px", margin: "8px 0", fontSize: 12, color: "#C0392B" }}>
            ⚠️ Erreur : {fetchError}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>Chargement du fil…</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🫣</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 6 }}>
              {activeFilters.has("all") ? "Le fil est vide pour l'instant" : "Aucun post pour ce filtre pour l'instant"}
            </div>
            <div style={{ fontSize: 13, color: C.ink2 }}>Sois le premier à partager une trouvaille de ton quartier !</div>
          </div>
        ) : (
          filteredPosts.map((post) =>
            post.post_type === "tuvalides"
              ? <TuValidesCard key={post.id} post={post} user={user} />
              : <PostCard key={post.id} post={post} setPage={setPage} userId={user?.id} setSelectedVoisinId={setSelectedVoisinId} user={user} requireAuth={requireAuth} />
          )
        )}
      </div>
      <BottomNav active="fil" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
