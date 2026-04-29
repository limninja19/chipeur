import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function StatusBar({ dark }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0, background: dark ? C.pro : "transparent", color: dark ? "#fff" : C.ink }}><span>9:41</span><span>●●●</span></div>; }

function MagHeader() {
  return (
    <div style={{ background: C.pro, padding: "16px 16px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👗</div>
        <div><div style={{ fontFamily: syne, fontSize: 17, fontWeight: 700, color: "#fff" }}>Atelier Mona</div><span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "#FFF3E0", color: "#E65100", marginTop: 3 }}>★ Premium</span></div>
      </div>
      <div style={{ display: "flex", marginTop: 12 }}>
        {[{ v: "1 284", l: "Vues ce mois" }, { v: "47", l: "Intéressés" }, { v: "12", l: "Posts" }, { v: "3", l: "Remises actives" }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
            <div style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, color: "#fff" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabDashboard({ onEnrich }) {
  const bars = [55, 40, 70, 60, 80, 65, 100];
  const days = ["Lu", "Ma", "Me", "Je", "Ve", "Sa"];
  return <>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>Vues — 7 derniers jours</div>
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 50 }}>
        {bars.map((h, i) => <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", height: `${h}%`, background: i === 6 ? C.pro : C.proBg }} />)}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
        {[...days, "Auj."].map((d, i) => <div key={i} style={{ flex: 1, fontSize: 8, color: i === 6 ? C.pro : C.ink2, textAlign: "center", fontWeight: i === 6 ? 600 : 400 }}>{d}</div>)}
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
      {[{ v: "284", l: "Vues aujourd'hui", d: "↑ +18% vs hier" }, { v: "12", l: "Nouveaux intéressés", d: "↑ +3 vs hier" }].map((r, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
          <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: C.ink }}>{r.v}</div>
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{r.l}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.pro, marginTop: 2 }}>{r.d}</div>
        </div>
      ))}
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px", display: "flex", alignItems: "center", gap: 4 }}>Posts voisins à enrichir <span style={{ background: C.accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8 }}>2 nouveaux</span></div>
    {[{ emoji: "👗", name: "Camille R. · il y a 2h", desc: "\"Cette robe lin est incroyable pour l'été...\"" }, { emoji: "👒", name: "Sophie M. · il y a 5h", desc: "\"Le chapeau paille que j'ai trouvé ici...\"" }].map((e, i) => (
      <div key={i} onClick={i === 0 ? onEnrich : undefined} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", gap: 10, padding: 10, marginBottom: 8, cursor: "pointer", alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{e.emoji}</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{e.name}</div><div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.3 }}>{e.desc}</div></div>
        <span style={{ fontSize: 9, fontWeight: 700, background: C.accent, color: "#fff", padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}>Nouveau</span>
      </div>
    ))}
  </>;
}

function TabPosts() {
  const posts = [
    { emoji: "👗", badge: "★ Sponsorisé", cls: { background: "#FFF3E0", color: "#E65100" } },
    { emoji: "👜", badge: "★ Enrichi", cls: { background: C.proBg, color: C.pro } },
    { emoji: "👒", badge: "★ Pépite", cls: { background: "#F3E8FF", color: "#6B21A8" } },
    { emoji: "🧣" },
    { emoji: "👠", badge: "★ Enrichi", cls: { background: C.proBg, color: C.pro } },
    { emoji: "🕶️" },
  ];
  return <>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>Mes publications · {posts.length}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {posts.map((p, i) => (
        <div key={i} style={{ borderRadius: 12, aspectRatio: "1", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, position: "relative", overflow: "hidden", cursor: "pointer" }}>
          {p.emoji}
          {p.badge && <span style={{ position: "absolute", bottom: 5, left: 5, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 6, ...p.cls }}>{p.badge}</span>}
        </div>
      ))}
    </div>
  </>;
}

function TabCreer() {
  const [mode, setMode] = useState("remise");
  const [typeRemise, setTypeRemise] = useState("pct");
  const [ciblage, setCiblage] = useState("interesse");
  const [published, setPublished] = useState(false);

  return <>
    <div style={{ display: "flex", background: C.pill, borderRadius: 14, padding: 3, marginBottom: 12 }}>
      {[{ id: "remise", label: "Créer une remise" }, { id: "defi", label: "Créer un défi" }].map(t => (
        <button key={t.id} onClick={() => { setMode(t.id); setPublished(false); }} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: dm, padding: 7, borderRadius: 11, border: "none", cursor: "pointer", background: mode === t.id ? C.card : "transparent", color: mode === t.id ? C.ink : C.ink2 }}>{t.label}</button>
      ))}
    </div>

    {published ? (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 6 }}>{mode === "remise" ? "Remise publiée !" : "Défi lancé !"}</div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16 }}>{mode === "remise" ? "Les voisins ciblés vont recevoir ta réduction." : "Ton défi apparaît dans la page Défis."}</div>
        <button onClick={() => setPublished(false)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "10px 24px", fontSize: 13, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Créer un autre</button>
      </div>
    ) : mode === "remise" ? <>
      <Label>Titre de l'offre</Label>
      <Input defaultValue="Collection lin -15%" />
      <Label>Type de remise</Label>
      <div style={{ display: "flex", background: C.pill, borderRadius: 12, padding: 3, marginBottom: 10 }}>
        {[{ id: "pct", l: "Pourcentage (%)" }, { id: "eur", l: "Montant (€)" }].map(t => (
          <button key={t.id} onClick={() => setTypeRemise(t.id)} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: dm, padding: 6, borderRadius: 10, border: "none", cursor: "pointer", background: typeRemise === t.id ? C.card : "transparent", color: typeRemise === t.id ? C.ink : C.ink2 }}>{t.l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div><Label>Valeur</Label><Input defaultValue="15" /></div>
        <div><Label>Expire le</Label><Input defaultValue="02/05/2026" /></div>
      </div>
      <Label>Ciblage</Label>
      {[{ id: "interesse", t: "Intéressées seulement", s: "Envoyé uniquement aux voisins ayant cliqué \"Intéressée·e\"" }, { id: "all", t: "Tous mes abonnés", s: "Envoyé à l'ensemble de tes abonnés" }].map(c => (
        <div key={c.id} onClick={() => setCiblage(c.id)} style={{ border: `1.5px solid ${ciblage === c.id ? C.accent : C.border}`, borderRadius: 14, padding: 10, marginBottom: 8, cursor: "pointer", background: ciblage === c.id ? "#FFF8F6" : "transparent" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{c.t}</div>
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 2 }}>{c.s}</div>
        </div>
      ))}
      <Label>Conditions (optionnel)</Label>
      <Input placeholder="ex : Min. 30€, 1 utilisation par personne" />
      <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 }}>Aperçu de la card voisin</div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 10, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👗</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 600, color: "#1565C0", background: "#E8F4FD", display: "inline-block", padding: "2px 6px", borderRadius: 6, marginBottom: 3 }}>Ciblée pour toi</div><div style={{ fontSize: 12, fontWeight: 600 }}>Atelier Mona</div><div style={{ fontSize: 10, color: C.ink2 }}>Collection lin -15%</div></div>
        <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: C.accent }}>-15%</div>
      </div>
      <button onClick={() => setPublished(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: C.accent, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Publier la remise</button>
    </> : <>
      <Label>Titre du défi</Label>
      <Input defaultValue="Montre ta tenue Atelier Mona !" />
      <Label>Description</Label>
      <Input defaultValue="Poste ta tenue avec nos pièces et inspire le quartier" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div><Label>Icône</Label><Input defaultValue="👗" /></div>
        <div><Label>Objectif</Label><Input defaultValue="50" /></div>
      </div>
      <Label>Date de fin</Label>
      <Input defaultValue="31/05/2026" />
      <Label>Récompense pour les participants (optionnel)</Label>
      <div style={{ border: `1.5px solid ${C.accent}`, borderRadius: 14, padding: 10, marginBottom: 8, background: "#FFF8F6" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Remise -10% pour tous les participants</div>
        <div style={{ fontSize: 10, color: C.ink2, marginTop: 2 }}>Envoyée automatiquement à chaque voisin qui participe</div>
      </div>
      <div style={{ background: "#FFF8F6", borderRadius: 12, padding: 10, marginBottom: 10, border: "1px solid rgba(232,73,10,0.15)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.accent, marginBottom: 3 }}>★ Défi sponsorisé</div>
        <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4 }}>Ton défi apparaîtra dans la page Défis avec ton logo et le badge "Sponsorisé par Atelier Mona"</div>
      </div>
      <button onClick={() => setPublished(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Lancer le défi</button>
    </>}
  </>;
}

function TabPlan() {
  return <>
    <div style={{ background: C.pro, borderRadius: 18, padding: 16, marginBottom: 10 }}>
      <div style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, color: "#fff" }}>Plan Premium</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>59,90€ / mois</div>
      <div style={{ fontSize: 11, color: C.accent2, marginTop: 6 }}>Renouvellement le 25 mai 2026</div>
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>Fonctionnalités incluses</div>
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: 12 }}>
      {["Vitrine + Pro Layer", "Contenu sponsorisé", "Créer des remises ciblées", "Créer des défis sponsorisés", "Dashboard ROI avancé", "Support prioritaire"].map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: C.proBg, color: C.pro, flexShrink: 0 }}>✓</span>
          <span>{f}</span>
        </div>
      ))}
    </div>
  </>;
}

function EnrichScreen({ onBack }) {
  const [published, setPublished] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <StatusBar dark={false} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Enrichir ce post</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {published ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 6 }}>Post enrichi !</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16 }}>Le Pro Layer est visible sur le post de Camille.</div>
            <button onClick={onBack} style={{ background: C.pro, color: "#fff", border: "none", borderRadius: 14, padding: "10px 24px", fontSize: 13, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Retour au dashboard</button>
          </div>
        ) : <>
          <div style={{ width: "100%", aspectRatio: "4/3", background: C.pill, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, marginBottom: 12 }}>👗</div>
          <div style={{ fontSize: 12, color: C.ink2, marginBottom: 12 }}>"Cette robe lin est incroyable pour l'été !" — <b>Camille R.</b></div>
          <Label>Nom du produit</Label>
          <Input defaultValue="Robe Lin Naturel — Collection Été 2026" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><Label>Prix</Label><Input defaultValue="89€" /></div>
            <div><Label>Tailles dispo</Label><Input defaultValue="XS S M L" /></div>
          </div>
          <Label>Description courte</Label>
          <Input defaultValue="Lin 100% naturel, coupe ample, disponible en 3 coloris" />
          <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 }}>Aperçu Pro Layer</div>
          <div style={{ background: C.proBg, borderRadius: 12, padding: 10, border: "1px solid rgba(10,61,46,0.12)", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: C.pro, fontWeight: 600, marginBottom: 4 }}>★ Enrichi par Atelier Mona</div>
            <div style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: C.pro }}>89€</div>
            <div style={{ fontSize: 11, color: C.pro, opacity: 0.8 }}>XS · S · M · L</div>
            <div style={{ fontSize: 10, color: C.pro, opacity: 0.7, marginTop: 3 }}>Lin 100% naturel, coupe ample, 3 coloris</div>
          </div>
          <button onClick={() => setPublished(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Publier l'enrichissement</button>
        </>}
      </div>
    </div>
  );
}

function Label({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4, display: "block" }}>{children}</div>; }
function Input(props) { return <input {...props} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />; }

export default function ChipeurProfilMagasin() {
  const [screen, setScreen] = useState("main");
  const [activeTab, setActiveTab] = useState("dashboard");
  const tabs = [{ id: "dashboard", label: "Dashboard" }, { id: "posts", label: "Mes posts" }, { id: "creer", label: "Créer" }, { id: "plan", label: "Mon plan" }];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

        {screen === "main" && <>
          <MagHeader />
          <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, fontSize: 10, fontWeight: 600, fontFamily: dm, padding: "10px 2px 8px", border: "none", background: "transparent", cursor: "pointer", color: activeTab === t.id ? C.accent : C.ink2, borderBottom: `2px solid ${activeTab === t.id ? C.accent : "transparent"}` }}>{t.label}</button>)}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
            {activeTab === "dashboard" && <TabDashboard onEnrich={() => setScreen("enrich")} />}
            {activeTab === "posts" && <TabPosts />}
            {activeTab === "creer" && <TabCreer />}
            {activeTab === "plan" && <TabPlan />}
          </div>
        </>}

        {screen === "enrich" && <EnrichScreen onBack={() => setScreen("main")} />}
    </div>
  );
}
