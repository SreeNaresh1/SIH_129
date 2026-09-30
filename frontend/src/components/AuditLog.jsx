import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterConnector, setFilterConnector] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [chainVerification, setChainVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interop/exchange-logs?limit=100`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const verifyAuditChain = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API}/api/interop/audit-chain/verify`, {
        headers: authHeader()
      });
      const data = await res.json();
      setChainVerification(data);
    } catch (e) {
      setChainVerification({ success: false, message: e.message });
    } finally {
      setVerifying(false);
    }
  };

  const filtered = logs.filter((l) => {
    if (filterStatus !== "ALL" && !l.status.includes(filterStatus)) return false;
    if (filterConnector !== "ALL" && !l.sourcePortal.includes(filterConnector) && !l.targetPortal.includes(filterConnector)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
      (l.payloadSummary && l.payloadSummary.toLowerCase().includes(q)) ||
      (l.sha256VerificationHash && l.sha256VerificationHash.toLowerCase().includes(q))
    );
  });

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
            Immutable SHA-256 Audit Trail
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Cryptographically sealed and hash-chained transaction logs ensuring non-repudiation across government portals.
          </p>
        </div>

        <button
          onClick={verifyAuditChain}
          disabled={verifying}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: 800,
            fontSize: "12px",
            cursor: verifying ? "not-allowed" : "pointer"
          }}
        >
          {verifying ? "🔒 Checking Block Hashes..." : "🔒 Verify Audit Chain"}
        </button>
      </div>

      {chainVerification && (
        <div
          style={{
            background: chainVerification.success ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${chainVerification.success ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: chainVerification.success ? "#86efac" : "#fca5a5",
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "13px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800 }}>
              {chainVerification.success ? "✓ Audit Hash Chain Intact: Zero Tampering Detected" : "⚠ Audit Chain Anomaly"}
            </span>
            <button onClick={() => setChainVerification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
            Total blocks validated: {chainVerification.verifiedCount || logs.length} | SHA-256 Genesis: <code>e3b0c44298fc1c149afbf4...</code>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Transaction ID, SHA-256 hash or summary..."
          style={{
            flex: 1,
            minWidth: "260px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "9px 14px",
            color: "#f8fafc",
            fontSize: "13px",
            outline: "none"
          }}
        />

        <select
          value={filterConnector}
          onChange={(e) => setFilterConnector(e.target.value)}
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#e2e8f0",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px"
          }}
        >
          <option value="ALL">All Connectors</option>
          <option value="MahaSwayam">MahaSwayam</option>
          <option value="MahaDBT">MahaDBT</option>
          <option value="Aaple Sarkar">Aaple Sarkar</option>
          <option value="DigiLocker">DigiLocker</option>
          <option value="DHE">DHE</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#e2e8f0",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px"
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="RECONCILED">RECONCILED</option>
          <option value="EXCEPTION">EXCEPTION</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "20px",
          overflowX: "auto"
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No audit log entries matching filters.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "left" }}>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>Transaction ID</th>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>Route</th>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>Summary</th>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>SHA-256 Proof</th>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "10px", color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id || log.transactionId} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                    {log.transactionId}
                  </td>
                  <td style={{ padding: "12px 10px", color: "#fff", whiteSpace: "nowrap" }}>
                    {log.sourcePortal} ➔ {log.targetPortal}
                  </td>
                  <td style={{ padding: "12px 10px", color: "#cbd5e1", maxWidth: "300px" }}>
                    {log.payloadSummary || "Inter-agency payload exchanged"}
                  </td>
                  <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "#a78bfa" }}>
                    {log.sha256VerificationHash ? `${log.sha256VerificationHash.slice(0, 16)}...` : "—"}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: log.status === "SUCCESS" ? "rgba(74, 222, 128, 0.15)" : "rgba(56, 189, 248, 0.15)",
                        color: log.status === "SUCCESS" ? "#4ade80" : "#38bdf8"
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
