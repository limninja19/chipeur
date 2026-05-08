import { useState } from "react";
import SignupModal from "./SignupModal";

// Wrapper autour d'une action protégée
// Si l'utilisateur n'est pas connecté → ouvre la modale d'inscription
// Après inscription réussie → rejoue l'action automatiquement
export default function AuthGate({ user, onSuccess, children, action }) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    if (!user) {
      e.stopPropagation();
      e.preventDefault();
      setShowModal(true);
      return;
    }
    // Utilisateur connecté → action normale
  };

  return (
    <>
      <div onClick={handleClick} style={{ display: "contents" }}>
        {children}
      </div>
      {showModal && (
        <SignupModal
          onClose={() => setShowModal(false)}
          triggerLabel="Réagis, gagne de l'XP et débloque tes bons d'achat à Saint-Dié 🔥"
          onSuccess={async () => {
            setShowModal(false);
            // Rejouer l'action après inscription
            await onSuccess?.();
          }}
        />
      )}
    </>
  );
}
