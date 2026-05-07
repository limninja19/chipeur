import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const NOTIF_CONFIG = {
  like:       { icon: "❤️",  label: "a aimé votre publication" },
  kiffe:      { icon: "🔥",  label: "kiffe votre publication" },
  veux:       { icon: "🛒",  label: "veut votre trouvaille" },
  style:      { icon: "✨",  label: "trouve votre style au top" },
  recommande: { icon: "👍",  label: "recommande votre publication" },
  follow:     { icon: "👥",  label: "vous suit maintenant" },
  defi:       { icon: "🏆",  label: "a participé à votre défi" },
  xp:         { icon: "⭐",  label: "Vous avez gagné des XP" },
  remise:     { icon: "🎁",  label: "a publié une nouvelle remise" },
  message:    { icon: "💬",  label: "vous a envoyé un message" },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff < 60) return diff + " min";
  if (diff < 1440) return Math.floor(diff / 60) + " h";
  const days = Math.floor(diff / 1440);
  if (days < 7) return days + " j";
  return Math.floor(days / 7) + " sem";
}

function NotifItem({ n, setPage, setSelectedVoisinId }) {
  const cfg = NOTIF_CONFIG[n.type] || { icon: "🔔", label: n.message || "Nouvelle notification" };
  const pseudo = n.from_profile?.pseudo || "Quelqu'un";
  const avatar = n.from_profile?.avatar_url;
  const fromId = n.from_profile?.id || n.from_user_id;

  const goToSubject = () => {
    supabase.from("notifications").update({ read: true }).eq("id", n.id).then(() => {});
    if (n.type === "follow") {
      if (fromId) { setSelectedVoisinId?.(fromId); setPage("voisins"); }
    } else if (n.type === "message") {
      setPage("messages");
    } else if (n.type === "remise") {
      setPage("commerces");
    } else if (n.type === "defi") {
      setPage("defis");
    } else {
      // like, kiffe, veux, style, recommande → retour au fil
      setPage("fil");
    }
  };

  const goToProfile = (e) => {
    e.stopPropagation();
    if (!fromId) return;
    setSelectedVoisinId?.(fromId);
    setPage("voisins");
  };

  return (
    <div
      onClick={goToSubject}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        background: n.read ? C.card : "#FFF5F2",
        borderBottom: `1px solid ${C.border}`,
        cursor: "pointer",
      }}
    >
      {/* Avatar cliquable → profil de l'expéditeur */}
      <div onClick={goToProfile} style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: C.pill, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>
          {avatar
            ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            : "😊"}
        </div>
        <div style={{
          position: "absolute", bottom: -3, right: -3,
          background: C.card, borderRadius: "50%", width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        }}>{cfg.icon}</div>
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.ink, fontFamily: dm, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700 }}>{pseudo}</span>{" "}
          <span style={{ color: C.ink2 }}>{cfg.label}</span>
        </div>
        <div style={{ fontSize: 11, color: C.ink2, marginTop: 3, fontFamily: dm }}>
          {timeAgo(n.created_at)}
        </div>
      </div>

      {/* Flèche + pastille non lu */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {!n.read && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
        )}
        <span style={{ fontSize: 14, color: C.ink2 }}>›</span>
      </div>
    </div>
  );
}

export default function Notifications({ setPage, user, setSelectedVoisinId }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadNotifs();
  }, [user?.id]);

  const loadNotifs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*, from_profile:from_user_id(id, pseudo, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);

    if (!error) setNotifs(data || []);
    setLoading(false);

    // Marquer toutes comme lues en arrière-plan
    supabase.from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(() => {});
  };

  // Séparation aujourd'hui / plus tôt
  const now = new Date();
  const today = notifs.filter(n => (now - new Date(n.created_at)) < 86400000);
  const older = notifs.filter(n => (now - new Date(n.created_at)) >= 86400000);
  const unreadCount = notifs.filter(n => !n.read).length;

  const SectionLabel = ({ label }) => (
    <div style={{
      padding: "10px 16px 6px",
      fontSize: 11, fontWeight: 700, color: C.ink2,
      textTransform: "uppercase", letterSpacing: 0.5, fontFamily: dm,
      background: C.bg,
    }}>{label}</div>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: C.bg, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          <button
            onClick={() => setPage("fil")}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}
          >←</button>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, flex: 1 }}>
            Notifications
          </div>
          {unreadCount > 0 && (
            <div style={{
              background: C.accent, color: "#fff", borderRadius: 10,
              padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: dm,
            }}>{unreadCount} nouvelles</div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.ink2, fontFamily: dm, fontSize: 13 }}>
            Chargement…
          </div>
        ) : notifs.length === 0 ? (
          <div style={{
            padding: "60px 32px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 52 }}>🔔</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink }}>
              Aucune notification
            </div>
            <div style={{
              fontFamily: dm, fontSize: 13, color: C.ink2,
              textAlign: "center", maxWidth: 220, lineHeight: 1.5,
            }}>
              Tes likes, follows et participations aux défis apparaîtront ici.
            </div>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <>
                <SectionLabel label="Aujourd'hui" />
                {today.map(n => <NotifItem key={n.id} n={n} setPage={setPage} setSelectedVoisinId={setSelectedVoisinId} />)}
              </>
            )}
            {older.length > 0 && (
              <>
                <SectionLabel label="Plus tôt" />
                {older.map(n => <NotifItem key={n.id} n={n} setPage={setPage} setSelectedVoisinId={setSelectedVoisinId} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Hook utilitaire : compter les notifs non lues (pour badge header) ───
export function useUnreadNotifs(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetch = () => {
      supabase.from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .then(({ count: c }) => {
          const n = c || 0;
          setCount(n);
          // Badge sur l'icône de l'écran d'accueil (Android PWA)
          if ("setAppBadge" in navigator) {
            n > 0 ? navigator.setAppBadge(n) : navigator.clearAppBadge();
          }
        });
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return count;
}
