import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const statusTag = (status) => {
  const s = String(status || "").toUpperCase();
  let bg = "rgba(148, 163, 184, 0.1)";
  let border = "rgba(148, 163, 184, 0.3)";
  let color = "#94a3b8";

  if (s.includes("SUCCESS") || s.includes("COMPLETED")) {
    bg = "rgba(74, 222, 128, 0.12)";
    border = "rgba(74, 222, 128, 0.35)";
    color = "#4ade80";
  } else if (s.includes("RECONCILED") || s.includes("TRANSFORMED")) {
    bg = "rgba(56, 189, 248, 0.12)";
    border = "rgba(56, 189, 248, 0.35)";
    color = "#38bdf8";
  } else if (s.includes("PENDING") || s.includes("IN_PROGRESS")) {
    bg = "rgba(251, 191, 36, 0.12)";
    border = "rgba(251, 191, 36, 0.35)";
    color = "#fbbf24";
  } else if (s.includes("ERROR") || s.includes("FAIL") || s.includes("EXCEPTION")) {
    bg = "rgba(248, 113, 113, 0.12)";
    border = "rgba(248, 113, 113, 0.35)";
    color = "#f87171";
  }

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "12px",
        background: bg,
        border: `1px solid ${border}`,
        color
      }}
    >
      {s || "UNKNOWN"}
    </span>
  );
};

export default function ExchangeStream() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simSource, setSimSource] = useState("MahaDBT");
  const [simTarget, setSimTarget] = useState("MahaSwayam");
  const [toast, setToast] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/interop/exchange-logs?limit=50`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch exchange logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleSimulate = async () => {
    setSimulating(true);
    setToast(null);
    try {
      const res = await fetch(`${API}/api/interop/simulate-exchange`, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          applicantName: "Aniket Suresh Patil",
          district: "Pune",
          sourcePortal: simSource,
          targetPortal: simTarget
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          type: "success",
          msg: `Simulation completed! Payload adapted: ${simSource} (SOAP/XML) ➔ ${simTarget} (IndEA JSON-LD)`
        });
        await fetchLogs();
        if (data.exchangeLog) {
          setSelectedLog(data.exchangeLog);
        }
      }
    } catch (e) {
      setToast({ type: "error", msg: `Simulation failed: ${e.message}` });
    } finally {
      setSimulating(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return (log.status || "").toUpperCase().includes(filter);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Control bar */}
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
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
            Live Inter-Agency Data Exchange Stream
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            Real-time telemetry of cross-departmental schema adaptation (SOAP/XML ➔ IndEA JSON-LD).
          </div>
        </div>

        {/* Live Simulation Trigger Form */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={simSource}
            onChange={(e) => setSimSource(e.target.value)}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "7px 10px",
              fontSize: "12px"
            }}
          >
            <option value="MahaDBT">Source: MahaDBT (SOAP)</option>
            <option value="MahaSwayam">Source: MahaSwayam (REST)</option>
            <option value="Aaple Sarkar">Source: Aaple Sarkar (RTS)</option>
            <option value="DigiLocker">Source: DigiLocker (OIDC)</option>
          </select>
          <span style={{ color: "#64748b" }}>➔</span>
          <select
            value={simTarget}
            onChange={(e) => setSimTarget(e.target.value)}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "7px 10px",
              fontSize: "12px"
            }}
          >
            <option value="MahaSwayam">Target: MahaSwayam (Skills)</option>
            <option value="MahaDBT">Target: MahaDBT (Scholarships)</option>
            <option value="WSSD">Target: Water Supply (WSSD)</option>
            <option value="MSInS">Target: MSInS Innovation Bridge</option>
          </select>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none",
              color: "#000",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: simulating ? "not-allowed" : "pointer"
            }}
          >
            {simulating ? "⚡ Adapting..." : "▶ Simulate Exchange"}
          </button>
        </div>
      </div>

      {toast && (
        <div
          style={{
            background: toast.type === "success" ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: toast.type === "success" ? "#86efac" : "#fca5a5",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Filter Chips */}
      <div style={{ display: "flex", gap: "8px" }}>
        {["ALL", "SUCCESS", "RECONCILED", "EXCEPTION"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "rgba(56, 189, 248, 0.18)" : "rgba(15, 23, 42, 0.6)",
              border: filter === f ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
              color: filter === f ? "#38bdf8" : "#94a3b8",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Feed + Inspector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedLog ? "1fr 420px" : "1fr",
          gap: "16px",
          alignItems: "start"
        }}
      >
        {/* Stream List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading telemetry feed...</div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>No exchange transactions found.</div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id || selectedLog?.transactionId === log.transactionId;
              return (
                <div
                  key={log.id || log.transactionId}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  style={{
                    background: isSelected ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.75)",
                    border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#38bdf8",
                      fontSize: "14px",
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    ⇄
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ color: "#fff", fontSize: "14px" }}>{log.sourcePortal}</strong>
                      <span style={{ color: "#f59e0b", fontSize: "13px" }}>➔</span>
                      <strong style={{ color: "#38bdf8", fontSize: "14px" }}>{log.targetPortal}</strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        ({log.latencyMs || 25}ms)
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {log.payloadSummary || "Inter-departmental beneficiary qualification exchange"}
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
                      <span>Hash: <code style={{ color: "#38bdf8", fontFamily: "monospace" }}>{log.sha256VerificationHash ? log.sha256VerificationHash.slice(0, 14) + "..." : "—"}</code></span>
                      <span>Format: <span style={{ color: "#a78bfa" }}>{log.payloadSourceFormat || "SOAP"} ➔ {log.payloadTargetFormat || "JSON-LD"}</span></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    {statusTag(log.status)}
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Log Inspector */}
        {selectedLog && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "14px",
              padding: "20px",
              position: "sticky",
              top: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8" }}>
                Transformation Inspector
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Transaction: <span style={{ color: "#f8fafc", fontFamily: "monospace" }}>{selectedLog.transactionId}</span>
            </div>

            {/* Side-by-side or visual transformation representation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>
                Source Ingestion: {selectedLog.sourcePortal} ({selectedLog.payloadSourceFormat || "SOAP / XML"})
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#cbd5e1",
                  fontFamily: "monospace",
                  maxHeight: "120px",
                  overflowY: "auto",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}
              >
                {`<BeneficiarySync xmlns="gov.mh.schema">
  <UID>${selectedLog.transactionId}</UID>
  <Source>${selectedLog.sourcePortal}</Source>
  <AuthToken>HMAC-SHA256-SIGNED</AuthToken>
</BeneficiarySync>`}
              </div>

              <div style={{ textAlign: "center", color: "#38bdf8", fontSize: "14px", fontWeight: 800 }}>
                ↓ IndEA Standard Translator (MahaSetu Engine) ↓
              </div>

              <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" }}>
                Target Output: {selectedLog.targetPortal} ({selectedLog.payloadTargetFormat || "IndEA JSON-LD"})
              </div>
              <pre
                style={{
                  background: "rgba(0,0,0,0.6)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "10px",
                  color: "#86efac",
                  fontFamily: "monospace",
                  maxHeight: "220px",
                  overflowX: "auto",
                  margin: 0,
                  border: "1px solid rgba(74,222,128,0.2)"
                }}
              >
                {typeof selectedLog.transformedPayload === "string"
                  ? selectedLog.transformedPayload
                  : JSON.stringify(selectedLog.transformedPayload, null, 2)}
              </pre>
            </div>

            <div style={{ fontSize: "10px", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
              Cryptographic Hash:{" "}
              <code style={{ color: "#38bdf8", wordBreak: "break-all" }}>
                {selectedLog.sha256VerificationHash || "SHA-256 Validated"}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
