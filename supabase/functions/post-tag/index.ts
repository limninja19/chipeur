// Edge Function : post-tag
// Analyse une photo de post avec Claude Vision et extrait des mots-clés en français.
// Appelée en arrière-plan après chaque upload de photo dans un post.

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
    const { post_id, image_url } = await req.json();

    if (!post_id || !image_url) {
      return new Response(JSON.stringify({ error: "post_id et image_url requis" }), {
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

    const client = new Anthropic({ apiKey: anthropicKey });

    // Analyse de la photo avec Claude Vision (Haiku = rapide et économique)
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
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
              text: `Analyse cette photo d'un commerce local français.
Retourne UNIQUEMENT une liste de 5 à 8 mots-clés courts en français, séparés par des virgules.
Ces mots-clés décrivent ce qu'on voit : couleurs, types de produits, ambiance, occasion, saison.
Exemple de réponse : robe, rouge, été, nouveauté, mode femme, coton
Ne retourne rien d'autre que cette liste de mots-clés.`,
            },
          ],
        },
      ],
    });

    const rawText = (response.content[0] as { type: string; text: string }).text || "";
    const tags = rawText
      .split(",")
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string) => t.length > 0 && t.length < 40);

    // Mettre à jour le post dans Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ tags }),
      });
    }

    return new Response(JSON.stringify({ tags }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur post-tag:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
