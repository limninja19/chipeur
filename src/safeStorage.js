// ── safeStorage — localStorage sécurisé pour iOS WebView / navigation privée ──
// localStorage peut throw un SecurityError dans certains contextes iOS.
// Ce wrapper silencieux évite tout crash.

const safeStorage = {
  getItem(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  },
  removeItem(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  },
};

export default safeStorage;
