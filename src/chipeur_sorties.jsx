import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

const TYPE_STYLES = {
  "Vide-grenier": { bg: "#FFF3E0", color: "#C2410C" },
  "Marché":       { bg: "#EBF5F0", color: "#065F46" },
  "Fête":         { bg: "#F3E8FF", color: "#6B21A8" },
  "Concert":      { bg: "#EFF6FF", color: "#1E40AF" },
  "Sport":        { bg: "#F0FDF4", color: "#166534" },
  "Autre":        { bg: C.pill,    color: C.ink2 },
};
const DATE_COLORS = ["#FF5733", "#0F766E", "#7C3AED", "#185FA5", "#B45309", "#0A3D2E"];
const TYPES = ["Vide-grenier", "Marché", "Fête", "Concert", "Sport", "Autre"];

function parseDate(dateText) {
  if (!dateText) return null;
  const parts = dateText.split("/");
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function isToday(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function timeAgo(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

// ─── FILTERS ───
function Filters({ active, onSelect }) {
  const filters = ["Tous", "Aujourd'hui", "Vide-grenier", "Marché", "Fête", "Concert", "Sport"];
  return (
    <div style={{ display: "flex", gap: 6, padding: "0 12px 8px", overflowX: "auto", flexShrink: 0 }}>
      {filters.map(f => (
        <button key={f} onClick={() => onSelect(f)} style={{
          fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 20,
          border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          background: active === f ? C.ink : C.pill,
          color: active === f ? "#fff" : C.ink2,
          fontFamily: dm,
        }}>{f}</button>
      ))}
    </div>
  );
}

// ─── HOOK PARTICIPATION ───
// Charge et sauvegarde la participation d'un user à une sortie dans Supabase
function useParticipation(sortieId, userId) {
  const [going, setGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sortieId) return;
    // Charger le nombre total de participants
    supabase
      .from("sorties_participations")
      .select("user_id", { count: "exact" })
      .eq("sortie_id", sortieId)
      .then(({ count: c }) => setCount(c || 0));

    // Charger si l'utilisateur connecté participe déjà
    if (!userId) { setLoading(false); return; }
    supabase
      .from("sorties_participations")
      .select("id")
      .eq("sortie_id", sortieId)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setGoing(!!data);
        setLoading(false);
      });
  }, [sortieId, userId]);

  const toggle = async () => {
    if (!userId) return;
    const wasGoing = going;
    // Mise à jour optimiste
    setGoing(!wasGoing);
    setCount(prev => wasGoing ? Math.max(0, prev - 1) : prev + 1);

    if (wasGoing) {
      await supabase
        .from("sorties_participations")
        .delete()
        .eq("sortie_id", sortieId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("sorties_participations")
        .insert({ sortie_id: sortieId, user_id: userId });
    }
  };

  return { going, count, loading, toggle };
}

// ─── GOING BUTTON ───
function GoingBtn({ going, count, onToggle, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {count > 0 && (
        <span style={{ fontSize: 10, color: C.ink2, fontFamily: dm }}>
          👥 {count}
        </span>
      )}
      <button
        onClick={e => { e.stopPropagation(); !disabled && onToggle && onToggle(); }}
        style={{
          padding: "7px 14px", borderRadius: 12, fontSize: 11, fontWeight: 600,
          fontFamily: dm, border: "none", cursor: disabled ? "default" : "pointer",
          whiteSpace: "nowrap",
          background: going ? C.proBg : C.accent,
          color: going ? C.pro : "#fff",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {going ? "✓ J'y vais !" : "J'y vais ?"}
      </button>
    </div>
  );
}

// ─── EVENT CARD (in list) ───
function EventCard({ s, idx, onClick, user }) {
  const { going, count, loading, toggle } = useParticipation(s.id, user?.id);
  const col = DATE_COLORS[idx % DATE_COLORS.length];
  const d = parseDate(s.date_text);
  const day = d ? d.getDate() : "—";
  const month = d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const ts = TYPE_STYLES[s.type] || TYPE_STYLES["Autre"];
  const today = s.date_text ? isToday(s.date_text) : false;

  return (
    <div
      onClick={() => onClick(s)}
      style={{
        background: C.card, borderRadius: 18,
        border: today ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
        marginBottom: 10, overflow: "hidden", cursor: "pointer",
      }}
    >
      {today && (
        <div style={{
          background: C.accent, padding: "5px 12px",
          fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 0.3,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          🔴 AUJOURD'HUI · Partage tes photos !
        </div>
      )}
      <div style={{ display: "flex" }}>
        <div style={{
          width: 52, flexShrink: 0, background: col,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "12px 6px",
        }}>
          <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{month}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px" }}>
          <span style={{
            display: "inline-block", fontSize: 9, fontWeight: 700,
            padding: "2px 8px", borderRadius: 8, marginBottom: 4,
            background: ts.bg, color: ts.color,
          }}>{s.type || "Événement"}</span>
          <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 3 }}>{s.title}</div>
          {s.lieu && (
            <div style={{ fontSize: 11, color: C.ink2 }}>📍 {s.lieu}{s.time_text ? ` · ${s.time_text}` : ""}</div>
          )}
        </div>
      </div>
      <div style={{
        padding: "8px 12px 10px", borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 11, color: C.ink2 }}>📍 {s.ville || "Saint-Dié"}</div>
        <GoingBtn going={going} count={count} onToggle={toggle} disabled={loading || !user} />
      </div>
    </div>
  );
}

// ─── PHOTO CARD (in gallery) ───
function PhotoCard({ post }) {
  const pseudo = post.profiles?.pseudo || "Voisin";
  const avatar = post.profiles?.avatar_url;

  return (
    <div style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      marginBottom: 10, overflow: "hidden",
    }}>
      {post.image_url && (
        <img
          src={post.image_url} alt=""
          style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: post.content ? 6 : 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: C.pill,
            overflow: "hidden", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, flexShrink: 0,
          }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{pseudo}</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {post.content && (
          <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{post.content}</div>
        )}
      </div>
    </div>
  );
}

// ─── PHOTO UPLOAD OVERLAY ───
function PhotoUploadOverlay({ event, user, onClose, onSuccess }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { setError("Choisis une photo !"); return; }
    if (!user?.id) { setError("Tu dois être connecté."); return; }
    setLoading(true);
    setError(null);
    try {
      // 1. Upload image dans le bucket
      const ext = file.name.split(".").pop() || "jpg";
      const path = `evenements/${event.id}/${user.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);

      // 2. Insérer le post lié à l'événement
      const { data: post, error: postErr } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          content: caption.trim() || null,
          image_url: publicUrl,
          evenement_id: event.id,
          post_type: "evenement",
        })
        .select("id, content, image_url, created_at, author_id, profiles:author_id(pseudo, avatar_url)")
        .single();
      if (postErr) throw postErr;
      onSuccess(post);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      background: "rgba(26,23,20,0.6)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: C.card, borderRadius: "24px 24px 0 0", width: "100%",
        padding: "20px 16px 40px", maxHeight: "88vh", overflowY: "auto",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>📸 Partager une photo</div>
          <button onClick={onClose} style={{ background: C.pill, border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 14 }}>
          Tu es à <b style={{ color: C.ink }}>{event.title}</b> ? Partage ton moment !
        </div>

        {/* Zone photo */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${preview ? C.accent : C.border}`,
            borderRadius: 16, minHeight: 160, display: "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginBottom: 12, overflow: "hidden", background: C.bg,
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 12, color: C.ink2 }}>Appuie pour choisir une photo</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

        {/* Légende */}
        <textarea
          placeholder="Ajoute une légende (optionnel)…"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={2}
          style={{
            width: "100%", border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "10px 12px", fontSize: 13, fontFamily: dm,
            resize: "none", background: C.bg, color: C.ink,
            boxSizing: "border-box", marginBottom: 12, outline: "none",
          }}
        />

        {error && <div style={{ fontSize: 11, color: "#E53935", marginBottom: 10 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          style={{
            width: "100%",
            background: !file ? C.pill : loading ? "#ccc" : C.accent,
            color: !file || loading ? C.ink2 : "#fff",
            border: "none", borderRadius: 14, padding: 14,
            fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: !file ? "default" : "pointer",
          }}
        >
          {loading ? "Publication…" : "Publier dans la galerie"}
        </button>
      </div>
    </div>
  );
}

// ─── EVENT DETAIL SCREEN ───
function EventDetailScreen({ event, user, onBack }) {
  const [tab, setTab] = useState("galerie");
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { going, count, loading: loadingGoing, toggle } = useParticipation(event.id, user?.id);

  const d = parseDate(event.date_text);
  const day = d ? d.getDate() : "—";
  const month = d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const ts = TYPE_STYLES[event.type] || TYPE_STYLES["Autre"];
  const todayIsEvent = event.date_text ? isToday(event.date_text) : false;

  useEffect(() => {
    if (!event?.id) { setLoadingPhotos(false); return; }
    supabase
      .from("posts")
      .select("id, content, image_url, created_at, author_id, profiles:author_id(pseudo, avatar_url)")
      .eq("evenement_id", event.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPhotos(data || []);
        setLoadingPhotos(false);
      });
  }, [event?.id]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.bg, fontFamily: dm,
      color: C.ink, display: "flex", flexDirection: "column", zIndex: 50,
    }}>
      {/* ── Header ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 8px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.2 }}>{event.title}</div>
            {event.lieu && <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>📍 {event.lieu}</div>}
          </div>
          {/* Date badge */}
          <div style={{
            width: 44, flexShrink: 0, background: DATE_COLORS[0],
            borderRadius: 12, display: "flex", flexDirection: "column",
            alignItems: "center", padding: "5px 4px",
          }}>
            <div style={{ fontFamily: syne, fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>{month}</div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 16px 10px", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
              background: ts.bg, color: ts.color,
            }}>{event.type || "Événement"}</span>
            {event.time_text && (
              <span style={{ fontSize: 11, color: C.ink2 }}>🕐 {event.time_text}</span>
            )}
          </div>
          <GoingBtn going={going} count={count} onToggle={toggle} disabled={loadingGoing || !user} />
        </div>

        {/* Bannière "C'est aujourd'hui" */}
        {todayIsEvent && (
          <div style={{
            background: C.accent, padding: "8px 16px", fontSize: 11,
            fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🔴 C'est aujourd'hui !</span>
            {user && (
              <button
                onClick={() => setShowUpload(true)}
                style={{
                  marginLeft: "auto", background: "#fff", color: C.accent,
                  border: "none", borderRadius: 10, padding: "4px 12px",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dm,
                }}
              >
                📸 Partager une photo
              </button>
            )}
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
          {[
            { k: "galerie", label: `📸 Galerie${photos.length > 0 ? ` (${photos.length})` : ""}` },
            { k: "info",    label: "ℹ️ Infos" },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                flex: 1, padding: "10px 0", border: "none",
                borderBottom: tab === t.k ? `2px solid ${C.accent}` : "2px solid transparent",
                background: "none", fontFamily: dm, fontSize: 12, fontWeight: 600,
                color: tab === t.k ? C.accent : C.ink2, cursor: "pointer",
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 20px" }}>
        {tab === "galerie" ? (
          loadingPhotos ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement…</div>
          ) : photos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📸</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>
                {todayIsEvent ? "Sois le premier à partager !" : "Aucune photo pour l'instant"}
              </div>
              <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18, lineHeight: 1.5 }}>
                {todayIsEvent
                  ? "Tu y es ? Partage ton moment avec les voisins !"
                  : "Les voisins pourront partager leurs photos le jour de l'événement."}
              </div>
              {user && todayIsEvent && (
                <button
                  onClick={() => setShowUpload(true)}
                  style={{
                    background: C.accent, color: "#fff", border: "none",
                    borderRadius: 14, padding: "10px 22px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm,
                  }}
                >
                  📸 Partager ma photo
                </button>
              )}
            </div>
          ) : (
            <>
              {user && (
                <button
                  onClick={() => setShowUpload(true)}
                  style={{
                    width: "100%", background: C.accent, color: "#fff",
                    border: "none", borderRadius: 14, padding: "10px 16px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: dm,
                    marginBottom: 12, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
                  📸 Ajouter ma photo
                </button>
              )}
              {photos.map(p => <PhotoCard key={p.id} post={p} />)}
            </>
          )
        ) : (
          /* ── Infos ── */
          <div style={{ background: C.card, borderRadius: 18, padding: 16, border: `1px solid ${C.border}` }}>
            {event.description && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 6 }}>Description</div>
                <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7 }}>{event.description}</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {event.date_text && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>📅</span>
                  <div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>DATE</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{event.date_text}</div>
                  </div>
                </div>
              )}
              {event.time_text && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>🕐</span>
                  <div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>HORAIRES</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{event.time_text}</div>
                  </div>
                </div>
              )}
              {event.lieu && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>LIEU</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{event.lieu}</div>
                  </div>
                </div>
              )}
              {event.ville && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>🏙️</span>
                  <div>
                    <div style={{ fontSize: 10, color: C.ink2, fontWeight: 600 }}>VILLE</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{event.ville}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Overlay upload photo ── */}
      {showUpload && (
        <PhotoUploadOverlay
          event={event}
          user={user}
          onClose={() => setShowUpload(false)}
          onSuccess={post => {
            setPhotos(prev => [post, ...prev]);
            setShowUpload(false);
            setTab("galerie");
          }}
        />
      )}
    </div>
  );
}

// ─── FORMULAIRE NOUVEL ÉVÉNEMENT ───
function NouvelEvenementScreen({ user, onBack, onSuccess }) {
  const [title, setTitle]       = useState("");
  const [type, setType]         = useState("Fête");
  const [date, setDate]         = useState("");
  const [heure, setHeure]       = useState("");
  const [lieu, setLieu]         = useState("");
  const [desc, setDesc]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const inp = {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "10px 12px", fontSize: 13, fontFamily: dm,
    background: C.bg, color: C.ink, boxSizing: "border-box", outline: "none",
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!date)         { setError("La date est obligatoire."); return; }
    setLoading(true);
    setError(null);

    // Convertir YYYY-MM-DD → DD/MM/YYYY pour l'affichage
    const [y, m, jj] = date.split("-");
    const dateText = `${jj}/${m}/${y}`;

    const { data, error: err } = await supabase
      .from("sorties")
      .insert({
        title:       title.trim(),
        type,
        date_text:   dateText,
        time_text:   heure.trim() || null,
        lieu:        lieu.trim() || null,
        description: desc.trim() || null,
        ville:       "Saint-Dié",
        author_id:   user?.id || null,
      })
      .select()
      .single();

    if (err) { setError(err.message); setLoading(false); return; }
    onSuccess(data);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.bg, fontFamily: dm,
      color: C.ink, display: "flex", flexDirection: "column", zIndex: 50,
    }}>
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px", display: "flex", alignItems: "center",
        gap: 12, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>←</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink }}>Nouvel événement</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 16, border: `1px solid ${C.border}` }}>

          {/* Titre */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>NOM DE L'ÉVÉNEMENT *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Marché de Noël, Concert de jazz…" style={inp} />
          </div>

          {/* Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 6 }}>TYPE *</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "none",
                    cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: dm,
                    background: type === t ? C.ink : C.pill,
                    color: type === t ? "#fff" : C.ink2,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>DATE *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          </div>

          {/* Heure */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>HORAIRES</label>
            <input value={heure} onChange={e => setHeure(e.target.value)} placeholder="Ex: 9h – 18h, à partir de 20h…" style={inp} />
          </div>

          {/* Lieu */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>LIEU</label>
            <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Ex: Place du Marché, Salle des fêtes…" style={inp} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Décris l'événement…"
              rows={3}
              style={{ ...inp, resize: "none" }}
            />
          </div>

          {error && <div style={{ fontSize: 11, color: "#E53935", marginBottom: 10 }}>{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? C.pill : C.accent,
              color: loading ? C.ink2 : "#fff",
              border: "none", borderRadius: 14, padding: 14,
              fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: "pointer",
            }}
          >
            {loading ? "Publication…" : "Publier l'événement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAB MENU ───
function FabMenu({ open, onClose, onNewEvent }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        background: "rgba(26,23,20,0.4)",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "0 0 90px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "0 60px 12px" }}
      >
        <button
          onClick={() => { onClose(); onNewEvent(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            background: C.card, border: "none", borderRadius: 14,
            padding: "12px 16px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: dm,
          }}
        >
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Nouvel événement</span>
        </button>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───
function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil",      icon: "🏠", label: "Fil" },
    { id: "sorties",  icon: "📅", label: "Évén." },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil",   icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{
      height: 80, background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0,
    }}>
      {items.map(item => item.isFab ? (
        <div
          key="fab"
          onClick={onFab}
          style={{
            width: 50, height: 50, borderRadius: 25, background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer", flexShrink: 0,
          }}
        >+</div>
      ) : (
        <div
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, fontSize: 9, color: active === item.id ? C.accent : C.ink2, cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 18 }}>{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurSorties({ setPage, user, profile }) {
  const [filter, setFilter]         = useState("Tous");
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fabOpen, setFabOpen]       = useState(false);
  const [screen, setScreen]         = useState("list"); // "list" | "detail" | "nouveau"
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = () => {
    supabase
      .from("sorties")
      .select("*")
      .then(({ data }) => {
        // Tri chronologique côté client (date_text est DD/MM/YYYY, le tri SQL alphabétique serait faux)
        const sorted = (data || []).sort((a, b) => {
          const da = parseDate(a.date_text);
          const db = parseDate(b.date_text);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        });
        setEvents(sorted);
        setLoading(false);
      });
  };

  useEffect(() => { loadEvents(); }, []);

  const filtered = (() => {
    if (filter === "Tous") return events;
    if (filter === "Aujourd'hui") return events.filter(s => s.date_text && isToday(s.date_text));
    return events.filter(s => s.type === filter);
  })();

  // ── Écrans internes ──
  if (screen === "detail" && selectedEvent) {
    return (
      <EventDetailScreen
        event={selectedEvent}
        user={user}
        onBack={() => setScreen("list")}
      />
    );
  }
  if (screen === "nouveau") {
    return (
      <NouvelEvenementScreen
        user={user}
        onBack={() => setScreen("list")}
        onSuccess={ev => {
          setEvents(prev => [ev, ...prev]);
          setScreen("list");
        }}
      />
    );
  }

  // ── Liste principale ──
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: dm, color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "8px 16px 4px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setPage("fil")}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}
          >←</button>
          <h1 style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, margin: 0 }}>Événements</h1>
        </div>
        <p style={{ fontSize: 11, color: C.ink2, marginTop: 1, marginLeft: 34 }}>
          Sorties & activités près de chez toi
        </p>
      </div>

      <Filters active={filter} onSelect={setFilter} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>
              Aucun événement
            </div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16 }}>
              Sois le premier à en partager un !
            </div>
            <button
              onClick={() => setScreen("nouveau")}
              style={{
                background: C.accent, color: "#fff", border: "none",
                borderRadius: 14, padding: "10px 20px",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm,
              }}
            >
              + Ajouter un événement
            </button>
          </div>
        ) : (
          filtered.map((s, i) => (
            <EventCard
              key={s.id}
              s={s}
              idx={i}
              user={user}
              onClick={ev => { setSelectedEvent(ev); setScreen("detail"); }}
            />
          ))
        )}
      </div>

      <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} onNewEvent={() => setScreen("nouveau")} />
      <BottomNav active="sorties" onNavigate={setPage} onFab={() => setFabOpen(true)} />
    </div>
  );
}
