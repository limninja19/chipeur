// Script : envoyer email de bienvenue à tous les inscrits existants
// Lancer avec : node send-existing-users.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cekvgoyowxjwfgvjarmo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const EMAIL_HTML = (pseudo) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F5F2EE;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F2EE;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
<tr><td style="background-color:#FF5733;padding:32px 24px;text-align:center;">
<div style="font-size:30px;font-weight:700;color:#ffffff;">chipeur</div>
<div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;">Le réseau social de Saint-Dié-des-Vosges</div>
</td></tr>
<tr><td style="padding:32px 28px;">
<p style="font-size:22px;font-weight:700;color:#1A1714;margin:0 0 10px;">Bienvenue ${pseudo} ! 👋</p>
<p style="font-size:14px;color:#6B6560;line-height:1.7;margin:0 0 20px;">Toute l'équipe de Chipeur vous remercie chaleureusement de votre confiance et d'avoir rejoint notre réseau de quartier. Nous sommes ravis de vous compter parmi nos voisins !</p>
<p style="font-size:14px;color:#6B6560;line-height:1.7;margin:0 0 24px;">Pour accéder à l'application, rendez-vous sur :</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
<tr><td align="center"><a href="https://chipeur.vercel.app" style="display:inline-block;background-color:#FF5733;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 40px;border-radius:14px;">Accéder à Chipeur →</a></td></tr>
</table>
<hr style="border:none;border-top:1px solid rgba(26,23,20,0.08);margin:0 0 24px;">
<p style="font-size:15px;font-weight:700;color:#1A1714;margin:0 0 10px;">Installez l'appli sur votre téléphone 📱</p>
<p style="font-size:13px;color:#6B6560;line-height:1.7;margin:0 0 14px;">Chipeur fonctionne comme une vraie application — sans téléchargement. Ajoutez-la à votre écran d'accueil en 2 secondes :</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EE;border-radius:12px;margin-bottom:8px;">
<tr><td style="padding:14px 16px;"><div style="font-size:13px;font-weight:700;color:#1A1714;margin-bottom:3px;">iPhone (Safari)</div><div style="font-size:12px;color:#6B6560;">Appuyez sur Partager → "Sur l'écran d'accueil"</div></td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EE;border-radius:12px;">
<tr><td style="padding:14px 16px;"><div style="font-size:13px;font-weight:700;color:#1A1714;margin-bottom:3px;">Android (Chrome)</div><div style="font-size:12px;color:#6B6560;">Menu ⋮ → "Installer l'application"</div></td></tr>
</table>
</td></tr>
<tr><td style="background:#F5F2EE;padding:20px 28px;text-align:center;border-top:1px solid rgba(26,23,20,0.08);">
<a href="https://chipeur.vercel.app" style="font-size:13px;color:#FF5733;text-decoration:none;font-weight:700;">chipeur.vercel.app</a>
<p style="font-size:11px;color:#6B6560;margin:8px 0 0;line-height:1.6;">© 2025 Chipeur · Saint-Dié-des-Vosges<br>Si vous n'avez pas créé de compte sur Chipeur, ignorez cet email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (error) { console.error("Erreur listUsers:", error); process.exit(1); }

const users = data.users;
console.log(`${users.length} utilisateurs trouvés\n`);

for (const user of users) {
  const email = user.email;
  if (!email) continue;

  const { data: profile } = await supabase.from("profiles").select("pseudo").eq("id", user.id).single();
  const pseudo = profile?.pseudo || "voisin";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Chipeur <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenue sur Chipeur ! 🧡",
      html: EMAIL_HTML(pseudo),
    }),
  });
  const result = await res.json();
  console.log(`✉️  ${email} (${pseudo}) → ${res.ok ? "✅ envoyé" : "❌ " + JSON.stringify(result)}`);
  await new Promise(r => setTimeout(r, 300));
}
console.log("\n✅ Terminé !");
