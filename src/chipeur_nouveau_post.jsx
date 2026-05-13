import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import heic2any from "heic2any";
import { addXP } from "./chipeur_xp";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", accent2: "#F7A72D", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)",
};


// ─── TAG PILLS ───
function TagPills({ tags, activeTags, onToggle }) {
  const [customInput, setCustomInput] = useState("");

  // Tags custom = ceux dans activeTags mais pas dans les suggestions
  const predefinedLabels = tags.map(t => t.label);
  const customTags = activeTags.filter(t => !predefinedLabels.includes(t));

  const handleAddCustom = () => {
    const val = customInput.trim().replace(/^#+/, ""); // retire les # en trop
    if (!val || activeTags.includes(val)) { setCustomInput(""); return; }
    onToggle(val); // toggle = ajouter si absent
    setCustomInput("");
  };

  return (
    <div style={{ marginTop: 6 }}>
      {/* Suggestions + tags custom */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {tags.map(t => {
          const isActive = activeTags.includes(t.label);
          return (
            <button key={t.label} onClick={() => onToggle(t.label)} style={{
              fontSize: 11, padding: "6px 14px", borderRadius: 20, border: "none",
              background: isActive ? C.accent : C.pill,
              color: isActive ? "#fff" : C.ink2,
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
              boxShadow: isActive ? "0 2px 8px rgba(255,87,51,0.3)" : "none",
            }}>{t.label}</button>
          );
        })}
        {/* Tags custom ajoutés par l'utilisateur */}
        {customTags.map(t => (
          <button key={t} onClick={() => onToggle(t)} style={{
            fontSize: 11, padding: "6px 12px 6px 14px", borderRadius: 20, border: "none",
            background: C.accent, color: "#fff", fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: 5,
            boxShadow: "0 2px 8px rgba(255,87,51,0.3)",
          }}>
            {t}
            <span style={{ fontSize: 9, opacity: 0.8 }}>✕</span>
          </button>
        ))}
      </div>

      {/* Champ saisie libre */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); } }}
          placeholder="Ajouter une étiquette…"
          maxLength={30}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 20,
            border: `1.5px solid ${customInput.trim() ? C.accent : C.border}`,
            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            color: C.ink, background: C.card, outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        <button
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: customInput.trim() ? C.accent : C.pill,
            color: customInput.trim() ? "#fff" : C.ink2,
            fontSize: 18, cursor: customInput.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, transition: "all 0.15s", flexShrink: 0,
          }}
        >+</button>
      </div>
    </div>
  );
}

// ─── PHOTO ZONE ───
// externalPreview : URL contrôlée depuis le parent — source de vérité principale
function PhotoZone({ onPhotoSelect, zoneId, externalPreview }) {
  const [internalPreview, setInternalPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const inputId = zoneId || "photo-input-main";

  // On utilise externalPreview si fourni, sinon preview interne (sécurité)
  const preview = externalPreview !== undefined ? externalPreview : internalPreview;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSizeError("");
    setPreviewFailed(false);
    if (file.size > 50 * 1024 * 1024) { setSizeError("Fichier trop grand (max 50 Mo)."); return; }
    const isHeic = file.type === "image/heic" || file.type === "image/heif"
      || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
    let finalFile = file;
    if (isHeic) {
      try {
        const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        const blob = Array.isArray(result) ? result[0] : result;
        finalFile = new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
      } catch (err) { console.error("Conversion HEIC échouée:", err); }
    }
    const url = URL.createObjectURL(finalFile);
    setInternalPreview(url);
    setFileName(finalFile.name);
    onPhotoSelect && onPhotoSelect(finalFile, url); // on passe aussi l'URL au parent
  };

  const removePhoto = (e) => {
    e.preventDefault(); e.stopPropagation();
    setInternalPreview(null); setFileName("");
    onPhotoSelect && onPhotoSelect(null, null);
  };

  const isVideo = fileName && (fileName.toLowerCase().endsWith(".mp4") || fileName.toLowerCase().endsWith(".mov") || fileName.toLowerCase().endsWith(".avi"));

  return (
    <div style={{ marginBottom: 16 }}>
      <input type="file" accept="image/*,video/*,.heic,.heif" onChange={handleFile} style={{ display: "none" }} id={inputId} />
      {sizeError && (
        <div style={{ background: "#FFF0EE", color: "#C0392B", fontSize: 11, padding: "8px 12px", borderRadius: 10, marginBottom: 8 }}>⚠️ {sizeError}</div>
      )}
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "4/3" }}>
        <label htmlFor={inputId} style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%", cursor: "pointer",
          background: preview && !previewFailed
            ? "#000"
            : "linear-gradient(135deg, #1A1714 0%, #2D2520 50%, #1A1714 100%)",
          position: "relative",
        }}>
          {preview && !previewFailed && !isVideo ? (
            <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPreviewFailed(true)} />
          ) : preview && isVideo ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 44 }}>🎬</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Vidéo prête ✓</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Appuie pour changer</div>
            </div>
          ) : preview && previewFailed ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 44 }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Photo sélectionnée ✓</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "0 20px" }}>Aperçu indispo — la photo sera envoyée</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "0 20px", textAlign: "center" }}>
              {/* Icône cercle */}
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px dashed rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Ajouter une photo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Galerie · Appareil photo · Vidéo</div>
            </div>
          )}

          {/* Overlay "Changer" si photo présente */}
          {preview && !previewFailed && (
            <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "5px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
              📷 Changer
            </div>
          )}
        </label>

        {/* Bouton ✕ supprimer */}
        {preview && (
          <button onClick={removePhoto} style={{
            position: "absolute", top: 10, right: 10, width: 30, height: 30,
            borderRadius: "50%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
            border: "none", color: "#fff", fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── MAG LINK ─── (état contrôlé depuis le parent)
function MagLink({ selectedId, selectedNom, onSelect, onSelectNom }) {
  const [merchants, setMerchants] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("profiles")
      .select("id, pseudo, avatar_url")
      .in("role", ["magasin", "artisan", "commercant"])
      .order("pseudo")
      .then(({ data }) => setMerchants(data || []));
  }, []);

  const selected = merchants.find(m => m.id === selectedId);
  const normalize = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const filtered = search.trim()
    ? merchants.filter(m => normalize(m.pseudo).includes(normalize(search)))
    : merchants;
  const hasResult = filtered.length > 0;
  const isSelected = selectedId || selectedNom;

  function clear() { onSelect(null); onSelectNom(""); setSearch(""); setOpen(false); }

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Bouton principal */}
      <div onClick={() => isSelected ? clear() : setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 10,
        background: isSelected ? C.proBg : C.card,
        borderRadius: 14, border: `1.5px solid ${isSelected ? C.pro : C.border}`,
        padding: "10px 12px", cursor: "pointer",
      }}>
        <span style={{ fontSize: 20 }}>🏪</span>
        <span style={{ fontSize: 12, fontWeight: isSelected ? 600 : 500, color: isSelected ? C.pro : C.ink2, flex: 1 }}>
          {selected ? selected.pseudo : selectedNom ? `🔖 ${selectedNom}` : "Associer un commerce du quartier"}
        </span>
        <span style={{ fontSize: 14, color: C.ink2 }}>{isSelected ? "✕" : "→"}</span>
      </div>

      {/* Panneau déroulé */}
      {open && !isSelected && (
        <div style={{ marginTop: 6, background: C.card, borderRadius: 12, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>
          {/* Champ de recherche */}
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher ou taper le nom du commerce…"
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: dm, fontSize: 12, color: C.ink, background: C.bg, outline: "none" }}
            />
          </div>

          {/* Liste filtrée */}
          {hasResult ? (
            filtered.map((m, i) => (
              <div key={m.id} onClick={() => { onSelect(m.id); onSelectNom(""); setSearch(""); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                cursor: "pointer", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.proBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏪</div>
                }
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{m.pseudo}</span>
              </div>
            ))
          ) : search.trim() ? (
            /* Aucun résultat → saisie libre */
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: C.ink2, marginBottom: 10 }}>
                Ce commerce n'est pas encore inscrit sur Chipeur.
              </div>
              <button
                onClick={() => { onSelectNom(search.trim()); onSelect(null); setOpen(false); }}
                style={{ width: "100%", background: C.proBg, border: `1.5px solid ${C.pro}`, borderRadius: 12, padding: "9px 0", fontSize: 12, fontWeight: 700, color: C.pro, cursor: "pointer", fontFamily: dm }}
              >
                🔖 Associer "{search.trim()}"
              </button>
              <div style={{ fontSize: 10, color: C.ink2, marginTop: 6, lineHeight: 1.4, textAlign: "center" }}>
                Il sera notifié dès qu'il rejoindra Chipeur.
              </div>
            </div>
          ) : (
            <div style={{ padding: "12px 14px", fontSize: 12, color: C.ink2 }}>Aucun commerce inscrit pour l'instant</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PEPITE TOGGLE ─── (état contrôlé depuis le parent)
function PepiteToggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
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

// ─── CHAMP LIEN ───
function LinkInput({ value, onChange }) {
  const isValid = value.trim() && (value.startsWith("http://") || value.startsWith("https://"));
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>🔗 Ajouter un lien (optionnel)</label>
      <div style={{ position: "relative" }}>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://youtube.com/..."
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 12,
            border: `1.5px solid ${isValid ? C.accent : C.border}`,
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: C.ink, background: C.card, outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      {value.trim() && !isValid && (
        <div style={{ fontSize: 10, color: "#E53935", marginTop: 3 }}>Le lien doit commencer par https://</div>
      )}
      {isValid && (
        <div style={{ fontSize: 10, color: "#16a34a", marginTop: 3 }}>✅ Lien valide</div>
      )}
    </div>
  );
}

// ─── FORM: TROUVAILLE ───
function FormDecouverte({ content, onChange, onPhotoSelect, photoPreview, activeTags, onTagToggle, pepiteOn, onPepiteChange, magasinId, magasinNom, onMagasinSelect, onMagasinNom, linkUrl, onLinkChange }) {
  return (
    <>
      <PhotoZone onPhotoSelect={onPhotoSelect} externalPreview={photoPreview} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
        <textarea value={content} onChange={e => onChange(e.target.value)} placeholder="Raconte ce moment au quartier..." style={{
          width: "100%", padding: "14px", borderRadius: 14,
          border: `2px solid ${content.trim() ? C.accent : C.border}`,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: C.ink, background: C.card, outline: "none",
          resize: "none", minHeight: 90, lineHeight: 1.6, boxSizing: "border-box",
          transition: "border-color 0.2s",
        }} />
        <div style={{ fontSize: 10, color: content.trim() ? "#16a34a" : C.ink2, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          {content.trim() ? "✅ Super, les voisins vont adorer !" : "💡 Une description = plus de réactions"}
          <span style={{ marginLeft: "auto", color: C.ink2 }}>{content.length}/300</span>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink selectedId={magasinId} selectedNom={magasinNom} onSelect={onMagasinSelect} onSelectNom={onMagasinNom} />
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
      <LinkInput value={linkUrl} onChange={onLinkChange} />
      <PepiteToggle on={pepiteOn} onChange={onPepiteChange} />
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
function FormBonPlan({ content, onChange, onPhotoSelect, photoPreview, activeTags, onTagToggle, magasinId, magasinNom, onMagasinSelect, onMagasinNom, linkUrl, onLinkChange }) {
  return (
    <>
      <PhotoZone onPhotoSelect={onPhotoSelect} zoneId="photo-bonplan" externalPreview={photoPreview} />
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
        <MagLink selectedId={magasinId} selectedNom={magasinNom} onSelect={onMagasinSelect} onSelectNom={onMagasinNom} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Tags</label>
        <TagPills
          tags={[{ label: "Adresse" }, { label: "Astuce" }, { label: "Promo" }, { label: "Qualité" }, { label: "Petit prix" }]}
          activeTags={activeTags}
          onToggle={onTagToggle}
        />
      </div>
      <LinkInput value={linkUrl} onChange={onLinkChange} />
    </>
  );
}

// ─── POPUP DROIT À L'IMAGE ───
function DroitImagePopup({ onConfirm, onCancel }) {
  const [nePlusAfficher, setNePlusAfficher] = useState(false);
  const handlePublier = () => {
    if (nePlusAfficher) localStorage.setItem("chipeur_droitimage_ok", "1");
    onConfirm();
  };
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,23,20,0.55)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 200, padding: "0 0 0 0",
    }}>
      <div style={{
        background: C.card, borderRadius: "24px 24px 0 0",
        padding: "24px 20px 32px", width: "100%", maxWidth: 480,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>
          📸 Avant de publier
        </div>
        <div style={{ fontSize: 12, color: C.ink2, marginBottom: 16, lineHeight: 1.5 }}>
          En publiant ce contenu, vous confirmez :
        </div>
        {[
          "être l'auteur·rice de la photo ou vidéo, ou disposer des droits nécessaires à sa diffusion",
          "avoir obtenu l'accord des personnes identifiables apparaissant sur le contenu",
          "que ce contenu respecte les CGU de Chipeur",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%", background: C.proBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: C.pro, flexShrink: 0, marginTop: 1,
            }}>✓</div>
            <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{item}</div>
          </div>
        ))}
        <div style={{
          fontSize: 10, color: C.ink2, background: C.pill, borderRadius: 10,
          padding: "8px 12px", marginBottom: 16, lineHeight: 1.5,
        }}>
          Chipeur ne pourra être tenu responsable en cas de non-respect de ces engagements.
        </div>
        <div
          onClick={() => setNePlusAfficher(!nePlusAfficher)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer" }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${nePlusAfficher ? C.accent : C.border}`,
            background: nePlusAfficher ? C.accent : C.card,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {nePlusAfficher && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: C.ink2 }}>Ne plus afficher ce message</span>
        </div>
        <button onClick={handlePublier} style={{
          width: "100%", background: C.accent, color: "#fff", border: "none",
          borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginBottom: 10,
        }}>Publier</button>
        <button onClick={onCancel} style={{
          width: "100%", background: "none", color: C.ink2, border: "none",
          fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Annuler</button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ───
function SuccessScreen({ type, onBack }) {
  const msgs = {
    decouverte:  "Ta chope est maintenant visible par tous les voisins ! 📸",
    tuvalides:   "Tes voisins vont voter pour toi ! Résultat dans le fil. 🤔",
    recherche:   "Ta demande est publiée ! Les voisins vont te répondre. 🔍",
    lieu:        "Ton spot est partagé ! Les voisins vont adorer le découvrir. 📍",
    bonplan:     "Ta reco est partagée avec le quartier ! 💡",
    promo:       "Ta promo est visible sur ta fiche commerce. 🏷️",
    defi_voisin: "Ton défi est lancé ! Les voisins peuvent y participer. 🏆",
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

// ─── FORM TU VALIDES ?! ───
const TV_CATS = ["👗 Mode","👟 Chaussures","🏠 Déco","💄 Beauté","📱 Tech","🎒 Accessoires","🍳 Cuisine","✨ Autre"];

function FormTuValides({ content, onChange, onPhotoSelect, photoPreview, tvCat, onCatChange, magasinId, magasinNom, onMagasinSelect, onMagasinNom }) {
  return (
    <div>
      <div style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#6D28D9", lineHeight: 1.5 }}>
        🤔 Montre ce sur quoi tu hésites — tes voisins valident <b>oui</b> ou <b>non</b> !
      </div>
      <PhotoZone onPhotoSelect={onPhotoSelect} zoneId="photo-tuvalides" externalPreview={photoPreview} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6560", marginBottom: 8, display: "block" }}>Catégorie (optionnel)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TV_CATS.map(cat => {
            const on = tvCat === cat;
            return (
              <button key={cat} type="button" onClick={() => onCatChange(on ? "" : cat)} style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 20, border: "none",
                background: on ? "#8B5CF6" : "#EDEBE8",
                color: on ? "#fff" : "#6B6560",
                fontWeight: on ? 700 : 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}>{cat}</button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6560", marginBottom: 5, display: "block" }}>Lier à un magasin (optionnel)</label>
        <MagLink selectedId={magasinId} selectedNom={magasinNom} onSelect={onMagasinSelect} onSelectNom={onMagasinNom} />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6560", marginBottom: 5, display: "block" }}>Dis-nous en plus (optionnel)</label>
        <textarea value={content} onChange={e => onChange(e.target.value)} placeholder="ex : J'adore mais le prix me retient… Qu'est-ce que vous en pensez ?" rows={3} style={{
          width: "100%", boxSizing: "border-box", padding: "11px 14px",
          borderRadius: 14, border: "1.5px solid rgba(26,23,20,0.08)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1A1714",
          background: "#fff", outline: "none", resize: "none", lineHeight: 1.5,
        }} />
      </div>
    </div>
  );
}

const RECHERCHE_CATS = ["🎨 Artisan","🍽️ Resto","👗 Mode","🔧 Services","🏠 Maison","💄 Beauté","📚 Culture","🏃 Sport","🧀 Alimentation","✨ Autre"];

// ─── FORM JE CHERCHE ───
function FormRecherche({ content, onChange, rechercheTag, onTagChange }) {
  const inp = { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 14, border: `1.5px solid rgba(26,23,20,0.08)`, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1A1714", background: "#fff", outline: "none" };
  return (
    <div>
      <div style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#0369A1", lineHeight: 1.5 }}>
        🔍 Tu cherches un artisan, une adresse, un service ? Demande à tes voisins !
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6560", marginBottom: 8, display: "block" }}>Catégorie</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {RECHERCHE_CATS.map(cat => {
            const on = rechercheTag === cat;
            return (
              <button key={cat} type="button" onClick={() => onTagChange(on ? "" : cat)} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, border: "none", background: on ? "#0EA5E9" : "#EDEBE8", color: on ? "#fff" : "#6B6560", fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6560", marginBottom: 5, display: "block" }}>Qu'est-ce que tu cherches ? *</label>
        <textarea value={content} onChange={e => onChange(e.target.value)} placeholder="ex : Je cherche un bon plombier à Saint-Dié, quelqu'un a une adresse ? 🙏" rows={4} style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function ChipeurNouveauPost({ setPage, user, profile, editPost, setEditPost, autoCreateSortie, setAutoCreateSortie }) {
  const [screen, setScreen] = useState("choose"); // "choose" | "form" | "success"
  const [selectedType, setSelectedType] = useState("decouverte");
  const [content, setContent] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null); // URL blob pour affichage contrôlé
  const [publishing, setPublishing] = useState(false);

  // Callback centralisé pour la sélection/suppression photo (chope + bon plan)
  const handlePhotoSelect = (file, url) => {
    setPhotoFile(file || null);
    setPhotoPreview(url || null);
  };
  const [publishError, setPublishError] = useState("");
  const [showDroitImage, setShowDroitImage] = useState(false);
  // Tags (partagé entre trouvaille et bon plan)
  const [activeTags, setActiveTags] = useState([]);
  const handleTagToggle = (label) =>
    setActiveTags(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  // ✅ Pépite et MagLink remontés ici pour être pris en compte à la publication
  const [pepiteOn, setPepiteOn] = useState(false);
  const [magasinId, setMagasinId] = useState(null);
  const [magasinNom, setMagasinNom] = useState("");
  // Sortie fields
  const [sortieFields, setSortieFields] = useState({ title: "", date: "", time: "", lieu: "", desc: "", type: "" });
  const updateSortieField = (key, val) => setSortieFields(prev => ({ ...prev, [key]: val }));
  // Lieu fields
  const [lieuFields, setLieuFields] = useState({ nom: "", desc: "", type: "" });
  const updateLieuField = (key, val) => setLieuFields(prev => ({ ...prev, [key]: val }));
  // Défi voisin fields
  const [defiFields, setDefiFields] = useState({ title: "", description: "", ends_at: "" });
  const updateDefiField = (key, val) => setDefiFields(prev => ({ ...prev, [key]: val }));
  // Lien externe
  const [linkUrl, setLinkUrl] = useState("");
  // Photo pour lieu (séparée de la photo post normal)
  const [lieuPhotoFile, setLieuPhotoFile] = useState(null);
  // Tu valides ?! fields
  const [tvCat, setTvCat] = useState("");
  // Je cherche fields
  const [rechercheTag, setRechercheTag] = useState("");

  // ── Mode édition : pré-remplir les champs + aller direct au formulaire ──
  useEffect(() => {
    if (!editPost) return;
    const type = editPost.post_type || "decouverte";
    setSelectedType(type);
    setScreen("form");
    setContent(editPost.content || "");
    setActiveTags(Array.isArray(editPost.tags) ? editPost.tags : []);
    setLinkUrl(editPost.link_url || "");
    setMagasinId(editPost.magasin_id || null);
    if (editPost.image_url) setPhotoPreview(editPost.image_url);
    // Lieu : essayer de décomposer le contenu
    if (type === "lieu" && editPost.content) {
      const parts = editPost.content.split(" — ");
      setLieuFields({
        nom:  parts[0] || "",
        type: parts[1] || "",
        desc: parts[2] || "",
      });
      if (editPost.image_url) setPhotoPreview(editPost.image_url);
    }
  }, [editPost?.id]);

  const isEditMode = !!editPost?.id;
  const isMagasin = profile?.role === "magasin";
  const types = isMagasin ? [
    { id: "decouverte",  icon: "📸", name: "Chope",        desc: "Un instant, une trouvaille, une nouveauté à partager",       grad: "linear-gradient(135deg,#FF5733,#FF8C42)", light: "#FFF3F0" },
    { id: "promo",       icon: "🏷️", name: "Promo",        desc: "Une réduction ou une offre spéciale pour tes voisins",       grad: "linear-gradient(135deg,#B45309,#F7A72D)", light: "#FFFBEB" },
    { id: "sortie",      icon: "📅", name: "Événement",    desc: "Crée un événement et invite tes voisins à venir",            grad: "linear-gradient(135deg,#7C3AED,#A78BFA)", light: "#F5F3FF", isRedirect: true },
    { id: "lieu",        icon: "📍", name: "Un lieu",      desc: "Un spot, un endroit à faire découvrir autour de toi",        grad: "linear-gradient(135deg,#0F766E,#34D399)", light: "#F0FDF9" },
  ] : [
    { id: "decouverte",  icon: "📸", name: "Chope",        desc: "Un achat, un instant sympa, une trouvaille du jour",         grad: "linear-gradient(135deg,#FF5733,#FF8C42)", light: "#FFF3F0" },
    { id: "tuvalides",   icon: "🤔", name: "Tu valides !!!", desc: "Tu craques sur quelque chose ? Tes voisins votent oui/non", grad: "linear-gradient(135deg,#8B5CF6,#C4B5FD)", light: "#F5F3FF" },
    { id: "recherche",   icon: "🔍", name: "Je cherche",   desc: "Tu cherches un artisan, un service, un produit ?",           grad: "linear-gradient(135deg,#0EA5E9,#38BDF8)", light: "#F0F9FF" },
    { id: "bonplan",     icon: "💡", name: "Je recommande",desc: "Une adresse top, un bon plan à ne pas rater",                grad: "linear-gradient(135deg,#B45309,#F7A72D)", light: "#FFFBEB" },
    { id: "lieu",        icon: "📍", name: "Un lieu",      desc: "Un spot, un endroit à faire découvrir aux voisins",          grad: "linear-gradient(135deg,#0F766E,#34D399)", light: "#F0FDF9" },
    { id: "sortie",      icon: "📅", name: "Événement",    desc: "Crée un événement et invite tes voisins à venir",            grad: "linear-gradient(135deg,#7C3AED,#A78BFA)", light: "#F5F3FF", isRedirect: true },
    { id: "defi_voisin", icon: "🏆", name: "Défi",         desc: "Lance un défi photo avec une récompense à la clé",          grad: "linear-gradient(135deg,#FF5733,#F7A72D)", light: "#FFF8E8" },
  ];

  const handlePublishClick = () => {
    if (localStorage.getItem("chipeur_droitimage_ok") === "1") {
      handlePublish();
    } else {
      setShowDroitImage(true);
    }
  };

  const handlePublish = async () => {
    if (!user?.id) { setPublishError("Tu dois être connecté pour publier."); return; }
    setPublishing(true);
    setPublishError("");

    // ── MODE ÉDITION ──
    if (isEditMode) {
      let image_url = editPost.image_url; // garde l'existante par défaut

      // Upload nouvelle photo si sélectionnée
      const uploadFile = selectedType === "lieu" ? lieuPhotoFile : photoFile;
      if (uploadFile) {
        const ext = (uploadFile.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
        const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
        const { error: upErr } = await supabase.storage.from("images").upload(path, uploadFile, { contentType: uploadFile.type || "image/jpeg", upsert: false });
        if (upErr) { setPublishing(false); setPublishError("❌ Upload photo échoué : " + upErr.message); return; }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const textContent = selectedType === "lieu"
        ? [lieuFields.nom.trim(), lieuFields.type, lieuFields.desc.trim()].filter(Boolean).join(" — ")
        : content.trim();

      const { error } = await supabase.from("posts").update({
        content: textContent,
        image_url,
        tags: selectedType === "lieu" ? (lieuFields.type ? [lieuFields.type] : []) : (pepiteOn ? [...activeTags, "Pépite ⭐"] : activeTags),
        link_url: (linkUrl.trim().startsWith("http://") || linkUrl.trim().startsWith("https://")) ? linkUrl.trim() : null,
        magasin_id: magasinId || null,
      }).eq("id", editPost.id);

      setPublishing(false);
      if (error) { setPublishError("Erreur Supabase : " + error.message); return; }
      setEditPost?.(null);
      setPage("profil");
      return;
    }

    // ── CAS SORTIE ──
    if (selectedType === "sortie") {
      if (!sortieFields.title.trim()) {
        setPublishing(false);
        setPublishError("Le titre de la sortie est obligatoire !");
        return;
      }
      // ✅ Fix : convertir YYYY-MM-DD → DD/MM/YYYY pour que la page Événements affiche bien la date
      let dateText = null;
      if (sortieFields.date) {
        const [y, m, d] = sortieFields.date.split("-");
        dateText = `${d}/${m}/${y}`;
      }
      const { error } = await supabase.from("sorties").insert({
        author_id: user.id,
        title: sortieFields.title.trim(),
        date_text: dateText,
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
      // ✅ Fix : XP pour création d'une sortie
      addXP(user.id, 10, "sortie_publiee");
      setScreen("success");
      return;
    }

    // ── CAS TU VALIDES ?! ──
    if (selectedType === "tuvalides") {
      if (!photoFile && !content.trim()) {
        setPublishing(false);
        setPublishError("Ajoute une photo ou dis-nous en plus !");
        return;
      }
      let image_url = null;
      if (photoFile) {
        const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
        const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
        const { error: upErr } = await supabase.storage.from("images").upload(path, photoFile, { contentType: photoFile.type || "image/jpeg", upsert: false });
        if (upErr) { setPublishing(false); setPublishError("❌ Upload photo échoué : " + upErr.message); return; }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: content.trim() || null,
        image_url,
        post_type: "tuvalides",
        location: profile?.quartier || "Saint-Dié-des-Vosges",
        tags: tvCat ? [tvCat] : [],
        magasin_id: magasinId || null,
        magasin_nom: magasinNom || null,
        linked_status: magasinId ? "pending" : null,
      });
      setPublishing(false);
      if (error) { setPublishError("Erreur : " + error.message); return; }
      addXP(user.id, 10, "tuvalides_publie");
      setScreen("success");
      return;
    }

    // ── CAS JE CHERCHE ──
    if (selectedType === "recherche") {
      if (!content.trim()) {
        setPublishing(false);
        setPublishError("Décris ce que tu cherches !");
        return;
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: content.trim(),
        post_type: "recherche",
        location: profile?.quartier || "Saint-Dié-des-Vosges",
        tags: rechercheTag ? [rechercheTag, "Je cherche 🔍"] : ["Je cherche 🔍"],
      });
      setPublishing(false);
      if (error) { setPublishError("Erreur : " + error.message); return; }
      addXP(user.id, 5, "recherche_publie");
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
        content: textContent,
        image_url,
        location: profile?.quartier || "Saint-Dié-des-Vosges",
        tags: lieuFields.type ? [lieuFields.type] : [],
        post_type: "lieu",
      });
      setPublishing(false);
      if (error) { setPublishError("Erreur Supabase : " + error.message); return; }
      // ✅ Fix : XP pour publication d'un lieu
      addXP(user.id, 10, "lieu_publie");
      setScreen("success");
      return;
    }

    // ── CAS DÉFI VOISIN ──
    if (selectedType === "defi_voisin") {
      if (!defiFields.title.trim()) {
        setPublishing(false);
        setPublishError("Le titre du défi est obligatoire.");
        return;
      }
      if (!defiFields.ends_at) {
        setPublishing(false);
        setPublishError("La date limite est obligatoire.");
        return;
      }
      // Photo de couverture (optionnelle)
      let photo_url = null;
      if (photoFile) {
        const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg","jpeg","png","gif","webp"].includes(ext) ? ext : "jpg";
        const path = `posts/${user.id}/${Date.now()}.${safeExt}`;
        const { error: upErr } = await supabase.storage.from("images").upload(path, photoFile, { contentType: photoFile.type || "image/jpeg", upsert: false });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
          photo_url = urlData.publicUrl;
        }
      }
      const { error } = await supabase.from("defis").insert({
        user_id: user.id,
        title: defiFields.title.trim(),
        description: defiFields.description.trim() || null,
        ends_at: defiFields.ends_at,
        photo_url,
        emoji: "🏆",
        type: "voisin",
        reward: "50 XP 🏆",
        ended: false,
      });
      setPublishing(false);
      if (error) { setPublishError("Erreur : " + error.message); return; }
      addXP(user.id, 5, "defi_cree");
      setScreen("success");
      return;
    }

    // ── CAS POST (trouvaille, bon plan) ──
    if (!content.trim() && !photoFile) { setPublishing(false); setPublishError("Ajoute une photo ou écris quelque chose !"); return; }

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

    // ✅ Pépite : ajoute le tag "Pépite ⭐" si activé
    const finalTags = pepiteOn ? [...activeTags, "Pépite ⭐"] : activeTags;

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      image_url,
      location: profile?.quartier || "Saint-Dié-des-Vosges",
      tags: finalTags,
      post_type: selectedType, // "decouverte" ou "bonplan"
      magasin_id: magasinId || null,
      magasin_nom: magasinNom || null,
      linked_status: magasinId ? "pending" : null,
      link_url: (linkUrl.trim().startsWith("http://") || linkUrl.trim().startsWith("https://")) ? linkUrl.trim() : null,
    });
    setPublishing(false);
    if (error) {
      console.error("Insert error:", error);
      setPublishError("Erreur Supabase : " + error.message);
      return;
    }
    addXP(user.id, 10, "post_publie");
    setScreen("success");
  };

  const inputStyle2 = {
    width: "100%", boxSizing: "border-box", padding: "11px 14px",
    borderRadius: 14, border: `1.5px solid ${C.border}`,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.ink,
    background: C.card, outline: "none",
  };

  const formDefiVoisin = (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Titre du défi *</label>
        <input
          value={defiFields.title}
          onChange={e => updateDefiField("title", e.target.value)}
          placeholder="Ex : La plus belle photo de la ville"
          maxLength={80}
          style={inputStyle2}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Description (optionnelle)</label>
        <textarea
          value={defiFields.description}
          onChange={e => updateDefiField("description", e.target.value)}
          placeholder="Explique les règles du défi…"
          rows={3}
          maxLength={300}
          style={{ ...inputStyle2, resize: "none", lineHeight: 1.5 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Date limite *</label>
        <input
          type="date"
          value={defiFields.ends_at}
          onChange={e => updateDefiField("ends_at", e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          style={inputStyle2}
        />
      </div>
      {/* Récompenses info */}
      <div style={{ background: "#FFF8E8", border: "1.5px solid #F7A72D", borderRadius: 16, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#B45309", marginBottom: 6 }}>🏆 Récompenses XP automatiques</div>
        <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
          🥇 1er : <b>50 XP</b> · 🥈 2e : <b>20 XP</b> · 🥉 3e : <b>10 XP</b>
        </div>
        <div style={{ fontSize: 11, color: "#B45309", marginTop: 4 }}>Attribuées quand tu choisiras le gagnant.</div>
      </div>
      {/* Photo de couverture optionnelle */}
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 5, display: "block" }}>Photo de couverture (optionnelle)</label>
        <PhotoZone onPhotoSelect={handlePhotoSelect} zoneId="defi" externalPreview={photoPreview} />
      </div>
    </div>
  );

  const formMap = {
    tuvalides: <FormTuValides
      content={content} onChange={setContent}
      onPhotoSelect={handlePhotoSelect} photoPreview={photoPreview}
      tvCat={tvCat} onCatChange={setTvCat}
      magasinId={magasinId} magasinNom={magasinNom} onMagasinSelect={setMagasinId} onMagasinNom={setMagasinNom}
    />,
    recherche: <FormRecherche
      content={content} onChange={setContent}
      rechercheTag={rechercheTag} onTagChange={setRechercheTag}
    />,
    decouverte: <FormDecouverte
      content={content} onChange={setContent}
      onPhotoSelect={handlePhotoSelect} photoPreview={photoPreview}
      activeTags={activeTags} onTagToggle={handleTagToggle}
      pepiteOn={pepiteOn} onPepiteChange={setPepiteOn}
      magasinId={magasinId} magasinNom={magasinNom} onMagasinSelect={setMagasinId} onMagasinNom={setMagasinNom}
      linkUrl={linkUrl} onLinkChange={setLinkUrl}
    />,
    lieu: <FormLieu fields={lieuFields} onChange={updateLieuField} onPhotoSelect={setLieuPhotoFile} />,
    sortie: <FormSortie fields={sortieFields} onChange={updateSortieField} />,
    bonplan: <FormBonPlan
      content={content} onChange={setContent}
      onPhotoSelect={handlePhotoSelect} photoPreview={photoPreview}
      activeTags={activeTags} onTagToggle={handleTagToggle}
      magasinId={magasinId} magasinNom={magasinNom} onMagasinSelect={setMagasinId} onMagasinNom={setMagasinNom}
      linkUrl={linkUrl} onLinkChange={setLinkUrl}
    />,
    promo: <FormBonPlan
      content={content} onChange={setContent}
      onPhotoSelect={handlePhotoSelect} photoPreview={photoPreview}
      activeTags={activeTags} onTagToggle={handleTagToggle}
      magasinId={magasinId} magasinNom={magasinNom} onMagasinSelect={setMagasinId} onMagasinNom={setMagasinNom}
      linkUrl={linkUrl} onLinkChange={setLinkUrl}
    />,
    defi_voisin: formDefiVoisin,
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: C.bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", color: C.ink,
      display: "flex", flexDirection: "column",
    }}>

        {/* ── ÉCRAN CHOIX DU TYPE ── */}
        {screen === "choose" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.card, flexShrink: 0 }}>
              <button onClick={() => { setEditPost?.(null); setPage("fil"); }} style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, border: "none", fontSize: 16, cursor: "pointer", color: C.ink2, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.ink }}>Nouveau post</div>
              <div style={{ width: 34 }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 40px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Que veux-tu partager ?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {types.map(t => (
                  <div key={t.id} onClick={() => {
                    if (t.id === "promo" && isMagasin) {
                      localStorage.setItem("chipeur_profil_tab", "creer");
                      localStorage.setItem("chipeur_creer_mode", "remise");
                      setPage("profil"); return;
                    }
                    if (t.isRedirect) {
                      if (setAutoCreateSortie) setAutoCreateSortie(true);
                      setPage("sorties"); return;
                    }
                    setSelectedType(t.id);
                    setActiveTags([]); setPhotoFile(null); setPhotoPreview(null);
                    setTvCat(""); setRechercheTag("");
                    setScreen("form");
                  }} style={{
                    borderRadius: 20, cursor: "pointer", overflow: "hidden",
                    border: `1.5px solid ${C.border}`, background: C.card,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    active: "transform: scale(0.97)",
                  }}>
                    <div style={{ padding: "16px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: t.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{t.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: C.ink, lineHeight: 1.2 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: C.ink2, marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: t.grad }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── ÉCRAN FORMULAIRE ── */}
        {screen === "form" && (() => {
          const t = types.find(ty => ty.id === selectedType) || types[0];
          return (
            <>
              {/* Header */}
              <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 10px" }}>
                  <button onClick={() => setScreen(isEditMode ? "form" : "choose")} style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, border: "none", fontSize: 16, cursor: "pointer", color: C.ink2, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: C.ink }}>{isEditMode ? "Modifier le post ✏️" : "Nouveau post"}</div>
                  <button onClick={() => { setEditPost?.(null); setPage("fil"); }} style={{ width: 34, height: 34, borderRadius: "50%", background: C.pill, border: "none", fontSize: 14, cursor: "pointer", color: C.ink2, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                {/* Bandeau type */}
                <div style={{ margin: "0 14px 12px", borderRadius: 16, background: t.grad, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", lineHeight: 1.1 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 3, lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                </div>
              </div>

              {publishError && <div style={{ padding: "8px 16px", background: "#FFF0EE", color: "#C0392B", fontSize: 12 }}>⚠️ {publishError}</div>}

              <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 90px" }}>
                {formMap[selectedType]}
              </div>

              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 28px", background: C.card, borderTop: `1px solid ${C.border}` }}>
                <button onClick={handlePublishClick} disabled={publishing} style={{ width: "100%", border: "none", borderRadius: 16, padding: "14px 0", fontSize: 14, fontWeight: 800, cursor: publishing ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", background: publishing ? "#ccc" : `linear-gradient(90deg, ${C.accent}, #FF8C42)`, color: "#fff", boxShadow: publishing ? "none" : "0 4px 16px rgba(255,87,51,0.4)" }}>
                  {publishing ? "Sauvegarde…" : isEditMode ? "Enregistrer ✓" : "Publier 🚀"}
                </button>
              </div>
            </>
          );
        })()}

        {screen === "success" && (
          <>
            <SuccessScreen type={selectedType} onBack={() => setPage("fil")} />
          </>
        )}

      {showDroitImage && (
        <DroitImagePopup
          onConfirm={() => { setShowDroitImage(false); handlePublish(); }}
          onCancel={() => setShowDroitImage(false)}
        />
      )}
    </div>
  );
}
