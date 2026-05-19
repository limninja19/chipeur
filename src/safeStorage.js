// ── safeStorage — stockage sécurisé à 3 niveaux ──
// localStorage → sessionStorage → mémoire
// Évite les SecurityError iOS sur PWA, iMessage, navigation privée

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

const _lsOk = testStorage(window.localStorage);
const _ssOk = !_lsOk && testStorage(window.sessionStorage);

function pick() {
  if (_lsOk) return window.localStorage;
  if (_ssOk) return window.sessionStorage;
  return null;
}

const safeStorage = {
  getItem(key, fallback = null) {
    const s = pick();
    if (s) { try { return s.getItem(key) ?? fallback; } catch (_) {} }
    return _mem[key] ?? fallback;
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

export default safeStorage;
