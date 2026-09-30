import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function WorkflowOrchestrator() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interop/pipelines`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.pipelines)) {
        setPipelines(data.pipelines);
      }
    } catch (err) {
      console.error("Failed to load pipelines:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const handleTrigger = async (pipelineId) => {
    setTriggeringId(pipelineId);
    setNotification(null);
    try {
      const res = await fetch(`${API}/api/interop/pipelines/trigger`, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pipelineId })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: "success",
          msg: `Pipeline '${data.name}' triggered! Cross-departmental orchestration running.`
        });
        await fetchPipelines();
      }
    } catch (e) {
      setNotification({ type: "error", msg: `Failed to trigger pipeline: ${e.message}` });
    } finally {
      setTriggeringId(null);
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
            Configurable Inter-Agency Workflow Pipelines
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Automated handoff chains passing citizen applications across departments without manual physical dispatch.
          </p>
        </div>
        <button
          onClick={fetchPipelines}
          style={{
            background: "rgba(56, 189, 248, 0.12)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: "#38bdf8",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          ↻ Refresh Pipelines
        </button>
      </div>

      {notification && (
        <div
          style={{
            background: notification.type === "success" ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${notification.type === "success" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: notification.type === "success" ? "#86efac" : "#fca5a5",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Pipelines List */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading workflow pipelines...</div>
      ) : pipelines.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>No active pipelines configured.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {pipelines.map((pipe) => {
            let steps = [];
            try {
              steps = typeof pipe.stepsConfiguration === "string" ? JSON.parse(pipe.stepsConfiguration) : (pipe.stepsConfiguration || []);
            } catch {
              steps = [];
            }

            let participating = [];
            try {
              participating = typeof pipe.participatingPortals === "string" ? JSON.parse(pipe.participatingPortals) : (pipe.participatingPortals || []);
            } catch {
              participating = [];
            }

            return (
              <div
                key={pipe.pipelineId}
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)"
                }}
              >
                {/* Pipeline Top Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        {pipe.pipelineId}
                      </span>
                      <span
                        style={{
                          background: "rgba(74, 222, 128, 0.15)",
                          color: "#4ade80",
                          border: "1px solid rgba(74, 222, 128, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        {pipe.status || "ACTIVE"}
                      </span>
                    </div>

                    <h3 style={{ margin: "8px 0 4px 0", fontSize: "17px", fontWeight: 800, color: "#fff" }}>
                      {pipe.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Category: <span style={{ color: "#f8fafc" }}>{pipe.serviceCategory}</span> | Trigger: <code style={{ color: "#f59e0b" }}>{pipe.triggerEventType || "EVENT"}</code>
                    </div>
                  </div>

                  {/* Right Action & Stats */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "#4ade80" }}>
                        {pipe.slaComplianceRate || 98.4}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>SLA Compliance</div>
                    </div>
                    <button
                      onClick={() => handleTrigger(pipe.pipelineId)}
                      disabled={triggeringId === pipe.pipelineId}
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        border: "none",
                        color: "#000",
                        padding: "9px 18px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: triggeringId === pipe.pipelineId ? "not-allowed" : "pointer"
                      }}
                    >
                      {triggeringId === pipe.pipelineId ? "⏳ Triggering..." : "⚡ Trigger Pipeline"}
                    </button>
                  </div>
                </div>

                {/* KPI Bar */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    borderRadius: "10px",
                    padding: "12px 18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                    fontSize: "12px"
                  }}
                >
                  <div>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>Active Instances</span>
                    <div style={{ color: "#38bdf8", fontWeight: 800, fontSize: "15px", marginTop: "2px" }}>
                      {pipe.activeInstancesCount || 0}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>Average Runtime</span>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginTop: "2px" }}>
                      {pipe.avgCompletionHours || 3.8} hrs
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>SLA Max Target</span>
                    <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: "15px", marginTop: "2px" }}>
                      {pipe.slaTargetHours || 24} hrs
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>Participating Portals</span>
                    <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "12px", marginTop: "4px" }}>
                      {participating.join(", ")}
                    </div>
                  </div>
                </div>

                {/* Visual Inter-Agency Handoff Chain Flow */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                    Inter-Agency Handoff Chain ({steps.length} Stages)
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      overflowX: "auto",
                      paddingBottom: "8px"
                    }}
                  >
                    {steps.map((st, i) => (
                      <React.Fragment key={i}>
                        <div
                          style={{
                            background: "rgba(30, 41, 59, 0.8)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            borderRadius: "10px",
                            padding: "14px 18px",
                            minWidth: "190px",
                            flexShrink: 0
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "#38bdf8",
                                color: "#000",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 900
                              }}
                            >
                              {st.order || i + 1}
                            </span>
                            <span style={{ fontSize: "10px", color: "#64748b" }}>
                              {st.slaHours ? `SLA: ${st.slaHours}h` : "Auto"}
                            </span>
                          </div>

                          <div style={{ fontWeight: 800, color: "#fff", fontSize: "13px", marginTop: "8px" }}>
                            {st.portal}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", lineHeight: 1.3 }}>
                            {st.task}
                          </div>
                        </div>

                        {i < steps.length - 1 && (
                          <div style={{ color: "#38bdf8", fontSize: "18px", fontWeight: 900, flexShrink: 0, padding: "0 4px" }}>
                            ➔
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
