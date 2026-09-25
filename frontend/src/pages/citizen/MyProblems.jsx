import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MyProblems() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ONLY LOGGED-IN CITIZEN'S PROBLEMS
  |--------------------------------------------------------------------------
  */
  const loadMyProblems = async () => {
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

      const contentType =
        response.headers.get("content-type") || "";

      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");

        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your problems."
        );
      }

      setProblems(
        Array.isArray(data.problems)
          ? data.problems
          : []
      );
    } catch (err) {
      console.error(
        "LOAD MY PROBLEMS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load your problems."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProblems();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");

    navigate("/login", {
      replace: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */
  const getStatus = (problem) => {
    return (
      problem.status ||
      "Under Review"
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
      case "Resolved":
        return {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0",
        };

      case "In Progress":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        };

      case "Approved":
        return {
          background: "#e0f2fe",
          color: "#0369a1",
          border: "1px solid #bae6fd",
        };

      case "Rejected":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        };
    }
  };

  const getPriorityStyle = (level) => {
    switch (level) {
      case "Critical":
        return {
          background: "#fee2e2",
          color: "#b91c1c",
        };

      case "High":
        return {
          background: "#ffedd5",
          color: "#c2410c",
        };

      case "Medium":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      default:
        return {
          background: "#dcfce7",
          color: "#166534",
        };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>

        <div className="mp-layout">

          <aside className="mp-sidebar">

            <div className="mp-logo">
              <div className="mp-logo-box">
                SI
              </div>

              <div>
                <strong>
                  SI Citizen Portal
                </strong>

                <span>
                  Citizen
                </span>
              </div>
            </div>

            <nav className="mp-navigation">

              <Link to="/citizen">
                <span>🏠</span>
                Dashboard
              </Link>

              <Link to="/citizen/report">
                <span>📝</span>
                Report Problem
              </Link>

              <Link
                to="/citizen/problems"
                className="mp-active"
              >
                <span>📋</span>
                My Problems
              </Link>

              <Link to="/citizen/notifications">
                <span>🔔</span>
                Notifications
              </Link>

            </nav>

            <div className="mp-sidebar-bottom">

              <button
                type="button"
                onClick={logout}
              >
                <span>🚪</span>
                Logout
              </button>

            </div>

          </aside>

          <main className="mp-main">

            <div className="mp-loading">
              <div className="mp-spinner"></div>

              <h2>
                Loading your problems...
              </h2>

              <p>
                Please wait while we load your
                submitted problems.
              </p>
            </div>

          </main>

        </div>
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */
  return (
    <>
      <style>{pageStyles}</style>

      <div className="mp-layout">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="mp-sidebar">

          <div className="mp-logo">

            <div className="mp-logo-box">
              SI
            </div>

            <div>
              <strong>
                SI Citizen Portal
              </strong>

              <span>
                Citizen
              </span>
            </div>

          </div>


          <nav className="mp-navigation">

            <Link to="/citizen">

              <span>🏠</span>

              Dashboard

            </Link>


            <Link to="/citizen/report">

              <span>📝</span>

              Report Problem

            </Link>


            <Link
              to="/citizen/problems"
              className="mp-active"
            >

              <span>📋</span>

              My Problems

            </Link>


            <Link to="/citizen/notifications">

              <span>🔔</span>

              Notifications

            </Link>

          </nav>


          <div className="mp-sidebar-bottom">

            <button
              type="button"
              onClick={logout}
            >

              <span>🚪</span>

              Logout

            </button>

          </div>

        </aside>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="mp-main">

          {/* HEADER */}

          <header className="mp-header">

            <div>

              <div className="mp-breadcrumb">
                Citizen Portal
                <span>›</span>
                My Problems
              </div>

              <h1>
                My Problems
              </h1>

              <p>
                View and track the problems
                submitted from your account.
              </p>

            </div>


            <Link
              to="/citizen/report"
              className="mp-primary-button"
            >
              <span>＋</span>
              Report New Problem
            </Link>

          </header>


          {/* ERROR */}

          {error && (

            <div className="mp-error">

              <div className="mp-error-icon">
                !
              </div>

              <div>

                <strong>
                  Unable to load problems
                </strong>

                <p>
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={loadMyProblems}
              >
                Try Again
              </button>

            </div>

          )}


          {/* ==================================================
              SUMMARY
          ================================================== */}

          {!error && (

            <div className="mp-summary-grid">

              <div className="mp-summary-card">

                <div className="mp-summary-icon blue">
                  📋
                </div>

                <div>

                  <span>
                    Total Problems
                  </span>

                  <strong>
                    {problems.length}
                  </strong>

                </div>

              </div>


              <div className="mp-summary-card">

                <div className="mp-summary-icon yellow">
                  🔍
                </div>

                <div>

                  <span>
                    Under Review
                  </span>

                  <strong>
                    {
                      problems.filter(
                        (problem) =>
                          problem.status ===
                          "Under Review"
                      ).length
                    }
                  </strong>

                </div>

              </div>


              <div className="mp-summary-card">

                <div className="mp-summary-icon purple">
                  ⚙️
                </div>

                <div>

                  <span>
                    In Progress
                  </span>

                  <strong>
                    {
                      problems.filter(
                        (problem) =>
                          problem.status ===
                          "In Progress"
                      ).length
                    }
                  </strong>

                </div>

              </div>


              <div className="mp-summary-card">

                <div className="mp-summary-icon green">
                  ✅
                </div>

                <div>

                  <span>
                    Completed
                  </span>

                  <strong>
                    {
                      problems.filter(
                        (problem) =>
                          problem.status ===
                            "Completed" ||
                          problem.status ===
                            "Resolved"
                      ).length
                    }
                  </strong>

                </div>

              </div>

            </div>

          )}


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!error &&
            problems.length === 0 && (

              <div className="mp-empty">

                <div className="mp-empty-icon">
                  📋
                </div>

                <h2>
                  No Problems Submitted Yet
                </h2>

                <p>
                  You have not reported any
                  community problems yet.
                </p>

                <Link
                  to="/citizen/report"
                  className="mp-primary-button"
                >
                  <span>＋</span>
                  Report Your First Problem
                </Link>

              </div>

            )}


          {/* ==================================================
              PROBLEM LIST
          ================================================== */}

          {!error &&
            problems.length > 0 && (

              <section>

                <div className="mp-section-heading">

                  <div>

                    <h2>
                      Your Submitted Problems
                    </h2>

                    <p>
                      All problems shown below
                      belong to your account.
                    </p>

                  </div>

                  <span className="mp-count">
                    {problems.length}{" "}
                    {problems.length === 1
                      ? "Problem"
                      : "Problems"}
                  </span>

                </div>


                <div className="mp-problems">

                  {problems.map(
                    (problem) => {

                      const problemId =
                        problem.problemId ||
                        problem.id;

                      const status =
                        getStatus(problem);

                      const statusStyle =
                        getStatusStyle(
                          status
                        );

                      const priorityStyle =
                        getPriorityStyle(
                          problem.priorityLevel
                        );

                      return (

                        <article
                          className="mp-problem-card"
                          key={problemId}
                        >

                          {/* CARD TOP */}

                          <div className="mp-card-top">

                            <div>

                              <div className="mp-problem-id">
                                PROBLEM ID
                              </div>

                              <div className="mp-id-value">
                                {problemId}
                              </div>

                            </div>


                            <div
                              className="mp-status"
                              style={{
                                background:
                                  statusStyle.background,
                                color:
                                  statusStyle.color,
                                border:
                                  statusStyle.border,
                              }}
                            >
                              {status}
                            </div>

                          </div>


                          {/* TITLE */}

                          <h3 className="mp-problem-title">
                            {problem.title ||
                              "Untitled Problem"}
                          </h3>


                          {/* DESCRIPTION */}

                          <p className="mp-description">
                            {problem.description ||
                              "No description available."}
                          </p>


                          {/* DETAILS */}

                          <div className="mp-details-grid">

                            <div className="mp-detail">

                              <span>
                                DOMAIN
                              </span>

                              <strong>
                                {problem.domain ||
                                  "Not specified"}
                              </strong>

                            </div>


                            <div className="mp-detail">

                              <span>
                                DISTRICT
                              </span>

                              <strong>
                                {problem.district ||
                                  "Not specified"}
                              </strong>

                            </div>


                            <div className="mp-detail">

                              <span>
                                SEVERITY
                              </span>

                              <strong>
                                {problem.severity ||
                                  "Not specified"}
                              </strong>

                            </div>


                            <div className="mp-detail">

                              <span>
                                AFFECTED PEOPLE
                              </span>

                              <strong>
                                {problem.affectedPeople ??
                                  "Not specified"}
                              </strong>

                            </div>


                            <div className="mp-detail">

                              <span>
                                SUBMITTED
                              </span>

                              <strong>
                                {problem.createdAt
                                  ? new Date(
                                      problem.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "—"}
                              </strong>

                            </div>


                            <div className="mp-detail">

                              <span>
                                ASSIGNED UNIVERSITY
                              </span>

                              <strong>
                                {problem.assignedUniversity ||
                                problem.assignedUniversityName
                                  ? problem.assignedUniversity ||
                                    problem.assignedUniversityName
                                  : problem.assignedUniversityId
                                  ? `University ID: ${problem.assignedUniversityId}`
                                  : "Not assigned"}
                              </strong>

                            </div>

                          </div>


                          {/* AI SECTION */}

                          {(problem.aiDomain ||
                            problem.aiSubDomain ||
                            problem.aiSector ||
                            problem.aiSeverity ||
                            problem.priorityLevel ||
                            problem.priorityScore) && (

                            <div className="mp-ai-box">

                              <div className="mp-ai-header">

                                <div>

                                  <span className="mp-ai-icon">
                                    🤖
                                  </span>

                                  <strong>
                                    AI Analysis
                                  </strong>

                                </div>

                                {problem.priorityLevel && (

                                  <span
                                    className="mp-priority"
                                    style={{
                                      background:
                                        priorityStyle.background,
                                      color:
                                        priorityStyle.color,
                                    }}
                                  >
                                    {problem.priorityLevel}
                                    {problem.priorityScore
                                      ? ` • ${problem.priorityScore}`
                                      : ""}
                                  </span>

                                )}

                              </div>


                              <div className="mp-ai-details">

                                {problem.aiDomain && (

                                  <div>

                                    <span>
                                      AI Domain
                                    </span>

                                    <strong>
                                      {problem.aiDomain}
                                    </strong>

                                  </div>

                                )}


                                {problem.aiSubDomain && (

                                  <div>

                                    <span>
                                      AI Sub-Domain
                                    </span>

                                    <strong>
                                      {problem.aiSubDomain}
                                    </strong>

                                  </div>

                                )}


                                {problem.aiSector && (

                                  <div>

                                    <span>
                                      AI Sector
                                    </span>

                                    <strong>
                                      {problem.aiSector}
                                    </strong>

                                  </div>

                                )}


                                {problem.aiSeverity && (

                                  <div>

                                    <span>
                                      AI Severity
                                    </span>

                                    <strong>
                                      {problem.aiSeverity}
                                    </strong>

                                  </div>

                                )}

                              </div>

                            </div>

                          )}


                          {/* MEDIA */}

                          {(problem.photo ||
                            problem.video ||
                            problem.photoUrl ||
                            problem.videoUrl) && (

                            <div className="mp-media">

                              <div className="mp-media-title">
                                📎 Submitted Evidence
                              </div>

                              <div className="mp-media-grid">

                                {(problem.photo ||
                                  problem.photoUrl) && (

                                  <a
                                    href={
                                      problem.photoUrl ||
                                      `http://localhost:5000/uploads/${problem.photo}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mp-media-link"
                                  >
                                    🖼️ View Photo
                                  </a>

                                )}


                                {(problem.video ||
                                  problem.videoUrl) && (

                                  <a
                                    href={
                                      problem.videoUrl ||
                                      `http://localhost:5000/uploads/${problem.video}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mp-media-link"
                                  >
                                    🎥 View Video
                                  </a>

                                )}

                              </div>

                            </div>

                          )}


                          {/* FOOTER */}

                          <div className="mp-card-footer">

                            <Link
                              to={`/problem/${problemId}`}
                              style={{
                                color: "#2563eb",
                                fontWeight: 600,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              🔍 View AI Analysis & Matches →
                            </Link>

                            <span>
                              {problem.projectStatus ||
                                status}
                            </span>

                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              </section>

            )}

        </main>

      </div>
    </>
  );
}


/*
|--------------------------------------------------------------------------
| PAGE-SPECIFIC STYLES
|--------------------------------------------------------------------------
*/

const pageStyles = `
  * {
    box-sizing: border-box;
  }

  .mp-layout {
    min-height: 100vh;
    display: flex;
    background: #f1f5f9;
    color: #0f172a;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .mp-sidebar {
    width: 255px;
    min-width: 255px;
    min-height: 100vh;
    background: #111827;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 20;
  }

  .mp-logo {
    height: 82px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #273244;
  }

  .mp-logo-box {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    color: white;
  }

  .mp-logo strong {
    display: block;
    font-size: 14px;
    line-height: 1.2;
  }

  .mp-logo span {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    margin-top: 3px;
  }

  .mp-navigation {
    padding: 22px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mp-navigation a {
    text-decoration: none;
    color: #cbd5e1;
    padding: 12px 14px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    transition: 0.2s ease;
  }

  .mp-navigation a:hover {
    background: #1e293b;
    color: white;
  }

  .mp-navigation a.mp-active {
    background: #2563eb;
    color: white;
    box-shadow:
      0 4px 12px
      rgba(37, 99, 235, 0.25);
  }

  .mp-navigation a span {
    width: 20px;
    text-align: center;
    font-size: 17px;
  }

  .mp-sidebar-bottom {
    margin-top: auto;
    padding: 18px 12px;
    border-top: 1px solid #273244;
  }

  .mp-sidebar-bottom button {
    width: 100%;
    border: none;
    background: transparent;
    color: #cbd5e1;
    padding: 12px 14px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
  }

  .mp-sidebar-bottom button:hover {
    background: #1e293b;
    color: white;
  }

  .mp-main {
    margin-left: 255px;
    width: calc(100% - 255px);
    min-height: 100vh;
    padding: 34px 42px 60px;
  }

  .mp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 28px;
  }

  .mp-breadcrumb {
    color: #64748b;
    font-size: 13px;
    margin-bottom: 9px;
  }

  .mp-breadcrumb span {
    padding: 0 8px;
    color: #94a3b8;
  }

  .mp-header h1 {
    margin: 0;
    font-size: 32px;
    line-height: 1.15;
    color: #0f172a;
    font-weight: 750;
  }

  .mp-header p {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 15px;
  }

  .mp-primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-decoration: none;
    border: none;
    background: #2563eb;
    color: white;
    padding: 12px 18px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 650;
    cursor: pointer;
    white-space: nowrap;
    box-shadow:
      0 3px 8px
      rgba(37, 99, 235, 0.2);
  }

  .mp-primary-button:hover {
    background: #1d4ed8;
  }

  .mp-summary-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .mp-summary-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow:
      0 1px 3px
      rgba(15, 23, 42, 0.04);
  }

  .mp-summary-icon {
    width: 46px;
    height: 46px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
  }

  .mp-summary-icon.blue {
    background: #dbeafe;
  }

  .mp-summary-icon.yellow {
    background: #fef3c7;
  }

  .mp-summary-icon.purple {
    background: #ede9fe;
  }

  .mp-summary-icon.green {
    background: #dcfce7;
  }

  .mp-summary-card span {
    display: block;
    color: #64748b;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .mp-summary-card strong {
    display: block;
    font-size: 24px;
    color: #0f172a;
  }

  .mp-section-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  .mp-section-heading h2 {
    margin: 0;
    font-size: 20px;
    color: #0f172a;
  }

  .mp-section-heading p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 13px;
  }

  .mp-count {
    background: #e2e8f0;
    color: #475569;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 650;
  }

  .mp-problems {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .mp-problem-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 24px;
    box-shadow:
      0 2px 7px
      rgba(15, 23, 42, 0.05);
  }

  .mp-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .mp-problem-id {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.08em;
  }

  .mp-id-value {
    margin-top: 3px;
    color: #475569;
    font-size: 13px;
    font-weight: 650;
  }

  .mp-status {
    padding: 7px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .mp-problem-title {
    margin: 18px 0 7px;
    font-size: 22px;
    color: #0f172a;
    line-height: 1.25;
  }

  .mp-description {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.65;
  }

  .mp-details-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 1px;
    margin-top: 22px;
    background: #e2e8f0;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .mp-detail {
    background: #f8fafc;
    padding: 14px;
    min-width: 0;
  }

  .mp-detail span {
    display: block;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.05em;
    margin-bottom: 5px;
  }

  .mp-detail strong {
    display: block;
    color: #334155;
    font-size: 13px;
    overflow-wrap: anywhere;
  }

  .mp-ai-box {
    margin-top: 18px;
    padding: 16px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .mp-ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .mp-ai-header > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mp-ai-icon {
    font-size: 18px;
  }

  .mp-ai-header strong {
    color: #334155;
    font-size: 13px;
  }

  .mp-priority {
    padding: 5px 9px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 750;
  }

  .mp-ai-details {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .mp-ai-details span {
    display: block;
    color: #94a3b8;
    font-size: 10px;
    margin-bottom: 4px;
  }

  .mp-ai-details strong {
    display: block;
    color: #475569;
    font-size: 12px;
  }

  .mp-media {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid #e2e8f0;
  }

  .mp-media-title {
    color: #475569;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .mp-media-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .mp-media-link {
    text-decoration: none;
    padding: 9px 12px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 650;
  }

  .mp-media-link:hover {
    background: #dbeafe;
  }

  .mp-card-footer {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    gap: 15px;
    color: #94a3b8;
    font-size: 11px;
  }

  .mp-empty {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 70px 30px;
    text-align: center;
    box-shadow:
      0 2px 7px
      rgba(15, 23, 42, 0.04);
  }

  .mp-empty-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 18px;
    border-radius: 50%;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
  }

  .mp-empty h2 {
    margin: 0;
    font-size: 20px;
  }

  .mp-empty p {
    color: #64748b;
    margin: 8px 0 22px;
  }

  .mp-error {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding: 15px 18px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 10px;
  }

  .mp-error-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f97316;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .mp-error strong {
    color: #9a3412;
    font-size: 13px;
  }

  .mp-error p {
    margin: 3px 0 0;
    color: #c2410c;
    font-size: 12px;
  }

  .mp-error button {
    margin-left: auto;
    border: 1px solid #fdba74;
    background: white;
    color: #c2410c;
    border-radius: 7px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 650;
  }

  .mp-loading {
    min-height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
  }

  .mp-spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #dbeafe;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: mp-spin 0.8s linear infinite;
  }

  .mp-loading h2 {
    margin: 18px 0 5px;
    font-size: 20px;
  }

  .mp-loading p {
    color: #64748b;
    margin: 0;
  }

  @keyframes mp-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1000px) {
    .mp-summary-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .mp-details-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .mp-ai-details {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .mp-sidebar {
      width: 215px;
      min-width: 215px;
    }

    .mp-main {
      margin-left: 215px;
      width: calc(100% - 215px);
      padding: 24px 18px 40px;
    }

    .mp-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .mp-summary-grid {
      grid-template-columns: 1fr;
    }

    .mp-details-grid {
      grid-template-columns: 1fr;
    }

    .mp-ai-details {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .mp-sidebar {
      position: relative;
      width: 100%;
      min-width: 100%;
      min-height: auto;
    }

    .mp-layout {
      flex-direction: column;
    }

    .mp-main {
      margin-left: 0;
      width: 100%;
    }

    .mp-navigation {
      flex-direction: row;
      overflow-x: auto;
    }

    .mp-navigation a {
      white-space: nowrap;
    }

    .mp-sidebar-bottom {
      display: none;
    }

    .mp-card-top {
      flex-direction: column;
    }

    .mp-card-footer {
      flex-direction: column;
    }
  }
`;

export default MyProblems;