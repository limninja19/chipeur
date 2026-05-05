import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { THEMES, miniDefisAll } from "./chipeur_univers_data";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D" };
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const LEVELS = [
  { name: "Débutant·e", min: 0, max: 50, bg: C.pill, color: C.ink2 },
  { name: "Explorateur·trice", min: 50, max: 150, bg: C.proBg, color: C.pro },
  { name: "Pépite du Quartier", min: 150, max: 300, bg: "#F0E6FC", color: "#5B2D8E" },
  { name: "Légende Locale", min: 300, max: Infinity, bg: "#FFF0EB", color: C.accent },
];
function getLevel(xp) {
  return LEVELS.find(l => xp < l.max) || LEVELS[LEVELS.length - 1];
}

function FabMenu({ open, onClose }) {
  if (!open) return null;
  return <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(26,23,20,0.4)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 90px" }}><div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "0 60px 12px" }}>{[{ icon: "📸", label: "Nouveau post" }, { icon: "📅", label: "Nouvelle sortie" }, { icon: "🏆", label: "Créer un défi", pro: true }].map((it, i) => <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: C.card, border: "none", borderRadius: 14, padding: "12px 16px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: dm }}><span style={{ fontSize: 18 }}>{it.icon}</span><span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{it.label}</span>{it.pro && <span style={{ fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro, padding: "2px 6px", borderRadius: 6, marginLeft: "auto" }}>PRO</span>}</button>)}</div></div>;
}

function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    null,
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];

  return (
    <div style={{
      height: 80,
      background: C.card,
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      flexShrink: 0
    }}>
      {items.map((it, i) =>
        it === null ? (
          <div
            key="fab"
            onClick={onFab}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#fff",
              marginTop: -20,
              cursor: "pointer"
            }}
          >
            +
          </div>
        ) : (
          <div
            key={it.id}
            onClick={() => onNavigate(it.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              color: active === it.id ? C.accent : C.ink2,
              cursor: "pointer"
            }}
          >
            <div style={{ fontSize: 18 }}>{it.icon}</div>
            <span>{it.label}</span>
          </div>
        )
      )}
    </div>
  );
}

function Podium({ voisins, onOpen }) {
  const order = [voisins[1], voisins[0], voisins[2]]; // 2nd, 1st, 3rd
  const configs = [
    { w: 44, rank: "#2", rc: "#B0BEC5", bh: 22 },
    { w: 52, rank: "#1 👑", rc: C.gold, bh: 32 },
    { w: 40, rank: "#3", rc: "#A0714A", bh: 16 },
  ];
  return (
    <div style={{ background: "linear-gradient(135deg,#1A1714,#3D3530)", borderRadius: 20, padding: 16, marginBottom: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -10, top: -10, fontSize: 72, opacity: 0.1 }}>🏆</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Top 3 — Plus actifs</div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center", marginBottom: 12 }}>
        {order.map((v, i) => {
          const s = configs[i];
          if (!v) return <div key={i} style={{ width: s.w }} />;
          return (
            <div key={v.id} onClick={() => onOpen(v.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{ width: s.w, height: s.w, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${s.rc}`, background: v.bg }}>
                {v.avatar_url ? <img src={v.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🧑"}
              </div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 11, color: s.rc }}>{s.rank}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", textAlign: "center", maxWidth: 60 }}>{v.pseudo || "Voisin·e"}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{v.xp} XP</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "flex-end" }}>
        <div style={{ width: 30, height: 22, borderRadius: "4px 4px 0 0", background: "#B0BEC5" }} />
        <div style={{ width: 36, height: 32, borderRadius: "4px 4px 0 0", background: C.gold }} />
        <div style={{ width: 26, height: 16, borderRadius: "4px 4px 0 0", background: "#A0714A" }} />
      </div>
    </div>
  );
}

function Avatar({ v, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, border: v.isMe ? `2px solid ${C.accent}` : "none", flexShrink: 0 }}>
      {v.avatar_url ? <img src={v.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🧑"}
    </div>
  );
}

function VoisinCard({ v, followed, onToggleFollow, onOpen }) {
  return (
    <div onClick={onOpen} style={{
      background: v.isMe ? "#FFF8F6" : C.card, borderRadius: 18, padding: "12px 14px", marginBottom: 8,
      border: `1px solid ${v.isMe ? "rgba(232,73,10,0.2)" : C.border}`,
      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
    }}>
      <Avatar v={v} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>{v.pseudo || "Voisin·e"}{v.isMe && <span style={{ fontSize: 9, color: C.accent }}> (toi)</span>}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 7, whiteSpace: "nowrap", background: v.levelBg, color: v.levelColor }}>{v.level}</span>
        </div>
        {v.quartier && <div style={{ fontSize: 11, color: C.ink2 }}>📍 {v.quartier}</div>}
        <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.bio || "Pas encore de bio"}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
          <span style={{ fontSize: 10, color: C.ink2 }}>{v.postCount} post{v.postCount > 1 ? "s" : ""}</span>
          <span style={{ fontSize: 10, color: C.ink2 }}>· {v.xp} XP</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        {v.isMe ? (
          <span style={{ fontSize: 10, color: C.ink2 }}>C'est toi 👋</span>
        ) : (
          <button onClick={e => { e.stopPropagation(); onToggleFollow(v.id); }} style={{
            border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: dm, whiteSpace: "nowrap", transition: "all 0.2s",
            background: followed ? C.pill : C.accent, color: followed ? C.ink2 : "#fff",
          }}>{followed ? "Suivi ✓" : "+ Suivre"}</button>
        )}
      </div>
    </div>
  );
}

// Questions univers (même ordre que dans chipeur_profil_voisin_1.jsx)
const UNIVERS_DEFS = [
  { emoji: "🐾", q: "Animal de compagnie" },
  { emoji: "📍", q: "Endroit préféré" },
  { emoji: "🏪", q: "Magasin préféré du quartier" },
  { emoji: "🍽️", q: "Resto préféré" },
  { emoji: "🎵", q: "Playlist du moment" },
  { emoji: "✨", q: "Pépite mode du mois" },
];

function ExtProfile({ v, followed, onToggleFollow, onBack, voisinsRanking, onMessage }) {
  const [tab, setTab] = useState("univers");
  const [vPosts, setVPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Charger les vrais posts de ce voisin quand on ouvre son profil
  useEffect(() => {
    if (!v?.id) return;
    setPostsLoading(true);
    supabase.from("posts").select("*").eq("author_id", v.id).order("created_at", { ascending: false })
      .then(({ data }) => { setVPosts(data || []); setPostsLoading(false); });
  }, [v?.id]);

  // Univers réel depuis v.univers (JSONB Supabase) — format objet keyed par ID
  const savedMap = (v.univers && !Array.isArray(v.univers)) ? v.univers : {};
  const universDoneCount = Object.values(savedMap).filter(it => it?.done).length;

  // Trophées calculés depuis les vraies données
  const trophees = [];
  if (v.xp >= 300) trophees.push("👑 Légende Locale");
  if (v.xp >= 150) trophees.push("✨ Pépite du Quartier");
  if (v.xp >= 50) trophees.push("🗺️ Explorateur·trice");
  if (v.postCount >= 1) trophees.push("📸 1er post publié");
  if (universDoneCount >= 3) trophees.push("🌟 Univers en route");
  if (universDoneCount >= 12) trophees.push("🏆 Univers complet");
  if (trophees.length === 0) trophees.push("🌱 Tout juste arrivé·e");

  // Rang dans le classement
  const rang = voisinsRanking ? voisinsRanking.findIndex(v2 => v2.id === v.id) + 1 : null;

  const tabs = ["univers", "posts", "trophees"];
  const tabLabels = { univers: "Son univers", posts: `Posts (${v.postCount || 0})`, trophees: "Trophées" };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: C.card, flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "12px 16px 0" }}>
          <button onClick={onBack} style={{ width: 32, height: 32, background: C.pill, borderRadius: "50%", border: "none", fontSize: 15, cursor: "pointer" }}>‹</button>
        </div>
        <div style={{ padding: "10px 18px 10px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Avatar */}
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2.5px solid ${C.gold}`, flexShrink: 0, background: v.bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {v.avatar_url ? <img src={v.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🧑"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink }}>{v.pseudo || "Voisin·e"}{v.isMe && <span style={{ fontSize: 11, color: C.accent, marginLeft: 6 }}>👋 Toi</span>}</div>
            <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, background: C.accent, borderRadius: "50%", flexShrink: 0 }} />
              {v.quartier || "Saint-Dié-des-Vosges"}
            </div>
            <div style={{ display: "inline-block", background: "linear-gradient(135deg,#FF5733,#F7A72D)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8, marginTop: 4 }}>{v.level}</div>
            {v.bio && <div style={{ fontSize: 12, color: C.ink2, marginTop: 5, lineHeight: 1.4 }}>{v.bio}</div>}
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", padding: "4px 18px 10px" }}>
          {[
            { n: String(v.postCount || 0), l: "posts" },
            { n: String(v.xp || 0), l: "XP total", color: C.accent },
            { n: rang ? `#${rang}` : "#—", l: "classement", color: C.gold },
            { n: String(universDoneCount) + "/24", l: "univers" },
          ].map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i > 0 && <div style={{ width: 1, background: C.border, margin: "3px 0" }} />}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: s.color || C.ink }}>{s.n}</div>
                <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Boutons */}
        <div style={{ padding: "0 18px 10px", display: "flex", gap: 8 }}>
          {v.isMe ? (
            <div style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 600, textAlign: "center", fontFamily: dm, color: C.ink2 }}>C'est moi 👋</div>
          ) : (
            <button onClick={onToggleFollow} style={{ flex: 1, border: "none", borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm, background: followed ? C.pill : C.accent, color: followed ? C.ink2 : "#fff", transition: "all 0.2s" }}>{followed ? "Suivi ✓" : "+ Suivre"}</button>
          )}
          <button onClick={() => onMessage && onMessage(v)} style={{ width: 44, height: 44, background: C.pill, borderRadius: 14, border: "none", fontSize: 18, cursor: "pointer" }}>💬</button>
        </div>
        {/* Onglets */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", textAlign: "center", fontSize: 10, fontWeight: tab === t ? 700 : 500, border: "none", background: "none", cursor: "pointer", color: tab === t ? C.accent : C.ink2, fontFamily: dm, borderBottom: `2px solid ${tab === t ? C.accent : "transparent"}` }}>{tabLabels[t]}</button>)}
        </div>
      </div>

      {/* Contenu onglets */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>

        {/* ─ UNIVERS ─ */}
        {tab === "univers" && (() => {
          // Convertir le format objet {id: {done,a,photoUrl}} en tableau enrichi
          const savedMap = (v.univers && !Array.isArray(v.univers)) ? v.univers : {};
          const items = miniDefisAll.map(d => ({ ...d, ...(savedMap[d.id] || {}) }));
          const hasDone = items.some(it => it.done);
          if (!hasDone) return (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Univers pas encore rempli</div>
              <div style={{ fontSize: 12, color: C.ink2 }}>{v.pseudo || "Ce voisin"} n'a pas encore partagé son univers.</div>
            </div>
          );
          return THEMES.map(t => {
            const themeItems = items.filter(it => it.theme === t.id && it.done);
            if (themeItems.length === 0) return null;
            return (
              <div key={t.id} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {themeItems.map(it => (
                    <div key={it.id} style={{ background: C.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      {it.photoUrl && (
                        <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                          <img src={it.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>{it.emoji}</div>
                        <div style={{ fontSize: 9, color: C.ink2, marginBottom: 3 }}>{it.q}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{it.a || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          });
        })()}

        {/* ─ POSTS ─ */}
        {tab === "posts" && (
          postsLoading ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2 }}>Chargement…</div>
          ) : vPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun post pour l'instant</div>
              <div style={{ fontSize: 12, color: C.ink2 }}>{v.pseudo || "Ce voisin"} n'a pas encore publié.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {vPosts.map(p => (
                <div key={p.id} style={{ borderRadius: 10, aspectRatio: "1", overflow: "hidden", background: C.pill, position: "relative" }}>
                  {p.image_url ? (
                    <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 6, boxSizing: "border-box" }}>
                      <div style={{ fontSize: 9, color: C.ink2, textAlign: "center", lineHeight: 1.4 }}>{p.content?.slice(0, 40)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ─ TROPHÉES ─ */}
        {tab === "trophees" && (
          <>
            <div style={{ marginBottom: 12, fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Trophées débloqués</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {trophees.map((t, i) => (
                <div key={i} style={{ background: "#FFFBF0", border: "1px solid rgba(247,167,45,0.3)", borderRadius: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.ink }}>{t}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const BG_COLORS = ["#FEF3E0","#F7EEF7","#E8F4FD","#EBF5F0","#FFF3E0","#F0E8FF"];

export default function ChipeurPageVoisins({ setPage, user, setConversationWith }) {
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [follows, setFollows] = useState({});
  const [voisins, setVoisins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Charger les follows existants depuis Supabase
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const f = {};
        data.forEach(r => { f[r.following_id] = true; });
        setFollows(f);
      });
  }, [user?.id]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, pseudo, bio, quartier, avatar_url, univers, bonus_xp")
      .not("pseudo", "is", null)
      .order("created_at", { ascending: true })
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return; }
        // Pour chaque profil, compter ses posts
        const withCounts = await Promise.all(data.map(async (p, i) => {
          const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", p.id);
          const universMap = (p.univers && !Array.isArray(p.univers)) ? p.univers : {};
          const universXp = Object.values(universMap).reduce((sum, it) => sum + (it?.xp || 0), 0);
          const xp = (count || 0) * 10 + universXp + (p.bonus_xp || 0);
          const lvl = getLevel(xp);
          return {
            ...p,
            idx: i,
            postCount: count || 0,
            xp,
            level: lvl.name,
            levelBg: lvl.bg,
            levelColor: lvl.color,
            bg: BG_COLORS[i % BG_COLORS.length],
            isMe: p.id === user?.id,
          };
        }));
        // Trier par XP décroissant
        withCounts.sort((a, b) => b.xp - a.xp);
        setVoisins(withCounts);
        setLoading(false);
      });
  }, [user?.id]);

  const toggleFollow = async (id) => {
    if (!user?.id) return;
    const isFollowing = !!follows[id];
    // Mise à jour optimiste
    setFollows(prev => ({ ...prev, [id]: !isFollowing }));
    if (isFollowing) {
      await supabase.from("follows").delete()
        .eq("follower_id", user.id).eq("following_id", id);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      // Notif pour le voisin suivi
      supabase.from("notifications").insert({
        user_id: id,
        from_user_id: user.id,
        type: "follow",
        read: false,
      }).then(() => {});
    }
  };
  const openVoisin = (id) => { setSelectedId(id); setScreen("profile"); };
  const filters = ["Tous", "Top XP 🏆", "Mon quartier 📍"];
  const selectedVoisin = voisins.find(v => v.id === selectedId);

  const filtered = voisins.filter(v => {
    if (search && !v.pseudo?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const top3 = filtered.slice(0, 3);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: dm, color: C.ink }}>

        {screen === "list" && <>
          <div style={{ padding: "14px 18px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <button onClick={() => setPage("profil")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}>←</button>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Voisins 🏘️</div>
            </div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10 }}>
              {loading ? "Chargement…" : `${voisins.length} voisin${voisins.length > 1 ? "s" : ""} inscrit${voisins.length > 1 ? "s" : ""}`}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 14, padding: "9px 14px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.ink2 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Recherche un voisin…" style={{ border: "none", outline: "none", fontSize: 13, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement des voisins…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏘️</div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucun voisin trouvé</div>
                <div style={{ fontSize: 12, color: C.ink2 }}>Invite des amis à rejoindre Chipeur !</div>
              </div>
            ) : (
              <>
                {top3.length >= 3 && <Podium voisins={top3} onOpen={openVoisin} />}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Tous les voisins</div>
                  <div style={{ fontSize: 11, color: C.ink2 }}>{filtered.length} inscrits</div>
                </div>
                {filtered.map(v => (
                  <VoisinCard key={v.id} v={v} followed={!!follows[v.id]} onToggleFollow={toggleFollow} onOpen={() => openVoisin(v.id)} />
                ))}
              </>
            )}
          </div>
        </>}

        {screen === "profile" && selectedVoisin && (
          <ExtProfile
            v={selectedVoisin}
            followed={!!follows[selectedVoisin.id]}
            onToggleFollow={() => toggleFollow(selectedVoisin.id)}
            onBack={() => setScreen("list")}
            voisinsRanking={voisins}
            onMessage={(v) => {
              setConversationWith({ id: v.id, pseudo: v.pseudo, avatar_url: v.avatar_url, quartier: v.quartier });
              setPage("messages");
            }}
          />
        )}

        <BottomNav active="voisins" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
