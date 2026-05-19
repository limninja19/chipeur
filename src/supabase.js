import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Storage sécurisé pour iOS WebView / navigation privée / iMessage ──
// localStorage peut throw un SecurityError avant même le try/catch sur certains iOS.
// On détecte la disponibilité une fois, puis on bascule sur un store en mémoire.
const _mem = {};
let _lsOk = null;
function lsAvailable() {
  if (_lsOk !== null) return _lsOk;
  try {
    localStorage.setItem("__sb_test__", "1");
    localStorage.removeItem("__sb_test__");
    _lsOk = true;
  } catch (_) {
    _lsOk = false;
  }
  return _lsOk;
}

const safeStorage = {
  getItem(key) {
    if (!lsAvailable()) return _mem[key] ?? null;
    try { return localStorage.getItem(key); } catch (_) { return _mem[key] ?? null; }
  },
  setItem(key, value) {
    if (!lsAvailable()) { _mem[key] = value; return; }
    try { localStorage.setItem(key, value); } catch (_) { _mem[key] = value; }
  },
  removeItem(key) {
    if (!lsAvailable()) { delete _mem[key]; return; }
    try { localStorage.removeItem(key); } catch (_) { delete _mem[key]; }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
