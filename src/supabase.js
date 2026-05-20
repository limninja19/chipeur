import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Storage à 3 niveaux pour iOS PWA / iMessage / navigation privée ──
// Certains iPhones bloquent localStorage même en PWA installée (réglages confidentialité).
// Sur iOS restreint, accéder à window.localStorage lève un SecurityError
// même avant d'entrer dans un try/catch — d'où ce pattern global.
// Ordre de préférence : localStorage → sessionStorage → mémoire (in-memory)
// La session persiste tant que l'app est ouverte ; sur localStorage dispo = reste connecté.

const _mem = {};

let _store = null;

try {
  window.localStorage.setItem("__chipeur_ok__", "1");
  window.localStorage.removeItem("__chipeur_ok__");
  _store = window.localStorage;
} catch (_) {}

if (!_store) {
  try {
    window.sessionStorage.setItem("__chipeur_ok__", "1");
    window.sessionStorage.removeItem("__chipeur_ok__");
    _store = window.sessionStorage;
  } catch (_) {}
}

const safeStorage = {
  getItem(key) {
    if (_store) {
      try { return _store.getItem(key); } catch (_) {}
    }
    return _mem[key] ?? null;
  },
  setItem(key, value) {
    if (_store) {
      try { _store.setItem(key, value); return; } catch (_) {}
    }
    _mem[key] = value;
  },
  removeItem(key) {
    if (_store) {
      try { _store.removeItem(key); } catch (_) {}
    }
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