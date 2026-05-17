// ─── Edge Function : places-details ──────────────────────────────────────────
// Récupère les détails complets d'un lieu Google Places et stocke les
// 3 premières photos dans Supabase Storage (bucket merchant-photos).
//
// Paramètres (query string) :
//   place_id  — identifiant Google du lieu
//
// Réponse :
//   {
//     place_id, name, address, lat, lng,
//     phone, website, categories,
//     opening_hours,         // horaires hebdo standards (JSON)
//     current_opening_hours, // horaires temps réel avec exceptions
//     photo_urls,            // URLs Supabase Storage (permanentes)
//     raw,                   // payload Google brut (pour google_data)
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Champs Places API demandés — chaque champ a un coût, on demande le minimum utile.
const FIELDS = [
  "place_id",
  "name",
  "formatted_address",
  "geometry",
  "formatted_phone_number",
  "website",
  "opening_hours",
  "current_opening_hours",
  "types",
  "photos",
].join(",");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const url     = new URL(req.url);
    const placeId = url.searchParams.get("place_id")?.trim();

    if (!placeId) {
      return json({ error: "Paramètre 'place_id' manquant." }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return json({ error: "Configuration serveur incorrecte." }, 500);
    }

    // ── 1. Place Details ─────────────────────────────────────────────────────
    const detailsUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    detailsUrl.searchParams.set("place_id", placeId);
    detailsUrl.searchParams.set("fields", FIELDS);
    detailsUrl.searchParams.set("key", apiKey);
    detailsUrl.searchParams.set("language", "fr");

    const gRes = await fetch(detailsUrl.toString());
    if (!gRes.ok) throw new Error(`Google Details HTTP ${gRes.status}`);

    const gData = await gRes.json();
    if (gData.status !== "OK") {
      console.error("Google Details status:", gData.status, gData.error_message);
      return json({ error: `Google API: ${gData.status}` }, 422);
    }

    const p = gData.result;

    // ── 2. Mapping des données ────────────────────────────────────────────────
    const structured = {
      place_id:               p.place_id,
      name:                   p.name ?? "",
      address:                p.formatted_address ?? "",
      lat:                    p.geometry?.location?.lat ?? null,
      lng:                    p.geometry?.location?.lng ?? null,
      phone:                  p.formatted_phone_number ?? "",
      website:                p.website ?? "",
      categories:             (p.types ?? []).join(", "),
      opening_hours:          p.opening_hours ?? null,
      current_opening_hours:  p.current_opening_hours ?? null,
      raw:                    p, // pour google_data (audit)
    };

    // ── 3. Téléchargement & stockage des 3 premières photos ──────────────────
    const photoRefs: string[] = (p.photos ?? [])
      .slice(0, 3)
      .map((ph: any) => ph.photo_reference)
      .filter(Boolean);

    const photo_urls: string[] = [];

    if (photoRefs.length > 0) {
      // Client Supabase avec service_role (accès Storage en écriture)
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      for (let i = 0; i < photoRefs.length; i++) {
        try {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(photoRefs[i])}&key=${apiKey}`;
          const photoRes = await fetch(photoUrl);
          if (!photoRes.ok) continue;

          const blob       = await photoRes.blob();
          const arrayBuf   = await blob.arrayBuffer();
          const uint8      = new Uint8Array(arrayBuf);
          const storagePath = `google/${placeId}/photo_${i}.jpg`;

          // Upsert : si la photo existe déjà pour ce place_id on l'écrase
          const { error: uploadErr } = await supabaseAdmin.storage
            .from("merchant-photos")
            .upload(storagePath, uint8, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadErr) {
            console.warn(`Upload photo ${i} échoué:`, uploadErr.message);
            continue;
          }

          const { data: pubData } = supabaseAdmin.storage
            .from("merchant-photos")
            .getPublicUrl(storagePath);

          if (pubData?.publicUrl) {
            photo_urls.push(pubData.publicUrl);
          }
        } catch (photoErr) {
          console.warn(`Erreur photo ${i}:`, photoErr);
        }
      }
    }

    return json({ ...structured, photo_urls });
  } catch (err: any) {
    console.error("places-details error:", err);
    return json({ error: "Erreur interne du serveur." }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
