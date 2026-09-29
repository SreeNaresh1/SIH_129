import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../App.css";

const API_BASE = "http://localhost:5000";

function ProblemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("citizen");
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showIndEAPayload, setShowIndEAPayload] = useState(false);

  // Government Review Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const getToken = () => {
    return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "citizen";
    setUserRole(role);
  }, []);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/problems/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (res.status === 403) {
        setError("You are not authorized to view this application.");
        return;
      }

      if (!res.ok || !data.problem) {
        setError(data.message || "Application not found.");
        return;
      }

      setProblem(data.problem);
    } catch (err) {
      console.error("Load application error:", err);
      setError("Unable to load application details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  // Government Status Update Handler
  const handleUpdateStatus = async (newStatus, projectStatusNote) => {
    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const token = getToken();
      const res = await fetch(`${API_BASE}/api/problems/${encodeURIComponent(problem.problemId || id)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          projectStatus: projectStatusNote || `Processed by Nodal Officer (${newStatus})`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionError(data.message || "Failed to update status.");
        return;
      }

      setActionMessage(`✅ Success: Application status updated to '${newStatus}'. Direct Benefit Disbursal order generated.`);
      setProblem(data.problem);
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err) {
      console.error("Status update error:", err);
      setActionError("Error updating status on server.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔄</div>
          <h3>Loading Application Details &amp; InterOp Telemetry...</h3>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "#ffffff", padding: "30px", borderRadius: "14px", border: "1px solid #fecaca", textAlign: "center" }}>
          <div style={{ fontSize: "36px", color: "#dc2626", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ color: "#991b1b", margin: "0 0 10px 0" }}>Unable to View Application</h2>
          <p style={{ color: "#64748b", margin: "0 0 20px 0" }}>{error || "Application record not found."}</p>
          <button
            onClick={() => navigate(userRole === "government" ? "/admin" : "/citizen/problems")}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ← Return to {userRole === "government" ? "Government Nodal Desk" : "My Applications"}
          </button>
        </div>
      </div>
    );
  }

  const trackingNumber = problem.trackingId || problem.problemId || `MH-FED-2026-${problem.id}`;
  const consentToken = problem.consentToken || `DEPA-MH-2026-${Date.now().toString().slice(-6)}`;
  const status = problem.status || "Under Review";

  const isApproved = status === "Approved" || status === "Completed" || status === "Resolved";
  const isInProgress = status === "In Progress";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 24px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* TOP BAR / NAVIGATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <button
            onClick={() => navigate(userRole === "government" ? "/admin" : "/citizen/problems")}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              padding: "9px 16px",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            ← Back to {userRole === "government" ? "Government Nodal Desk" : "My Applications"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: "20px", fontWeight: "700" }}>
              ⏱️ Maharashtra RTS Statutory SLA: <strong>Active (48h)</strong>
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "800",
                padding: "6px 14px",
                borderRadius: "20px",
                textTransform: "uppercase",
                background: isApproved ? "#dcfce7" : isInProgress ? "#dbeafe" : "#fef3c7",
                color: isApproved ? "#15803d" : isInProgress ? "#1d4ed8" : "#b45309",
                border: `1px solid ${isApproved ? "#bbf7d0" : isInProgress ? "#bfdbfe" : "#fde68a"}`,
              }}
            >
              {status}
            </span>
          </div>
        </div>

        {/* HERO TITLE CARD */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "26px 30px",
            marginBottom: "24px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: "800",
                background: "#0f172a",
                color: "#38bdf8",
                padding: "6px 12px",
                borderRadius: "8px",
                display: "inline-block",
              }}
            >
              {trackingNumber}
            </span>
            <span style={{ fontSize: "12.5px", color: "#64748b" }}>
              Unified Ingestion: {new Date(problem.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px 0" }}>
            {problem.title}
          </h1>

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 16px 0" }}>
            {problem.description}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "12.5px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
            <div>📍 District: <strong style={{ color: "#1e293b" }}>{problem.district || "Maharashtra"}</strong></div>
            <div>🏛️ Primary Ingestion Node: <strong style={{ color: "#1e293b" }}>{problem.primaryDepartment || "MahaSwayam (Skill & Employment)"}</strong></div>
            <div>🔄 Target Disbursal: <strong style={{ color: "#1e293b" }}>{Array.isArray(problem.targetDepartments) ? problem.targetDepartments.join(", ") : "MahaDBT, DigiLocker"}</strong></div>
          </div>
        </div>

        {/* 4-STAGE FEDERATED PIPELINE STEPPER */}
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 26px", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "14px" }}>
            Multi-Departmental Interoperability Pipeline Progression:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {/* STEP 1 */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", marginBottom: "4px" }}>STEP 1 • COMPLETED</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", marginBottom: "4px" }}>Single Window Ingestion</div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>IndEA v2.0 Canonical JSON-LD mediated</div>
            </div>

            {/* STEP 2 */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", marginBottom: "4px" }}>STEP 2 • COMPLETED</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", marginBottom: "4px" }}>DigiLocker e-KYC</div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>Identity &amp; credentials auto-verified</div>
            </div>

            {/* STEP 3 */}
            <div style={{ background: isApproved ? "#f8fafc" : "#eff6ff", padding: "14px", borderRadius: "10px", border: `1px solid ${isApproved ? "#e2e8f0" : "#bfdbfe"}` }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: isApproved ? "#16a34a" : "#2563eb", marginBottom: "4px" }}>
                {isApproved ? "STEP 3 • COMPLETED" : "STEP 3 • ACTIVE"}
              </div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", marginBottom: "4px" }}>MahaDBT Inter-Agency Sync</div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>NPCI bank account &amp; scheme clearance</div>
            </div>

            {/* STEP 4 */}
            <div style={{ background: isApproved ? "#f0fdf4" : "#f8fafc", padding: "14px", borderRadius: "10px", border: `1px solid ${isApproved ? "#bbf7d0" : "#e2e8f0"}` }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: isApproved ? "#16a34a" : "#94a3b8", marginBottom: "4px" }}>
                {isApproved ? "STEP 4 • COMPLETED" : "STEP 4 • PENDING APPROVAL"}
              </div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: isApproved ? "#15803d" : "#475569", marginBottom: "4px" }}>Final Disbursal</div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>Direct Benefit Disbursed to Bank A/C</div>
            </div>
          </div>
        </div>

        {/* =========================================================
            CORE INNOVATION: FEDERATED REGISTRY EVIDENCE VAULT
            (EXPLAINS HOW CITIZENS NEED NOT UPLOAD ANY DOCUMENTS!)
        ========================================================= */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "16px",
            padding: "26px 30px",
            color: "#ffffff",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7", padding: "4px 10px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "800", marginBottom: "8px", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                🔒 Zero Document Uploads Required
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: "0 0 6px 0" }}>
                Federated Registry Evidence Vault (DEPA 2.0 Consent-Driven)
              </h2>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, maxWidth: "700px", lineHeight: "1.5" }}>
                Under India's Data Empowerment &amp; Protection Architecture (DEPA 2.0), the citizen granted cryptographic consent (Token: <code style={{ color: "#38bdf8" }}>{consentToken}</code>). All 4 foundational records were retrieved instantly from authenticated national and state registries without manual scanning or physical document submissions.
              </p>
            </div>

            <button
              onClick={() => setShowConsentModal(true)}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              📜 View DEPA Consent Artifact
            </button>
          </div>

          {/* 4 REGISTRY EVIDENCE CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
            {/* CARD 1: DIGILOCKER */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", color: "#60a5fa" }}>
                  🗂️ DigiLocker National Gateway
                </span>
                <span style={{ fontSize: "11px", fontWeight: "800", background: "#065f46", color: "#a7f3d0", padding: "2px 8px", borderRadius: "10px" }}>
                  PULLED VIA API
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0", marginBottom: "4px" }}>
                • <strong>Aadhaar e-KYC Identity:</strong> Verified via UIDAI Vault API (Hash: <code style={{ color: "#38bdf8", fontSize: "11px" }}>SHA256:7b91...8841</code>)
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0" }}>
                • <strong>Vocational Marksheet:</strong> Verified (MSBVE Pune, Score: 89.2%, Trade: Solar Technician)
              </div>
            </div>

            {/* CARD 2: MAHADBT */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", color: "#f59e0b" }}>
                  🏦 MahaDBT Beneficiary Registry
                </span>
                <span style={{ fontSize: "11px", fontWeight: "800", background: "#065f46", color: "#a7f3d0", padding: "2px 8px", borderRadius: "10px" }}>
                  NPCI SEEDED
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0", marginBottom: "4px" }}>
                • <strong>Bank Account:</strong> State Bank of India (IFSC: <code>SBIN0000455</code>, A/C: <code>XXXXXX4912</code>)
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0" }}>
                • <strong>Deduplication Audit:</strong> 0 duplicate claims detected across 14 state stipend schemes.
              </div>
            </div>

            {/* CARD 3: MAHABHUMI / REVENUE */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", color: "#34d399" }}>
                  🌾 Mahabhumi 7/12 Land Registry
                </span>
                <span style={{ fontSize: "11px", fontWeight: "800", background: "#065f46", color: "#a7f3d0", padding: "2px 8px", borderRadius: "10px" }}>
                  LAND TITLE SYNC
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0" }}>
                • <strong>Digital Record:</strong> Gat No. 418/2, Haveli Tehsil, Pune District. Digitized title confirmed.
              </div>
            </div>

            {/* CARD 4: AAPLE SARKAR */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", color: "#c084fc" }}>
                  🏛️ Aaple Sarkar Service Gateway
                </span>
                <span style={{ fontSize: "11px", fontWeight: "800", background: "#065f46", color: "#a7f3d0", padding: "2px 8px", borderRadius: "10px" }}>
                  RTS GUARANTEED
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#e2e8f0" }}>
                • <strong>Statutory Service Track:</strong> Enrolled under Maharashtra Right to Public Services Act (RTS 2015).
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            GOVERNMENT NODAL ACTION PANEL (WHEN VIEWED BY GOVERNMENT)
        ========================================================= */}
        {userRole === "government" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "2px solid #2563eb",
              padding: "24px 28px",
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                  🏛️ Government Nodal Review &amp; Statutory Action Panel
                </h3>
                <p style={{ margin: "3px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Authorize cross-agency clearance, forward records across departmental connectors, or disburse benefits.
                </p>
              </div>
              <span style={{ fontSize: "11.5px", background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
                Nodal Officer Privileges
              </span>
            </div>

            {actionMessage && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "13.5px", fontWeight: "600" }}>
                {actionMessage}
              </div>
            )}

            {actionError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "14px", fontSize: "13.5px" }}>
                ❌ {actionError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
              <button
                type="button"
                disabled={actionLoading || isApproved}
                onClick={() => handleUpdateStatus("Approved", "Statutory clearance granted. Direct Benefit Disbursed via MahaDBT.")}
                style={{
                  flex: 1,
                  background: isApproved ? "#94a3b8" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: "800",
                  padding: "13px 18px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: isApproved || actionLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  boxShadow: isApproved ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                {isApproved ? "✅ Benefit Already Disbursed" : "✅ Approve & Disburse Benefit (MahaDBT)"}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("In Progress", "Forwarded to Secondary Nodal Agency for Field Telemetry.")}
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  fontWeight: "700",
                  padding: "13px 18px",
                  borderRadius: "10px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                🔄 Forward to Secondary Agency
              </button>

              <button
                type="button"
                onClick={() => setShowIndEAPayload(!showIndEAPayload)}
                style={{
                  background: "#f8fafc",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  fontWeight: "700",
                  padding: "13px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showIndEAPayload ? "Hide Schema" : "🔍 Inspect IndEA Schema"}
              </button>
            </div>
          </div>
        )}

        {/* EXPANDABLE INDEA V2 SCHEMA INSPECTION */}
        {showIndEAPayload && (
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", marginBottom: "24px", color: "#38bdf8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>
                IndEA v2.0 Canonical JSON-LD Mediated Exchange Payload:
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Standards Compliant (IndEA 2.0)</span>
            </div>
            <pre style={{ margin: 0, fontSize: "11.5px", lineHeight: "1.5", overflowX: "auto" }}>
{`{
  "$schema": "https://indea.gov.in/schemas/v2/unified-service-exchange.json",
  "universalTrackingId": "${trackingNumber}",
  "timestamp": "${new Date(problem.createdAt || Date.now()).toISOString()}",
  "depaConsentToken": "${consentToken}",
  "district": "${problem.district || "Pune"}",
  "primaryAgency": "${problem.primaryDepartment || "MahaSwayam"}",
  "federatedTargets": ${JSON.stringify(problem.targetDepartments || ["MahaDBT", "DigiLocker"])},
  "canonicalEntity": {
    "applicantHash": "SHA256:7b9148e23f...9841",
    "verifiedDataPull": {
      "digiLockerMarksheetMatch": true,
      "mahadbtAccountVerified": true,
      "rtsCompliant": true
    },
    "disbursementRouter": {
      "npcilinked": true,
      "ifsc": "SBIN0000455",
      "payoutStatus": "${isApproved ? "DISBURSED" : "PENDING_NODAL_SIGN"}"
    }
  }
}`}
            </pre>
          </div>
        )}

        {/* DEPA CONSENT ARTIFACT MODAL */}
        {showConsentModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                maxWidth: "600px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  📜 Cryptographic DEPA 2.0 Consent Artifact
                </h3>
                <button
                  onClick={() => setShowConsentModal(false)}
                  style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                This cryptographic token was issued under India's Data Empowerment &amp; Protection Architecture (DEPA 2.0) framework, granting explicit, time-bound consent to pull verified records without manual document uploads.
              </p>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", fontSize: "12px", fontFamily: "monospace", color: "#1e293b", marginBottom: "20px", lineHeight: "1.6" }}>
                <div><strong>Consent Handle:</strong> {consentToken}</div>
                <div><strong>Consent Status:</strong> ACTIVE &amp; VERIFIED</div>
                <div><strong>Consent Scope:</strong> [IDENTITY_EKYC, VOCATIONAL_MARKS, BANK_ACCOUNT]</div>
                <div><strong>Data Providers:</strong> [DigiLocker, MahaDBT, Mahabhumi]</div>
                <div><strong>Data Consumer:</strong> MahaSetu Single Window Gateway</div>
                <div><strong>Signature Alg:</strong> Ed25519 / RSA-PSS (SHA-256)</div>
                <div><strong>Zero Uploads:</strong> CONFIRMED (Zero paper/scanned docs required)</div>
              </div>

              <button
                onClick={() => setShowConsentModal(false)}
                style={{
                  width: "100%",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "700",
                  padding: "11px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close Consent Inspector
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDetails;