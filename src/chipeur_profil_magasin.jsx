import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = { bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560", accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0", pill: "#EDEBE8", border: "rgba(26,23,20,0.08)" };
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function Label({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4, display: "block" }}>{children}</div>; }
function Input(props) { return <input {...props} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />; }

// ─── HEADER DU PROFIL MAGASIN ───
function MagHeader({ profile, postCount, onEdit }) {
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
        {/* Bouton modifier */}
        <button onClick={onEdit} style={{
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 11,
          fontWeight: 600, fontFamily: dm, cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span>✏️</span> Modifier
        </button>
      </div>
      {/* Stats */}
      <div style={{ display: "flex", marginTop: 12 }}>
        {[
          { v: "—", l: "Vues ce mois" },
          { v: "—", l: "Intéressés" },
          { v: postCount != null ? String(postCount) : "—", l: "Posts" },
          { v: "0", l: "Remises actives" },
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

// ─── ÉCRAN MODIFIER LE PROFIL ───
function EditProfilScreen({ onBack, profile, userId, onSaved }) {
  const [pseudo, setPseudo]     = useState(profile?.pseudo || "");
  const [bio, setBio]           = useState(profile?.bio || "");
  const [quartier, setQuartier] = useState(profile?.quartier || "");
  const [phone, setPhone]       = useState(profile?.phone || "");
  const [website, setWebsite]   = useState(profile?.website || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("images")
      .upload(path, file, { upsert: true });
    if (upErr) { setError("Erreur upload : " + upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    const updates = { pseudo, bio, quartier, phone, website, avatar_url: avatarUrl };
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
          <Label>Description / Présentation</Label>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Décris ton enseigne, tes produits, ton univers…"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none", marginBottom: 10, boxSizing: "border-box", minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
          />
          <Label>Adresse / Quartier</Label>
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
function TabDashboard({ onEnrich, postCount, merchantName, userId }) {
  const [period, setPeriod] = useState("semaine");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBar, setActiveBar] = useState(null);
  const [totalReactions, setTotalReactions] = useState(0);

  useEffect(() => {
    if (!userId) return;
    loadChartData();
  }, [period, userId]);

  const loadChartData = async () => {
    setLoading(true);
    setActiveBar(null);
    const now = new Date();
    let startDate, labels;

    if (period === "semaine") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      const JOURS = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return { label: i === 6 ? "Auj." : JOURS[d.getDay()], date: new Date(d) };
      });
    } else if (period === "mois") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 27);
      startDate.setHours(0, 0, 0, 0);
      labels = Array.from({ length: 4 }, (_, i) => {
        const end = new Date(now);
        end.setDate(end.getDate() - (3 - i) * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { label: `S${i + 1}`, start, end };
      });
    } else {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
      labels = Array.from({ length: 12 }, (_, i) => {
        const m = new Date(now);
        m.setMonth(m.getMonth() - (11 - i));
        return { label: MOIS[m.getMonth()], month: m.getMonth(), year: m.getFullYear() };
      });
    }

    const { data: posts } = await supabase
      .from("posts")
      .select("id, created_at")
      .eq("author_id", userId)
      .gte("created_at", startDate.toISOString());

    // Compter les réactions reçues
    if (posts && posts.length > 0) {
      const ids = posts.map(p => p.id);
      const { count } = await supabase
        .from("post_reactions")
        .select("id", { count: "exact", head: true })
        .in("post_id", ids);
      setTotalReactions(count || 0);
    } else {
      setTotalReactions(0);
    }

    // Grouper par période
    const result = labels.map(l => {
      let count = 0;
      (posts || []).forEach(p => {
        const d = new Date(p.created_at);
        if (period === "semaine") {
          const ld = l.date;
          if (d.getFullYear() === ld.getFullYear() && d.getMonth() === ld.getMonth() && d.getDate() === ld.getDate()) count++;
        } else if (period === "mois") {
          if (d >= l.start && d <= l.end) count++;
        } else {
          if (d.getMonth() === l.month && d.getFullYear() === l.year) count++;
        }
      });
      return { label: l.label, value: count };
    });

    setChartData(result);
    setLoading(false);
  };

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return <>
    {/* Sélecteur période + titre */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 6px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Activité — posts
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[{ id: "semaine", label: "7 jours" }, { id: "mois", label: "Mois" }, { id: "annee", label: "Année" }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 10,
            border: "none", cursor: "pointer", fontFamily: dm,
            background: period === p.id ? C.pro : C.pill,
            color: period === p.id ? "#fff" : C.ink2,
          }}>{p.label}</button>
        ))}
      </div>
    </div>

    {/* Graphique */}
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "14px 12px 10px", marginBottom: 10 }}>
      {loading ? (
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink2, fontSize: 11 }}>⏳</div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64, position: "relative" }}>
            {chartData.map((d, i) => {
              const hPct = maxValue > 0 ? Math.max((d.value / maxValue) * 100, d.value > 0 ? 6 : 2) : 2;
              const isLast = i === chartData.length - 1;
              const isActive = activeBar === i;
              return (
                <div key={i} onClick={() => setActiveBar(isActive ? null : i)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                  {isActive && (
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)",
                      background: C.pro, color: "#fff", fontSize: 10, fontWeight: 700,
                      padding: "3px 7px", borderRadius: 7, whiteSpace: "nowrap", zIndex: 10,
                    }}>
                      {d.value} post{d.value > 1 ? "s" : ""}
                    </div>
                  )}
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    height: `${hPct}%`,
                    background: isActive ? C.accent : (isLast ? C.pro : C.proBg),
                    transition: "background 0.15s, height 0.3s",
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, fontSize: 8, textAlign: "center", color: i === chartData.length - 1 ? C.pro : C.ink2, fontWeight: i === chartData.length - 1 ? 700 : 400 }}>{d.label}</div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.ink2, textAlign: "right", marginTop: 4 }}>
            Appuie sur une barre pour voir le détail
          </div>
        </>
      )}
    </div>

    {/* Cartes stats */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
      {[
        { v: postCount != null ? String(postCount) : "—", l: "Posts publiés", icon: "📸" },
        { v: String(totalReactions), l: "Réactions reçues", icon: "❤️" },
      ].map((r, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
          <div style={{ fontSize: 16, marginBottom: 2 }}>{r.icon}</div>
          <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: C.ink }}>{r.v}</div>
          <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{r.l}</div>
        </div>
      ))}
    </div>

    {/* Posts voisins à enrichir */}
    <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 0 6px", display: "flex", alignItems: "center", gap: 4 }}>
      Posts voisins à enrichir
      <span style={{ background: C.accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8 }}>2 nouveaux</span>
    </div>
    <div style={{ background: "#FFF8F6", border: "1px solid rgba(255,87,51,0.12)", borderRadius: 14, padding: "10px 12px", marginBottom: 10, fontSize: 11, color: C.ink2, lineHeight: 1.5 }}>
      💡 Quand un voisin publie un post qui mentionne {merchantName || "votre enseigne"}, vous pouvez y ajouter un <b>Pro Layer</b> avec les infos produit.
    </div>
    {[
      { emoji: "👗", name: "Camille R. · il y a 2h", desc: "\"Cette robe lin est incroyable pour l'été...\"" },
      { emoji: "👒", name: "Sophie M. · il y a 5h", desc: "\"Le chapeau paille que j'ai trouvé ici...\"" },
    ].map((e, i) => (
      <div key={i} onClick={() => onEnrich(e)} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", gap: 10, padding: 10, marginBottom: 8, cursor: "pointer", alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{e.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{e.name}</div>
          <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.3 }}>{e.desc}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, background: C.accent, color: "#fff", padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}>Enrichir</span>
      </div>
    ))}
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
          {p.photo_url
            ? <img src={p.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
function TabCreer({ merchantName }) {
  const [mode, setMode] = useState("remise");
  const [typeRemise, setTypeRemise] = useState("pct");
  const [ciblage, setCiblage] = useState("interesse");
  const [published, setPublished] = useState(false);
  const name = merchantName || "Mon enseigne";

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
      <Input placeholder="Ex : Collection lin -15%" />
      <Label>Type de remise</Label>
      <div style={{ display: "flex", background: C.pill, borderRadius: 12, padding: 3, marginBottom: 10 }}>
        {[{ id: "pct", l: "Pourcentage (%)" }, { id: "eur", l: "Montant (€)" }].map(t => (
          <button key={t.id} onClick={() => setTypeRemise(t.id)} style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: dm, padding: 6, borderRadius: 10, border: "none", cursor: "pointer", background: typeRemise === t.id ? C.card : "transparent", color: typeRemise === t.id ? C.ink : C.ink2 }}>{t.l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div><Label>Valeur</Label><Input placeholder="15" /></div>
        <div><Label>Expire le</Label><Input placeholder="jj/mm/aaaa" /></div>
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
      <Input placeholder="ex : Min. 30€, 1 utilisation par personne" />
      <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 4 }}>Aperçu de la card voisin</div>
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 10, display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#1565C0", background: "#E8F4FD", display: "inline-block", padding: "2px 6px", borderRadius: 6, marginBottom: 3 }}>Ciblée pour toi</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 10, color: C.ink2 }}>Votre offre apparaîtra ici</div>
        </div>
        <div style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, color: C.accent }}>-15%</div>
      </div>
      <button onClick={() => setPublished(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: C.accent, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Publier la remise</button>
    </> : <>
      <Label>Titre du défi</Label>
      <Input placeholder={`Ex : Montre ta tenue ${name} !`} />
      <Label>Description</Label>
      <Input placeholder="Décris le défi pour les voisins" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div><Label>Icône</Label><Input placeholder="🏪" /></div>
        <div><Label>Objectif</Label><Input placeholder="50" /></div>
      </div>
      <Label>Date de fin</Label>
      <Input placeholder="jj/mm/aaaa" />
      <div style={{ background: "#FFF8F6", borderRadius: 12, padding: 10, marginBottom: 10, border: "1px solid rgba(232,73,10,0.15)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.accent, marginBottom: 3 }}>★ Défi sponsorisé</div>
        <div style={{ fontSize: 11, color: C.ink2, lineHeight: 1.4 }}>Ton défi apparaîtra dans la page Défis avec le badge "Sponsorisé par {name}"</div>
      </div>
      <button onClick={() => setPublished(true)} style={{ width: "100%", padding: 12, borderRadius: 14, background: C.pro, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Lancer le défi</button>
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

// ─── COMPOSANT PRINCIPAL ───
export default function ChipeurProfilMagasin({ setPage, user, profile, updateProfile }) {
  const [screen, setScreen] = useState("main");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [postCount, setPostCount] = useState(null);
  const [voisinPost, setVoisinPost] = useState(null);
  const [localProfile, setLocalProfile] = useState(profile);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "posts", label: "Mes posts" },
    { id: "creer", label: "Créer" },
    { id: "plan", label: "Mon plan" },
  ];

  // Charger le vrai nombre de posts
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .then(({ count }) => setPostCount(count ?? 0));
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
        <MagHeader profile={localProfile} postCount={postCount} onEdit={() => setScreen("edit")} />
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
          {activeTab === "creer" && <TabCreer merchantName={localProfile?.pseudo} />}
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
    </div>
  );
}
