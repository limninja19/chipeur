import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Force la mise à jour du service worker pour tous les utilisateurs ──────
// Change APP_VERSION à chaque fois que tu veux forcer un rechargement global
const APP_VERSION = "2026-05-15-v4";

if ("serviceWorker" in navigator) {
  // On mémorise s'il y avait déjà un SW actif AVANT ce chargement.
  // Si non (première visite), on ne recharge pas quand il s'installe
  // pour la première fois → évite la page blanche/noire sur iPhone.
  const hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.ready.then(reg => {
    // Demander au service worker en attente de s'activer immédiatement
    if (reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    // Vérifier s'il y a une nouvelle version disponible
    reg.update();
  }).catch(() => {});

  // Quand le service worker change (nouvelle version activée) → recharger la page
  // Mais uniquement si ce n'est pas la première installation (hadController)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!window.__reloading && hadController) {
      window.__reloading = true;
      window.location.reload();
    }
  });
}

// ── Version check : force un rechargement dur si la version a changé ────────
try {
  const stored = localStorage.getItem("_chipeur_ver");
  if (stored && stored !== APP_VERSION) {
    localStorage.setItem("_chipeur_ver", APP_VERSION);
    // Désinscrire les anciens service workers puis recharger
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        Promise.all(regs.map(r => r.unregister())).then(() => {
          window.location.reload(true);
        });
      });
    } else {
      window.location.reload(true);
    }
  } else {
    localStorage.setItem("_chipeur_ver", APP_VERSION);
  }
} catch (e) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
