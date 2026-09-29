import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../App.css";

function MyProblems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /*
  |--------------------------------------------------------------------------
  | LOAD CITIZEN'S APPLICATIONS
  |--------------------------------------------------------------------------
  */
  const loadMyApplications = async () => {
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
      console.error("LOAD MY APPLICATIONS ERROR:", err);
      setError(err.message || "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyApplications();
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  /*
  |--------------------------------------------------------------------------
  | FILTERED APPLICATIONS
  |--------------------------------------------------------------------------
  */
  const filteredProblems = problems.filter((app) => {
    const tracking = app.trackingId || app.problemId || "";
    const title = app.title || "";
    const district = app.district || "";

    const matchesSearch =
      tracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      district.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "REVIEW") return app.status === "Under Review";
    if (statusFilter === "PROGRESS") return app.status === "In Progress";
    if (statusFilter === "APPROVED")
      return app.status === "Approved" || app.status === "Completed" || app.status === "Resolved";

    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
      case "Resolved":
      case "Approved":
        return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
      case "In Progress":
        return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
      default:
        return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
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
          <Link to="/citizen/report" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
            <span>⚡</span> New Service Application
          </Link>
          <Link to="/citizen/problems" className="active" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#eff6ff", color: "#1d4ed8", fontWeight: "600", textDecoration: "none" }}>
            <span>📋</span> My Applications &amp; Status
          </Link>
          <Link to="/citizen/notifications" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", color: "#475569", fontWeight: "500", textDecoration: "none" }}>
            <span>🔔</span> Service Notifications
          </Link>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#ef4444",
              background: "transparent",
              border: "none",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="citizen-main" style={{ padding: "30px 36px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "6px" }}>
              MahaSetu Single Window › <strong>Universal Service Tracking</strong>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
              My Applications &amp; Federated Tracking
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Track real-time cross-departmental progression across MahaDBT, DigiLocker, and State registries.
            </p>
          </div>

          <Link to="/citizen/report">
            <button
              type="button"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13.5px",
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
            >
              <span>+</span> New Application
            </button>
          </Link>
        </div>

        {/* METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Total Applications</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{problems.length}</div>
          </div>
          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#b45309" }}>Multi-Agency Review</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", marginTop: "2px" }}>
              {problems.filter((p) => p.status === "Under Review").length}
            </div>
          </div>
          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#1d4ed8" }}>In Active Processing</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
              {problems.filter((p) => p.status === "In Progress").length}
            </div>
          </div>
          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#15803d" }}>Approved &amp; Disbursed</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
              {problems.filter((p) => p.status === "Completed" || p.status === "Resolved" || p.status === "Approved").length}
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "22px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="Search by Universal Tracking ID (e.g. MH-FED-2026), Service Title, or District..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                boxSizing: "border-box",
                outline: "none",
                background: "#ffffff",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "ALL", label: "All" },
              { id: "REVIEW", label: "Under Review" },
              { id: "PROGRESS", label: "In Progress" },
              { id: "APPROVED", label: "Approved" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: statusFilter === tab.id ? "700" : "500",
                  background: statusFilter === tab.id ? "#1e293b" : "#ffffff",
                  color: statusFilter === tab.id ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* APPLICATIONS LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "14px" }}>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading your applications...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>
              No Applications Match Your Filter
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 18px 0" }}>
              Try adjusting your search criteria or submit a new integrated service application.
            </p>
            <button
              type="button"
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
              style={{
                background: "#f1f5f9",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredProblems.map((app) => {
              const appId = app.problemId || app.id;
              const trackingNumber = app.trackingId || `MH-FED-2026-${String(appId).slice(-4)}`;
              const statusStyle = getStatusBadgeStyle(app.status);

              return (
                <div
                  key={appId}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "22px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* TOP ROW: TRACKING ID & BADGES */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#1d4ed8",
                          background: "#eff6ff",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #dbeafe",
                        }}
                      >
                        {trackingNumber}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Submitted {new Date(app.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "4px 8px", borderRadius: "6px" }}>
                        🔒 {app.consentToken ? "DEPA 2.0 Granted" : "Consent Active"}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "700",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          ...statusStyle,
                        }}
                      >
                        {app.status || "Under Review"}
                      </span>
                    </div>
                  </div>

                  {/* TITLE & DESCRIPTION */}
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>
                    {app.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                    {app.description}
                  </p>

                  {/* DEPARTMENT ROUTING PIPELINE STEPPER */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                      Multi-Departmental Verification Pipeline:
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", fontSize: "11.5px" }}>
                      <div style={{ color: "#059669", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>✅</span> 1. Ingestion &amp; Canonical IndEA
                      </div>
                      <div style={{ color: "#059669", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>✅</span> 2. DigiLocker e-KYC Verified
                      </div>
                      <div style={{ color: app.status === "Under Review" ? "#d97706" : "#059669", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>{app.status === "Under Review" ? "⏳" : "✅"}</span> 3. Cross-Agency InterOp Sync
                      </div>
                      <div style={{ color: app.status === "Approved" || app.status === "Completed" ? "#059669" : "#94a3b8", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>{app.status === "Approved" || app.status === "Completed" ? "✅" : "⚪"}</span> 4. Final Disbursal
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM INFO & ACTION */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12.5px" }}>
                    <div style={{ color: "#64748b" }}>
                      📍 <strong>{app.district || "Maharashtra"}</strong> • Primary: <strong>{app.primaryDepartment || "MahaSwayam"}</strong>
                    </div>

                    <Link
                      to={`/problem/${appId}`}
                      style={{
                        color: "#2563eb",
                        fontWeight: "700",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      View Detailed Inter-Agency Audit Logs →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyProblems;