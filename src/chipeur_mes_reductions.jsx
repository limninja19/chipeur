import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
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
  const expiry = formatExpiry(item.expires_at);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} style={{ background: C.pill, border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>←</button>
        <span style={{ fontFamily: syne, fontSize: 15, fontWeight: 700, color: C.ink }}>Ma réduction</span>
      </div>

      {/* Bannière */}
      <div style={{ background: C.proBg, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏪</div>
        <div style={{ fontFamily: syne, fontSize: 17, fontWeight: 700, color: C.pro }}>{item.merchant_name || "Commerce"}</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 3 }}>{item.title}</div>
        <div style={{ fontFamily: syne, fontSize: 32, fontWeight: 800, color: C.accent, marginTop: 8 }}>{amount}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {/* Code promo */}
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

        {/* Infos */}
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

// ─── PAGE PRINCIPALE ───────────────────────────────────────────
export default function MesReductions({ setPage, user }) {
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
    // Charge toutes les remises actives + le profil du commerçant
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

  const dispo = remises.filter(r =>
    !r.isExpired && (filter === "tous" || r.ciblage === filter)
  );
  const expirees = remises.filter(r => r.isExpired);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bg, overflow: "hidden", fontFamily: dm, color: C.ink, display: "flex", flexDirection: "column" }}>

      {screen === "list" && <>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
          <button onClick={() => setPage("profil")} style={{ background: C.pill, border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: syne, fontSize: 18, fontWeight: 700, margin: 0 }}>Bons plans</h1>
            <p style={{ fontSize: 10, color: C.ink2, margin: 0 }}>Offres des commerces du quartier</p>
          </div>
        </div>

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
            <div style={{ textAlign: "center", padding: "50px 20px", color: C.ink2, fontSize: 13 }}>
              ⏳ Chargement…
            </div>
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
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
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
      </>}

      {screen === "detail" && selectedItem &&
        <DetailScreen item={selectedItem} onBack={() => setScreen("list")} />
      }

      <BottomNav active="profil" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
