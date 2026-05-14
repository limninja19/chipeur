import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { SettingsDrawer } from "./chipeur_settings";
import { getLevel, getNextLevel, getLevelProgress, addXP } from "./chipeur_xp";
import { THEMES, miniDefisAll } from "./chipeur_univers_data";
import Avatar from "./Avatar";
import { ChallengeMedia, RewardBadge } from "./ChallengeUI";

// ─── COMPRESSION IMAGE (HEIC + taille) ──────────────────────────
async function compressImage(file, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";



function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Évén." },
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

function MiniDefiScreen({ defi, onBack, onSave, user }) {
  const [textValue, setTextValue] = useState(defi.done ? (defi.a || "") : "");
  const [photoPreview, setPhotoPreview] = useState(defi.photoUrl || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const hasText = textValue.trim().length > 0;
  // Une photo est "valide" uniquement si c'est une URL Supabase (pas blob://)
  const hasExistingPhoto = defi.photoUrl && !defi.photoUrl.startsWith("blob:");
  const hasPhoto = !!photoFile || !!hasExistingPhoto;
  const xpGained = (hasText ? 5 : 0) + (hasPhoto ? 5 : 0);

  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!hasText && !photoFile && !hasExistingPhoto) return;
    setSaving(true);
    setSaveError("");

    // Photo : si nouveau fichier → upload Supabase
    let photoUrl = hasExistingPhoto ? defi.photoUrl : null;
    if (photoFile && user?.id) {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
      const path = `univers/${user.id}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(path, photoFile, { upsert: true, contentType: photoFile.type || "image/jpeg" });
      if (upErr) {
        console.error("Upload photo univers :", upErr.message);
        setSaveError("❌ Upload photo échoué : " + upErr.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    setSaved(true);
    // On appelle onSave de façon synchrone (pas de setTimeout qui peut perdre le contexte)
    await onSave(textValue, photoUrl, xpGained);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 32, height: 32, background: C.pill, borderRadius: "50%", border: "none", fontSize: 15, cursor: "pointer" }}>‹</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, flex: 1 }}>{defi.q}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "3px 8px", borderRadius: 8 }}>
          +{xpGained > 0 ? xpGained : "5/10"} XP
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 52 }}>{defi.emoji}</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, textAlign: "center", lineHeight: 1.3 }}>{defi.q}</div>
        <div style={{ fontSize: 12, color: C.ink2, textAlign: "center" }}>Texte (+5 XP) · Photo (+5 XP) · Les deux (+10 XP) !</div>

        {/* Texte */}
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>✏️ Ta réponse en texte <span style={{ color: C.accent }}>+5 XP</span></div>
          <input value={textValue} onChange={e => setTextValue(e.target.value)} placeholder="Écris ta réponse…" style={{ width: "100%", background: C.card, border: `2px solid ${hasText ? C.accent : "rgba(255,87,51,0.2)"}`, borderRadius: 16, padding: "12px 16px", fontSize: 14, fontFamily: dm, color: C.ink, outline: "none", textAlign: "center", boxSizing: "border-box", transition: "border 0.2s" }} />
          {defi.sugs && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 }}>
              {defi.sugs.map(s => (
                <button key={s} onClick={() => setTextValue(s)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, background: textValue === s ? C.accent : C.pill, color: textValue === s ? "#fff" : C.ink2, border: "none", cursor: "pointer", fontFamily: dm }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Photo */}
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>📷 Ajouter une photo <span style={{ color: C.accent }}>+5 XP</span></div>
          <input type="file" accept="image/*" id={`defi-photo-${defi.emoji}`} style={{ display: "none" }} onChange={handlePhotoFile} />
          <label htmlFor={`defi-photo-${defi.emoji}`} style={{ display: "block", width: "100%", cursor: "pointer" }}>
            {photoPreview ? (
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 16, overflow: "hidden" }}>
                <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,23,20,0.6)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8 }}>Changer 📷</div>
                <div style={{ position: "absolute", top: 8, left: 8, background: C.accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>+5 XP ✓</div>
                {/* Bouton supprimer la photo */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setPhotoPreview(null); setPhotoFile(null); }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "none",
                    color: "#fff", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                  }}
                >✕</button>
              </div>
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", background: C.pill, borderRadius: 16, border: "2px dashed rgba(255,87,51,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ fontSize: 32 }}>📷</div>
                <span style={{ fontSize: 12, color: C.ink2, fontFamily: dm }}>Appuie pour choisir une photo</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || (!hasText && !photoFile && !hasExistingPhoto)}
        style={{ position: "absolute", bottom: 90, left: 20, right: 20, zIndex: 10, background: saved ? C.pro : (hasText || hasPhoto) ? C.accent : C.pill, color: (hasText || hasPhoto) ? "#fff" : C.ink2, border: "none", borderRadius: 16, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: (hasText || hasPhoto) ? "pointer" : "not-allowed", textAlign: "center", transition: "background 0.3s" }}
      >
        {saving ? "Enregistrement…" : saved ? "✓ Enregistré !" : `Enregistrer · +${xpGained || "?"} XP`}
      </button>
      {saveError && (
        <div style={{ position: "absolute", bottom: 150, left: 20, right: 20, zIndex: 10, background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#DC2626", textAlign: "center" }}>
          {saveError}
        </div>
      )}
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
  const [avatarPreview, setAvatarPreview] = useState(
    profile?.avatar_url?.startsWith("http") ? profile.avatar_url : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pseudoError, setPseudoError] = useState("");
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box" };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadError("");
    setPseudoError("");

    // Vérifier unicité du pseudo (seulement si changé)
    const newPseudo = name.trim();
    if (!newPseudo) {
      setPseudoError("Le pseudo ne peut pas être vide.");
      setSaving(false);
      return;
    }
    if (newPseudo !== profile?.pseudo) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("pseudo", newPseudo)
        .neq("id", user.id)
        .maybeSingle();
      if (existing) {
        setPseudoError("❌ Ce pseudo est déjà pris, choisis-en un autre.");
        setSaving(false);
        return;
      }
    }
    let avatar_url = profile?.avatar_url?.startsWith("http") ? profile.avatar_url : null;
    if (avatarFile && user?.id) {
      // Compresse + convertit en JPEG (gère HEIC iPhone et photos > 1Mo)
      const compressed = await compressImage(avatarFile);
      const path = `avatars/${user.id}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(path, compressed, { upsert: true, contentType: "image/jpeg" });
      if (upErr) {
        console.error("❌ Upload avatar:", upErr);
        setUploadError("❌ Upload échoué : " + upErr.message);
        setSaving(false);
        return;
      }
      // Ajoute un timestamp pour forcer le rechargement du cache
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      avatar_url = data.publicUrl + "?t=" + Date.now();
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
                ? <img
                    src={avatarPreview}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setAvatarPreview(null)}
                  />
                : "🧑‍🦱"}
            </div>
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", border: `2px solid ${C.card}` }}>📷</div>
          </label>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 10 }}>Appuie pour changer la photo</div>
          {uploadError && (
            <div style={{ fontSize: 11, color: C.accent, marginTop: 6, textAlign: "center", maxWidth: 240 }}>{uploadError}</div>
          )}
        </div>

        {/* Pseudo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Pseudo</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setPseudoError(""); }}
            placeholder="Ton pseudo visible par les voisins"
            style={{ ...inp, borderColor: pseudoError ? C.accent : C.border }}
          />
          {pseudoError && (
            <div style={{ fontSize: 11, color: C.accent, marginTop: 5, fontWeight: 600 }}>{pseudoError}</div>
          )}
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
function ProfileTop({ onEditProfile, setPage, profile, onSettings, postCount, univers, rank }) {
  return (
    <div style={{ background: C.card }}>
      {/* Bannière couverture */}
      <div style={{ height: 110, background: "linear-gradient(135deg, #1A1A2E 0%, #FF5733 60%, #F7A72D 100%)", position: "relative" }}>
        <div style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "4px 10px", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
          ✦ Pépite du Quartier
        </div>
      </div>

      {/* Avatar + boutons */}
      <div style={{ padding: "0 16px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -30 }}>
          {/* Avatar */}
          <div style={{ position: "relative", width: 68, height: 68 }}>
            <div style={{ border: `3px solid ${C.card}`, boxShadow: "0 2px 12px rgba(26,23,20,0.15)", borderRadius: "50%" }}>
              <Avatar pseudo={profile?.pseudo} avatarUrl={profile?.avatar_url} size={68} />
            </div>
          </div>
          {/* Boutons action */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, paddingBottom: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onEditProfile} style={{ background: C.card, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: dm, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>✏️ Modifier</button>
              <button onClick={onSettings} style={{ background: C.card, color: C.ink2, border: `1px solid ${C.border}`, borderRadius: 12, width: 34, height: 34, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }} title="Paramètres">⚙️</button>
            </div>
            {/* Voir mes voisins */}
            <button onClick={() => setPage("voisins")} style={{ display: "flex", alignItems: "center", gap: 5, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "5px 10px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: 8 }}>
              <span style={{ fontSize: 15 }}>🫣</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.ink2, fontFamily: dm }}>Mes voisins</span>
            </button>
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

        {/* XP bar */}
        {(() => {
          const xp  = profile?.xp || 0;
          const lvl  = getLevel(xp);
          const next = getNextLevel(xp);
          const pct  = getLevelProgress(xp);
          return (
            <div style={{ marginTop: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>
                  {lvl.emoji} {lvl.title} · Niv.{lvl.level}
                </span>
                <span style={{ fontSize: 10, color: C.ink2 }}>
                  {next ? `${next.xpMin - xp} XP pour Niv.${next.level}` : "Niveau max 🏆"}
                </span>
              </div>
              <div style={{ height: 6, background: C.pill, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: "linear-gradient(90deg,#FF5733,#F7A72D)", transition: "width 0.8s ease" }} />
              </div>
              <div style={{ fontSize: 9, color: C.ink2, marginTop: 3, textAlign: "right" }}>⚡ {xp} XP — gloire &amp; classement</div>
            </div>
          );
        })()}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        {(() => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const xpMonth = profile?.xp_month_label === currentMonth ? (profile?.xp_month || 0) : 0;
          return [
            { n: String(postCount), l: "publications" },
            { n: rank ? `#${rank}` : "#—", l: "classement", color: C.gold },
            { n: String(profile?.xp || 0), l: "⚡ XP gloire", color: C.accent },
            { n: String(profile?.xp_shop || 0), l: "🏪 XP Shop", color: "#0A3D2E" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: s.color || C.ink }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.ink2, marginTop: 1 }}>{s.l}</div>
            </div>
          ));
        })()}
      </div>

      {/* Bandeau réductions */}
      <div onClick={() => setPage("reductions")} style={{ padding: "10px 16px 0", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, #FFF8F6, #FFF0EB)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(255,87,51,0.2)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎁</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: syne, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mes XP Shop & réductions</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>Bons d'achat & offres du quartier</div>
          </div>
          <div style={{ background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 10, flexShrink: 0 }}>→</div>
        </div>
      </div>

      {/* Crédits locaux */}
      <MesCreditsLocaux userId={profile?.id} />
    </div>
  );
}

// ─── MES CRÉDITS LOCAUX ───
const XP_TO_EUROS = (xp) => (xp / 20).toFixed(2); // 100 XP = 5 €

function MesCreditsLocaux({ userId }) {
  const [wallet, setWallet] = useState([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("merchant_xp_wallet")
      .select("points, merchant_id, profiles:merchant_id(pseudo, avatar_url)")
      .eq("user_id", userId)
      .gt("points", 0)
      .order("points", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setWallet(data || []);
      });
  }, [userId]);

  const WalletRow = ({ nom, points, isDemo }) => {
    const euros = XP_TO_EUROS(points);
    const disponible = points >= 100;
    return (
      <div style={{
        background: isDemo ? "#FAFAFA" : (disponible ? C.proBg : C.card),
        border: `1.5px solid ${isDemo ? "rgba(26,23,20,0.06)" : disponible ? "rgba(10,61,46,0.25)" : "rgba(26,23,20,0.08)"}`,
        borderRadius: 14, padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
        opacity: isDemo ? 0.85 : 1,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: isDemo ? C.pill : (disponible ? C.pro : C.pill), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          🏪
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nom}
            </div>
            {isDemo && (
              <span style={{ fontSize: 8, fontWeight: 700, background: C.pill, color: C.ink2, borderRadius: 5, padding: "2px 5px", flexShrink: 0 }}>EXEMPLE</span>
            )}
          </div>
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{points} XP Shop accumulés</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 15, color: isDemo ? C.ink2 : (disponible ? C.pro : C.ink) }}>
            {euros} €
          </div>
          {!isDemo && disponible && (
            <div style={{ fontSize: 9, fontWeight: 700, color: C.pro, background: "rgba(10,61,46,0.12)", borderRadius: 6, padding: "2px 6px", marginTop: 2 }}>
              DISPONIBLE
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "10px 16px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        🏪 Mes XP Shop — Crédits locaux
        <div style={{ flex: 1, height: 1, background: "rgba(26,23,20,0.08)" }} />
      </div>
      <div style={{ fontSize: 10, color: C.ink2, marginBottom: 10, lineHeight: 1.4 }}>
        Différents des XP normaux — utilisables en bons d'achat uniquement chez le commerce concerné.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Entrée démo toujours visible */}
        <WalletRow nom="La Petite Boutique" points={30} isDemo />

        {/* Vrais crédits */}
        {wallet.map((w, i) => (
          <WalletRow key={i} nom={w.profiles?.pseudo || "Commerce"} points={w.points} isDemo={false} />
        ))}

        {/* Explication */}
        <div style={{
          background: "rgba(255,87,51,0.05)", border: "1px dashed rgba(255,87,51,0.25)",
          borderRadius: 12, padding: "10px 12px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 3 }}>💡 Comment ça marche ?</div>
          <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>
            Poste une photo en liant un commerce → le commerçant accepte → <b>+10 XP Shop</b> crédités ici.<br />
            <b>100 XP Shop = 5 €</b> de bon d'achat utilisable uniquement chez ce commerçant.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ONGLETS STICKY ───
function StickyTabs({ activeTab, onTabChange }) {
  const tabs = ["Publications", "Événements", "Mon univers", "Défis", "Récompenses"];
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

// ─── LIGHTBOX PROFIL ───
function ProfileLightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef(null);
  const photo = photos[index];

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(photos.length - 1, i + 1));

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.97)", display: "flex", flexDirection: "column" }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx > 60) prev();
        else if (dx < -60) next();
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>
          {index + 1} / {photos.length}
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {/* Photo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {index > 0 && (
          <button onClick={prev} style={{ position: "absolute", left: 12, zIndex: 10, background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        )}
        {photo.image_url ? (
          <img key={photo.id} src={photo.image_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
        ) : (
          <div style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{photo.content}</div>
          </div>
        )}
        {index < photos.length - 1 && (
          <button onClick={next} style={{ position: "absolute", right: 12, zIndex: 10, background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        )}
      </div>

      {/* Légende + dots */}
      <div style={{ padding: "14px 16px 32px", flexShrink: 0 }}>
        {photo.content && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 10 }}>{photo.content}</div>
        )}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: photos.length > 1 ? 12 : 0 }}>
          {new Date(photo.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        {photos.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={() => setIndex(i)} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, cursor: "pointer", background: i === index ? C.accent : "rgba(255,255,255,0.3)", transition: "all 0.2s" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoThumb({ p, onDelete, onOpen, onEdit }) {
  return (
    <div style={{ borderRadius: 14, aspectRatio: "1", position: "relative", overflow: "hidden", cursor: "zoom-in", background: C.pill }} onClick={onOpen}>
      {p.image_url ? (
        <img src={p.image_url} alt={p.content} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, boxSizing: "border-box" }}>
          <div style={{ fontSize: 22, marginBottom: 5 }}>📝</div>
          <div style={{ fontSize: 10, color: C.ink2, textAlign: "center", lineHeight: 1.4 }}>{p.content?.slice(0, 60)}{p.content?.length > 60 ? "…" : ""}</div>
        </div>
      )}
      {/* Boutons actions */}
      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
        <button onClick={e => { e.stopPropagation(); onEdit(p); }} style={{ width: 22, height: 22, background: "rgba(26,23,20,0.55)", borderRadius: "50%", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
        <button onClick={e => { e.stopPropagation(); onDelete(p.id); }} style={{ width: 22, height: 22, background: "rgba(26,23,20,0.55)", borderRadius: "50%", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(26,23,20,0.65))", padding: "16px 8px 7px" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>
          {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}

// ─── EDIT POST MODAL ────────────────────────────────────────────
function EditPostModal({ post, onSave, onCancel }) {
  const [content, setContent] = useState(post.content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("posts").update({ content: content.trim() }).eq("id", post.id);
    setSaving(false);
    if (!error) onSave(post.id, content.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
      <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 12 }}>✏️ Modifier le post</div>
        {post.image_url && (
          <img src={post.image_url} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 14, marginBottom: 12 }} />
        )}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 14,
            border: `1.5px solid ${C.accent}`, fontFamily: dm, fontSize: 13,
            color: C.ink, background: C.bg, outline: "none",
            resize: "none", boxSizing: "border-box", lineHeight: 1.6, marginBottom: 14,
          }}
        />
        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", background: C.accent, color: "#fff", border: "none",
          borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700,
          fontFamily: dm, cursor: "pointer", marginBottom: 8,
        }}>{saving ? "Sauvegarde…" : "Enregistrer ✓"}</button>
        <button onClick={onCancel} style={{
          width: "100%", background: C.pill, color: C.ink2, border: "none",
          borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer",
        }}>Annuler</button>
      </div>
    </div>
  );
}

// ─── GROUP COLORS ────────────────────────────────────────────────
const GROUP_COLORS = {
  "Souvenirs d'événements": { bg: "#EEF2FF", border: "#6366F1", dot: "#6366F1" },
  "Photos de défis":        { bg: "#FFF7ED", border: "#F97316", dot: "#F97316" },
  "Chopes":                 { bg: "#FFF0EB", border: "#FF5733", dot: "#FF5733" },
  "Bons plans":             { bg: "#FFFBEB", border: "#F59E0B", dot: "#B45309" },
  "Lieux":                  { bg: "#F0FDF9", border: "#0F766E", dot: "#0F766E" },
  "Autres":                 { bg: C.bg,      border: C.border,  dot: C.ink2    },
};

function PostGroup({ icon, label, posts, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  if (posts.length === 0) return null;

  const colors = GROUP_COLORS[label] || GROUP_COLORS["Autres"];
  const previews = posts.filter(p => p.image_url).slice(0, 2);

  return (
    <div style={{ marginBottom: 12 }}>
      {lightboxIndex !== null && (
        <ProfileLightbox photos={posts} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Header cliquable */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: colors.bg,
          borderRadius: open ? "16px 16px 0 0" : 16,
          border: `1.5px solid ${colors.border}`,
          padding: "12px 14px", cursor: "pointer",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.border + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, flex: 1 }}>{label}</span>

        {/* 2 previews quand fermé */}
        {!open && previews.length > 0 && (
          <div style={{ display: "flex", gap: 4 }}>
            {previews.map(p => (
              <img key={p.id} src={p.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: `1.5px solid ${colors.border}` }} />
            ))}
            {posts.length > 2 && (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.border + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: colors.dot }}>
                +{posts.length - 2}
              </div>
            )}
          </div>
        )}

        <span style={{ fontSize: 11, color: colors.dot, background: colors.border + "22", borderRadius: 20, padding: "2px 10px", fontWeight: 700, marginLeft: 4 }}>
          {posts.length}
        </span>
        <span style={{ fontSize: 14, color: C.ink2, marginLeft: 4 }}>{open ? "▾" : "▸"}</span>
      </div>

      {/* Grille photos — visible seulement si ouvert */}
      {open && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
          background: colors.bg, border: `1.5px solid ${colors.border}`,
          borderTop: "none", borderRadius: "0 0 16px 16px",
          padding: "10px",
        }}>
          {posts.map((p, i) => (
            <PhotoThumb key={p.id} p={p} onDelete={onDelete} onOpen={() => setLightboxIndex(i)} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabPosts({ posts, onDelete, onEdit, loading }) {
  if (loading) return <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>Chargement…</div>;
  if (posts.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun post pour l'instant</div>
      <div style={{ fontSize: 12, color: C.ink2 }}>Publie ta première trouvaille depuis le fil !</div>
    </div>
  );

  const groupes = [
    { icon: "📅", label: "Souvenirs d'événements", posts: posts.filter(p => p.evenement_id) },
    { icon: "🏆", label: "Photos de défis",        posts: posts.filter(p => p.defi_id && !p.evenement_id) },
    { icon: "🛍️", label: "Chopes",                 posts: posts.filter(p => p.post_type === "decouverte") },
    { icon: "💡", label: "Bons plans",              posts: posts.filter(p => p.post_type === "bonplan") },
    { icon: "📍", label: "Lieux",                   posts: posts.filter(p => p.post_type === "lieu") },
    { icon: "📝", label: "Autres",                  posts: posts.filter(p => !p.evenement_id && !p.defi_id && !["decouverte","bonplan","lieu"].includes(p.post_type)) },
  ];

  return (
    <div>
      {groupes.map(g => (
        <PostGroup key={g.label} icon={g.icon} label={g.label} posts={g.posts} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
}

function TabEvenements({ sorties, onDelete, loading }) {
  if (loading) return <div style={{ textAlign: "center", padding: "30px 0", color: C.ink2, fontSize: 13 }}>Chargement…</div>;
  if (sorties.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 6 }}>Aucun événement créé</div>
      <div style={{ fontSize: 12, color: C.ink2 }}>Crée ton premier événement depuis l'onglet Évén. !</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorties.map(s => (
        <div key={s.id} style={{
          background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: C.accent,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {s.date_text ? s.date_text.split("/")[0] : "—"}
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>
              {s.date_text ? ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"][parseInt(s.date_text.split("/")[1]) - 1] : ""}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{s.type || "Événement"}{s.lieu ? ` · 📍 ${s.lieu}` : ""}</div>
          </div>
          <button
            onClick={() => onDelete(s.id)}
            style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: C.ink2, flexShrink: 0 }}
          >🗑️</button>
        </div>
      ))}
    </div>
  );
}

// Palettes par index — dégradés modernes
const CARD_GRADIENTS = [
  { from: "#FF6B35", to: "#E94B2C" },
  { from: "#7C3AED", to: "#A855F7" },
  { from: "#059669", to: "#34D399" },
  { from: "#1D4ED8", to: "#60A5FA" },
  { from: "#D97706", to: "#FBBF24" },
  { from: "#0F766E", to: "#2DD4BF" },
];

function MiniDefiCard({ it, idx, onOpen }) {
  const grad = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

  // ── FAIT avec photo ──────────────────────────────────────────
  if (it.done && it.photoUrl) {
    return (
      <div onClick={() => onOpen(it.id)} style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", aspectRatio: "1", boxShadow: "0 4px 14px rgba(0,0,0,0.13)" }}>
        <img src={it.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
        {/* Badge complété */}
        <div style={{ position: "absolute", top: 8, right: 8, background: "#059669", borderRadius: 8, padding: "2px 7px", fontSize: 8, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>✓ FAIT</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginBottom: 1 }}>{it.emoji} {it.q}</div>
          {it.a && <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{it.a}</div>}
          <div style={{ fontSize: 8, fontWeight: 700, color: "#4ADE80", marginTop: 2 }}>⚡ {it.xp || 5} XP</div>
        </div>
      </div>
    );
  }

  // ── FAIT sans photo ──────────────────────────────────────────
  if (it.done) {
    return (
      <div onClick={() => onOpen(it.id)} style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", aspectRatio: "1", background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.13)" }}>
        {/* Checkmark badge */}
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, alignSelf: "flex-end" }}>✓</div>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.75)", marginBottom: 3, lineHeight: 1.3 }}>{it.emoji} {it.q}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{it.a}</div>
          <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>⚡ {it.xp || 5} XP gagnés</div>
        </div>
      </div>
    );
  }

  // ── PAS ENCORE FAIT ──────────────────────────────────────────
  return (
    <div onClick={() => onOpen(it.id)} style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", aspectRatio: "1", background: "#FFF", border: "1.5px solid rgba(26,23,20,0.09)", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      {/* Barre couleur en haut */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10px 10px 0", textAlign: "center", gap: 4 }}>
        <div style={{ fontSize: 28 }}>{it.emoji}</div>
        <div style={{ fontSize: 9, color: C.ink2, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{it.q}</div>
      </div>
      {/* CTA bas */}
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`, borderRadius: 10, padding: "5px 0", textAlign: "center", fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: 0.3 }}>
          Répondre · +5/10 XP
        </div>
      </div>
    </div>
  );
}

function TabUnivers({ items, onOpen }) {
  const [activeTheme, setActiveTheme] = useState(THEMES[0].id);
  const themeItems = items.filter(it => it.theme === activeTheme);
  const doneCount = themeItems.filter(it => it.done).length;

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink }}>Mon univers</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: "#FFF0EB", padding: "3px 10px", borderRadius: 8 }}>
          {doneCount}/{themeItems.length} complétés
        </div>
      </div>

      {/* Sous-onglets thèmes */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 2, scrollbarWidth: "none" }}>
        {THEMES.map(t => {
          const done = items.filter(it => it.theme === t.id && it.done).length;
          const total = t.defis.length;
          const active = activeTheme === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTheme(t.id)} style={{
              flexShrink: 0, padding: "7px 12px", borderRadius: 20,
              border: "none", cursor: "pointer", fontFamily: dm,
              fontSize: 11, fontWeight: active ? 700 : 500,
              background: active ? C.ink : C.pill,
              color: active ? "#fff" : C.ink2,
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s",
            }}>
              {t.label}
              <span style={{
                background: active ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                borderRadius: 8, padding: "1px 5px", fontSize: 9, fontWeight: 700,
                color: active ? "#fff" : C.ink2,
              }}>{done}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {themeItems.map((it, i) => (
          <MiniDefiCard key={it.id} it={it} idx={i} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}

function computeTimeLeftProfil(ends_at, ended) {
  if (ended) return "Terminé";
  if (!ends_at) return "En cours";
  const diff = new Date(ends_at) - new Date();
  if (diff <= 0) return "Terminé";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "Dernier jour !";
  return `${days} jours`;
}

function TabDefis({ setPage, userId }) {
  // ── Mes défis créés ──
  const [myDefis, setMyDefis]     = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [voteData, setVoteData]   = useState({});
  const [confirmClose, setConfirmClose] = useState(null);
  const [winnerPicker, setWinnerPicker] = useState(null);
  const [xpResult, setXpResult]   = useState(null); // { defiId, total }
  const [confirmDelete, setConfirmDelete] = useState(null); // id à supprimer
  const [editDefi, setEditDefi]   = useState(null); // défi en cours d'édition
  const [editForm, setEditForm]   = useState({ title: "", description: "", ends_at: "" });
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("defis").select("*")
      .eq("user_id", userId).eq("type", "voisin")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setMyDefis(data || []); setLoadingMy(false); });
  }, [userId]);

  async function loadVotes(d) {
    if (voteData[d.id]) { setExpanded(d.id); return; }
    const [{ data: votes }, { data: photos }] = await Promise.all([
      supabase.from("defi_votes").select("post_id, voter_id, vote").eq("defi_id", d.id),
      supabase.from("posts").select("id, image_url, author_id, profiles:author_id(pseudo, avatar_url)")
        .eq("defi_id", d.id).not("image_url", "is", null),
    ]);
    const voteMap = {};
    const voters = new Set();
    (votes || []).forEach(v => {
      voters.add(v.voter_id);
      if (!voteMap[v.post_id]) voteMap[v.post_id] = { likes: 0, passes: 0 };
      v.vote === "like" ? voteMap[v.post_id].likes++ : voteMap[v.post_id].passes++;
    });
    const ranked = (photos || [])
      .map(p => ({ ...p, likes: voteMap[p.id]?.likes || 0, passes: voteMap[p.id]?.passes || 0 }))
      .sort((a, b) => b.likes - a.likes);
    setVoteData(prev => ({ ...prev, [d.id]: { photos: ranked, totalVoters: voters.size } }));
    setExpanded(d.id);
  }

  async function closeDefi(id) {
    await supabase.from("defis").update({ ended: true }).eq("id", id);
    setMyDefis(prev => prev.map(d => d.id === id ? { ...d, ended: true } : d));
    setConfirmClose(null);
  }

  async function pickWinner(defi) {
    const ranked = voteData[defi.id]?.photos || [];
    if (ranked.length === 0) return;
    const XP_REWARDS = [50, 20, 10];
    const podiumEmojis = ["🥇", "🥈", "🥉"];
    let totalXp = 0;
    for (let i = 0; i < Math.min(3, ranked.length); i++) {
      const p = ranked[i];
      if (p.author_id) {
        await addXP(p.author_id, XP_REWARDS[i], "defi_winner");
        await supabase.from("notifications").insert({
          user_id: p.author_id, from_user_id: userId,
          type: "winner", reference_id: defi.id, read: false,
        });
        totalXp += XP_REWARDS[i];
      }
    }
    await supabase.from("defis").update({ winner_post_id: ranked[0].id, ended: true }).eq("id", defi.id);
    setMyDefis(prev => prev.map(d => d.id === defi.id ? { ...d, winner_post_id: ranked[0].id, ended: true } : d));
    setWinnerPicker(null);
    setXpResult({ defiId: defi.id, total: totalXp });
  }

  async function deleteDefi(id) {
    await supabase.from("defi_votes").delete().eq("defi_id", id);
    await supabase.from("defis").delete().eq("id", id);
    setMyDefis(prev => prev.filter(d => d.id !== id));
    setConfirmDelete(null);
  }

  function openEdit(d) {
    setEditForm({
      title: d.title || "",
      description: d.description || "",
      ends_at: d.ends_at ? d.ends_at.slice(0, 10) : "",
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditDefi(d);
  }

  async function handleEditPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  }

  async function saveEditDefi() {
    if (!editForm.title.trim()) return;
    setSaving(true);
    let photo_url = editPhotoPreview === "remove" ? null : (editDefi.photo_url || null);
    if (editPhotoFile) {
      const ext = (editPhotoFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
      const path = `posts/${userId}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, editPhotoFile, { contentType: editPhotoFile.type || "image/jpeg", upsert: false });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        photo_url = urlData.publicUrl;
      }
    }
    const updates = {
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      ends_at: editForm.ends_at || null,
      photo_url,
    };
    await supabase.from("defis").update(updates).eq("id", editDefi.id);
    setMyDefis(prev => prev.map(d => d.id === editDefi.id ? { ...d, ...updates } : d));
    setSaving(false);
    setEditDefi(null);
  }

  // ── Tous les défis actifs (section découverte) ──
  const [allDefis, setAllDefis]     = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    supabase.from("defis").select("*")
      .eq("ended", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setAllDefis(data || []); setLoadingAll(false); });
  }, []);

  const podiumEmojis = ["🥇", "🥈", "🥉"];
  const podiumColors = ["#F7A72D", "#A8A9AD", "#C07D3E"];

  return (
    <div>

      {/* ── CONFIRM CLÔTURE ── */}
      {confirmClose && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>🔒 Clôturer ce défi ?</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Les participants ne pourront plus poster. Tu pourras ensuite choisir le gagnant et attribuer les XP.</div>
            <button onClick={() => closeDefi(confirmClose)} style={{ width: "100%", background: C.ink, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>Clôturer</button>
            <button onClick={() => setConfirmClose(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── PICKER GAGNANT ── */}
      {winnerPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.7)", display: "flex", flexDirection: "column", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", marginTop: "auto", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 16px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>🏆 Classer le podium</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>Le classement est calculé par votes. Confirme pour attribuer les XP.</div>
            </div>
            <div style={{ overflowY: "auto", padding: 14 }}>
              {(voteData[winnerPicker.id]?.photos || []).slice(0, 3).map((p, i) => (
                <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, background: C.bg, borderRadius: 14, padding: "10px 12px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>{podiumEmojis[i]} {p.profiles?.pseudo || "Voisin·e"}</div>
                    <div style={{ fontSize: 11, color: C.ink2 }}>❤️ {p.likes} like{p.likes > 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ["#B45309","#6B7280","#92400E"][i], background: ["#FFF8E8","#F3F4F6","#FEF3E0"][i], padding: "4px 10px", borderRadius: 10 }}>
                    +{[50,20,10][i]} XP
                  </div>
                </div>
              ))}
              {(voteData[winnerPicker.id]?.photos || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 13 }}>Aucune photo soumise.</div>
              )}
            </div>
            <div style={{ padding: "10px 14px 32px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => pickWinner(winnerPicker)} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}>Confirmer et attribuer les XP 🏆</button>
              <button onClick={() => setWinnerPicker(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION XP ATTRIBUÉS ── */}
      {xpResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: C.card, borderRadius: 24, padding: "28px 24px", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 18, color: C.ink, marginBottom: 8 }}>XP distribués !</div>
            <div style={{ fontSize: 13, color: C.ink2, marginBottom: 20, lineHeight: 1.5 }}>
              🥇 50 XP · 🥈 20 XP · 🥉 10 XP<br />Les gagnants ont été notifiés.
            </div>
            <button onClick={() => setXpResult(null)} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}>Super !</button>
          </div>
        </div>
      )}

      {/* ── CONFIRM SUPPRESSION ── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 110 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 44px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>🗑️ Supprimer ce défi ?</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18, lineHeight: 1.5 }}>Cette action est irréversible. Tous les votes associés seront également supprimés.</div>
            <button onClick={() => deleteDefi(confirmDelete)} style={{ width: "100%", background: "#E53935", color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>Supprimer définitivement</button>
            <button onClick={() => setConfirmDelete(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── EDIT DÉFI ── */}
      {editDefi && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 110 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 44px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 16 }}>✏️ Modifier le défi</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Titre *</div>
              <input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                maxLength={80}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.bg, outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Description</div>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                maxLength={300}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.bg, outline: "none", resize: "none", lineHeight: 1.5 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Date limite</div>
              <input
                type="date"
                value={editForm.ends_at}
                onChange={e => setEditForm(f => ({ ...f, ends_at: e.target.value }))}
                min={new Date().toISOString().slice(0, 10)}
                style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.bg, outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>Photo de couverture (optionnelle)</div>
              <input type="file" accept="image/*" id="edit-defi-photo" onChange={handleEditPhoto} style={{ display: "none" }} />
              <label htmlFor="edit-defi-photo" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 14, border: `1.5px dashed ${C.border}`,
                overflow: "hidden", cursor: "pointer", position: "relative",
                aspectRatio: "16/7", background: "#000",
              }}>
                {editPhotoPreview || editDefi.photo_url ? (
                  <>
                    <img
                      src={editPhotoPreview || editDefi.photo_url}
                      alt=""
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                    />
                    <div style={{ position: "relative", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
                      📷 Changer
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 16 }}>
                    <div style={{ fontSize: 28 }}>📷</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Ajouter une photo</div>
                  </div>
                )}
              </label>
              {(editPhotoPreview || editDefi.photo_url) && !editPhotoPreview && (
                <button
                  onClick={() => { setEditPhotoFile(null); setEditPhotoPreview("remove"); }}
                  style={{ marginTop: 6, background: "none", border: "none", fontSize: 11, color: "#E53935", cursor: "pointer", padding: 0 }}
                >✕ Supprimer la photo</button>
              )}
            </div>
            <button onClick={saveEditDefi} disabled={saving || !editForm.title.trim()} style={{ width: "100%", background: saving ? "#ccc" : C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: saving ? "not-allowed" : "pointer", marginBottom: 8 }}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button onClick={() => setEditDefi(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── MES DÉFIS CRÉÉS ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>Mes défis créés</div>
          <button
            onClick={() => setPage("nouveau")}
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
          >+ Créer un défi</button>
        </div>

        {loadingMy ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
        ) : myDefis.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>Tu n'as pas encore créé de défi.<br />Lance-toi !</div>
          </div>
        ) : myDefis.map(d => {
          const isOpen = expanded === d.id;
          const data = voteData[d.id];
          const isEnded = d.ended || (d.ends_at && new Date(d.ends_at) < new Date());
          const daysLeft = d.ends_at ? Math.max(0, Math.ceil((new Date(d.ends_at) - new Date()) / 86400000)) : null;
          return (
            <div key={d.id} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#FF5733,#F7A72D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏆</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: C.ink2 }}>
                    {isEnded ? "✅ Terminé" : daysLeft !== null ? `⏱ ${daysLeft}j restant${daysLeft > 1 ? "s" : ""}` : "En cours"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: isEnded ? C.pill : "#EBF5F0", color: isEnded ? C.ink2 : "#0A3D2E" }}>
                    {isEnded ? "Terminé" : "En cours"}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(d); }}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 8px", fontSize: 12, cursor: "pointer", color: C.ink2 }}
                    >✏️</button>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(d.id); }}
                      style={{ background: "#FFF0EE", border: "1px solid #FFB0A0", borderRadius: 8, padding: "3px 8px", fontSize: 12, cursor: "pointer", color: "#E53935" }}
                    >🗑️</button>
                  </div>
                </div>
              </div>
              {/* Résultats votes */}
              {isOpen && data && (
                <div style={{ padding: "0 14px 10px" }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 11, color: C.ink2, marginBottom: 8 }}>📊 {data.photos.length} photo{data.photos.length > 1 ? "s" : ""} · {data.totalVoters} votant{data.totalVoters > 1 ? "s" : ""}</div>
                  {data.photos.slice(0, 3).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                        <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, fontSize: 12, color: C.ink }}>{podiumEmojis[i]} {p.profiles?.pseudo || "Voisin·e"}</div>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>❤️ {p.likes}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Actions */}
              <div style={{ display: "flex", gap: 8, padding: "8px 14px 14px" }}>
                <button onClick={() => isOpen ? setExpanded(null) : loadVotes(d)} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: C.ink }}>
                  {isOpen ? "Masquer" : "📊 Résultats"}
                </button>
                {!isEnded && (
                  <button onClick={() => setConfirmClose(d.id)} style={{ flex: 1, background: C.pill, border: "none", borderRadius: 12, padding: "8px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: C.ink2 }}>🔒 Clôturer</button>
                )}
                {isEnded && !d.winner_post_id && data?.photos?.length > 0 && (
                  <button onClick={() => { loadVotes(d); setWinnerPicker(d); }} style={{ flex: 1, background: "#FFF8E8", border: "1.5px solid #F7A72D", borderRadius: 12, padding: "8px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: "#B45309" }}>🏆 Podium</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DÉFIS EN COURS (découverte) ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 8 }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 12 }}>Défis en cours</div>
        {loadingAll ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
        ) : allDefis.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink2, textAlign: "center", padding: "12px 0" }}>Aucun défi actif pour l'instant.</div>
        ) : allDefis.slice(0, 3).map(d => (
          <div key={d.id} onClick={() => setPage("defis")} style={{ display: "flex", gap: 10, alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "10px 12px", marginBottom: 8, cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#FF5733,#F7A72D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {d.photo_url ? <img src={d.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : d.emoji || "🏆"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
              <div style={{ fontSize: 10, color: C.ink2 }}>{computeTimeLeftProfil(d.ends_at, d.ended)} · {d.reward || "Récompense"}</div>
            </div>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, flexShrink: 0 }}>Participer →</div>
          </div>
        ))}
        <button onClick={() => setPage("defis")} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm, marginTop: 4 }}>
          Voir tous les défis 🏆
        </button>
      </div>
    </div>
  );
}

function TabRewards({ user }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}?ref=${user?.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rejoins Chipeur !",
          text: "Chope les bons plans mode et sorties de ton quartier sur Chipeur 🛍️",
          url: inviteLink,
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Carte invitation */}
      <div style={{
        background: "linear-gradient(135deg,#FF5733,#FF8C42)",
        borderRadius: 20, padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎁</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 6 }}>
          Chope des XP en invitant des voisins
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 16 }}>
          Pour chaque ami qui rejoint Chipeur via ton lien, tu gagnes <span style={{ fontWeight: 700 }}>+20 XP</span> automatiquement. Partage-le au maximum !
        </div>
        <button
          onClick={handleShare}
          style={{
            width: "100%", background: "#fff", color: C.accent,
            border: "none", borderRadius: 14, padding: "12px 16px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {copied ? "✅ Lien copié !" : "🔗 Partager mon lien d'invitation"}
        </button>
      </div>

      {/* Crédits locaux */}
      <MesCreditsLocaux userId={user?.id} />

      {/* Bientôt dispo */}
      <div style={{ textAlign: "center", padding: "24px 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎖️</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>
          Récompenses — Bientôt disponible
        </div>
        <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 16 }}>
          Le classement, les trophées et les bons d'achat arrivent prochainement.<br />Continue à publier et à interagir pour accumuler des XP dès maintenant !
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF8E8", color: "#B45309", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 20 }}>
          ⚡ En cours de développement
        </div>
      </div>
    </div>
  );
}

export default function ChipeurProfilVoisin({ setPage, profile, updateProfile, user, setEditPost }) {
  const [screen, setScreen] = useState("profil");
  const [activeTab, setActiveTab] = useState("Publications");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [miniDefiId, setMiniDefiId] = useState(null);
  const [univers, setUnivers] = useState(miniDefisAll);
  const [posts, setPosts] = useState([]);
  const [rank, setRank] = useState(null);

  // Calcul du classement XP parmi tous les profils
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("id, xp")
      .order("xp", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const idx = data.findIndex(p => p.id === user.id);
        if (idx !== -1) setRank(idx + 1);
      });
  }, [user?.id, profile?.xp]);

  // Charger l'univers sauvegardé depuis le profil (format objet keyed par ID)
  useEffect(() => {
    if (!profile) return;
    const savedMap = (profile?.univers && !Array.isArray(profile.univers))
      ? profile.univers : {};
    setUnivers(miniDefisAll.map(d => {
      const s = savedMap[d.id];
      return s ? { ...d, done: s.done || false, a: s.a || "", photoUrl: s.photoUrl || null, xp: s.xp || 0 } : d;
    }));
  }, [profile]);
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

  const [sorties, setSorties] = useState([]);
  const [sortiesLoading, setSortiesLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setSortiesLoading(false); return; }
    supabase
      .from("sorties")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSorties(data);
        setSortiesLoading(false);
      });
  }, [user?.id]);

  const handleDeleteSortie = async (id) => {
    await supabase.from("sorties").delete().eq("id", id).eq("author_id", user.id);
    setSorties(prev => prev.filter(s => s.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id) => {
    await supabase.from("posts").delete().eq("id", id).eq("author_id", user.id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleteTarget(null);
  };

  const handleEditSave = (id, newContent) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
    setEditTarget(null);
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
            <ProfileTop onEditProfile={() => setScreen("edit")} setPage={setPage} profile={profile} onSettings={() => setSettingsOpen(true)} postCount={postCount} univers={univers} rank={rank} />
            <StickyTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div style={{ padding: "12px 14px 20px" }}>
              {activeTab === "Publications" && <TabPosts posts={posts} onDelete={id => setDeleteTarget(id)} onEdit={p => { setEditPost?.(p); setPage("nouveau"); }} loading={postsLoading} />}
              {activeTab === "Événements" && <TabEvenements sorties={sorties} onDelete={handleDeleteSortie} loading={sortiesLoading} />}
              {activeTab === "Mon univers" && <TabUnivers items={univers} onOpen={id => { setMiniDefiId(id); setScreen("minidefi"); }} />}
              {activeTab === "Défis" && <TabDefis setPage={setPage} userId={user?.id} />}
              {activeTab === "Récompenses" && <TabRewards user={user} />}
            </div>
          </div>
        </>
      )}

      {screen === "edit" && <EditProfileScreen onBack={() => setScreen("profil")} profile={profile} updateProfile={updateProfile} user={user} />}

      {screen === "minidefi" && miniDefiId !== null && (
        <MiniDefiScreen
          defi={univers.find(d => d.id === miniDefiId)}
          user={user}
          onBack={() => { setScreen("profil"); setActiveTab("Mon univers"); }}
          onSave={async (val, photoUrl, xpGained) => {
            // On vérifie si c'est la première fois qu'on complète ce défi
            const defiAvant = univers.find(it => it.id === miniDefiId);
            const estPremiereFois = !defiAvant?.done;

            const updated = univers.map(it => it.id === miniDefiId
              ? { ...it, done: true, a: val || it.a, photoUrl: photoUrl || it.photoUrl, xp: estPremiereFois ? xpGained : (it.xp || 0) }
              : it);
            setUnivers(updated);

            // Sauvegarder en objet keyed par ID (plus stable que par index)
            const toSave = {};
            updated.forEach(it => {
              if (it.done || it.a || it.photoUrl) {
                toSave[it.id] = { done: it.done || false, a: it.a || "", photoUrl: it.photoUrl || null, xp: it.xp || 0 };
              }
            });

            // ✅ Si c'est la première fois, on inclut le nouvel XP dans updateProfile
            // pour que la barre XP se mette à jour instantanément (updateProfile = state local + Supabase)
            const profileUpdates = { univers: toSave };
            if (estPremiereFois && xpGained > 0) {
              const currentXP = profile?.xp || 0;
              const newXP = currentXP + xpGained;
              profileUpdates.xp = newXP;
              profileUpdates.level = getLevel(newXP).level;
              // On logue aussi dans xp_log pour garder l'historique complet
              supabase.from("xp_log").insert({
                user_id: user.id,
                amount: xpGained,
                reason: `minidefi_${miniDefiId}`,
              }).then(() => {});
            }

            const { error: saveErr } = await updateProfile(profileUpdates);
            if (saveErr) {
              console.error("❌ updateProfile univers :", saveErr);
            }
            setScreen("profil"); setActiveTab("Mon univers"); setMiniDefiId(null);
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

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        setPage={setPage}
        user={user}
        profile={profile}
      />
    </div>
  );
}
