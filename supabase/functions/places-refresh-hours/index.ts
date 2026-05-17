// ─── Edge Function : places-refresh-hours ────────────────────────────────────
// Cron quotidien : rafraîchit current_opening_hours pour tous les profils
// commerçants avec une fiche Google (google_place_id non null).
//
// Déclenchement recommandé : tous les jours à 03h00 UTC (peu de trafic)
// Configuration dans Supabase Dashboard → Edge Functions → Schedule
// ou via pg_cron :
//   SELECT cron.schedule(
//     'refresh-google-hours',
//     '0 3 * * *',
//     $$SELECT net.http_post(
//       url := 'https://<project-ref>.supabase.co/functions/v1/places-refresh-hours',
//       headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
//     )$$
//   );
//
// Cette fonction ne retourne rien au client — elle est appelée en arrière-plan.
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return json({ error: "GOOGLE_PLACES_API_KEY manquante." }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1. Récupérer tous les profils commerçants avec une fiche Google ─────────
  const { data: profiles, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, google_place_id")
    .not("google_place_id", "is", null)
    .in("role", ["magasin", "artisan", "commercant"]);

  if (fetchErr) {
    console.error("Fetch profiles error:", fetchErr.message);
    return json({ error: fetchErr.message }, 500);
  }

  if (!profiles || profiles.length === 0) {
    return json({ message: "Aucun profil avec fiche Google.", updated: 0 });
  }

  console.log(`Rafraîchissement des horaires pour ${profiles.length} profil(s)…`);

  let updated = 0;
  let errors  = 0;

  // ── 2. Pour chaque profil, appeler Places API (current_opening_hours seulement) ─
  for (const profile of profiles) {
    try {
      const detailsUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/details/json"
      );
      detailsUrl.searchParams.set("place_id", profile.google_place_id!);
      // On demande uniquement current_opening_hours pour minimiser les coûts API
      detailsUrl.searchParams.set("fields", "current_opening_hours");
      detailsUrl.searchParams.set("key", apiKey);
      detailsUrl.searchParams.set("language", "fr");

      const gRes = await fetch(detailsUrl.toString());
      if (!gRes.ok) {
        console.warn(`Google ${profile.google_place_id}: HTTP ${gRes.status}`);
        errors++;
        continue;
      }

      const gData = await gRes.json();
      if (gData.status !== "OK") {
        console.warn(`Google ${profile.google_place_id}: status ${gData.status}`);
        errors++;
        continue;
      }

      const currentHours = gData.result?.current_opening_hours ?? null;

      // Mise à jour en base même si null (= établissement sans horaires renseignés)
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          current_opening_hours: currentHours,
          google_synced_at:      new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateErr) {
        console.warn(`Update ${profile.id}:`, updateErr.message);
        errors++;
      } else {
        updated++;
      }

      // Délai entre chaque requête pour respecter les limites de débit Google (10 req/s)
      await sleep(120);
    } catch (err) {
      console.error(`Erreur pour ${profile.id}:`, err);
      errors++;
    }
  }

  console.log(`Terminé. Mis à jour : ${updated} | Erreurs : ${errors}`);
  return json({ updated, errors, total: profiles.length });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
