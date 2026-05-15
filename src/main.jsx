import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Service Worker — mise à jour avec bannière ────────────────────
// Pas de reload automatique : on affiche une bannière et l'utilisateur
// choisit quand mettre à jour. Aucun risque d'écran blanc/noir.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then(reg => {
    // Vérifier s'il y a une nouvelle version disponible en arrière-plan
    reg.update();

    // Si un SW est déjà en attente au moment du chargement → bannière
    if (reg.waiting) {
      showUpdateBanner(reg.waiting);
    }

    // Écouter les nouvelles installations
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        // Nouvelle version prête ET ancienne version toujours active → bannière
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner(newWorker);
        }
      });
    });
  }).catch(() => {});
}

function showUpdateBanner(worker) {
  // Éviter les doublons
  if (document.getElementById("_chipeur_update_banner")) return;

  const banner = document.createElement("div");
  banner.id = "_chipeur_update_banner";
  banner.style.cssText = [
    "position:fixed",
    "bottom:80px",
    "left:50%",
    "transform:translateX(-50%)",
    "background:#1A1714",
    "color:#fff",
    "padding:12px 16px",
    "border-radius:14px",
    "display:flex",
    "align-items:center",
    "gap:12px",
    "z-index:9999",
    "box-shadow:0 4px 20px rgba(0,0,0,0.35)",
    "font-family:system-ui,sans-serif",
    "font-size:13px",
    "white-space:nowrap",
    "max-width:90vw",
  ].join(";");

  banner.innerHTML = `
    <span>🔄 Nouvelle version disponible</span>
    <button id="_chipeur_update_btn" style="background:#FF5733;color:#fff;border:none;padding:7px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">
      Mettre à jour
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById("_chipeur_update_btn").addEventListener("click", () => {
    banner.remove();
    worker.postMessage({ type: "SKIP_WAITING" });
    // Recharger une seule fois quand le nouveau SW prend le contrôle
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!window.__reloading) {
        window.__reloading = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
