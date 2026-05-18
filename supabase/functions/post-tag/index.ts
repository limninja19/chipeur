// Edge Function : post-tag
// Analyse une photo de post avec Claude Vision et extrait des mots-clés en français.
// Le prompt est contextualisé avec le métier du commerçant pour des tags pertinents.
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
    const { post_id, image_url, metier: metierParam, categorie: categorieParam } = await req.json();

    if (!post_id || !image_url) {
      return new Response(JSON.stringify({ error: "post_id et image_url requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const supabaseUrl  = Deno.env.get("SUPABASE_URL");
    const supabaseKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Récupérer le métier du commerçant si non fourni ──
    let metier    = metierParam   || "";
    let categorie = categorieParam || "";

    if ((!metier || !categorie) && supabaseUrl && supabaseKey) {
      // 1. Récupérer l'author_id depuis le post
      const postRes = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}&select=author_id`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const postData = await postRes.json();
      const authorId = postData?.[0]?.author_id;

      // 2. Récupérer le profil commerçant
      if (authorId) {
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${authorId}&select=metier,categorie`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        const profileData = await profileRes.json();
        metier    = metier    || profileData?.[0]?.metier    || "";
        categorie = categorie || profileData?.[0]?.categorie || "";
      }
    }

    // ── Construire le prompt contextualisé ──
    const contextLine = metier || categorie
      ? `Ce post est publié par un commerce de type : "${metier || categorie}".
IMPORTANT : génère des tags pertinents pour CE type d'activité commerciale.
Ignore ce qui est accessoire (visage des personnes, fond, décor sans rapport avec le commerce).
Concentre-toi sur :
- Les produits visibles : type, couleur, style, coupe, matière (ex : "robe rouge", "décolleté dos nu", "coton bio")
- Les marques lisibles sur les produits ou emballages (ex : "Nike", "Levi's", "Coca-Cola")
- Les services ou savoir-faire visibles (ex : "massage crânien", "balayage blond", "impression couleur")
- Les caractéristiques qui aident à trouver ce produit dans une recherche (ex : "taille haute", "sans gluten", "fait main")
Exemple pour une boutique mode : robe rouge, décolleté, coton, taille haute, fleuri, Zara — et NON : sourire, mur blanc, fond beige.
Exemple pour une boulangerie : croissant doré, feuilleté, beurre, viennoiserie, artisanal — et NON : tablier, comptoir, lumière.`
      : `Analyse cette photo d'un commerce local français. Décris les produits visibles avec leur couleur, style, matière et marque si lisible.`;

    const prompt = `${contextLine}
Retourne UNIQUEMENT une liste de 6 à 10 tags en français, séparés par des virgules.
Chaque tag peut faire 1 à 3 mots (ex : "robe rouge", "Nike", "fait main", "sans gluten").
Ces tags serviront de filtres de recherche — sois précis et descriptif.
Ne retourne rien d'autre que cette liste.`;

    // ── Appel Claude Vision ──
    const client = new Anthropic({ apiKey: anthropicKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
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
    const tags = rawText
      .split(",")
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string) => t.length > 0 && t.length < 50);

    // ── Mettre à jour le post dans Supabase ──
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

    return new Response(JSON.stringify({ tags, metier, categorie }), {
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
