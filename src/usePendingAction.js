import { useState, useCallback } from "react";

// Hook pour mémoriser une action en attente d'auth
// et la rejouer automatiquement après inscription
export function usePendingAction() {
  const [pending, setPending] = useState(null);

  // Sauvegarder une action avant d'ouvrir la modale
  const savePending = useCallback((action) => {
    // action = { type, postId, reactionType, ... }
    setPending(action);
  }, []);

  // Rejouer l'action après inscription réussie
  const replayPending = useCallback(async (handlers) => {
    if (!pending) return;
    const { type, postId, reactionType } = pending;

    if (type === "reaction" && handlers.onReaction) {
      await handlers.onReaction(postId, reactionType);
    } else if (type === "participation" && handlers.onParticipation) {
      await handlers.onParticipation(postId);
    }

    setPending(null);
  }, [pending]);

  const clearPending = useCallback(() => setPending(null), []);

  return { pending, savePending, replayPending, clearPending };
}
