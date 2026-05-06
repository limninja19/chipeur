import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { useUnreadNotifs } from "./chipeur_notifications";
import { useUnreadMessages } from "./chipeur_messages";
import { addXP } from "./chipeur_xp";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};


// ─── APP HEADER ───
function AppHeader({ setPage, profile, user }) {
  const unreadNotifs = useUnreadNotifs(user?.id);
  const unreadMessages = useUnreadMessages(user?.id);

  const voisins = [
    { emoji: "👩", bg: "#FEF3E0" },
    { emoji: "👩‍🦰", bg: "#F7EEF7" },
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
          <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 7, letterSpacing: 2, color: C.accent, textTransform: "uppercase", lineHeight: 1.2 }}>
            Découvre · Chope · Partage
          </div>
          {profile?.pseudo && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.ink2, marginTop: 1 }}>Bonjour {profile.pseudo} 👋</div>}
        </div>
      </div>

      {/* Droite : avatars voisins + icônes */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Avatars voisins actifs — cliquable → page voisins */}
        <div onClick={() => setPage("voisins")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          {voisins.map((v, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: "50%",
              background: v.bg, border: `2px solid ${C.bg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, marginLeft: i === 0 ? 0 : -8,
              position: "relative", zIndex: 3 - i,
            }}>{v.emoji}</div>
          ))}
        </div>

        {/* Cloche notifications avec badge */}
        <div
          onClick={() => setPage("notifications")}
          style={{ position: "relative", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
        >
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

        {/* Bulle messages avec badge */}
        <div
          onClick={() => setPage("messages")}
          style={{ position: "relative", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
        >
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
    </div>
  );
}

// ─── FIL TABS ───
function FilTabs({ active, onSelect, setPage }) {
  const tabs = [
    { id: "Tout", label: "Tout" },
    { id: "Trouvailles", label: "Trouvailles" },
    { id: "Lieux", label: "Lieux" },
    { id: "Bons plans", label: "Bons plans" },
    { id: "Défis", label: "Défis" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 12px 10px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => t.id === "Défis" ? setPage("defis") : onSelect(t.id)}
          style={{
            fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 20,
            border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            background: active === t.id ? C.ink : C.pill,
            color: active === t.id ? "#fff" : C.ink2,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── FILTRE VILLE TOGGLE ───
function VilleToggle({ filtreVille, setFiltreVille, quartier }) {
  if (!quartier) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 10px", flexShrink: 0 }}>
      <button
        onClick={() => setFiltreVille(false)}
        style={{
          fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 20,
          border: "none", cursor: "pointer", whiteSpace: "nowrap",
          background: !filtreVille ? C.accent : C.pill,
          color: !filtreVille ? "#fff" : C.ink2,
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
        }}>🌍 Tout le fil</button>
      <button
        onClick={() => setFiltreVille(true)}
        style={{
          fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 20,
          border: "none", cursor: "pointer", whiteSpace: "nowrap",
          background: filtreVille ? C.accent : C.pill,
          color: filtreVille ? "#fff" : C.ink2,
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
        }}>📍 {quartier}</button>
    </div>
  );
}

// ─── BANDEAU DÉFIS ───
function DefiCard({ d, setPage }) {
  const pct = Math.round((d.current / d.total) * 100);
  return (
    <div style={{
      flexShrink: 0, width: 190, borderRadius: 18, overflow: "hidden",
      cursor: "pointer", background: d.grad, position: "relative",
    }}>
      {/* Fond décoratif emoji géant */}
      <div style={{
        position: "absolute", right: -8, top: -6,
        fontSize: 64, opacity: 0.15, lineHeight: 1,
        pointerEvents: "none", userSelect: "none",
      }}>{d.icon}</div>

      <div style={{ padding: "12px 12px 10px", position: "relative" }}>
        {/* Ligne haute : XP badge + timer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{
            background: "rgba(255,255,255,0.22)", backdropFilter: "blur(4px)",
            borderRadius: 8, padding: "2px 8px",
            fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3,
          }}>⚡ +{d.xp} XP</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>⏱ {d.timeLeft}</div>
        </div>

        {/* Titre */}
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
          color: "#fff", lineHeight: 1.2, marginBottom: 10,
        }}>{d.title}</div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 6 }}>
          <div style={{
            height: 5, borderRadius: 3,
            background: "rgba(255,255,255,0.25)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${pct}%`,
              background: "rgba(255,255,255,0.85)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              👥 {d.current} participants
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
              objectif {d.total}
            </div>
          </div>
        </div>

        {/* Bouton participer */}
        <button onClick={() => setPage("defis")} style={{
          width: "100%", marginTop: 4,
          padding: "7px 0", borderRadius: 10,
          background: "rgba(255,255,255,0.95)",
          color: d.btnColor, border: "none",
          fontSize: 11, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer", letterSpacing: 0.2,
        }}>Participer →</button>
      </div>
    </div>
  );
}

const DEFI_GRADS = [
  { grad: "linear-gradient(135deg,#FF5733 0%,#FF8C42 100%)", btnColor: "#FF5733" },
  { grad: "linear-gradient(135deg,#7C3AED 0%,#A855F7 100%)", btnColor: "#7C3AED" },
  { grad: "linear-gradient(135deg,#0F766E 0%,#14B8A6 100%)", btnColor: "#0F766E" },
  { grad: "linear-gradient(135deg,#1D4ED8 0%,#3B82F6 100%)", btnColor: "#1D4ED8" },
];

function computeTimeLeftFil(ends_at, ended) {
  if (ended) return "Terminé";
  if (!ends_at) return "En cours";
  const diff = new Date(ends_at) - new Date();
  if (diff <= 0) return "Terminé";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "Dernier jour !";
  return `${days} jours`;
}

function BandeauDefis({ setPage }) {
  const [defis, setDefis] = useState([]);

  useEffect(() => {
    supabase.from("defis").select("*").eq("ended", false)
      .order("created_at", { ascending: false })
      .then(async ({ data: defisData }) => {
        if (!defisData || defisData.length === 0) return;
        const { data: countsData } = await supabase
          .from("posts").select("defi_id, author_id").not("defi_id", "is", null);
        // Participants uniques par défi
        const seen = {};
        (countsData || []).forEach(r => {
          if (!seen[r.defi_id]) seen[r.defi_id] = new Set();
          seen[r.defi_id].add(r.author_id);
        });
        const counts = {};
        Object.keys(seen).forEach(id => { counts[id] = seen[id].size; });
        const mapped = defisData.map((d, i) => {
          const current = counts[d.id] || 0;
          const total = d.total_target || 100;
          const g = DEFI_GRADS[i % DEFI_GRADS.length];
          return {
            id: d.id, icon: d.emoji || "🏆", title: d.title,
            current, total, xp: d.xp || 10,
            timeLeft: computeTimeLeftFil(d.ends_at, d.ended),
            ...g,
          };
        });
        setDefis(mapped);
      });
  }, []);

  if (defis.length === 0) return null;

  return (
    <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase",
        letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
      }}>
        🏆 Défis en cours
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {defis.map((d, i) => <DefiCard key={d.id || i} d={d} setPage={setPage} />)}
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

function Reactions({ postId, userId, authorId }) {
  const [counts, setCounts] = useState({});
  const [userReactions, setUserReactions] = useState(new Set());

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

  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {REACTIONS.map(r => {
        const count = counts[r.type] || 0;
        const active = userReactions.has(r.type);
        return (
          <button
            key={r.type}
            onClick={() => handleReact(r.type)}
            style={{
              padding: "6px 8px", borderRadius: 12,
              border: `1.5px solid ${active ? C.accent : C.border}`,
              background: active ? "#FFF0EB" : "transparent",
              cursor: userId ? "pointer" : "default",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              color: active ? C.accent : C.ink,
              transition: "all 0.15s",
              minWidth: 44,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{r.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.2, color: active ? C.accent : C.ink2 }}>{r.label}</span>
            {count > 0 && (
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? C.accent : C.ink2 }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
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

// ─── POST CARD RÉEL (Supabase) ───
function PostCard({ post, setPage, userId, setSelectedVoisinId }) {
  const [lightbox, setLightbox] = useState(false);
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
        {/* Header — clic sur l'auteur */}
        <div
          onClick={() => {
            if (post.author_id === userId) {
              setPage("profil");
            } else {
              setSelectedVoisinId?.(post.author_id);
              setPage("voisins");
            }
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px", cursor: "pointer" }}
        >
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, overflow: "hidden" }}>
            {post.profiles?.avatar_url
              ? <img src={post.profiles.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : "😊"}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700 }}>{post.profiles?.pseudo || "Voisin·e"}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{post.location || "Saint-Dié"} · {timeAgo(post.created_at)}</div>
          </div>
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
          <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>{post.content}</div>
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {post.tags.map(t => <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>)}
            </div>
          )}
        </div>
        {/* Actions */}
        <div style={{ padding: "8px 12px 10px" }}>
          <Reactions postId={post.id} userId={userId} authorId={post.author_id || post.profiles?.id} />
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
    { id: "sorties", icon: "📅", label: "Sorties" },
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

export default function Fil({ setPage, profile, user, setSelectedVoisinId }) {
  const [activeTab, setActiveTab] = useState("Tout");
  const [fabOpen, setFabOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [filtreVille, setFiltreVille] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  // Mapping onglet → valeur post_type en base
  const TAB_TO_POST_TYPE = {
    "Trouvailles": "decouverte",
    "Lieux": "lieu",
    "Bons plans": "bonplan",
  };

  const loadPosts = () => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select("*, profiles(id, pseudo, avatar_url)")
      .order("created_at", { ascending: false });
    if (filtreVille && profile?.quartier) {
      q = q.eq("location", profile.quartier);
    }
    q.then(({ data, error }) => {
      if (error) { setFetchError(error.message); console.error("Posts error:", error); }
      if (data) setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => { loadPosts(); }, [filtreVille]);

  // Filtrage client-side selon l'onglet actif
  const filteredPosts = activeTab === "Tout" || !TAB_TO_POST_TYPE[activeTab]
    ? posts
    : posts.filter(p => p.post_type === TAB_TO_POST_TYPE[activeTab]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      <AppHeader setPage={setPage} profile={profile} user={user} />
      <FilTabs active={activeTab} onSelect={setActiveTab} setPage={setPage} />
      <VilleToggle filtreVille={filtreVille} setFiltreVille={setFiltreVille} quartier={profile?.quartier} />
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
        <BandeauDefis setPage={setPage} />
{fetchError && (
          <div style={{ background: "#FFF0EE", border: "1px solid #FF5733", borderRadius: 12, padding: "12px 14px", margin: "8px 0", fontSize: 12, color: "#C0392B" }}>
            ⚠️ Erreur : {fetchError}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>Chargement du fil…</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏘️</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 6 }}>
              {activeTab === "Tout" ? "Le fil est vide pour l'instant" : `Aucun post "${activeTab}" pour l'instant`}
            </div>
            <div style={{ fontSize: 13, color: C.ink2 }}>Sois le premier à partager une trouvaille de ton quartier !</div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} setPage={setPage} userId={user?.id} setSelectedVoisinId={setSelectedVoisinId} />
          ))
        )}
      </div>
      {fabOpen && <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} setPage={setPage} />}
      <BottomNav active="fil" onNavigate={setPage} onFab={() => setFabOpen(!fabOpen)} />
    </div>
  );
}
