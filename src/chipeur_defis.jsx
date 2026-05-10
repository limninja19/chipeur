import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { addXP } from "./chipeur_xp";
import { ChallengeMedia, RewardBadge } from "./ChallengeUI";

// ─── HEIC → JPEG conversion (photos iPhone) ─────────────────────
async function convertImageFile(file) {
  if (!file) return file;
  const name = file.name?.toLowerCase() || "";
  const isHeic = name.endsWith(".heic") || name.endsWith(".heif")
    || file.type === "image/heic" || file.type === "image/heif";
  if (!isHeic) return file;
  try {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const out = Array.isArray(blob) ? blob[0] : blob;
    return new File([out], name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
  } catch (e) {
    console.warn("HEIC conversion failed:", e);
    return file;
  }
}

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

// ─── DONNÉES FALLBACK (si Supabase vide) ────────────────────────
const STATIC_DEFIS = [
  {
    id: "static-0", icon: "🛍️", title: "Coup de Cœur Local",
    sub: "Montre ton commerce préféré de Saint-Dié-des-Vosges",
    participants: 0, objectif: 60, pct: 0,
    grad: "linear-gradient(135deg,#FF5733,#F7A72D)", fill: "#FF5733",
    timeLeft: "21 jours restants",
    tags: ["#Local", "#SaintDié", "#Commerce", "#Quartier", "#Vosges"],
    ended: false, isStatic: true,
  },
];

// ─── HELPERS ────────────────────────────────────────────────────
function computeTimeLeft(ends_at, ended) {
  if (ended) return null;
  if (!ends_at) return null;
  const diff = new Date(ends_at) - new Date();
  if (diff <= 0) return null;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "1 jour restant";
  return `${days} jours restants`;
}

function isUUID(val) {
  return typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

// ─── PALETTES COULEURS DÉFIS ────────────────────────────────────
const GRAD_PALETTES = [
  { grad: "linear-gradient(135deg,#FF5733,#F7A72D)", fill: "#FF5733" },
  { grad: "linear-gradient(135deg,#7C3AED,#A855F7)", fill: "#7C3AED" },
  { grad: "linear-gradient(135deg,#0F766E,#14B8A6)", fill: "#0F766E" },
  { grad: "linear-gradient(135deg,#1D4ED8,#3B82F6)", fill: "#1D4ED8" },
  { grad: "linear-gradient(135deg,#B45309,#F59E0B)", fill: "#B45309" },
  { grad: "linear-gradient(135deg,#0A3D2E,#16A34A)", fill: "#0A3D2E" },
];

// ─── EMOJIS PAR CATÉGORIE ───────────────────────────────────────
const EMOJI_OPTIONS = [
  { cat: "Mode & Style",    emojis: ["👗","👠","👜","🧢","✂️","💄","🪡","🎀"] },
  { cat: "Food & Boisson",  emojis: ["🥖","🍕","🥗","🍷","🧁","☕","🍽️","🫕"] },
  { cat: "Artisan & Créa",  emojis: ["🎨","📸","🪵","🏺","✏️","🧵","🖼️","🎭"] },
  { cat: "Sport & Bien-être",emojis: ["🏃","⚽","🧘","🚴","🏊","🎯","🥊","🌿"] },
  { cat: "Local & Éco",     emojis: ["🏠","♻️","🌱","🤝","🛍️","🏡","🌟","💛"] },
];

// ─── SUGGESTIONS RÉCOMPENSES ────────────────────────────────────
const REWARD_SUGGESTIONS = [
  "Bon cadeau 20€", "Bon cadeau 50€", "Bon cadeau 100€",
  "Remise de 15%", "Remise de 20%", "Remise de 30%",
  "Produit offert", "Séance offerte", "Consultation gratuite",
  "Surprise du commerçant", "Livraison offerte", "Lot de produits",
];

// ─── BOTTOM NAV ─────────────────────────────────────────────────
function BottomNav({ setPage, active }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Évén." },
    null,
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{
      height: 80, background: C.card,
      borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center",
      justifyContent: "space-around", flexShrink: 0,
    }}>
      {items.map((it, i) => it === null ? (
        <div
          key="fab"
          onClick={() => setPage("nouveau")}
          style={{
            width: 50, height: 50, borderRadius: 25, background: C.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer",
          }}
        >+</div>
      ) : (
        <div
          key={i}
          onClick={() => setPage(it.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 18 }}>{it.icon}</div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatBox({ n, l }) {
  return (
    <div style={{
      textAlign: "center", background: "rgba(255,255,255,0.18)",
      borderRadius: 10, padding: "6px 10px", flex: 1,
    }}>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: "#fff", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{l}</div>
    </div>
  );
}

// ─── DEFI CARD ── split design : photo haut / texte bas ─────────
const EMOJI_TO_CAT = {
  "👗":"Mode","👠":"Mode","💄":"Beauté","🍕":"Resto","🥖":"Resto",
  "🎨":"Loisirs","⚽":"Loisirs","🏠":"Maison","🛍️":"Mode","🏺":"Maison",
  "☕":"Resto","🧁":"Resto","🍷":"Resto","🎯":"Loisirs","🌿":"Maison",
};

function DefiCard({ d, onOpen, onParticipe }) {
  const pct = Math.min(d.pct || 0, 100);
  const PHOTO_H = 150;

  const category = EMOJI_TO_CAT[d.icon]
    || (d.fill === "#7C3AED" ? "Resto" : d.fill === "#0F766E" ? "Maison" : "Mode");

  const rewardAmount = d.reward?.match(/(\d+)\s*€/)?.[1]
    ? `${d.reward.match(/(\d+)\s*€/)[1]}€`
    : d.reward?.split(" ").slice(0, 2).join(" ");

  const daysNum = parseInt(d.timeLeft?.match(/^(\d+)/)?.[1] || "99");
  const isHot = !d.ended && (daysNum < 7 || pct > 80);

  return (
    <div
      onClick={() => onOpen(d.id)}
      style={{
        background: C.card, borderRadius: 20, marginBottom: 14,
        overflow: "hidden", border: `1px solid ${C.border}`,
        boxShadow: isHot
          ? "0 6px 22px rgba(255,107,53,0.28)"
          : "0 4px 16px rgba(0,0,0,0.07)",
        cursor: "pointer",
        ...(isHot ? { border: "2px solid #FF6B35" } : {}),
      }}
    >
      {/* ── PHOTO ── */}
      <div style={{ position: "relative", height: PHOTO_H, flexShrink: 0 }}>
        <ChallengeMedia
          photoUrl={d.photo_url || null}
          merchantName={d.sub || d.title}
          category={category}
          height={PHOTO_H}
        />
        {/* Badge récompense */}
        {rewardAmount && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <RewardBadge amount={rewardAmount} accentColor={d.fill || "#E94B2C"} size="sm" />
          </div>
        )}
        {/* Timer */}
        {d.timeLeft && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
            padding: "4px 9px", borderRadius: 999,
            fontSize: 10, fontWeight: 700, color: "#FFF",
          }}>
            {d.ended ? "✅" : "⏱"} {d.timeLeft}
          </div>
        )}
        {/* Badge HOT */}
        {isHot && (
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: "#FF6B35", borderRadius: 8, padding: "3px 9px",
            fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: 1,
          }}>🔥 HOT DROP</div>
        )}
      </div>

      {/* ── TEXTE ── */}
      <div style={{ padding: "11px 14px 13px", background: C.card }}>
        {/* Badge commerçant */}
        {d.merchant_name && (
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1, color: d.fill || C.accent,
            textTransform: "uppercase", marginBottom: 3,
          }}>
            🏪 {d.merchant_name}
          </div>
        )}
        <div style={{
          fontFamily: syne, fontWeight: 700, fontSize: 13,
          color: C.ink, lineHeight: 1.3, marginBottom: 3,
        }}>
          {d.title}
        </div>
        {d.reward && (
          <div style={{ fontSize: 10, color: C.ink2, marginBottom: 7 }}>
            🎁 {d.reward}
          </div>
        )}

        {/* Barre progression + bouton */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 10, color: C.ink2, marginBottom: 3,
            }}>
              <span>👥 {d.participants === 0 ? "Sois le 1er !" : `${d.participants} participants`}</span>
              <span>/ {d.objectif}</span>
            </div>
            <div style={{ height: 4, background: C.pill, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: d.fill || C.accent }} />
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); if (!d.ended) onParticipe(d.id); }}
            style={{
              border: "none", borderRadius: 12, padding: "8px 14px",
              fontSize: 11, fontWeight: 800, cursor: "pointer",
              fontFamily: dm, whiteSpace: "nowrap", flexShrink: 0,
              color: "#fff",
              background: d.ended ? C.ink2 : (d.isFull ? "#6B6560" : (d.fill || C.accent)),
            }}
          >
            {d.isFull ? "🔒 Complet" : d.ended ? "Voir" : d.participants === 0 ? "✨ 1er !" : "Participer →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SWIPE VOTE MODAL ───────────────────────────────────────────
function SwipeVoteModal({ d, user, onClose }) {
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [index, setIndex]       = useState(0);
  const [votes, setVotes]       = useState({});      // post_id → "like"|"pass"
  const [done, setDone]         = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);    // "left"|"right" pour animation
  const [alreadyVoted, setAlreadyVoted] = useState(new Set());

  // Touch swipe
  const touchStartX = useState(null);
  const touchRef    = { x: null };

  useEffect(() => {
    if (!d?.id) return;
    setLoading(true);
    supabase
      .from("posts")
      .select("id, content, image_url, author_id, profiles:author_id(pseudo, avatar_url)")
      .eq("defi_id", d.id)
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(80)
      .then(async ({ data }) => {
        const list = (data || []).filter(p => p.image_url);
        setPhotos(list);

        // Récupère les votes existants de cet user pour ce défi
        if (user?.id && list.length > 0) {
          const { data: existing } = await supabase
            .from("defi_votes")
            .select("post_id, vote")
            .eq("defi_id", d.id)
            .eq("voter_id", user.id);
          if (existing?.length > 0) {
            const seen = new Set(existing.map(v => v.post_id));
            const map  = {};
            existing.forEach(v => { map[v.post_id] = v.vote; });
            setAlreadyVoted(seen);
            setVotes(map);
            // Sauter les photos déjà votées
            const firstUnvoted = list.findIndex(p => !seen.has(p.id));
            setIndex(firstUnvoted === -1 ? list.length : firstUnvoted);
            if (firstUnvoted === -1) setDone(true);
          }
        }
        setLoading(false);
      });
  }, [d?.id, user?.id]);

  const currentPhoto = photos[index];

  async function castVote(postId, vote) {
    if (!user?.id) return;
    setVotes(v => ({ ...v, [postId]: vote }));
    // Upsert en base
    await supabase.from("defi_votes").upsert({
      defi_id:  d.id,
      post_id:  postId,
      voter_id: user.id,
      vote,
    }, { onConflict: "post_id,voter_id" });
  }

  async function handleVote(dir) {
    if (!currentPhoto || swipeDir) return;
    const vote = dir === "right" ? "like" : "pass";
    setSwipeDir(dir);
    await castVote(currentPhoto.id, vote);
    setTimeout(() => {
      setSwipeDir(null);
      const next = index + 1;
      if (next >= photos.length) setDone(true);
      else setIndex(next);
    }, 320);
  }

  // Comptage des likes
  const likeCount = Object.values(votes).filter(v => v === "like").length;
  const topPhotos = photos
    .filter(p => votes[p.id] === "like")
    .slice(0, 6);

  const cardStyle = {
    position: "absolute", inset: 0,
    borderRadius: 24, overflow: "hidden",
    transition: swipeDir ? "transform 0.3s ease, opacity 0.3s ease" : "none",
    transform: swipeDir === "right"
      ? "translateX(120%) rotate(18deg)"
      : swipeDir === "left"
        ? "translateX(-120%) rotate(-18deg)"
        : "none",
    opacity: swipeDir ? 0 : 1,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,8,6,0.88)", backdropFilter: "blur(8px)",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header */}
      <div style={{
        width: "100%", padding: "14px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: "#fff" }}>
          🗳️ Voter — {d.title}
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.12)", border: "none",
          borderRadius: "50%", width: 34, height: 34, color: "#fff",
          fontSize: 18, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          Chargement des photos…
        </div>
      ) : photos.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ fontSize: 40 }}>📷</div>
          <div style={{ color: "#fff", fontSize: 14, textAlign: "center", padding: "0 32px" }}>
            Pas encore de photos dans ce défi. Sois la première à participer !
          </div>
        </div>
      ) : done ? (
        /* ── ÉCRAN RÉSULTATS ── */
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", padding: "0 20px 20px", overflowY: "auto", width: "100%",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 4 }}>
            Vote terminé !
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 20, textAlign: "center" }}>
            Tu as liké <strong style={{ color: "#FF5733" }}>{likeCount} photo{likeCount > 1 ? "s" : ""}</strong> sur {photos.length}
          </div>
          {topPhotos.length > 0 && (
            <>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 12, alignSelf: "flex-start" }}>
                ❤️ Tes coups de cœur
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: "100%", marginBottom: 24 }}>
                {topPhotos.map(p => (
                  <div key={p.id} style={{ aspectRatio: "3/4", borderRadius: 14, overflow: "hidden", position: "relative" }}>
                    <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 6, right: 6, fontSize: 14 }}>❤️</div>
                  </div>
                ))}
              </div>
            </>
          )}
          <button onClick={onClose} style={{
            background: "#FF5733", color: "#fff", border: "none",
            borderRadius: 16, padding: "14px 32px",
            fontSize: 15, fontWeight: 700, fontFamily: dm, cursor: "pointer",
          }}>Fermer ✓</button>
        </div>
      ) : (
        /* ── CARTE SWIPE ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0 20px" }}>
          {/* Compteur */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            {index + 1} / {photos.length}
          </div>

          {/* Carte photo */}
          <div
            style={{ position: "relative", width: "100%", maxWidth: 380, flex: 1, maxHeight: 460, marginBottom: 20 }}
            onTouchStart={e => { touchRef.x = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchRef.x === null) return;
              const dx = e.changedTouches[0].clientX - touchRef.x;
              touchRef.x = null;
              if (Math.abs(dx) > 60) handleVote(dx > 0 ? "right" : "left");
            }}
          >
            <div style={cardStyle}>
              <img
                src={currentPhoto.image_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Overlay infos */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                padding: "40px 16px 16px",
              }}>
                <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>
                  {currentPhoto.profiles?.pseudo || "Voisine"}
                </div>
                {currentPhoto.content && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
                    {currentPhoto.content.slice(0, 80)}{currentPhoto.content.length > 80 ? "…" : ""}
                  </div>
                )}
              </div>

              {/* Indicateurs swipe en live */}
              {swipeDir === "right" && (
                <div style={{
                  position: "absolute", top: 24, left: 20,
                  background: "#22c55e", color: "#fff",
                  fontFamily: syne, fontWeight: 900, fontSize: 22,
                  padding: "6px 18px", borderRadius: 10, border: "3px solid #fff",
                  transform: "rotate(-18deg)",
                }}>❤️ LIKE</div>
              )}
              {swipeDir === "left" && (
                <div style={{
                  position: "absolute", top: 24, right: 20,
                  background: "#ef4444", color: "#fff",
                  fontFamily: syne, fontWeight: 900, fontSize: 22,
                  padding: "6px 18px", borderRadius: 10, border: "3px solid #fff",
                  transform: "rotate(18deg)",
                }}>✕ PASS</div>
              )}
            </div>
          </div>

          {/* Hint swipe */}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14, textAlign: "center" }}>
            ← Glisse à gauche pour passer · à droite pour liker →
          </div>

          {/* Boutons */}
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 20 }}>
            <button
              onClick={() => handleVote("left")}
              style={{
                width: 62, height: 62, borderRadius: "50%",
                background: "rgba(239,68,68,0.18)", border: "2px solid #ef4444",
                fontSize: 26, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "transform 0.15s",
              }}
            >✕</button>
            <button
              onClick={() => handleVote("right")}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(34,197,94,0.18)", border: "2.5px solid #22c55e",
                fontSize: 30, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "transform 0.15s",
              }}
            >❤️</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETAIL SCREEN ──────────────────────────────────────────────
function DetailScreen({ d, user, onBack, onParticipe }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showSwipe, setShowSwipe] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    if (!isUUID(d.id)) return;
    setLoadingPosts(true);
    supabase
      .from("posts")
      .select("id, content, image_url, created_at, author_id, profiles:author_id(pseudo, avatar_url)")
      .eq("defi_id", d.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setPosts(data || []);
        setLoadingPosts(false);
      });

    // Comptage total photos avec image
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("defi_id", d.id)
      .not("image_url", "is", null)
      .then(({ count }) => setPhotoCount(count || 0));
  }, [d.id]);

  // Couleur accent selon catégorie du défi
  const accentColor = d.fill || "#FF5733";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      {/* ── MODALE SWIPE VOTE ── */}
      {showSwipe && (
        <SwipeVoteModal d={d} user={user} onClose={() => setShowSwipe(false)} />
      )}

      {/* ── HERO : photo ou fallback ── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ChallengeMedia
          photoUrl={d.photo_url || null}
          merchantName={d.sub || d.title}
          category={d.fill === "#7C3AED" ? "Resto" : d.fill === "#0F766E" ? "Maison" : "Mode"}
          height={220}
        />
        {/* Bouton retour */}
        <button onClick={onBack} style={{
          position: "absolute", top: 14, left: 14,
          width: 34, height: 34, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)", borderRadius: "50%",
          border: "none", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, color: "#fff", cursor: "pointer",
        }}>‹</button>
        {/* Badge récompense */}
        {d.reward && (
          <div style={{ position: "absolute", bottom: 14, left: 14 }}>
            <RewardBadge
              amount={d.reward.match(/(\d+)\s*€/)?.[1] ? `${d.reward.match(/(\d+)\s*€/)[1]}€` : "🎁"}
              accentColor={accentColor}
              size="sm"
            />
          </div>
        )}
        {/* Timer */}
        {d.timeLeft && (
          <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#fff" }}>
            ⏱ {d.timeLeft}
          </div>
        )}
      </div>

      {/* ── INFOS TITRE + STATS ── */}
      <div style={{ background: C.card, padding: "14px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>{d.title}</div>
        {d.sub && <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.4, marginBottom: 10 }}>{d.sub}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { n: d.participants, l: "participants" },
            { n: d.timeLeft ? d.timeLeft.split(" ")[0] : (d.ended ? "✓" : "—"), l: d.ended ? "terminé" : "restants" },
            { n: d.objectif, l: "objectif" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "8px 14px", textAlign: "center", flex: 1 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.ink2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px" }}>

        {/* Récompense */}
        {d.reward && (
          <div style={{
            background: "linear-gradient(135deg,#FFF8E8,#FFF3D0)",
            border: "1.5px solid #F7A72D", borderRadius: 16,
            padding: "12px 16px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>🎁</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>À gagner</div>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>{d.reward}</div>
            </div>
          </div>
        )}

        {/* Mode de sélection */}
        <div style={{
          background: C.card, borderRadius: 16, padding: "10px 14px",
          marginBottom: 14, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ fontSize: 20 }}>{d.selection_mode === "vote" ? "🗳️" : "🎯"}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.4 }}>Sélection du gagnant</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginTop: 1 }}>
              {d.selection_mode === "vote"
                ? "Vote des voisins — le post avec le plus de réactions gagne"
                : "Choix du commerçant — il sélectionne lui-même le gagnant"}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink2, marginBottom: 8 }}>
            <span>Participants</span>
            <strong style={{ color: C.ink }}>{d.participants} / {d.objectif}</strong>
          </div>
          <div style={{ height: 8, background: C.pill, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(d.pct || 0, 100)}%`, background: d.grad }} />
          </div>
          {d.isFull && (
            <div style={{ fontSize: 11, color: "#E53935", fontWeight: 700, marginTop: 6 }}>🔒 Places complètes — le commerçant va choisir son gagnant !</div>
          )}
        </div>

        {/* Tags */}
        {d.tags && d.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {d.tags.map(t => (
              <div key={t} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11,
                background: C.pill, color: C.ink2, fontFamily: dm,
              }}>{t}</div>
            ))}
          </div>
        )}

        {/* ── Bouton voter sur les photos ── */}
        {photoCount > 0 && (
          <div
            onClick={() => setShowSwipe(true)}
            style={{
              background: "linear-gradient(135deg,#FF5733,#F7A72D)",
              borderRadius: 18, padding: "16px 20px", marginBottom: 16,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 6px 20px rgba(255,87,51,0.35)",
            }}
          >
            <div style={{ fontSize: 34 }}>🗳️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>
                Voter sur les photos
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                {photoCount} photo{photoCount > 1 ? "s" : ""} · Swipe ← pass · → like
              </div>
            </div>
            <div style={{ fontSize: 22, color: "#fff" }}>›</div>
          </div>
        )}

        {/* Posts récents */}
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 10 }}>
          Posts récents 🔥
        </div>

        {loadingPosts ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.ink2, fontSize: 12 }}>Chargement…</div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "28px 20px",
            background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏁</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 14, color: C.ink, marginBottom: 4 }}>
              Sois le premier !
            </div>
            <div style={{ fontSize: 12, color: C.ink2 }}>
              Aucun post pour ce défi pour l'instant.
            </div>
          </div>
        ) : posts.map((p, i) => (
          <div key={p.id || i} style={{
            display: "flex", gap: 10, alignItems: "center",
            background: C.card, borderRadius: 14, padding: "10px 12px",
            marginBottom: 8, border: `1px solid ${C.border}`,
          }}>
            {/* Avatar */}
            <div style={{
              width: 48, height: 48, borderRadius: 10, overflow: "hidden",
              flexShrink: 0, background: C.pill,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {p.image_url ? (
                <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 22 }}>📷</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: syne }}>
                {p.profiles?.pseudo || "Voisin"}
              </div>
              <div style={{
                fontSize: 11, color: C.ink2, marginTop: 1,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{p.content}</div>
            </div>
          </div>
        ))}
      </div>

      {!d.ended && (
        <div style={{ position: "absolute", bottom: 90, left: 20, right: 20, zIndex: 10 }}>
          <button
            onClick={onParticipe}
            style={{
              width: "100%", border: "none", borderRadius: 18, padding: 16,
              fontSize: 15, fontWeight: 700, fontFamily: dm,
              cursor: "pointer", textAlign: "center",
              color: "#fff", background: d.fill,
            }}
          >+ Participer à ce défi</button>
        </div>
      )}
    </div>
  );
}

// ─── PARTICIPE SCREEN ───────────────────────────────────────────
function ParticipeScreen({ d, user, profile, onBack, onPublishSuccess }) {
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [desc, setDesc] = useState("");
  const [activeTags, setActiveTags] = useState(d.tags?.slice(0, 1) || []);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const raw = e.target.files[0];
    if (!raw) return;
    const file = await convertImageFile(raw);
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  }

  const toggleTag = t => setActiveTags(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  async function handlePublish() {
    if (!user?.id || !imgFile) return;
    setPublishing(true);
    setError("");

    try {
      // 1. Upload image
      const ext = (imgFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
      const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(path, imgFile, { contentType: imgFile.type || "image/jpeg", upsert: false });
      if (upErr) throw new Error("Upload échoué : " + upErr.message);

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
      const image_url = urlData.publicUrl;

      // 2. Insert post
      const content = desc.trim()
        || `Je participe au défi "${d.title}" 🏆 ${activeTags.join(" ")}`.trim();

      const postData = {
        author_id: user.id,
        content,
        image_url,
        location: profile?.quartier || "Saint-Dié-des-Vosges",
        tags: activeTags,
      };
      // Lie au défi si UUID réel
      if (isUUID(d.id)) postData.defi_id = d.id;

      const { error: postErr } = await supabase.from("posts").insert(postData);
      if (postErr) throw new Error(postErr.message);

      // XP pour participation au défi
      if (user?.id) addXP(user.id, 15, "defi_participation");
      onPublishSuccess();
    } catch (err) {
      setError(err.message);
      setPublishing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            width: 34, height: 34, background: C.card, borderRadius: "50%",
            border: "none", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >‹</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink }}>
          Participer · {d.title}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {/* Bannière défi */}
        <div style={{
          borderRadius: 14, padding: "12px 14px", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 10, background: d.grad,
        }}>
          <div style={{ fontSize: 22 }}>{d.icon}</div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Tu réponds au défi</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "#fff" }}>{d.title}</div>
          </div>
        </div>

        {/* Zone photo */}
        <input
          id="defi-file-input"
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <div
          onClick={() => document.getElementById("defi-file-input").click()}
          style={{
            background: imgPreview ? "#000" : C.card,
            border: imgPreview ? `2px solid ${C.accent}` : "2px dashed rgba(255,87,51,0.35)",
            borderRadius: 18, aspectRatio: "4/3",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 8, cursor: "pointer", marginBottom: 14,
            position: "relative", overflow: "hidden",
          }}
        >
          {imgPreview ? (
            <>
              <img
                src={imgPreview}
                alt="preview"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute", bottom: 8, right: 8,
                background: "rgba(0,0,0,0.5)", color: "#fff",
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8,
              }}>Changer</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36 }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Ajoute ta photo</div>
              <div style={{ fontSize: 11, color: C.ink2, opacity: 0.7 }}>Galerie ou appareil photo</div>
            </>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.3, marginBottom: 5 }}>
            DESCRIPTION (optionnel)
          </div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Décris ton commerce coup de cœur, pourquoi tu l'aimes…"
            rows={3}
            style={{
              width: "100%", background: C.card,
              border: `1.5px solid ${C.border}`,
              borderRadius: 14, padding: "12px 14px",
              fontSize: 14, fontFamily: dm, color: C.ink,
              outline: "none", resize: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tags */}
        {d.tags && d.tags.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.3, marginBottom: 5 }}>
              TAGS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {d.tags.map(t => (
                <div
                  key={t}
                  onClick={() => toggleTag(t)}
                  style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 12,
                    cursor: "pointer", fontFamily: dm,
                    border: `1.5px solid ${activeTags.includes(t) ? C.accent : C.border}`,
                    background: activeTags.includes(t) ? C.accent : C.card,
                    color: activeTags.includes(t) ? "#fff" : C.ink2,
                    transition: "all 0.15s",
                  }}
                >{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* Droit à l'image note */}
        <div style={{
          fontSize: 10, color: C.ink2, background: C.pill, borderRadius: 10,
          padding: "8px 12px", lineHeight: 1.5,
        }}>
          📸 En publiant, tu confirmes être l'auteur de la photo et avoir obtenu l'accord des personnes visibles.
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 12,
            background: "#FFF0EE", border: "1px solid #FFB0A0",
            fontSize: 12, color: "#C0392B",
          }}>❌ {error}</div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 90, left: 20, right: 20, zIndex: 10 }}>
        <button
          onClick={handlePublish}
          disabled={!imgFile || publishing}
          style={{
            width: "100%",
            background: imgFile && !publishing ? C.accent : "#ccc",
            color: "#fff", border: "none", borderRadius: 18, padding: 16,
            fontSize: 15, fontWeight: 700, fontFamily: dm,
            cursor: imgFile && !publishing ? "pointer" : "not-allowed",
          }}
        >{publishing ? "Publication en cours…" : "Publier mon post 🔥"}</button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ─────────────────────────────────────────────
function SuccessScreen({ d, onBack }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", textAlign: "center", gap: 14,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", background: C.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "#fff",
      }}>🔥</div>
      <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Post publié !</div>
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
        Ton post est en ligne sur le fil.<br />
        Tu participes maintenant au <strong>{d.title}</strong>.
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#FFF8E8", color: "#B45309",
        fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 20,
      }}>⚡ +15 XP gagnés</div>
      <button
        onClick={onBack}
        style={{
          background: C.ink, color: "#fff", border: "none",
          borderRadius: 16, padding: "13px 28px",
          fontSize: 14, fontWeight: 600, fontFamily: dm,
          cursor: "pointer", marginTop: 6,
        }}
      >Voir les autres défis</button>
    </div>
  );
}

// ─── CRÉER UN DÉFI ──────────────────────────────────────────────
function CreerDefiScreen({ user, profile, onBack, onSuccess }) {
  const [emoji, setEmoji]           = useState("🏆");
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [reward, setReward]         = useState("");
  const [endDate, setEndDate]       = useState("");
  const [maxP, setMaxP]             = useState("30");
  const [limitOn, setLimitOn]       = useState(true);
  const [mode, setMode]             = useState("choix"); // "choix" | "vote"
  const [publishing, setPublishing] = useState(false);
  const [error, setError]           = useState("");
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  async function handlePhotoFile(e) {
    const raw = e.target.files[0];
    if (!raw) return;
    const file = await convertImageFile(raw);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const inp = {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "10px 12px", fontSize: 13, fontFamily: dm,
    background: C.bg, color: C.ink, boxSizing: "border-box", outline: "none",
  };
  const section = { marginBottom: 18 };
  const label = { fontSize: 11, fontWeight: 700, color: C.ink2, letterSpacing: 0.4, marginBottom: 6, display: "block", textTransform: "uppercase" };

  async function handlePublish() {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!endDate)       { setError("La date de fin est obligatoire."); return; }
    setPublishing(true); setError("");

    // Upload photo si présente
    let photo_url = null;
    if (photoFile) {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
      const path = `defis/${user.id}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(path, photoFile, { contentType: photoFile.type || "image/jpeg", upsert: false });
      if (upErr) { setError("Upload photo échoué : " + upErr.message); setPublishing(false); return; }
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
      photo_url = urlData.publicUrl;
    }

    const [y, m, jj] = endDate.split("-");
    const { data, error: err } = await supabase.from("defis").insert({
      title:           title.trim(),
      description:     description.trim() || null,
      emoji,
      reward:          reward.trim() || null,
      ends_at:         new Date(`${y}-${m}-${jj}T23:59:00`).toISOString(),
      max_participants: limitOn ? parseInt(maxP) || 30 : null,
      total_target:    limitOn ? parseInt(maxP) || 30 : 100,
      selection_mode:  mode,
      xp:              15,
      ended:           false,
      user_id:         user?.id || null,
      merchant_name:   profile?.pseudo || profile?.nom || null,
      ...(photo_url ? { photo_url } : {}),
    }).select().single();
    if (err) { setError(err.message); setPublishing(false); return; }
    if (user?.id) addXP(user.id, 20, "defi_cree");
    onSuccess(data);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}>←</button>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink }}>Créer un défi 🏆</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 120px" }}>

        {/* ── Photo du défi ── */}
        <div style={section}>
          <span style={label}>📸 Photo du défi (optionnel)</span>
          <input
            id="defi-cover-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoFile}
            style={{ display: "none" }}
          />
          <div
            onClick={() => document.getElementById("defi-cover-input").click()}
            style={{
              background: photoPreview ? "#000" : C.card,
              border: photoPreview ? `2px solid ${C.accent}` : "2px dashed rgba(255,87,51,0.35)",
              borderRadius: 16, height: 140,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 6, cursor: "pointer", overflow: "hidden", position: "relative",
            }}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>Changer</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 30 }}>🖼️</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Ajouter une photo de couverture</div>
                <div style={{ fontSize: 10, color: C.ink2 }}>Elle s'affichera en haut de la carte défi</div>
              </>
            )}
          </div>
        </div>

        {/* ── Titre ── */}
        <div style={section}>
          <span style={label}>Nom du défi *</span>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Montre ton look du mois, Photo de ton plat préféré…" style={inp} />
        </div>

        {/* ── Description ── */}
        <div style={section}>
          <span style={label}>Description (optionnel)</span>
          <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Explique les règles du défi…" rows={3} style={{ ...inp, resize: "none" }} />
        </div>

        {/* ── Récompense ── */}
        <div style={section}>
          <span style={label}>🎁 Récompense à gagner</span>
          <input value={reward} onChange={e => setReward(e.target.value)} placeholder="Ex: Bon cadeau 50€, Produit offert…" style={{ ...inp, marginBottom: 8 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {REWARD_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setReward(s)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: dm,
                background: reward === s ? C.accent : C.pill,
                color: reward === s ? "#fff" : C.ink2,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* ── Date de fin ── */}
        <div style={section}>
          <span style={label}>Date de fin *</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inp} />
        </div>

        {/* ── Limite participants ── */}
        <div style={section}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={label}>👥 Limiter les participants</span>
            <button onClick={() => setLimitOn(!limitOn)} style={{
              padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: "none", cursor: "pointer", fontFamily: dm,
              background: limitOn ? C.accent : C.pill,
              color: limitOn ? "#fff" : C.ink2,
            }}>{limitOn ? "Oui" : "Non"}</button>
          </div>
          {limitOn && (
            <div>
              <input
                type="number" value={maxP} onChange={e => setMaxP(e.target.value)}
                min="1" max="500"
                style={{ ...inp, width: 120 }}
              />
              <div style={{ fontSize: 11, color: C.ink2, marginTop: 6 }}>
                Le défi se clôture automatiquement quand ce nombre est atteint.
              </div>
            </div>
          )}
        </div>

        {/* ── Mode de sélection ── */}
        <div style={section}>
          <span style={label}>🏆 Sélection du gagnant</span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { k: "choix", icon: "🎯", title: "Ton choix", desc: "Tu sélectionnes toi-même le gagnant parmi les participants" },
              { k: "vote",  icon: "🗳️", title: "Vote des voisins", desc: "Le post avec le plus de réactions gagne automatiquement" },
            ].map(opt => (
              <div
                key={opt.k}
                onClick={() => setMode(opt.k)}
                style={{
                  flex: 1, borderRadius: 16, padding: "12px 10px", cursor: "pointer",
                  border: mode === opt.k ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  background: mode === opt.k ? "#FFF0EB" : C.card, textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{opt.title}</div>
                <div style={{ fontSize: 10, color: C.ink2, lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: 12, color: "#E53935", padding: "8px 12px", background: "#FFF0EE", borderRadius: 10, marginBottom: 12 }}>❌ {error}</div>}
      </div>

      {/* Bouton publier */}
      <div style={{ position: "absolute", bottom: 90, left: 16, right: 16, zIndex: 10 }}>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            width: "100%", background: publishing ? "#ccc" : C.accent,
            color: "#fff", border: "none", borderRadius: 16, padding: 16,
            fontSize: 15, fontWeight: 700, fontFamily: dm, cursor: "pointer",
          }}
        >{publishing ? "Publication…" : "Publier le défi 🏆"}</button>
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────
export default function ChipeurDefis({ setPage, user, profile }) {
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [defis, setDefis] = useState(STATIC_DEFIS);
  const [loading, setLoading] = useState(true);

  // Marchand = a une categorie dans son profil OU role marchand dans metadata
  const isMarchand = !!(profile?.categorie || ["magasin","artisan","commercant"].includes(user?.user_metadata?.role));

  async function loadDefis() {
    setLoading(true);
    try {
      // 1. Charger les défis
      const { data: defisData, error } = await supabase
        .from("defis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !defisData || defisData.length === 0) {
        // Fallback statique
        setDefis(STATIC_DEFIS);
        setLoading(false);
        return;
      }

      // 2. Compter les participants UNIQUES par défi (1 user = 1 participation même s'il a posté plusieurs fois)
      const { data: countsData } = await supabase
        .from("posts")
        .select("defi_id, author_id")
        .not("defi_id", "is", null);

      // Regrouper par defi_id → Set d'author_id distincts
      const seenMap = {};
      (countsData || []).forEach(row => {
        if (!seenMap[row.defi_id]) seenMap[row.defi_id] = new Set();
        seenMap[row.defi_id].add(row.author_id);
      });
      const countMap = {};
      Object.keys(seenMap).forEach(defiId => {
        countMap[defiId] = seenMap[defiId].size;
      });

      // 3. Construire les défis enrichis
      const enriched = defisData.map((d, idx) => {
        const participants = countMap[d.id] || 0;
        const maxP = d.max_participants || d.total_target || 60;
        const isFull = d.max_participants && participants >= d.max_participants;
        const isEnded = d.ended || isFull || (d.ends_at && new Date(d.ends_at) < new Date());
        const timeLeft = isEnded ? null : computeTimeLeft(d.ends_at, false);
        const pct = maxP > 0 ? Math.min(100, Math.round((participants / maxP) * 100)) : 0;
        const palette = GRAD_PALETTES[idx % GRAD_PALETTES.length];
        return {
          ...d,
          icon: d.emoji || d.icon || "🏆",
          objectif: maxP,
          participants,
          pct,
          ended: isEnded,
          isFull,
          timeLeft: isFull
            ? `Complet ! ${participants} participants`
            : isEnded
              ? `Terminé · ${participants} posts`
              : (timeLeft || "En cours"),
          tags: Array.isArray(d.tags) ? d.tags : [],
          grad: d.grad || palette.grad,
          fill: d.fill || palette.fill,
          reward: d.reward || null,
          merchant_name: d.merchant_name || null,
          selection_mode: d.selection_mode || "choix",
        };
      });

      setDefis(enriched);
    } catch (e) {
      console.error("loadDefis error:", e);
      setDefis(STATIC_DEFIS);
    }
    setLoading(false);
  }

  useEffect(() => { loadDefis(); }, []);

  const selected = selectedId !== null
    ? defis.find(d => d.id === selectedId) || defis[0]
    : defis[0];

  const filters = ["Tous", "En cours", "Terminés"];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: dm, color: C.ink,
    }}>

      {/* ── LISTE ── */}
      {screen === "list" && (
        <>
          <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <button
                onClick={() => setPage("fil")}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}
              >←</button>
                  <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: C.ink }}>Défis 🏆</div>
              {isMarchand && (
                <button
                  onClick={() => setScreen("creer")}
                  style={{
                    marginLeft: "auto", background: C.accent, color: "#fff",
                    border: "none", borderRadius: 12, padding: "7px 14px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: dm,
                  }}
                >+ Créer</button>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, marginBottom: 14 }}>
              Rejoins les challenges du quartier
            </div>
          </div>

          <div style={{
            display: "flex", gap: 6, padding: "0 20px 12px",
            overflowX: "auto", flexShrink: 0, scrollbarWidth: "none",
          }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "7px 16px",
                  borderRadius: 20, border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                  background: filter === f ? C.ink : C.pill,
                  color: filter === f ? "#fff" : C.ink2,
                  fontFamily: dm, transition: "all 0.15s",
                }}
              >{f}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement…</div>
            ) : defis
              .filter(d => {
                if (filter === "Tous") return true;
                if (filter === "Terminés") return d.ended;
                return !d.ended;
              })
              .map(d => (
                <DefiCard
                  key={d.id}
                  d={d}
                  onOpen={id => { setSelectedId(id); setScreen("detail"); }}
                  onParticipe={id => { setSelectedId(id); setScreen("participe"); }}
                />
              ))
            }
          </div>
        </>
      )}

      {/* ── DETAIL ── */}
      {screen === "detail" && selected && (
        <DetailScreen
          d={selected}
          user={user}
          onBack={() => setScreen("list")}
          onParticipe={() => setScreen("participe")}
        />
      )}

      {/* ── PARTICIPER ── */}
      {screen === "participe" && selected && (
        <ParticipeScreen
          d={selected}
          user={user}
          profile={profile}
          onBack={() => setScreen("detail")}
          onPublishSuccess={() => {
            loadDefis(); // Rafraîchit le compteur
            setScreen("success");
          }}
        />
      )}

      {/* ── SUCCÈS ── */}
      {screen === "success" && selected && (
        <SuccessScreen
          d={selected}
          onBack={() => { setScreen("list"); setSelectedId(null); }}
        />
      )}

      {/* ── CRÉER UN DÉFI ── */}
      {screen === "creer" && (
        <CreerDefiScreen
          user={user}
          profile={profile}
          onBack={() => setScreen("list")}
          onSuccess={() => { loadDefis(); setScreen("list"); }}
        />
      )}

      <BottomNav setPage={setPage} active="defis" />
    </div>
  );
}
