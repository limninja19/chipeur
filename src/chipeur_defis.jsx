import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const defisData = [
  { id: 0, icon: "👟", title: "Défi Sneakers", sub: "Montre ta paire la plus stylée du quartier", participants: 47, objectif: 100, pct: 47, color: "orange", grad: "linear-gradient(135deg,#FF5733,#F7A72D)", fill: "#FF5733", timeLeft: "3 jours restants", tags: ["#Sneakers", "#Vintage", "#Streetwear", "#Local", "#Seconde main"], ended: false },
  { id: 1, icon: "🧥", title: "Vintage Revival", sub: "Ta meilleure pièce chinée cette semaine", participants: 28, objectif: 80, pct: 35, color: "purple", grad: "linear-gradient(135deg,#5B2D8E,#9B59B6)", fill: "#7B4FBA", timeLeft: "5 jours restants", tags: ["#Vintage", "#Chiné", "#Seconde main", "#Mode", "#Pépite"], ended: false },
  { id: 2, icon: "🌿", title: "Look Éco-Responsable", sub: "Mode durable, style local", participants: 102, objectif: 100, pct: 100, color: "teal", grad: "linear-gradient(135deg,#0A3D2E,#1D9E75)", fill: "#1D9E75", timeLeft: "Terminé · 102 posts", tags: ["#Éco", "#Durable", "#Local", "#Upcycling"], ended: true },
  { id: 3, icon: "🎒", title: "Rentrée Style", sub: "Ton look sac + tenue du jour", participants: 12, objectif: 60, pct: 20, color: "blue", grad: "linear-gradient(135deg,#185FA5,#378ADD)", fill: "#378ADD", timeLeft: "8 jours restants", tags: ["#Rentrée", "#OOTD", "#Sac", "#Tenue"], ended: false },
];

const recentPosts = [
  { avatar: "👟", bg: "#E8F4FD", name: "Lucas M.", text: "Ma New Balance 574 vintage trouvée chez Secondhand Co. !", fire: "🔥 14" },
  { avatar: "👠", bg: "#FEF3E0", name: "Ambre K.", text: "Les mules dorées de la boutique Lara au coin de la rue…", fire: "🔥 9" },
  { avatar: "👟", bg: "#F0EBE3", name: "Théo R.", text: "Jordan 1 Low x look total blanc, chaque fois ça marche", fire: "🔥 7" },
];

function StatusBar() { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}><span>9:41</span><span>●●●</span></div>; }
function BottomNav({ setPage }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    null,
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
    {items.map((it, i) => it === null ?
      <div key="fab" onClick={() => setPage("nouveau")} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div> :
      <div key={i} onClick={() => setPage(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: C.ink2, cursor: "pointer" }}><div style={{ fontSize: 18 }}>{it.icon}</div><span>{it.label}</span></div>
    )}
  </div>;
}

function DefiCard({ d, onOpen, onParticipe }) {
  return (
    <div onClick={() => onOpen(d.id)} style={{ background: C.card, borderRadius: 20, marginBottom: 12, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer" }}>
      <div style={{ padding: "16px 16px 14px", background: d.grad }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{d.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>{d.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{d.sub}</div>
            <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "#fff", fontWeight: 600, marginTop: 6, display: "inline-block" }}>{d.ended ? "✅" : "⏳"} {d.timeLeft}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[{ n: d.participants, l: "participants" }, { n: d.objectif, l: "objectif" }, { n: d.pct + "%", l: "complété" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 10px", flex: 1 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: "#fff", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.ink2, marginBottom: 4 }}><span>{d.participants} posts</span><span>objectif {d.objectif}{d.ended ? " ✓" : ""}</span></div>
          <div style={{ height: 5, background: C.pill, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${Math.min(d.pct, 100)}%`, background: d.fill }} /></div>
        </div>
        <button onClick={e => { e.stopPropagation(); if (!d.ended) onParticipe(d.id); }} style={{ border: "none", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: dm, whiteSpace: "nowrap", color: "#fff", background: d.ended ? C.ink : d.fill }}>{d.ended ? "Voir les posts" : "+ Participer"}</button>
      </div>
    </div>
  );
}

function DetailScreen({ d, onBack, onParticipe }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0, position: "relative", background: d.grad }}>
        <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, width: 32, height: 32, background: "rgba(255,255,255,0.25)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", cursor: "pointer" }}>‹</button>
        <div style={{ fontSize: 40, textAlign: "center" }}>{d.icon}</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", textAlign: "center" }}>{d.title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", textAlign: "center", lineHeight: 1.4 }}>{d.sub}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[{ n: d.participants, l: "participants" }, { n: d.ended ? "—" : d.timeLeft.split(" ")[0], l: d.ended ? "terminé" : "restants" }, { n: d.objectif, l: "objectif" }].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff" }}>{s.n}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px" }}>
        <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink2, marginBottom: 8 }}><span>Progression</span><strong style={{ color: C.ink }}>{d.pct}%</strong></div>
          <div style={{ height: 8, background: C.pill, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 4, width: `${Math.min(d.pct, 100)}%`, background: d.grad }} /></div>
        </div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 10 }}>Posts récents 🔥</div>
        {recentPosts.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: C.card, borderRadius: 14, padding: "10px 12px", marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, background: p.bg }}>{p.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: syne }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.text}</div>
            </div>
            <div style={{ fontSize: 12, color: C.ink2 }}>{p.fire}</div>
          </div>
        ))}
      </div>
      {!d.ended && <button onClick={onParticipe} style={{ position: "absolute", bottom: 90, left: 20, right: 20, border: "none", borderRadius: 18, padding: 16, fontSize: 15, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", color: "#fff", background: d.fill, zIndex: 10 }}>+ Participer à ce défi</button>}
    </div>
  );
}

function ParticipeScreen({ d, onBack, onPublish }) {
  const [imgPreview, setImgPreview] = useState(null);
  const [activeTags, setActiveTags] = useState([d.tags[0]]);
  const fileInputRef = useState(null);
  const toggleTag = t => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgPreview(url);
  }

  function openPicker() {
    document.getElementById("defi-file-input").click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, background: C.card, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>‹</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>Participer · {d.title}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        <div style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10, background: d.grad }}>
          <div style={{ fontSize: 22 }}>{d.icon}</div>
          <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Tu réponds au défi</div><div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>{d.title}</div></div>
        </div>

        {/* Input fichier caché — ouvre galerie/appareil photo */}
        <input
          id="defi-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div onClick={openPicker} style={{
          background: imgPreview ? "#000" : C.card,
          border: imgPreview ? `2px solid ${C.accent}` : "2px dashed rgba(255,87,51,0.35)",
          borderRadius: 18, aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          {imgPreview ? (
            <>
              <img src={imgPreview} alt="preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>Changer</div>
            </>
          ) : <>
            <div style={{ fontSize: 36 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Ajoute ta photo</div>
            <div style={{ fontSize: 11, color: C.ink2, opacity: 0.7 }}>Galerie ou appareil photo</div>
          </>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.3, marginBottom: 5 }}>DESCRIPTION</div>
          <textarea placeholder="Décris ta pièce, où tu l'as trouvée…" rows={3} style={{ width: "100%", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", fontSize: 14, fontFamily: dm, color: C.ink, outline: "none", resize: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.3, marginBottom: 5 }}>TAGS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {d.tags.map(t => (
              <div key={t} onClick={() => toggleTag(t)} style={{
                padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: dm,
                border: `1.5px solid ${activeTags.includes(t) ? C.accent : C.border}`,
                background: activeTags.includes(t) ? C.accent : C.card,
                color: activeTags.includes(t) ? "#fff" : C.ink2, transition: "all 0.15s",
              }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onPublish} disabled={!imgPreview} style={{ position: "absolute", bottom: 90, left: 20, right: 20, background: imgPreview ? C.accent : "#ccc", color: "#fff", border: "none", borderRadius: 18, padding: 16, fontSize: 15, fontWeight: 700, fontFamily: dm, cursor: imgPreview ? "pointer" : "not-allowed", zIndex: 10 }}>Publier mon post 🔥</button>
    </div>
  );
}

function SuccessScreen({ d, onBack }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", gap: 14 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff" }}>🔥</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Post publié !</div>
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Ton post est en ligne sur le fil.<br />Tu participes maintenant au <strong>{d.title}</strong>.</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF8E8", color: "#B45309", fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 20 }}>⚡ +15 XP gagnés</div>
      <button onClick={onBack} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 16, padding: "13px 28px", fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer", marginTop: 6 }}>Voir les autres défis</button>
    </div>
  );
}

export default function ChipeurDefis({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(0);
  const [filter, setFilter] = useState("Tous");

  const d = defisData[selectedId];
  const filters = ["Tous", "En cours", "Terminés", "Mes défis"];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: dm, color: C.ink }}>

        {screen === "list" && <>
          <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Défis 🏆</div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, marginBottom: 14 }}>Rejoins les challenges du quartier</div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "0 20px 12px", overflowX: "auto", flexShrink: 0