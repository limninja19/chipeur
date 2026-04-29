import { useState } from "react";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)" };
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const rewardOptions = [
  { id: "none", title: "Aucune récompense", sub: "Défi pour l'engagement uniquement", hasVoucher: false, hasRemise: false },
  { id: "both", title: "Bon d'achat gagnants + remise participants", sub: "Les meilleurs gagnent un bon, tous reçoivent une remise", hasVoucher: true, hasRemise: true },
  { id: "voucher", title: "Bon d'achat gagnants uniquement", sub: "Seuls les meilleurs participants reçoivent un bon", hasVoucher: true, hasRemise: false },
  { id: "remise", title: "Remise pour tous les participants", sub: "Tous ceux qui participent reçoivent une réduction", hasVoucher: false, hasRemise: true },
];

function StatusBar() { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0, background: C.pro, color: "#fff" }}><span>9:41</span><span>●●●</span></div>; }

function Label({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>{children}</div>; }
function Input(props) { return <input {...props} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box", ...(props.style || {}) }} />; }

export default function ChipeurCreerDefi() {
  const [screen, setScreen] = useState("form");
  const [reward, setReward] = useState("both");
  const [titre, setTitre] = useState("Montre ta tenue Atelier Mona !");
  const [desc, setDesc] = useState("Poste ta tenue avec nos pièces et inspire le quartier");
  const [icone, setIcone] = useState("👗");
  const [objectif, setObjectif] = useState("50");
  const [dateFin, setDateFin] = useState("31/05/2026");
  const [nbGagnants, setNbGagnants] = useState("3");
  const [montantBon, setMontantBon] = useState("20€");
  const [remiseType, setRemiseType] = useState("-10%");
  const [remiseCond, setRemiseCond] = useState("Min. 30€");

  const currentReward = rewardOptions.find(r => r.id === reward);

  const previewRewards = () => {
    if (reward === "none") return [];
    const pills = [];
    if (currentReward.hasVoucher) pills.push({ label: `🏆 Bon ${montantBon} — Top ${nbGagnants}`, cls: "gold" });
    if (currentReward.hasRemise) pills.push({ label: `🎁 ${remiseType} pour tous`, cls: "green" });
    return pills;
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
          <button style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink }}>←</button>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Créer un défi</span>
        </div>

        {screen === "form" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
            <Label>Titre du défi</Label>
            <Input value={titre} onChange={e => setTitre(e.target.value)} />
            <Label>Description</Label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><Label>Icône</Label><Input value={icone} onChange={e => setIcone(e.target.value)} /></div>
              <div><Label>Objectif participants</Label><Input value={objectif} onChange={e => setObjectif(e.target.value)} /></div>
            </div>
            <Label>Date de fin</Label>
            <Input value={dateFin} onChange={e => setDateFin(e.target.value)} />

            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 8, marginTop: 4 }}>Récompenses</div>
            {rewardOptions.map(opt => (
              <div key={opt.id} onClick={() => setReward(opt.id)} style={{
                border: `1.5px solid ${reward === opt.id ? C.accent : C.border}`,
                borderRadius: 14, padding: "10px 12px", marginBottom: 8, cursor: "pointer",
                background: reward === opt.id ? "#FFF8F6" : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reward === opt.id ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: reward === opt.id ? C.accent : "transparent" }}>
                    {reward === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{opt.title}</div>
                    <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{opt.sub}</div>
                  </div>
                </div>
                {reward === opt.id && (opt.hasVoucher || opt.hasRemise) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    {opt.hasVoucher && <>
                      <Label>Bon d'achat — Top N gagnants</Label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div><div style={{ fontSize: 10, color: C.ink2, marginBottom: 3 }}>Nombre de gagnants</div><Input value={nbGagnants} onChange={e => setNbGagnants(e.target.value)} style={{ marginBottom: 6 }} /></div>
                        <div><div style={{ fontSize: 10, color: C.ink2, marginBottom: 3 }}>Montant du bon</div><Input value={montantBon} onChange={e => setMontantBon(e.target.value)} style={{ marginBottom: 6 }} /></div>
                      </div>
                    </>}
                    {opt.hasRemise && <>
                      <Label>Remise — Tous les participants</Label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div><div style={{ fontSize: 10, color: C.ink2, marginBottom: 3 }}>Type</div><Input value={remiseType} onChange={e => setRemiseType(e.target.value)} style={{ marginBottom: 0 }} /></div>
                        <div><div style={{ fontSize: 10, color: C.ink2, marginBottom: 3 }}>Conditions</div><Input value={remiseCond} onChange={e => setRemiseCond(e.target.value)} style={{ marginBottom: 0 }} /></div>
                      </div>
                    </>}
                  </div>
                )}
              </div>
            ))}

            {/* Preview */}
            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Aperçu du défi</div>
              <div style={{ borderRadius: 12, padding: "10px 12px", background: "linear-gradient(135deg,#FF5733,#F7A72D)", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 22 }}>{icone}</div>
                <div>
                  <div style={{ fontFamily: syne, fontSize: 13, fontWeight: 700, color: "#fff" }}>{titre}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>Sponsorisé par Atelier Mona · {objectif} participants</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {previewRewards().length === 0 ? (
                  <span style={{ fontSize: 11, color: C.ink2 }}>Aucune récompense</span>
                ) : previewRewards().map((p, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 10, background: p.cls === "gold" ? "#FFF8E8" : C.proBg, color: p.cls === "gold" ? "#B45309" : C.pro }}>{p.label}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF8F6", borderRadius: 10, padding: "8px 10px", marginTop: 8, border: "1px solid rgba(232,73,10,0.12)" }}>
                <span style={{ fontSize: 14 }}>★</span>
                <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.4 }}>Apparaîtra dans la page Défis avec ton logo et le badge "Sponsorisé par Atelier Mona"</div>
              </div>
            </div>

            <button onClick={() => setScreen("success")} style={{ width: "100%", padding: 13, borderRadius: 14, background: C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Lancer le défi</button>
          </div>
        )}

        {screen === "success" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 14 }}>
            <div style={{ fontSize: 56 }}>🚀</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Défi lancé !</div>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Ton défi "<strong>{titre}</strong>" est visible dans la page Défis avec ton logo et le badge sponsorisé.</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.proBg, color: C.pro, fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 20 }}>✓ Objectif : {objectif} participants</div>
            <button onClick={() => setScreen("form")} style={{ background: C.pro, color: "#fff", border: "none", borderRadius: 16, padding: "13px 28px", fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer", marginTop: 6 }}>Retour au dashboard</button>
          </div>
        )}
    </div>
  );
}
