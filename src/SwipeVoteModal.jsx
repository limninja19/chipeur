import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { addXP } from "./chipeur_xp";

const syne = "'Syne', sans-serif";
const dm   = "'DM Sans', sans-serif";

export default function SwipeVoteModal({ d, user, onClose }) {
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [index, setIndex]       = useState(0);
  const [votes, setVotes]       = useState({});
  const [done, setDone]         = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const xpGivenRef = useRef(false);

  const touchRef = { x: null };

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
            setVotes(map);
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
    setVoteError(null);
    const { error } = await supabase.from("defi_votes").upsert(
      { defi_id: d.id, post_id: postId, voter_id: user.id, vote },
      { onConflict: "post_id,voter_id" }
    );
    if (error) {
      console.error("❌ Erreur vote Supabase:", error.code, error.message, error.details);
      setVoteError(`Erreur : ${error.message}`);
    }
  }

  async function handleVote(dir) {
    if (!currentPhoto || swipeDir) return;
    setSwipeDir(dir);
    await castVote(currentPhoto.id, dir === "right" ? "like" : "pass");
    setTimeout(() => {
      setSwipeDir(null);
      const next = index + 1;
      if (next >= photos.length) setDone(true);
      else setIndex(next);
    }, 320);
  }

  // Donner 5 XP gloire une seule fois quand le vote est complété
  useEffect(() => {
    if (done && user?.id && !xpGivenRef.current) {
      xpGivenRef.current = true;
      const gain = 5;
      addXP(user.id, gain, "defi_vote");
      setXpEarned(gain);
    }
  }, [done, user?.id]);

  const likeCount = Object.values(votes).filter(v => v === "like").length;
  const topPhotos = photos.filter(p => votes[p.id] === "like").slice(0, 6);

  const cardStyle = {
    position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden",
    transition: swipeDir ? "transform 0.3s ease, opacity 0.3s ease" : "none",
    transform: swipeDir === "right"
      ? "translateX(120%) rotate(18deg)"
      : swipeDir === "left" ? "translateX(-120%) rotate(-18deg)" : "none",
    opacity: swipeDir ? 0 : 1,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(10,8,6,0.92)", backdropFilter: "blur(8px)",
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
            Pas encore de photos dans ce défi.
          </div>
        </div>
      ) : done ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 20px", overflowY: "auto", width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 4 }}>Vote terminé !</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 12, textAlign: "center" }}>
            Tu as liké <strong style={{ color: "#FF5733" }}>{likeCount} photo{likeCount > 1 ? "s" : ""}</strong> sur {photos.length}
          </div>
          {xpEarned > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,248,232,0.15)", border: "1px solid rgba(247,167,45,0.4)", color: "#F7A72D", fontSize: 14, fontWeight: 700, padding: "8px 18px", borderRadius: 20, marginBottom: 20, fontFamily: syne }}>
              ⚡ +{xpEarned} XP gloire gagnés !
            </div>
          )}
          {topPhotos.length > 0 && (
            <>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 12, alignSelf: "flex-start" }}>❤️ Tes coups de cœur</div>
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0 20px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            {index + 1} / {photos.length}
          </div>
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
              <img src={currentPhoto.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
              {swipeDir === "right" && (
                <div style={{ position: "absolute", top: 24, left: 20, background: "#22c55e", color: "#fff", fontFamily: syne, fontWeight: 900, fontSize: 22, padding: "6px 18px", borderRadius: 10, border: "3px solid #fff", transform: "rotate(-18deg)" }}>❤️ LIKE</div>
              )}
              {swipeDir === "left" && (
                <div style={{ position: "absolute", top: 24, right: 20, background: "#ef4444", color: "#fff", fontFamily: syne, fontWeight: 900, fontSize: 22, padding: "6px 18px", borderRadius: 10, border: "3px solid #fff", transform: "rotate(18deg)" }}>✕ PASS</div>
              )}
            </div>
          </div>
          {voteError && (
            <div style={{
              background: "rgba(239,68,68,0.18)", border: "1px solid #ef4444",
              borderRadius: 10, padding: "8px 14px", marginBottom: 8,
              fontSize: 11, color: "#fca5a5", textAlign: "center", width: "100%",
            }}>
              ⚠️ {voteError}
            </div>
          )}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14, textAlign: "center" }}>
            ← Glisse à gauche pour passer · à droite pour liker →
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => handleVote("left")} style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(239,68,68,0.18)", border: "2px solid #ef4444", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <button onClick={() => handleVote("right")} style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.18)", border: "2.5px solid #22c55e", fontSize: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>❤️</button>
          </div>
        </div>
      )}
    </div>
  );
}
