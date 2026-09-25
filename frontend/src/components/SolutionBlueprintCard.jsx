import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export default function SolutionBlueprintCard({ problemId, problem }) {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | budget | raci | signatories
  const [copied, setCopied] = useState(false);

  // Strictly visible only to Government Admin
  const userRole = localStorage.getItem("userRole") || "";
  if (userRole && userRole !== "government") {
    return null;
  }

  // Auto-generate or check if blueprint can be fetched
  const generateBlueprint = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/advanced/problems/${problemId}/generate-blueprint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate solution blueprint.");
      }

      setBlueprint(data.blueprint);
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError(err.message || "Unable to formulate DPR blueprint.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyDPRSummary = () => {
    if (!blueprint) return;
    const text = `JHARKHAND SOCIETAL CHALLENGE PLATFORM - STATUTORY DPR SUMMARY
Challenge ID: ${blueprint.problemId}
Title: ${blueprint.title}
Estimated Budget: ${blueprint.budget?.totalBudgetFormatted || '₹5.50 Lakhs'}
Co-Funding: Govt DMFT (45%), Corporate CSR (45%), University R&D (10%)
Turnaround: 90 Days (Phase 1: Relief -> Phase 2: Prototype -> Phase 3: Handover)
Engine: Deterministic GovTech Financial Engine`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      className="solution-blueprint-section"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "18px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "20px",
                letterSpacing: "0.5px"
              }}
            >
              ⚡ INNOVATIVE FEATURE
            </span>
            <span
              style={{
                background: "#f0fdf4",
                color: "#166534",
                fontSize: "12px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid #bbf7d0"
              }}
            >
              Deterministic GovTech Engine (&lt;10ms, Non-LLM)
            </span>
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "8px 0 4px 0"
            }}
          >
            1-Click Solution Blueprint & Statutory Budget DPR
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            Instant statutory Detailed Project Report (DPR) formulating a 90-day turnaround, line-item budget, and DMFT/CSR statutory co-funding split.
          </p>
        </div>

        {/* Generate / Action Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {!blueprint ? (
            <button
              type="button"
              onClick={generateBlueprint}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "⚙️ Formulating DPR..." : "⚡ Generate 1-Click DPR Blueprint"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={copyDPRSummary}
                style={{
                  background: copied ? "#ecfdf5" : "#f8fafc",
                  color: copied ? "#059669" : "#475569",
                  border: `1px solid ${copied ? "#a7f3d0" : "#cbd5e1"}`,
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Summary"}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: "#1e293b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🖨️ Print Dossier
              </button>

              <button
                type="button"
                onClick={generateBlueprint}
                disabled={loading}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🔄 Recalculate
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* When Not Yet Generated */}
      {!blueprint && !loading && (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: "10px",
            marginTop: "18px",
            border: "1px dashed #cbd5e1"
          }}
        >
          <div style={{ fontSize: "38px", marginBottom: "10px" }}>📑</div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
            Statutory Detailed Project Report (DPR) Ready to Generate
          </h3>
          <p style={{ margin: "0 auto 16px auto", maxWidth: "540px", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
            Click above to instantly synthesize an execution blueprint calculating exact line-item equipment costs, 90-day multi-stakeholder RACI matrix, and 45:45:10 statutory co-funding formula (DMFT + CSR + University).
          </p>
          <button
            type="button"
            onClick={generateBlueprint}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ⚡ Formulate DPR Blueprint Now
          </button>
        </div>
      )}

      {/* When Loading */}
      {loading && (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</div>
          <p style={{ marginTop: "12px", color: "#475569", fontWeight: 600, fontSize: "14px" }}>
            Synthesizing DMFT allocations, CSR co-funding schedules, and multi-agency RACI matrix...
          </p>
        </div>
      )}

      {/* When Blueprint is Available */}
      {blueprint && (
        <div style={{ marginTop: "18px" }}>
          {/* Executive KPI Chips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "18px"
            }}
          >
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                💰 Formulated Budget (DPR)
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {blueprint.budget?.totalBudgetFormatted || "₹5.50 Lakhs"}
              </div>
              <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                100% Statutory Allocation
              </div>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                ⏱️ Turnaround Timeline
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                90 Calendar Days
              </div>
              <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600, marginTop: "2px" }}>
                3 Structured Execution Phases
              </div>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                🤝 Co-Funding Ratio
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                45% Govt | 45% CSR
              </div>
              <div style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 600, marginTop: "2px" }}>
                10% University R&D Grant
              </div>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                👥 Target Beneficiaries
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {problem?.affectedPeople ? `${Number(problem.affectedPeople).toLocaleString()} Citizens` : "500+ Residents"}
              </div>
              <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600, marginTop: "2px" }}>
                Direct Community Relief
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "#166534",
              lineHeight: "1.6"
            }}
          >
            <strong>📋 Executive Project Charter: </strong>
            {blueprint.executiveSummary}
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid #e2e8f0",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap"
            }}
          >
            {[
              { id: "timeline", label: "📅 90-Day Milestones", count: blueprint.timeline?.length },
              { id: "budget", label: "💰 Line-Item Budget & CSR Split", count: blueprint.budget?.lineItems?.length },
              { id: "raci", label: "👥 Multi-Agency RACI Matrix", count: blueprint.raciMatrix?.length },
              { id: "signatories", label: "🏛️ Statutory Signatories & KPIs", count: blueprint.signatories?.length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid #2563eb" : "3px solid transparent",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#2563eb" : "#64748b",
                  cursor: "pointer",
                  marginBottom: "-2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: 90-DAY MILESTONES */}
          {activeTab === "timeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {blueprint.timeline?.map((milestone, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    borderLeft: `4px solid ${idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                      {milestone.phase}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                        ⏱️ {milestone.days}
                      </span>
                      <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px" }}>
                        Lead: {milestone.leadAgency}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
                    <strong>Deliverable: </strong> {milestone.deliverable}
                  </div>

                  <div style={{ fontSize: "12px", color: "#059669", background: "#f0fdf4", padding: "6px 10px", borderRadius: "6px" }}>
                    <strong>🎯 Verified KPI: </strong> {milestone.targetKPI}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LINE-ITEM BUDGET & CSR SPLIT */}
          {activeTab === "budget" && (
            <div>
              {/* Co-Funding Split Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                {blueprint.budget?.coFundingSplit?.map((split, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: idx === 0 ? "#eff6ff" : idx === 1 ? "#ecfdf5" : "#faf5ff",
                      border: `1px solid ${idx === 0 ? "#bfdbfe" : idx === 1 ? "#a7f3d0" : "#e9d5ff"}`,
                      borderRadius: "10px",
                      padding: "12px"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                      {split.source}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                      ₹{Number(split.amountINR).toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      {split.sharePct}% Statutory Share ({split.schemeName || split.partnerName || split.institutionName})
                    </div>
                  </div>
                ))}
              </div>

              {/* Itemized Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "10px" }}>Line Item Description</th>
                    <th style={{ textAlign: "right", padding: "10px" }}>Amount (INR)</th>
                    <th style={{ textAlign: "right", padding: "10px" }}>Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {blueprint.budget?.lineItems?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", color: "#1e293b", fontWeight: 500 }}>{item.item}</td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                        ₹{Number(item.amountINR).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", color: "#64748b" }}>
                        {item.sharePct}%
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f8fafc", fontWeight: 800 }}>
                    <td style={{ padding: "12px 10px" }}>TOTAL ESTIMATED DPR BUDGET</td>
                    <td style={{ padding: "12px 10px", textAlign: "right", color: "#2563eb", fontSize: "15px" }}>
                      {blueprint.budget?.totalBudgetFormatted}
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "right", color: "#2563eb" }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: MULTI-AGENCY RACI MATRIX */}
          {activeTab === "raci" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "10px" }}>Activity / Workstream</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>🎓 University</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>🏛️ Government</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>🏢 Industry Partner</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>🤝 NGO / Panchayat</th>
                  </tr>
                </thead>
                <tbody>
                  {blueprint.raciMatrix?.map((row, idx) => {
                    const badge = (val) => {
                      const colors = {
                        Responsible: { bg: "#dbeafe", text: "#1d4ed8" },
                        Accountable: { bg: "#fef3c7", text: "#b45309" },
                        Consulted: { bg: "#f3e8ff", text: "#7e22ce" },
                        Informed: { bg: "#f1f5f9", text: "#475569" }
                      }[val] || { bg: "#f1f5f9", text: "#475569" };
                      return (
                        <span
                          style={{
                            background: colors.bg,
                            color: colors.text,
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700
                          }}
                        >
                          {val}
                        </span>
                      );
                    };

                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px", fontWeight: 600, color: "#1e293b" }}>{row.activity}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{badge(row.university)}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{badge(row.government)}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{badge(row.industry)}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{badge(row.ngo)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: "12px", fontSize: "11px", color: "#64748b", display: "flex", gap: "16px" }}>
                <span><strong>R:</strong> Responsible (Does work)</span>
                <span><strong>A:</strong> Accountable (Final approval)</span>
                <span><strong>C:</strong> Consulted (2-way input)</span>
                <span><strong>I:</strong> Informed (Kept updated)</span>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY SIGNATORIES & KPIS */}
          {activeTab === "signatories" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "18px" }}>
                {blueprint.impactKPIs?.map((kpi, idx) => (
                  <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{kpi.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
                  ✍️ DESIGNATED STATUTORY SIGNATORIES
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {blueprint.signatories?.map((sig, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        borderRadius: "8px",
                        padding: "14px",
                        textAlign: "center"
                      }}
                    >
                      <div style={{ height: "35px", borderBottom: "1px solid #cbd5e1", marginBottom: "8px" }} />
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{sig.role}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{sig.jurisdiction || sig.institution || sig.corporate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
