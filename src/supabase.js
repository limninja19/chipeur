import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Storage sécurisé pour iOS WebView / navigation privée
// localStorage peut throw un SecurityError dans ces contextes
const safeStorage = {
  getItem(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  },
  removeItem(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
