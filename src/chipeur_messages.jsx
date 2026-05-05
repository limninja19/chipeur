import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const C = {
  bg: "#F5F2EE", card: "#FFFFFF", ink: "#1A1714", ink2: "#6B6560",
  accent: "#FF5733", pro: "#0A3D2E", proBg: "#EBF5F0",
  pill: "#EDEBE8", border: "rgba(26,23,20,0.08)", gold: "#F7A72D",
};
const syne = "'Syne', sans-serif";
const dm = "'DM Sans', sans-serif";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff < 60) return diff + " min";
  if (diff < 1440) return Math.floor(diff / 60) + " h";
  return Math.floor(diff / 1440) + " j";
}

function formatHour(ts) {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ─── VUE CONVERSATION ────────────────────────────────────────────
function ConversationView({ userId, other, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!userId || !other?.id) return;
    loadMessages();

    // Realtime : écoute les nouveaux messages de cette conversation
    const channel = supabase
      .channel(`conv_${[userId, other.id].sort().join("_")}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `to_user_id=eq.${userId}`,
      }, (payload) => {
        const msg = payload.new;
        if (msg.from_user_id === other.id) {
          setMessages(prev => [...prev, msg]);
          // Marquer comme lu
          supabase.from("messages").update({ read: true }).eq("id", msg.id).then(() => {});
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, other?.id]);

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${other.id}),and(from_user_id.eq.${other.id},to_user_id.eq.${userId})`
      )
      .order("created_at", { ascending: true })
      .limit(100);

    setMessages(data || []);

    // Marquer les messages reçus comme lus
    supabase.from("messages")
      .update({ read: true })
      .eq("to_user_id", userId)
      .eq("from_user_id", other.id)
      .eq("read", false)
      .then(() => {});
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);

    // Ajout optimiste
    const tempMsg = {
      id: "temp_" + Date.now(),
      from_user_id: userId,
      to_user_id: other.id,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const { data, error } = await supabase.from("messages").insert({
      from_user_id: userId,
      to_user_id: other.id,
      content,
    }).select().single();

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      // Créer une notification pour le destinataire
      supabase.from("notifications").insert({
        user_id: other.id,
        from_user_id: userId,
        type: "message",
        reference_id: data.id,
      }).then(() => {});
    } else {
      // Retirer le message temp en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(content);
    }

    setSending(false);
  };

  // Regrouper messages par date
  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg) => {
      const isMe = msg.from_user_id === userId;
      const msgDate = new Date(msg.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      const showDate = msgDate !== lastDate;
      lastDate = msgDate;

      return (
        <div key={msg.id}>
          {showDate && (
            <div style={{
              textAlign: "center", padding: "12px 0 4px",
              fontSize: 11, color: C.ink2, fontFamily: dm,
            }}>{msgDate}</div>
          )}
          <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: "2px 12px",
          }}>
            <div style={{
              maxWidth: "72%",
              background: isMe ? C.accent : C.card,
              color: isMe ? "#fff" : C.ink,
              borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "10px 14px",
              fontSize: 14, fontFamily: dm, lineHeight: 1.45,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              opacity: msg.id?.startsWith("temp_") ? 0.6 : 1,
            }}>
              {msg.content}
              <div style={{
                fontSize: 10, marginTop: 4, textAlign: "right",
                color: isMe ? "rgba(255,255,255,0.65)" : C.ink2,
                fontFamily: dm,
              }}>
                {formatHour(msg.created_at)}
                {isMe && (
                  <span style={{ marginLeft: 4 }}>
                    {msg.read ? " ✓✓" : " ✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: C.bg, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}
        >←</button>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: C.pill, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          {other.avatar_url
            ? <img src={other.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            : "😊"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 15, color: C.ink }}>
            {other.pseudo || "Voisin"}
          </div>
          {other.quartier && (
            <div style={{ fontFamily: dm, fontSize: 11, color: C.ink2 }}>📍 {other.quartier}</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 8, paddingBottom: 8 }}>
        {messages.length === 0 && (
          <div style={{
            padding: "48px 32px", textAlign: "center",
            color: C.ink2, fontFamily: dm, fontSize: 13,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            Dis bonjour à {other.pseudo || "ton voisin"} !
          </div>
        )}
        {renderMessages()}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div style={{
        background: C.card, borderTop: `1px solid ${C.border}`,
        padding: "10px 12px", display: "flex", gap: 8,
        alignItems: "flex-end", flexShrink: 0,
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Écrire un message…"
          rows={1}
          style={{
            flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 20,
            padding: "10px 14px", fontFamily: dm, fontSize: 14, color: C.ink,
            background: C.bg, outline: "none", resize: "none",
            maxHeight: 100, overflowY: "auto",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: "50%", border: "none",
            background: text.trim() ? C.accent : C.pill,
            color: text.trim() ? "#fff" : C.ink2,
            fontSize: 16, cursor: text.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}
        >➤</button>
      </div>
    </div>
  );
}

// ─── LISTE DES CONVERSATIONS ──────────────────────────────────────
function ConversationsList({ userId, user, profile, onSelectConv, setPage }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*, from_profile:from_user_id(id, pseudo, avatar_url, quartier), to_profile:to_user_id(id, pseudo, avatar_url, quartier)")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) { setLoading(false); return; }

    // Grouper par interlocuteur (autre user)
    const convMap = new Map();
    data.forEach(msg => {
      const isFromMe = msg.from_user_id === userId;
      const other = isFromMe ? msg.to_profile : msg.from_profile;
      if (!other) return;
      const otherId = other.id;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          other,
          lastMsg: msg,
          unread: 0,
        });
      }
      // Compter les non-lus (reçus)
      if (!isFromMe && !msg.read) {
        convMap.get(otherId).unread++;
      }
    });

    setConversations(Array.from(convMap.values()));
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: C.bg, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          <button
            onClick={() => setPage("fil")}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink2 }}
          >←</button>
          <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 18, flex: 1 }}>Messages</div>
        </div>
      </div>

      {/* Liste */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.ink2, fontFamily: dm, fontSize: 13 }}>
            Chargement…
          </div>
        ) : conversations.length === 0 ? (
          <div style={{
            padding: "60px 32px", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 52 }}>💬</div>
            <div style={{ fontFamily: syne, fontWeight: 700, fontSize: 17, color: C.ink }}>
              Aucun message
            </div>
            <div style={{
              fontFamily: dm, fontSize: 13, color: C.ink2,
              textAlign: "center", maxWidth: 220, lineHeight: 1.5,
            }}>
              Tes conversations avec tes voisins apparaîtront ici.
            </div>
          </div>
        ) : (
          conversations.map(({ other, lastMsg, unread }) => {
            const isFromMe = lastMsg.from_user_id === userId;
            const preview = (isFromMe ? "Toi : " : "") + lastMsg.content;

            return (
              <div
                key={other.id}
                onClick={() => onSelectConv(other)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  background: unread > 0 ? "#FFF5F2" : C.card,
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: C.pill, overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {other.avatar_url
                    ? <img src={other.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none"; }} />
                    : "😊"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3,
                  }}>
                    <div style={{
                      fontFamily: syne, fontWeight: unread > 0 ? 700 : 600,
                      fontSize: 14, color: C.ink,
                    }}>{other.pseudo || "Voisin"}</div>
                    <div style={{ fontSize: 11, color: C.ink2, fontFamily: dm, flexShrink: 0, marginLeft: 8 }}>
                      {timeAgo(lastMsg.created_at)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13, color: unread > 0 ? C.ink : C.ink2,
                    fontFamily: dm, fontWeight: unread > 0 ? 600 : 400,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{preview}</div>
                </div>

                {/* Badge non-lus */}
                {unread > 0 && (
                  <div style={{
                    background: C.accent, color: "#fff",
                    borderRadius: "50%", width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: dm, flexShrink: 0,
                  }}>{unread}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── EXPORT PRINCIPAL ─────────────────────────────────────────────
export default function Messages({ setPage, user, profile, conversationWith, setConversationWith }) {
  // Si on arrive depuis un profil voisin, ouvrir directement cette conversation
  const [selectedConv, setSelectedConv] = useState(conversationWith || null);

  // Nettoyer conversationWith après usage
  useEffect(() => {
    if (conversationWith) setConversationWith?.(null);
  }, []);

  if (selectedConv) {
    return (
      <ConversationView
        userId={user?.id}
        other={selectedConv}
        onBack={() => setSelectedConv(null)}
      />
    );
  }

  return (
    <ConversationsList
      userId={user?.id}
      user={user}
      profile={profile}
      onSelectConv={setSelectedConv}
      setPage={setPage}
    />
  );
}

// ─── Hook utilitaire : compter les messages non lus (pour badge header) ───
export function useUnreadMessages(userId) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetch = () => {
      supabase.from("messages")
        .select("id", { count: "exact", head: true })
        .eq("to_user_id", userId)
        .eq("read", false)
        .then(({ count: c }) => setCount(c || 0));
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return count;
}
