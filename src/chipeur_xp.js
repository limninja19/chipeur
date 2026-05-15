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

// ─── AJOUTER DES XP NORMAL (gloire, niveaux, classement) ─────────
export async function addXP(userId, amount, reason) {
  if (!userId || !amount || amount <= 0) return;
  try {
    // 1. XP total (RPC sécurisé côté serveur)
    const { error } = await supabase.rpc("increment_xp", {
      p_user_id: userId,
      p_amount:  amount,
      p_reason:  reason,
    });
    if (error) console.error("addXP RPC error:", error);

    // 2. XP du mois (reset automatique si nouveau mois)
    const currentMonth = new Date().toISOString().slice(0, 7); // ex: "2026-05"
    const { data: prof } = await supabase
      .from("profiles")
      .select("xp_month, xp_month_label")
      .eq("id", userId)
      .maybeSingle();
    const sameMonth = prof?.xp_month_label === currentMonth;
    await supabase.from("profiles").update({
      xp_month:       sameMonth ? (prof.xp_month || 0) + amount : amount,
      xp_month_label: currentMonth,
    }).eq("id", userId);
  } catch (e) {
    console.error("addXP error:", e);
  }
}

// ─── AJOUTER DES XP SHOP (valeur marchande, liés à un commerce) ──
// Utilise un RPC SECURITY DEFINER pour contourner les politiques RLS
// (le commerçant ne peut pas modifier directement le profil d'un voisin)
export async function addXPShop(userId, merchantId, amount) {
  if (!userId || !merchantId || !amount || amount <= 0) return;
  try {
    const { error } = await supabase.rpc("increment_xp_shop", {
      p_user_id:     userId,
      p_merchant_id: merchantId,
      p_amount:      amount,
    });
    if (error) console.error("addXPShop RPC error:", error);
  } catch (e) {
    console.error("addXPShop error:", e);
  }
}

// ─── RETIRER DES XP SHOP (suppression de post accepté) ──────────
export async function removeXPShop(userId, merchantId, amount) {
  if (!userId || !merchantId || !amount || amount <= 0) return;
  try {
    const { error } = await supabase.rpc("decrement_xp_shop", {
      p_user_id:     userId,
      p_merchant_id: merchantId,
      p_amount:      amount,
    });
    if (error) console.error("removeXPShop RPC error:", error);
  } catch (e) {
    console.error("removeXPShop error:", e);
  }
}

// ─── RETIRER DES XP GLOIRE (suppression de post) ─────────────────
export async function removeXP(userId, amount) {
  if (!userId || !amount || amount <= 0) return;
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("xp, xp_month")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) return;
    await supabase.from("profiles").update({
      xp:       Math.max(0, (prof.xp || 0) - amount),
      xp_month: Math.max(0, (prof.xp_month || 0) - amount),
    }).eq("id", userId);
  } catch (e) {
    console.error("removeXP error:", e);
  }
}

// ─── CONNEXION QUOTIDIENNE (streak) ──────────────────────────────
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

  // Ajoute les XP normaux
  await addXP(userId, xpGain, `connexion_streak_${newStreak}`);

  return { xpGain, streak: newStreak };
}
