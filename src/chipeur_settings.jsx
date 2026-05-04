import { useState } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};
const dm = "'DM Sans', sans-serif";
const syne = "'Syne', sans-serif";

// ─── SETTINGS DRAWER ───
// Panneau qui glisse du bas — accessible depuis n'importe quel profil
export function SettingsDrawer({ open, onClose, setPage, user, profile }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!open) return null;

  const handleLogout = async () => {
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
          icon={loggingOut ? "⏳" : "🚪"}
          label={loggingOut ? "Déconnexion…" : "Se déconnecter"}
          sublabel="Tu pourras te reconnecter à tout moment"
          onClick={handleLogout}
          chevron={false}
        />

        {/* Légal */}
        <SectionTitle>Informations légales</SectionTitle>
        <Row icon="📄" label="Conditions Générales d'Utilisation" href="/cgu.html" />
        <Row icon="🔒" label="Politique de confidentialité" sublabel="RGPD & gestion de tes données" href="/politique-confidentialite.html" />
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
