import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const voisinsData = [
  { id: 0, avatar: "👩", bg: "#FEF3E0", name: "Ambre K.", level: "Légende Locale", levelBg: "#FFF0EB", levelColor: C.accent, dotGrad: "linear-gradient(135deg,#FF5733,#F7A72D)", bio: "Mode, vintage, bonne humeur. Je shoppe, je partage ✨", posts: "24", abonnes: "312", xp: "1 240", rang: "#1", xpColor: C.accent, isMe: false },
  { id: 1, avatar: "👩‍🦰", bg: "#F7EEF7", name: "Sofia D.", level: "Légende Locale", levelBg: "#FFF0EB", levelColor: C.accent, dotGrad: "linear-gradient(135deg,#FF5733,#F7A72D)", bio: "Styliste amateur, fan de défis mode et de brocantes", posts: "18", abonnes: "204", xp: "890", rang: "#2", xpColor: C.accent, isMe: false },
  { id: 2, avatar: "🧑‍🦱", bg: "#E8F4FD", name: "Lucas M.", level: "Pépite du Quartier", levelBg: "#F0E6FC", levelColor: "#5B2D8E", dotGrad: "linear-gradient(135deg,#5B2D8E,#9B59B6)", bio: "Passionné de mode vintage & locale. Je chine, je partage.", posts: "24", abonnes: "138", xp: "720", rang: "#3", xpColor: "#5B2D8E", isMe: true },
  { id: 3, avatar: "🧑", bg: "#EBF5F0", name: "Théo R.", level: "Explorateur·trice", levelBg: C.proBg, levelColor: C.pro, dotGrad: "#1D9E75", bio: "Sneakers addict & streetwear lover", posts: "11", abonnes: "87", xp: "540", rang: "#4", xpColor: C.accent, isMe: false },
  { id: 4, avatar: "👨", bg: "#FFF3E0", name: "Romain V.", level: "Voisin·e Actif·ve", levelBg: C.pill, levelColor: C.ink2, dotGrad: C.pill, bio: "J'essaie des trucs, je partage ce qui marche", posts: "6", abonnes: "34", xp: "210", rang: "#8", xpColor: C.accent, isMe: false },
];

function StatusBar() { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}><span>9:41</span><span>●●●</span></div>; }

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
  const top3 = [voisins[1], voisins[0], voisins[2]];
  const sizes = { 0: { w: 44, fs: 18, rank: "#2", rc: "#B0BEC5", bh: 22 }, 1: { w: 52, fs: 18, rank: "#1 👑", rc: C.gold, bh: 32 }, 2: { w: 40, fs: 18, rank: "#3", rc: "#A0714A", bh: 16 } };
  return (
    <div style={{ background: "linear-gradient(135deg,#1A1714,#3D3530)", borderRadius: 20, padding: 16, marginBottom: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -10, top: -10, fontSize: 72, opacity: 0.1 }}>🏆</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Classement du mois — Avril 2026</div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center", marginBottom: 12 }}>
        {top3.map((v, i) => {
          const s = sizes[i];
          return (
            <div key={v.id} onClick={() => onOpen(v.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{ width: s.w, height: s.w, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s.fs, border: `2px solid ${s.rc}`, background: v.bg }}>{v.avatar}</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 11, color: s.rc }}>{s.rank}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", textAlign: "center", maxWidth: 60 }}>{v.name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{v.xp} XP</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "flex-end", marginTop: 8 }}>
        <div style={{ width: 30, height: 22, borderRadius: "4px 4px 0 0", background: "#B0BEC5" }} />
        <div style={{ width: 36, height: 32, borderRadius: "4px 4px 0 0", background: C.gold }} />
        <div style={{ width: 26, height: 16, borderRadius: "4px 4px 0 0", background: "#A0714A" }} />
      </div>
    </div>
  );
}

function VoisinCard({ v, followed, onToggleFollow, onOpen }) {
  return (
    <div onClick={() => onOpen(v.id)} style={{
      background: v.isMe ? "#FFF8F6" : C.card, borderRadius: 18, padding: "12px 14px", marginBottom: 8,
      border: `1px solid ${v.isMe ? "rgba(232,73,10,0.2)" : C.border}`,
      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: v.bg, border: v.isMe ? `2px solid ${C.accent}` : "none" }}>{v.avatar}</div>
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", border: `2px solid ${C.card}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, background: v.dotGrad, color: "#fff" }}>{v.isMe ? "✦" : "★"}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>{v.name}{v.isMe && <span style={{ fontSize: 9, color: C.accent }}> (toi)</span>}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 7, whiteSpace: "nowrap", background: v.levelBg, color: v.levelColor }}>{v.level}</span>
        </div>
        <div style={{ fontSize: 11, color: C.ink2 }}>📍 Nancy, Grand Est</div>
        <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.bio}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
          <span style={{ fontSize: 10, color: C.ink2 }}>{v.posts} posts</span>
          <span style={{ fontSize: 10, color: C.ink2 }}>· {v.abonnes} abonnés</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: v.xpColor }}>{v.xp} XP</div>
        {v.isMe ? (
          <span style={{ fontSize: 10, color: C.ink2 }}>#3 ce mois</span>
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

function ExtProfile({ v, followed, onToggleFollow, onBack }) {
  const [tab, setTab] = useState("univers");

  const univers = [
    { emoji: "🐾", q: "Animal de compagnie", a: "Luna, ma chatte tigre 🐱" },
    { emoji: "📍", q: "Endroit préféré", a: "Le marché du samedi matin" },
    { emoji: "🏪", q: "Magasin préféré", a: "Atelier Mona, sans hésiter !" },
    { emoji: "🍽️", q: "Resto du quartier", a: "Le Petit Zinc, le dimanche" },
    { emoji: "🎵", q: "Playlist du moment", a: "R&B / Soul – Erykah Badu" },
    { emoji: "✨", q: "Pépite mode du mois", a: "Un trench camel chiné 5€" },
  ];
  const posts = [
    { emoji: "👗", bg: "#FEF3E0", r: "🔥 22" }, { emoji: "🧥", bg: "#F7EEF7", r: "💛 15" },
    { emoji: "👠", bg: "#F0EBE3", r: "🔥 11" }, { emoji: "🕶️", bg: "#EBF5F0", r: "👀 8" },
    { emoji: "🧣", bg: "#FFF3E0", r: "💛 6" }, { emoji: "👜", bg: "#E8F4FD", r: "🤩 5" },
  ];
  const trophees = ["✨ 1ère Pépite", "🏆 Top 1 du mois", "🔥 Série 14 jours", "👑 Légende Locale", "🎯 5 Défis remportés"];

  const tabs = ["univers", "posts", "trophees"];
  const tabLabels = { univers: "Son univers", posts: "Posts", trophees: "Trophées" };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ background: C.card, flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "12px 16px 0" }}>
          <button onClick={onBack} style={{ width: 32, height: 32, background: C.pill, borderRadius: "50%", border: "none", fontSize: 15, cursor: "pointer" }}>‹</button>
        </div>
        <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2.5px solid ${C.gold}`, flexShrink: 0, background: v.bg }}>{v.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink }}>{v.name}</div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 5, height: 5, background: C.accent, borderRadius: "50%" }} />Nancy, Grand Est</div>
            <div style={{ display: "inline-block", background: "linear-gradient(135deg,#FF5733,#F7A72D)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 8, marginTop: 5 }}>{v.level}</div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 5, lineHeight: 1.4 }}>{v.bio}</div>
          </div>
        </div>
        <div style={{ display: "flex", padding: "8px 18px 12px" }}>
          {[{ n: v.posts, l: "posts" }, { n: v.abonnes, l: "abonnés" }, { n: v.xp, l: "XP ce mois", color: C.accent }, { n: v.rang, l: "classement", color: C.gold }].map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i > 0 && <div style={{ width: 1, background: C.border, margin: "3px 0" }} />}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: s.color || C.ink }}>{s.n}</div>
                <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 18px 12px", display: "flex", gap: 8 }}>
          {v.isMe ? (
            <button style={{ flex: 1, border: "none", borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm, background: C.pill, color: C.ink2 }}>C'est moi 👋</button>
          ) : (
            <button onClick={onToggleFollow} style={{ flex: 1, border: "none", borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm, background: followed ? C.pill : C.accent, color: followed ? C.ink2 : "#fff", transition: "all 0.2s" }}>{followed ? "Suivi ✓" : "+ Suivre"}</button>
          )}
          <button style={{ width: 44, height: 44, background: C.pill, borderRadius: 14, border: "none", fontSize: 18, cursor: "pointer" }}>💬</button>
        </div>
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", textAlign: "center", fontSize: 11, fontWeight: tab === t ? 600 : 500, border: "none", background: "none", cursor: "pointer", color: tab === t ? C.accent : C.ink2, fontFamily: dm, borderBottom: `2px solid ${tab === t ? C.accent : "transparent"}` }}>{tabLabels[t]}</button>)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 12px" }}>
        {tab === "univers" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {univers.map((u, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 14, padding: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{u.emoji}</div>
                <div style={{ fontSize: 9, color: C.ink2, marginBottom: 3 }}>{u.q}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{u.a}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "posts" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {posts.map((p, i) => (
              <div key={i} style={{ borderRadius: 10, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, position: "relative", overflow: "hidden", background: p.bg, cursor: "pointer" }}>
                {p.emoji}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(26,23,20,0.5))", padding: "3px 5px", fontSize: 9, color: "#fff" }}>{p.r}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "trophees" && <>
          <div style={{ marginBottom: 12, fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Trophées débloqués</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {trophees.map((t, i) => (
              <div key={i} style={{ background: "#FFFBF0", border: "1px solid rgba(247,167,45,0.3)", borderRadius: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.ink }}>{t}</div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

export default function ChipeurPageVoisins({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [follows, setFollows] = useState({ 1: true });
  const [fabOpen, setFabOpen] = useState(false);

  const toggleFollow = (id) => setFollows(prev => ({ ...prev, [id]: !prev[id] }));
  const openVoisin = (id) => { setSelectedId(id); setScreen("profile"); };

  const filters = ["Tous", "Top XP 🏆", "Près de moi 📍", "Abonnements"];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: dm, color: C.ink }}>

        {screen === "list" && <>
          <div style={{ padding: "14px 18px 0", flexShrink: 0 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Voisins 🏘️</div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, marginBottom: 10 }}>Les actifs de Nancy ce mois</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 14, padding: "9px 14px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.ink2 }}>🔍</span>
              <input placeholder="Recherche un voisin…" style={{ border: "none", outline: "none", fontSize: 13, fontFamily: dm, color: C.ink, flex: 1, background: "transparent" }} />
            </div>
            <div style={{ display: "flex", gap: 6, paddingBottom: 10, overflowX: "auto" }}>
              {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: dm, background: filter === f ? C.ink : C.pill, color: filter === f ? "#fff" : C.ink2 }}>{f}</button>)}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
            <Podium voisins={voisinsData} onOpen={openVoisin} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Tous les voisins</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>28 actifs ce mois</div>
            </div>
            {voisinsData.map(v => (
              <VoisinCard key={v.id} v={v} followed={!!follows[v.id]} onToggleFollow={toggleFollow} onOpen={openVoisin} />
            ))}
          </div>
        </>}

        {screen === "profile" && selectedId !== null && (
          <ExtProfile
            v={voisinsData[selectedId]}
            followed={!!follows[selectedId]}
            onToggleFollow={() => toggleFollow(selectedId)}
            onBack={() => setScreen("list")}
          />
        )}

        <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} />
        <BottomNav
  active="voisins"
  onNavigate={setPage}
  onFab={() => setPage("nouveau")}
/>
    </div>
  );
}
