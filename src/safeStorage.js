// ── safeStorage — stockage sécurisé à 3 niveaux ──
// localStorage → sessionStorage → mémoire
// Évite les SecurityError iOS sur PWA, iMessage, navigation privée

const _mem = {};

let _store = null;

// On entoure l'accès à window.localStorage dans un try/catch global
// car sur iOS restreint, même lire la propriété lève un SecurityError
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
  getItem(key, fallback = null) {
    if (_store) {
      try { return _store.getItem(key) ?? fallback; } catch (_) {}
    }
    return _mem[key] ?? fallback;
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

export default safeStorage;
