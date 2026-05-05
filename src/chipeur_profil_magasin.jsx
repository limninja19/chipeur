import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { SettingsDrawer } from "./chipeur_settings";
import { addXP } from "./chipeur_xp";

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

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)" };
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function Label({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4, display: "block" }}>{children}</div>; }
function Input(props) { return <input {...props} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />; }

// ─── HEADER DU PROFIL MAGASIN ───
function MagHeader({ profile, postCount, headerStats, onEdit, onSettings }) {
  const name = profile?.pseudo || "Mon enseigne";
  const isArtisan = profile?.role === "artisan";
  const avatar = profile?.avatar_url;

  return (
    <div style={{ background: C.pro, padding: "16px 16px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, overflow: "hidden" }}>
          {avatar
            ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (isArtisan ? "🎨" : "🏪")
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: syne, fontSize: 17, fontWeight: 700, color: "#fff" }}>{name}</div>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: isArtisan ? "#FFF3E0" : C.proBg, color: isArtisan ? "#E65100" : "#34C759", marginTop: 3 }}>
            {isArtisan ? "🎨 Artisan local" : "★ Commerçant"}
          </span>
        </div>
        {/* Boutons header */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 11,
            fontWeight: 600, fontFamily: dm, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>✏️</span> Modifier
          </button>
          <button onClick={onSettings} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10, width: 34, height: 34, color: "#fff", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }} title="Paramètres">⚙️</button>
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: "flex", marginTop: 12 }}>
        {[
          { v: postCount != null ? String(postCount) : "—", l: "Posts" },
          { v: headerStats?.reactions != null ? String(headerStats.reactions) : "—", l: "Réactions" },
          { v: headerStats?.voisins != null ? String(headerStats.voisins) : "—", l: "Voisins touchés" },
          { v: "—", l: "Remises actives" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
            <div style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, color: "#fff" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Jours prédéfinis pour les horaires
const JOURS_DEFAUT = [
  { j: "Lundi", h: "" },
  { j: "Mardi", h: "" },
  { j: "Mercredi", h: "" },
  { j: "Jeudi", h: "" },
  { j: "Vendredi", h: "" },
  { j: "Samedi", h: "" },
  { j: "Dimanche", h: "" },
];

// ─── ÉCRAN MODIFIER LE PROFIL ───
function EditProfilScreen({ onBack, profile, userId, onSaved }) {
  const [pseudo, setPseudo]       = useState(profile?.pseudo || "");
  const [metier, setMetier]       = useState(profile?.metier || "");
  const [bio, setBio]             = useState(profile?.bio || "");
  const [quartier, setQuartier]   = useState(profile?.quartier || "");
  const [phone, setPhone]         = useState(profile?.phone || "");
  const [website, setWebsite]     = useState(profile?.website || "");
  const [instagram, setInstagram] = useState(profile?.instagram || "");
  const [facebook, setFacebook]   = useState(profile?.facebook || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Horaires : initialiser depuis le profil ou avec les 7 jours vides
  const initHoraires = () => {
    const saved = profile?.horaires;
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return JOURS_DEFAUT.map(d => ({ ...d }));
  };
  const [horaires, setHoraires] = useState(initHoraires);

  const updateHoraire = (idx, val) => {
    setHoraires(prev => prev.map((h, i) => i === idx ? { ...h, h: val } : h));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setError("");
    // Compresse + convertit en JPEG (gère HEIC iPhone et photos > 1Mo)
    const compressed = await compressImage(file);
    const path = `avatars/${userId}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("images")
      .upload(path, compressed, { upsert: true, contentType: "image/jpeg" });
    if (upErr) { setError("Erreur upload : " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    const horairesFiltres = horaires.filter(h => h.h.trim() !== "");
    const updates = {
      pseudo, metier, bio, quartier,
      phone, website, instagram, facebook,
      avatar_url: avatarUrl,
      horaires: horairesFiltres,
    };
    const { error: err } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    if (err) { setError("Erreur : " + err.message); setSaving(false); return; }
    setSaving(false);
    onSaved(updates);
    onBack();
  };

  const isArtisan = profile?.role === "artisan";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 14px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink, lineHeight: 1 }}>←</button>
        <span style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink, flex: 1 }}>Modifier le profil</span>
        <button onClick={handleSave} disabled={saving} style={{
          background: saving ? "#ccc" : C.pro, color: "#fff", border: "none",
          borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700,
          fontFamily: dm, cursor: saving ? "not-allowed" : "pointer",
        }}>{saving ? "⏳" : "Enregistrer"}</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {error && <div style={{ background: "#FFF0EE", border: "1px solid #FF5733", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#C0392B", marginBottom: 12 }}>{error}</div>}

        {/* Photo de profil */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <div style={{ width: 90, height: 90, borderRadius: 22, background: C.pro, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, overflow: "hidden", border: "3px solid " + C.proBg }}>
              {uploading
                ? <span style={{ fontSize: 11, color: "#fff" }}>⏳</span>
                : avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span>{isArtisan ? "🎨" : "🏪"}</span>
              }
            </div>
            {/* Bouton appareil photo */}
            <label style={{
              position: "absolute", bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: "50%",
              background: C.accent, border: "2px solid " + C.card,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 13,
            }}>
              📷
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ fontSize: 11, color: C.ink2 }}>Appuie sur 📷 pour changer la photo</div>
        </div>

        {/* Infos de base */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Informations de base</div>
          <Label>Nom de l'enseigne</Label>
          <Input value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="Ex : Atelier Mona" />
          <Label>Métier précis</Label>
          <Input value={metier} onChange={e => setMetier(e.target.value)} placeholder="Ex : Photographe, Boulangerie, Imprimerie…" />
          <Label>Description / Présentation</Label>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Décris ton enseigne, tes produits, ton univers…"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box", minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
          />
          <Label>Adresse</Label>
          <Input value={quartier} onChange={e => setQuartier(e.target.value)} placeholder="Ex : 12 rue des Arts, Saint-Dié" />
        </div>

        {/* Contact */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Contact & liens</div>
          <Label>Téléphone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="03 29 XX XX XX" type="tel" />
          <Label>Site web</Label>
          <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://monenseigne.fr" type="url" />
        </div>

        {/* Réseaux sociaux */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Réseaux sociaux</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📸</div>
            <Input
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="@toncompte"
              style={{ margin: 0 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>👥</div>
            <Input
              value={facebook}
              onChange={e => setFacebook(e.target.value)}
              placeholder="Nom de ta page Facebook"
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Horaires */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Horaires d'ouverture</div>
          <div style={{ fontSize: 11, color: C.ink2, marginBottom: 12 }}>Laisse vide les jours de fermeture.</div>
          {horaires.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: C.ink2, flexShrink: 0 }}>{h.j}</div>
              <Input
                value={h.h}
                onChange={e => updateHoraire(i, e.target.value)}
                placeholder="ex : 9h – 19h  ou  Fermé"
                style={{ margin: 0, flex: 1 }}
              />
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", padding: 14, borderRadius: 14,
          background: saving ? "#ccc" : C.pro,
          color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600,
          border: "none", cursor: saving ? "not-allowed" : "pointer",
        }}>{saving ? "⏳ Enregistrement…" : "✓ Enregistrer les modifications"}</button>
      </div>
    </div>
  );
}

// ─── ONGLET DASHBOARD ───
const REACTION_TYPES = [
  { type: "veux",       emoji: "🛒", label: "Je le veux",    color: "#0F766E", bg: "#F0FDF9", highlight: true },
  { type: "aime",       emoji: "❤️", label: "J'aime",        color: "#C0392B", bg: "#FFF0EE" },
  { type: "kiffe",      emoji: "🔥", label: "Je kiffe",      color: "#E65100", bg: "#FFF3E0" },
  { type: "style",      emoji: "✨", label: "Mon style",     color: "#7C3AED", bg: "#F5F3FF" },
  { type: "recommande", emoji: "👍", label: "Je recommande", color: "#1565C0", bg: "#E8F4FD" },
];

function TabDashboard({ onEnrich, postCount, merchantName, userId }) {
  const [period, setPeriod] = useState("semaine");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBar, setActiveBar] = useState(null);
  // Métriques
  const [totalReactions, setTotalReactions] = useState(0);
  const [reactionsByType, setReactionsByType] = useState({});
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => { if (userId) loadData(); }, [period, userId]);

  const loadData = async () => {
    setLoading(true);
    setActiveBar(null);
    const now = new Date();
    let startDate, labels;

    if (period === "semaine") {
      startDate = new Date(now); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0,0,0,0);
      const JOURS = ["Di","Lu","Ma","Me","Je","Ve","Sa"];
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i));
        return { label: i === 6 ? "Auj." : JOURS[d.getDay()], date: new Date(d) };
      });
    } else if (period === "mois") {
      startDate = new Date(now); startDate.setDate(startDate.getDate() - 27); startDate.setHours(0,0,0,0);
      labels = Array.from({ length: 4 }, (_, i) => {
        const end = new Date(now); end.setDate(end.getDate() - (3 - i) * 7);
        const start = new Date(end); start.setDate(start.getDate() - 6);
        return { label: `S${i+1}`, start, end };
      });
    } else {
      startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 11); startDate.setDate(1); startDate.setHours(0,0,0,0);
      const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
      labels = Array.from({ length: 12 }, (_, i) => {
        const m = new Date(now); m.setMonth(m.getMonth() - (11 - i));
        return { label: MOIS[m.getMonth()], month: m.getMonth(), year: m.getFullYear() };
      });
    }

    // ── Charger les posts ──
    const { data: posts } = await supabase
      .from("posts").select("id, created_at, content, image_url")
      .eq("author_id", userId).gte("created_at", startDate.toISOString());

    // ── Graphique activité ──
    const chartResult = labels.map(l => {
      let cnt = 0;
      (posts || []).forEach(p => {
        const d = new Date(p.created_at);
        if (period === "semaine") {
          const ld = l.date;
          if (d.getFullYear()===ld.getFullYear() && d.getMonth()===ld.getMonth() && d.getDate()===ld.getDate()) cnt++;
        } else if (period === "mois") {
          if (d >= l.start && d <= l.end) cnt++;
        } else {
          if (d.getMonth()===l.month && d.getFullYear()===l.year) cnt++;
        }
      });
      return { label: l.label, value: cnt };
    });
    setChartData(chartResult);

    // ── Réactions ──
    if (posts && posts.length > 0) {
      const ids = posts.map(p => p.id);

      // Toutes les réactions
      const { data: reactions } = await supabase
        .from("post_reactions").select("post_id, user_id, type")
        .in("post_id", ids);

      const allReactions = reactions || [];
      setTotalReactions(allReactions.length);

      // Par type
      const byType = {};
      allReactions.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
      setReactionsByType(byType);

      // Utilisateurs uniques
      const uniq = new Set(allReactions.map(r => r.user_id));
      setUniqueUsers(uniq.size);

      // Top 3 posts par réactions
      const countsByPost = {};
      allReactions.forEach(r => { countsByPost[r.post_id] = (countsByPost[r.post_id] || 0) + 1; });
      const sorted = [...posts]
        .map(p => ({ ...p, reactionCount: countsByPost[p.id] || 0 }))
        .sort((a, b) => b.reactionCount - a.reactionCount)
        .slice(0, 3);
      setTopPosts(sorted);
    } else {
      setTotalReactions(0); setReactionsByType({}); setUniqueUsers(0); setTopPosts([]);
    }

    setLoading(false);
  };

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const maxReaction = Math.max(...REACTION_TYPES.map(r => reactionsByType[r.type] || 0), 1);
  const intentionCount = reactionsByType["veux"] || 0;

  return <>
    {/* Sélecteur période */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 6px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Tableau de bord
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[{ id: "semaine", label: "7 j" }, { id: "mois", label: "Mois" }, { id: "annee", label: "Année" }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 10,
            border: "none", cursor: "pointer", fontFamily: dm,
            background: period === p.id ? C.pro : C.pill,
            color: period === p.id ? "#fff" : C.ink2,
          }}>{p.label}</button>
        ))}
      </div>
    </div>

    {loading ? (
      <div style={{ textAlign: "center", padding: "32px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
    ) : <>

      {/* ── KPI INTENTION D'ACHAT (highlight) ── */}
      {intentionCount > 0 && (
        <div style={{ background: "linear-gradient(135deg,#0F766E,#34D399)", borderRadius: 16, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 30 }}>🛒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{intentionCount}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>intention{intentionCount > 1 ? "s" : ""} d'achat "Je le veux"</div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "right", maxWidth: 80, lineHeight: 1.4 }}>
            Signal fort 🎯
          </div>
        </div>
      )}

      {/* ── 4 CARTES MÉTRIQUES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {[
          { v: postCount != null ? String(postCount) : "—", l: "Posts publiés",      icon: "📸", color: C.ink },
          { v: String(totalReactions),                       l: "Réactions reçues",   icon: "⚡", color: C.accent },
          { v: String(uniqueUsers),                          l: "Voisins engagés",    icon: "👥", color: "#7C3AED" },
          { v: String(intentionCount),                       l: "\"Je le veux\"",     icon: "🛒", color: C.pro },
        ].map((r, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{r.icon}</div>
            <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: r.color }}>{r.v}</div>
            <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{r.l}</div>
          </div>
        ))}
      </div>

      {/* ── GRAPHIQUE ACTIVITÉ POSTS ── */}
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "6px 0 6px" }}>
        Activité — posts publiés
      </div>
      <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "12px 12px 8px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
          {chartData.map((d, i) => {
            const hPct = Math.max((d.value / maxValue) * 100, d.value > 0 ? 8 : 2);
            const isLast = i === chartData.length - 1;
            const isActive = activeBar === i;
            return (
              <div key={i} onClick={() => setActiveBar(isActive ? null : i)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                {isActive && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)", background: C.pro, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 10 }}>
                    {d.value} post{d.value > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${hPct}%`, background: isActive ? C.accent : (isLast ? C.pro : C.proBg), transition: "background 0.15s" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ flex: 1, fontSize: 7, textAlign: "center", color: i === chartData.length - 1 ? C.pro : C.ink2, fontWeight: i === chartData.length - 1 ? 700 : 400 }}>{d.label}</div>
          ))}
        </div>
      </div>

      {/* ── RÉACTIONS PAR TYPE ── */}
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "6px 0 6px" }}>
        Détail des réactions
      </div>
      <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "12px 14px", marginBottom: 10 }}>
        {totalReactions === 0 ? (
          <div style={{ fontSize: 12, color: C.ink2, textAlign: "center", padding: "8px 0" }}>Aucune réaction sur cette période</div>
        ) : REACTION_TYPES.map(r => {
          const count = reactionsByType[r.type] || 0;
          const pct = maxReaction > 0 ? (count / maxReaction) * 100 : 0;
          return (
            <div key={r.type} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15 }}>{r.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: r.highlight ? 700 : 500, color: r.highlight ? r.color : C.ink }}>
                    {r.label}
                    {r.highlight && <span style={{ fontSize: 9, fontWeight: 600, background: r.bg, color: r.color, padding: "1px 5px", borderRadius: 6, marginLeft: 5 }}>intention d'achat</span>}
                  </span>
                </div>
                <span style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: count > 0 ? r.color : C.ink2 }}>{count}</span>
              </div>
              <div style={{ height: 6, background: C.pill, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: r.color, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TOP POSTS ── */}
      {topPosts.length > 0 && <>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "6px 0 6px" }}>
          🏆 Meilleurs posts
        </div>
        {topPosts.map((p, i) => (
          <div key={p.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", gap: 10, padding: 10, marginBottom: 8, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: [C.accent2, C.ink2, C.pill][i], flexShrink: 0 }} />
            {p.image_url ? (
              <img src={p.image_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📝</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: C.ink, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.content?.substring(0, 50) || "Post sans texte"}
              </div>
              <div style={{ fontSize: 10, color: C.ink2, marginTop: 2 }}>
                {new Date(p.created_at).toLocaleDateString("fr-FR")}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: syne, fontSize: 16, fontWeight: 700, color: p.reactionCount > 0 ? C.accent : C.ink2 }}>{p.reactionCount}</div>
              <div style={{ fontSize: 9, color: C.ink2 }}>réaction{p.reactionCount > 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </>}

      {/* ── PRO LAYER TIP ── */}
      <div style={{ background: "#FFF8F6", border: "1px solid rgba(255,87,51,0.15)", borderRadius: 14, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 3 }}>💡 Pro Layer</div>
        <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>
          Quand un voisin mentionne {merchantName || "votre enseigne"} dans un post, enrichissez-le avec les infos produit depuis l'onglet <b>Créer</b>.
        </div>
      </div>

    </>}
  </>;
}

// ─── ONGLET MES POSTS (vrais posts Supabase) ───
function TabPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("posts")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
  );

  if (posts.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 6 }}>Aucun post publié</div>
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>Publie ton premier contenu depuis l'onglet "+" pour apparaître dans le fil du quartier.</div>
    </div>
  );

  return <>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>
      Mes publications · {posts.length}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {posts.map((p, i) => (
        <div key={i} style={{ borderRadius: 12, aspectRatio: "1", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: "pointer" }}>
          {p.image_url
            ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ fontSize: 13, color: C.ink2, padding: 8, textAlign: "center", lineHeight: 1.4 }}>{p.content?.substring(0, 40) || "Post"}</div>
          }
          <div style={{ position: "absolute", bottom: 5, left: 5, fontSize: 8, fontWeight: 600, color: C.ink2, background: "rgba(255,255,255,0.85)", padding: "2px 5px", borderRadius: 6 }}>
            {p.type || "post"}
          </div>
        </div>
      ))}
    </div>
  </>;
}

// ─── ONGLET CRÉER ───
function TabCreer({ merchantName, setPage, user }) {
  const [mode, setMode] = useState("remise");
  const [typeRemise, setTypeRemise] = useState("pct");
  const [ciblage, setCiblage] = useState("all");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");
  // Champs remise
  const [titre, setTitre] = useState("");
  const [valeur, setValeur] = useState("");
  const [expiry, setExpiry] = useState("");
  const [conditions, setConditions] = useState("");
  const name = merchantName || "Mon enseigne";

  // Génère un code promo simple : 4 lettres du nom + valeur
  function genCode() {
    const prefix = (merchantName || "CHIP").replace(/\s+/g, "").toUpperCase().slice(0, 4);
    return `${prefix}${valeur || "XX"}`;
  }

  async function handlePublierRemise() {
    if (!titre.trim()) { setErreur("Le titre est obligatoire."); return; }
    if (!valeur)        { setErreur("La valeur est obligatoire."); return; }
    setSaving(true); setErreur("");
    const expiresAt = expiry ? new Date(expiry + "T23:59:00").toISOString() : null;
    const { error } = await supabase.from("remises").insert({
      user_id:     user?.id,
      title:       titre.trim(),
      type_remise: typeRemise,
      valeur:      parseInt(valeur) || 0,
      expires_at:  expiresAt,
      ciblage,
      conditions:  conditions.trim() || null,
      code:        genCode(),
      ended:       false,
    });
    setSaving(false);
    if (error) { setErreur(error.message); return; }
    // XP pour création d'une remise
    if (user?.id) addXP(user.id, 10, "remise_creee");
    setPublished(true);
    setTitre(""); setValeur(""); setExpiry(""); setConditions("");
  }

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
      <Input placeholder="Ex : Collection lin -15%" value={titre} onChange={e => setTitre(e.target.value)} />
      <Label>Type de remise</Label>
      <div style={{ display: "flex", background: C.pill, borderRadius: 12, padding: 3, marginBottom: 10 }}>
        {[{ id: "pct", l: "Pourcentage (%)" }, { id: "eur", l: "Montant (€)" }].map(t => (
          <button key={t.id} onClick={() => setTypeRemise(t.id)} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: dm, padding: 6, borderRadius: 10, border: "none", cursor: "pointer", background: typeRemise === t.id ? C.card : "transparent", color: typeRemise === t.id ? C.ink : C.ink2 }}>{t.l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div><Label>Valeur</Label><Input placeholder="15" type="number" value={valeur} onChange={e => setValeur(e.target.value)} /></div>
        <div><Label>Expire le</Label><Input placeholder="jj/mm/aaaa" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
      </div>
      <Label>Ciblage</Label>
      {[
        { id: "interesse", t: "Intéressés seulement", s: "Envoyé aux voisins ayant cliqué \"Intéressé·e\"" },
        { id: "all", t: "Tous mes abonnés", s: "Envoyé à l'ensemble de tes abonnés" },
      ].map(c => (
        <div key={c.id} onClick={() => setCiblage(c.id)} style={{ border: `1.5px solid ${ciblage === c.id ? C.accent : C.border}`, borderRadius: 14, padding: 10, marginBottom: 8, cursor: "pointer", background: ciblage === c.id ? "#FFF8F6" : "transparent" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{c.t}</div>
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 2 }}>{c.s}</div>
        </div>
      ))}
      <Label>Conditions (optionnel)</Label>
      <Input placeholder="ex : Min. 30€, 1 utilisation par personne" value={conditions} onChange={e => setConditions(e.target.value)} />
      <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 }}>Aperçu de la card voisin</div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 10, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#1565C0", background: "#E8F4FD", display: "inline-block", padding: "2px 6px", borderRadius: 6, marginBottom: 3 }}>Offre du quartier</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{titre || name}</div>
          <div style={{ fontSize: 10, color: C.ink2 }}>{conditions || "Voir conditions"}</div>
        </div>
        <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: C.accent }}>
          {valeur ? `-${valeur}${typeRemise === "pct" ? "%" : "€"}` : "-?"}
        </div>
      </div>
      {erreur && <div style={{ fontSize: 12, color: C.accent, marginBottom: 8 }}>⚠️ {erreur}</div>}
      <button onClick={handlePublierRemise} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 14, background: saving ? C.pill : C.accent, color: saving ? C.ink2 : "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "⏳ Publication…" : "Publier la remise"}
      </button>
    </> : <>
      <div
        onClick={() => setPage && setPage("defis")}
        style={{ background: "linear-gradient(135deg,#7B2FF7,#E840FB)", borderRadius: 18, padding: 20, marginBottom: 12, cursor: "pointer", textAlign: "center" }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 6 }}>Créer un défi</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, marginBottom: 14 }}>
          Choisis un emoji, une récompense, un mode de sélection du gagnant et lance ton défi dans le quartier !
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 13, fontWeight: 700 }}>
          ✨ Ouvrir le créateur de défi →
        </div>
      </div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Ce que tu peux configurer</div>
        {["🎨 Emoji & titre du défi", "🎁 Récompense (bon cadeau, remise…)", "👥 Limite de participants", "🗳️ Vote des voisins OU 🎯 Ton choix"].map((f, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12, color: C.ink }}>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </>}
  </>;
}

// ─── ONGLET MON PLAN ───
function TabPlan({ profile }) {
  const isArtisan = profile?.role === "artisan";
  return <>
    <div style={{ background: C.pro, borderRadius: 18, padding: 16, marginBottom: 10 }}>
      <div style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, color: "#fff" }}>
        {isArtisan ? "Plan Artisan 🎨" : "Plan Découverte"}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
        {isArtisan ? "Gratuit · Artisan local" : "9,90€ / mois"}
      </div>
      <div style={{ fontSize: 11, color: C.accent2, marginTop: 6 }}>
        Compte créé le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—"}
      </div>
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>Fonctionnalités incluses</div>
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: 12 }}>
      {["Vitrine publique", "Pro Layer", "Publication de posts", "Bons plans visibles", "Défis communautaires"].map((f, i, arr) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: C.proBg, color: C.pro, flexShrink: 0 }}>✓</span>
          <span>{f}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 14, background: "#FFF8F6", borderRadius: 16, border: "1.5px dashed rgba(255,87,51,0.3)", padding: 14 }}>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>Passer au plan Mixte</div>
      <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10, lineHeight: 1.5 }}>Bons plans ciblés, contenu sponsorisé, dashboard ROI complet.</div>
      <button style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>Voir les plans →</button>
    </div>
  </>;
}

// ─── PAGE ENRICHIR UN POST ───
function EnrichScreen({ onBack, merchantName, voisinPost }) {
  const [nomProduit, setNomProduit] = useState("");
  const [prix, setPrix] = useState("");
  const [tailles, setTailles] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const name = merchantName || "Mon enseigne";

  const handlePublish = async () => {
    setSaving(true);
    // Aperçu Pro Layer : dans une prochaine version, on sauvegardera en base
    // avec une table `enrichissements` (post_id, merchant_id, produit, prix…)
    await new Promise(r => setTimeout(r, 800)); // simulation
    setSaving(false);
    setPublished(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 14px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink, lineHeight: 1 }}>←</button>
        <span style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink }}>Enrichir ce post</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {published ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 6 }}>Post enrichi !</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16, lineHeight: 1.5 }}>
              Le Pro Layer est visible sur le post de {voisinPost?.name || "ce voisin"}.
            </div>
            <button onClick={onBack} style={{ background: C.pro, color: "#fff", border: "none", borderRadius: 14, padding: "10px 24px", fontSize: 13, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}>
              Retour au dashboard
            </button>
          </div>
        ) : <>
          {/* Aperçu du post voisin */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 12, marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {voisinPost?.emoji || "📸"}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{voisinPost?.name || "Post voisin"}</div>
              <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4 }}>{voisinPost?.desc || "Post à enrichir"}</div>
            </div>
          </div>

          {/* Formulaire enrichissement */}
          <Label>Nom du produit</Label>
          <Input
            placeholder="Ex : Robe Lin Naturel — Collection Été 2026"
            value={nomProduit}
            onChange={e => setNomProduit(e.target.value)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <Label>Prix</Label>
              <Input placeholder="89€" value={prix} onChange={e => setPrix(e.target.value)} />
            </div>
            <div>
              <Label>Tailles dispo</Label>
              <Input placeholder="XS S M L" value={tailles} onChange={e => setTailles(e.target.value)} />
            </div>
          </div>
          <Label>Description courte</Label>
          <Input
            placeholder="Ex : Lin 100% naturel, coupe ample, 3 coloris"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Aperçu Pro Layer */}
          <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
            Aperçu Pro Layer
          </div>
          <div style={{ background: C.proBg, borderRadius: 14, padding: 12, border: "1px solid rgba(10,61,46,0.12)", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.pro, fontWeight: 600, marginBottom: 6 }}>★ Enrichi par {name}</div>
            <div style={{ fontFamily: syne, fontSize: 16, fontWeight: 700, color: C.pro }}>
              {prix || "Prix à définir"}
            </div>
            {tailles && <div style={{ fontSize: 11, color: C.pro, opacity: 0.8, marginTop: 2 }}>{tailles.split(" ").join(" · ")}</div>}
            {nomProduit && <div style={{ fontSize: 12, fontWeight: 600, color: C.pro, marginTop: 4 }}>{nomProduit}</div>}
            {description && <div style={{ fontSize: 10, color: C.pro, opacity: 0.7, marginTop: 3 }}>{description}</div>}
          </div>

          <button
            onClick={handlePublish}
            disabled={saving || !nomProduit.trim()}
            style={{ width: "100%", padding: 14, borderRadius: 14, background: saving || !nomProduit.trim() ? "#ccc" : C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: saving || !nomProduit.trim() ? "not-allowed" : "pointer" }}
          >
            {saving ? "⏳ Publication…" : "Publier l'enrichissement"}
          </button>
        </>}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───
function BottomNav({ onNavigate }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    { id: "fab", isFab: true },
    { id: "voisins", icon: "👥", label: "Voisins" },
    { id: "profil", icon: "👤", label: "Mon profil" },
  ];
  return (
    <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
      {items.map(it => it.isFab ? (
        <div key="fab" onClick={() => onNavigate("nouveau")} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div>
      ) : (
        <div key={it.id} onClick={() => onNavigate(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: it.id === "profil" ? C.accent : C.ink2, cursor: "pointer" }}>
          <div style={{ fontSize: 18 }}>{it.icon}</div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───
export default function ChipeurProfilMagasin({ setPage, user, profile, updateProfile }) {
  const [screen, setScreen] = useState("main");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [postCount, setPostCount] = useState(null);
  const [voisinPost, setVoisinPost] = useState(null);
  const [localProfile, setLocalProfile] = useState(profile);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "posts", label: "Mes posts" },
    { id: "creer", label: "Créer" },
    { id: "plan", label: "Mon plan" },
  ];

  const [headerStats, setHeaderStats] = useState({ reactions: null, voisins: null });

  // Charger le vrai nombre de posts + stats header
  useEffect(() => {
    if (!user?.id) return;
    // Posts count
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .then(({ count }) => setPostCount(count ?? 0));
    // Réactions totales + voisins uniques (toutes périodes)
    supabase.from("posts").select("id").eq("author_id", user.id).then(async ({ data: posts }) => {
      if (!posts || posts.length === 0) return;
      const ids = posts.map(p => p.id);
      const { data: reactions } = await supabase
        .from("post_reactions").select("user_id").in("post_id", ids);
      const allR = reactions || [];
      const uniq = new Set(allR.map(r => r.user_id));
      setHeaderStats({ reactions: allR.length, voisins: uniq.size });
    });
  }, [user?.id]);

  // Sync localProfile si le parent repasse un nouveau profile
  useEffect(() => { setLocalProfile(profile); }, [profile]);

  const handleEnrich = (post) => {
    setVoisinPost(post);
    setScreen("enrich");
  };

  const handleSaved = (updates) => {
    const merged = { ...localProfile, ...updates };
    setLocalProfile(merged);
    if (updateProfile) updateProfile(updates);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "main" && <>
        <MagHeader profile={localProfile} postCount={postCount} headerStats={headerStats} onEdit={() => setScreen("edit")} onSettings={() => setSettingsOpen(true)} />
        <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, fontSize: 10, fontWeight: 600, fontFamily: dm, padding: "10px 2px 8px", border: "none", background: "transparent", cursor: "pointer", color: activeTab === t.id ? C.accent : C.ink2, borderBottom: `2px solid ${activeTab === t.id ? C.accent : "transparent"}` }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {activeTab === "dashboard" && <TabDashboard onEnrich={handleEnrich} postCount={postCount} merchantName={localProfile?.pseudo} userId={user?.id} />}
          {activeTab === "posts" && <TabPosts userId={user?.id} />}
          {activeTab === "creer" && <TabCreer merchantName={localProfile?.pseudo} setPage={setPage} user={user} />}
          {activeTab === "plan" && <TabPlan profile={localProfile} />}
        </div>
        <BottomNav onNavigate={setPage} />
      </>}

      {screen === "enrich" && (
        <EnrichScreen
          onBack={() => setScreen("main")}
          merchantName={localProfile?.pseudo}
          voisinPost={voisinPost}
        />
      )}

      {screen === "edit" && (
        <EditProfilScreen
          onBack={() => setScreen("main")}
          profile={localProfile}
          userId={user?.id}
          onSaved={handleSaved}
        />
      )}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        setPage={setPage}
        user={user}
        profile={localProfile}
      />
    </div>
  );
}
