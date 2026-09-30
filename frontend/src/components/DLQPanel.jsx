import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function DLQPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [injecting, setInjecting] = useState(false);
  const [banner, setBanner] = useState(null);

  const fetchDlqItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interop/dlq/items`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to load DLQ items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDlqItems();
  }, [fetchDlqItems]);

  const handleRetry = async (itemId) => {
    setRetryingId(itemId);
    setBanner(null);
    try {
      const res = await fetch(`${API}/api/interop/dlq/retry/${itemId}`, {
        method: "POST",
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setBanner({
          type: "success",
          msg: `Item ${itemId} successfully retried! ${data.message || "Circuit breaker closed and payload delivered."}`
        });
        await fetchDlqItems();
      } else {
        setBanner({ type: "error", msg: data.message || "Retry failed." });
      }
    } catch (e) {
      setBanner({ type: "error", msg: `Retry attempt failed: ${e.message}` });
    } finally {
      setRetryingId(null);
    }
  };

  const handleInjectFailure = async () => {
    setInjecting(true);
    setBanner(null);
    try {
      const res = await fetch(`${API}/api/interop/demo/inject-failure`, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          failureType: "TIMEOUT",
          connectorId: "CONN-MAHADBT",
          trackingId: `DLQ-INJECT-${Date.now().toString().slice(-4)}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setBanner({
          type: "info",
          msg: `Simulated gateway timeout injected. Item placed in Dead-Letter Queue with auto-retry enabled.`
        });
        await fetchDlqItems();
      }
    } catch (e) {
      setBanner({ type: "error", msg: `Injection failed: ${e.message}` });
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Subheader */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
            Dead-Letter Queue (DLQ) & Resilience Exception Handler
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Self-healing fault tolerance: captures failed inter-agency payloads with exponential backoff and manual nodal recovery.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleInjectFailure}
            disabled={injecting}
            style={{
              background: "rgba(248, 113, 113, 0.15)",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              color: "#f87171",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: injecting ? "not-allowed" : "pointer"
            }}
          >
            {injecting ? "⚡ Injecting..." : "⚡ Inject Failure (Evaluator Demo)"}
          </button>

          <button
            onClick={fetchDlqItems}
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            ↻ Refresh Queue
          </button>
        </div>
      </div>

      {banner && (
        <div
          style={{
            background:
              banner.type === "success"
                ? "rgba(74, 222, 128, 0.12)"
                : banner.type === "info"
                ? "rgba(56, 189, 248, 0.12)"
                : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${
              banner.type === "success"
                ? "rgba(74, 222, 128, 0.3)"
                : banner.type === "info"
                ? "rgba(56, 189, 248, 0.3)"
                : "rgba(248, 113, 113, 0.3)"
            }`,
            color:
              banner.type === "success"
                ? "#86efac"
                : banner.type === "info"
                ? "#7dd3fc"
                : "#fca5a5",
            padding: "12px 18px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* DLQ List */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading Dead-Letter Queue items...</div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
            borderRadius: "14px",
            padding: "60px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
          <h3 style={{ margin: "0 0 6px 0", color: "#fff", fontSize: "18px" }}>
            Dead-Letter Queue is Empty
          </h3>
          <p style={{ margin: "0 auto", maxWidth: "480px", color: "#94a3b8", fontSize: "13px" }}>
            All inter-agency exchanges have delivered successfully with zero silent drops. Use "Inject Failure" above to test resilience.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(248, 113, 113, 0.25)",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        background: "rgba(248, 113, 113, 0.15)",
                        color: "#f87171",
                        border: "1px solid rgba(248, 113, 113, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 800
                      }}
                    >
                      {item.failureType || "TIMEOUT"}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>
                      Target: {item.department || item.connectorId}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Tracking ID: <code style={{ color: "#38bdf8" }}>{item.trackingId}</code> | Applicant: {item.applicantName || "Beneficiary"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "right", fontSize: "12px", color: "#64748b" }}>
                    Retry Count: <strong style={{ color: "#f59e0b" }}>{item.retryCount || 1} / 5</strong>
                    <div style={{ fontSize: "10px" }}>
                      Last Attempt: {item.lastAttemptAt ? new Date(item.lastAttemptAt).toLocaleTimeString() : "Just now"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRetry(item.id)}
                    disabled={retryingId === item.id}
                    style={{
                      background: "rgba(74, 222, 128, 0.15)",
                      border: "1px solid rgba(74, 222, 128, 0.35)",
                      color: "#4ade80",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: retryingId === item.id ? "not-allowed" : "pointer"
                    }}
                  >
                    {retryingId === item.id ? "⏳ Retrying..." : "↩ Retry Delivery"}
                  </button>
                </div>
              </div>

              {/* Error Explanation Box */}
              <div
                style={{
                  background: "rgba(248, 113, 113, 0.05)",
                  border: "1px solid rgba(248, 113, 113, 0.15)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#fca5a5"
                }}
              >
                <strong>Root Cause:</strong> {item.errorMessage || "Gateway timed out exceeding 3000ms SLA limit."}
              </div>

              <div style={{ fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                <span>Backoff Strategy: Exponential with Circuit Breaker</span>
                <span>SHA-256 Payload Hash: <code style={{ color: "#38bdf8" }}>{item.payloadHash ? `${item.payloadHash.slice(0, 16)}...` : "Preserved"}</code></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
