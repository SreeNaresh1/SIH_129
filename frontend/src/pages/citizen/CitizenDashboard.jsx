import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../App.css";

function CitizenDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [securityNotice, setSecurityNotice] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | CHECK SECURITY / ACCESS RESTRICTION NOTICES
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    // Check if user was redirected from government admin route
    if (location.state?.accessDenied) {
      setSecurityNotice(location.state.deniedMessage || "Access Restricted: Government Nodal Desks require verified departmental credentials.");
    } else {
      try {
        const storedNotice = sessionStorage.getItem("gov_access_denied");
        if (storedNotice) {
          const parsed = JSON.parse(storedNotice);
          setSecurityNotice(parsed.message);
          sessionStorage.removeItem("gov_access_denied");
        }
      } catch (e) {
        // Ignore JSON error
      }
    }
  }, [location]);

  /*
  |--------------------------------------------------------------------------
  | LOAD LOGGED-IN CITIZEN'S APPLICATIONS
  |--------------------------------------------------------------------------
  */
  const loadProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/problems/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("The backend returned an invalid response.");
      }

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your applications.");
      }

      setProblems(Array.isArray(data.problems) ? data.problems : []);
    } catch (err) {
      console.error("LOAD CITIZEN APPLICATIONS ERROR:", err);
      setError(err.message || "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | STATUS COUNTS
  |--------------------------------------------------------------------------
  */
  const totalApplications = problems.length;
  const crossAgencyReview = problems.filter(p => p.status === "Under Review").length;
  const inProcessing = problems.filter(p => p.status === "In Progress").length;
  const approvedDisbursed = problems.filter(p => p.status === "Resolved" || p.status === "Completed" || p.status === "Approved").length;

  const getStatusClass = (status) => {
    if (status === "Under Review") return "review";
    if (status === "In Progress") return "progress";
    if (status === "Completed" || status === "Resolved" || status === "Approved") return "resolved";
    return "review";
  };

  const recentApplications = [...problems]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  return (
    <div className="citizen-dashboard" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* ================================
          SIDEBAR
      ================================= */}
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
          <Link to="/citizen" className="active" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#eff6ff", color: "#1d4ed8", fontWeight: "600", textDecoration: "none" }}>
            <span>🏠</span> Dashboard
          </Link>
          <Link to="/citizen/report" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
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
          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("currentUser");
              localStorage.removeItem("userRole");
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
          >
            🚪 Logout
          </Link>
        </div>
      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}
      <main className="citizen-main" style={{ padding: "30px 36px" }}>
        {/* TOP BAR */}
        <div className="dashboard-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
              Citizen &amp; Business Single-Window Desk
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Unified Multi-Department Service Delivery • Government of Maharashtra (PS 26129)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "20px", fontWeight: "700" }}>
              🔒 DEPA 2.0 Consent Active
            </span>
            <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "8px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "18px" }}>👤</span>
              <span style={{ fontWeight: "700", fontSize: "13.5px", color: "#1e293b" }}>
                {localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")).name : "Citizen Applicant"}
              </span>
            </div>
          </div>
        </div>

        {/* SECURITY ISOLATION ALERT BANNER */}
        {securityNotice && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderLeft: "5px solid #d97706",
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "22px" }}>🛡️</span>
              <div>
                <strong style={{ color: "#92400e", fontSize: "14px", display: "block" }}>
                  Government Administrative Gateway Isolation
                </strong>
                <span style={{ color: "#b45309", fontSize: "13px" }}>
                  {securityNotice}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSecurityNotice(null)}
              style={{
                border: "none",
                background: "transparent",
                color: "#92400e",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "16px",
                padding: "4px 8px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "13.5px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* STATISTICS GRID */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "26px" }}>
          <div className="stat-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              📑
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 2px 0" }}>{totalApplications}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Applications Submitted</p>
            </div>
          </div>

          <div className="stat-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              🔄
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 2px 0" }}>{crossAgencyReview}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Cross-Agency Sync</p>
            </div>
          </div>

          <div className="stat-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              ⚙️
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 2px 0" }}>{inProcessing}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>In Active Processing</p>
            </div>
          </div>

          <div className="stat-card" style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              ✅
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 2px 0" }}>{approvedDisbursed}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Approved &amp; Disbursed</p>
            </div>
          </div>
        </div>

        {/* HERO ACTION BANNER */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)",
            borderRadius: "16px",
            padding: "26px 32px",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 25px -5px rgba(3, 105, 161, 0.3)",
            marginBottom: "28px",
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
              ⚡ 1-Click DEPA 2.0 Consent Auto-Fill
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 6px 0", color: "#ffffff" }}>
              Apply for Unified Maharashtra Public Services
            </h2>
            <p style={{ fontSize: "13.5px", color: "#e0f2fe", margin: 0, maxWidth: "600px", lineHeight: "1.5" }}>
              Submit once through MahaSetu. DigiLocker and MahaDBT automatically synchronize verified credentials across all state departments without repeating document uploads.
            </p>
          </div>

          <Link to="/citizen/report">
            <button
              type="button"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#0f172a",
                fontWeight: "800",
                fontSize: "14px",
                padding: "14px 24px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
              }}
            >
              + New Integrated Application
            </button>
          </Link>
        </div>

        {/* HOW MAHASETU WORKS ARCHITECTURE STRIP */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                How MahaSetu Eliminates Service Delivery Fragmentation
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                Canonical IndEA v2.0 schema mediation between disparate departmental systems
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "6px" }}>
              Statutory 24-48h SLA
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", marginBottom: "4px" }}>STEP 1 • SINGLE WINDOW</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", marginBottom: "2px" }}>1-Click Application</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4" }}>Citizen selects unified service &amp; grants DEPA consent.</div>
            </div>

            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#059669", marginBottom: "4px" }}>STEP 2 • REGISTRY PULL</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", marginBottom: "2px" }}>DigiLocker &amp; e-KYC</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4" }}>Aadhaar, Caste, &amp; Academic marksheets auto-fetched.</div>
            </div>

            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9333ea", marginBottom: "4px" }}>STEP 3 • INTER-AGENCY SYNC</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", marginBottom: "2px" }}>MahaDBT &amp; State Depts</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4" }}>Data translated into IndEA v2 canonical JSON-LD.</div>
            </div>

            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#ea580c", marginBottom: "4px" }}>STEP 4 • UNIVERSAL ID</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", marginBottom: "2px" }}>Tracking &amp; Disbursal</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4" }}>Single tracking ID: MH-FED-2026 across all portals.</div>
            </div>
          </div>
        </div>

        {/* RECENT APPLICATIONS SECTION */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>
                My Active Applications &amp; Federated Services
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Track end-to-end multi-agency verification in real time
              </p>
            </div>

            <Link
              to="/citizen/problems"
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#2563eb",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View All Applications →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "14px" }}>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Loading your applications...</p>
            </div>
          ) : recentApplications.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>
                No Service Applications Yet
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 20px 0", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
                You have not submitted any integrated service applications yet. Apply now with 1-click DEPA consent auto-fill.
              </p>
              <Link to="/citizen/report">
                <button
                  type="button"
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "700",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Apply for Your First Service
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentApplications.map((app) => {
                const appId = app.problemId || app.id;
                const trackingNumber = app.trackingId || `MH-FED-2026-${appId.slice(-4)}`;

                return (
                  <Link
                    key={appId}
                    to={`/problem/${appId}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 140px 140px",
                      alignItems: "center",
                      gap: "16px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#93c5fd";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
                    }}
                  >
                    {/* UNIVERSAL TRACKING ID */}
                    <div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#1d4ed8",
                          background: "#eff6ff",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid #dbeafe",
                          display: "inline-block",
                        }}
                      >
                        {trackingNumber}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        {new Date(app.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* TITLE & DEPARTMENT ROUTE */}
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14.5px", fontWeight: "700", color: "#0f172a" }}>
                        {app.title}
                      </h4>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>📍 {app.district || "Maharashtra"}</span>
                        <span>•</span>
                        <span>
                          Route: <strong style={{ color: "#334155" }}>{app.primaryDepartment || "MahaSwayam"}</strong> ➔ <strong style={{ color: "#334155" }}>MahaDBT</strong>
                        </span>
                      </div>
                    </div>

                    {/* CONSENT TOKEN */}
                    <div>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "700",
                          color: "#059669",
                          background: "#ecfdf5",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid #a7f3d0",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        🔒 DEPA Granted
                      </span>
                    </div>

                    {/* STATUS BADGE */}
                    <div style={{ textAlign: "right" }}>
                      <span
                        className={`status-badge ${getStatusClass(app.status)}`}
                        style={{
                          display: "inline-block",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                        }}
                      >
                        {app.status || "Under Review"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default CitizenDashboard;