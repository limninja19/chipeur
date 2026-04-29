import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D",
};
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const miniDefisInit = [
  { emoji: "🐾", q: "Mon animal de compagnie", sugs: ["Un chien", "Un chat", "Pas d'animal", "Plusieurs !"], a: "Milo, mon golden 🐶", done: true, hasPhoto: true, photoBg: "#E8F4FD", photoEmoji: "🐶" },
  { emoji: "📍", q: "Mon endroit préféré", sugs: ["Place Stanislas", "Un café du coin", "La campagne", "Mon canapé"], a: "Place Stanislas le dimanche", done: true },
  { emoji: "🏪", q: "Mon magasin préféré", sugs: ["Secondhand Co.", "Atelier Mona", "TrendBox", "Autre"], a: "Secondhand Co. — sans hésiter", done: true },
  { emoji: "🍽️", q: "Mon resto du quartier", sugs: ["Maison Fuji", "Un kebab", "Je cuisine !", "Livraison only"], a: "Maison Fuji, les ramen !", done: true },
  { emoji: "🎵", q: "Ma playlist du moment", sugs: ["R&B / Soul", "Indie / Rock", "Hip-hop", "Classique"], done: false },
  { emoji: "✨", q: "Ma pépite mode du mois", sugs: ["Une veste vintage", "Des sneakers", "Un accessoire", "Une collab locale"], done: false },
];


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
      {items.map(it => it.isFab ? (
        <div key="fab" onClick={onFab} style={{
          width: 50, height: 50, borderRadius: 25, background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer",
        }}>+</div>
      ) : (
        <div key={it.id} onClick={() => onNavigate(it.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer",
        }}>
          <div style={{ fontSize: 18 }}>{it.icon}</div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function DeletePopup({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(26,23,20,0.5)",
      display: "flex", alignItems: "flex-end", zIndex: 50,
    }}>
      <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>
          Supprimer ce post ?
        </div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Cette action est irréversible.</div>
        <button onClick={onConfirm} style={{ width: "100%", background: "#E53935", color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>
          Supprimer définitivement
        </button>
        <button onClick={onCancel} style={{ width: "100%", background: C.pill, color: C.ink, border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

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
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, textAlign: "center", lineHeight: 1.3 }}>{defi.q}</div>
        <div style={{ fontSize: 12, color: C.ink2, textAlign: "center" }}>Texte ou photo — visible sur ton profil</div>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {["text", "photo"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 9, borderRadius: 12, fontSize: 12, fontWeight: 600, border: `1.5px solid ${mode === m ? C.accent : C.border}`, background: mode === m ? C.accent : C.card, color: mode === m ? "#fff" : C.ink2, cursor: "pointer", fontFamily: dm }}>
              {m === "text" ? "✏️ Texte" : "📷 Photo"}
            </button>
          ))}
        </div>
        {mode === "text" && (
          <>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="Ta réponse…" style={{ width: "100%", background: C.card, border: "2px solid rgba(255,87,51,0.25)", borderRadius: 16, padding: "12px 16px", fontSize: 14, fontFamily: dm, color: C.ink, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", width: "100%" }}>
              {defi.sugs.map(s => (
                <button key={s} onClick={() => setValue(s)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, background: value === s ? C.accent : C.pill, color: value === s ? "#fff" : C.ink2, border: "none", cursor: "pointer", fontFamily: dm }}>{s}</button>
              ))}
            </div>
          </>
        )}
        {mode === "photo" && (
          <div style={{ width: "100%", aspectRatio: "4/3", background: C.pill, borderRadius: 16, border: "2px dashed rgba(255,87,51,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 12, color: C.ink2 }}>
            <div style={{ fontSize: 32 }}>📷</div>
            <span>Appuie pour ajouter une photo</span>
          </div>
        )}
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => onSave(value), 600); }} style={{ position: "absolute", bottom: 90, left: 20, right: 20, zIndex: 10, background: saved ? C.pro : C.accent, color: "#fff", border: "none", borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", textAlign: "center", transition: "background 0.3s" }}>
        {saved ? "✓ Enregistré !" : "Enregistrer · +5 XP ✓"}
      </button>
    </div>
  );
}

const VILLES = [
  "Saint-Dié-des-Vosges",
  "Gérardmer",
  "Fraize",
  "Senones",
  "Bruyères",
  "Épinal",
  "Remiremont",
  "Alentours de Saint-Dié",
  "Autre",
];

function EditProfileScreen({ onBack, profile, updateProfile, user }) {
  const [name, setName] = useState(profile?.pseudo || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loc, setLoc] = useState(profile?.quartier || "Saint-Dié-des-Vosges");
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box" };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    let avatar_url = profile?.avatar_url || null;
    if (avatarFile && user?.id) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || "image/jpeg" });
      if (!upErr) {
        const { data } = supabase.storage.from("images").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }
    }
    await updateProfile({ pseudo: name, bio, quartier: loc, avatar_url });
    setSaved(true);
    setSaving(false);
    setTimeout(onBack, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}>←</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, flex: 1 }}>Modifier le profil</div>
        <button onClick={handleSave} disabled={saving} style={{ background: saved ? C.pro : C.accent, color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, fontFamily: dm, cursor: saving ? "not-allowed" : "pointer", transition: "background 0.3s" }}>
          {saving ? "..." : saved ? "✓ Sauvé" : "Sauver"}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px" }}>
        {/* Photo de profil */}
        <input type="file" accept="image/*" id="avatar-input" style={{ display: "none" }} onChange={handleAvatarFile} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <label htmlFor="avatar-input" style={{ cursor: "pointer", position: "relative" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `3px solid ${C.gold}`, overflow: "hidden" }}>
              {avatarPreview
                ? <img src={avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🧑‍🦱"}
            </div>
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", border: `2px solid ${C.card}` }}>📷</div>
          </label>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 10 }}>Appuie pour changer la photo</div>
        </div>

        {/* Pseudo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Pseudo</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ton pseudo visible par les voisins" style={inp} />
        </div>

        {/* Ville — menu déroulant */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Ville / Secteur</label>
          <select value={loc} onChange={e => setLoc(e.target.value)} style={{ ...inp, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6560' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}>
            {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Dis quelque chose sur toi…" style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
        </div>

        <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.5, padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
          Ton pseudo, ta ville et ta bio sont visibles par tous les voisins du quartier.
        </div>
      </div>
    </div>
  );
}

// ─── PARTIE SCROLLABLE : bannière + avatar + stats + réductions ───
function ProfileTop({ onEditProfile, setPage, profile, onLogout, postCount }) {
  return (
    <div style={{ background: C.card }}>
      {/* Bannière couverture */}
      <div style={{ height: 110, background: "linear-gradient(135deg, #1A1A2E 0%, #FF5733 60%, #F7A72D 100%)", position: "relative" }}>
        <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>9:41</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>●●●</span>
        </div>
        <div style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "4px 10px", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
          ✦ Pépite du Quartier
        </div>
      </div>

      {/* Avatar + boutons */}
      <div style={{ padding: "0 16px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -30 }}>
          {/* Avatar */}
          <div style={{ position: "relative", width: 68, height: 68 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: `3px solid ${C.card}`, boxShadow: "0 2px 12px rgba(26,23,20,0.15)", overflow: "hidden" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🧑‍🦱"}
            </div>
          </div>
          {/* Boutons action */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <button onClick={onEditProfile} style={{ background: C.card, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: dm, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>✏️ Modifier</button>
            <button onClick={onLogout} style={{ background: C.card, color: C.ink2, border: `1px solid ${C.border}`, borderRadius: 12, width: 34, height: 34, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }} title="Se déconnecter">🚪</button>
          </div>
        </div>

        {/* Nom + localisation + bio */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, lineHeight: 1 }}>{profile?.pseudo || "Mon profil"}</div>
          <div style={{ fontSize: 11, color: C.ink2, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, background: C.accent, borderRadius: "50%", flexShrink: 0 }} />
            {profile?.quartier || "Saint-Dié-des-Vosges"}
          </div>
          <div style={{ fontSize: 12, color: C.ink2, marginTop: 6, lineHeight: 1.5 }}>
            {profile?.bio || "Ajoute une bio dans ton profil ✏️"}
          </div>
        </div>

        {/* XP bar réaliste */}
        {(() => {
          const xp = postCount * 10;
          const levels = [
            { name: "Débutant·e", min: 0, max: 50 },
            { name: "Explorateur·trice", min: 50, max: 150 },
            { name: "Pépite du Quartier", min: 150, max: 300 },
            { name: "Légende Locale", min: 300, max: 500 },
          ];
          const lvl = levels.find(l => xp < l.max) || levels[levels.length - 1];
          const pct = Math.min(100, Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100));
          const nextXp = lvl.max - xp;
          return (
            <div style={{ marginTop: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>⚡ {xp} XP · {lvl.name}</span>
                <span style={{ fontSize: 10, color: C.ink2 }}>{nextXp > 0 ? `+${nextXp} XP pour progresser` : "Niveau max 🏆"}</span>
              </div>
              <div style={{ height: 5, background: C.pill, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: "linear-gradient(90deg,#FF5733,#F7A72D)", transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        {[
          { n: String(postCount), l: "publications" },
          { n: "0", l: "abonnés" },
          { n: "#—", l: "classement", color: C.gold },
          { n: "0", l: "XP ce mois", color: C.accent },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: s.color || C.ink }}>{s.n}</div>
            <div style={{ fontSize: 9, color: C.ink2, marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Bandeau réductions */}
      <div onClick={() => setPage("reductions")} style={{ padding: "10px 16px 0", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, #FFF8F6, #FFF0EB)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(255,87,51,0.2)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎁</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: syne, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mes réductions</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>Bons d'achat disponibles</div>
          </div>
          <div style={{ background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 10, flexShrink: 0 }}>→</div>
        </div>
      </div>
    </div>
  );
}

// ─── ONGLETS STICKY ───
function StickyTabs({ activeTab, onTabChange }) {
  const tabs = ["Posts", "Mon univers", "Défis", "Récompenses"];
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: C.card, borderBottom: `1px solid ${C.border}`,
      display: "flex",
    }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onTabChange(t)} style={{
          flex: 1, padding: "11px 0", textAlign: "center",
          fontSize: 10, fontWeight: activeTab === t ? 700 : 500,
          border: "none", background: "none", cursor: "pointer",
          color: activeTab === t ? C.accent : C.ink2,
          fontFamily: dm,
          borderBottom: `2px solid ${activeTab === t ? C.accent : "transparent"}`,
          transition: "all 0.15s",
        }}>{t}</button>
      ))}
    </div>
  );
}

function TabPosts({ posts, onDelete, loading }) {
  if (loading) return <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>Chargement…</div>;
  if (posts.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun post pour l'instant</div>
      <div style={{ fontSize: 12, color: C.ink2 }}>Publie ta première trouvaille depuis le fil !</div>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {posts.map(p => (
        <div key={p.id} style={{ borderRadius: 14, aspectRatio: "1", position: "relative", overflow: "hidden", cursor: "pointer", background: C.pill }}>
          {p.image_url ? (
            <img src={p.image_url} alt={p.content} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, boxSizing: "border-box" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📝</div>
              <div style={{ fontSize: 10, color: C.ink2, textAlign: "center", lineHeight: 1.4 }}>{p.content?.slice(0, 50)}{p.content?.length > 50 ? "…" : ""}</div>
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(p.id); }} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, background: "rgba(26,23,20,0.55)", borderRadius: "50%", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(26,23,20,0.65))", padding: "16px 8px 7px" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>
              {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabUnivers({ items, onOpen }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>Mon univers</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "3px 10px", borderRadius: 8 }}>+5 XP par réponse</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} onClick={() => onOpen(i)} style={{ background: it.done ? C.card : "transparent", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: it.done ? `1px solid ${C.border}` : "1px dashed rgba(255,87,51,0.25)", padding: it.hasPhoto ? 0 : 12 }}>
            {it.hasPhoto ? (
              <>
                <div style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: it.photoBg }}>{it.photoEmoji}</div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: C.ink2 }}>{it.q}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{it.a}</div>
                  <div style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginTop: 3 }}>+5 XP ✓</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 22, marginBottom: 4, opacity: it.done ? 1 : 0.4 }}>{it.emoji}</div>
                <div style={{ fontSize: 9, color: C.ink2, marginBottom: 3 }}>{it.q}</div>
                {it.done ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{it.a}</div>
                    <div style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginTop: 3 }}>+5 XP ✓</div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>+ Répondre · +5 XP</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function TabDefis() {
  const defis = [
    { icon: "👟", title: "Défi Sneakers", sub: "Post publié il y a 12 min", stat: "🔥 18 · 👁 84 vues", xp: "+15 XP", grad: "linear-gradient(135deg,#FF5733,#F7A72D)" },
    { icon: "🧥", title: "Vintage Revival", sub: "Post publié hier", stat: "💛 9 · 👁 41 vues", xp: "+15 XP", grad: "linear-gradient(135deg,#5B2D8E,#9B59B6)" },
    { icon: "🌿", title: "Look Éco-Responsable", sub: "Terminé · Non participé", stat: "—", xp: "0 XP", ended: true },
  ];
  return (
    <>
      {defis.map((d, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 16, marginBottom: 8, overflow: "hidden", border: `1px solid ${C.border}`, opacity: d.ended ? 0.5 : 1 }}>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, background: d.ended ? C.pill : d.grad }}>
            <div style={{ fontSize: 22 }}>{d.icon}</div>
            <div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: d.ended ? C.ink : "#fff" }}>{d.title}</div>
              <div style={{ fontSize: 10, color: d.ended ? C.ink2 : "rgba(255,255,255,0.8)", marginTop: 1 }}>{d.sub}</div>
            </div>
          </div>
          <div style={{ padding: "8px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: C.ink2 }}>{d.stat}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, color: d.ended ? C.ink2 : C.accent, background: d.ended ? C.pill : "#FFF0EB" }}>{d.xp}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function TabRewards() {
  const lb = [
    { r: "1", n: "Ambre K.", lv: "Légende Locale", xp: "1 240 XP", bg: "#FEF3E0", av: "👩", rc: "#E8A020" },
    { r: "2", n: "Sofia D.", lv: "Légende Locale", xp: "890 XP", bg: "#F7EEF7", av: "🧑", rc: "#8A9AAA" },
    { r: "3", n: "Lucas M. (toi)", lv: "Pépite du Quartier", xp: "720 XP", bg: "#E8F4FD", av: "🧑‍🦱", rc: "#A0714A", me: true },
    { r: "4", n: "Théo R.", lv: "Explorateur·trice", xp: "540 XP", bg: "#EBF5F0", av: "🧑" },
  ];
  const tr = [
    { icon: "✨", nm: "1ère Pépite", dt: "Obtenu fév. 2026", w: true },
    { icon: "🏆", nm: "Top 3 du mois", dt: "Obtenu mars 2026", w: true },
    { icon: "🔥", nm: "Série de 7 jours", dt: "Obtenu mars 2026", w: true },
    { icon: "👑", nm: "Légende Locale", dt: "280 XP manquants", w: false },
  ];
  return (
    <>
      <div style={{ background: "linear-gradient(135deg,#1A1714,#3D3530)", borderRadius: 18, padding: 16, marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -8, top: -8, fontSize: 64, opacity: 0.12 }}>🏆</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Classement · Avril 2026</span>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 8 }}>28 voisins actifs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 44, color: C.gold, lineHeight: 1 }}>#3</div>
          <div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: "#fff" }}>720 XP ce mois</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Encore 80 XP pour passer #2</div>
          </div>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: "72%", borderRadius: 3, background: "linear-gradient(90deg,#FF5733,#F7A72D)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          <span>0</span><span>Top 3 → bon d'achat</span><span>1000 XP</span>
        </div>
      </div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Top voisins du mois</div>
      {lb.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: l.me ? "#FFF8F6" : C.card, borderRadius: 14, padding: "10px 12px", marginBottom: 6, border: `1px solid ${l.me ? "rgba(255,87,51,0.3)" : C.border}` }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: l.rc || C.ink2, width: 22, textAlign: "center" }}>{l.r}</div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: l.bg }}>{l.av}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{l.n}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{l.lv}</div>
          </div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.accent }}>{l.xp}</div>
        </div>
      ))}
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginTop: 14, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mes bons d'achat</div>
      <div style={{ background: "linear-gradient(135deg,#0A3D2E,#1D9E75)", borderRadius: 16, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 28, color: "#fff" }}>10€</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Secondhand Co.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Récompense Top 3 · Mars 2026</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Expire le 31 mai 2026</div>
        </div>
        <button style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dm }}>CODE</button>
      </div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginTop: 14, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Mes trophées</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tr.map((t, i) => (
          <div key={i} style={{ background: t.w ? "#FFFBF0" : C.card, borderRadius: 14, padding: 12, border: `1px solid ${t.w ? "rgba(247,167,45,0.4)" : C.border}`, textAlign: "center", opacity: t.w ? 1 : 0.5 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{t.nm}</div>
            <div style={{ fontSize: 9, color: C.ink2, marginTop: 3 }}>{t.dt}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ChipeurProfilVoisin({ setPage, profile, updateProfile, user }) {
  const [screen, setScreen] = useState("profil");
  const [activeTab, setActiveTab] = useState("Posts");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [miniDefiIdx, setMiniDefiIdx] = useState(null);
  const [univers, setUnivers] = useState(miniDefisInit);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const postCount = posts.length;

  useEffect(() => {
    if (!user?.id) { setPostsLoading(false); return; }
    supabase
      .from("posts")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
        setPostsLoading(false);
      });
  }, [user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column",
    }}>
      {screen === "profil" && (
        <>
          {/* Zone scroll : bannière + avatar + stats + réductions + onglets sticky + contenu */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ProfileTop onEditProfile={() => setScreen("edit")} setPage={setPage} profile={profile} onLogout={handleLogout} postCount={postCount} />
            <StickyTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div style={{ padding: "12px 14px 20px" }}>
              {activeTab === "Posts" && <TabPosts posts={posts} onDelete={id => setDeleteTarget(id)} loading={postsLoading} />}
              {activeTab === "Mon univers" && <TabUnivers items={univers} onOpen={i => { setMiniDefiIdx(i); setScreen("minidefi"); }} />}
              {activeTab === "Défis" && <TabDefis />}
              {activeTab === "Récompenses" && <TabRewards />}
            </div>
          </div>
        </>
      )}

      {screen === "edit" && <EditProfileScreen onBack={() => setScreen("profil")} profile={profile} updateProfile={updateProfile} user={user} />}

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
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <BottomNav active="profil" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
