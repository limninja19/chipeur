import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { useUnreadNotifs } from "./chipeur_notifications";
import { useUnreadMessages } from "./chipeur_messages";
import { addXP } from "./chipeur_xp";
import AuthGate from "./AuthGate";
import { ChallengeCard } from "./ChallengeUI";
import SwipeVoteModal from "./SwipeVoteModal";

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
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: -0.5, color: "#1A1A2E" }}>
            chi<span style={{ color: C.accent }}>p</span>eur
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: -0.1, color: C.accent, lineHeight: 1.55, marginTop: 2 }}>
            Découvre ta ville,<br />à travers tes voisins
          </div>
          {profile?.pseudo && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.ink2, marginTop: 1 }}>Bonjour {profile.pseudo} 👋</div>}
        </div>
      </div>

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

// ─── FIL DROPDOWN FILTRE (multi-sélection) ───
const CHIPS = [
  { id: "all",        label: "Tout le fil",      nav: null      },
  { id: "nearby",     label: "📍 Autour de moi", nav: null      },
  { id: "chope",      label: "Chope",             nav: null      },
  { id: "lieux",      label: "Lieux",             nav: null      },
  { id: "bons_plans", label: "Bons plans",        nav: null      },
  { id: "defis",      label: "🏆 Défis",          nav: "defis"   },
  { id: "evenements", label: "📅 Événements",     nav: "sorties" },
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
        <span style={{ fontSize: 10, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
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
  const [voteDefi, setVoteDefi] = useState(null); // défi en cours de vote

  useEffect(() => {
    supabase.from("defis").select("*").eq("ended", false)
      .order("created_at", { ascending: false })
      .then(async ({ data: defisData }) => {
        if (!defisData || defisData.length === 0) return;
        const { data: countsData } = await supabase
          .from("posts").select("defi_id, author_id").not("defi_id", "is", null);
        const seen = {};
        (countsData || []).forEach(r => {
          if (!seen[r.defi_id]) seen[r.defi_id] = new Set();
          seen[r.defi_id].add(r.author_id);
        });
        const counts = {};
        Object.keys(seen).forEach(id => { counts[id] = seen[id].size; });

        const mapped = defisData.map((d) => ({
          id:                  d.id,
          title:               d.title,
          merchant_name:       d.description || "",
          category:            EMOJI_TO_CATEGORY[d.emoji] || "Mode",
          city:                "Saint-Dié",
          photo_url:           d.photo_url || null,
          days_remaining:      daysRemaining(d.ends_at),
          participants_count:  counts[d.id] || 0,
          target_count:        d.total_target || 100,
          reward_amount:       extractRewardAmount(d.reward),
          reward_description:  d.reward || "Récompense surprise",
          top_reactions:       [],
          reactions_total:     0,
        }));
        setDefis(mapped);
      });
  }, []);

  if (defis.length === 0) return null;

  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      {/* Modale swipe vote */}
      {voteDefi && (
        <SwipeVoteModal d={voteDefi} user={user} onClose={() => setVoteDefi(null)} />
      )}

      <div style={{
        fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase",
        letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
      }}>
        🏆 Défis en cours
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
        {defis.map(d => (
          <div key={d.id} style={{ flexShrink: 0, width: 160, display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Carte compacte */}
            <div
              onClick={() => setPage("defis")}
              style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 3px 10px rgba(0,0,0,0.08)" }}
            >
              {/* Photo */}
              <div style={{ position: "relative", height: 120 }}>
                {d.photo_url ? (
                  <img src={d.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ height: 120, background: "linear-gradient(135deg,#FF5733,#E94B2C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: "rgba(255,255,255,0.9)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                      {(d.title || "C").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Badge prix */}
                {d.reward_amount && (
                  <div style={{ position: "absolute", top: 8, left: 8, background: "#fff", borderRadius: 8, padding: "4px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
                    <div style={{ fontSize: 7, fontWeight: 800, color: "#E94B2C", letterSpacing: 1 }}>À GAGNER</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#1A1714", lineHeight: 1 }}>{d.reward_amount}</div>
                  </div>
                )}
                {/* Jours restants */}
                <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "3px 7px", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                  ⏱ {d.days_remaining}j
                </div>
              </div>
              {/* Bas de carte : participants + bouton */}
              <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>👥 {d.participants_count}/{d.target_count}</span>
                <span style={{ background: C.accent, color: "#fff", borderRadius: 20, padding: "5px 10px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>Participer →</span>
              </div>
            </div>
            {/* Bouton Voter */}
            <button
              onClick={() => setVoteDefi(d)}
              style={{
                background: "linear-gradient(135deg,#FF5733,#F7A72D)",
                border: "none", borderRadius: 12, padding: "8px 0",
                fontSize: 12, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                width: "100%",
              }}
            >🗳️ Voter</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BANDEAU SORTIES PHOTOS ───
function BandeauSortiesPhotos({ setPage, setSelectedSortieId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Charger les événements des 7 derniers jours + aujourd'hui qui ont des photos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    supabase
      .from("posts")
      .select("id, image_url, evenement_id, sorties:evenement_id(id, title, date_text, type)")
      .not("evenement_id", "is", null)
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        // Grouper les photos par événement
        const byEvent = {};
        data.forEach(post => {
          if (!post.sorties) return;
          const ev = post.sorties;
          // Vérifier que l'événement est dans les 7 derniers jours
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

  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase",
        letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
      }}>
        📸 Souvenirs de sorties
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map(({ ev, photos }) => (
          <div
            key={ev.id}
            onClick={() => { setSelectedSortieId(ev.id); setPage("sorties"); }}
            style={{
              background: C.card, borderRadius: 16, padding: "10px 12px",
              border: `1px solid ${C.border}`, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {/* 2 preview photos */}
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {photos.slice(0, 2).map(p => (
                <div key={p.id} style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: C.pill }}>
                  <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
              {photos.length > 2 && (
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: "linear-gradient(135deg,#FF5733,#F7A72D)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 15,
                }}>
                  +{photos.length - 2}
                </div>
              )}
            </div>
            {/* Texte */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
      .select("profiles:user_id(pseudo, avatar_url)")
      .eq("post_id", postId)
      .eq("type", reactionType)
      .then(({ data }) => {
        setList((data || []).map(r => r.profiles).filter(Boolean));
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
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.pill, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {p.avatar_url
                  ? <img src={p.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🧑"}
              </div>
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
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, overflow: "hidden" }}>
              {post.profiles?.avatar_url
                ? <img src={post.profiles.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : "😊"}
            </div>
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
                {post.defi_id ? (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#FFF8E8", color: "#B45309" }}>🏆 Défi</span>
                ) : post.post_type === "decouverte" ? (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#FFF0EC", color: "#C83E1A" }}>🛍️ Chope</span>
                ) : post.post_type === "lieu" ? (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#EBF5F0", color: "#0A5C36" }}>📍 Lieu</span>
                ) : post.post_type === "bonplan" ? (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#F5F3FF", color: "#5B21B6" }}>💸 Bon plan</span>
                ) : null}
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
        {post.image_url && (
          <div onClick={() => setLightbox(true)} style={{ width: "100%", paddingTop: "80%", position: "relative", cursor: "zoom-in" }}>
            <img src={post.image_url} alt={post.content} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,23,20,0.45)", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 10 }}>🔍 Agrandir</div>
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
              {post.tags.map(t => <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>)}
            </div>
          )}
        </div>
        {/* Actions */}
        <div style={{ padding: "8px 12px 10px" }}>
          <Reactions postId={post.id} userId={userId} authorId={post.author_id || post.profiles?.id} user={user} />
        </div>
      </div>
    </>
  );
}

// ─── FAB MENU OVERLAY ───
function FabMenu({ open, onClose, setPage }) {
  if (!open) return null;
  const items = [
    { icon: "📸", label: "Nouveau post", page: "nouveau" },
    { icon: "📅", label: "Nouvelle sortie", page: "sorties" },
    { icon: "🏆", label: "Créer un défi", page: "defis", pro: true },
  ];
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(26,23,20,0.4)", display: "flex",
      flexDirection: "column", justifyContent: "flex-end",
      padding: "0 0 90px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        display: "flex", flexDirection: "column", gap: 6,
        alignItems: "center", padding: "0 60px 12px",
      }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => { onClose(); setPage(item.page); }} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            background: C.card, border: "none", borderRadius: 14,
            padding: "12px 16px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{item.label}</span>
            {item.pro && (
              <span style={{
                fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro,
                padding: "2px 6px", borderRadius: 6, marginLeft: "auto",
              }}>PRO</span>
            )}
          </button>
        ))}
      </div>
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
  const [fabOpen, setFabOpen] = useState(false);
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
    const nearbyOn = activeFilters.has("nearby");

    // IDs des défis voisins (leurs photos apparaissent dans le fil)
    const { data: voisinDefis } = await supabase
      .from("defis").select("id").eq("type", "voisin");
    const voisinDefiIds = (voisinDefis || []).map(d => d.id);

    // Posts normaux (sans defi_photo, sans événement)
    let q = supabase
      .from("posts")
      .select("*, profiles(id, pseudo, avatar_url, role), link_url")
      .neq("post_type", "defi_photo")
      .is("evenement_id", null)
      .order("created_at", { ascending: false });
    if (nearbyOn) q = q.in("location", BASIN_CITIES);
    const { data: mainPosts, error } = await q;

    // Photos soumises aux défis voisins
    let voisinPosts = [];
    if (voisinDefiIds.length > 0) {
      const { data: vp } = await supabase
        .from("posts")
        .select("*, profiles(id, pseudo, avatar_url, role), link_url")
        .eq("post_type", "defi_photo")
        .in("defi_id", voisinDefiIds)
        .order("created_at", { ascending: false });
      voisinPosts = vp || [];
    }

    // Fusionner et trier par date
    const all = [...(mainPosts || []), ...voisinPosts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (error) { setFetchError(error.message); console.error("Posts error:", error); }
    setPosts(all);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [activeFilters]);

  // Filtrage client-side selon les chips actifs
  const TYPE_MAP = { chope: "decouverte", lieux: "lieu", bons_plans: "bonplan" };
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
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} setPage={setPage} userId={user?.id} setSelectedVoisinId={setSelectedVoisinId} user={user} requireAuth={requireAuth} />
          ))
        )}
      </div>
      {fabOpen && <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} setPage={setPage} />}
      <BottomNav active="fil" onNavigate={setPage} onFab={() => setFabOpen(!fabOpen)} />
    </div>
  );
}
