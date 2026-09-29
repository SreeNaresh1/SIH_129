import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../App.css";

function ReportProblem() {
  const navigate = useNavigate();

  // =========================================================
  // PRESET FEDERATED SERVICES (PROBLEM STATEMENT 26129)
  // =========================================================
  const SERVICE_PRESETS = [
    {
      id: "apprenticeship-dbt",
      title: "Apprenticeship Incentive & MahaDBT Direct Stipend Disbursal",
      category: "Skills & Higher Education",
      primaryDepartment: "Department of Skills, Employment & Entrepreneurship (MahaSwayam)",
      targetDepartments: ["MahaSwayam", "MahaDBT", "DigiLocker"],
      description: "Synchronized cross-departmental verification between ITI vocational credentials, attendance logs, and MahaDBT stipend disbursement registry to eliminate repeated physical submissions.",
      statutorySlaHours: 48,
    },
    {
      id: "msme-clearance",
      title: "Single-Window MSME Green Industrial Clearance & Consent to Operate",
      category: "Industries & Commerce",
      primaryDepartment: "Directorate of Industries (MAITRI Single Window)",
      targetDepartments: ["Industries Dept", "MPCB (Pollution Control)", "Revenue & Land Dept"],
      description: "Unified clearance workflow coordinating environmental compliance, land non-agricultural certification, and industrial power feasibility with zero repetitive documentation.",
      statutorySlaHours: 72,
    },
    {
      id: "farmer-solar",
      title: "Farmer Solar Feeder Subsidy & Krishi Sanjeevani Registry Sync",
      category: "Agriculture & Energy",
      primaryDepartment: "Department of Agriculture (Krishi Sanjeevani)",
      targetDepartments: ["Agriculture Dept", "MSEDCL (Power Discom)", "Revenue (7/12 Land Registry)"],
      description: "Integrated verification linking 7/12 land records, agricultural water pump meter feasibility, and MSEDCL subsidized solar feeder connections into a single digital ledger.",
      statutorySlaHours: 48,
    },
    {
      id: "caste-rts-cert",
      title: "Universal Citizen Identity & Caste/Income RTS Certificate Auto-Verification",
      category: "Social Justice & Public Administration",
      primaryDepartment: "Social Justice & Special Assistance Department",
      targetDepartments: ["Social Justice", "DigiLocker e-KYC", "Aaple Sarkar (e-District)"],
      description: "1-Click automated verification of genealogical records, parental income affidavits, and DigiLocker caste validity under Maharashtra Right to Services (RTS) Act.",
      statutorySlaHours: 24,
    },
  ];

  const MAHARASHTRA_DISTRICTS = [
    "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar", "Beed", "Bhandara",
    "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
    "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
    "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv", "Palghar",
    "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
    "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
  ];

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================
  const [selectedPresetId, setSelectedPresetId] = useState("apprenticeship-dbt");

  const [formData, setFormData] = useState({
    title: SERVICE_PRESETS[0].title,
    description: SERVICE_PRESETS[0].description,
    primaryDepartment: SERVICE_PRESETS[0].primaryDepartment,
    targetDepartments: SERVICE_PRESETS[0].targetDepartments,
    district: "Pune",
    location: "Aundh ITI Complex, Haveli Tehsil",
    applicantName: "Ramesh Vinayak Kadam",
    applicantPhone: "+91 98220 19482",
    slaPreference: "Fast-Track (24h SLA)",
  });

  const [depaConsentActive, setDepaConsentActive] = useState(false);
  const [depaToken, setDepaToken] = useState("");
  const [depaLoading, setDepaLoading] = useState(false);
  const [depaDetails, setDepaDetails] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);

  // Handle Preset Change
  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = SERVICE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        title: preset.title,
        description: preset.description,
        primaryDepartment: preset.primaryDepartment,
        targetDepartments: preset.targetDepartments,
      }));
    }
  };

  // Toggle Target Department Checkbox
  const handleToggleTargetDept = (dept) => {
    setFormData(prev => {
      const exists = prev.targetDepartments.includes(dept);
      const updated = exists
        ? prev.targetDepartments.filter(d => d !== dept)
        : [...prev.targetDepartments, dept];
      return { ...prev, targetDepartments: updated };
    });
  };

  // =========================================================
  // 1-CLICK DEPA 2.0 CONSENT AUTO-FILL SIMULATION
  // =========================================================
  const handleTriggerDepaConsent = async () => {
    try {
      setDepaLoading(true);
      setError("");

      // Query the live master-data endpoint from interop routes
      let masterData = null;
      try {
        const res = await fetch("http://localhost:5000/api/interop/master-data/lookup");
        const json = await res.json();
        if (json.success && json.masterRecord) {
          masterData = json.masterRecord;
        }
      } catch (e) {
        // Fallback to local deterministic mock if endpoint is sleeping
      }

      // Generate Cryptographic Consent Token
      const generatedToken = `DEPA-MH-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      setDepaToken(generatedToken);

      const verifiedDetails = {
        token: generatedToken,
        timestamp: new Date().toLocaleTimeString(),
        digilockerAadhaar: "Verified (UIDAI Vault Hash: SHA256:...9841)",
        digilockerMarksheet: "Vocational Level 4 (ITI Pune, Score: 89.2%) Verified",
        mahadbtAccount: "State Bank of India (IFSC: SBIN0000455, A/C: ****4912) NPCI-Seeded",
        landRecord: "Mahabhumi 7/12 Survey No. 418/2 Pre-Validated",
        savedDocsCount: 4,
      };

      setDepaDetails(verifiedDetails);
      setDepaConsentActive(true);

      // Auto-fill form fields with verified master record
      if (masterData) {
        const prof = masterData.citizenProfile;
        setFormData(prev => ({
          ...prev,
          applicantName: prof.name || prev.applicantName,
          district: prof.district || "Pune",
          location: `${prof.village}, ${prof.taluka}, ${prof.district}`,
        }));
      }
    } catch (err) {
      console.error("DEPA Consent Error:", err);
      setError("Unable to initialize DEPA consent broker. Please retry.");
    } finally {
      setDepaLoading(false);
    }
  };

  // =========================================================
  // SUBMIT UNIFIED INTEGRATED APPLICATION
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in as a Citizen to submit an application.");
      navigate("/login");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide a service application title and description.");
      return;
    }

    setSubmitting(true);

    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const trackingId = `MH-FED-2026-${randomSuffix}`;
      const activeConsent = depaToken || `DEPA-MH-2026-CONSENT-${randomSuffix}`;

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("district", formData.district);
      payload.append("location", formData.location);
      payload.append("domain", "Public Administration");
      payload.append("severity", "High");
      payload.append("trackingId", trackingId);
      payload.append("serviceType", "Unified Inter-Departmental Service");
      payload.append("primaryDepartment", formData.primaryDepartment);
      payload.append("targetDepartments", JSON.stringify(formData.targetDepartments));
      payload.append("consentToken", activeConsent);

      const response = await fetch("http://localhost:5000/api/problems", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const contentType = response.headers.get("content-type") || "";
      let result = {};
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("Invalid response from server.");
      }

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to submit unified service application.");
        return;
      }

      setSubmissionSuccess({
        trackingId,
        consentToken: activeConsent,
        primaryDept: formData.primaryDepartment,
        targetDepts: formData.targetDepartments,
        problemId: result.problem?.problemId || trackingId,
      });
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Unable to reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="citizen-dashboard" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <aside className="citizen-sidebar">
        <div className="dashboard-logo" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "14px",
            }}
          >
            MH
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", lineHeight: "1.2" }}>MahaSetu</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Citizen Single Window</div>
          </div>
        </div>

        <div className="sidebar-menu">
          <Link to="/citizen" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
            <span>🏠</span> Dashboard
          </Link>
          <Link to="/citizen/report" className="active" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#eff6ff", color: "#1d4ed8", fontWeight: "600", textDecoration: "none" }}>
            <span>⚡</span> New Service Application
          </Link>
          <Link to="/citizen/problems" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
            <span>📋</span> My Applications &amp; Status
          </Link>
          <Link to="/citizen/notifications" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
            <span>🔔</span> Service Notifications
          </Link>
        </div>

        <div className="sidebar-bottom">
          <Link to="/login" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
            🚪 Logout
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="citizen-main" style={{ padding: "30px 36px" }}>
        {/* BREADCRUMB & HEADER */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "6px" }}>
            MahaSetu Citizen Desk › <strong>New Integrated Service Application</strong>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
            Single-Window Public Service Application
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            Apply once across multiple Maharashtra departments. DEPA 2.0 cryptographic consent eliminates repeated documentation.
          </p>
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div style={{ marginBottom: "20px", padding: "14px 16px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "13.5px" }}>
            ❌ {error}
          </div>
        )}

        {/* SUBMISSION SUCCESS MODAL */}
        {submissionSuccess && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.7)",
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
                borderRadius: "20px",
                maxWidth: "580px",
                width: "100%",
                padding: "36px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px auto",
                }}
              >
                ✅
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
                Integrated Application Ingested Successfully!
              </h2>

              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0", lineHeight: "1.5" }}>
                Your request has been canonicalized into <strong>IndEA v2.0 JSON-LD</strong> and federated across the target departmental endpoints.
              </p>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Universal Tracking ID:</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#2563eb", fontFamily: "monospace" }}>
                    {submissionSuccess.trackingId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>DEPA 2.0 Consent Token:</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#059669", fontFamily: "monospace" }}>
                    {submissionSuccess.consentToken}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Primary Department:</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>
                    {submissionSuccess.primaryDept.split("(")[0]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Federated Disbursal Target:</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>
                    {submissionSuccess.targetDepts.join(" • ")}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/citizen/problems")}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    fontWeight: "700",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Track Status Across Departments →
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionSuccess(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    fontWeight: "600",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            SECTION 1: SERVICE CATALOG PRESETS
        ==================================================== */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                1. Select Integrated Maharashtra Service
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                Choose a pre-configured multi-department bundle or configure a custom integration request.
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "20px" }}>
              4 Ready Bundles Available
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
            {SERVICE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  style={{
                    border: `2px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                    background: isSelected ? "#eff6ff" : "#ffffff",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: isSelected ? "#1d4ed8" : "#64748b", textTransform: "uppercase" }}>
                      {preset.category}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "700", background: isSelected ? "#dbeafe" : "#f1f5f9", color: isSelected ? "#1e40af" : "#64748b", padding: "2px 8px", borderRadius: "12px" }}>
                      ⏱️ {preset.statutorySlaHours}h SLA
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 6px 0", fontSize: "14.5px", fontWeight: "700", color: isSelected ? "#1e3a8a" : "#0f172a" }}>
                    {preset.title}
                  </h4>

                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                    {preset.description}
                  </p>

                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    <strong>Departments Linked:</strong> {preset.targetDepartments.join(" ➔ ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            SECTION 2: HERO DEPA 2.0 CONSENT AUTO-FILL CARD
        ==================================================== */}
        <div
          style={{
            background: depaConsentActive
              ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
              : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "16px",
            padding: "24px 28px",
            color: "#ffffff",
            marginBottom: "26px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: depaConsentActive ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.2)", color: depaConsentActive ? "#6ee7b7" : "#fbbf24", padding: "4px 10px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "700", marginBottom: "8px", border: `1px solid ${depaConsentActive ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.3)"}` }}>
                {depaConsentActive ? "✅ DEPA 2.0 Consent Active & Verified" : "⚡ Key Innovation: Zero Document Re-upload"}
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: "0 0 6px 0" }}>
                1-Click Consent Auto-Fill (DEPA 2.0 Architecture)
              </h2>

              <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, maxWidth: "620px", lineHeight: "1.4" }}>
                Grant cryptographic permission to retrieve your verified credentials directly from DigiLocker (Aadhaar/Marks) and MahaDBT (NPCI Bank Account). No repeated manual entries.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerDepaConsent}
              disabled={depaLoading}
              style={{
                background: depaConsentActive
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: depaConsentActive ? "#ffffff" : "#0f172a",
                fontWeight: "800",
                fontSize: "13.5px",
                padding: "14px 22px",
                borderRadius: "10px",
                border: "none",
                cursor: depaLoading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
              }}
            >
              {depaLoading
                ? "Connecting Federated Nodes..."
                : depaConsentActive
                ? "🔄 Re-Sync Consent Token"
                : "⚡ 1-Click DEPA Auto-Fill"}
            </button>
          </div>

          {/* VERIFIED DETAILS CARD */}
          {depaConsentActive && depaDetails && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                fontSize: "12px",
              }}
            >
              <div>
                <span style={{ color: "#94a3b8", display: "block", marginBottom: "2px" }}>Consent Token:</span>
                <strong style={{ color: "#6ee7b7", fontFamily: "monospace" }}>{depaDetails.token}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", marginBottom: "2px" }}>DigiLocker Identity:</span>
                <strong style={{ color: "#ffffff" }}>{depaDetails.digilockerAadhaar}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", marginBottom: "2px" }}>MahaDBT Payment Route:</span>
                <strong style={{ color: "#ffffff" }}>{depaDetails.mahadbtAccount}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", marginBottom: "2px" }}>Status:</span>
                <strong style={{ color: "#38bdf8" }}>{depaDetails.savedDocsCount} Documents Auto-Linked</strong>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            SECTION 3: SERVICE APPLICATION FORM
        ==================================================== */}
        <form onSubmit={handleSubmit} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "26px", marginBottom: "28px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
            2. Application Particulars &amp; Departmental Routing
          </h3>

          {/* SERVICE TITLE */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
              Integrated Service Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* TWO COLUMN GRID: DISTRICT & PRIMARY DEPT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
                Target Maharashtra District *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                  background: "#ffffff",
                }}
              >
                {MAHARASHTRA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    📍 {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
                Primary Department Ingestion Node *
              </label>
              <input
                type="text"
                value={formData.primaryDepartment}
                onChange={(e) => setFormData({ ...formData, primaryDepartment: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* LOCATION & APPLICANT NAME */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
                Tehsil / Taluka / Local Entity Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="e.g. Haveli, Baramati, or Andheri East"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
                Applicant Name / Authorized Signatory
              </label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* TARGET DEPARTMENTS MULTI-SELECT CHECKBOXES */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
              Target Synchronized Departmental Backends (Data Exchange Pipeline) *
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["MahaDBT", "DigiLocker", "MahaSwayam", "Aaple Sarkar", "MPCB (Pollution)", "MSEDCL (Power)", "Revenue & Land Dept", "Industries Dept"].map((dept) => {
                const checked = formData.targetDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleToggleTargetDept(dept)}
                    style={{
                      border: `1.5px solid ${checked ? "#2563eb" : "#cbd5e1"}`,
                      background: checked ? "#eff6ff" : "#f8fafc",
                      color: checked ? "#1d4ed8" : "#475569",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12.5px",
                      fontWeight: checked ? "700" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{checked ? "✓" : "+"}</span>
                    <span>{dept}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DETAILED SERVICE SCOPE / DESCRIPTION */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>
              Application Particulars &amp; Inter-Agency Justification *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
              }}
            />
          </div>

          {/* EXPANDABLE INDEA V2 SCHEMA PREVIEW */}
          <div style={{ marginBottom: "22px" }}>
            <button
              type="button"
              onClick={() => setShowSchemaPreview(!showSchemaPreview)}
              style={{
                background: "transparent",
                border: "none",
                color: "#2563eb",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{showSchemaPreview ? "▼ Hide" : "▶ View"} IndEA v2.0 Canonical JSON-LD Transmission Schema</span>
            </button>

            {showSchemaPreview && (
              <pre
                style={{
                  background: "#0f172a",
                  color: "#38bdf8",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "11.5px",
                  marginTop: "8px",
                  overflowX: "auto",
                  lineHeight: "1.4",
                }}
              >
{`{
  "$schema": "https://indea.gov.in/schemas/v2/unified-service-exchange.json",
  "exchangeId": "EXC-MAHA-${Date.now().toString().slice(-6)}",
  "consentToken": "${depaToken || "DEPA-MAHA-AUTO-VALID"}",
  "serviceCatalogId": "${selectedPresetId}",
  "district": "${formData.district}",
  "departmentsInvolved": ${JSON.stringify(formData.targetDepartments)},
  "canonicalPayload": {
    "applicantHash": "SHA256:7b9148...8841",
    "disbursementTarget": "MahaDBT",
    "eKycValidated": true
  }
}`}
              </pre>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "800",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {submitting ? "Canonicalizing & Federating Payload..." : "🚀 Submit Integrated Service Application"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ReportProblem;