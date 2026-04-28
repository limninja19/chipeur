import { useState } from "react";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#E8490A", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);

// ─── STATUS BAR ───
function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
      <span>9:41</span><span>●●●</span>
    </div>
  );
}

// ─── TAG PILLS ───
function TagPills({ tags }) {
  const [active, setActive] = useState(tags.filter(t => t.default).map(t => t.label));
  const toggle = (label) => {
    setActive(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      {tags.map(t => {
        const isActive = active.includes(t.label);
        return (
          <button key={t.label} onClick={() => toggle(t.label)} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 20,
            border: `1.5px solid ${isActive ? C.ink : C.border}`,
            background: isActive ? C.ink : C.card,
            color: isActive ? "#fff" : C.ink2,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// ─── PHOTO ZONE ───
function PhotoZone({ hasPhotoDefault, emoji }) {
  const [hasPhoto, setHasPhoto] = useState(hasPhotoDefault || false);
  return (
    <div onClick={() => setHasPhoto(!hasPhoto)} style={{
      width: "100%", aspectRatio: "4/3", background: hasPhoto ? C.pill : C.card,
      borderRadius: 16, border: hasPhoto ? `1px solid ${C.border}` : "2px dashed rgba(26,23,20,0.15)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", marginBottom: 14, position: "relative", overflow: "hidden",
      transition: "all 0.2s",
    }}>
      {hasPhoto ? (
        <>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>{emoji || "👗"}</div>
          <button onClick={e => { e.stopPropagation(); setHasPhoto(false); }} style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(26,23,20,0.6)", color: "#fff",
            fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
            border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Changer la photo</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.4 }}>📷</div>
          <div style={{ fontSize: 11, color: C.ink2, fontWeight: 500 }}>Ajouter une photo</div>
        </>
      )}
    </div>
  );
}

// ─── MAG LINK ───
function MagLink({ defaultLinked }) {
  const [linked, setLinked] = useState(defaultLinked || false);
  return (
    <div onClick={() => setLinked(!linked)} style={{
      display: "flex", alignItems: "center", gap: 10,
      background: linked ? C.proBg : C.card,
      borderRadius: 14, border: `1.5px solid ${linked ? C.proBg : C.border}`,
      padding: "10px 12px", cursor: "pointer", marginBottom: 14,
    }}>
      <span style={{ fontSize: 20 }}>🏪</span>
      <span style={{
        fontSize: 12, fontWeight: linked ? 600 : 500,
        color: linked ? C.pro : C.ink2, flex: 1,
      }}>{linked ? "Atelier Mona" : "Associer un commerce du quartier"}</span>
      <span style={{ fontSize: 14, color: C.ink2 }}>{linked ? "✕" : "→"}</span>
    </div>
  );
}

// ─── PEPITE TOGGLE ───
function PepiteToggle() {
  const [on, setOn] = useState(false);
  return (
    <div onClick={() => setOn(!on)} style={{
      display: "flex", alignItems: "center", gap: 10,
      background: on ? "#F5F0FF" : C.card,
      borderRadius: 14, border: `1.5px solid ${on ? "#7C3AED" : C.border}`,
      padding: "10px 12px", marginBottom: 14, cursor: "pointer",
    }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Marquer comme Pépite</div>
        <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>+25 XP si validé par la communauté</div>
      </div>
      <div style={{
        width: 34, height: 20, borderRadius: 10,
        background: on ? "#7C3AED" : C.pill,
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: on ? 16 : 2,
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ─── FORM: DECOUVERTE ───
function FormDecouverte() {
  return (
    <>
      <PhotoZone hasPhotoDefault={true} emoji="👗" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Description</label>
        <textarea defaultValue="Trouvé cette robe lin au vide-grenier ce matin, qualité incroyable pour 8€ !" style={{
          width: "100%", padding: "10px 12px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: C.ink, background: C.card, outline: "none",
          resize: "none", height: 80, lineHeight: 1.5, boxSizing: "border-box",
        }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink defaultLinked={true} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Tags</label>
        <TagPills tags={[
          { label: "Lin", default: true }, { label: "Vintage", default: true },
          { label: "Été", default: false }, { label: "Vide-grenier", default: false },
          { label: "Seconde main", default: false }, { label: "Mode durable", default: false },
        ]} />
      </div>
      <PepiteToggle />
    </>
  );
}

// ─── FORM: SORTIE ───
function FormSortie() {
  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 12,
    border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
    fontSize: 12, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box",
  };
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Titre de la sortie</label>
        <input type="text" placeholder="ex : Vide-grenier de la Plaine" style={inputStyle} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Date</label>
          <input type="text" placeholder="26/04/2026" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Heure</label>
          <input type="text" placeholder="9h – 18h" style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lieu</label>
        <input type="text" placeholder="ex : Place Jean Jaurès" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Description (optionnel)</label>
        <textarea placeholder="Donne envie aux voisins d'y aller..." style={{ ...inputStyle, resize: "none", height: 80, lineHeight: 1.5 }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Type de sortie</label>
        <TagPills tags={[
          { label: "Vide-grenier" }, { label: "Marché" }, { label: "Fête" },
          { label: "Concert" }, { label: "Sport" }, { label: "Expo" }, { label: "Gratuit" },
        ]} />
      </div>
    </>
  );
}

// ─── FORM: BON PLAN ───
function FormBonPlan() {
  return (
    <>
      <PhotoZone hasPhotoDefault={false} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Ton conseil ou adresse</label>
        <textarea placeholder="Partage ton bon plan avec les voisins..." style={{
          width: "100%", padding: "10px 12px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: C.ink, background: C.card, outline: "none",
          resize: "none", height: 80, lineHeight: 1.5, boxSizing: "border-box",
        }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Tags</label>
        <TagPills tags={[
          { label: "Adresse" }, { label: "Astuce" }, { label: "Promo" },
          { label: "Qualité" }, { label: "Petit prix" },
        ]} />
      </div>
    </>
  );
}

// ─── SUCCESS SCREEN ───
function SuccessScreen({ type, onBack }) {
  const msgs = {
    decouverte: "Ta découverte est maintenant visible par tous les voisins du quartier.",
    pepite: "Ta pépite est soumise à la communauté. Si elle est validée, tu gagnes +25 XP !",
    sortie: "La sortie est ajoutée à la page Sorties. Les voisins peuvent maintenant dire qu'ils y vont !",
    bonplan: "Ton bon plan est partagé avec le quartier !",
  };
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Post publié !</div>
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 24 }}>{msgs[type] || msgs.decouverte}</div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#FFF8E8", color: "#B45309", fontSize: 13, fontWeight: 700,
        padding: "8px 18px", borderRadius: 20, marginBottom: 24,
      }}>⚡ +10 XP gagnés</div>
      <button onClick={onBack} style={{
        width: "100%", padding: 13, borderRadius: 16,
        background: C.accent, color: "#fff",
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
        border: "none", cursor: "pointer",
      }}>Retour au fil</button>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurNouveauPost() {
  const [screen, setScreen] = useState("form");
  const [selectedType, setSelectedType] = useState("decouverte");

  const types = [
    { id: "decouverte", icon: "👗", name: "Découverte", desc: "Une trouvaille mode, un coup de cœur" },
    { id: "pepite", icon: "⭐", name: "Pépite", desc: "LA pièce incontournable du moment" },
    { id: "sortie", icon: "📅", name: "Sortie", desc: "Un événement, une sortie à faire" },
    { id: "bonplan", icon: "💡", name: "Bon plan", desc: "Un conseil, une adresse à ne pas rater" },
  ];

  const formMap = {
    decouverte: <FormDecouverte />,
    pepite: <FormDecouverte />,
    sortie: <FormSortie />,
    bonplan: <FormBonPlan />,
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>

        {screen === "form" && (
          <>
            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px 8px", borderBottom: `1px solid ${C.border}`,
              background: C.card, flexShrink: 0,
            }}>
              <button style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>✕</button>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800 }}>Nouveau post</div>
              <button onClick={() => setScreen("success")} style={{
                background: C.accent, color: "#fff", border: "none", borderRadius: 20,
                padding: "6px 16px", fontSize: 12, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}>Publier</button>
            </div>

            {/* Scroll area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
              {/* Type selection */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.ink2,
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
              }}>Que veux-tu partager ?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {types.map(t => {
                  const isSelected = selectedType === t.id;
                  return (
                    <div key={t.id} onClick={() => setSelectedType(t.id)} style={{
                      border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                      borderRadius: 16, padding: 12, cursor: "pointer",
                      background: isSelected ? "#FFF8F6" : C.card,
                      transition: "all 0.2s", textAlign: "left",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: isSelected ? "#FFF0EB" : C.pill,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, marginBottom: 8,
                      }}>{t.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: C.ink2, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic form */}
              {formMap[selectedType]}
            </div>
          </>
        )}

        {screen === "success" && (
          <>
            <SuccessScreen type={selectedType} onBack={() => setScreen("form")} />
          </>
        )}
    </div>
  );
}
