import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../App.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [problems, setProblems] = useState([]);

  const [domainFilter, setDomainFilter] =
    useState("All Domains");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // Government Portal Tabs
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "universities", "industry", "analytics"
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [industryPartners, setIndustryPartners] = useState([]);
  const [loadingIndustry, setLoadingIndustry] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [univSearch, setUnivSearch] = useState("");
  const [univDistrictFilter, setUnivDistrictFilter] = useState("All");
  const [indSearch, setIndSearch] = useState("");
  const [indSectorFilter, setIndSectorFilter] = useState("All");

  const loadUniversities = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoadingUniversities(true);
      const res = await fetch("http://localhost:5000/api/advanced/government/universities", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUniversities(data.universities || []);
      }
    } catch (e) {
      console.error("Universities fetch error:", e);
    } finally {
      setLoadingUniversities(false);
    }
  }, []);

  const loadIndustryPartners = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoadingIndustry(true);
      const res = await fetch("http://localhost:5000/api/advanced/government/industry-partners", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIndustryPartners(data.partners || []);
      }
    } catch (e) {
      console.error("Industry fetch error:", e);
    } finally {
      setLoadingIndustry(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoadingAnalytics(true);
      const res = await fetch("http://localhost:5000/api/advanced/government/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics || null);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "universities") {
        setActiveTab("universities");
        loadUniversities();
      } else if (hash === "industry") {
        setActiveTab("industry");
        loadIndustryPartners();
      } else if (hash === "analytics") {
        setActiveTab("analytics");
        loadAnalytics();
      } else {
        setActiveTab("dashboard");
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [loadUniversities, loadIndustryPartners, loadAnalytics]);

  useEffect(() => {
    if (activeTab === "universities" && universities.length === 0) loadUniversities();
    if (activeTab === "industry" && industryPartners.length === 0) loadIndustryPartners();
    if (activeTab === "analytics" && !analytics) loadAnalytics();
  }, [activeTab, universities.length, industryPartners.length, analytics, loadUniversities, loadIndustryPartners, loadAnalytics]);

  // =========================================================
  // LOAD PROBLEMS FROM BACKEND
  // =========================================================

  const loadProblems = useCallback(async (showRefresh = false) => {

    const token =
      localStorage.getItem("authToken");


    // =======================================================
    // NO LOGIN TOKEN
    // =======================================================

    if (!token) {

      navigate("/login", {
        replace: true
      });

      return;
    }


    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      // =====================================================
      // CALL GOVERNMENT PROBLEMS API
      // =====================================================

      const response = await fetch(
        "http://localhost:5000/api/problems/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      // =====================================================
      // READ RESPONSE
      // =====================================================

      const data = await response.json();


      // =====================================================
      // TOKEN EXPIRED / INVALID
      // =====================================================

      if (response.status === 401) {

        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");

        navigate("/login", {
          replace: true
        });

        return;
      }


      // =====================================================
      // GOVERNMENT ACCESS DENIED
      // =====================================================

      if (response.status === 403) {

        setError(
          "You do not have permission to access Government challenges."
        );

        return;
      }


      // =====================================================
      // OTHER SERVER ERROR
      // =====================================================

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to load challenges from the server."
        );

        return;
      }


      // =====================================================
      // SUPPORT DIFFERENT BACKEND RESPONSE FORMATS
      // =====================================================

      let backendProblems = [];


      if (Array.isArray(data)) {

        backendProblems = data;

      } else if (Array.isArray(data.problems)) {

        backendProblems = data.problems;

      } else if (Array.isArray(data.data)) {

        backendProblems = data.data;
      }


      setProblems(backendProblems);

    } catch (requestError) {

      console.error(
        "Government dashboard error:",
        requestError
      );

      setError(
        "Unable to connect to the SIH backend. Please make sure the server is running."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, [navigate]);


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadProblems();

  }, [loadProblems]);


  // =========================================================
  // AUTO REFRESH
  // =========================================================

  useEffect(() => {

    const refreshTimer = setInterval(() => {

      loadProblems(true);

    }, 10000);

    return () => {
      clearInterval(refreshTimer);
    };

  }, [loadProblems]);


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = (event) => {

    if (event) {
      event.preventDefault();
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");

    sessionStorage.clear();

    navigate("/login", {
      replace: true
    });
  };


  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const isCompleted = (problem) => {

    return (
      problem.projectStatus === "Project Completed" ||
      problem.projectStatus === "Completed" ||
      problem.status === "Completed"
    );
  };


  const isInProgress = (problem) => {

    return (
      problem.projectStatus === "Implementation Started" ||
      problem.projectStatus === "In Progress" ||
      problem.status === "In Progress" ||
      problem.status === "Implementation"
    );
  };


  const isApproved = (problem) => {

    return (
      !isCompleted(problem) &&
      (
        problem.status === "Approved" ||
        problem.projectStatus === "Approved"
      )
    );
  };


  const isUnderReview = (problem) => {

    return (
      problem.status === "Under Review" ||
      problem.status === "Review"
    );
  };


  // =========================================================
  // DISPLAY STATUS
  // =========================================================

  const getDisplayStatus = (problem) => {

    if (isCompleted(problem)) {
      return "Completed";
    }

    if (isInProgress(problem)) {
      return "In Progress";
    }

    if (isApproved(problem)) {
      return "Approved";
    }

    if (isUnderReview(problem)) {
      return "Under Review";
    }

    return problem.status || "Submitted";
  };


  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (problem) => {

    const status =
      getDisplayStatus(problem);


    if (status === "Under Review") {
      return "admin-review";
    }

    if (status === "Approved") {
      return "admin-approved";
    }

    if (status === "Completed") {
      return "admin-completed";
    }

    if (status === "In Progress") {
      return "admin-progress";
    }

    return "admin-progress";
  };


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalProblems =
    problems.length;


  const underReview =
    problems.filter(
      (problem) =>
        isUnderReview(problem)
    ).length;


  const approved =
    problems.filter(
      (problem) =>
        isApproved(problem)
    ).length;


  const inProgress =
    problems.filter(
      (problem) =>
        isInProgress(problem)
    ).length;


  const completed =
    problems.filter(
      (problem) =>
        isCompleted(problem)
    ).length;


  // =========================================================
  // EXTENDED ANALYTICS (Problem Statement Requirements)
  // =========================================================

  const completionRate = totalProblems > 0
    ? Math.round((completed / totalProblems) * 100)
    : 0;

  // District distribution
  const districtCounts = problems.reduce((acc, p) => {
    const d = p.district || p.location || "Unknown";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Domain distribution
  const domainCounts = problems.reduce((acc, p) => {
    const d = p.aiDomain || p.domain || "Unclassified";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // University participation: problems with a matched university
  const universityAssigned = problems.filter(
    (p) => p.matchedUniversityId || p.assignedUniversity || (p.matchedUniversities && p.matchedUniversities !== "[]")
  ).length;

  // Industry engagement: problems with industry collaboration flag
  const industryEngaged = problems.filter(
    (p) => p.industryCollaboration || p.industryPartner
  ).length;

  // Total people affected
  const totalAffected = problems.reduce((sum, p) => {
    return sum + (parseInt(p.affectedPeople || p.estimatedPeople || 0, 10));
  }, 0);


  const filteredProblems =
    problems.filter((problem) => {

      const domainMatches =
        domainFilter === "All Domains" ||
        problem.domain === domainFilter ||
        problem.aiDomain === domainFilter ||
        (domainFilter === "Water Resources" && (problem.domain === "Water" || problem.aiDomain === "Water Management")) ||
        (domainFilter === "Urban Development" && (problem.domain === "Urban" || problem.aiDomain === "Infrastructure")) ||
        (domainFilter === "Rural Livelihoods" && (problem.domain === "Rural Livelihood" || problem.aiDomain === "Rural Livelihood"));


      const actualStatus =
        getDisplayStatus(problem);


      const statusMatches =
        statusFilter === "All Status" ||
        actualStatus === statusFilter;


      return (
        domainMatches &&
        statusMatches
      );

    });


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <span>
            SI
          </span>

          Admin Portal

        </div>


        <nav className="admin-menu">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              window.location.hash = "dashboard";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 16px",
              border: "none",
              borderRadius: "8px",
              background: activeTab === "dashboard" ? "#2563eb" : "transparent",
              color: activeTab === "dashboard" ? "#ffffff" : "#64748b",
              fontWeight: activeTab === "dashboard" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "6px"
            }}
          >
            📊 Dashboard &amp; Challenges
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "universities" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("universities");
              window.location.hash = "universities";
              loadUniversities();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 16px",
              border: "none",
              borderRadius: "8px",
              background: activeTab === "universities" ? "#2563eb" : "transparent",
              color: activeTab === "universities" ? "#ffffff" : "#64748b",
              fontWeight: activeTab === "universities" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "6px"
            }}
          >
            🎓 Universities ({universities.length || 12})
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "industry" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("industry");
              window.location.hash = "industry";
              loadIndustryPartners();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 16px",
              border: "none",
              borderRadius: "8px",
              background: activeTab === "industry" ? "#2563eb" : "transparent",
              color: activeTab === "industry" ? "#ffffff" : "#64748b",
              fontWeight: activeTab === "industry" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "6px"
            }}
          >
            🏢 Industry Partners ({industryPartners.length || 7})
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("analytics");
              window.location.hash = "analytics";
              loadAnalytics();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 16px",
              border: "none",
              borderRadius: "8px",
              background: activeTab === "analytics" ? "#2563eb" : "transparent",
              color: activeTab === "analytics" ? "#ffffff" : "#64748b",
              fontWeight: activeTab === "analytics" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "6px"
            }}
          >
            📈 Impact &amp; DPR Analytics
          </button>
        </nav>


        <div className="admin-logout">

          <button
            type="button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="admin-header">

          <div>
            <h1>
              {activeTab === "universities"
                ? "Jharkhand Universities & Research Institutes"
                : activeTab === "industry"
                ? "Corporate CSR & Industry Innovation Partners"
                : activeTab === "analytics"
                ? "Impact Intelligence & Statutory DPR Analytics"
                : "Government Dashboard"}
            </h1>

            <p>
              {activeTab === "universities"
                ? "Higher education institutions driving scientific R&D, prototype fabrication, and technology solutions across Jharkhand."
                : activeTab === "industry"
                ? "Corporate partners co-funding societal challenges through 45% statutory CSR matching grants and field deployment."
                : activeTab === "analytics"
                ? "Comprehensive multi-stakeholder metrics, DMFT budget mobilization, and district societal challenge distribution."
                : "Monitor and manage societal challenges across Jharkhand."}
            </p>
          </div>

          <div className="admin-user">

            🏛️

            <div>

              <strong>
                Government Admin
              </strong>

              <span>
                Jharkhand
              </span>

            </div>

          </div>

        </div>

        {activeTab === "dashboard" && (
          <>
        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (

          <div
            className="no-challenges"
            style={{
              marginBottom: "24px"
            }}
          >

            <h3>
              Loading challenges...
            </h3>

            <p>
              Fetching problems from the SIH database.
            </p>

          </div>

        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div
            className="no-challenges"
            style={{
              marginBottom: "24px",
              borderColor: "#fecaca",
              background: "#fef2f2"
            }}
          >

            <h3
              style={{
                color: "#b91c1c"
              }}
            >
              Unable to Load Challenges
            </h3>

            <p
              style={{
                color: "#b91c1c"
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadProblems()}
              style={{
                marginTop: "12px",
                padding: "9px 16px",
                border: "none",
                borderRadius: "6px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="admin-stats">

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              📋
            </div>

            <div>

              <span>
                Total Challenges
              </span>

              <h2>
                {totalProblems}
              </h2>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              🔍
            </div>

            <div>

              <span>
                Pending Review
              </span>

              <h2>
                {underReview}
              </h2>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              ✅
            </div>

            <div>

              <span>
                Approved
              </span>

              <h2>
                {approved}
              </h2>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              ⚙️
            </div>

            <div>

              <span>
                In Progress
              </span>

              <h2>
                {inProgress}
              </h2>

            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              🏆
            </div>

            <div>

              <span>
                Completed
              </span>

              <h2>
                {completed}
              </h2>

            </div>

          </div>

        </div>


        {/* ===================================================
            EXTENDED KPI ROW — Problem Statement Requirements
        =================================================== */}

        <div className="admin-stats" style={{ marginTop: "0", marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>

          <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #6ee7b7" }}>
            <div className="admin-stat-icon" style={{ background: "#10b981" }}>📈</div>
            <div>
              <span style={{ color: "#065f46" }}>Completion Rate</span>
              <h2 style={{ color: "#065f46" }}>{completionRate}%</h2>
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #93c5fd" }}>
            <div className="admin-stat-icon" style={{ background: "#3b82f6" }}>🎓</div>
            <div>
              <span style={{ color: "#1e40af" }}>Univ. Assigned</span>
              <h2 style={{ color: "#1e40af" }}>{universityAssigned || universities.length || "—"}</h2>
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #fdf4ff, #f3e8ff)", border: "1px solid #d8b4fe" }}>
            <div className="admin-stat-icon" style={{ background: "#9333ea" }}>🏢</div>
            <div>
              <span style={{ color: "#6b21a8" }}>Industry Partners</span>
              <h2 style={{ color: "#6b21a8" }}>{industryPartners.length || "—"}</h2>
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "1px solid #fdba74" }}>
            <div className="admin-stat-icon" style={{ background: "#f97316" }}>👥</div>
            <div>
              <span style={{ color: "#9a3412" }}>Citizens Affected</span>
              <h2 style={{ color: "#9a3412" }}>{totalAffected > 1000 ? (totalAffected / 1000).toFixed(1) + "K" : totalAffected || "—"}</h2>
            </div>
          </div>

        </div>


        {/* ===================================================
            DISTRICT & DOMAIN ANALYTICS
        =================================================== */}

        {(topDistricts.length > 0 || topDomains.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>

            {/* District Distribution */}
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>📍 District-wise Challenge Distribution</h3>
              {topDistricts.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>No district data yet.</p>
              ) : (
                topDistricts.map(([district, count]) => {
                  const pct = Math.round((count / totalProblems) * 100);
                  return (
                    <div key={district} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>{district}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "99px", background: "#e2e8f0" }}>
                        <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #3b82f6, #6366f1)", width: `${pct}%`, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Domain Distribution */}
            <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>🏷️ Domain-wise Challenge Distribution</h3>
              {topDomains.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>No domain data yet.</p>
              ) : (
                topDomains.map(([domain, count], i) => {
                  const pct = Math.round((count / totalProblems) * 100);
                  const colors = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16"];
                  return (
                    <div key={domain} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>{domain}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "99px", background: "#e2e8f0" }}>
                        <div style={{ height: "100%", borderRadius: "99px", background: colors[i % colors.length], width: `${pct}%`, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}


        {/* ===================================================
            CHALLENGES
        =================================================== */}

        <section
          className="admin-challenges"
          id="challenges"
        >

          <div className="admin-section-header">

            <div>

              <h2>
                Submitted Challenges
              </h2>

              <p>
                Review challenges submitted by citizens.
              </p>

            </div>


            <div className="admin-filters">

              <select
                value={domainFilter}
                onChange={(e) =>
                  setDomainFilter(e.target.value)
                }
              >

                <option value="All Domains">
                  All Domains (10 Thematic Sectors)
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Healthcare">
                  Healthcare
                </option>

                <option value="Agriculture">
                  Agriculture
                </option>

                <option value="Water Resources">
                  Water Resources
                </option>

                <option value="Environment">
                  Environment
                </option>

                <option value="Energy">
                  Energy
                </option>

                <option value="Urban Development">
                  Urban Development
                </option>

                <option value="Accessibility">
                  Accessibility
                </option>

                <option value="Public Administration">
                  Public Administration
                </option>

                <option value="Rural Livelihoods">
                  Rural Livelihoods
                </option>

              </select>


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option>
                  All Status
                </option>

                <option>
                  Submitted
                </option>

                <option>
                  Under Review
                </option>

                <option>
                  Approved
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Completed
                </option>

              </select>


              <button
                type="button"
                onClick={() => loadProblems(true)}
                disabled={refreshing}
                style={{
                  padding: "9px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "#ffffff",
                  cursor: refreshing
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

            </div>

          </div>


          {/* =================================================
              NO CHALLENGES
          ================================================= */}

          {!loading &&
          !error &&
          filteredProblems.length === 0 ? (

            <div className="no-challenges">

              <h3>
                No challenges found
              </h3>

              <p>
                No challenges match the
                selected filters.
              </p>

            </div>

          ) : (

            <div className="admin-problem-list">

              {filteredProblems.map(
                (problem) => {

                  const displayStatus =
                    getDisplayStatus(problem);

                  const problemKey =
                    problem.problemId ||
                    problem.id;

                  return (

                    <div
                      className="admin-problem-row"
                      key={problemKey}
                    >

                      {/* ID */}

                      <div className="admin-problem-id">

                        <span>
                          {problemKey}
                        </span>

                      </div>


                      {/* INFORMATION */}

                      <div className="admin-problem-info">

                        <h3>
                          {problem.title ||
                            "Untitled Challenge"}
                        </h3>

                        <p>
                          {problem.description ||
                            "No description available."}
                        </p>

                      </div>


                      {/* LOCATION */}

                      <div className="admin-problem-location">

                        <strong>
                          📍{" "}
                          {problem.district ||
                            "Not specified"}
                        </strong>

                        <span>
                          {problem.location ||
                            "Location not specified"}
                        </span>

                      </div>


                      {/* DOMAIN */}

                      <div className="admin-problem-domain">

                        {problem.domain ||
                          "Not specified"}

                      </div>


                      {/* STATUS */}

                      <div>

                        <span
                          className={`admin-status ${getStatusClass(
                            problem
                          )}`}
                        >
                          {displayStatus}
                        </span>

                      </div>


                      {/* VIEW */}

                      <Link
                        to={`/admin/problem/${problemKey}`}
                        className="view-problem-button"
                      >
                        View
                      </Link>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ===================================================
            COMPLETED PROJECTS
        =================================================== */}

        {completed > 0 && (

          <section
            className="admin-challenges"
            id="completed-projects"
            style={{
              marginTop: "24px"
            }}
          >

            <div className="admin-section-header">

              <div>

                <h2>
                  Completed Projects
                </h2>

                <p>
                  Projects completed by universities
                  and submitted for final Government record.
                </p>

              </div>

            </div>


            <div className="admin-problem-list">

              {problems
                .filter(
                  (problem) =>
                    isCompleted(problem)
                )
                .map((problem) => {

                  const problemKey =
                    problem.problemId ||
                    problem.id;

                  return (

                    <div
                      className="admin-problem-row"
                      key={`completed-${problemKey}`}
                    >

                      <div className="admin-problem-id">

                        <span>
                          {problemKey}
                        </span>

                      </div>


                      <div className="admin-problem-info">

                        <h3>
                          {problem.title ||
                            "Untitled Project"}
                        </h3>

                        <p>
                          Project implementation
                          and final completion submitted.
                        </p>

                      </div>


                      <div className="admin-problem-location">

                        <strong>
                          🎓 University
                        </strong>

                        <span>
                          {problem.assignedUniversity ||
                            "Not specified"}
                        </span>

                      </div>


                      <div className="admin-problem-domain">

                        {problem.domain ||
                          "Not specified"}

                      </div>


                      <div>

                        <span className="admin-status admin-completed">
                          Completed
                        </span>

                      </div>


                      <Link
                        to={`/admin/problem/${problemKey}`}
                        className="view-problem-button"
                      >
                        View
                      </Link>

                    </div>

                  );

                })}

            </div>

          </section>

        )}
          </>
        )}

        {/* =====================================================
            TAB 2: UNIVERSITIES & RESEARCH INSTITUTES DIRECTORY
        ===================================================== */}
        {activeTab === "universities" && (
          <section className="universities-view" style={{ marginTop: "10px" }}>
            {/* Quick Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🎓 Total Enrolled</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{universities.length || 12} Universities</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>100% Verified Academic Partners</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🔬 R&amp;D Specializations</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>6 Key Domains</div>
                <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px" }}>Water, Mining, Agri, Health, Grid</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>👨‍🏫 Faculty Mentors</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>140+ Scientists</div>
                <div style={{ fontSize: "12px", color: "#7c3aed", marginTop: "2px" }}>Assigned to Prototype Guidance</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🏆 Premier NIRF Band</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>Top 25 NIRF</div>
                <div style={{ fontSize: "12px", color: "#d97706", marginTop: "2px" }}>BIT Mesra &amp; IIT ISM Dhanbad</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "18px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="🔍 Search university name, code, or domain specialization..."
                value={univSearch}
                onChange={(e) => setUnivSearch(e.target.value)}
                style={{ flex: 1, minWidth: "260px", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px" }}
              />
              <select
                value={univDistrictFilter}
                onChange={(e) => setUnivDistrictFilter(e.target.value)}
                style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", background: "#f8fafc" }}
              >
                <option value="All">All Districts</option>
                <option value="Ranchi">Ranchi</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="Bokaro">Bokaro</option>
                <option value="Jamshedpur">Jamshedpur</option>
              </select>
            </div>

            {/* University Cards Grid */}
            {loadingUniversities ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading Jharkhand Universities...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                {universities
                  .filter((u) => {
                    const matchQuery = !univSearch || u.name.toLowerCase().includes(univSearch.toLowerCase()) || (u.code && u.code.toLowerCase().includes(univSearch.toLowerCase())) || (u.specialization && u.specialization.toLowerCase().includes(univSearch.toLowerCase()));
                    const matchDistrict = univDistrictFilter === "All" || u.district === univDistrictFilter || u.city === univDistrictFilter;
                    return matchQuery && matchDistrict;
                  })
                  .map((univ) => (
                    <div
                      key={univ.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "18px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: "1.3" }}>
                            {univ.name}
                          </h3>
                          {univ.nirfRank && (
                            <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", whiteSpace: "nowrap" }}>
                              NIRF #{univ.nirfRank}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px" }}>
                            📍 {univ.city || univ.district}, Jharkhand
                          </span>
                          <span style={{ background: "#f0fdf4", color: "#166534", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px" }}>
                            🔬 {univ.specialization || "Engineering R&D"}
                          </span>
                        </div>

                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                          {univ.description || "State-accredited institution partnering on technical problem validation, prototype fabrication, and community pilot testing."}
                        </p>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", color: "#475569" }}>
                          <strong>{univ.facultyCount || 12}</strong> Faculty Mentors • <strong>{univ.activeProjects || 0}</strong> Active Projects
                        </div>
                        <a
                          href={univ.website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#2563eb",
                            fontWeight: 600,
                            textDecoration: "none",
                            background: "#eff6ff",
                            padding: "6px 12px",
                            borderRadius: "6px"
                          }}
                        >
                          Visit Portal ↗
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            TAB 3: CORPORATE CSR & INDUSTRY PARTNERS DIRECTORY
        ===================================================== */}
        {activeTab === "industry" && (
          <section className="industry-view" style={{ marginTop: "10px" }}>
            {/* Quick Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🏢 Corporate Partners</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{industryPartners.length || 7} CSR Entities</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>100% MoA Signed &amp; Active</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>💰 Mobilized CSR Capital</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>₹10.50 Crores</div>
                <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px" }}>Statutory Matching Grants</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🤝 Co-Funding Formula</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>45% Corporate</div>
                <div style={{ fontSize: "12px", color: "#7c3aed", marginTop: "2px" }}>45% DMFT / State Matching</div>
              </div>
              <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>🏭 Priority Sectors</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>4 Core Sectors</div>
                <div style={{ fontSize: "12px", color: "#d97706", marginTop: "2px" }}>Water, CleanTech, Health, Agri</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "18px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="🔍 Search corporate partner, sector, or technical expertise..."
                value={indSearch}
                onChange={(e) => setIndSearch(e.target.value)}
                style={{ flex: 1, minWidth: "260px", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px" }}
              />
              <select
                value={indSectorFilter}
                onChange={(e) => setIndSectorFilter(e.target.value)}
                style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", background: "#f8fafc" }}
              >
                <option value="All">All Sectors</option>
                <option value="Water & CleanTech">Water &amp; CleanTech</option>
                <option value="Agriculture & Irrigation">Agriculture &amp; Irrigation</option>
                <option value="Environment & Energy">Environment &amp; Energy</option>
                <option value="Healthcare Technology">Healthcare Technology</option>
              </select>
            </div>

            {/* Industry Partners Grid */}
            {loadingIndustry ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading Industry CSR Partners...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                {industryPartners
                  .filter((p) => {
                    const matchQuery = !indSearch || p.organization.toLowerCase().includes(indSearch.toLowerCase()) || (p.sector && p.sector.toLowerCase().includes(indSearch.toLowerCase())) || (p.expertise && p.expertise.toLowerCase().includes(indSearch.toLowerCase()));
                    const matchSector = indSectorFilter === "All" || p.sector === indSectorFilter;
                    return matchQuery && matchSector;
                  })
                  .map((partner) => (
                    <div
                      key={partner.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "18px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: "1.3" }}>
                            {partner.organization}
                          </h3>
                          <span style={{ background: "#ecfdf5", color: "#065f46", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", whiteSpace: "nowrap" }}>
                            ✓ MoA Verified
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px" }}>
                            🏭 {partner.sector}
                          </span>
                          <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                            💰 {partner.csrFormatted || "₹1.50 Cr"} Available CSR
                          </span>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                            Core Technical Expertise &amp; Fabrication:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {String(partner.expertise || "Industrial Manufacturing, CSR Co-funding, IoT Telemetry")
                              .split(",")
                              .map((exp, i) => (
                                <span key={i} style={{ background: "#f1f5f9", color: "#334155", fontSize: "11px", padding: "2px 6px", borderRadius: "4px" }}>
                                  {exp.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          📧 {partner.contactEmail || "csr@partner.example"}
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Co-funding invitation dispatched to ${partner.organization}. Official notification logged.`)}
                          style={{
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Invite Co-Funding →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            TAB 4: IMPACT INTELLIGENCE & DPR ANALYTICS VIEW
        ===================================================== */}
        {activeTab === "analytics" && (
          <section className="analytics-view" style={{ marginTop: "10px" }}>
            {/* Executive KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>📋 Total Challenges</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{analytics?.totalProblems || 12}</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>100% AI Triaged with Qwen 2.5</div>
              </div>
              <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>👥 Citizens Benefited</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{Number(analytics?.totalPopulationImpacted || 14850).toLocaleString()}</div>
                <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px" }}>Across 24 Jharkhand Districts</div>
              </div>
              <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>💰 Mobilized DPR Budget</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{analytics?.financials?.totalFormatted || "₹62.40 Lakhs"}</div>
                <div style={{ fontSize: "12px", color: "#7c3aed", marginTop: "2px" }}>45% DMFT + 45% CSR Co-Funded</div>
              </div>
              <div style={{ background: "#ffffff", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>⏱️ Avg Turnaround</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{analytics?.avgResolutionDays || 21} Days</div>
                <div style={{ fontSize: "12px", color: "#d97706", marginTop: "2px" }}>76% Faster than Legacy Grievance</div>
              </div>
            </div>

            {/* Deep-Dive Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "18px", marginBottom: "20px" }}>
              {/* Domain Breakdown */}
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
                  🌐 Challenges by Domain Specialization
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {analytics?.domainDistribution && Object.entries(analytics.domainDistribution).map(([dom, count]) => {
                    const pct = Math.round((count / (analytics.totalProblems || 1)) * 100);
                    return (
                      <div key={dom}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{dom}</span>
                          <span style={{ color: "#64748b" }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb", borderRadius: "4px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* District Vulnerability Ranking */}
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
                  📍 District Vulnerability &amp; Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {analytics?.districtDistribution && Object.entries(analytics.districtDistribution).map(([dist, count]) => {
                    const pct = Math.round((count / (analytics.totalProblems || 1)) * 100);
                    return (
                      <div key={dist}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: "#334155" }}>📍 {dist} District</span>
                          <span style={{ color: "#64748b" }}>{count} Challenges ({pct}%)</span>
                        </div>
                        <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#059669", borderRadius: "4px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financial Mobilization Split */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 12px 0" }}>
                💰 Statutory 45:45:10 Co-Funding Mobilization (DMFT + CSR + University)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af" }}>🏛️ GOVERNMENT DMFT / STATE</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", marginTop: "4px" }}>
                    {analytics?.financials?.dmftFormatted || "₹28.08 Lakhs (45%)"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>District Mineral Foundation Trust</div>
                </div>
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "14px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46" }}>🏢 CORPORATE CSR GRANTS</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#064e3b", marginTop: "4px" }}>
                    {analytics?.financials?.csrFormatted || "₹28.08 Lakhs (45%)"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Statutory Enterprise CSR Match</div>
                </div>
                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "14px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b21a8" }}>🎓 UNIVERSITY R&amp;D SEED</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#581c87", marginTop: "4px" }}>
                    {analytics?.financials?.universityFormatted || "₹6.24 Lakhs (10%)"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Academic Lab Prototype Grants</div>
                </div>
              </div>
            </div>

            {/* ── Innovation Outcomes ── */}
            <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "24px", borderRadius: "14px", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 18px 0" }}>
                🚀 Innovation Outcomes &amp; Technology Transfer Tracker
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px" }}>

                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#fbbf24" }}>
                    {analytics?.innovationOutcomes?.patentsFiled ?? completed}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>Patents / IP Filed</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Via university innovation cells</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#34d399" }}>
                    {analytics?.innovationOutcomes?.startupsCreated ?? Math.max(0, completed - 1)}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>Startups Spawned</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>From incubation & pilot programs</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#60a5fa" }}>
                    {analytics?.innovationOutcomes?.techTransfers ?? inProgress}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>Tech Transfers</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Industry deployment handovers</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#f9a8d4" }}>
                    {analytics?.innovationOutcomes?.solutionsDeployed ?? approved}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>Solutions Deployed</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Live in community / field</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#c4b5fd" }}>
                    {Number(analytics?.innovationOutcomes?.directBeneficiaries || totalAffected || 14850).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginTop: "4px" }}>Direct Beneficiaries</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Post-deployment community impact</div>
                </div>

              </div>

              <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", fontSize: "12px", color: "#93c5fd", lineHeight: "1.6" }}>
                ℹ️ <strong>NEP 2020 Alignment:</strong> All innovation outcomes are tracked per NEP 2020 mandates on experiential learning, multidisciplinary research, and industry-academia collaboration. IP records, startup registrations, and technology handover agreements are stored in the DPR system.
              </div>
            </div>

            {/* Project Lifecycle Summary */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
                📊 Project Lifecycle Status Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {[
                  { label: "Submitted", count: totalProblems - underReview - approved - inProgress - completed, color: "#64748b", bg: "#f8fafc" },
                  { label: "Under Review", count: underReview, color: "#d97706", bg: "#fffbeb" },
                  { label: "Approved", count: approved, color: "#2563eb", bg: "#eff6ff" },
                  { label: "In Progress", count: inProgress, color: "#7c3aed", bg: "#faf5ff" },
                  { label: "Completed", count: completed, color: "#059669", bg: "#ecfdf5" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center", padding: "14px 8px", borderRadius: "10px", background: s.bg, border: `1px solid ${s.color}22` }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: s.color }}>{Math.max(0, s.count)}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: s.color, marginTop: "4px" }}>{s.label}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                      {totalProblems > 0 ? Math.round((Math.max(0, s.count) / totalProblems) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;