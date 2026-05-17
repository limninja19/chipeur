// ─── Edge Function : places-search ───────────────────────────────────────────
// Proxy sécurisé vers l'API Google Places Text Search.
// La clé API n'est JAMAIS exposée côté client.
//
// Paramètres (query string) :
//   q  — terme de recherche (ex: "Boulangerie Paul Paris")
//
// Réponse :
//   { results: [{ place_id, name, address, photo_url }] }
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Pré-vol CORS (navigateur mobile)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return json({ error: "Paramètre 'q' manquant ou trop court." }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_PLACES_API_KEY manquante dans les secrets Supabase.");
      return json({ error: "Configuration serveur incorrecte." }, 500);
    }

    // ── Appel Google Places Text Search ──────────────────────────────────────
    const googleUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    googleUrl.searchParams.set("query", query);
    googleUrl.searchParams.set("key", apiKey);
    googleUrl.searchParams.set("language", "fr");
    // Optionnel : restreindre aux commerces (améliore la pertinence)
    googleUrl.searchParams.set("type", "establishment");

    const gRes = await fetch(googleUrl.toString());
    if (!gRes.ok) {
      throw new Error(`Google API HTTP ${gRes.status}`);
    }
    const gData = await gRes.json();

    if (gData.status === "REQUEST_DENIED") {
      console.error("Google Places REQUEST_DENIED:", gData.error_message);
      return json({ error: "Clé API Google invalide ou Places API non activée." }, 500);
    }

    // ── Simplification de la réponse ─────────────────────────────────────────
    // On retourne au max 5 résultats pour limiter l'affichage et les coûts.
    const results = (gData.results ?? []).slice(0, 5).map((place: any) => {
      // URL de miniature via l'API Photos (200px de large)
      const photoRef = place.photos?.[0]?.photo_reference ?? null;
      const photo_url = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${encodeURIComponent(photoRef)}&key=${apiKey}`
        : null;

      return {
        place_id: place.place_id,
        name:     place.name,
        address:  place.formatted_address,
        photo_url,
      };
    });

    return json({ results });
  } catch (err: any) {
    console.error("places-search error:", err);
    return json({ error: "Erreur interne du serveur." }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
