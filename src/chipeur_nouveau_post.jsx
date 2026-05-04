import { useState } from "react";
import { supabase } from "./supabase";
import heic2any from "heic2any";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};


// ─── TAG PILLS ───
function TagPills({ tags, activeTags, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      {tags.map(t => {
        const isActive = activeTags.includes(t.label);
        return (
          <button key={t.label} onClick={() => onToggle(t.label)} style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 20,
            border: `1.5px solid ${isActive ? C.ink : C.border}`,
            background: isActive ? C.ink : C.card,
            color: isActive ? "#fff" : C.ink2,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// ─── PHOTO ZONE ───
function PhotoZone({ onPhotoSelect, zoneId }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const inputId = zoneId || "photo-input-main";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSizeError("");
    setPreviewFailed(false);

    if (file.size > 50 * 1024 * 1024) {
      setSizeError("Fichier trop grand (max 50 Mo).");
      return;
    }

    // Conversion HEIC → JPEG automatique (photos iPhone)
    const isHeic = file.type === "image/heic" || file.type === "image/heif"
      || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");

    let finalFile = file;
    if (isHeic) {
      try {
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        finalFile = new File([converted], file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"), { type: "image/jpeg" });
      } catch (err) {
        console.error("Conversion HEIC échouée:", err);
        // On continue avec le fichier original, ça peut quand même marcher
      }
    }

    const url = URL.createObjectURL(finalFile);
    setPreview(url);
    setFileName(finalFile.name);
    onPhotoSelect && onPhotoSelect(finalFile);
  };

  const isVideo = fileName && (fileName.toLowerCase().endsWith(".mp4") || fileName.toLowerCase().endsWith(".mov") || fileName.toLowerCase().endsWith(".avi"));

  return (
    <div style={{ marginBottom: 14 }}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFile}
        style={{ display: "none" }}
        id={inputId}
      />
      {sizeError && (
        <div style={{ background: "#FFF0EE", color: "#C0392B", fontSize: 11, padding: "8px 12px", borderRadius: 10, marginBottom: 8 }}>
          ⚠️ {sizeError}
        </div>
      )}
      <label htmlFor={inputId} style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        width: "100%", aspectRatio: "4/3",
        background: C.card,
        borderRadius: 16, border: (preview && !previewFailed) ? "none" : "2px dashed rgba(26,23,20,0.15)",
        cursor: "pointer", overflow: "hidden", position: "relative",
      }}>
        {preview && !previewFailed && !isVideo ? (
          <>
            <img
              src={preview}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
              onError={() => setPreviewFailed(true)}
            />
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(26,23,20,0.6)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8 }}>Changer 📷</div>
          </>
        ) : preview && isVideo ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
            <div style={{ fontSize: 40 }}>🎬</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Vidéo sélectionnée ✓</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>{fileName}</div>
            <div style={{ fontSize: 10, color: C.ink2, opacity: 0.7 }}>Appuie pour changer</div>
          </div>
        ) : preview && previewFailed ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
            <div style={{ fontSize: 40 }}>📷</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Photo sélectionnée ✓</div>
            <div style={{ fontSize: 10, color: C.ink2 }}>Aperçu non disponible — la photo sera quand même envoyée</div>
            <div style={{ fontSize: 10, color: C.ink2, opacity: 0.7 }}>Appuie pour changer</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.4 }}>📷</div>
            <div style={{ fontSize: 11, color: C.ink2, fontWeight: 500 }}>Ajouter une photo ou vidéo</div>
            <div style={{ fontSize: 10, color: C.ink2, opacity: 0.6, marginTop: 3 }}>Appuie ici pour choisir depuis ta galerie</div>
          </>
        )}
      </label>
    </div>
  );
}

// ─── MAG LINK ───
function MagLink({ defaultLinked }) {
  const [linked, setLinked] = useState(defaultLinked || false);
  return (
    <div onClick={() => setLinked(!linked)} style={{
      display: "flex", alignItems: "center", gap: 10,
      background: linked ? C.proBg : C.card,
      borderRadius: 14, border: `1.5px solid ${linked ? C.proBg : C.border}`,
      padding: "10px 12px", cursor: "pointer", marginBottom: 14,
    }}>
      <span style={{ fontSize: 20 }}>🏪</span>
      <span style={{
        fontSize: 12, fontWeight: linked ? 600 : 500,
        color: linked ? C.pro : C.ink2, flex: 1,
      }}>{linked ? "Atelier Mona" : "Associer un commerce du quartier"}</span>
      <span style={{ fontSize: 14, color: C.ink2 }}>{linked ? "✕" : "→"}</span>
    </div>
  );
}

// ─── PEPITE TOGGLE ───
function PepiteToggle() {
  const [on, setOn] = useState(false);
  return (
    <div onClick={() => setOn(!on)} style={{
      display: "flex", alignItems: "center", gap: 10,
      background: on ? "#F5F0FF" : C.card,
      borderRadius: 14, border: `1.5px solid ${on ? "#7C3AED" : C.border}`,
      padding: "10px 12px", marginBottom: 14, cursor: "pointer",
    }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Marquer comme Pépite</div>
        <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>+25 XP si validé par la communauté</div>
      </div>
      <div style={{
        width: 34, height: 20, borderRadius: 10,
        background: on ? "#7C3AED" : C.pill,
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: on ? 16 : 2,
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ─── FORM: TROUVAILLE ───
function FormDecouverte({ content, onChange, onPhotoSelect, activeTags, onTagToggle }) {
  return (
    <>
      <PhotoZone onPhotoSelect={onPhotoSelect} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Description</label>
        <textarea value={content} onChange={e => onChange(e.target.value)} placeholder="Partage ta trouvaille avec le quartier..." style={{
          width: "100%", padding: "10px 12px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: C.ink, background: C.card, outline: "none",
          resize: "none", height: 80, lineHeight: 1.5, boxSizing: "border-box",
        }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink defaultLinked={true} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Tags</label>
        <TagPills
          tags={[
            { label: "Lin" }, { label: "Vintage" }, { label: "Été" },
            { label: "Vide-grenier" }, { label: "Seconde main" }, { label: "Mode durable" },
          ]}
          activeTags={activeTags}
          onToggle={onTagToggle}
        />
      </div>
      <PepiteToggle />
    </>
  );
}

// ─── FORM: LIEU ───
function FormLieu({ fields, onChange, onPhotoSelect }) {
  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 12,
    border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
    fontSize: 12, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box",
  };
  const LIEU_TYPES = ["🌳 Parc", "🌊 Bord de l'eau", "🌿 Nature", "☕ Café caché", "🛍️ Adresse mode", "📸 Spot photo", "🏡 Quartier"];
  return (
    <>
      <PhotoZone onPhotoSelect={onPhotoSelect} zoneId="photo-lieu" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Nom du lieu *</label>
        <input type="text" value={fields.nom} onChange={e => onChange("nom", e.target.value)} placeholder="ex : Parc des Buttes, bord du canal…" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Pourquoi tu l'aimes ?</label>
        <textarea value={fields.desc} onChange={e => onChange("desc", e.target.value)} placeholder="Raconte ce qui rend cet endroit spécial…" style={{ ...inputStyle, resize: "none", height: 80, lineHeight: 1.5 }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Type de lieu</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {LIEU_TYPES.map(t => (
            <button key={t} onClick={() => onChange("type", fields.type === t ? "" : t)} style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 20,
              border: `1.5px solid ${fields.type === t ? C.ink : C.border}`,
              background: fields.type === t ? C.ink : C.card,
              color: fields.type === t ? "#fff" : C.ink2,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── FORM: SORTIE ───
const SORTIE_TYPES = ["Vide-grenier", "Marché", "Fête", "Concert", "Sport", "Expo", "Gratuit"];

function FormSortie({ fields, onChange }) {
  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 12,
    border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
    fontSize: 12, color: C.ink, background: C.card, outline: "none", boxSizing: "border-box",
  };
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Titre de la sortie *</label>
        <input type="text" value={fields.title} onChange={e => onChange("title", e.target.value)} placeholder="ex : Vide-grenier de la Plaine" style={inputStyle} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Date</label>
          <input type="date" value={fields.date} onChange={e => onChange("date", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Heure</label>
          <input type="time" value={fields.time} onChange={e => onChange("time", e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lieu</label>
        <input type="text" value={fields.lieu} onChange={e => onChange("lieu", e.target.value)} placeholder="ex : Place Jean Jaurès" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Description (optionnel)</label>
        <textarea value={fields.desc} onChange={e => onChange("desc", e.target.value)} placeholder="Donne envie aux voisins d'y aller..." style={{ ...inputStyle, resize: "none", height: 80, lineHeight: 1.5 }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Type de sortie</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {SORTIE_TYPES.map(t => (
            <button key={t} onClick={() => onChange("type", fields.type === t ? "" : t)} style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 20,
              border: `1.5px solid ${fields.type === t ? C.ink : C.border}`,
              background: fields.type === t ? C.ink : C.card,
              color: fields.type === t ? "#fff" : C.ink2,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── FORM: BON PLAN ───
function FormBonPlan({ content, onChange, onPhotoSelect, activeTags, onTagToggle }) {
  return (
    <>
      <PhotoZone onPhotoSelect={onPhotoSelect} zoneId="photo-bonplan" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Ton conseil ou adresse *</label>
        <textarea value={content} onChange={e => onChange(e.target.value)} placeholder="Partage ton bon plan avec les voisins..." style={{
          width: "100%", padding: "10px 12px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: C.ink, background: C.card, outline: "none",
          resize: "none", height: 80, lineHeight: 1.5, boxSizing: "border-box",
        }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Tags</label>
        <TagPills
          tags={[{ label: "Adresse" }, { label: "Astuce" }, { label: "Promo" }, { label: "Qualité" }, { label: "Petit prix" }]}
          activeTags={activeTags}
          onToggle={onTagToggle}
        />
      </div>
    </>
  );
}

// ─── SUCCESS SCREEN ───
function SuccessScreen({ type, onBack }) {
  const msgs = {
    decouverte: "Ta trouvaille est maintenant visible par tous les voisins du quartier. 🛍️",
    lieu: "Ton spot est partagé ! Les voisins vont adorer le découvrir. 📍",
    sortie: "La sortie est ajoutée à la page Sorties. Les voisins peuvent maintenant dire qu'ils y vont !",
    bonplan: "Ton bon plan est partagé avec le quartier ! 💡",
  };
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Post publié !</div>
      <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 24 }}>{msgs[type] || msgs.decouverte}</div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#FFF8E8", color: "#B45309", fontSize: 13, fontWeight: 700,
        padding: "8px 18px", borderRadius: 20, marginBottom: 24,
      }}>⚡ +10 XP gagnés</div>
      <button onClick={onBack} style={{
        width: "100%", padding: 13, borderRadius: 16,
        background: C.accent, color: "#fff",
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
        border: "none", cursor: "pointer",
      }}>Retour au fil</button>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurNouveauPost({ setPage, user, profile }) {
  const [screen, setScreen] = useState("form");
  const [selectedType, setSelectedType] = useState("decouverte");
  const [content, setContent] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  // Tags (partagé entre trouvaille et bon plan)
  const [activeTags, setActiveTags] = useState([]);
  const handleTagToggle = (label) =>
    setActiveTags(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  // Sortie fields
  const [sortieFields, setSortieFields] = useState({ title: "", date: "", time: "", lieu: "", desc: "", type: "" });
  const updateSortieField = (key, val) => setSortieFields(prev => ({ ...prev, [key]: val }));
  // Lieu fields
  const [lieuFields, setLieuFields] = useState({ nom: "", desc: "", type: "" });
  const updateLieuField = (key, val) => setLieuFields(prev => ({ ...prev, [key]: val }));
  // Photo pour lieu (séparée de la photo post normal)
  const [lieuPhotoFile, setLieuPhotoFile] = useState(null);

  const types = [
    { id: "decouverte", icon: "🛍️", name: "Trouvaille", desc: "Une pièce chinée, un coup de cœur mode", grad: "linear-gradient(135deg,#FF5733,#FF8C42)", light: "#FFF3F0" },
    { id: "lieu", icon: "📍", name: "Lieu", desc: "Un spot nature, un endroit à découvrir", grad: "linear-gradient(135deg,#0F766E,#34D399)", light: "#F0FDF9" },
    { id: "sortie", icon: "🎉", name: "Sortie", desc: "Un événement, une sortie à partager", grad: "linear-gradient(135deg,#7C3AED,#A78BFA)", light: "#F5F3FF" },
    { id: "bonplan", icon: "💡", name: "Bon plan", desc: "Un conseil, une adresse à ne pas rater", grad: "linear-gradient(135deg,#B45309,#F7A72D)", light: "#FFFBEB" },
  ];

  const handlePublish = async () => {
    if (!user?.id) { setPublishError("Tu dois être connecté pour publier."); return; }
    setPublishing(true);
    setPublishError("");

    // ── CAS SORTIE ──
    if (selectedType === "sortie") {
      if (!sortieFields.title.trim()) {
        setPublishing(false);
        setPublishError("Le titre de la sortie est obligatoire !");
        return;
      }
      const { error } = await supabase.from("sorties").insert({
        author_id: user.id,
        title: sortieFields.title.trim(),
        date_text: sortieFields.date.trim() || null,
        time_text: sortieFields.time.trim() || null,
        lieu: sortieFields.lieu.trim() || null,
        description: sortieFields.desc.trim() || null,
        type: sortieFields.type || null,
        ville: profile?.quartier || "Saint-Dié-des-Vosges",
      });
      setPublishing(false);
      if (error) {
        console.error("Sortie insert error:", error);
        setPublishError("Erreur Supabase : " + error.message);
        return;
      }
      setScreen("success");
      return;
    }

    // ── CAS LIEU ──
    if (selectedType === "lieu") {
      if (!lieuFields.nom.trim() && !lieuFields.desc.trim()) {
        setPublishing(false);
        setPublishError("Ajoute un nom de lieu ou une description !");
        return;
      }
      const nomLieu = lieuFields.nom.trim();
      const descLieu = lieuFields.desc.trim();
      const textContent = [nomLieu, lieuFields.type, descLieu].filter(Boolean).join(" — ");
      let image_url = null;
      if (lieuPhotoFile) {
        const ext = (lieuPhotoFile.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
        const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
        const { error: upErr } = await supabase.storage.from("images").upload(path, lieuPhotoFile, { contentType: lieuPhotoFile.type || "image/jpeg", upsert: false });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
          image_url = urlData.publicUrl;
        }
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: textContent,
        image_url,
        location: profile?.quartier || "Saint-Dié-des-Vosges",
        tags: lieuFields.type ? [lieuFields.type] : [],
      });
      setPublishing(false);
      if (error) { setPublishError("Erreur Supabase : " + error.message); return; }
      setScreen("success");
      return;
    }

    // ── CAS POST (trouvaille, bon plan) ──
    if (!content.trim()) { setPublishing(false); setPublishError("Écris quelque chose avant de publier !"); return; }

    let image_url = null;
    if (photoFile) {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","gif","webp","mp4","mov"].includes(ext) ? ext : "jpg";
      const contentType = photoFile.type && photoFile.type !== "" ? photoFile.type : "image/jpeg";
      const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, photoFile, { contentType, upsert: false });
      if (upErr) {
        setPublishing(false);
        setPublishError("❌ Upload photo échoué : " + upErr.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      image_url,
      location: profile?.quartier || "Saint-Dié-des-Vosges",
      tags: activeTags,
    });
    setPublishing(false);
    if (error) {
      console.error("Insert error:", error);
      setPublishError("Erreur Supabase : " + error.message);
      return;
    }
    setScreen("success");
  };

  const formMap = {
    decouverte: <FormDecouverte content={content} onChange={setContent} onPhotoSelect={setPhotoFile} activeTags={activeTags} onTagToggle={handleTagToggle} />,
    lieu: <FormLieu fields={lieuFields} onChange={updateLieuField} onPhotoSelect={setLieuPhotoFile} />,
    sortie: <FormSortie fields={sortieFields} onChange={updateSortieField} />,
    bonplan: <FormBonPlan content={content} onChange={setContent} onPhotoSelect={setPhotoFile} activeTags={activeTags} onTagToggle={handleTagToggle} />,
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>

        {screen === "form" && (
          <>
            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px 8px", borderBottom: `1px solid ${C.border}`,
              background: C.card, flexShrink: 0,
            }}>
              <button onClick={() => setPage("fil")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2, lineHeight: 1 }}>✕</button>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>Nouveau post</div>
              <button onClick={handlePublish} disabled={publishing} style={{
                background: publishing ? "#ccc" : C.accent, color: "#fff", border: "none", borderRadius: 20,
                padding: "6px 16px", fontSize: 12, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: publishing ? "not-allowed" : "pointer",
              }}>{publishing ? "..." : "Publier"}</button>
            </div>

            {publishError && (
              <div style={{ padding: "8px 16px", background: "#FFF0EE", color: "#C0392B", fontSize: 12 }}>⚠️ {publishError}</div>
            )}
            {/* Scroll area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
              {/* Type selection */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.ink2,
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
              }}>Que veux-tu partager ?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                {types.map(t => {
                  const isSelected = selectedType === t.id;
                  return (
                    <div key={t.id} onClick={() => { setSelectedType(t.id); setActiveTags([]); }} style={{
                      borderRadius: 20, cursor: "pointer", overflow: "hidden",
                      border: `2px solid ${isSelected ? "transparent" : C.border}`,
                      background: isSelected ? t.grad : C.card,
                      transition: "all 0.2s",
                      boxShadow: isSelected ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                    }}>
                      {/* Icône avec fond coloré */}
                      <div style={{
                        padding: "18px 16px 10px",
                        display: "flex", flexDirection: "column", gap: 8,
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 14,
                          background: isSelected ? "rgba(255,255,255,0.25)" : t.light,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20,
                        }}>{t.icon}</div>
                        <div>
                          <div style={{
                            fontSize: 14, fontWeight: 700,
                            fontFamily: "'Syne', sans-serif",
                            letterSpacing: -0.2,
                            lineHeight: 1.2,
                            color: isSelected ? "#fff" : C.ink,
                          }}>{t.name}</div>
                          <div style={{
                            fontSize: 11, lineHeight: 1.4, marginTop: 4,
                            fontFamily: "'DM Sans', sans-serif",
                            color: isSelected ? "rgba(255,255,255,0.82)" : C.ink2,
                          }}>{t.desc}</div>
                        </div>
                      </div>
                      {/* Barre indicatrice en bas */}
                      {isSelected && (
                        <div style={{ height: 3, background: "rgba(255,255,255,0.4)", margin: "0 16px 12px" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic form */}
              {formMap[selectedType]}
            </div>
          </>
        )}

        {screen === "success" && (
          <>
            <SuccessScreen type={selectedType} onBack={() => setPage("fil")} />
          </>
        )}
    </div>
  );
}
