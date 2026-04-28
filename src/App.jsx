import { useState } from "react";

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
