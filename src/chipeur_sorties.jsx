import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import Avatar from "./Avatar";

const SUPABASE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const FN_HEADERS = {
  "Content-Type": "application/json",
  "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

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
  "Loto":         { bg: "#FEF9C3", color: "#854D0E" },
  "Repas":        { bg: "#FFF1F2", color: "#9F1239" },
  "Gratuit":      { bg: "#ECFDF5", color: "#065F46" },
  "Autre":        { bg: C.pill,    color: C.ink2 },
};
const DATE_COLORS = ["#FF5733", "#0F766E", "#7C3AED", "#185FA5", "#B45309", "#0A3D2E"];
const TYPES = ["Vide-grenier", "Marché", "Fête", "Concert", "Sport", "Loto", "Repas", "Gratuit", "Autre"];

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

// Vrai si l'événement a eu lieu il y a 0 à 7 jours (inclus aujourd'hui)
function isWithinSevenDays(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const evDay = new Date(d); evDay.setHours(0,0,0,0);
  const diff = Math.floor((today - evDay) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 7;
}

function isUpcoming(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const evDay = new Date(d); evDay.setHours(0,0,0,0);
  return evDay >= today;
}

function isPast(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const evDay = new Date(d); evDay.setHours(0,0,0,0);
  return evDay < today;
}

function isThisWeek(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const evDay = new Date(d); evDay.setHours(0,0,0,0);
  const diff = (evDay - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
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
  const filters = ["Tous", "Aujourd'hui", "Cette semaine", "Marché", "Fête", "Concert", "Sport", "Vide-grenier", "Loto", "Repas", "Gratuit"];
  return (
    <div style={{ display: "flex", gap: 6, padding: "0 12px 8px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
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
      const { error } = await supabase
        .from("sorties_participations")
        .delete()
        .eq("sortie_id", sortieId)
        .eq("user_id", userId);
      if (error) {
        console.error("Erreur suppression participation:", error);
        setGoing(wasGoing);
        setCount(prev => prev + 1);
      }
    } else {
      const { error } = await supabase
        .from("sorties_participations")
        .insert({ sortie_id: sortieId, user_id: userId });
      if (error) {
        console.error("Erreur ajout participation:", error);
        setGoing(wasGoing);
        setCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  return { going, count, loading, toggle };
}

// ─── MODALE PARTICIPANTS ───────────────────────────────────────
function ParticipantsModal({ sortieId, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sorties_participations")
      .select("profiles:user_id(pseudo, avatar_url)")
      .eq("sortie_id", sortieId)
      .then(({ data }) => {
        setList((data || []).map(r => r.profiles).filter(Boolean));
        setLoading(false);
      });
  }, [sortieId]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)", zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 480, padding: "20px 20px 40px",
          maxHeight: "60vh", display: "flex", flexDirection: "column",
        }}
      >
        {/* Poignée */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.pill, margin: "0 auto 16px" }} />
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 14 }}>
          👥 {loading ? "…" : list.length} {list.length === 1 ? "voisin y va" : "voisins y vont"}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 12 }}>Personne encore — sois le premier !</div>
          ) : list.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < list.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <Avatar pseudo={p.pseudo} avatarUrl={p.avatar_url} size={36} />
              <div style={{ fontFamily: syne, fontWeight: 600, fontSize: 13, color: C.ink }}>{p.pseudo || "Voisin"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GOING BUTTON ───
function GoingBtn({ going, count, onToggle, onShowParticipants, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {count > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onShowParticipants?.(); }}
          style={{
            fontSize: 10, color: C.ink2, fontFamily: dm,
            background: "none", border: "none", cursor: "pointer",
            padding: "4px 6px", borderRadius: 8,
            textDecoration: "underline", textUnderlineOffset: 2,
          }}
        >
          👥 {count}
        </button>
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
function EventCard({ s, idx, onClick, user, onDelete }) {
  const { going, count, loading, toggle } = useParticipation(s.id, user?.id);
  const [showParticipants, setShowParticipants] = useState(false);
  const col = DATE_COLORS[idx % DATE_COLORS.length];
  const d = parseDate(s.date_text);
  const day = d ? d.getDate() : "—";
  const month = d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const ts = TYPE_STYLES[s.type] || TYPE_STYLES["Autre"];
  const today = s.date_text ? isToday(s.date_text) : false;
  const isAuthor = user?.id && s.author_id && user.id === s.author_id;
  const authorPseudo = s.profiles?.pseudo;
  const authorAvatar = s.profiles?.avatar_url;

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
        {/* Auteur */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: C.pill,
            overflow: "hidden", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 10, flexShrink: 0,
          }}>
            {authorAvatar
              ? <img src={authorAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
          <div style={{ fontSize: 10, color: C.ink2 }}>{authorPseudo || "Voisin"}</div>
          {isAuthor && (
            <button
              onClick={e => { e.stopPropagation(); onDelete && onDelete(s.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: C.ink2, padding: "2px 4px",
                marginLeft: 4,
              }}
              title="Supprimer"
            >🗑️</button>
          )}
        </div>
        <GoingBtn
          going={going} count={count}
          onToggle={toggle}
          onShowParticipants={() => setShowParticipants(true)}
          disabled={loading || !user}
        />
      </div>
      {showParticipants && (
        <ParticipantsModal sortieId={s.id} onClose={() => setShowParticipants(false)} />
      )}
    </div>
  );
}

// ─── PAST EVENT CARD ───
function PastEventCard({ s, idx, onClick }) {
  const col = DATE_COLORS[idx % DATE_COLORS.length];
  const d = parseDate(s.date_text);
  const day = d ? d.getDate() : "—";
  const month = d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const ts = TYPE_STYLES[s.type] || TYPE_STYLES["Autre"];

  return (
    <div
      onClick={() => onClick(s)}
      style={{
        background: C.card, borderRadius: 18,
        border: `1px solid ${C.border}`,
        marginBottom: 10, overflow: "hidden", cursor: "pointer",
        opacity: 0.85,
      }}
    >
      {/* Flyer ou bandeau coloré */}
      {s.flyer_url ? (
        <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
          <img src={s.flyer_url} alt="flyer" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(26,23,20,0.7))" }} />
          <div style={{ position: "absolute", bottom: 8, left: 12 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>{s.title}</div>
            {s.lieu && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>📍 {s.lieu}</div>}
          </div>
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "3px 8px" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>📸 Voir les photos</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex" }}>
          <div style={{ width: 52, flexShrink: 0, background: col, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 6px" }}>
            <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{month}</div>
          </div>
          <div style={{ flex: 1, padding: "10px 12px" }}>
            <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 8, marginBottom: 4, background: ts.bg, color: ts.color }}>{s.type || "Événement"}</span>
            <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 3 }}>{s.title}</div>
            {s.lieu && <div style={{ fontSize: 11, color: C.ink2 }}>📍 {s.lieu}</div>}
          </div>
        </div>
      )}
      <div style={{ padding: "8px 12px 10px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: C.ink2 }}>
          {s.date_text || ""}
          {s.time_text ? ` · ${s.time_text}` : ""}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: "#FFF0EE", borderRadius: 8, padding: "3px 10px" }}>
          📸 Voir les photos
        </div>
      </div>
    </div>
  );
}

// ─── LIGHTBOX GALERIE ───
function GalleryLightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const touchX = useRef(null);
  const photo = photos[index];

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(photos.length - 1, i + 1));

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.97)",
        display: "flex", flexDirection: "column",
      }}
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
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", flexShrink: 0,
      }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>
          {index + 1} / {photos.length}
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.15)", border: "none",
          borderRadius: "50%", width: 36, height: 36, color: "#fff",
          fontSize: 18, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Photo */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {/* Flèche gauche */}
        {index > 0 && (
          <button onClick={prev} style={{
            position: "absolute", left: 12, zIndex: 10,
            background: "rgba(255,255,255,0.18)", border: "none",
            borderRadius: "50%", width: 42, height: 42, color: "#fff",
            fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>‹</button>
        )}
        <img
          key={photo.id}
          src={photo.image_url}
          alt=""
          style={{
            maxWidth: "100%", maxHeight: "100%",
            objectFit: "contain", display: "block",
          }}
        />
        {/* Flèche droite */}
        {index < photos.length - 1 && (
          <button onClick={next} style={{
            position: "absolute", right: 12, zIndex: 10,
            background: "rgba(255,255,255,0.18)", border: "none",
            borderRadius: "50%", width: 42, height: 42, color: "#fff",
            fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>›</button>
        )}
      </div>

      {/* Infos auteur + légende */}
      <div style={{ padding: "14px 16px 32px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: photo.content ? 8 : 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>
            {photo.profiles?.avatar_url
              ? <img src={photo.profiles.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
          <div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>
              {photo.profiles?.pseudo || "Voisin"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{timeAgo(photo.created_at)}</div>
          </div>
        </div>
        {photo.content && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{photo.content}</div>
        )}
        {/* Indicateurs dots */}
        {photos.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={() => setIndex(i)} style={{
                width: i === index ? 18 : 6, height: 6,
                borderRadius: 3, cursor: "pointer",
                background: i === index ? C.accent : "rgba(255,255,255,0.3)",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHOTO CARD (in gallery) ───
function PhotoCard({ post, onOpen }) {
  const pseudo = post.profiles?.pseudo || "Voisin";
  const avatar = post.profiles?.avatar_url;

  return (
    <div style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      marginBottom: 10, overflow: "hidden",
    }}>
      {post.image_url && (
        <div onClick={onOpen} style={{ cursor: "zoom-in", position: "relative" }}>
          <img
            src={post.image_url} alt=""
            style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(0,0,0,0.45)", color: "#fff",
            fontSize: 10, padding: "3px 8px", borderRadius: 10,
          }}>🔍 Agrandir</div>
        </div>
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
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFiles = e => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!files.length) { setError("Choisis au moins une photo !"); return; }
    if (!user?.id) { setError("Tu dois être connecté."); return; }
    setLoading(true);
    setError(null);
    setProgress(0);
    const posts = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `evenements/${event.id}/${user.id}_${Date.now()}_${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("images").upload(path, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
        const { data: post, error: postErr } = await supabase
          .from("posts")
          .insert({
            author_id: user.id,
            content: caption.trim() || "",
            image_url: publicUrl,
            evenement_id: event.id,
            post_type: "evenement",
          })
          .select("id, content, image_url, created_at, author_id, profiles:author_id(pseudo, avatar_url)")
          .single();
        if (postErr) throw postErr;
        posts.push(post);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      posts.forEach(p => onSuccess(p));
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
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>📸 Partager des photos</div>
          <button onClick={onClose} style={{ background: C.pill, border: "none", borderRadius: 10, padding: "6px 10px", fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 14 }}>
          Tu es à <b style={{ color: C.ink }}>{event.title}</b> ? Partage ton moment !
        </div>

        {/* Zone photos */}
        {previews.length === 0 ? (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${C.border}`, borderRadius: 16, minHeight: 160,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", marginBottom: 12, background: C.bg,
            }}
          >
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Appuie pour choisir</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>Tu peux sélectionner plusieurs photos</div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => removeFile(i)}
                    style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >✕</button>
                </div>
              ))}
              <div
                onClick={() => fileRef.current?.click()}
                style={{ aspectRatio: "1", borderRadius: 10, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: C.bg }}
              >
                <span style={{ fontSize: 24, color: C.ink2 }}>+</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.ink2 }}>{files.length} photo{files.length > 1 ? "s" : ""} sélectionnée{files.length > 1 ? "s" : ""}</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />

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

        {loading && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ height: 4, background: C.pill, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.accent, transition: "width 0.3s" }} />
            </div>
            <div style={{ fontSize: 11, color: C.ink2, marginTop: 4, textAlign: "center" }}>Publication {progress}%…</div>
          </div>
        )}

        {error && <div style={{ fontSize: 11, color: "#E53935", marginBottom: 10 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !files.length}
          style={{
            width: "100%",
            background: !files.length ? C.pill : loading ? "#ccc" : C.accent,
            color: !files.length || loading ? C.ink2 : "#fff",
            border: "none", borderRadius: 14, padding: 14,
            fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: !files.length ? "default" : "pointer",
          }}
        >
          {loading ? `Publication…` : `Publier ${files.length > 1 ? `${files.length} photos` : "dans la galerie"}`}
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
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { going, count, loading: loadingGoing, toggle } = useParticipation(event.id, user?.id);

  const d = parseDate(event.date_text);
  const day = d ? d.getDate() : "—";
  const month = d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const ts = TYPE_STYLES[event.type] || TYPE_STYLES["Autre"];
  const todayIsEvent = event.date_text ? isToday(event.date_text) : false;
  const withinSevenDays = event.date_text ? isWithinSevenDays(event.date_text) : false;
  const canAddPhoto = !!user && withinSevenDays;

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
      {/* ── Bannière flyer (si présent) ── */}
      {event.flyer_url && (
        <div style={{ position: "relative", height: 200, flexShrink: 0, overflow: "hidden" }}>
          <img src={event.flyer_url} alt="Flyer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 50%, rgba(26,23,20,0.7) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.2 }}>{event.title}</div>
            {event.lieu && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>📍 {event.lieu}</div>}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {/* Title row — masqué si flyer affiché au-dessus */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 8px", display: event.flyer_url ? "none" : "flex" }}>
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
            {canAddPhoto && (
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
        {/* Bannière "souvenir" pour les 7 jours après l'événement */}
        {!todayIsEvent && withinSevenDays && (
          <div style={{
            background: "#F7A72D", padding: "8px 16px", fontSize: 11,
            fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>📸 Tu peux encore partager tes souvenirs !</span>
            {canAddPhoto && (
              <button
                onClick={() => setShowUpload(true)}
                style={{
                  marginLeft: "auto", background: "#fff", color: "#FF5733",
                  border: "none", borderRadius: 10, padding: "4px 12px",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: dm,
                }}
              >
                Partager
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
                {canAddPhoto ? "Sois le premier à partager !" : "Aucune photo pour l'instant"}
              </div>
              <div style={{ fontSize: 12, color: C.ink2, marginBottom: 18, lineHeight: 1.5 }}>
                {canAddPhoto
                  ? "Partage tes photos avec les voisins !"
                  : withinSevenDays
                    ? "Connecte-toi pour ajouter tes photos !"
                    : "Les voisins pourront partager leurs photos le jour de l'événement."}
              </div>
              {canAddPhoto && (
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
              {canAddPhoto && (
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
              {photos.map((p, i) => (
                <PhotoCard key={p.id} post={p} onOpen={() => setLightboxIndex(i)} />
              ))}
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
      {/* ── Lightbox galerie ── */}
      {lightboxIndex !== null && photos.length > 0 && (
        <GalleryLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

// ─── FORMULAIRE NOUVEL ÉVÉNEMENT ───
function NouvelEvenementScreen({ user, onBack, onSuccess }) {
  const [title, setTitle]               = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag]       = useState("");
  const [date, setDate]                 = useState("");
  const [heure, setHeure]               = useState("");
  const [lieu, setLieu]                 = useState("");
  const [desc, setDesc]                 = useState("");
  const [flyerFile, setFlyerFile]       = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [flyerUrl, setFlyerUrl]         = useState(null);
  const [scanning, setScanning]         = useState(false);
  const [scanDone, setScanDone]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const flyerRef = useRef();

  const inp = {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "10px 12px", fontSize: 13, fontFamily: dm,
    background: C.bg, color: C.ink, boxSizing: "border-box", outline: "none",
  };

  const toDateInput = (txt) => {
    if (!txt) return "";
    const p = txt.split("/");
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : txt;
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags(prev => [...prev, t]);
    setCustomTag("");
  };

  const handleFlyerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerFile(file);
    setFlyerPreview(URL.createObjectURL(file));
    setScanning(true);
    setScanDone(false);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `evenements/flyers/${user?.id || "anon"}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
      const url = urlData.publicUrl;
      setFlyerUrl(url);
      const res = await fetch(`${SUPABASE_FN_URL}/event-scan`, {
        method: "POST", headers: FN_HEADERS, body: JSON.stringify({ image_url: url }),
      });
      const data = await res.json();
      if (data.title)       setTitle(data.title);
      if (data.date_text)   setDate(toDateInput(data.date_text));
      if (data.time_text)   setHeure(data.time_text);
      if (data.lieu)        setLieu(data.lieu);
      if (data.description) setDesc(data.description);
      const aiTags = [];
      if (data.type && TYPES.includes(data.type)) aiTags.push(data.type);
      if (Array.isArray(data.tags)) data.tags.forEach(t => { if (!aiTags.includes(t)) aiTags.push(t); });
      if (aiTags.length > 0) setSelectedTags(aiTags);
      setScanDone(true);
    } catch (_) {
      setError("Analyse du flyer impossible — remplis le formulaire manuellement.");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!date)         { setError("La date est obligatoire."); return; }
    setLoading(true);
    setError(null);
    const [y, m, jj] = date.split("-");
    const dateText = `${jj}/${m}/${y}`;
    const { data, error: err } = await supabase
      .from("sorties")
      .insert({
        title:       title.trim(),
        type:        selectedTags[0] || "Autre",
        tags:        selectedTags,
        date_text:   dateText,
        time_text:   heure.trim() || null,
        lieu:        lieu.trim() || null,
        description: desc.trim() || null,
        ville:       "Saint-Dié",
        author_id:   user?.id || null,
        flyer_url:   flyerUrl || null,
      })
      .select()
      .single();
    if (err) { setError(err.message); setLoading(false); return; }
    onSuccess(data);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column", zIndex: 50 }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>←</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, color: C.ink }}>Nouvel événement</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

        {/* ── FLYER EN PREMIER ── */}
        <div style={{ background: C.card, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 8 }}>🖼️ AFFICHE / FLYER</label>
          {!flyerPreview && (
            <div style={{ background: "#EBF5F0", border: "1px solid #A7D7C5", borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
              <div style={{ fontSize: 12, color: C.pro, lineHeight: 1.5 }}>
                <b>L'IA remplit le formulaire automatiquement !</b><br />
                Ajoute d'abord l'affiche — les champs se rempliront tout seuls.
              </div>
            </div>
          )}
          {flyerPreview ? (
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 4 }}>
              <img src={flyerPreview} alt="flyer" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
              {scanning && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,61,46,0.80)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ fontSize: 34 }}>✨</div>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff" }}>Analyse en cours…</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>L'IA lit ton affiche</div>
                </div>
              )}
              {scanDone && !scanning && (
                <div style={{ position: "absolute", top: 10, left: 10, background: "#22C55E", borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>✓ Formulaire rempli !</span>
                </div>
              )}
              <button onClick={() => { setFlyerFile(null); setFlyerPreview(null); setFlyerUrl(null); setScanDone(false); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ) : (
            <div onClick={() => flyerRef.current?.click()} style={{ border: `2px dashed ${C.border}`, borderRadius: 14, padding: "24px 0", textAlign: "center", cursor: "pointer", background: C.bg }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 3 }}>Ajouter l'affiche</div>
              <div style={{ fontSize: 11, color: C.ink2 }}>JPG, PNG — l'IA lit les infos automatiquement</div>
            </div>
          )}
          <input ref={flyerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFlyerChange} />
        </div>

        {/* ── FORMULAIRE ── */}
        <div style={{ background: C.card, borderRadius: 18, padding: 16, border: `1px solid ${C.border}` }}>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>NOM DE L'ÉVÉNEMENT *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Marché de Noël, Concert de jazz…" style={inp} />
          </div>

          {/* Étiquettes multi-sélection */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 6 }}>ÉTIQUETTES <span style={{ fontWeight: 400 }}>(plusieurs possibles)</span></label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: dm, background: selectedTags.includes(t) ? C.ink : C.pill, color: selectedTags.includes(t) ? "#fff" : C.ink2 }}>
                  {selectedTags.includes(t) ? "✓ " : ""}{t}
                </button>
              ))}
            </div>
            {/* Tags custom */}
            {selectedTags.filter(t => !TYPES.includes(t)).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {selectedTags.filter(t => !TYPES.includes(t)).map(t => (
                  <span key={t} style={{ padding: "5px 10px", borderRadius: 20, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    {t}
                    <button onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <input value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomTag()} placeholder="Créer une étiquette…" style={{ ...inp, marginBottom: 0, flex: 1 }} />
              <button onClick={addCustomTag} disabled={!customTag.trim()} style={{ background: customTag.trim() ? C.accent : C.pill, color: customTag.trim() ? "#fff" : C.ink2, border: "none", borderRadius: 12, padding: "0 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>+ Ajouter</button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>DATE *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>HORAIRES</label>
            <input value={heure} onChange={e => setHeure(e.target.value)} placeholder="Ex: 9h – 18h, à partir de 20h…" style={inp} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>LIEU</label>
            <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Ex: Place du Marché, Salle des fêtes…" style={inp} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Décris l'événement…" rows={3} style={{ ...inp, resize: "none" }} />
          </div>

          {error && <div style={{ fontSize: 11, color: "#E53935", marginBottom: 10 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading || scanning} style={{ width: "100%", background: (loading || scanning) ? C.pill : C.accent, color: (loading || scanning) ? C.ink2 : "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: dm, cursor: (loading || scanning) ? "not-allowed" : "pointer" }}>
            {scanning ? "⏳ Analyse du flyer…" : loading ? "Publication…" : "Publier l'événement"}
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
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
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
export default function ChipeurSorties({ setPage, user, profile, requireAuth, selectedSortieId, setSelectedSortieId, autoCreateSortie, setAutoCreateSortie }) {
  const [filter, setFilter]         = useState("Tous");
  const [mainTab, setMainTab]       = useState("avenir"); // "avenir" | "passes"
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fabOpen, setFabOpen]       = useState(false);
  const [screen, setScreen]         = useState("list"); // "list" | "detail" | "nouveau"
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Ouvrir directement le formulaire création si on vient du nouveau post
  useEffect(() => {
    if (autoCreateSortie) {
      setScreen("nouveau");
      if (setAutoCreateSortie) setAutoCreateSortie(false);
    }
  }, [autoCreateSortie]);

  const handleDeleteSortie = async (id) => {
    await supabase.from("sorties").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const loadEvents = () => {
    supabase
      .from("sorties")
      .select("*, profiles:author_id(pseudo, avatar_url)")
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

  // Ouvrir directement la sortie demandée depuis le fil
  useEffect(() => {
    if (!selectedSortieId || events.length === 0) return;
    const ev = events.find(e => e.id === selectedSortieId);
    if (ev) {
      setSelectedEvent(ev);
      setScreen("detail");
      setSelectedSortieId?.(null); // reset pour la prochaine visite
    }
  }, [selectedSortieId, events]);

  // Sépare les événements en à venir / passés
  const upcomingEvents = events.filter(s => isUpcoming(s.date_text));
  const pastEvents     = events.filter(s => isPast(s.date_text)).reverse(); // plus récents en premier

  const filtered = (() => {
    const base = mainTab === "passes" ? pastEvents : upcomingEvents;
    if (filter === "Tous") return base;
    if (filter === "Aujourd'hui") return base.filter(s => s.date_text && isToday(s.date_text));
    if (filter === "Cette semaine") return base.filter(s => s.date_text && isThisWeek(s.date_text));
    return base.filter(s => s.type === filter);
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
      {/* ── Header ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px" }}>
          <button onClick={() => setPage("fil")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>←</button>
          <h1 style={{ fontFamily: syne, fontSize: 20, fontWeight: 700, margin: 0, flex: 1 }}>Événements</h1>
          <button
            onClick={() => requireAuth ? requireAuth(() => setScreen("nouveau")) : setScreen("nouveau")}
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: dm }}
          >+ Ajouter</button>
        </div>
        {/* Onglets À venir / Passés */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}` }}>
          {[
            { k: "avenir", label: `📅 À venir`, count: upcomingEvents.length },
            { k: "passes", label: `📸 Passés`,  count: pastEvents.length },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => { setMainTab(t.k); setFilter("Tous"); }}
              style={{
                flex: 1, padding: "10px 0", border: "none",
                borderBottom: mainTab === t.k ? `2px solid ${C.accent}` : "2px solid transparent",
                background: "none", fontFamily: dm, fontSize: 12, fontWeight: 600,
                color: mainTab === t.k ? C.accent : C.ink2, cursor: "pointer",
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, background: mainTab === t.k ? C.accent : C.pill, color: mainTab === t.k ? "#fff" : C.ink2, borderRadius: 10, padding: "1px 6px" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres (seulement sur À venir) */}
      {mainTab === "avenir" && <Filters active={filter} onSelect={setFilter} />}

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px", paddingTop: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{mainTab === "passes" ? "📸" : "📅"}</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>
              {mainTab === "passes" ? "Aucun événement passé" : "Aucun événement à venir"}
            </div>
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16 }}>
              {mainTab === "passes" ? "Les photos des événements passés apparaîtront ici." : "Sois le premier à en partager un !"}
            </div>
            {mainTab === "avenir" && (
              <button
                onClick={() => requireAuth ? requireAuth(() => setScreen("nouveau")) : setScreen("nouveau")}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: dm }}
              >
                + Ajouter un événement
              </button>
            )}
          </div>
        ) : mainTab === "passes" ? (
          filtered.map((s, i) => (
            <PastEventCard
              key={s.id}
              s={s}
              idx={i}
              onClick={ev => { setSelectedEvent(ev); setScreen("detail"); }}
            />
          ))
        ) : (
          filtered.map((s, i) => (
            <EventCard
              key={s.id}
              s={s}
              idx={i}
              user={user}
              onClick={ev => { setSelectedEvent(ev); setScreen("detail"); }}
              onDelete={handleDeleteSortie}
            />
          ))
        )}
      </div>

      <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} onNewEvent={() => requireAuth ? requireAuth(() => setScreen("nouveau")) : setScreen("nouveau")} />
      <BottomNav active="sorties" onNavigate={setPage} onFab={() => setFabOpen(true)} />
    </div>
  );
}
