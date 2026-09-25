import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../App.css";

function CitizenDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ONLY THE LOGGED-IN CITIZEN'S PROBLEMS
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

      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION FAILURE
      |--------------------------------------------------------------------------
      */
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | OTHER SERVER ERRORS
      |--------------------------------------------------------------------------
      */
      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your problems."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | The backend has already filtered the records using:
      |
      |     citizenId = req.user.id
      |
      | Therefore this dashboard receives ONLY the logged-in
      | citizen's problems.
      |
      | We DO NOT read:
      |
      |     localStorage.getItem("citizenProblems")
      |
      |--------------------------------------------------------------------------
      */
      setProblems(
        Array.isArray(data.problems)
          ? data.problems
          : []
      );
    } catch (err) {
      console.error(
        "LOAD CITIZEN PROBLEMS ERROR:",
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
    loadProblems();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | STATUS COUNTS
  |--------------------------------------------------------------------------
  */
  const totalProblems = problems.length;

  const underReview = problems.filter(
    (problem) =>
      problem.status === "Under Review"
  ).length;

  const inProgress = problems.filter(
    (problem) =>
      problem.status === "In Progress"
  ).length;

  const resolved = problems.filter(
    (problem) =>
      problem.status === "Resolved" ||
      problem.status === "Completed"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | STATUS CLASS
  |--------------------------------------------------------------------------
  */
  const getStatusClass = (status) => {
    if (status === "Under Review") {
      return "review";
    }

    if (status === "In Progress") {
      return "progress";
    }

    if (
      status === "Completed" ||
      status === "Resolved"
    ) {
      return "resolved";
    }

    if (status === "Approved") {
      return "approved";
    }

    return "review";
  };

  /*
  |--------------------------------------------------------------------------
  | RECENT PROBLEMS
  |--------------------------------------------------------------------------
  */
  const recentProblems = [...problems]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 3);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="citizen-dashboard">

        {/* SIDEBAR */}

        <aside className="citizen-sidebar">

          <div className="dashboard-logo">
            <span>SI</span>
            Portal
          </div>

          <div className="sidebar-menu">

            <Link to="/citizen">
              🏠 Dashboard
            </Link>

            <Link to="/citizen/report">
              📝 Report a Problem
            </Link>

            <Link to="/citizen/problems">
              📋 My Problems
            </Link>

            <Link to="/citizen/notifications">
              🔔 Notifications
            </Link>

          </div>

          <div className="sidebar-bottom">

            <Link to="/login">
              🚪 Logout
            </Link>

          </div>

        </aside>


        {/* MAIN */}

        <main className="citizen-main">

          <div className="dashboard-topbar">

            <div>

              <h1>
                Citizen Dashboard
              </h1>

              <p>
                Loading your problems...
              </p>

            </div>

            <div className="user-profile">
              👤
              <span>
                Citizen
              </span>
            </div>

          </div>

        </main>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */
  return (
    <div className="citizen-dashboard">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="citizen-sidebar">

        <div className="dashboard-logo">

          <span>SI</span>
          Portal

        </div>


        <div className="sidebar-menu">

          <Link to="/citizen">
            🏠 Dashboard
          </Link>

          <Link to="/citizen/report">
            📝 Report a Problem
          </Link>

          <Link to="/citizen/problems">
            📋 My Problems
          </Link>

          <Link to="/citizen/notifications">
            🔔 Notifications
          </Link>

        </div>


        <div className="sidebar-bottom">

          <Link to="/login">
            🚪 Logout
          </Link>

        </div>

      </aside>


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="citizen-main">


        {/* TOP BAR */}

        <div className="dashboard-topbar">

          <div>

            <h1>
              Citizen Dashboard
            </h1>

            <p>
              Welcome back! Help us identify
              problems in your community.
            </p>

          </div>


          <div className="user-profile">

            👤

            <span>
              Citizen
            </span>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >

            ❌ {error}

          </div>

        )}


        {/* ================================
            STATISTICS
        ================================= */}

        <div className="stats-grid">


          {/* TOTAL */}

          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div>

              <h2>
                {totalProblems}
              </h2>

              <p>
                Problems Reported
              </p>

            </div>

          </div>


          {/* UNDER REVIEW */}

          <div className="stat-card">

            <div className="stat-icon">
              🔍
            </div>

            <div>

              <h2>
                {underReview}
              </h2>

              <p>
                Under Review
              </p>

            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="stat-card">

            <div className="stat-icon">
              ⚙️
            </div>

            <div>

              <h2>
                {inProgress}
              </h2>

              <p>
                In Progress
              </p>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div>

              <h2>
                {resolved}
              </h2>

              <p>
                Completed
              </p>

            </div>

          </div>

        </div>


        {/* ================================
            REPORT PROBLEM BANNER
        ================================= */}

        <div className="report-banner">

          <div>

            <h2>
              Have you identified a problem?
            </h2>

            <p>
              Report an issue affecting your
              community and help create a solution.
            </p>

          </div>


          <Link to="/citizen/report">

            <button className="report-button">

              + Report a Problem

            </button>

          </Link>

        </div>


        {/* ================================
            RECENT PROBLEMS
        ================================= */}

        <section className="recent-section">


          <div className="section-title">

            <div>

              <h2>
                My Recent Problems
              </h2>

              <p>
                Track the problems you have reported.
              </p>

            </div>


            <Link to="/citizen/problems">
              View All
            </Link>

          </div>


          <div className="problem-list">


            {recentProblems.length === 0 ? (

              <div className="no-problems">

                <h3>
                  No problems reported yet
                </h3>

                <p>
                  Report a problem in your
                  community to get started.
                </p>

              </div>

            ) : (

              recentProblems.map(
                (problem) => (

                  <Link
                    to={`/problem/${problem.problemId || problem.id}`}
                    className="problem-row"
                    key={
                      problem.problemId ||
                      problem.id
                    }
                    style={{ textDecoration: "none", color: "inherit", display: "grid" }}
                  >


                    {/* PROBLEM ID */}

                    <div className="problem-number">

                      {problem.problemId ||
                        problem.id}

                    </div>


                    {/* PROBLEM DETAILS */}

                    <div className="problem-info">

                      <h3>
                        {problem.title}
                      </h3>

                      <p>
                        {problem.district
                          ? `${problem.district}, Jharkhand`
                          : problem.location ||
                            "Location not specified"}
                      </p>

                    </div>


                    {/* CATEGORY */}

                    <div className="problem-category">

                      {problem.domain ||
                        problem.category ||
                        "Societal Challenge"}

                    </div>


                    {/* STATUS */}

                    <div
                      className={`status-badge ${getStatusClass(
                        problem.status
                      )}`}
                    >

                      {problem.status ||
                        "Under Review"}

                    </div>


                  </Link>

                )
              )

            )}

          </div>

        </section>


      </main>

    </div>
  );
}

export default CitizenDashboard;