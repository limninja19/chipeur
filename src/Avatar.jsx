// ─── AVATAR CHIPEUR ─────────────────────────────────────────────
// Usage : <Avatar pseudo="jenny88" avatarUrl={url} size={34} />
// Si pas d'avatarUrl → initiale + couleur déterministe

const PALETTE = [
  ["#FF5733", "#fff"],
  ["#0A3D2E", "#fff"],
  ["#F7A72D", "#fff"],
  ["#7C3AED", "#fff"],
  ["#0369A1", "#fff"],
  ["#BE185D", "#fff"],
  ["#B45309", "#fff"],
  ["#0F766E", "#fff"],
  ["#1D4ED8", "#fff"],
  ["#DC2626", "#fff"],
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xfffffff;
  }
  return h;
}

export default function Avatar({ pseudo, avatarUrl, size = 34, style = {} }) {
  const initial = (pseudo || "?").trim().charAt(0).toUpperCase();
  const [bg, fg] = PALETTE[hashStr(pseudo) % PALETTE.length];

  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Math.round(size * 0.42),
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    background: bg,
    color: fg,
    ...style,
  };

  if (avatarUrl) {
    return (
      <div style={{ ...base, background: "transparent" }}>
        <img
          src={avatarUrl}
          alt={pseudo}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
        />
      </div>
    );
  }

  return <div style={base}>{initial}</div>;
}
