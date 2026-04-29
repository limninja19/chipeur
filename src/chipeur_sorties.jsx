import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};


// ─── STATUS BAR ───
function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
      <span>9:41</span><span>●●●</span>
    </div>
  );
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
          fontFamily: "'DM Sans', sans-serif",
        }}>{f}</button>
      ))}
    </div>
  );
}

// ─── DAY LABEL ───
function DayLabel({ label, isToday }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.ink, padding: "10px 0 6px",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {label}
      {isToday && (
        <span style={{
          fontSize: 9, fontWeight: 700, background: C.accent, color: "#fff",
          padding: "2px 8px", borderRadius: 8,
        }}>Maintenant</span>
      )}
    </div>
  );
}

// ─── GOING BUTTON ───
function GoingBtn({ defaultGoing }) {
  const [going, setGoing] = useState(defaultGoing || false);
  return (
    <button onClick={(e) => { e.stopPropagation(); setGoing(!going); }} style={{
      padding: "7px 14px", borderRadius: 12, fontSize: 11, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer",
      whiteSpace: "nowrap", transition: "all 0.2s",
      background: going ? C.proBg : C.accent,
      color: going ? C.pro : "#fff",
    }}>{going ? "✓ J'y vais !" : "J'y vais ?"}</button>
  );
}

// ─── AVATAR ROW ───
function AvatarRow({ avatars }) {
  return (
    <div style={{ display: "flex", marginRight: 2 }}>
      {avatars.map((a, i) => (
        <div key={i} style={{
          width: 22, height: 22, borderRadius: "50%", background: C.pill,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, border: `2px solid ${C.card}`, marginLeft: i === 0 ? 0 : -6,
        }}>{a}</div>
      ))}
    </div>
  );
}

// ─── SORTIE CARD ───
function SortieCard({ data }) {
  const typeStyles = {
    "Vide-grenier": { bg: "#FFF3E0", color: "#C2410C", cls: "pill-vg" },
    "Marché": { bg: "#EBF5F0", color: "#065F46", cls: "pill-marche" },
    "Fête": { bg: "#F3E8FF", color: "#6B21A8", cls: "pill-fete" },
    "Concert": { bg: "#EFF6FF", color: "#1E40AF", cls: "pill-concert" },
    "Sport": { bg: "#F0FDF4", color: "#166534", cls: "pill-sport" },
  };
  const ts = typeStyles[data.type] || typeStyles["Fête"];

  return (
    <div style={{
      background: data.featured ? "#FFFDF9" : C.card,
      borderRadius: 18,
      border: data.featured ? `2px solid ${C.accent2}` : `1px solid ${C.border}`,
      marginBottom: 10, overflow: "hidden", cursor: "pointer",
    }}>
      {/* Top row: date + info */}
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{
          width: 52, flexShrink: 0, background: data.dateColor,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "12px 6px",
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{data.day}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{data.month}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px" }}>
          <span style={{
            display: "inline-block", fontSize: 9, fontWeight: 700,
            padding: "2px 8px", borderRadius: 8, marginBottom: 4,
            background: ts.bg, color: ts.color,
          }}>{data.type}</span>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 3 }}>{data.title}</div>
          <div style={{ fontSize: 11, color: C.ink2, display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 11 }}>📍</span>{data.location}
          </div>
        </div>
      </div>

      {/* Author */}
      {data.author && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 0" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{data.author.avatar}</div>
          <div style={{ fontSize: 10, color: C.ink2 }}>{data.author.text}</div>
        </div>
      )}

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: data.author ? "6px 12px 10px" : "6px 12px 10px" }}>
        {data.tags.map(t => (
          <span key={t} style={{ fontSize: 10, background: C.pill, color: C.ink2, padding: "3px 8px", borderRadius: 10 }}>{t}</span>
        ))}
      </div>

      {/* Bottom: avatars + going count + button */}
      <div style={{
        padding: "8px 12px 10px", borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <AvatarRow avatars={data.avatars} />
        <div style={{ fontSize: 11, color: C.ink2, flex: 1 }}>
          <b style={{ color: C.ink }}>{data.goingCount} voisins</b> y vont
        </div>
        <GoingBtn defaultGoing={data.defaultGoing} />
      </div>
    </div>
  );
}

// ─── FAB MENU OVERLAY ───
function FabMenu({ open, onClose, setPage }) {
  if (!open) return null;
  const items = [
    { icon: "📸", label: "Nouveau post", page: "nouveau" },
    { icon: "📅", label: "Nouvelle sortie", page: "nouveau" },
    { icon: "🏆", label: "Créer un défi", page: "defis", pro: true },
  ];
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(26,23,20,0.4)", display: "flex",
      flexDirection: "column", justifyContent: "flex-end", padding: "0 0 90px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        display: "flex", flexDirection: "column", gap: 6,
        alignItems: "center", padding: "0 60px 12px",
      }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => { onClose(); setPage(item.page); }} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            background: C.card, border: "none", borderRadius: 14,
            padding: "12px 16px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{item.label}</span>
            {item.pro && (
              <span style={{ fontSize: 8, fontWeight: 700, background: C.proBg, color: C.pro, padding: "2px 6px", borderRadius: 6, marginLeft: "auto" }}>PRO</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───
function BottomNav({ active, onNavigate, onFab }) {
  const items = [
    { id: "fil", icon: "🏠", label: "Fil" },
    { id: "sorties", icon: "📅", label: "Sorties" },
    { id: "fab", isFab: true },
    { id: "commerces", icon: "🏪", label: "Commerces" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];
  return (
    <div style={{
      height: 80, background: C.card, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0,
    }}>
      {items.map(item => {
        if (item.isFab) {
          return (
            <div key="fab" onClick={onFab} style={{
              width: 50, height: 50, borderRadius: 25, background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#fff", marginTop: -20, flexShrink: 0, cursor: "pointer",
            }}>+</div>
          );
        }
        const isActive = active === item.id;
        return (
         <div key={item.id} onClick={() => onNavigate(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, fontSize: 9, color: isActive ? C.accent : C.ink2, cursor: "pointer",
          }}>
            <div style={{ fontSize: 18 }}>{item.icon}</div>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── DATA ───
const sorties = [
  {
    day: "26", month: "Avr.", dateColor: C.accent, type: "Vide-grenier",
    title: "Grand Vide-Grenier de la Plaine", location: "Place Jean Jaurès · 9h – 18h",
    author: { avatar: "😊", text: "Partagé par Camille R. · il y a 1h" },
    tags: ["Brocante", "Vêtements", "Gratuit"],
    avatars: ["😊", "🌸", "✨"], goingCount: 14, defaultGoing: true, featured: true,
    group: "today",
  },
  {
    day: "26", month: "Avr.", dateColor: "#0F766E", type: "Marché",
    title: "Marché Bio du Cours Julien", location: "Cours Julien · 8h – 13h",
    author: null,
    tags: ["Bio", "Local", "Hebdomadaire"],
    avatars: ["🌸", "🎨"], goingCount: 6, defaultGoing: false, featured: false,
    group: "today",
  },
  {
    day: "27", month: "Avr.", dateColor: "#7C3AED", type: "Concert",
    title: "Jazz en Plein Air — Noailles", location: "Place des Capucines · 19h – 22h",
    author: null,
    tags: ["Jazz", "Gratuit", "Plein air"],
    avatars: ["✨"], goingCount: 3, defaultGoing: false, featured: false,
    group: "demain",
  },
  {
    day: "14", month: "Juil.", dateColor: "#1D4ED8", type: "Fête",
    title: "Bal & Feu d'Artifice du Vieux-Port", location: "Vieux-Port · 21h30 – minuit",
    author: { avatar: "🎨", text: "Partagé par Lucas M. · il y a 3j" },
    tags: ["Feu d'artifice", "Bal", "Gratuit"],
    avatars: ["😊", "🌸", "✨", "🎨"], goingCount: 42, defaultGoing: false, featured: false,
    group: "juillet",
  },
];

const DATE_COLORS = ["#FF5733","#0F766E","#7C3AED","#185FA5","#B45309","#0A3D2E"];

function RealSortieCard({ s, idx }) {
  const col = DATE_COLORS[idx % DATE_COLORS.length];
  const d = s.date_text ? new Date(s.date_text.split("/").reverse().join("-")) : null;
  const day = d && !isNaN(d) ? d.getDate() : "—";
  const month = d && !isNaN(d) ? d.toLocaleDateString("fr-FR", { month: "short" }) : "";
  const typeStyles = {
    "Vide-grenier": { bg: "#FFF3E0", color: "#C2410C" },
    "Marché": { bg: "#EBF5F0", color: "#065F46" },
    "Fête": { bg: "#F3E8FF", color: "#6B21A8" },
    "Concert": { bg: "#EFF6FF", color: "#1E40AF" },
    "Sport": { bg: "#F0FDF4", color: "#166534" },
  };
  const ts = typeStyles[s.type] || { bg: C.pill, color: C.ink2 };
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: 52, flexShrink: 0, background: col, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 6px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{month}</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px" }}>
          <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 8, marginBottom: 4, background: ts.bg, color: ts.color }}>{s.type || "Événement"}</span>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 3 }}>{s.title}</div>
          {s.lieu && <div style={{ fontSize: 11, color: C.ink2 }}>📍 {s.lieu} {s.time_text ? `· ${s.time_text}` : ""}</div>}
          {s.description && <div style={{ fontSize: 11, color: C.ink2, marginTop: 4, lineHeight: 1.4 }}>{s.description}</div>}
        </div>
      </div>
      <div style={{ padding: "8px 12px 10px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: C.ink2 }}>📍 {s.ville || "Saint-Dié"}</div>
        <GoingBtn />
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurSorties({ setPage }) {
  const [filter, setFilter] = useState("Tous");
  const [fabOpen, setFabOpen] = useState(false);
  const [realSorties, setRealSorties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sorties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setRealSorties(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "Tous" ? realSorties
    : realSorties.filter(s => s.type === filter);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
        <div style={{ padding: "8px 16px 4px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPage("fil")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>←</button>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, margin: 0 }}>Sorties</h1>
          </div>
          <p style={{ fontSize: 11, color: C.ink2, marginTop: 1, marginLeft: 34 }}>Événements dans ton quartier</p>
        </div>

        <Filters active={filter} onSelect={setFilter} />

        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.ink2 }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>Aucune sortie pour l'instant</div>
              <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16 }}>Sois le premier à partager un événement !</div>
              <button onClick={() => setPage("nouveau")} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Ajouter une sortie</button>
            </div>
          ) : (
            filtered.map((s, i) => <RealSortieCard key={s.id} s={s} idx={i} />)
          )}
        </div>

        <FabMenu open={fabOpen} onClose={() => setFabOpen(false)} setPage={setPage} />
        <BottomNav active="sorties" onNavigate={setPage} onFab={() => setPage("nouveau")} />
    </div>
  );
}
