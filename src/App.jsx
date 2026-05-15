import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useProfile } from "./useProfile";
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
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
    () => localStorage.getItem("chipeur_install_shown_v1") !== "true"
  );
  const [showFilTour, setShowFilTour] = useState(false);

  function handleCloseInstall() {
    localStorage.setItem("chipeur_install_shown_v1", "true");
    setShowInstall(false);
    // Enchaîner le tour du fil si pas encore vu
    if (localStorage.getItem("chipeur_fil_tour_v1") !== "true") {
      setShowFilTour(true);
    }
  }

  function handleCloseFilTour() {
    localStorage.setItem("chipeur_fil_tour_v1", "true");
    setShowFilTour(false);
  }

  // ── Onboarding première visite ──────────────────────────────────────────
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem("chipeur_onboarding_done_v2") === "true"
  );

  // Si l'utilisateur est déjà connecté (compte existant), on saute l'onboarding
  // et on marque la clé localStorage pour éviter de le revoir
  useEffect(() => {
    if (user && profile && !onboardingDone) {
      localStorage.setItem("chipeur_onboarding_done_v2", "true");
      setOnboardingDone(true);
    }
  }, [user?.id, profile?.id]);

  async function handleOnboardingDone() {
    localStorage.setItem("chipeur_onboarding_done_v2", "true");
    setOnboardingDone(true);
    if (user?.id) {
      await supabase.from("profiles").update({ has_seen_onboarding: true }).eq("id", user.id);
    }
  }

  if (user === undefined || (user && profileLoading)) return <SplashScreen />;

  // Onboarding uniquement pour les visiteurs sans compte
  if (!onboardingDone) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

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
    <>
      <Analytics />
      <SpeedInsights />
      {/* Modale d'inscription globale déclenchée par requireAuth() */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => { setShowSignup(false); }}
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
        const roleProfil = profile?.role;
        const roleMeta   = user?.user_metadata?.role;
        const isMarchand = ["magasin","artisan","commercant"].includes(roleProfil) || ["magasin","artisan","commercant"].includes(roleMeta);
        return isMarchand ? <ProfilMagasin {...sharedProps} /> : <ProfilVoisin {...sharedProps} />;
      })()}
      {/* Fil = page par défaut, visible aussi sans compte */}
      {!["defis","sorties","nouveau","commerces","reductions","reglement","voisins","notifications","messages","profil"].includes(page) && (
        <Fil {...sharedProps} />
      )}
    </>
  );
}
