// ── safeStorage — localStorage sécurisé pour iOS WebView / navigation privée ──
// Sur iOS iMessage / WKWebView, localStorage peut throw un SecurityError
// AVANT même que le try/catch puisse l'intercepter.
// Solution : détecter la disponibilité une seule fois au démarrage,
// puis utiliser un stockage en mémoire comme fallback.

const memoryStore = {};

let _localStorageAvailable = null;
function isLocalStorageAvailable() {
  if (_localStorageAvailable !== null) return _localStorageAvailable;
  try {
    const key = "__chipeur_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    _localStorageAvailable = true;
  } catch (_) {
    _localStorageAvailable = false;
  }
  return _localStorageAvailable;
}

const safeStorage = {
  getItem(key, fallback = null) {
    if (!isLocalStorageAvailable()) return memoryStore[key] ?? fallback;
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return memoryStore[key] ?? fallback; }
  },
  setItem(key, value) {
    if (!isLocalStorageAvailable()) { memoryStore[key] = value; return; }
    try { localStorage.setItem(key, value); } catch (_) { memoryStore[key] = value; }
  },
  removeItem(key) {
    if (!isLocalStorageAvailable()) { delete memoryStore[key]; return; }
    try { localStorage.removeItem(key); } catch (_) { delete memoryStore[key]; }
  },
};

export default safeStorage;
