import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// Chargement des fonts Syne + Syne Mono pour le splash screen
const _font = document.createElement("link");
_font.href = "https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Syne+Mono&display=swap";
_font.rel = "stylesheet";
if (!document.querySelector(`link[href="${_font.href}"]`)) document.head.appendChild(_font);

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

// ─── SPLASH SCREEN ───
function SplashScreen() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#1A1A2E",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <div style={{
        fontFamily: "Syne",
        fontWeight: 800,
        fontSize: 38,
        color: "#FF5733",
        letterSpacing: "-1px",
      }}>chipeur</div>
      <div style={{
        fontFamily: "Syne Mono",
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.1em",
      }}>Chargement…</div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("fil");
  const [user, setUser] = useState(undefined); // undefined = chargement en cours

  useEffect(() => {
    // Récupère la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écoute les changements d'auth (login, logout, OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Chargement initial
  if (user === undefined) return <SplashScreen />;

  // Non connecté → page de connexion
  if (user === null) {
    return (
      <Connexion
        setPage={setPage}
        onAuth={() => setPage("fil")}
      />
    );
  }

  // Connecté → app normale
  if (page === "defis") return <Defis setPage={setPage} />;
  if (page === "inscription") return <Inscription setPage={setPage} />;
  if (page === "sorties") return <Sorties setPage={setPage} />;
  if (page === "nouveau") return <NouveauPost setPage={setPage} />;
  if (page === "commerces") return <Commerces setPage={setPage} />;
  if (page === "profil") return <ProfilVoisin setPage={setPage} />;
  if (page === "reductions") return <MesReductions setPage={setPage} />;
  if (page === "profilMagasin") return <ProfilMagasin setPage={setPage} />;
  if (page === "voisins") return <PageVoisins setPage={setPage} />;

  return <Fil setPage={setPage} user={user} />;
}
