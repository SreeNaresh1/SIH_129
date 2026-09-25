import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";

function UniversityDashboard() {
  const [problems, setProblems] = useState([]);
  const [teamCount, setTeamCount] = useState(0);

  const [university, setUniversity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ============================================================
  GET LOGIN TOKEN
  ============================================================
  */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };


  /*
  ============================================================
  LOAD UNIVERSITY DASHBOARD DATA
  ============================================================
  */

  useEffect(() => {
    loadDashboardData();
  }, []);


  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      /*
      --------------------------------------------------------
      GET JWT TOKEN
      --------------------------------------------------------
      */

      const token = getToken();

      if (!token) {
        setError(
          "University login session was not found. Please login again."
        );

        setLoading(false);

        return;
      }


      /*
      --------------------------------------------------------
      GET ASSIGNED UNIVERSITY PROBLEMS FROM MYSQL
      --------------------------------------------------------

      IMPORTANT:

      We are NO LONGER doing:

      localStorage.getItem("citizenProblems")

      Instead we call:

      GET /api/advanced/university/problems

      The backend uses:

      req.user.universityId

      and returns only:

      problems.assignedUniversityId =
      req.user.universityId
      --------------------------------------------------------
      */

      const response = await fetch(
        "http://localhost:5000/api/advanced/university/problems",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      /*
      --------------------------------------------------------
      READ RESPONSE
      --------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let data = {};

      if (
        contentType.includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "University dashboard returned non-JSON response:",
          text
        );

        throw new Error(
          "The backend returned an invalid response."
        );
      }


      /*
      --------------------------------------------------------
      HANDLE BACKEND ERROR
      --------------------------------------------------------
      */

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Unable to load university dashboard."
        );
      }


      /*
      --------------------------------------------------------
      STORE UNIVERSITY
      --------------------------------------------------------
      */

      setUniversity(
        data.university || null
      );


      /*
      --------------------------------------------------------
      STORE ASSIGNED PROBLEMS
      --------------------------------------------------------
      */

      setProblems(
        Array.isArray(data.problems)
          ? data.problems
          : []
      );


      /*
      --------------------------------------------------------
      TEAM COUNT
      --------------------------------------------------------

      We are keeping the existing dashboard behaviour
      for the team count.

      This is NOT used for problem assignment.
      --------------------------------------------------------
      */

      loadTeamCount();

    } catch (error) {

      console.error(
        "University dashboard loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load university dashboard."
      );

      setProblems([]);

    } finally {

      setLoading(false);

    }
  };


  /*
  ============================================================
  LOAD TEAM COUNT
  ============================================================
  */

  const loadTeamCount = () => {

    const teamKeys = [
      "studentTeam",
      "team",
      "createdTeam",
      "universityTeam",
    ];

    let foundTeam = null;

    for (
      const key of teamKeys
    ) {

      const savedTeam =
        localStorage.getItem(key);

      if (!savedTeam) {
        continue;
      }

      try {

        foundTeam =
          JSON.parse(
            savedTeam
          );

        if (foundTeam) {
          break;
        }

      } catch (error) {

        console.error(
          `Error reading ${key}:`,
          error
        );

      }

    }

    setTeamCount(
      foundTeam ? 1 : 0
    );
  };


  /*
  ============================================================
  GET WORKFLOW DATA FOR THIS PROBLEM
  ============================================================

  We are keeping this part because your existing workflow
  pages currently use:

  workflow_<problemId>

  This means one problem does not overwrite another problem.
  ============================================================
  */

  const getWorkflowData = (
    problemId
  ) => {

    if (!problemId) {
      return {};
    }

    const saved =
      localStorage.getItem(
        `workflow_${problemId}`
      );

    if (!saved) {
      return {};
    }

    try {

      return (
        JSON.parse(saved) || {}
      );

    } catch (error) {

      console.error(
        `Error reading workflow for ${problemId}:`,
        error
      );

      return {};

    }

  };


  /*
  ============================================================
  CHECK PROJECT COMPLETION
  ============================================================
  */

  const isCompleted = (
    problem
  ) => {

    const problemId =
      problem.problemId ||
      problem.id;

    const workflow =
      getWorkflowData(
        problemId
      );

    return (
      problem.status ===
        "Completed" ||

      workflow.projectCompletion
        ?.status ===
        "Project Completed"
    );

  };


  /*
  ============================================================
  ACTIVE PROJECT COUNT
  ============================================================
  */

  const activeProjects =
    problems.filter(
      (problem) => {

        if (
          isCompleted(
            problem
          )
        ) {
          return false;
        }

        return (
          problem.status ===
            "In Progress" ||

          problem.status ===
            "Approved" ||

          problem.status ===
            "Assigned"
        );

      }
    ).length;


  /*
  ============================================================
  COMPLETED PROJECT COUNT
  ============================================================
  */

  const completedProjects =
    problems.filter(
      (problem) =>
        isCompleted(
          problem
        )
    ).length;


  /*
  ============================================================
  GET STATUS
  ============================================================
  */

  const getStatus = (
    problem
  ) => {

    if (
      isCompleted(
        problem
      )
    ) {
      return "Completed";
    }

    return (
      problem.status ||
      "Assigned"
    );

  };


  /*
  ============================================================
  UNIVERSITY NAME
  ============================================================
  */

  const universityName =
    university?.name ||
    "University";


  /*
  ============================================================
  UNIVERSITY LOCATION
  ============================================================
  */

  const universityLocation = [
    university?.city,
    university?.district,
    university?.state,
  ]
    .filter(Boolean)
    .join(", ");


  /*
  ============================================================
  LOADING SCREEN
  ============================================================
  */

  if (loading) {

    return (

      <div className="university-dashboard">

        <aside className="university-sidebar">

          <div className="university-logo">

            <span>
              SI
            </span>

            University Portal

          </div>

        </aside>


        <main
          className="university-main"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >

          <div
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >

            <h2>
              Loading University Portal...
            </h2>

            <p>
              Loading your assigned challenges.
            </p>

          </div>

        </main>

      </div>

    );

  }


  /*
  ============================================================
  MAIN DASHBOARD
  ============================================================
  */

  return (

    <div className="university-dashboard">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="university-sidebar">

        <div className="university-logo">

          <span>
            SI
          </span>

          University Portal

        </div>


        <nav className="university-menu">

          <Link to="/university">
            📊 Dashboard
          </Link>

          <a href="#challenges">
            📋 Assigned Challenges
          </a>

          <a href="#projects">
            🚀 Projects
          </a>

          <a href="#teams">
            👥 Student Teams
          </a>

          <a href="#mentors">
            👨‍🏫 Faculty Mentors
          </a>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Link to="/notifications">
            🔔 Notifications
          </Link>

        </nav>


        <div className="university-logout">

          <Link to="/login">
            🚪 Logout
          </Link>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="university-main">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="university-header">

          <div>

            <h1>
              University Dashboard
            </h1>

            <p>
              Manage societal innovation projects
              assigned to your institution.
            </p>

          </div>


          <div className="university-user">

            🎓

            <div>

              <strong>
                {universityName}
              </strong>

              <span>
                {universityLocation ||
                  "Higher Education Institution"}
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div
            style={{
              marginBottom: "20px",
              padding: "15px 18px",
              borderRadius: "10px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
            }}
          >

            <strong>
              Unable to load University Portal
            </strong>

            <p
              style={{
                marginTop: "6px",
                marginBottom: "12px",
              }}
            >
              {error}
            </p>


            <button
              type="button"
              onClick={
                loadDashboardData
              }
              style={{
                border: "none",
                borderRadius: "7px",
                padding: "9px 15px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="university-stats">

          <div className="university-stat-card">

            <span>
              Assigned Challenges
            </span>

            <h2>
              {problems.length}
            </h2>

          </div>


          <div className="university-stat-card">

            <span>
              Active Projects
            </span>

            <h2>
              {activeProjects}
            </h2>

          </div>


          <div className="university-stat-card">

            <span>
              Completed Projects
            </span>

            <h2>
              {completedProjects}
            </h2>

          </div>


          <div
            className="university-stat-card"
            id="teams"
          >

            <span>
              Student Teams
            </span>

            <h2>
              {teamCount}
            </h2>

          </div>

        </div>


        {/* ===================================================
            ASSIGNED CHALLENGES
        =================================================== */}

        <section
          className="university-challenges"
          id="challenges"
        >

          <div className="university-section-header">

            <div>

              <h2>
                Assigned Challenges
              </h2>

              <p>
                Challenges assigned by the Government.
              </p>

            </div>

          </div>


          {/* =================================================
              NO CHALLENGES
          ================================================= */}

          {problems.length === 0 ? (

            <div className="university-empty">

              <h3>
                No challenges assigned
              </h3>

              <p>
                Government-assigned challenges
                will appear here.
              </p>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                When Government assigns a problem
                to {universityName}, it will appear
                automatically here.
              </p>

            </div>

          ) : (

            /* ===============================================
               PROBLEM LIST
            =============================================== */

            <div className="university-problem-list">

              {problems.map(
                (problem) => {

                  const problemId =
                    problem.problemId ||
                    problem.id;

                  return (

                    <div
                      className="university-problem-card"
                      key={problemId}
                    >

                      {/* ---------------------------------------
                          TOP
                      --------------------------------------- */}

                      <div className="university-problem-top">

                        <span className="university-problem-id">

                          {problemId}

                        </span>


                        <span
                          className={
                            isCompleted(
                              problem
                            )
                              ? "university-progress completed"
                              : "university-progress"
                          }
                        >

                          {getStatus(
                            problem
                          )}

                        </span>

                      </div>


                      {/* ---------------------------------------
                          TITLE
                      --------------------------------------- */}

                      <h3>

                        {problem.title ||
                          "Untitled Challenge"}

                      </h3>


                      {/* ---------------------------------------
                          DESCRIPTION
                      --------------------------------------- */}

                      <p>

                        {problem.description ||
                          "No description available."}

                      </p>


                      {/* ---------------------------------------
                          INFORMATION
                      --------------------------------------- */}

                      <div className="university-problem-info">

                        <span>

                          📍{" "}

                          {problem.district ||
                            problem.location ||
                            "Location not specified"}

                        </span>


                        <span>

                          🏷️{" "}

                          {problem.aiDomain ||
                            problem.domain ||
                            "Domain not specified"}

                        </span>


                        <span>

                          ⚠️{" "}

                          {problem.aiSeverity ||
                            problem.severity ||
                            "Severity not specified"}

                        </span>

                      </div>


                      {/* ---------------------------------------
                          AI INFORMATION
                      --------------------------------------- */}

                      {(problem.aiSubDomain ||
                        problem.aiSector) && (

                        <div
                          style={{
                            marginTop: "10px",
                            padding: "10px 12px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >

                          {problem.aiSubDomain && (

                            <div>

                              <strong>
                                AI Sub-domain:
                              </strong>{" "}

                              {problem.aiSubDomain}

                            </div>

                          )}


                          {problem.aiSector && (

                            <div
                              style={{
                                marginTop: "4px",
                              }}
                            >

                              <strong>
                                Sector:
                              </strong>{" "}

                              {problem.aiSector}

                            </div>

                          )}

                        </div>

                      )}


                      {/* ---------------------------------------
                          ASSIGNED UNIVERSITY
                      --------------------------------------- */}

                      <div className="university-assigned">

                        <span>
                          Assigned to:
                        </span>

                        <strong>

                          {universityName}

                        </strong>

                      </div>


                      {/* ---------------------------------------
                          COMPLETED
                      --------------------------------------- */}

                      {isCompleted(
                        problem
                      ) && (

                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#e8f8ef",
                            color: "#008f4c",
                            fontWeight: "600",
                          }}
                        >

                          ✓ Project Completed

                        </div>

                      )}


                      {/* ---------------------------------------
                          VIEW CHALLENGE
                      --------------------------------------- */}

                      <Link
                        to={`/university/problem/${problemId}`}
                        className="university-view-button"
                      >

                        View Challenge

                      </Link>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* ===================================================
            PROJECTS
        =================================================== */}

        <section
          id="projects"
          style={{
            marginTop: "30px",
          }}
        >

          <div className="university-section-header">

            <div>

              <h2>
                Project Progress
              </h2>

              <p>
                Track the progress of your assigned
                societal innovation projects.
              </p>

            </div>

          </div>


          {completedProjects > 0 ? (

            <div
              style={{
                padding: "20px",
                background: "#e8f8ef",
                borderRadius: "10px",
                marginTop: "15px",
              }}
            >

              <h3
                style={{
                  color: "#008f4c",
                  marginBottom: "8px",
                }}
              >

                ✓ Implementation Completed

              </h3>

              <p>

                A project has been fully implemented
                and the final project details have been
                submitted successfully.

              </p>

            </div>

          ) : activeProjects > 0 ? (

            <div
              style={{
                padding: "20px",
                background: "#eef4ff",
                borderRadius: "10px",
                marginTop: "15px",
              }}
            >

              <h3>
                🚀 Implementation In Progress
              </h3>

              <p>

                The approved project is currently
                being implemented.

              </p>

            </div>

          ) : (

            <div
              style={{
                padding: "20px",
                background: "#f5f7fa",
                borderRadius: "10px",
                marginTop: "15px",
              }}
            >

              <h3>
                No Active Projects
              </h3>

              <p>

                Project activity will appear here
                once the workflow begins.

              </p>

            </div>

          )}

        </section>


        {/* ===================================================
            MENTORS
        =================================================== */}

        <section
          id="mentors"
          style={{
            marginTop: "30px",
            marginBottom: "40px",
          }}
        >

          <div className="university-section-header">

            <div>

              <h2>
                Faculty Mentors
              </h2>

              <p>
                Faculty members supporting the project.
              </p>

            </div>

          </div>


          <div
            style={{
              padding: "18px",
              background: "#ffffff",
              border: "1px solid #dce3ef",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >

            <strong>
              👨‍🏫 Dr. Priya Sharma
            </strong>

            <p>
              Faculty Mentor
            </p>

          </div>

        </section>

      </main>

    </div>

  );
}

export default UniversityDashboard;