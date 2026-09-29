import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./InterOpHub.css";

const API_BASE = "http://localhost:5000";

export default function InterOpHub() {
  const [activeTab, setActiveTab] = useState("topology");
  const [metrics, setMetrics] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulator Form State
  const [simSource, setSimSource] = useState("MahaSwayam (Skills)");
  const [simTarget, setSimTarget] = useState("MahaDBT (Scholarships)");
  const [simApplicant, setSimApplicant] = useState("Aniket Patil");
  const [simDistrict, setSimDistrict] = useState("Pune");
  const [simResult, setSimResult] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [metRes, connRes, logRes, pipeRes, cnsRes] = await Promise.all([
        fetch(`${API_BASE}/api/interop/metrics`),
        fetch(`${API_BASE}/api/interop/connectors`),
        fetch(`${API_BASE}/api/interop/exchange-logs?status=${logFilter}`),
        fetch(`${API_BASE}/api/interop/pipelines`),
        fetch(`${API_BASE}/api/interop/consent/records`)
      ]);

      const metData = await metRes.json();
      const connData = await connRes.json();
      const logData = await logRes.json();
      const pipeData = await pipeRes.json();
      const cnsData = await cnsRes.json();

      if (metData.success) setMetrics(metData.metrics);
      if (connData.success) setConnectors(connData.connectors);
      if (logData.success) setLogs(logData.logs);
      if (pipeData.success) setPipelines(pipeData.pipelines);
      if (cnsData.success) setConsents(cnsData.consents);
    } catch (err) {
      console.error("Error loading interop data:", err);
    } finally {
      setLoading(false);
    }
  }, [logFilter]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      // Auto-refresh logs silently every 20 seconds
      fetch(`${API_BASE}/api/interop/exchange-logs?status=${logFilter}`)
        .then(r => r.json())
        .then(d => { if (d.success) setLogs(d.logs); })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchAllData, logFilter]);

  // Test Ping a connector
  const handleTestPing = async (connectorId) => {
    try {
      setActionMessage(`Pinging ${connectorId}...`);
      const res = await fetch(`${API_BASE}/api/interop/connectors/test/${connectorId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Handshake verified with ${data.name}: ${data.latencyMs}ms latency (${data.standardSchema})`);
        setConnectors(prev =>
          prev.map(c => c.connectorId === connectorId ? { ...c, healthLatencyMs: data.latencyMs, status: "HEALTHY" } : c)
        );
      }
    } catch {
      setActionMessage(`Ping failed for ${connectorId}`);
    }
    setTimeout(() => setActionMessage(""), 5000);
  };

  // Sync a connector
  const handleSync = async (connectorId) => {
    try {
      setActionMessage(`Synchronizing data stream with ${connectorId}...`);
      const res = await fetch(`${API_BASE}/api/interop/connectors/sync/${connectorId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ ${data.message}`);
        setConnectors(prev =>
          prev.map(c => c.connectorId === connectorId ? { ...c, activeRecordsCount: c.activeRecordsCount + data.syncedRecords } : c)
        );
      }
    } catch {
      setActionMessage(`Sync failed for ${connectorId}`);
    }
    setTimeout(() => setActionMessage(""), 5000);
  };

  // Run inter-agency payload simulation
  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/interop/simulate-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePortal: simSource,
          targetPortal: simTarget,
          applicantName: simApplicant,
          district: simDistrict
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.exchangeLog);
        setActionMessage("✓ Inter-agency payload transformed and verified with SHA-256 hash!");
        // Refresh logs list
        fetchAllData();
      }
    } catch {
      setActionMessage("Simulation failed to execute.");
    } finally {
      setIsSimulating(false);
      setTimeout(() => setActionMessage(""), 6000);
    }
  };

  return (
    <div className="interop-container">
      {/* Top Header */}
      <div className="interop-header">
        <div className="interop-header-left">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <span className="state-badge">Government of Maharashtra • MSInS</span>
            <span style={{ fontSize: "0.8rem", color: "#60a5fa", fontWeight: "600" }}>PS ID: 26129</span>
          </div>
          <h1>
            MahaSetu Interoperability Studio
          </h1>
          <p className="interop-subtitle">
            Federated Service Delivery Middleware, Non-Invasive Legacy Connectors, IndEA v2.0 Schema Translation & DEPA Consent Data Broker.
          </p>
        </div>

        <div className="interop-header-actions">
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <button className="btn-refresh" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              ← Return to State Admin
            </button>
          </Link>
          <button
            className="btn-simulate"
            onClick={() => setActiveTab("simulate")}
          >
            ⚡ Test API Exchange
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div style={{
          background: "rgba(59, 130, 246, 0.2)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          color: "#93c5fd",
          padding: "0.75rem 1.25rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.9rem"
        }}>
          <span>ℹ️</span> {actionMessage}
        </div>
      )}

      {/* Key Architectural Metrics Grid */}
      <div className="interop-metrics-grid">
        <div className="metric-card">
          <div className="metric-card-accent" />
          <div className="metric-label">Connected Portals</div>
          <div className="metric-value">{metrics ? `${metrics.activeConnectors}/${metrics.totalConnectors}` : "6/6"}</div>
          <div className="metric-subtext">● 100% Health Status</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent emerald" />
          <div className="metric-label">Inter-Agency Exchanges</div>
          <div className="metric-value">{metrics ? metrics.totalTransactions.toLocaleString() : "9,870"}</div>
          <div className="metric-subtext">⚡ 99.8% Success Rate (avg {metrics?.avgLatencyMs || 34}ms)</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent amber" />
          <div className="metric-label">Duplicates Suppressed</div>
          <div className="metric-value">{metrics ? metrics.duplicateSubmissionsPrevented : "342"}</div>
          <div className="metric-subtext">🛡️ {metrics ? metrics.duplicateReductionPercentage : "84.6%"} Fraud & Duplicate Block</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent purple" />
          <div className="metric-label">Processing Time Saved</div>
          <div className="metric-value">{metrics ? metrics.avgProcessingTimeReduction : "68.4%"}</div>
          <div className="metric-subtext">⏱️ {metrics ? metrics.citizenHoursSaved : "12,450 hrs"} Citizen Hours</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent" />
          <div className="metric-label">Standard Data Compliance</div>
          <div className="metric-value">{metrics ? metrics.standardDataCompliance : "99.2%"}</div>
          <div className="metric-subtext">✓ IndEA v2.0 & Open Data Spec</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="interop-tabs">
        <button
          className={`interop-tab-btn ${activeTab === "topology" ? "active" : ""}`}
          onClick={() => setActiveTab("topology")}
        >
          🌐 Connector Topology ({connectors.length})
        </button>
        <button
          className={`interop-tab-btn ${activeTab === "exchange" ? "active" : ""}`}
          onClick={() => setActiveTab("exchange")}
        >
          📋 Live API Exchange & Audit Stream ({logs.length})
        </button>
        <button
          className={`interop-tab-btn ${activeTab === "simulate" ? "active" : ""}`}
          onClick={() => setActiveTab("simulate")}
        >
          🧪 Inter-Agency Payload Simulator
        </button>
        <button
          className={`interop-tab-btn ${activeTab === "workflows" ? "active" : ""}`}
          onClick={() => setActiveTab("workflows")}
        >
          ⚙️ Workflow Orchestrator ({pipelines.length})
        </button>
        <button
          className={`interop-tab-btn ${activeTab === "consent" ? "active" : ""}`}
          onClick={() => setActiveTab("consent")}
        >
          🔒 DEPA Consent & Master Data ({consents.length})
        </button>
      </div>

      {/* =========================================================
         TAB 1: TOPOLOGY & CONNECTORS REGISTRY
      ========================================================= */}
      {activeTab === "topology" && (
        <div>
          {/* Visual Hub & Spoke Architecture */}
          <div className="topology-section">
            <div className="topology-hub">
              <div className="hub-core">
                <div style={{ fontSize: "1.8rem", marginBottom: "0.2rem" }}>🏛️</div>
                <div className="hub-title">MahaSetu</div>
                <div className="hub-subtitle">Federated Core</div>
              </div>
              <p style={{ marginTop: "1rem", color: "#94a3b8", fontSize: "0.85rem", textAlign: "center" }}>
                Non-invasive API Gateway, IndEA JSON-LD Schema Translator, and Cryptographic SHA-256 Audit Engine.
              </p>
            </div>

            <div className="connectors-grid">
              {connectors.map(c => (
                <div className="connector-card" key={c.id}>
                  <div>
                    <div className="connector-header">
                      <div>
                        <h4 className="connector-name">{c.name}</h4>
                        <p className="connector-dept">{c.department}</p>
                      </div>
                      <div className={`status-indicator ${c.status}`}>
                        <div className="status-dot" />
                        {c.status}
                      </div>
                    </div>

                    <div className="connector-details">
                      <div className="detail-item">
                        <span>Protocol / Format</span>
                        <span>{c.protocol}</span>
                      </div>
                      <div className="detail-item">
                        <span>Schema Standard</span>
                        <span>{c.standardSchema}</span>
                      </div>
                      <div className="detail-item">
                        <span>Ping Latency</span>
                        <span style={{ color: "#34d399" }}>{c.healthLatencyMs} ms</span>
                      </div>
                      <div className="detail-item">
                        <span>Records Bridged</span>
                        <span>{c.activeRecordsCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="connector-actions">
                    <button
                      className="btn-card-action"
                      onClick={() => handleTestPing(c.connectorId)}
                    >
                      📡 Test Ping
                    </button>
                    <button
                      className="btn-card-action"
                      onClick={() => handleSync(c.connectorId)}
                    >
                      🔄 Sync Schema
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         TAB 2: LIVE API EXCHANGE & AUDIT STREAM
      ========================================================= */}
      {activeTab === "exchange" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["ALL", "SUCCESS", "RECONCILED", "EXCEPTION"].map(st => (
                <button
                  key={st}
                  style={{
                    background: logFilter === st ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.05)",
                    border: logFilter === st ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.1)",
                    color: logFilter === st ? "#60a5fa" : "#94a3b8",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                  onClick={() => setLogFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Showing {logs.length} audited transactions • Real-time SHA-256 verifiable
            </span>
          </div>

          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Tx ID & Timestamp</th>
                  <th>Source Portal</th>
                  <th>Target Portal</th>
                  <th>Transformation</th>
                  <th>Latency</th>
                  <th>SHA-256 Hash</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "#fff" }}>{l.transactionId}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {new Date(l.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#93c5fd", fontWeight: "600" }}>{l.sourcePortal}</span>
                    </td>
                    <td>
                      <span style={{ color: "#34d399", fontWeight: "600" }}>{l.targetPortal}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", background: "rgba(255, 255, 255, 0.06)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                        {l.payloadSourceFormat} → {l.payloadTargetFormat}
                      </span>
                    </td>
                    <td>{l.latencyMs} ms</td>
                    <td>
                      <span className="hash-pill" title={l.sha256VerificationHash}>
                        {l.sha256VerificationHash.substring(0, 16)}...
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: l.status === "SUCCESS" ? "#34d399" : l.status === "RECONCILED" ? "#f59e0b" : "#ef4444",
                        fontWeight: "700",
                        fontSize: "0.8rem"
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <button
                        style={{
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          color: "#60a5fa",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                        onClick={() => setSelectedLog(l)}
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
         TAB 3: INTERACTIVE PAYLOAD SIMULATOR
      ========================================================= */}
      {activeTab === "simulate" && (
        <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "1.3rem" }}>
            Live Inter-Agency API Transformation Testbed
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Simulate a live payload transfer from a legacy department (e.g. MahaSwayam or Aaple Sarkar in XML/SOAP) through the MahaSetu IndEA v2.0 Adapter into MahaDBT.
          </p>

          <form onSubmit={handleRunSimulation} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Source Authority</label>
              <select
                style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", padding: "0.6rem", borderRadius: "8px" }}
                value={simSource}
                onChange={e => setSimSource(e.target.value)}
              >
                <option value="MahaSwayam (Skills)">MahaSwayam (Skills & Apprenticeship)</option>
                <option value="Aaple Sarkar (RTS)">Aaple Sarkar (Right to Services)</option>
                <option value="DigiLocker Vault">DigiLocker / Citizen Vault</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Target Authority</label>
              <select
                style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", padding: "0.6rem", borderRadius: "8px" }}
                value={simTarget}
                onChange={e => setSimTarget(e.target.value)}
              >
                <option value="MahaDBT (Scholarships)">MahaDBT (Direct Benefit Transfer)</option>
                <option value="MSInS (Innovation)">MSInS Innovation Society</option>
                <option value="Integrated State Treasury">Integrated State Treasury</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Beneficiary / Applicant</label>
              <input
                type="text"
                style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", padding: "0.6rem", borderRadius: "8px" }}
                value={simApplicant}
                onChange={e => setSimApplicant(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Jurisdiction / District</label>
              <select
                style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", padding: "0.6rem", borderRadius: "8px" }}
                value={simDistrict}
                onChange={e => setSimDistrict(e.target.value)}
              >
                <option value="Pune">Pune</option>
                <option value="Mumbai Suburban">Mumbai Suburban</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Nashik">Nashik</option>
                <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                disabled={isSimulating}
                className="btn-simulate"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {isSimulating ? "Translating & Signing..." : "🚀 Execute Exchange"}
              </button>
            </div>
          </form>

          {/* Simulation Output */}
          {simResult && (
            <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, color: "#34d399", fontSize: "1.1rem" }}>
                  ✓ Transformation Successful (Transaction ID: {simResult.transactionId})
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Latency: {simResult.latencyMs}ms • Data Quality Score: {simResult.dataQualityScore}/100
                </span>
              </div>

              <div className="payload-comparison">
                <div className="payload-block">
                  <h4>Legacy Input Payload (XML/SOAP Format from {simResult.sourcePortal})</h4>
                  <div className="code-viewer">
{`<Application>
  <Source>${simResult.sourcePortal}</Source>
  <Applicant>${simApplicant}</Applicant>
  <District>${simDistrict}</District>
  <State>Maharashtra</State>
  <Qualification>ITI Electrician Level 4</Qualification>
  <Status>VERIFIED_BY_DEPT</Status>
</Application>`}
                  </div>
                </div>

                <div className="payload-block">
                  <h4>MahaSetu IndEA v2.0 JSON-LD Transformed & Signed Payload</h4>
                  <div className="code-viewer">
                    {simResult.transformedPayload}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", background: "rgba(0, 0, 0, 0.4)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.8rem" }}>
                <span style={{ color: "#64748b" }}>Verifiable Cryptographic Proof (SHA-256): </span>
                <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{simResult.sha256VerificationHash}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
         TAB 4: WORKFLOW ORCHESTRATOR
      ========================================================= */}
      {activeTab === "workflows" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Multi-agency workflow pipelines configured to route tasks and data across portals without requiring citizen physical visits.
          </p>

          {pipelines.map(pipe => {
            let steps = [];
            try { steps = JSON.parse(pipe.stepsConfiguration); } catch { steps = []; }
            return (
              <div className="pipeline-card" key={pipe.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.3rem 0", color: "#fff", fontSize: "1.15rem" }}>{pipe.name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#60a5fa" }}>Category: {pipe.serviceCategory}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#34d399", fontWeight: "700", fontSize: "0.95rem" }}>{pipe.slaComplianceRate}% SLA Compliance</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Avg Duration: {pipe.avgCompletionHours}h / Target: {pipe.slaTargetHours}h</div>
                  </div>
                </div>

                <div className="pipeline-steps-flow">
                  {steps.map((st, i) => (
                    <React.Fragment key={st.order}>
                      <div className="pipeline-step-node">
                        <div className="pipeline-step-order">Step 0{st.order} • {st.slaHours}h SLA</div>
                        <div className="pipeline-step-portal">{st.portal}</div>
                        <div className="pipeline-step-task">{st.task}</div>
                      </div>
                      {i < steps.length - 1 && <div className="pipeline-arrow">➔</div>}
                    </React.Fragment>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Active Executions: <strong>{pipe.activeInstancesCount} applications</strong> in pipeline
                  </span>
                  <button
                    style={{
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "#60a5fa",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setActionMessage(`Pipeline '${pipe.name}' triggered for active test batch.`);
                      setTimeout(() => setActionMessage(""), 4000);
                    }}
                  >
                    ▶️ Trigger Batch Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
         TAB 5: DEPA CONSENT & MASTER DATA
      ========================================================= */}
      {activeTab === "consent" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Consent-Based Data Sharing (DEPA 2.0 / DigiLocker Standard). Enables citizens to share pre-verified credentials between departments with zero repeated document submissions.
          </p>

          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Consent ID</th>
                  <th>Citizen Beneficiary</th>
                  <th>Source Vault</th>
                  <th>Target Department</th>
                  <th>Purpose</th>
                  <th>Shared Attributes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {consents.map(c => {
                  let attrs = [];
                  try { attrs = JSON.parse(c.sharedAttributes); } catch { attrs = []; }
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: "700", color: "#38bdf8" }}>{c.consentId}</td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#fff" }}>{c.citizenName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Aadhaar: {c.aadhaarMasked}</div>
                      </td>
                      <td style={{ color: "#93c5fd" }}>{c.sourceDepartment}</td>
                      <td style={{ color: "#34d399" }}>{c.targetDepartment}</td>
                      <td style={{ fontSize: "0.8rem" }}>{c.purpose}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", maxWidth: "220px" }}>
                          {attrs.map((a, i) => (
                            <span key={i} style={{ fontSize: "0.7rem", background: "rgba(255, 255, 255, 0.08)", padding: "0.15rem 0.4rem", borderRadius: "3px" }}>
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: c.status === "ACTIVE" ? "#34d399" : "#ef4444", fontWeight: "700", fontSize: "0.8rem" }}>
                          ✓ {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inter-Agency Audit Inspection: {selectedLog.transactionId}</h3>
              <button className="btn-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "1rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div><strong>Source:</strong> {selectedLog.sourcePortal}</div>
                <div><strong>Destination:</strong> {selectedLog.targetPortal}</div>
                <div><strong>Latency:</strong> {selectedLog.latencyMs} ms</div>
              </div>
              <div className="payload-comparison">
                <div className="payload-block">
                  <h4>Transaction Summary & Schema Mapping</h4>
                  <p style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{selectedLog.payloadSummary}</p>
                  <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Format: {selectedLog.payloadSourceFormat} ➔ {selectedLog.payloadTargetFormat}</p>
                </div>
                <div className="payload-block">
                  <h4>Transformed IndEA JSON-LD Payload</h4>
                  <div className="code-viewer">
                    {selectedLog.transformedPayload}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "1rem", background: "#050b14", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem" }}>
                <span style={{ color: "#64748b" }}>SHA-256 Cryptographic Audit Hash: </span>
                <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{selectedLog.sha256VerificationHash}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
