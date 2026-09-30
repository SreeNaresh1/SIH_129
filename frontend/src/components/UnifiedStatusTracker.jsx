import React, { useState, useEffect } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function UnifiedStatusTracker() {
  const [applications, setApplications] = useState([
    {
      trackingId: "MH-2026-APP-8841",
      schemeName: "Direct Apprenticeship Incentive & Skill Verification",
      currentDept: "Department of Skills & Entrepreneurship (MahaSwayam)",
      stage: "Cross-Agency Direct Benefit Authorization",
      slaStatus: "ON_TIME",
      slaDaysLeft: 5,
      lastUpdated: "Today, 11:42 AM",
      statusColor: "#4ade80"
    },
    {
      trackingId: "MH-2026-WTR-1042",
      schemeName: "Rural Drinking Water Infrastructure Feeder Repair",
      currentDept: "Water Supply and Sanitation Department (WSSD)",
      stage: "Telemetry Dispatch & Line Order Sanction",
      slaStatus: "ON_TIME",
      slaDaysLeft: 2,
      lastUpdated: "Yesterday, 04:15 PM",
      statusColor: "#4ade80"
    },
    {
      trackingId: "RTS-PUN-REV-2026-00412",
      schemeName: "Non-Creamy Layer / Income Certificate Attestation",
      currentDept: "Revenue and Forest Department / Right to Services",
      stage: "Tahsildar Digital Signature Verification",
      slaStatus: "RESOLVED",
      slaDaysLeft: 0,
      lastUpdated: "28 Sep 2026",
      statusColor: "#38bdf8"
    }
  ]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTimeline = async (app) => {
    setSelectedApp(app);
    setLoadingTimeline(true);
    try {
      const res = await fetch(`${API}/api/interop/tracking/${app.trackingId}`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setTimelineData(data);
      }
    } catch (e) {
      console.error("Failed to load timeline:", e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.trackingId.toLowerCase().includes(q) ||
      app.schemeName.toLowerCase().includes(q) ||
      app.currentDept.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Subheader */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <span
            style={{
              background: "rgba(74, 222, 128, 0.15)",
              color: "#4ade80",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase"
            }}
          >
            Zero-Visit Single Window
          </span>
          <h2 style={{ margin: "10px 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#fff" }}>
            Unified Cross-Department Application Tracker
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Track all your government applications across skills, benefits, land, and revenue in one single consolidated pane.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Tracking ID (e.g. MH-2026-APP-8841), scheme name, or department..."
          style={{
            width: "100%",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "11px 16px",
            color: "#fff",
            fontSize: "13px",
            outline: "none"
          }}
        />
      </div>

      {/* Main Two-Panel: Application Cards + Federated Timeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedApp ? "1fr 1.3fr" : "1fr",
          gap: "20px",
          alignItems: "start"
        }}
      >
        {/* Applications List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredApps.map((app) => {
            const isSelected = selectedApp?.trackingId === app.trackingId;
            return (
              <div
                key={app.trackingId}
                onClick={() => loadTimeline(app)}
                style={{
                  background: isSelected ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.8)",
                  border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "monospace", fontWeight: 700 }}>
                      {app.trackingId}
                    </span>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginTop: "2px" }}>
                      {app.schemeName}
                    </div>
                  </div>
                  <span
                    style={{
                      background: app.slaStatus === "RESOLVED" ? "rgba(56, 189, 248, 0.15)" : "rgba(74, 222, 128, 0.15)",
                      color: app.slaStatus === "RESOLVED" ? "#38bdf8" : "#4ade80",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 800
                    }}
                  >
                    {app.slaStatus}
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Department: <strong style={{ color: "#cbd5e1" }}>{app.currentDept}</strong>
                </div>

                <div style={{ fontSize: "12px", color: "#f59e0b" }}>
                  Current Stage: <span style={{ color: "#e2e8f0" }}>{app.stage}</span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "#64748b"
                  }}
                >
                  <span>Last Updated: {app.lastUpdated}</span>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>View Federated Timeline ➔</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Federated Timeline Inspector */}
        {selectedApp && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase"
                  }}
                >
                  Cross-Agency Lifecycle
                </span>
                <h3 style={{ margin: "10px 0 4px 0", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
                  {selectedApp.schemeName}
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Tracking ID: <code style={{ color: "#38bdf8" }}>{selectedApp.trackingId}</code>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            {loadingTimeline ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Querying inter-agency federated timeline...
              </div>
            ) : timelineData?.federatedTimeline ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {timelineData.federatedTimeline.map((step, idx) => {
                  const isDone = step.status === "COMPLETED";
                  const isCurrent = step.status === "ACTIVE" || step.status === "IN_PROGRESS";
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "14px",
                        position: "relative"
                      }}
                    >
                      {/* Node Indicator */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: isDone ? "#10b981" : isCurrent ? "#f59e0b" : "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#000",
                            fontSize: "12px",
                            fontWeight: 900,
                            boxShadow: isCurrent ? "0 0 12px #f59e0b" : "none"
                          }}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        {idx < timelineData.federatedTimeline.length - 1 && (
                          <div
                            style={{
                              width: "2px",
                              flex: 1,
                              background: isDone ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)",
                              margin: "4px 0"
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.6)",
                          border: isCurrent ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "10px",
                          padding: "14px",
                          flex: 1,
                          marginBottom: "6px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <strong style={{ color: "#fff", fontSize: "14px" }}>{step.portal}</strong>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              color: isDone ? "#4ade80" : isCurrent ? "#fbbf24" : "#94a3b8"
                            }}
                          >
                            {step.status}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
                          {step.action}
                        </div>
                        {step.officer && (
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                            Assigned Officer: {step.officer}
                          </div>
                        )}
                        {step.proofHash && (
                          <div style={{ fontSize: "10px", color: "#38bdf8", fontFamily: "monospace", marginTop: "6px" }}>
                            Audit Proof: {step.proofHash.slice(0, 16)}...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "12px" }}>Select an application to inspect inter-agency progress.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
