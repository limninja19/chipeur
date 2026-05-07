import { supabase } from "./supabase";

// ─── NIVEAUX & TITRES ────────────────────────────────────────────
export const LEVELS = [
  { level: 1, xpMin: 0,    title: "Nouveau voisin",       emoji: "🌱" },
  { level: 2, xpMin: 100,  title: "Voisin curieux",       emoji: "👀" },
  { level: 3, xpMin: 300,  title: "Habitué du quartier",  emoji: "☕" },
  { level: 4, xpMin: 600,  title: "Pilier du quartier",   emoji: "🏘️" },
  { level: 5, xpMin: 1000, title: "Ambassadeur local",    emoji: "⭐" },
  { level: 6, xpMin: 2000, title: "Légende de Saint-Dié", emoji: "🏆" },
];

// ─── HELPERS NIVEAU ──────────────────────────────────────────────
export function getLevel(xp = 0) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpMin) current = l;
    else break;
  }
  return current;
}

export function getNextLevel(xp = 0) {
  const lvl = getLevel(xp);
  return LEVELS.find(l => l.level === lvl.level + 1) || null;
}

export function getLevelProgress(xp = 0) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  return Math.min(100, Math.round(((xp - current.xpMin) / (next.xpMin - current.xpMin)) * 100));
}

// ─── AJOUTER DES XP (via fonction sécurisée côté serveur) ────────
// Le calcul et la validation sont faits en Postgres SECURITY DEFINER
// → impossible à exploiter depuis le client ou les DevTools
export async function addXP(userId, amount, reason) {
  if (!userId || !amount || amount <= 0) return;
  try {
    const { error } = await supabase.rpc("increment_xp", {
      p_user_id: userId,
      p_amount:  amount,
      p_reason:  reason,
    });
    if (error) console.error("addXP RPC error:", error);
  } catch (e) {
    console.error("addXP error:", e);
  }
}

// ─── CONNEXION QUOTIDIENNE ───────────────────────────────────────
export async function checkDailyLogin(userId, profile) {
  if (!userId || !profile) return;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (profile.last_login_date === today) return; // Déjà comptabilisé aujourd'hui

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Calcul du streak
  const wasYesterday = profile.last_login_date === yesterdayStr;
  const newStreak = wasYesterday ? (profile.login_streak || 0) + 1 : 1;

  // XP selon streak : J1=1, J2=2, J3+=5
  const xpGain = newStreak === 1 ? 1 : newStreak === 2 ? 2 : 5;

  // Mise à jour streak + date
  await supabase.from("profiles").update({
    last_login_date: today,
    login_streak: newStreak,
  }).eq("id", userId);

  // Ajoute les XP
  await addXP(userId, xpGain, `connexion_streak_${newStreak}`);

  return { xpGain, streak: newStreak };
}
