import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── ErrorBoundary — transforme l'écran blanc en message lisible ───
// Indispensable sur iOS Safari qui ne montre rien en cas d'erreur JS
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 400, margin: "40px auto" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1714", marginBottom: 8 }}>
            Une erreur s'est produite
          </div>
          <div style={{ fontSize: 13, color: "#6B6560", marginBottom: 16, lineHeight: 1.5 }}>
            Recharge la page pour réessayer.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ background: "#FF5733", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Recharger
          </button>
          <details style={{ marginTop: 16 }}>
            <summary style={{ fontSize: 11, color: "#9B9590", cursor: "pointer" }}>Détail de l'erreur</summary>
            <pre style={{ fontSize: 10, color: "#9B9590", marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Service Worker — mise à jour avec bannière ────────────────────
// Tout le bloc est dans un try/catch global — un throw ne crashe plus l'appli
try {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      try { reg.update(); } catch (_) {}

      try {
        if (reg.waiting) showUpdateBanner(reg.waiting);
      } catch (_) {}

      try {
        reg.addEventListener("updatefound", () => {
          try {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              try {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  showUpdateBanner(newWorker);
                }
              } catch (_) {}
            });
          } catch (_) {}
        });
      } catch (_) {}

    }).catch(() => {});
  }
} catch (_) {}

function showUpdateBanner(worker) {
  try {
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

    const label = document.createElement("span");
    label.textContent = "🔄 Nouvelle version disponible";

    const btn = document.createElement("button");
    btn.textContent = "Mettre à jour";
    btn.style.cssText = "background:#FF5733;color:#fff;border:none;padding:7px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;";

    btn.addEventListener("click", () => {
      try {
        banner.remove();
        worker.postMessage({ type: "SKIP_WAITING" });
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!window.__reloading) {
            window.__reloading = true;
            window.location.reload();
          }
        });
      } catch (_) {}
    });

    banner.appendChild(label);
    banner.appendChild(btn);
    document.body.appendChild(banner);
  } catch (_) {}
}

// Masquer le fallback HTML dès que React est prêt — prouve que le JS a bien chargé
try {
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) loadingEl.remove();
  if (window.__loadingTimeout) clearTimeout(window.__loadingTimeout);
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
