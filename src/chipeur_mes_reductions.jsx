import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function StatusBar() { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}><span>9:41</span><span>●●●</span></div>; }

function BottomNav({ active, onNavigate, onFab }) {
  const items = [{ id: "fil", icon: "🏠", label: "Fil" }, { id: "sorties", icon: "📅", label: "Sorties" }, { id: "fab", isFab: true }, { id: "commerces", icon: "🏪", label: "Commerces" }, { id: "profil", icon: "👤", label: "Profil", active: true }];
  return <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>{items.map(it => it.isFab ? <div key="fab" onClick={onFab} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div> : <div key={it.id} onClick={() => onNavigate(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer" }}><div style={{ fontSize: 18 }}>{it.icon}</div><span>{it.label}</span></div>)}</div>;
}

const reductions = [
  { id: 0, emoji: "👗", logoBg: "#EBF5F0", name: "Atelier Mona", tag: "Ciblée pour toi", tagBg: "#E8F4FD", tagColor: "#1565C0", amount: "-15%", expiry: "Exp. 2 mai", reason: "Envoyée car tu t'es montrée intéressée par 3 de leurs posts cette semaine", code: "MONA15", conditions: "1 utilisation · min. 30€", type: "Ciblée sur intérêt", validUntil: "2 mai 2026", cat: "cible", used: false },
  { id: 1, emoji: "👟", logoBg: "#FFF3E0", name: "TrendBox", tag: "Offre spéciale", tagBg: C.proBg, tagColor: C.pro, amount: "-20%", expiry: "Exp. 27 avr.", reason: "Soldes privées membres Chipeur — weekend uniquement", code: "TREND20", conditions: "Weekend uniquement", type: "Offre spéciale", validUntil: "27 avr. 2026", cat: "offre", used: false },
  { id: 2, emoji: "💅", logoBg: "#F0E8FF", name: "Studio Lara", tag: "Ciblée pour toi", tagBg: "#E8F4FD", tagColor: "#1565C0", amount: "-10%", expiry: "Exp. 10 mai", reason: "Offre membres actifs du quartier Saint-Michel", code: "LARA10", conditions: "Min. 25€", type: "Ciblée sur activité", validUntil: "10 mai 2026", cat: "cible", used: false },
  { id: 3, emoji: "🍜", logoBg: "#F5F2EE", name: "Maison Fuji", tag: "Offre spéciale", tagBg: C.proBg, tagColor: C.pro, amount: "-5€", expiry: "Utilisée 18 avr.", reason: "", code: "", conditions: "", type: "", validUntil: "", cat: "offre", used: true },
];

function DetailScreen({ item, setPage }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={() => setPage("profil")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Ma réduction</span>
      </div>
      <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: item.logoBg }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{item.emoji}</div>
        <div style={{ fontFamily: syne, fontSize: 16, fontWeight: 700, color: C.pro }}>{item.name}</div>
        <div style={{ fontSize: 11, color: C.pro, opacity: 0.75, marginTop: 2 }}>Réduction ciblée · {item.amount}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 12, lineHeight: 1.5 }}>Offre exclusive envoyée car tu es intéressée par leurs créations. Valable sur toute la collection printemps-été.</div>
        <div style={{ background: C.bg, border: "1.5px dashed rgba(26,23,20,0.2)", borderRadius: 16, padding: 16, textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Ton code promo</div>
          <div style={{ fontFamily: syne, fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: 5, marginBottom: 10 }}>{item.code}</div>
          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ width: "100%", padding: 11, borderRadius: 12, background: copied ? C.pro : C.accent, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.3s" }}>{copied ? "Code copié !" : "Copier le code"}</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 14 }}>
          {[["Enseigne", item.name], ["Valable jusqu'au", item.validUntil], ["Conditions", item.conditions], ["Type", item.type]].map(([k, v], i) => (
            <tr key={i}><td style={{ padding: "8px 4px", borderBottom: `1px solid ${C.border}`, color: C.ink2, width: "42%" }}>{k}</td><td style={{ padding: "8px 4px", borderBottom: `1px solid ${C.border}`, fontWeight: 500, textAlign: "right" }}>{v}</td></tr>
          ))}
        </table>
        <button style={{ width: "100%", padding: 12, borderRadius: 14, background: C.pro, color: "#fff", fontFamily: dm, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", marginBottom: 10 }}>Voir la vitrine {item.name}</button>
        <button style={{ width: "100%", padding: 12, borderRadius: 14, background: "transparent", border: `1.5px solid ${C.border}`, color: C.ink2, fontFamily: dm, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Signaler un problème</button>
      </div>
    </div>
  );
}

export default function MesReductions({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("tous");

  const filters = [{ id: "tous", label: "Toutes" }, { id: "cible", label: "Ciblées" }, { id: "offre", label: "Offres spéciales" }, { id: "used", label: "Utilisées" }];

  const dispo = reductions.filter(r => !r.used && (filter === "tous" || r.cat === filter));
  const used = reductions.filter(r => r.used);
  const showDispo = filter !== "used";
  const showUsed = filter === "tous" || filter === "used";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

        {screen === "list" && <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
            <button onClick={() => setPage("profil")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink, lineHeight: 1, padding: 0 }}>←</button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, margin: 0 }}>Mes réductions</h1>
              <p style={{ fontSize: 10, color: C.ink2, margin: 0 }}>Offres envoyées par les commerces du quartier</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "0 12px 8px", overflowX: "auto", flexShrink: 0 }}>
            {filters.map(f => <button key={f.id} onClick={() => setFilter(f.id)} style={{ fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: filter === f.id ? C.ink : C.pill, color: filter === f.id ? "#fff" : C.ink2, fontFamily: dm }}>{f.label}</button>)}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
            {showDispo && dispo.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 0 6px" }}>Disponibles · {dispo.length}</div>
              {dispo.map(r => (
                <div key={r.id} onClick={() => { setSelectedItem(r); setScreen("detail"); }} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 8px" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: r.logoBg }}>{r.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, marginBottom: 3, background: r.tagBg, color: r.tagColor }}>{r.tag}</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{r.name}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                      <div style={{ fontFamily: syne, fontSize: 26, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{r.amount}</div>
                      <div style={{ fontSize: 9, color: C.ink2, marginTop: 2 }}>{r.expiry}</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: C.border }} />
                  <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4, padding: "8px 12px 4px" }}>{r.reason}</div>
                  <div style={{ display: "flex", gap: 6, padding: "8px 12px 12px" }}>
                    <button onClick={e => { e.stopPropagation(); setSelectedItem(r); setScreen("detail"); }} style={{ flex: 1, padding: 9, borderRadius: 12, fontSize: 12, fontWeight: 600, fontFamily: dm, border: "none", cursor: "pointer", background: C.accent, color: "#fff" }}>Voir le code</button>
                    <button onClick={e => { e.stopPropagation(); setPage("profilMagasin"); }} style={{ flex: 1, padding: 9, borderRadius: 12, fontSize: 12, fontWeight: 600, fontFamily: dm, border: `1.5px solid ${C.border}`, cursor: "pointer", background: "transparent", color: C.ink }}>Voir la vitrine</button>
                  </div>
                </div>
              ))}
            </>}
            {showUsed && used.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 0 6px" }}>Utilisées · {used.length}</div>
              {used.map(r => (
                <div key={r.id} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, opacity: 0.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: r.logoBg }}>{r.emoji}</div>
                    <div style={{ flex: 1 }}><span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, marginBottom: 3, background: r.tagBg, color: r.tagColor }}>{r.tag}</span><div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{r.name}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontFamily: syne, fontSize: 26, fontWeight: 700, color: C.ink2, lineHeight: 1 }}>{r.amount}</div><div style={{ fontSize: 9, color: C.ink2, marginTop: 2 }}>{r.expiry}</div></div>
                  </div>
                </div>
              ))}
            </>}
          </div>
        </>}

        {screen === "detail" && selectedItem && 
  <DetailScreen item={selectedItem} setPage={setPage} />
}
        <BottomNav
  active="profil"
  onNavigate={setPage}
  onFab={() => setPage("nouveau")}
/>
    </div>
  );
}
