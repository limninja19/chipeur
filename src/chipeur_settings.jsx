import { useState } from "react";

// ─── DONNÉES RÈGLEMENT ────────────────────────────────────────────
const REGLEMENT_ARTICLES = [
  {
    titre: "Préambule",
    texte: "Chipeur est une application mobile communautaire dédiée à la vie de quartier à Saint-Dié-des-Vosges. Elle permet aux commerces et artisans locaux de créer des \"Défis\" auxquels les voisins peuvent participer. Le présent règlement définit les conditions générales applicables à tout Défi publié sur Chipeur. Tout participant reconnaît avoir pris connaissance du présent règlement et l'accepter sans réserve.",
  },
  {
    titre: "Article 1 — Organisateur du Défi",
    texte: "Chaque Défi est organisé par un commerçant ou artisan local inscrit sur Chipeur. L'Organisateur est seul responsable du contenu du Défi, de la récompense promise et de son attribution. Chipeur met à disposition la plateforme technique et n'est pas co-organisateur des Défis créés par les commerçants.",
  },
  {
    titre: "Article 2 — Conditions de participation",
    texte: "La participation est gratuite et sans obligation d'achat. Elle est ouverte à toute personne titulaire d'un compte Chipeur actif. Une seule participation par Défi et par compte est autorisée. Sont exclus les employés de l'Organisateur et les membres de l'équipe Chipeur.",
  },
  {
    titre: "Article 3 — Déroulement du Défi",
    texte: "Chaque Défi est publié avec une date de début et une date de fin. L'Organisateur peut définir un nombre maximum de participants : lorsque ce seuil est atteint, le Défi se clôture automatiquement. Pour participer, le voisin publie un contenu (photo ou texte) depuis l'application Chipeur, en respectant les CGU.",
  },
  {
    titre: "Article 4 — Désignation du gagnant",
    texte: "Deux modes de sélection sont possibles :\n\n🎯 Choix du commerçant : l'Organisateur sélectionne lui-même le gagnant parmi les participants, selon des critères de son choix.\n\n🗳️ Vote des voisins : le participant dont la publication a recueilli le plus de réactions à la clôture du Défi est déclaré gagnant.\n\nLe mode est indiqué clairement sur chaque fiche de Défi. La désignation intervient au plus tard 7 jours après la clôture.",
  },
  {
    titre: "Article 5 — Récompense",
    texte: "La nature et la valeur de la récompense sont définies par l'Organisateur et affichées sur la fiche du Défi. L'Organisateur s'engage à honorer la récompense dans un délai de 30 jours maximum après désignation du gagnant. La récompense est personnelle, nominative et non cessible.",
  },
  {
    titre: "Article 6 — Droits sur les contenus",
    texte: "En participant, le participant autorise l'Organisateur et Chipeur à utiliser son contenu publié à des fins de communication liées au Défi, sous réserve de mentionner son pseudonyme. Le participant reste titulaire de ses droits d'auteur et peut révoquer cette autorisation en contactant contact@chipeur.fr.",
  },
  {
    titre: "Article 7 — Protection des données (RGPD)",
    texte: "Les données collectées (pseudonyme, contenu) sont traitées par Chipeur conformément au RGPD. Elles sont utilisées uniquement pour la gestion des Défis et conservées 12 mois après clôture. Tout utilisateur dispose d'un droit d'accès, rectification et suppression en contactant : contact@chipeur.fr.",
  },
  {
    titre: "Article 8 — Responsabilité",
    texte: "Chipeur ne saurait être tenu responsable des défaillances techniques temporaires, du non-respect par l'Organisateur de ses engagements, des contenus publiés par les participants, ou de tout dommage indirect résultant de la participation.",
  },
  {
    titre: "Article 9 — Modification et annulation",
    texte: "L'Organisateur peut modifier les paramètres d'un Défi avant la première participation. Une fois ouvert, seule la date de fin peut être prolongée. L'annulation est possible en cas de force majeure, avec information des participants dans les 48 heures.",
  },
  {
    titre: "Article 10 — Litiges",
    texte: "Tout litige doit être signalé en premier lieu à l'Organisateur. En l'absence de résolution amiable, le litige peut être soumis à Chipeur via le formulaire de contact de l'application. Le présent règlement est soumis au droit français.",
  },
  {
    titre: "Article 11 — Acceptation",
    texte: "La participation à tout Défi Chipeur implique l'acceptation pleine et entière du présent règlement, accessible en permanence depuis les Paramètres de l'application. Version 1.0 — applicable à compter du 1er juin 2026.",
  },
];
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const dm = "'DM Sans', sans-serif";
const syne = "'Syne', sans-serif";

// ─── ÉCRAN RÈGLEMENT ─────────────────────────────────────────────
export function ReglementScreen({ setPage }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#F5F2EE", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px",
        background: "#FFFFFF", borderBottom: "1px solid rgba(26,23,20,0.08)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={() => setPage("profil")} style={{ background: "#EDEBE8", border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 16, color: "#1A1714" }}>🏆 Règlement des Défis</div>
          <div style={{ fontSize: 11, color: "#6B6560" }}>Jeux concours Chipeur — v1.0 · Juin 2026</div>
        </div>
      </div>

      {/* Intro banner */}
      <div style={{ margin: "12px 16px 0", background: "linear-gradient(135deg,#FF5733,#F7A72D)", borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>Chipeur — Saint-Dié-des-Vosges</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
          Ce règlement s'applique à tous les Défis communautaires publiés sur la plateforme Chipeur par les commerçants et artisans locaux.
        </div>
      </div>

      {/* Articles */}
      <div style={{ padding: "12px 16px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        {REGLEMENT_ARTICLES.map((article, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid rgba(26,23,20,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid rgba(26,23,20,0.06)" }}>
              <div style={{ fontFamily: dm, fontWeight: 700, fontSize: 13, color: "#1A1714" }}>{article.titre}</div>
            </div>
            <div style={{ padding: "10px 14px 12px" }}>
              {article.texte.split("\n\n").map((para, j) => (
                <div key={j} style={{ fontSize: 12, color: "#6B6560", lineHeight: 1.65, marginBottom: j < article.texte.split("\n\n").length - 1 ? 8 : 0 }}>
                  {para}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px 0 0" }}>
          <div style={{ fontSize: 11, color: "#6B6560", lineHeight: 1.8 }}>
            Pour toute question relative à ce règlement :<br />
            <a href="mailto:contact@chipeur.fr" style={{ color: "#FF5733", fontWeight: 600 }}>contact@chipeur.fr</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS DRAWER ───
// Panneau qui glisse du bas — accessible depuis n'importe quel profil
export function SettingsDrawer({ open, onClose, setPage, user, profile }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!open) return null;

  const handleLogout = async () => {
    if (!confirmLogout) {
      // Premier clic : demander confirmation
      setConfirmLogout(true);
      return;
    }
    // Deuxième clic : déconnexion réelle
    setLoggingOut(true);
    await supabase.auth.signOut();
    // App.jsx gère la redirection via onAuthStateChange
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    // Soft-delete : on vide le profil et on déconnecte
    // La suppression complète côté Supabase Auth nécessite un admin — on laisse une trace pour traitement manuel
    if (user?.id) {
      await supabase.from("profiles").update({
        pseudo: "[Compte supprimé]",
        bio: null,
        avatar_url: null,
        quartier: null,
        phone: null,
        website: null,
        deleted_at: new Date().toISOString(),
      }).eq("id", user.id);
    }
    await supabase.auth.signOut();
  };

  const Row = ({ icon, label, sublabel, onClick, danger, href, chevron = true }) => (
    href ? (
      <a href={href} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "13px 0",
          borderBottom: `1px solid ${C.border}`, cursor: "pointer",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: dm }}>{label}</div>
            {sublabel && <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{sublabel}</div>}
          </div>
          {chevron && <span style={{ fontSize: 14, color: C.ink2 }}>›</span>}
        </div>
      </a>
    ) : (
      <div onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 12, padding: "13px 0",
        borderBottom: `1px solid ${C.border}`, cursor: "pointer",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: danger ? "#FFF0EE" : C.pill, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: danger ? C.accent : C.ink, fontFamily: dm }}>{label}</div>
          {sublabel && <div style={{ fontSize: 11, color: C.ink2, marginTop: 1 }}>{sublabel}</div>}
        </div>
        {chevron && <span style={{ fontSize: 14, color: danger ? C.accent : C.ink2 }}>›</span>}
      </div>
    )
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.8, padding: "14px 0 4px", fontFamily: dm }}>
      {children}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.5)", zIndex: 300 }} />

      {/* Panneau */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.card, borderRadius: "24px 24px 0 0",
        padding: "0 20px 40px", zIndex: 301,
        maxHeight: "90dvh", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.pill }} />
        </div>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink }}>⚙️ Paramètres</div>
            {profile?.pseudo && <div style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>{profile.pseudo} · {user?.email}</div>}
          </div>
          <button onClick={onClose} style={{ background: C.pill, border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 16, cursor: "pointer", color: C.ink2 }}>✕</button>
        </div>

        {/* Compte */}
        <SectionTitle>Mon compte</SectionTitle>
        <Row icon="🔄" label="Changer de compte" sublabel="Retour à l'écran de connexion" onClick={handleLogout} />
        <Row
          icon={loggingOut ? "⏳" : confirmLogout ? "⚠️" : "🚪"}
          label={loggingOut ? "Déconnexion…" : confirmLogout ? "Confirmer la déconnexion ?" : "Se déconnecter"}
          sublabel={confirmLogout && !loggingOut ? "Appuie encore pour confirmer" : "Tu pourras te reconnecter à tout moment"}
          onClick={handleLogout}
          danger={confirmLogout}
          chevron={false}
        />

        {/* Légal */}
        <SectionTitle>Informations légales</SectionTitle>
        <Row icon="📄" label="Conditions Générales d'Utilisation" href="/cgu.html" />
        <Row icon="🔒" label="Politique de confidentialité" sublabel="RGPD & gestion de tes données" href="/politique-confidentialite.html" />
        <Row icon="🏆" label="Règlement des Défis" sublabel="Jeux concours & conditions de participation" onClick={() => { onClose(); setPage("reglement"); }} />
        {(profile?.role === "magasin" || profile?.role === "artisan" || profile?.role === "commercant") && (
          <Row icon="🏪" label="CGU Marchands" href="/cgu-marchands.html" />
        )}
        <Row
          icon="📧"
          label="Exercer mes droits RGPD"
          sublabel="Accès, rectification, portabilité…"
          href="mailto:privacy@chipeur.app?subject=Droits RGPD"
          chevron={false}
        />

        {/* À propos */}
        <SectionTitle>À propos</SectionTitle>
        <Row icon="ℹ️" label="Chipeur — Pilote Saint-Dié" sublabel="Version 1.0 · Mai 2026" chevron={false} />
        <Row
          icon="💬"
          label="Nous contacter"
          sublabel="contact@chipeur.app"
          href="mailto:contact@chipeur.app"
          chevron={false}
        />

        {/* Zone danger */}
        <SectionTitle>Zone critique</SectionTitle>
        {!confirmDelete ? (
          <Row
            icon="🗑️"
            label="Supprimer mon compte"
            sublabel="Cette action est irréversible"
            onClick={() => setConfirmDelete(true)}
            danger
          />
        ) : (
          <div style={{ background: "#FFF0EE", borderRadius: 16, padding: 16, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 6 }}>⚠️ Confirmer la suppression</div>
            <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5, marginBottom: 14 }}>
              Ton profil et tes données seront supprimés. Tes posts resteront anonymisés. Cette action ne peut pas être annulée.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 11, borderRadius: 12, background: C.pill, color: C.ink, border: "none", fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1, padding: 11, borderRadius: 12, background: C.accent, color: "#fff", border: "none", fontFamily: dm, fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer" }}>
                {deleting ? "⏳ Suppression…" : "Oui, supprimer"}
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: 10, color: C.ink2, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Chipeur · Pilote communautaire Saint-Dié-des-Vosges<br />
          Pour toute demande : <a href="mailto:contact@chipeur.app" style={{ color: C.accent }}>contact@chipeur.app</a>
        </div>
      </div>
    </>
  );
}
