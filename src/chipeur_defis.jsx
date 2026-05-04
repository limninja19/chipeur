import { useState, useEffect } from "react";
import { supabase } from "./supabase";

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

// ─── BOTTOM NAV ─────────────────────────────────────────────────
function BottomNav({ setPage, active }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
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

// ─── DEFI CARD ──────────────────────────────────────────────────
function DefiCard({ d, onOpen, onParticipe }) {
  const pct = Math.min(d.pct || 0, 100);
  return (
    <div
      onClick={() => onOpen(d.id)}
      style={{
        background: C.card, borderRadius: 20, marginBottom: 12,
        overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer",
      }}
    >
      <div style={{ padding: "16px 16px 14px", background: d.grad }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{d.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>
              {d.title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{d.sub}</div>
            {d.timeLeft && (
              <div style={{
                background: "rgba(255,255,255,0.22)", borderRadius: 8,
                padding: "3px 8px", fontSize: 10, color: "#fff", fontWeight: 600,
                marginTop: 6, display: "inline-block",
              }}>
                {d.ended ? "✅" : "⏳"} {d.timeLeft}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <StatBox n={d.participants} l="participants" />
          <StatBox n={d.objectif} l="objectif" />
          <StatBox n={pct + "%"} l="complété" />
        </div>
      </div>
      <div style={{
        padding: "10px 14px 12px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.ink2, marginBottom: 4 }}>
            <span>{d.participants} posts</span>
            <span>objectif {d.objectif}{d.ended ? " ✓" : ""}</span>
          </div>
          <div style={{ height: 5, background: C.pill, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: d.fill }} />
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); if (!d.ended) onParticipe(d.id); }}
          style={{
            border: "none", borderRadius: 12, padding: "7px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: dm, whiteSpace: "nowrap",
            color: "#fff", background: d.ended ? C.ink : d.fill,
          }}
        >
          {d.ended ? "Voir les posts" : "+ Participer"}
        </button>
      </div>
    </div>
  );
}

// ─── DETAIL SCREEN ──────────────────────────────────────────────
function DetailScreen({ d, user, onBack, onParticipe }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

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
  }, [d.id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{
        padding: "20px 20px 16px",
        display: "flex", flexDirection: "column", gap: 12,
        flexShrink: 0, position: "relative", background: d.grad,
      }}>
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: 14, left: 14,
            width: 32, height: 32,
            background: "rgba(255,255,255,0.25)", borderRadius: "50%",
            border: "none", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, color: "#fff", cursor: "pointer",
          }}
        >‹</button>
        <div style={{ fontSize: 40, textAlign: "center", marginTop: 8 }}>{d.icon}</div>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff", textAlign: "center" }}>
          {d.title}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", textAlign: "center", lineHeight: 1.4 }}>
          {d.sub}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[
            { n: d.participants, l: "participants" },
            { n: d.timeLeft ? d.timeLeft.split(" ")[0] : (d.ended ? "✓" : "—"), l: d.ended ? "terminé" : "restants" },
            { n: d.objectif, l: "objectif" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: "#fff" }}>{s.n}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.75)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px" }}>
        {/* Barre de progression */}
        <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink2, marginBottom: 8 }}>
            <span>Progression</span>
            <strong style={{ color: C.ink }}>{d.pct || 0}%</strong>
          </div>
          <div style={{ height: 8, background: C.pill, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(d.pct || 0, 100)}%`, background: d.grad }} />
          </div>
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

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
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

// ─── MAIN ───────────────────────────────────────────────────────
export default function ChipeurDefis({ setPage, user, profile }) {
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [defis, setDefis] = useState(STATIC_DEFIS);
  const [loading, setLoading] = useState(true);

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

      // 2. Compter les participants (posts par defi_id)
      const { data: countsData } = await supabase
        .from("posts")
        .select("defi_id")
        .not("defi_id", "is", null);

      const countMap = {};
      (countsData || []).forEach(row => {
        countMap[row.defi_id] = (countMap[row.defi_id] || 0) + 1;
      });

      // 3. Construire les défis enrichis
      const enriched = defisData.map(d => {
        const participants = countMap[d.id] || 0;
        const isEnded = d.ended || (d.ends_at && new Date(d.ends_at) < new Date());
        const timeLeft = isEnded ? null : computeTimeLeft(d.ends_at, false);
        const pct = d.objectif > 0
          ? Math.min(100, Math.round((participants / d.objectif) * 100))
          : 0;
        return {
          ...d,
          participants,
          pct,
          ended: isEnded,
          timeLeft: isEnded
            ? `Terminé · ${participants} posts`
            : (timeLeft || "Bientôt"),
          tags: Array.isArray(d.tags) ? d.tags : [],
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

      <BottomNav setPage={setPage} active="defis" />
    </div>
  );
}
