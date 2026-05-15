import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { SettingsDrawer } from "./chipeur_settings";
import { addXP, addXPShop } from "./chipeur_xp";
import Avatar from "./Avatar";

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
          { v: postCount != null ? String(postCount) : "—", l: "Publications" },
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

// ─── POSTS VOISINS QUI MENTIONNENT LE COMMERCE ───
function MentionedPosts({ userId, merchantPseudo, onEnrich }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("posts")
      .select("*, profiles:author_id(pseudo, avatar_url)")
      .eq("magasin_id", userId)
      .neq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, [userId]);

  const handleAccept = async (post) => {
    if (accepting) return;
    setAccepting(post.id);
    try {
      // 1. Marquer le post comme accepté
      await supabase.from("posts")
        .update({ linked_status: "accepted" })
        .eq("id", post.id);

      // 2. Donner +10 XP Shop au voisin
      await addXPShop(post.author_id, userId, 10);

      // 3. Vérifier si un palier de 100 XP est franchi → notification
      const { data: wallet } = await supabase
        .from("merchant_xp_wallet")
        .select("points")
        .eq("user_id", post.author_id)
        .eq("merchant_id", userId)
        .maybeSingle();
      if (wallet) {
        const pts = wallet.points;
        const prev = pts - 10;
        if (Math.floor(pts / 100) > Math.floor(prev / 100)) {
          const bons = Math.floor(pts / 100);
          await supabase.from("notifications").insert({
            user_id: post.author_id, from_user_id: userId,
            type: "xpshop_palier", reference_id: post.id, read: false,
            message: JSON.stringify({ bons, merchant_name: merchantPseudo || "Le commerce", points: pts }),
          });
        }
      }

      // 4. Notification "photo acceptée" au voisin
      await supabase.from("notifications").insert({
        user_id: post.author_id, from_user_id: userId,
        type: "linked_accepted", reference_id: post.id, read: false,
        message: JSON.stringify({ merchant_name: merchantPseudo || "Un commerce" }),
      });

      // 5. Mettre à jour l'affichage local
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, linked_status: "accepted" } : p
      ));
    } catch (e) {
      console.error("handleAccept error:", e);
    }
    setAccepting(null);
  };

  const handleRetirer = async (postId) => {
    await supabase.from("posts").update({ magasin_id: null, linked_status: null }).eq("id", postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 60) return diff + "min";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return Math.floor(diff / 1440) + "j";
  };

  if (loading) return null;

  const pending  = posts.filter(p => p.linked_status !== "accepted");
  const accepted = posts.filter(p => p.linked_status === "accepted");

  if (posts.length === 0) return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px", marginBottom: 8, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>📌</div>
      <div style={{ fontSize: 12, color: C.ink2 }}>Aucun voisin n'a encore taguè ta boutique</div>
    </div>
  );

  const PostRow = ({ p, showAccept }) => {
    const hasEnrichment = p.product_label || p.product_price;
    const isAccepting = accepting === p.id;
    return (
      <div style={{
        background: C.card, borderRadius: 14, marginBottom: 8, overflow: "hidden",
        border: showAccept ? `1.5px solid #FF5733` : `1px solid ${C.border}`,
      }}>
        {showAccept && (
          <div style={{ background: "#FFF4F1", padding: "5px 10px", fontSize: 10, color: "#FF5733", fontWeight: 600 }}>
            ⏳ En attente de validation
          </div>
        )}
        {!showAccept && (
          <div style={{ background: "#EBF5F0", padding: "5px 10px", fontSize: 10, color: C.pro, fontWeight: 600 }}>
            ✅ Photo acceptée · +10 XP Shop offerts
          </div>
        )}
        <div style={{ display: "flex", gap: 10, padding: "10px 10px 8px", alignItems: "center" }}>
          {p.image_url ? (
            <img src={p.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📝</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{p.profiles?.pseudo || "Voisin·e"}</div>
            <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.content?.substring(0, 50) || "Photo sans description"}
            </div>
            <div style={{ fontSize: 9, color: C.ink2, marginTop: 2 }}>{timeAgo(p.created_at)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            {showAccept && (
              <button
                onClick={() => handleAccept(p)}
                disabled={isAccepting}
                style={{
                  background: isAccepting ? C.pill : "linear-gradient(135deg,#FF5733,#F7A72D)",
                  color: isAccepting ? C.ink2 : "#fff",
                  border: "none", borderRadius: 10, padding: "6px 10px",
                  fontSize: 10, fontWeight: 700, fontFamily: dm, cursor: "pointer",
                }}
              >
                {isAccepting ? "⏳…" : "✅ Accepter"}
              </button>
            )}
            <button
              onClick={() => onEnrich(p)}
              style={{
                background: hasEnrichment ? C.proBg : C.pill,
                color: hasEnrichment ? C.pro : C.ink2,
                border: "none", borderRadius: 10, padding: "5px 8px",
                fontSize: 10, fontWeight: 700, fontFamily: dm, cursor: "pointer",
              }}
            >
              {hasEnrichment ? "✏️ Enrichi" : "✦ Enrichir"}
            </button>
            {showAccept && (
              <button
                onClick={() => handleRetirer(p.id)}
                style={{
                  background: "#FFF0EE", color: "#C0392B",
                  border: "none", borderRadius: 10, padding: "5px 8px",
                  fontSize: 10, fontWeight: 700, fontFamily: dm, cursor: "pointer",
                }}
              >
                ✕ Refuser
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {pending.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#FF5733", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>
            ⏳ Photos à valider · {pending.length}
          </div>
          {pending.map(p => <PostRow key={p.id} p={p} showAccept={true} />)}
        </>
      )}
      {accepted.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.pro, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>
            ✅ Photos acceptées · {accepted.length}
          </div>
          {accepted.map(p => <PostRow key={p.id} p={p} showAccept={false} />)}
        </>
      )}
    </>
  );
}

// ─── MES DÉFIS (dans dashboard) ───
function MesDefis({ userId }) {
  const [defis, setDefis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDefi, setEditingDefi] = useState(null);
  const [editReward, setEditReward] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("defis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDefis(data || []); setLoading(false); });
  }, [userId]);

  const handleDelete = async (id) => {
    await supabase.from("defis").delete().eq("id", id);
    setDefis(prev => prev.filter(d => d.id !== id));
  };

  const handleEdit = (defi) => {
    setEditingDefi(defi);
    setEditTitle(defi.title || "");
    setEditReward(defi.reward || "");
  };

  const handleSaveEdit = async () => {
    if (!editingDefi) return;
    setSaving(true);
    const { error } = await supabase
      .from("defis")
      .update({ title: editTitle.trim(), reward: editReward.trim() })
      .eq("id", editingDefi.id);
    if (!error) {
      setDefis(prev => prev.map(d => d.id === editingDefi.id ? { ...d, title: editTitle.trim(), reward: editReward.trim() } : d));
      setEditingDefi(null);
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px" }}>
        🏆 Mes défis · {defis.length}
      </div>

      {defis.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 14, marginBottom: 8, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.ink2 }}>Aucun défi créé pour l'instant</div>
        </div>
      ) : defis.map(d => (
        <div key={d.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 10, padding: "10px 10px 8px", alignItems: "center" }}>
            <div style={{ fontSize: 26, flexShrink: 0 }}>{d.emoji || "🏆"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{d.title}</div>
              {d.reward && <div style={{ fontSize: 10, color: C.pro, marginTop: 2 }}>🎁 {d.reward}</div>}
              <div style={{ fontSize: 9, color: C.ink2, marginTop: 2 }}>
                {d.ends_at ? `Fin : ${new Date(d.ends_at).toLocaleDateString("fr-FR")}` : "Sans date limite"}
                {d.ended ? " · Terminé" : ""}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => handleEdit(d)}
                style={{ background: C.proBg, color: C.pro, border: "none", borderRadius: 10, padding: "5px 8px", fontSize: 10, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
              >✏️ Modifier</button>
              <button
                onClick={() => handleDelete(d.id)}
                style={{ background: "#FFF0EE", color: "#C0392B", border: "none", borderRadius: 10, padding: "5px 8px", fontSize: 10, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
              >🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal modification défi */}
      {editingDefi && (
        <div onClick={() => setEditingDefi(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: "20px 20px 0 0", width: "100%", padding: "20px 16px 40px" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14 }}>✏️ Modifier le défi</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>TITRE</div>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.bg, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
            />
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>RÉCOMPENSE</div>
            <input
              value={editReward}
              onChange={e => setEditReward(e.target.value)}
              placeholder="Ex : Bon cadeau 20€ pour le Top 3"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: dm, fontSize: 13, color: C.ink, background: C.bg, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              style={{ width: "100%", background: saving ? "#ccc" : C.pro, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
            >{saving ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </div>
      )}
    </>
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

// ─── BLOC XP CRÉDITS LOCAUX (réutilisable) ──────────────────────
function MerchantXpBlock({ userId, merchantName }) {
  const [xpStats, setXpStats] = useState({ totalXp: 0, voisinCount: 0, acceptedCount: 0 });
  const [wallets, setWallets] = useState([]);
  const [showVoisins, setShowVoisins] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("merchant_xp_wallet")
      .select("points, user_id, profiles:user_id(pseudo, avatar_url)")
      .eq("merchant_id", userId)
      .order("points", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const totalXp = data.reduce((s, r) => s + (r.points || 0), 0);
        const voisinCount = new Set(data.map(r => r.user_id)).size;
        setXpStats(prev => ({ ...prev, totalXp, voisinCount }));
        setWallets(data);
      });
    supabase.from("posts").select("id", { count: "exact", head: true })
      .eq("magasin_id", userId).eq("linked_status", "accepted")
      .then(({ count }) => setXpStats(prev => ({ ...prev, acceptedCount: count || 0 })));
  }, [userId]);

  return (
    <>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "6px 0 6px" }}>
        🏅 Crédits locaux générés
      </div>
      <div style={{ background: "linear-gradient(135deg,#0A3D2E,#1a6647)", borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: "#fff" }}>{xpStats.totalXp}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>XP Shop distribués</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: "#fff" }}>{xpStats.acceptedCount}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>posts acceptés</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: "#fff" }}>{xpStats.voisinCount}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>voisins récompensés</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>💡 Comment ça marche ?</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
            Quand un voisin publie un post en vous mentionnant, vous pouvez l'<b style={{ color: "#fff" }}>accepter</b> depuis l'onglet <b style={{ color: "#fff" }}>Mentions</b>.<br />
            Chaque post accepté = <b style={{ color: "#FFD700" }}>+10 XP Shop</b> pour le voisin.<br />
            100 XP Shop = <b style={{ color: "#FFD700" }}>5 € de bon d'achat</b> utilisable uniquement chez vous !
          </div>
        </div>
      </div>

      {/* Liste des voisins ambassadeurs */}
      {wallets.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setShowVoisins(v => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 14px", cursor: "pointer", fontFamily: syne, fontSize: 13, fontWeight: 700, color: C.ink }}
          >
            <span>🧑‍🤝‍🧑 Vos ambassadeurs locaux ({wallets.length})</span>
            <span style={{ fontSize: 16, color: C.ink2, transition: "transform 0.2s", transform: showVoisins ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</span>
          </button>

          {showVoisins && (
            <div style={{ background: C.card, borderRadius: "0 0 14px 14px", border: `1px solid ${C.border}`, borderTop: "none", overflow: "hidden" }}>
              {wallets.map((w, i) => {
                const pts = w.points || 0;
                const pct = Math.min(100, Math.round((pts % 100)));
                const bons = Math.floor(pts / 100);
                const pseudo = w.profiles?.pseudo || "Voisin·e";
                const avatar = w.profiles?.avatar_url;
                return (
                  <div key={w.user_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < wallets.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EBF5F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, overflow: "hidden" }}>
                      {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{pseudo}</div>
                      <div style={{ height: 5, background: "#EEE", borderRadius: 5, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${bons > 0 ? 100 : pct}%`, background: bons > 0 ? "#22c55e" : "linear-gradient(90deg,#FF5733,#F7A72D)", borderRadius: 5 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 14, color: bons > 0 ? "#0A3D2E" : C.accent }}>{pts}</div>
                      <div style={{ fontSize: 9, color: C.ink2 }}>XP Shop</div>
                      {bons > 0 && <div style={{ fontSize: 9, color: "#0A3D2E", fontWeight: 700 }}>🎁 {bons * 5}€ dispo</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TabDashboard({ onEnrich, postCount, merchantName, userId, onGoMentions }) {
  const [period, setPeriod] = useState("semaine");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBar, setActiveBar] = useState(null);
  // Métriques
  const [totalReactions, setTotalReactions] = useState(0);
  const [reactionsByType, setReactionsByType] = useState({});
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [topPosts, setTopPosts] = useState([]);
  const [recoCount, setRecoCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => { if (userId) loadData(); }, [period, userId]);

  // Compteur de photos en attente (indépendant de la période)
  useEffect(() => {
    if (!userId) return;
    supabase.from("posts").select("id", { count: "exact", head: true })
      .eq("magasin_id", userId).neq("author_id", userId).neq("linked_status", "accepted")
      .then(({ count }) => setPendingCount(count || 0));
  }, [userId]);

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

    // Recommandations "Je cherche" reçues (toutes périodes)
    if (userId) {
      const { count } = await supabase
        .from("post_recommendations")
        .select("id", { count: "exact", head: true })
        .eq("magasin_id", userId);
      setRecoCount(count || 0);
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

      {/* ── DEMANDES PHOTOS EN ATTENTE ── */}
      {pendingCount > 0 && (
        <div
          onClick={onGoMentions}
          style={{ background: "#FFF4F1", borderRadius: 14, border: "1.5px solid #FF5733", padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📸</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.accent }}>{pendingCount} photo{pendingCount > 1 ? "s" : ""} en attente</div>
            <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>Valide-les pour récompenser tes voisins en XP Shop</div>
          </div>
          <div style={{ fontSize: 18, color: C.accent }}>→</div>
        </div>
      )}

      {/* ── 5 CARTES MÉTRIQUES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {[
          { v: postCount != null ? String(postCount) : "—", l: "Posts publiés",      icon: "📸", color: C.ink },
          { v: String(totalReactions),                       l: "Réactions reçues",   icon: "⚡", color: C.accent },
          { v: String(uniqueUsers),                          l: "Voisins engagés",    icon: "👥", color: "#7C3AED" },
          { v: String(intentionCount),                       l: "\"Je le veux\"",     icon: "🛒", color: C.pro },
          { v: String(recoCount),                            l: "Je cherche · Recos", icon: "🔍", color: "#0369A1" },
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

      {/* ── MES DÉFIS ── */}
      <MesDefis userId={userId} />

      {/* ── POSTS VOISINS QUI ME MENTIONNENT ── */}
      <MentionedPosts userId={userId} merchantPseudo={merchantName} onEnrich={onEnrich} />

      {/* ── CRÉDITS LOCAUX XP ── */}
      <MerchantXpBlock userId={userId} merchantName={merchantName} />

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
  const initMode = localStorage.getItem("chipeur_creer_mode") || "remise";
  const [mode, setMode] = useState(initMode);
  useEffect(() => {
    if (localStorage.getItem("chipeur_creer_mode")) {
      localStorage.removeItem("chipeur_creer_mode");
    }
  }, []);
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
function EnrichScreen({ onBack, merchantName, voisinPost, onSaved }) {
  const [nomProduit, setNomProduit] = useState(voisinPost?.product_label || "");
  const [prix, setPrix] = useState(voisinPost?.product_price || "");
  const [description, setDescription] = useState(voisinPost?.product_detail || "");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const name = merchantName || "Mon enseigne";

  const handlePublish = async () => {
    if (!voisinPost?.id) return;
    setSaving(true);
    const { error } = await supabase.from("posts").update({
      product_label:  nomProduit.trim() || null,
      product_price:  prix.trim() || null,
      product_detail: description.trim() || null,
    }).eq("id", voisinPost.id);
    setSaving(false);
    if (error) { console.error("Enrichir:", error); return; }
    if (onSaved) onSaved(voisinPost.id, { product_label: nomProduit.trim(), product_price: prix.trim(), product_detail: description.trim() });
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
              <Label>Détail</Label>
              <Input placeholder="Lin naturel, 3 coloris…" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Aperçu Pro Layer */}
          <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
            Aperçu Pro Layer
          </div>
          <div style={{ background: C.proBg, borderRadius: 14, padding: 12, border: "1px solid rgba(10,61,46,0.12)", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.pro, fontWeight: 600, marginBottom: 6 }}>★ Enrichi par {name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.pro, flex: 1 }}>{nomProduit || "Nom du produit"}</div>
              {prix && <div style={{ fontFamily: syne, fontSize: 16, fontWeight: 700, color: C.accent, flexShrink: 0 }}>{prix}</div>}
            </div>
            {description && <div style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>{description}</div>}
          </div>

          <button
            onClick={handlePublish}
            disabled={saving || !nomProduit.trim()}
            style={{ width: "100%", padding: 14, borderRadius: 14, background: saving || !nomProduit.trim() ? "#ccc" : C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: saving || !nomProduit.trim() ? "not-allowed" : "pointer" }}
          >
            {saving ? "⏳ Enregistrement…" : "Enregistrer l'enrichissement ✓"}
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
    { id: "sorties", icon: "📅", label: "Évén." },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
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

// ─── ONGLET MENTIONS ────────────────────────────────────────────
function TabMentions({ pseudo, userId, merchantName }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [claimed, setClaimed] = useState(new Set());
  const [recherchePosts, setRecherchePosts] = useState([]);
  const [loadingReco, setLoadingReco] = useState(true);

  // ── Photos directement liées à ce commerce (pending + accepted) ──
  const [linkedPosts, setLinkedPosts] = useState([]);
  const [loadingLinked, setLoadingLinked] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    if (!userId) { setLoadingLinked(false); return; }
    supabase.from("posts")
      .select("*, profiles:author_id(pseudo, avatar_url)")
      .eq("magasin_id", userId)
      .neq("author_id", userId)
      .order("linked_status", { ascending: true }) // pending d'abord
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => { setLinkedPosts(data || []); setLoadingLinked(false); });
  }, [userId]);

  const handleAcceptLinked = async (post) => {
    if (accepting) return;
    setAccepting(post.id);
    try {
      await supabase.from("posts").update({ linked_status: "accepted" }).eq("id", post.id);
      await addXPShop(post.author_id, userId, 10);
      // Vérifier palier 100 XP
      const { data: wallet } = await supabase.from("merchant_xp_wallet")
        .select("points").eq("user_id", post.author_id).eq("merchant_id", userId).maybeSingle();
      if (wallet) {
        const pts = wallet.points;
        if (Math.floor(pts / 100) > Math.floor((pts - 10) / 100)) {
          await supabase.from("notifications").insert({
            user_id: post.author_id, from_user_id: userId,
            type: "xpshop_palier", reference_id: post.id, read: false,
            message: JSON.stringify({ bons: Math.floor(pts / 100), merchant_name: merchantName || "Le commerce", points: pts }),
          });
        }
      }
      await supabase.from("notifications").insert({
        user_id: post.author_id, from_user_id: userId,
        type: "linked_accepted", reference_id: post.id, read: false,
        message: JSON.stringify({ merchant_name: merchantName || "Un commerce" }),
      });
      setLinkedPosts(prev => prev.map(p => p.id === post.id ? { ...p, linked_status: "accepted" } : p));
    } catch (e) { console.error("handleAcceptLinked:", e); }
    setAccepting(null);
  };

  const handleRejectLinked = async (postId) => {
    await supabase.from("posts").update({ magasin_id: null, linked_status: null }).eq("id", postId);
    setLinkedPosts(prev => prev.filter(p => p.id !== postId));
  };

  const timeAgoLinked = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    return `Il y a ${diff}j`;
  };

  const normalize = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  useEffect(() => {
    if (!userId) return;
    // Charger les recommandations "Je cherche" reçues
    supabase.from("post_recommendations")
      .select("id, magasin_nom, created_at, post_id, posts(id, content, created_at, profiles:author_id(pseudo, avatar_url))")
      .eq("magasin_id", userId)
      .order("created_at", { ascending: false })
      .then(async ({ data: recos }) => {
        if (!recos || recos.length === 0) { setLoadingReco(false); return; }
        // Récupérer les votes pour chaque reco
        const ids = recos.map(r => r.id);
        const { data: votes } = await supabase
          .from("recommendation_votes").select("recommendation_id, vote")
          .in("recommendation_id", ids);
        const voteData = votes || [];
        setRecherchePosts(recos.map(r => ({
          ...r,
          up_count:   voteData.filter(v => v.recommendation_id === r.id && v.vote === "up").length,
          down_count: voteData.filter(v => v.recommendation_id === r.id && v.vote === "down").length,
        })));
        setLoadingReco(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!pseudo) return;
    // Cherche les posts avec magasin_nom non null et non déjà associé
    supabase.from("posts")
      .select("id, content, image_url, created_at, magasin_nom, magasin_id, profiles:author_id(pseudo, avatar_url)")
      .not("magasin_nom", "is", null)
      .is("magasin_id", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const norm = normalize(pseudo);
        const matched = (data || []).filter(p => {
          const n = normalize(p.magasin_nom);
          return n.includes(norm) || norm.includes(n) || similarity(n, norm) > 0.6;
        });
        setPosts(matched);
        setLoading(false);
      });
  }, [pseudo]);

  // Similarité simple : ratio de caractères communs
  function similarity(a, b) {
    if (!a || !b) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    let matches = 0;
    for (const c of shorter) { if (longer.includes(c)) matches++; }
    return matches / longer.length;
  }

  async function claim(post) {
    setClaiming(post.id);
    await supabase.from("posts").update({ magasin_id: userId }).eq("id", post.id);
    setClaimed(prev => new Set([...prev, post.id]));
    setClaiming(null);
  }

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    return `Il y a ${diff} jours`;
  };

  return (
    <div style={{ padding: "16px 0 32px" }}>

      {/* ── PHOTOS LIÉES À MON COMMERCE ── */}
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>📸 Photos liées à mon commerce</div>
      <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10, lineHeight: 1.5 }}>
        Un voisin a associé ces photos à ton enseigne. Accepte pour lui offrir +10 XP Shop.
      </div>

      {loadingLinked ? (
        <div style={{ textAlign: "center", padding: "12px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
      ) : linkedPosts.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px", textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📌</div>
          <div style={{ fontSize: 12, color: C.ink2 }}>Aucune photo liée à votre commerce pour l'instant</div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {linkedPosts.map(p => {
            const isPending = p.linked_status !== "accepted";
            const isAcc = accepting === p.id;
            return (
              <div key={p.id} style={{ background: C.card, borderRadius: 14, marginBottom: 8, overflow: "hidden", border: isPending ? `1.5px solid #FF5733` : `1px solid ${C.border}` }}>
                <div style={{ background: isPending ? "#FFF4F1" : "#EBF5F0", padding: "5px 10px", fontSize: 10, color: isPending ? "#FF5733" : C.pro, fontWeight: 600 }}>
                  {isPending ? "⏳ En attente de validation" : "✅ Photo acceptée · +10 XP Shop offerts"}
                </div>
                <div style={{ display: "flex", gap: 10, padding: "10px 10px 8px", alignItems: "center" }}>
                  {p.image_url
                    ? <img src={p.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 52, height: 52, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📝</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{p.profiles?.pseudo || "Voisin·e"}</div>
                    <div style={{ fontSize: 11, color: C.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.content?.substring(0, 50) || "Photo sans description"}
                    </div>
                    <div style={{ fontSize: 9, color: C.ink2, marginTop: 2 }}>{timeAgoLinked(p.created_at)}</div>
                  </div>
                </div>
                {isPending && (
                  <div style={{ display: "flex", gap: 6, padding: "0 10px 10px" }}>
                    <button
                      onClick={() => handleAcceptLinked(p)}
                      disabled={isAcc}
                      style={{ flex: 2, background: isAcc ? "#ccc" : C.pro, color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
                    >{isAcc ? "…" : "✅ Accepter"}</button>
                    <button
                      onClick={() => handleRejectLinked(p.id)}
                      style={{ flex: 1, background: C.pill, color: C.ink2, border: "none", borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 600, fontFamily: dm, cursor: "pointer" }}
                    >✕ Refuser</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bloc XP — contexte pour le commerçant */}
      <MerchantXpBlock userId={userId} merchantName={merchantName} />

      {/* ── SECTION "JE CHERCHE" ── */}
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>🔍 Recommandé sur des "Je cherche"</div>
      <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10, lineHeight: 1.5 }}>
        Des voisins t'ont recommandé en réponse à des demandes. Voici les posts où ton commerce a été cité.
      </div>
      {loadingReco ? (
        <div style={{ textAlign: "center", padding: "12px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
      ) : recherchePosts.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px", textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>Aucune recommandation reçue pour l'instant.<br />Quand un voisin te recommandera sur un post "Je cherche", ça apparaîtra ici.</div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {recherchePosts.map(reco => (
            <div key={reco.id} style={{ background: "#EFF6FF", borderRadius: 14, border: "1.5px solid #BAE6FD", padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🏪</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 2 }}>Recommandé par {reco.posts?.profiles?.pseudo || "un voisin"}</div>
                  {reco.posts?.content && (
                    <div style={{ fontSize: 11, color: C.ink2, marginBottom: 6, lineHeight: 1.4 }}>
                      "{reco.posts.content.slice(0, 80)}{reco.posts.content.length > 80 ? "…" : ""}"
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>👍 {reco.up_count}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#E53935" }}>👎 {reco.down_count}</span>
                    <span style={{ fontSize: 10, color: C.ink2, marginLeft: "auto" }}>
                      {new Date(reco.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>Posts te mentionnant</div>
      <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16, lineHeight: 1.5 }}>
        Des voisins ont associé des posts à ton commerce. Accepte-les pour leur offrir des crédits locaux — ou revendique ceux postés avant ton inscription.
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: C.ink2, fontSize: 12 }}>Recherche en cours…</div>
      ) : posts.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
          <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>
            Aucune mention trouvée pour l'instant.<br />Quand un voisin associera un post à <b>"{pseudo}"</b>, il apparaîtra ici.
          </div>
        </div>
      ) : posts.map(p => (
        <div key={p.id} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
          {p.image_url && (
            <div style={{ height: 120, overflow: "hidden" }}>
              <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Avatar pseudo={p.profiles?.pseudo} avatarUrl={p.profiles?.avatar_url} size={28} />
              <div>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink }}>{p.profiles?.pseudo || "Voisin"}</div>
                <div style={{ fontSize: 10, color: C.ink2 }}>{timeAgo(p.created_at)} · Mention : <b>"{p.magasin_nom}"</b></div>
              </div>
            </div>
            {p.content && <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10, lineHeight: 1.5 }}>{p.content.slice(0, 100)}{p.content.length > 100 ? "…" : ""}</div>}
            {claimed.has(p.id) ? (
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0A3D2E", padding: "8px 0" }}>✅ Associé à ton profil</div>
            ) : (
              <button
                onClick={() => claim(p)}
                disabled={claiming === p.id}
                style={{ width: "100%", background: claiming === p.id ? "#ccc" : C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "10px 0", fontSize: 12, fontWeight: 700, fontFamily: dm, cursor: "pointer" }}
              >
                {claiming === p.id ? "Association…" : "🔗 Revendiquer ce post"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ONGLET MES DÉFIS ───────────────────────────────────────────
function TabMesDefis({ userId }) {
  const [defis, setDefis]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState(null);   // id défi dont on voit les résultats
  const [voteData, setVoteData]         = useState({});     // id → { photos, totalVoters }
  const [winnerPicker, setWinnerPicker] = useState(null);   // défi pour lequel on choisit
  const [confirmClose, setConfirmClose] = useState(null);   // défi à clôturer
  const [confirmDelete, setConfirmDelete] = useState(null); // défi à supprimer
  const [editDefi, setEditDefi]         = useState(null);   // défi en cours d'édition
  const [editForm, setEditForm]         = useState({});     // valeurs du formulaire d'édition
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("defis").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDefis(data || []); setLoading(false); });
  }, [userId]);

  // Charger votes + photos d'un défi quand on l'ouvre
  async function loadVotes(d) {
    if (voteData[d.id]) { setExpanded(d.id); return; }
    const [{ data: votes }, { data: photos }] = await Promise.all([
      supabase.from("defi_votes").select("post_id, voter_id, vote").eq("defi_id", d.id),
      supabase.from("posts").select("id, image_url, content, author_id, profiles:author_id(pseudo, avatar_url)")
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
    setDefis(prev => prev.map(d => d.id === id ? { ...d, ended: true } : d));
    setConfirmClose(null);
  }

  async function pickWinner(defi, post) {
    // Sauvegarder winner_post_id + notifier le gagnant
    await supabase.from("defis").update({ winner_post_id: post.id }).eq("id", defi.id);
    if (post.author_id) {
      await supabase.from("notifications").insert({
        user_id: post.author_id,
        from_user_id: userId,
        type: "winner",
        reference_id: defi.id,
        read: false,
      });
    }
    setDefis(prev => prev.map(d => d.id === defi.id ? { ...d, winner_post_id: post.id } : d));
    setWinnerPicker(null);
  }

  async function deleteDefi(id) {
    await supabase.from("defi_votes").delete().eq("defi_id", id);
    await supabase.from("defis").delete().eq("id", id);
    setDefis(prev => prev.filter(d => d.id !== id));
    setConfirmDelete(null);
  }

  function openEdit(d) {
    setEditForm({
      title:       d.title       || "",
      description: d.description || "",
      reward:      d.reward      || "",
      ends_at:     d.ends_at     ? d.ends_at.slice(0, 10) : "",
    });
    setEditDefi(d);
  }

  async function saveEditDefi() {
    if (!editDefi) return;
    setSaving(true);
    const updates = {
      title:       editForm.title.trim(),
      description: editForm.description.trim(),
      reward:      editForm.reward.trim() || null,
      ends_at:     editForm.ends_at       || null,
    };
    const { error } = await supabase.from("defis").update(updates).eq("id", editDefi.id);
    if (!error) {
      setDefis(prev => prev.map(d => d.id === editDefi.id ? { ...d, ...updates } : d));
    }
    setSaving(false);
    setEditDefi(null);
  }

  const podiumColors = ["#F7A72D", "#A8A9AD", "#C07D3E"];
  const podiumEmojis = ["🥇", "🥈", "🥉"];

  if (loading) return <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2, fontSize: 13 }}>Chargement…</div>;

  if (defis.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucun défi créé</div>
      <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>
        Crée ton premier défi depuis l'onglet "Créer" pour engager tes clients !
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 14 }}>

      {/* ── CONFIRM CLÔTURE ── */}
      {confirmClose && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>🔒 Clôturer ce défi ?</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Les participants ne pourront plus poster. Les votes restent visibles.</div>
            <button onClick={() => closeDefi(confirmClose)} style={{ width: "100%", background: C.ink, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>Clôturer définitivement</button>
            <button onClick={() => setConfirmClose(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── CONFIRM SUPPRESSION ── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: "#DC2626", marginBottom: 6 }}>🗑️ Supprimer ce défi ?</div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18 }}>Cette action est irréversible. Le défi et tous ses votes seront définitivement supprimés.</div>
            <button onClick={() => deleteDefi(confirmDelete)} style={{ width: "100%", background: "#DC2626", color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer", marginBottom: 8 }}>Supprimer définitivement</button>
            <button onClick={() => setConfirmDelete(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── ÉDITION DÉFI ── */}
      {editDefi && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.65)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 16 }}>✏️ Modifier le défi</div>
            {[
              { key: "title",       label: "Titre",       placeholder: "Ex: Photo du meilleur plat" },
              { key: "description", label: "Description", placeholder: "Décris le défi…" },
              { key: "reward",      label: "Récompense",  placeholder: "Ex: Bon d'achat 20 €" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>{label}</div>
                <input
                  value={editForm[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: dm, color: C.ink, outline: "none" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>Date de fin</div>
              <input
                type="date"
                value={editForm.ends_at}
                onChange={e => setEditForm(f => ({ ...f, ends_at: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: dm, color: C.ink, outline: "none" }}
              />
            </div>
            <button onClick={saveEditDefi} disabled={saving} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: saving ? "not-allowed" : "pointer", marginBottom: 8, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Enregistrement…" : "Enregistrer ✓"}
            </button>
            <button onClick={() => setEditDefi(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── PICKER GAGNANT ── */}
      {winnerPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.7)", display: "flex", flexDirection: "column", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: "24px 24px 0 0", marginTop: "auto", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 16px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>🏆 Choisir le gagnant</div>
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 3 }}>Appuie sur la photo pour la sélectionner</div>
            </div>
            <div style={{ overflowY: "auto", padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(voteData[winnerPicker.id]?.photos || []).map((p, i) => (
                <div key={p.id} onClick={() => pickWinner(winnerPicker, p)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "1", cursor: "pointer", border: i === 0 ? `3px solid ${podiumColors[0]}` : `1px solid ${C.border}` }}>
                  <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 4, left: 4, fontSize: 14 }}>{i < 3 ? podiumEmojis[i] : `#${i+1}`}</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "6px 6px 5px" }}>
                    <div style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{p.profiles?.pseudo}</div>
                    <div style={{ fontSize: 9, color: "#22c55e" }}>❤️ {p.likes}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 14px 32px", flexShrink: 0 }}>
              <button onClick={() => setWinnerPicker(null)} style={{ width: "100%", background: C.pill, color: C.ink2, border: "none", borderRadius: 14, padding: 13, fontSize: 13, fontFamily: dm, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LISTE DÉFIS ── */}
      {defis.map(d => {
        const isOpen = expanded === d.id;
        const data = voteData[d.id];
        const daysLeft = d.ends_at ? Math.max(0, Math.ceil((new Date(d.ends_at) - new Date()) / 86400000)) : null;
        const isEnded = d.ended || (d.ends_at && new Date(d.ends_at) < new Date());
        const winnerPost = data?.photos?.find(p => p.id === d.winner_post_id);

        return (
          <div key={d.id} style={{ background: C.card, borderRadius: 18, marginBottom: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>

            {/* ── Header défi ── */}
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", alignItems: "center" }}>
              {d.photo_url
                ? <img src={d.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#FF5733,#F7A72D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{d.emoji || "🏆"}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: C.ink2 }}>
                  {isEnded ? "✅ Terminé" : daysLeft !== null ? `⏱ ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}` : "En cours"}
                  {d.reward ? ` · 🎁 ${d.reward}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: isEnded ? C.pill : "#EBF5F0", color: isEnded ? C.ink2 : C.pro }}>
                  {isEnded ? "Terminé" : "En cours"}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(d)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer", color: C.ink }}>✏️</button>
                  <button onClick={() => setConfirmDelete(d.id)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer", color: "#DC2626" }}>🗑️</button>
                </div>
              </div>
            </div>

            {/* ── Stats rapides ── */}
            <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
              {[
                { n: d.participants_count ?? "—", l: "participants" },
                { n: data?.totalVoters ?? "—", l: "votants" },
                { n: data?.photos?.length ?? "—", l: "photos" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>{s.n}</div>
                  <div style={{ fontSize: 9, color: C.ink2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* ── Gagnant déjà choisi ── */}
            {winnerPost && (
              <div style={{ margin: "10px 14px", background: "#FFF8E8", border: "1.5px solid #F7A72D", borderRadius: 14, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                <img src={winnerPost.image_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#B45309", marginBottom: 2 }}>🏆 GAGNANT·E</div>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink }}>{winnerPost.profiles?.pseudo}</div>
                  <div style={{ fontSize: 10, color: C.ink2 }}>❤️ {winnerPost.likes} likes</div>
                </div>
              </div>
            )}

            {/* ── Résultats votes (expandable) ── */}
            {isOpen && data && (
              <div style={{ padding: "10px 14px 0" }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 12, color: C.ink, marginBottom: 8 }}>📊 Classement des photos</div>
                {data.photos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "12px 0", color: C.ink2, fontSize: 12 }}>Aucune photo soumise pour l'instant.</div>
                ) : data.photos.slice(0, 5).map((p, i) => {
                  const total = p.likes + p.passes;
                  const pct = total > 0 ? Math.round((p.likes / total) * 100) : 0;
                  return (
                    <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: 1, left: 1, fontSize: 10 }}>{i < 3 ? podiumEmojis[i] : `#${i+1}`}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{p.profiles?.pseudo || "Voisin·e"}</div>
                        <div style={{ height: 4, background: C.pill, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? "#F7A72D" : "#22c55e", borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>❤️ {p.likes}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Boutons actions ── */}
            <div style={{ display: "flex", gap: 8, padding: "10px 14px 14px" }}>
              <button
                onClick={() => isOpen ? setExpanded(null) : loadVotes(d)}
                style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: C.ink }}
              >{isOpen ? "Masquer" : "📊 Résultats"}</button>

              {!isEnded && (
                <button
                  onClick={() => setConfirmClose(d.id)}
                  style={{ flex: 1, background: C.pill, border: "none", borderRadius: 12, padding: "9px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: C.ink2 }}
                >🔒 Clôturer</button>
              )}

              {(isEnded || d.selection_mode === "vote") && !d.winner_post_id && data?.photos?.length > 0 && (
                <button
                  onClick={() => { loadVotes(d); setWinnerPicker(d); }}
                  style={{ flex: 1, background: "#FFF8E8", border: "1.5px solid #F7A72D", borderRadius: 12, padding: "9px 0", fontSize: 11, fontWeight: 700, fontFamily: dm, cursor: "pointer", color: "#B45309" }}
                >🏆 Gagnant</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───
export default function ChipeurProfilMagasin({ setPage, user, profile, updateProfile }) {
  const [screen, setScreen] = useState("main");
  const initTab = localStorage.getItem("chipeur_profil_tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initTab);
  useEffect(() => {
    if (localStorage.getItem("chipeur_profil_tab")) {
      localStorage.removeItem("chipeur_profil_tab");
    }
  }, []);
  const [postCount, setPostCount] = useState(null);
  const [voisinPost, setVoisinPost] = useState(null);
  const [localProfile, setLocalProfile] = useState(profile);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "posts", label: "Mes posts" },
    { id: "mentions", label: "📣 Mentions" },
    { id: "creer", label: "Créer" },
    { id: "defis", label: "Mes défis" },
    { id: "plan", label: "Mon plan", disabled: true },
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
            <button key={t.id} onClick={() => !t.disabled && setActiveTab(t.id)} style={{ flex: 1, fontSize: 10, fontWeight: 600, fontFamily: dm, padding: "10px 2px 8px", border: "none", background: "transparent", cursor: t.disabled ? "default" : "pointer", color: t.disabled ? "#C4C1BC" : activeTab === t.id ? C.accent : C.ink2, borderBottom: `2px solid ${activeTab === t.id ? C.accent : "transparent"}`, opacity: t.disabled ? 0.5 : 1 }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {activeTab === "dashboard" && <TabDashboard onEnrich={handleEnrich} postCount={postCount} merchantName={localProfile?.pseudo} userId={user?.id} onGoMentions={() => setActiveTab("mentions")} />}
          {activeTab === "posts" && <TabPosts userId={user?.id} />}
          {activeTab === "mentions" && <TabMentions pseudo={localProfile?.pseudo} userId={user?.id} merchantName={localProfile?.pseudo} />}
          {activeTab === "creer" && <TabCreer merchantName={localProfile?.pseudo} setPage={setPage} user={user} />}
          {activeTab === "defis" && <TabMesDefis userId={user?.id} />}
          {activeTab === "plan" && <TabPlan profile={localProfile} />}
        </div>
        <BottomNav onNavigate={setPage} />
      </>}

      {screen === "enrich" && (
        <EnrichScreen
          onBack={() => setScreen("main")}
          merchantName={localProfile?.pseudo}
          voisinPost={voisinPost}
          onSaved={() => setScreen("main")}
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
