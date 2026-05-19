import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Storage à 3 niveaux pour iOS PWA / iMessage / navigation privée ──
// Certains iPhones bloquent localStorage même en PWA installée (réglages confidentialité).
// Ordre de préférence : localStorage → sessionStorage → mémoire (in-memory)
// La session persiste tant que l'app est ouverte ; sur localStorage dispo = reste connecté.

const _mem = {};

function testStorage(storage) {
  try {
    const k = "__chipeur_ok__";
    storage.setItem(k, "1");
    storage.removeItem(k);
    return true;
  } catch (_) {
    return false;
  }
}

// Testé une seule fois au démarrage
const _lsOk = testStorage(window.localStorage);
const _ssOk = !_lsOk && testStorage(window.sessionStorage);

function pick() {
  if (_lsOk) return window.localStorage;
  if (_ssOk) return window.sessionStorage;
  return null;
}

const safeStorage = {
  getItem(key) {
    const s = pick();
    if (s) { try { return s.getItem(key); } catch (_) {} }
    return _mem[key] ?? null;
  },
  setItem(key, value) {
    const s = pick();
    if (s) { try { s.setItem(key, value); return; } catch (_) {} }
    _mem[key] = value;
  },
  removeItem(key) {
    const s = pick();
    if (s) { try { s.removeItem(key); } catch (_) {} }
    delete _mem[key];
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
