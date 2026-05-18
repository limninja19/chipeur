// Edge Function : event-scan
// Analyse le flyer d'un événement avec Claude Vision et extrait les infos structurées.
// Retourne : title, type, tags, date_text, time_text, lieu, description

import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_url } = await req.json();

    if (!image_url) {
      return new Response(JSON.stringify({ error: "image_url requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Tu es un assistant qui analyse des affiches d'événements locaux français.
Analyse cette affiche et extrais les informations suivantes en JSON strict.

Réponds UNIQUEMENT avec ce JSON (aucun texte avant ou après) :
{
  "title": "Nom de l'événement (string, obligatoire)",
  "type": "Un seul type parmi : Vide-grenier, Marché, Fête, Concert, Sport, Loto, Repas, Gratuit, Autre",
  "tags": ["tableau", "de", "tags", "ex: Gratuit, Famille, Tombola, Buvette — entre 1 et 5 tags"],
  "date_text": "DD/MM/YYYY si trouvé, sinon null",
  "time_text": "ex: 9h–18h, à partir de 20h — sinon null",
  "lieu": "Nom du lieu ou adresse si présent, sinon null",
  "description": "Courte description de l'événement en 1-2 phrases, sinon null"
}

Règles :
- date_text doit être au format DD/MM/YYYY (ex: 25/12/2026)
- Si tu vois une année sans les 4 chiffres, déduis l'année la plus probable (2026 ou 2027)
- tags peut contenir des mots comme : Gratuit, Payant, Famille, Enfants, Buvette, Tombola, Animations, Repas, Vente, Braderie, etc.
- Ne mets pas le type dans les tags (pas de doublon)
- Si une info est absente, mets null`;

    const client = new Anthropic({ apiKey: anthropicKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: image_url },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const rawText = (response.content[0] as { type: string; text: string }).text || "";

    // Extraire le JSON de la réponse
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (_) {
      return new Response(JSON.stringify({ error: "Impossible de parser la réponse IA", raw: rawText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Erreur event-scan:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
