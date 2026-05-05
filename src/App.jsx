import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useProfile } from "./useProfile";

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
  const [page, setPage] = useState("fil");
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

  if (user === undefined || (user && profileLoading)) return <SplashScreen />;

  if (page === "inscription") return <Inscription setPage={setPage} onAuth={() => setPage("fil")} />;

  if (user === null) return <Connexion setPage={setPage} onAuth={() => setPage("fil")} />;

  // Props communes passées à toutes les pages
  const sharedProps = { setPage, user, profile, updateProfile };

  if (page === "defis") return <Defis {...sharedProps} />;
  if (page === "sorties") return <Sorties {...sharedProps} />;
  if (page === "nouveau") return <NouveauPost {...sharedProps} />;
  if (page === "commerces") return <Commerces {...sharedProps} />;
  if (page === "profil") {
    // On vérifie le rôle dans la table profiles ET dans les métadonnées Auth Supabase
    // (au cas où le trigger n'a pas encore copié le rôle dans profiles)
    const roleProfil = profile?.role;
    const roleMeta = user?.user_metadata?.role;
    const isMarchand = ["magasin", "artisan", "commercant"].includes(roleProfil) || ["magasin", "artisan", "commercant"].includes(roleMeta);
    if (isMarchand) return <ProfilMagasin {...sharedProps} />;
    return <ProfilVoisin {...sharedProps} />;
  }
  if (page === "reductions") return <MesReductions {...sharedProps} />;
  if (page === "reglement") return <ReglementScreen {...sharedProps} />;
  if (page === "profilMagasin") return <ProfilMagasin {...sharedProps} />;
  if (page === "voisins") return <PageVoisins {...sharedProps} />;

  return <Fil {...sharedProps} />;
}
