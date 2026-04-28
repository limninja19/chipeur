import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#E8490A", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function StatusBar() { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}><span>9:41</span><span>●●●</span></div>; }

function FabMenu({ open, onClose }) {
  if (!open) return null;
  return <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(26,23,20,0.4)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 90px" }}><div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "0 60px 12px" }}>{[{ icon: "📸", label: "Nouveau post" }, { icon: "📅", label: "Nouvelle sortie" }, { icon: "🏆", label: "Créer un défi", pro: true }].map((it, i) => <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: C.card, border: "none", borderRadius: 14, padding: "12px 16px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: dm }}><span style={{ fontSize: 18 }}>{it.icon}</span><span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{it.label}</span>{it.pro && <span style={{ fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro, padding: "2px 6px", borderRadius: 6, marginLeft: "auto" }}>PRO</span>}</button>)}</div></div>;
}

function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];

  return (
    <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
      {items.map((it) =>
        it.isFab ? (
          <div key="fab" onClick={onFab} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>
            +
          </div>
        ) : (
          <div key={it.id} onClick={() => onNavigate(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer" }}>
            <div style={{ fontSize: 18 }}>{it.icon}</div>
            <span>{it.label}</span>
          </div>
        )
      )}
    </div>
  );
}

function DeletePopup({ onConfirm, onCancel }) {
  return <div style={{ position: "absolute", inset: 0, background: "rgba(26,23,20,0.5)", display: "flex", alignItems: "flex-end", zIndex: 50, borderRadius: 40 }}><div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%" }}><div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>Supprimer ce post ?</div><div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Cette action est irréversible.</div><button onClick={onConfirm} style={{ width: "100%", background: "#E53935", color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>Supprimer définitivement</button><button onClick={onCancel} style={{ width: "100%", background: C.pill, color: C.ink, border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Annuler</button></div></div>;
}

const miniDefisInit = [
  { emoji: "🐾", q: "Mon animal de compagnie", sugs: ["Un chien", "Un chat", "Pas d'animal", "Plusieurs !"], a: "Milo, mon golden 🐶", done: true, hasPhoto: true, photoBg: "#E8F4FD", photoEmoji: "🐶" },
  { emoji: "📍", q: "Mon endroit préféré", sugs: ["Place Stanislas", "Un café du coin", "La campagne", "Mon canapé"], a: "Place Stanislas le dimanche", done: true },
  { emoji: "🏪", q: "Mon magasin préféré", sugs: ["Secondhand Co.", "Atelier Mona", "TrendBox", "Autre"], a: "Secondhand Co. — sans hésiter", done: true },
  { emoji: "🍽️", q: "Mon resto du quartier", sugs: ["Maison Fuji", "Un kebab", "Je cuisine !", "Livraison only"], a: "Maison Fuji, les ramen !", done: true },
  { emoji: "🎵", q: "Ma playlist du moment", sugs: ["R&B / Soul", "Indie / Rock", "Hip-hop", "Classique"], done: false },
  { emoji: "✨", q: "Ma pépite mode du mois", sugs: ["Une veste vintage", "Des sneakers", "Un accessoire", "Une collab locale"], done: false },
];

function MiniDefiScreen({ defi, onBack, onSave }) {
  const [mode, setMode] = useState("text");
  const [value, setValue] = useState(defi.done ? (defi.a || "") : "");
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 32, height: 32, background: C.pill, borderRadius: "50%", border: "none", fontSize: 15, cursor: "pointer" }}>‹</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>{defi.q}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "3px 8px", borderRadius: 8 }}>+5 XP</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 52 }}>{defi.emoji}</div>
        <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 17, color: C.ink, textAlign: "center", lineHeight: 1.3 }}>{defi.q}</div>
        <div style={{ fontSize: 12, color: C.ink2, textAlign: "center" }}>Texte ou photo — visible sur ton profil</div>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {["text", "photo"].map(m => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 9, borderRadius: 12, fontSize: 12, fontWeight: 600, border: `1.5px solid ${mode === m ? C.accent : C.border}`, background: mode === m ? C.accent : C.card, color: mode === m ? "#fff" : C.ink2, cursor: "pointer", fontFamily: dm }}>{m === "text" ? "✏️ Texte" : "📷 Photo"}</button>)}
        </div>
        {mode === "text" && <>
          <input value={value} onChange={e => setValue(e.target.value)} placeholder="Ta réponse…" style={{ width: "100%", background: C.card, border: "2px solid rgba(232,73,10,0.25)", borderRadius: 16, padding: "12px 16px", fontSize: 14, fontFamily: dm, color: C.ink, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", width: "100%" }}>
            {defi.sugs.map(s => <button key={s} onClick={() => setValue(s)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, background: value === s ? C.accent : C.pill, color: value === s ? "#fff" : C.ink2, border: "none", cursor: "pointer", fontFamily: dm }}>{s}</button>)}
          </div>
        </>}
        {mode === "photo" && <div style={{ width: "100%", aspectRatio: "4/3", background: C.pill, borderRadius: 16, border: "2px dashed rgba(232,73,10,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 12, color: C.ink2 }}><div style={{ fontSize: 32 }}>📷</div><span>Appuie pour ajouter une photo</span></div>}
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => onSave(value), 600); }} style={{ position: "absolute", bottom: 90, left: 20, right: 20, zIndex: 10, background: saved ? C.pro : C.accent, color: "#fff", border: "none", borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", transition: "background 0.3s" }}>{saved ? "✓ Enregistré !" : "Enregistrer · +5 XP ✓"}</button>
    </div>
  );
}

function EditProfileScreen({ onBack }) {
  const [name, setName] = useState("Lucas M.");
  const [bio, setBio] = useState("Passionné de mode vintage & locale. Je chine, je partage.");
  const [loc, setLoc] = useState("Nancy, Grand Est");
  const [saved, setSaved] = useState(false);
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box" };
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}>←</button>
        <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 16, flex: 1 }}>Modifier le profil</div>
        <button onClick={() => { setSaved(true); setTimeout(onBack, 800); }} style={{ background: saved ? C.pro : C.accent, color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, fontFamily: dm, cursor: "pointer", transition: "background 0.3s" }}>{saved ? "✓ Sauvé" : "Sauver"}</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `3px solid ${C.gold}`, position: "relative" }}>
            🧑‍🦱
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", border: `2px solid ${C.card}`, cursor: "pointer" }}>📷</div>
          </div>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 8, cursor: "pointer" }}>Changer la photo</div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Prénom</label><input value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Ville</label><input value={loc} onChange={e => setLoc(e.target.value)} style={inp} /></div>
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inp, resize: "none", lineHeight: 1.5 }} /></div>
        <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.5, padding: "10px 0", borderTop: `1px solid ${C.border}` }}>Ta bio et ton prénom sont visibles par tous les voisins du quartier.</div>
      </div>
    </div>
  );
}

function ProfileHeader({ activeTab, onTabChange, onEditProfile, setPage }) {
  const tabs = ["Posts", "Mon univers", "Défis", "Récompenses"];
  return (
    <div style={{ background: C.card, flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2.5px solid ${C.gold}` }}>🧑‍🦱</div>
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#E8490A,#F7A72D)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", border: `2px solid ${C.card}` }}>✦ Pépite du Quartier</div>
        </div>
        <div style={{ flex: 1, paddingTop: 2 }}>
          <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 16, color: C.ink }}>Lucas M.</div>
          <div style={{ fontSize: 11, color: C.ink2, marginTop: 1, display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 5, height: 5, background: C.accent, borderRadius: "50%" }} />Nancy, Grand Est</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>XP</span>
            <div style={{ flex: 1, height: 6, background: C.pill, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: "72%", borderRadius: 3, background: "linear-gradient(90deg,#E8490A,#F7A72D)" }} /></div>
            <span style={{ fontSize: 10, color: C.ink2, whiteSpace: "nowrap" }}>720 / 1000</span>
          </div>
          <div style={{ fontSize: 11, color: C.ink2, marginTop: 5, lineHeight: 1.4 }}>Passionné de mode vintage & locale. Je chine, je partage.</div>
        </div>
      </div>
      <div style={{ display: "flex", padding: "6px 16px 8px" }}>
        {[{ n: "24", l: "posts" }, { n: "138", l: "abonnés" }, { n: "#3", l: "classement", color: C.gold }, { n: "720", l: "XP ce mois", color: C.accent }].map((s, i) => <div key={i} style={{ display: "contents" }}>{i > 0 && <div style={{ width: 1, background: C.border, margin: "3px 0" }} />}<div style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: syne, fontWeight: 800, fontSize: 17, color: s.color || C.ink }}>{s.n}</div><div style={{ fontSize: 9, color: C.ink2, marginTop: 1 }}>{s.l}</div></div></div>)}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 6px" }}>
        <button onClick={onEditProfile} style={{ flex: 1, background: C.pill, color: C.ink, border: "none", borderRadius: 12, padding: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: dm }}>✏️ Modifier le profil</button>
        <button style={{ width: 36, height: 36, background: C.pill, borderRadius: 12, border: "none", fontSize: 14, cursor: "pointer" }}>⚙️</button>
      </div>
      <div onClick={() => setPage("reductions")} style={{ padding: "0 16px 10px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF8F6", borderRadius: 12, padding: "9px 12px", border: "1px solid rgba(232,73,10,0.15)" }}>
          <span style={{ fontSize: 16 }}>🎁</span><span style={{ fontSize: 12, fontWeight: 600, color: C.ink, flex: 1 }}>Mes réductions</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "2px 8px", borderRadius: 8 }}>3</span><span style={{ fontSize: 12, color: C.ink2 }}>→</span>
        </div>
      </div>
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
        {tabs.map(t => <button key={t} onClick={() => onTabChange(t)} style={{ flex: 1, padding: "8px 0", textAlign: "center", fontSize: 10, fontWeight: activeTab === t ? 700 : 500, border: "none", background: "none", cursor: "pointer", color: activeTab === t ? C.accent : C.ink2, fontFamily: dm, borderBottom: `2px solid ${activeTab === t ? C.accent : "transparent"}` }}>{t}</button>)}
      </div>
    </div>
  );
}

function TabPosts({ posts, onDelete }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{posts.map(p => <div key={p.id} style={{ borderRadius: 14, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, cursor: "pointer", position: "relative", overflow: "hidden", background: p.bg }}>{p.emoji}<button onClick={e => { e.stopPropagation(); onDelete(p.id); }} style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, background: "rgba(26,23,20,0.55)", borderRadius: "50%", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(26,23,20,0.6))", padding: "5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 10, color: "#fff" }}>{p.reaction}</span>{p.pepite && <span style={{ background: "linear-gradient(90deg,#5B2D8E,#9B59B6)", borderRadius: 4, padding: "2px 5px", fontSize: 8, color: "#fff", fontWeight: 700 }}>✨ Pépite</span>}</div></div>)}</div>;
}

function TabUnivers({ items, onOpen }) {
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Mon univers</div><div style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "3px 8px", borderRadius: 8 }}>+5 XP par réponse</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{items.map((it, i) => <div key={i} onClick={() => onOpen(i)} style={{ background: it.done ? C.card : "transparent", borderRadius: 14, border: it.done ? `1px solid ${C.border}` : "1px dashed rgba(232,73,10,0.25)", overflow: "hidden", cursor: "pointer", padding: it.hasPhoto ? 0 : 10 }}>{it.hasPhoto ? <><div style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: it.photoBg }}>{it.photoEmoji}</div><div style={{ padding: "8px 10px" }}><div style={{ fontSize: 9, color: C.ink2 }}>{it.q}</div><div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{it.a}</div><div style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginTop: 3 }}>+5 XP ✓</div></div></> : <><div style={{ fontSize: 20, marginBottom: 4, opacity: it.done ? 1 : 0.4 }}>{it.emoji}</div><div style={{ fontSize: 9, color: C.ink2, marginBottom: 3 }}>{it.q}</div>{it.done ? <><div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{it.a}</div><div style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginTop: 3 }}>+5 XP ✓</div></> : <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>+ Répondre · +5 XP</div>}</>}</div>)}</div>
  </>;
}

function TabDefis() {
  const defis = [{ icon: "👟", title: "Défi Sneakers", sub: "Post publié il y a 12 min", stat: "🔥 18 · 👁 84 vues", xp: "+15 XP", grad: "linear-gradient(135deg,#E8490A,#F7A72D)" }, { icon: "🧥", title: "Vintage Revival", sub: "Post publié hier", stat: "💛 9 · 👁 41 vues", xp: "+15 XP", grad: "linear-gradient(135deg,#5B2D8E,#9B59B6)" }, { icon: "🌿", title: "Look Éco-Responsable", sub: "Terminé · Non participé", stat: "—", xp: "0 XP", ended: true }];
  return <>{defis.map((d, i) => <div key={i} style={{ background: C.card, borderRadius: 14, marginBottom: 8, overflow: "hidden", border: `1px solid ${C.border}`, opacity: d.ended ? 0.5 : 1 }}><div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: d.ended ? C.pill : d.grad }}><div style={{ fontSize: 20 }}>{d.icon}</div><div><div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: d.ended ? C.ink : "#fff" }}>{d.title}</div><div style={{ fontSize: 10, color: d.ended ? C.ink2 : "rgba(255,255,255,0.8)", marginTop: 1 }}>{d.sub}</div></div></div><div style={{ padding: "7px 12px 9px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: C.ink2 }}>{d.stat}</span><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, color: d.ended ? C.ink2 : C.accent, background: d.ended ? C.pill : "#FFF0EB" }}>{d.xp}</span></div></div>)}</>;
}

function TabRewards() {
  const lb = [{ r: "1", n: "Ambre K.", lv: "Légende Locale", xp: "1 240 XP", bg: "#FEF3E0", av: "👩", rc: "#E8A020" }, { r: "2", n: "Sofia D.", lv: "Légende Locale", xp: "890 XP", bg: "#F7EEF7", av: "🧑", rc: "#8A9AAA" }, { r: "3", n: "Lucas M. (toi)", lv: "Pépite du Quartier", xp: "720 XP", bg: "#E8F4FD", av: "🧑‍🦱", rc: "#A0714A", me: true }, { r: "4", n: "Théo R.", lv: "Explorateur·trice", xp: "540 XP", bg: "#EBF5F0", av: "🧑" }];
  const tr = [{ icon: "✨", nm: "1ère Pépite", dt: "Obtenu fév. 2026", w: true }, { icon: "🏆", nm: "Top 3 du mois", dt: "Obtenu mars 2026", w: true }, { icon: "🔥", nm: "Série de 7 jours", dt: "Obtenu mars 2026", w: true }, { icon: "👑", nm: "Légende Locale", dt: "280 XP manquants", w: false }];
  return <>
    <div style={{ background: "linear-gradient(135deg,#1A1714,#3D3530)", borderRadius: 18, padding: 16, marginBottom: 14, position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", right: -8, top: -8, fontSize: 64, opacity: 0.12 }}>🏆</div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Classement · Avril 2026</span><span style={{ fontSize: 10, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 8 }}>28 voisins actifs</span></div><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontFamily: syne, fontWeight: 800, fontSize: 44, color: C.gold, lineHeight: 1 }}>#3</div><div><div style={{ fontFamily: syne, fontWeight: 800, fontSize: 18, color: "#fff" }}>720 XP ce mois</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Encore 80 XP pour passer #2</div></div></div><div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}><div style={{ height: "100%", width: "72%", borderRadius: 3, background: "linear-gradient(90deg,#E8490A,#F7A72D)" }} /></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4 }}><span>0</span><span>Top 3 → bon d'achat</span><span>1000 XP</span></div></div>
    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Top voisins du mois</div>
    {lb.map((l, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: l.me ? "#FFF8F6" : C.card, borderRadius: 14, padding: "10px 12px", marginBottom: 6, border: `1px solid ${l.me ? "rgba(232,73,10,0.3)" : C.border}` }}><div style={{ fontFamily: syne, fontWeight: 800, fontSize: 15, color: l.rc || C.ink2, width: 22, textAlign: "center" }}>{l.r}</div><div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: l.bg }}>{l.av}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{l.n}</div><div style={{ fontSize: 10, color: C.ink2 }}>{l.lv}</div></div><div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.accent }}>{l.xp}</div></div>)}
    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginTop: 14, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mes bons d'achat</div>
    <div style={{ background: "linear-gradient(135deg,#0A3D2E,#1D9E75)", borderRadius: 16, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontFamily: syne, fontWeight: 800, fontSize: 28, color: "#fff" }}>10€</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Secondhand Co.</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Récompense Top 3 · Mars 2026</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Expire le 31 mai 2026</div></div><button style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>CODE</button></div>
    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginTop: 14, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mes trophées</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{tr.map((t, i) => <div key={i} style={{ background: t.w ? "#FFFBF0" : C.card, borderRadius: 14, padding: 12, border: `1px solid ${t.w ? "rgba(247,167,45,0.4)" : C.border}`, textAlign: "center", opacity: t.w ? 1 : 0.5 }}><div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div><div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{t.nm}</div><div style={{ fontSize: 9, color: C.ink2, marginTop: 3 }}>{t.dt}</div></div>)}</div>
  </>;
}

export default function ChipeurProfilVoisin({ setPage }) {
  const [screen, setScreen] = useState("profil");
  const [activeTab, setActiveTab] = useState("Posts");
  const [fabOpen, setFabOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [miniDefiIdx, setMiniDefiIdx] = useState(null);
  const [univers, setUnivers] = useState(miniDefisInit);
  const [posts, setPosts] = useState([
    { id: 0, emoji: "🧥", bg: "#F0EBE3", reaction: "🔥 18", pepite: true },
    { id: 1, emoji: "👟", bg: "#E8F4FD", reaction: "💛 12" },
    { id: 2, emoji: "🕶️", bg: "#FEF3E0", reaction: "🔥 9" },
    { id: 3, emoji: "🧣", bg: "#F7EEF7", reaction: "👀 7" },
    { id: 4, emoji: "👖", bg: "#EBF5F0", reaction: "💛 5" },
    { id: 5, emoji: "🎒", bg: "#FFF3E0", reaction: "🤩 4" },
  ]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E8E4DF", fontFamily: dm }}>
      <div style={{ width: 340, height: 720, background: C.bg, borderRadius: 40, border: "8px solid #1A1714", overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column", position: "relative" }}>
        <StatusBar />

        {screen === "profil" && <>
          <ProfileHeader activeTab={activeTab} onTabChange={setActiveTab} onEditProfile={() => setScreen("edit")} setPage={setPage} />
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 12px" }}>
            {activeTab === "Posts" && <TabPosts posts={posts} onDelete={id => setDeleteTarget(id)} />}
            {activeTab === "Mon univers" && <TabUnivers items={univers} onOpen={i => { setMiniDefiIdx(i); setScreen("minidefi"); }} />}
            {activeTab === "Défis" && <TabDefis />}
            {activeTab === "Récompenses" && <TabRewards />}
          </div>
        </>}

        {screen === "edit" && <EditProfileScreen onBack={() => setScreen("profil")} />}

        {screen === "minidefi" && miniDefiIdx !== null && (
          <MiniDefiScreen
            defi={univers[miniDefiIdx]}
            onBack={() => { setScreen("profil"); setActiveTab("Mon univers"); }}
            onSave={val => {
              if (val) setUnivers(prev => prev.map((it, i) => i === miniDefiIdx ? { ...it, done: true, a: val } : it));
              setScreen("profil"); setActiveTab("Mon univers"); setMiniDefiIdx(null);
            }}
          />
        )}

        {deleteTarget !== null && (
          <DeletePopup
            onConfirm={() => { setPosts(prev => prev.filter(p => p.id !== deleteTarget)); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} />
        <BottomNav
  active="profil"
  onNavigate={setPage}
  onFab={() => setPage("nouveau")}
/>
      </div>
    </div>
  );
}
