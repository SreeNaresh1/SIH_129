import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const statusBadge = (status) => {
  const isHealthy = status === "HEALTHY";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "20px",
        background: isHealthy ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
        border: `1px solid ${isHealthy ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
        color: isHealthy ? "#4ade80" : "#f87171"
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: isHealthy ? "#4ade80" : "#f87171",
          boxShadow: isHealthy ? "0 0 8px #4ade80" : "0 0 8px #f87171"
        }}
      />
      {status || "UNKNOWN"}
    </span>
  );
};

export default function ConnectorRegistry() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [filterProtocol, setFilterProtocol] = useState("ALL");
  const [search, setSearch] = useState("");
  const [bannerNotice, setBannerNotice] = useState(null);

  const fetchConnectors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interop/connectors`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.connectors)) {
        setConnectors(data.connectors);
      }
    } catch (err) {
      console.error("Failed to fetch connectors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const handlePing = async (connectorId) => {
    setTestingId(connectorId);
    setBannerNotice(null);
    try {
      const res = await fetch(`${API}/api/interop/connectors/test/${connectorId}`, {
        method: "POST",
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setBannerNotice({
          type: "success",
          msg: `Health check passed for ${connectorId}: ${data.latencyMs}ms latency. Protocol responded OK.`
        });
        await fetchConnectors();
      } else {
        setBannerNotice({
          type: "error",
          msg: `Health check alert for ${connectorId}: ${data.message || "Failed response"}`
        });
      }
    } catch (e) {
      setBannerNotice({
        type: "error",
        msg: `Unable to reach connector ${connectorId}: ${e.message}`
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (connectorId) => {
    setSyncingId(connectorId);
    setBannerNotice(null);
    try {
      const res = await fetch(`${API}/api/interop/connectors/sync/${connectorId}`, {
        method: "POST",
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setBannerNotice({
          type: "success",
          msg: `Re-sync completed for ${connectorId}. Synced ${data.recordsSynced || "batch"} records.`
        });
        await fetchConnectors();
      }
    } catch (e) {
      setBannerNotice({
        type: "error",
        msg: `Re-sync failed for ${connectorId}: ${e.message}`
      });
    } finally {
      setSyncingId(null);
    }
  };

  const filtered = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.connectorId.toLowerCase().includes(search.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterProtocol === "ALL") return true;
    return c.protocol.toUpperCase().includes(filterProtocol.toUpperCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Subheader info card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
            Plug-and-Play Connector Registry
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Non-invasive API adapters wrapping Maharashtra departmental systems without modifying legacy databases.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={fetchConnectors}
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>↻</span> Refresh Registry
          </button>
        </div>
      </div>

      {bannerNotice && (
        <div
          style={{
            background: bannerNotice.type === "success" ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)",
            border: `1px solid ${bannerNotice.type === "success" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: bannerNotice.type === "success" ? "#86efac" : "#fca5a5",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>{bannerNotice.msg}</span>
          <button
            onClick={() => setBannerNotice(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by connector name, ID, or department..."
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
        <div style={{ display: "flex", gap: "6px" }}>
          {["ALL", "REST", "SOAP", "OAUTH", "GIS"].map((proto) => (
            <button
              key={proto}
              onClick={() => setFilterProtocol(proto)}
              style={{
                background: filterProtocol === proto ? "rgba(56, 189, 248, 0.18)" : "rgba(15, 23, 42, 0.6)",
                border: filterProtocol === proto ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
                color: filterProtocol === proto ? "#38bdf8" : "#94a3b8",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading registered connectors...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>No matching connectors found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "16px"
          }}
        >
          {filtered.map((conn) => (
            <div
              key={conn.connectorId}
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                border: conn.status === "HEALTHY" ? "1px solid rgba(74, 222, 128, 0.2)" : "1px solid rgba(248, 113, 113, 0.2)",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
                    {conn.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "monospace", marginTop: "3px" }}>
                    {conn.connectorId}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    {conn.department}
                  </div>
                </div>
                {statusBadge(conn.status)}
              </div>

              {/* Protocol & Metadata Stats */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "12px"
                }}
              >
                <div>
                  <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Protocol
                  </span>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, marginTop: "2px" }}>
                    {conn.protocol || "REST"}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Schema Standard
                  </span>
                  <div style={{ color: "#a78bfa", fontWeight: 700, marginTop: "2px" }}>
                    {conn.standardSchema || "IndEA v2.0"}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Live Latency
                  </span>
                  <div style={{ color: "#4ade80", fontWeight: 800, marginTop: "2px" }}>
                    {conn.healthLatencyMs ? `${conn.healthLatencyMs} ms` : "—"}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Active Records
                  </span>
                  <div style={{ color: "#f8fafc", fontWeight: 700, marginTop: "2px" }}>
                    {conn.activeRecordsCount ? conn.activeRecordsCount.toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {/* Endpoint Url preview */}
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                <span>Endpoint: </span>
                <code style={{ color: "#94a3b8", wordBreak: "break-all" }}>{conn.endpointUrl || "Internal Service Grid"}</code>
              </div>

              {/* Last Sync */}
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Last Health Check:{" "}
                <span style={{ color: "#94a3b8" }}>
                  {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : "Active / Real-time"}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
                <button
                  onClick={() => handlePing(conn.connectorId)}
                  disabled={testingId === conn.connectorId}
                  style={{
                    background: testingId === conn.connectorId ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38bdf8",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: testingId === conn.connectorId ? "not-allowed" : "pointer"
                  }}
                >
                  {testingId === conn.connectorId ? "⏳ Testing..." : "⚡ Ping Health"}
                </button>
                <button
                  onClick={() => handleSync(conn.connectorId)}
                  disabled={syncingId === conn.connectorId}
                  style={{
                    background: syncingId === conn.connectorId ? "rgba(167, 139, 250, 0.05)" : "rgba(167, 139, 250, 0.12)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    color: "#a78bfa",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: syncingId === conn.connectorId ? "not-allowed" : "pointer"
                  }}
                >
                  {syncingId === conn.connectorId ? "⏳ Syncing..." : "🔄 Re-Sync"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
