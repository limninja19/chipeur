import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// Chargement des fonts Syne + Syne Mono pour le splash screen
const _font = document.createElement("link");
_font.href = "https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Syne+Mono&display=swap";
_font.rel = "stylesheet";
if (!document.querySelector(`link[href="${_font.href}"]`)) document.head.appendChild(_font);

import ChipeurLogin from "./chipeur_login";
import Fil from "./chipeur_fil";
import Sorties from "./chipeur_sorties";
import NouveauPost from "./chipeur_nouveau_post";
import Commerces from "./chipeur_commerces";
import ProfilVoisin from "./chipeur_profil_voisin_1";
import Inscription from "./chipeur_inscription";
import MesReductions from "./chipeur_mes_reductions";
import ProfilMagasin from "./chipeur_profil_magasin";
import PageVoisins from "./chipeur_page_voisins";

export default function App() {
  const [page, setPage] = useState("fil");
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Récupère la session active au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écoute les changements d'état d'auth (connexion, déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Écran de chargement pendant la vérification de session
  if (session === undefined) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "#F5F2EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGradSplash" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5733"/>
              <stop offset="100%" stopColor="#FF8C42"/>
            </linearGradient>
          </defs>
          <path d="M36 6C24.95 6 16 14.95 16 26C16 38.5 36 66 36 66C36 66 56 38.5 56 26C56 14.95 47.05 6 36 6Z" fill="url(#pinGradSplash)"/>
          <circle cx="36" cy="26" r="10" fill="white"/>
          <path d="M39 19L32 27H37L34 34L41 26H36L39 19Z" fill="#FF5733"/>
        </svg>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, color: "#1A1A2E" }}>
          chi<span style={{ color: "#FF5733" }}>p</span>eur
        </div>
        <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 9, letterSpacing: 4, color: "#FF5733", textTransform: "uppercase" }}>
          Découvre · Chope · Partage
        </div>
      </div>
    );
  }

  // Pas de session → page de connexion/inscription
  if (!session) {
    return <ChipeurLogin setPage={setPage} />;
  }

  // Session active → app normale
  if (page === "inscription") return <Inscription setPage={setPage} />;
  if (page === "sorties") return <Sorties setPage={setPage} />;
  if (page === "nouveau") return <NouveauPost setPage={setPage} />;
  if (page === "commerces") return <Commerces setPage={setPage} />;
  if (page === "profil") return <ProfilVoisin setPage={setPage} />;
  if (page === "reductions") return <MesReductions setPage={setPage} />;
  if (page === "profilMagasin") return <ProfilMagasin setPage={setPage} />;
  if (page === "voisins") return <PageVoisins setPage={setPage} />;

  return <Fil setPage={setPage} />;
}
