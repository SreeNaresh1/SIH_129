import { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:5000/api";

/**
 * StakeholderChat — in-app communication panel
 * Props:
 *   problemId    (string|number) — the problem this thread is about
 *   currentUser  (object)        — { id, name, role }
 *   compact      (bool)          — collapsible mode (default false)
 */
export default function StakeholderChat({ problemId, currentUser, compact = false }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(!compact);
  const bottomRef = useRef(null);
  const token = localStorage.getItem("authToken");

  const roleColors = {
    government: { bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb", icon: "🏛️", label: "Government" },
    university:  { bg: "#f0fdf4", border: "#bbf7d0", badge: "#059669", icon: "🎓", label: "University"  },
    industry:    { bg: "#faf5ff", border: "#e9d5ff", badge: "#7c3aed", icon: "🏢", label: "Industry"    },
    citizen:     { bg: "#fff7ed", border: "#fed7aa", badge: "#ea580c", icon: "👤", label: "Citizen"     },
  };

  async function load() {
    if (!problemId || !token) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/advanced/messages/problem/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.success) setMessages(data.messages || []);
      }
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [problemId]);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: text.trim(),
      senderName: currentUser?.name || "You",
      senderRole: currentUser?.role || "citizen",
      senderId: currentUser?.id,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    try {
      setSending(true);
      const res = await fetch(`${API_BASE}/advanced/messages/problem/${problemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: optimistic.content, senderRole: currentUser?.role })
      });
      if (res.ok) await load(); // replace optimistic with real
    } catch (e) { /* keep optimistic */ }
    finally { setSending(false); }
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", marginTop: "24px" }}>

      {/* Header */}
      <div
        onClick={() => compact && setOpen(o => !o)}
        style={{ padding: "16px 20px", background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: compact ? "pointer" : "default" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>💬</span>
          <div>
            <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "15px" }}>Stakeholder Communication</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{messages.length} message{messages.length !== 1 ? "s" : ""} • Problem #{problemId}</div>
          </div>
        </div>
        {compact && <span style={{ color: "#94a3b8", fontSize: "16px" }}>{open ? "▲" : "▼"}</span>}
      </div>

      {open && (
        <>
          {/* Messages */}
          <div style={{ height: "340px", overflowY: "auto", padding: "16px 20px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", paddingTop: "80px", fontSize: "14px" }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", paddingTop: "60px" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>💬</div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>No messages yet</div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>Start the conversation between Government, Universities, Industry & Citizens</div>
              </div>
            ) : messages.map((msg) => {
              const isSelf = msg.senderId === currentUser?.id || msg.senderName === currentUser?.name;
              const rc = roleColors[msg.senderRole] || roleColors.citizen;
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: isSelf ? "row-reverse" : "row", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: rc.badge, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {rc.icon}
                  </div>
                  <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isSelf ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                      {msg.senderName || "User"} • <span style={{ color: rc.badge }}>{rc.label}</span>
                    </div>
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: isSelf ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      background: isSelf ? rc.badge : "#ffffff",
                      color: isSelf ? "#ffffff" : "#1e293b",
                      border: isSelf ? "none" : `1px solid ${rc.border}`,
                      fontSize: "14px", lineHeight: "1.55",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", background: "#ffffff" }}>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Write a message as ${roleColors[currentUser?.role]?.label || "User"}...`}
              disabled={sending}
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#f8fafc" }}
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              style={{
                padding: "10px 18px",
                background: sending || !text.trim() ? "#cbd5e1" : "#2563eb",
                color: "#ffffff", border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700,
                cursor: sending || !text.trim() ? "not-allowed" : "pointer"
              }}
            >
              {sending ? "…" : "Send ↗"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
