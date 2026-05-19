import { useState, useEffect, useCallback, useRef, Component } from "react";
import { supabase } from "./supabase";
import { useProfile } from "./useProfile";
import safeStorage from "./safeStorage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Fil from "./chipeur_fil";
import Defis from "./chipeur_defis";
import Sorties from "./chipeur_sorties";
import NouveauPost from "./chipeur_nouveau_post";
import Commerces from "./chipeur_commerces";
import ProfilVoisin from "./chipeur_profil_voisin_1";
import Inscription from "./chipeur_inscription";
import MesReductions from "./chipeur_mes_reductions";
import ProfilMagasin from "./chipeur_profil_magasin";
import PageVoisins from "./chipeur_page_voisins";
import Connexion from "./chipeur_connexion";
import { ReglementScreen } from "./chipeur_settings";
import { checkDailyLogin } from "./chipeur_xp";
import Notifications from "./chipeur_notifications";
import Messages from "./chipeur_messages";
import SignupModal from "./SignupModal";
import Onboarding from "./chipeur_onboarding";
import InstallPWAModal from "./InstallPWAModal";
import FilTourModal from "./FilTourModal";

// ─── Error Boundary global ──────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Chipeur crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100dvh", background: "#1A1A2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 32, color: "#FF5733" }}>chipeur</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 1.6 }}>
            Oups, une erreur est survenue 😕
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,87,51,0.7)", background: "rgba(255,87,51,0.1)", padding: "8px 14px", borderRadius: 10, maxWidth: 320, wordBreak: "break-all", textAlign: "center" }}>
            {this.state.error?.message || "Erreur inconnue"}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, background: "#FF5733", color: "#fff", border: "none", borderRadius: 14, padding: "12px 24px", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Recharger l'app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SplashScreen() {
  return (
    <div style={{
      minHeight: "100dvh", background: "#1A1A2E",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
    }}>
      <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 38, color: "#FF5733", letterSpacing: "-1px" }}>chipeur</div>
      <div style={{ fontFamily: "Syne Mono", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>Chargement…</div>
    </div>
  );
}

export default function App() {
  // Capture le code de parrainage depuis l'URL (?ref=UUID) et le garde en sessionStorage
  // (sessionStorage est plus sûr : les données sont effacées à la fermeture de l'onglet)
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) sessionStorage.setItem("chipeur_ref", ref);
  }, []);

  const [page, setPageRaw] = useState("fil");
  const [conversationWith, setConversationWith] = useState(null);
  const [selectedVoisinId, setSelectedVoisinId] = useState(null);
  const [selectedSortieId, setSelectedSortieId] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [autoCreateSortie, setAutoCreateSortie] = useState(false);
  const pageHistoryRef = useRef(["fil"]);

  // Wrapper setPage : pousse dans l'historique du navigateur pour que le bouton
  // Retour Android fonctionne correctement (sinon il ferme l'app)
  const setPage = useCallback((newPage) => {
    window.history.pushState({ page: newPage }, "");
    pageHistoryRef.current = [...pageHistoryRef.current, newPage];
    setPageRaw(newPage);
  }, []);

  // Capturer l'événement d'installation PWA (Android/Chrome)
  // Stocké sur window pour être accessible dans InstallPWAModal sans prop-drilling
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      window.__chipeurInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Écouter le bouton Retour (Android / navigateur)
  useEffect(() => {
    const handlePop = () => {
      const history = pageHistoryRef.current;
      if (history.length <= 1) {
        // On est à la racine, rien à faire (empêche la fermeture)
        window.history.pushState({ page: "fil" }, "");
        return;
      }
      const newHistory = history.slice(0, -1);
      pageHistoryRef.current = newHistory;
      setPageRaw(newHistory[newHistory.length - 1]);
    };
    window.addEventListener("popstate", handlePop);
    // On pousse un état initial pour qu'il y ait toujours quelque chose à "dépiler"
    window.history.pushState({ page: "fil" }, "");
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
  const [user, setUser] = useState(undefined);
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => setUser(session?.user ?? null))
      .catch(() => setUser(null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Connexion quotidienne → XP streak
  useEffect(() => {
    if (!user?.id || !profile) return;
    checkDailyLogin(user.id, profile);
  }, [user?.id, profile?.id]);

  // Sync : si le profil existe mais que le role est manquant,
  // on le récupère depuis les métadonnées Auth (cas commerçant avec email non confirmé à l'inscription)
  useEffect(() => {
    if (!user || !profile) return;
    const metaRole = user.user_metadata?.role;
    const metaPseudo = user.user_metadata?.pseudo;
    if (metaRole && !profile.role) {
      updateProfile({
        role: metaRole,
        ...(metaPseudo && !profile.pseudo ? { pseudo: metaPseudo } : {}),
      });
    }
  }, [user, profile]);

  const [showSignup, setShowSignup] = useState(false);

  // ── Modales post-inscription ─────────────────────────────────────────────
  const [showInstall, setShowInstall] = useState(
    () => safeStorage.getItem("chipeur_install_shown_v1") !== "true"
  );
  const [showFilTour, setShowFilTour] = useState(false);

  function handleCloseInstall() {
    safeStorage.setItem("chipeur_install_shown_v1", "true");
    setShowInstall(false);
    // Enchaîner le tour du fil si pas encore vu
    if (safeStorage.getItem("chipeur_fil_tour_v1") !== "true") {
      setShowFilTour(true);
    }
  }

  function handleCloseFilTour() {
    safeStorage.setItem("chipeur_fil_tour_v1", "true");
    setShowFilTour(false);
  }

  // ── Onboarding désactivé temporairement ──────────────────────────────────
  // (fiches explicatives retirées — à réintégrer sous une autre forme plus tard)

  if (user === undefined || (user && profileLoading)) return <SplashScreen />;

  if (page === "inscription") return <Inscription setPage={setPage} onAuth={() => setPage("fil")} />;
  if (page === "connexion")   return <Connexion   setPage={setPage} onAuth={() => setPage("fil")} />;

  // Props communes — user peut être null (visiteur libre)
  const sharedProps = {
    setPage, user, profile, updateProfile,
    conversationWith, setConversationWith,
    selectedVoisinId, setSelectedVoisinId,
    selectedSortieId, setSelectedSortieId,
    autoCreateSortie, setAutoCreateSortie,
    editPost, setEditPost,
    // Permet à n'importe quelle page d'ouvrir la modale d'inscription
    requireAuth: (callback) => {
      if (user) { callback?.(); return true; }
      setShowSignup(true);
      return false;
    },
  };

  // Pages protégées — redirige vers la modale si non connecté
  const protectedPages = ["nouveau", "profil", "notifications", "messages", "reductions"];
  if (!user && protectedPages.includes(page)) {
    setShowSignup(true);
    setPageRaw("fil");
  }

  return (
    <ErrorBoundary>
    <>
      <Analytics />
      <SpeedInsights />
      {/* Modale d'inscription globale déclenchée par requireAuth() */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => { setShowSignup(false); }}
          onMerchant={() => { setShowSignup(false); setPageRaw("inscription"); }}
        />
      )}

      {/* Pop-up "Installe l'appli" — une seule fois */}
      {!showSignup && showInstall && (
        <InstallPWAModal onClose={handleCloseInstall} />
      )}

      {/* Tour du fil — juste après la modale d'install */}
      {!showInstall && showFilTour && (
        <FilTourModal onClose={handleCloseFilTour} setPage={setPage} />
      )}

      {page === "defis"        && <Defis        {...sharedProps} />}
      {page === "sorties"      && <Sorties       {...sharedProps} />}
      {page === "nouveau"      && user && <NouveauPost {...sharedProps} />}
      {page === "commerces"    && <Commerces     {...sharedProps} />}
      {page === "reductions"   && user && <MesReductions {...sharedProps} />}
      {page === "reglement"    && <ReglementScreen {...sharedProps} />}
      {page === "voisins"      && <PageVoisins   {...sharedProps} />}
      {page === "notifications"&& user && <Notifications {...sharedProps} />}
      {page === "messages"     && user && <Messages     {...sharedProps} />}
      {page === "profil" && (() => {
        if (!user) return null;
        // On se base uniquement sur profiles.role (table) — pas sur user_metadata qui ne se met pas à jour
        const isMarchand = ["magasin","artisan","commercant"].includes(profile?.role);
        return isMarchand ? <ProfilMagasin {...sharedProps} /> : <ProfilVoisin {...sharedProps} />;
      })()}
      {/* Fil = page par défaut, visible aussi sans compte */}
      {!["defis","sorties","nouveau","commerces","reductions","reglement","voisins","notifications","messages","profil"].includes(page) && (
        <Fil {...sharedProps} />
      )}
    </>
    </ErrorBoundary>
  );
}
