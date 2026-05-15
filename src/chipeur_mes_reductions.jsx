import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
  shopOrange: "#FF5733", shopBg: "#FFF4F1",
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
    <div style={{ height: 80, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
      {items.map(it => it.isFab
        ? <div key="fab" onClick={onFab} style={{ width: 50, height: 50, borderRadius: 25, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginTop: -20, cursor: "pointer" }}>+</div>
        : <div key={it.id} onClick={() => onNavigate(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9, color: active === it.id ? C.accent : C.ink2, cursor: "pointer" }}>
            <div style={{ fontSize: 18 }}>{it.icon}</div>
            <span>{it.label}</span>
          </div>
      )}
    </div>
  );
}

function formatExpiry(expires_at) {
  if (!expires_at) return null;
  const d = new Date(expires_at);
  const now = new Date();
  if (d < now) return "Expirée";
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff === 1) return "Expire demain";
  if (diff <= 7) return `Expire dans ${diff}j`;
  return `Exp. ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function formatAmount(valeur, type_remise) {
  if (!valeur) return "Offre";
  return type_remise === "pct" ? `-${valeur}%` : `-${valeur}€`;
}

// ─── ÉCRAN DÉTAIL ──────────────────────────────────────────────
function DetailScreen({ item, onBack }) {
  const [copied, setCopied] = useState(false);
  const amount = formatAmount(item.valeur, item.type_remise);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} style={{ background: C.pill, border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: C.ink }}>Bon plan du quartier</span>
      </div>

      <div style={{ background: C.proBg, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏪</div>
        <div style={{ fontFamily: syne, fontSize: 17, fontWeight: 700, color: C.pro }}>{item.merchant_name || "Commerce"}</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 3 }}>{item.title}</div>
        <div style={{ fontFamily: syne, fontSize: 32, fontWeight: 800, color: C.accent, marginTop: 8 }}>{amount}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {item.code && (
          <div style={{ background: C.bg, border: "1.5px dashed rgba(26,23,20,0.2)", borderRadius: 16, padding: 16, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Ton code promo</div>
            <div style={{ fontFamily: syne, fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: 6, marginBottom: 12 }}>{item.code}</div>
            <button
              onClick={() => { navigator.clipboard?.writeText(item.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ width: "100%", padding: 12, borderRadius: 12, background: copied ? C.pro : C.accent, color: "#fff", fontFamily: dm, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.3s" }}
            >
              {copied ? "✓ Code copié !" : "Copier le code"}
            </button>
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 14 }}>
          {[
            ["Enseigne", item.merchant_name || "—"],
            ["Valable jusqu'au", item.expires_at ? new Date(item.expires_at).toLocaleDateString("fr-FR") : "Sans limite"],
            ["Conditions", item.conditions || "Aucune condition particulière"],
            ["Ciblage", item.ciblage === "interesse" ? "Ciblée sur intérêt" : "Tous les abonnés"],
          ].map(([k, v], i) => (
            <tr key={i}>
              <td style={{ padding: "9px 4px", borderBottom: `1px solid ${C.border}`, color: C.ink2, width: "42%" }}>{k}</td>
              <td style={{ padding: "9px 4px", borderBottom: `1px solid ${C.border}`, fontWeight: 500, textAlign: "right" }}>{v}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}

// ─── TAB 1 : MES XP SHOP ──────────────────────────────────────
function MesXPShop({ user, setPage }) {
  const [wallets, setWallets] = useState([]);
  const [linkedPosts, setLinkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  async function loadAll() {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const [walletsRes, postsRes] = await Promise.all([
      supabase
        .from("merchant_xp_wallet")
        .select("*, profiles:merchant_id(pseudo, avatar_url)")
        .eq("user_id", user.id)
        .order("points", { ascending: false }),
      supabase
        .from("posts")
        .select("id, image_url, content, magasin_id, magasin_nom, linked_status, created_at")
        .eq("author_id", user.id)
        .not("magasin_id", "is", null)
        .order("created_at", { ascending: false }),
    ]);
    if (walletsRes.error) console.error("wallets:", walletsRes.error);
    setWallets(walletsRes.data || []);

    // Enrichir magasin_nom manquant pour anciens posts
    const posts = postsRes.data || [];
    const needName = [...new Set(posts.filter(p => p.magasin_id && !p.magasin_nom).map(p => p.magasin_id))];
    if (needName.length > 0) {
      const { data: merchants } = await supabase.from("profiles").select("id, pseudo").in("id", needName);
      const nm = {};
      (merchants || []).forEach(m => { nm[m.id] = m.pseudo; });
      setLinkedPosts(posts.map(p => (p.magasin_id && !p.magasin_nom && nm[p.magasin_id]) ? { ...p, magasin_nom: nm[p.magasin_id] } : p));
    } else {
      setLinkedPosts(posts);
    }
    setLoading(false);
  }

  const totalShop = wallets.reduce((sum, w) => sum + (w.points || 0), 0);
  const disponibles = wallets.filter(w => (w.points || 0) >= 100);
  const enCours = wallets.filter(w => (w.points || 0) < 100 && (w.points || 0) > 0);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink2, fontSize: 13 }}>
        ⏳ Chargement…
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
        {/* Hero vide */}
        <div style={{ background: "#FF5733", borderRadius: 18, padding: "20px 18px", marginBottom: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏪</div>
          <div style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Tes XP Shop t'attendent !</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, marginBottom: 14 }}>
            Poste une photo d'un article en magasin. Si le commerçant valide, tu gagnes 10 XP Shop — transformables en bon d'achat à 100 XP.
          </div>
          <button onClick={() => setPage("nouveau")}
            style={{ background: "#fff", color: C.accent, fontFamily: dm, fontWeight: 600, fontSize: 12, border: "none", borderRadius: 12, padding: "9px 18px", cursor: "pointer" }}>
            📸 Poster une photo
          </button>
        </div>

        {/* Comment ça marche */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.4 }}>Comment ça marche</span>
          </div>
          {[
            { n: "1", text: "Prends une photo d'un article en magasin" },
            { n: "2", text: "Poste-la en la reliant au commerce" },
            { n: "3", text: <>Le commerçant accepte → <span style={{ color: C.accent, fontWeight: 600 }}>+10 XP Shop</span></> },
            { n: "4", text: <>100 XP Shop = <span style={{ color: C.pro, fontWeight: 600 }}>5 € de bon d'achat</span> chez lui 🎁</> },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: syne }}>{s.n}</div>
              <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 20px" }}>

      {/* Total banner */}
      <div style={{ background: "#FF5733", borderRadius: 16, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{totalShop} <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>XP Shop</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>total accumulé</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 }}>
            100 XP Shop<br /><span style={{ color: "#fff", fontWeight: 600 }}>= 5 € de bon d'achat</span>
          </div>
        </div>
      </div>

      {/* Section : bons disponibles */}
      {disponibles.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.pro, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            🎁 Bons disponibles · {disponibles.length}
          </div>
          {disponibles.map(w => {
            const pts = w.points || 0;
            const bons = Math.floor(pts / 100);
            const reste = pts % 100;
            const merchant = w.profiles?.pseudo || "Commerce";
            const avatar = w.profiles?.avatar_url;
            return (
              <div key={w.id} style={{ background: C.card, borderRadius: 18, border: `2px solid ${C.pro}`, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ background: C.proBg, padding: "8px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.pro, textTransform: "uppercase", letterSpacing: 0.5 }}>✅ BON D'ACHAT DISPONIBLE</span>
                  <span style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: C.pro }}>{bons * 5} €</span>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                      {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
                    </div>
                    <div>
                      <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink }}>{merchant}</div>
                      <div style={{ fontSize: 11, color: C.ink2 }}>{pts} XP Shop accumulés</div>
                    </div>
                  </div>
                  {/* Barre de progression */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ height: 8, background: C.pill, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, reste)}%`, background: `linear-gradient(90deg, ${C.pro}, #22c55e)`, borderRadius: 8, transition: "width 0.8s ease" }} />
                    </div>
                    {reste > 0 && (
                      <div style={{ fontSize: 10, color: C.ink2, marginTop: 4 }}>+ encore {100 - reste} XP pour un {bons + 1}e bon de 5€</div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.ink2, background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                    💡 Montre ce bon au caissier pour l'utiliser chez <b>{merchant}</b>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ height: 8 }} />
        </>
      )}

      {/* Section : en cours */}
      {enCours.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            ⚡ En cours · {enCours.length}
          </div>
          {enCours.map(w => {
            const pts = w.points || 0;
            const pct = Math.round((pts / 100) * 100);
            const reste = 100 - pts;
            const merchant = w.profiles?.pseudo || "Commerce";
            const avatar = w.profiles?.avatar_url;
            return (
              <div key={w.id} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: C.shopBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                    {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: syne, fontSize: 14, fontWeight: 700, color: C.ink }}>{merchant}</div>
                    <div style={{ fontSize: 11, color: C.ink2 }}>{pts} / 100 XP Shop</div>
                  </div>
                  <div style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: C.accent }}>{pts}<span style={{ fontSize: 10, fontWeight: 500, opacity: 0.75 }}> XP</span></div>
                </div>
                {/* Barre de progression */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ height: 10, background: C.pill, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, borderRadius: 10, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>Plus que {reste} XP pour débloquer 5€ 🎁</div>
                    <div style={{ fontSize: 10, color: C.ink2 }}>{pct}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── Section : mes photos liées à un commerce ── */}
      {linkedPosts.length > 0 && (
        <>
          <div style={{ height: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            📸 Mes photos liées · {linkedPosts.length}
          </div>
          {linkedPosts.map(p => {
            const isPending  = p.linked_status === "pending";
            const isAccepted = p.linked_status === "accepted";
            const statusColor = isAccepted ? C.pro : isPending ? "#B45309" : C.ink2;
            const statusBg    = isAccepted ? C.proBg : isPending ? "#FFF8E8" : C.pill;
            const statusLabel = isAccepted ? "✅ Accepté · +10 XP Shop" : isPending ? "⏳ En attente" : "—";
            return (
              <div key={p.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 10, padding: 10, overflow: "hidden" }}>
                {/* Miniature */}
                {p.image_url
                  ? <img src={p.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📷</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: syne, fontSize: 12, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🏪 {p.magasin_nom || "Commerce"}
                  </div>
                  {p.content && (
                    <div style={{ fontSize: 11, color: C.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                      {p.content}
                    </div>
                  )}
                  <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4, background: statusBg, borderRadius: 8, padding: "3px 8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* CTA */}
      <button onClick={() => setPage("nouveau")}
        style={{ width: "100%", padding: "12px 0", background: "#FF5733", color: "#fff", fontFamily: dm, fontWeight: 600, fontSize: 13, border: "none", borderRadius: 14, cursor: "pointer", marginTop: 8 }}>
        📸 Gagner plus de XP Shop
      </button>
    </div>
  );
}

// ─── TAB 2 : BONS PLANS DU QUARTIER ────────────────────────────
function BonsPlans({ setPage }) {
  const [screen, setScreen] = useState("list");
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [remises, setRemises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemises();
  }, []);

  async function loadRemises() {
    setLoading(true);
    const { data, error } = await supabase
      .from("remises")
      .select("*, profiles:user_id(pseudo, avatar_url, categorie)")
      .eq("ended", false)
      .order("created_at", { ascending: false });

    if (error) { console.error("remises:", error); setLoading(false); return; }

    const now = new Date();
    const enriched = (data || []).map(r => ({
      ...r,
      merchant_name: r.profiles?.pseudo || "Commerce",
      merchant_avatar: r.profiles?.avatar_url || null,
      isExpired: r.expires_at && new Date(r.expires_at) < now,
    }));

    setRemises(enriched);
    setLoading(false);
  }

  const filters = [
    { id: "tous",      label: "Toutes" },
    { id: "interesse", label: "Ciblées" },
    { id: "all",       label: "Pour tous" },
  ];

  const dispo = remises.filter(r => !r.isExpired && (filter === "tous" || r.ciblage === filter));
  const expirees = remises.filter(r => r.isExpired);

  if (screen === "detail" && selectedItem) {
    return <DetailScreen item={selectedItem} onBack={() => setScreen("list")} />;
  }

  return (
    <>
      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", overflowX: "auto", flexShrink: 0, background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: filter === f.id ? C.ink : C.pill, color: filter === f.id ? "#fff" : C.ink2, fontFamily: dm }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 12px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: C.ink2, fontSize: 13 }}>⏳ Chargement…</div>
        )}

        {!loading && dispo.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 6 }}>Aucun bon plan pour l'instant</div>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>Les commerçants du quartier publieront bientôt leurs offres ici.</div>
          </div>
        )}

        {!loading && dispo.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "0 0 8px" }}>
            Disponibles · {dispo.length}
          </div>
          {dispo.map(r => {
            const amount = formatAmount(r.valeur, r.type_remise);
            const expiry = formatExpiry(r.expires_at);
            return (
              <div key={r.id} onClick={() => { setSelectedItem(r); setScreen("detail"); }}
                style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 8px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, overflow: "hidden" }}>
                    {r.merchant_avatar
                      ? <img src={r.merchant_avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                      : "🏪"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, marginBottom: 3, background: r.ciblage === "interesse" ? "#E8F4FD" : C.proBg, color: r.ciblage === "interesse" ? "#1565C0" : C.pro }}>
                      {r.ciblage === "interesse" ? "Ciblée" : "Pour tous"}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{r.merchant_name}</div>
                    <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{r.title}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <div style={{ fontFamily: syne, fontSize: 26, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{amount}</div>
                    {expiry && <div style={{ fontSize: 9, color: C.ink2, marginTop: 3 }}>{expiry}</div>}
                  </div>
                </div>
                {r.conditions && (
                  <div style={{ fontSize: 11, color: C.ink2, padding: "0 12px 8px", lineHeight: 1.4 }}>{r.conditions}</div>
                )}
                <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
                  <button onClick={e => { e.stopPropagation(); setSelectedItem(r); setScreen("detail"); }}
                    style={{ flex: 1, padding: 9, borderRadius: 12, fontSize: 12, fontWeight: 600, fontFamily: dm, border: "none", cursor: "pointer", background: C.accent, color: "#fff" }}>
                    Voir le code
                  </button>
                </div>
              </div>
            );
          })}
        </>}

        {!loading && expirees.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, padding: "8px 0" }}>
              Expirées · {expirees.length}
            </div>
            {expirees.map(r => (
              <div key={r.id} style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, opacity: 0.45 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.merchant_name}</div>
                    <div style={{ fontSize: 11, color: C.ink2 }}>{r.title}</div>
                  </div>
                  <div style={{ fontFamily: syne, fontSize: 22, fontWeight: 700, color: C.ink2 }}>{formatAmount(r.valeur, r.type_remise)}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
export default function MesReductions({ setPage, user }) {
  const [tab, setTab] = useState("xpshop");

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={() => setPage("profil")} style={{ background: C.pill, border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, margin: 0 }}>Mes réductions</h1>
          <p style={{ fontSize: 10, color: C.ink2, margin: 0 }}>XP Shop & bons plans du quartier</p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button
          onClick={() => setTab("xpshop")}
          style={{
            flex: 1, padding: "12px 0", fontSize: 13, fontWeight: 700, fontFamily: syne,
            border: "none", background: "none", cursor: "pointer",
            color: tab === "xpshop" ? C.accent : C.ink2,
            borderBottom: tab === "xpshop" ? `2.5px solid ${C.accent}` : "2.5px solid transparent",
            transition: "color 0.2s"
          }}
        >
          🏪 Mes XP Shop
        </button>
        <button
          onClick={() => setTab("bonsplans")}
          style={{
            flex: 1, padding: "12px 0", fontSize: 13, fontWeight: 700, fontFamily: syne,
            border: "none", background: "none", cursor: "pointer",
            color: tab === "bonsplans" ? C.accent : C.ink2,
            borderBottom: tab === "bonsplans" ? `2.5px solid ${C.accent}` : "2.5px solid transparent",
            transition: "color 0.2s"
          }}
        >
          🏷️ Bons plans
        </button>
      </div>

      {/* Contenu des onglets */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "xpshop"    && <MesXPShop user={user} setPage={setPage} />}
        {tab === "bonsplans" && <BonsPlans setPage={setPage} />}
      </div>

      <BottomNav active="profil" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
