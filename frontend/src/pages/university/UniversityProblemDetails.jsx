import { useEffect, useState } from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import { api } from "../../api";
import StakeholderChat from "../../components/StakeholderChat";

import "../../App.css";


function UniversityProblemDetails() {

  const { id } = useParams();


  /*
  =========================================================
  PROBLEM
  =========================================================
  */

  const [
    problem,
    setProblem
  ] = useState(null);


  /*
  =========================================================
  PROJECT
  =========================================================
  */

  const [
    project,
    setProject
  ] = useState(null);


  /*
  =========================================================
  TEAM
  =========================================================
  */

  const [
    team,
    setTeam
  ] = useState(null);


  /*
  =========================================================
  MENTOR
  =========================================================
  */

  const [
    mentor,
    setMentor
  ] = useState(null);


  /*
  =========================================================
  PROPOSAL
  =========================================================
  */

  const [
    proposal,
    setProposal
  ] = useState(null);


  /*
  =========================================================
  PROTOTYPE
  =========================================================
  */

  const [
    prototype,
    setPrototype
  ] = useState(null);


  /*
  =========================================================
  IMPLEMENTATION
  =========================================================
  */

  const [
    implementation,
    setImplementation
  ] = useState(null);


  /*
  =========================================================
  PROJECT COMPLETION
  =========================================================
  */

  const [
    completion,
    setCompletion
  ] = useState(null);


  /*
  =========================================================
  LOADING
  =========================================================
  */

  const [
    loading,
    setLoading
  ] = useState(true);


  /*
  =========================================================
  ERROR
  =========================================================
  */

  const [
    error,
    setError
  ] = useState("");


  /*
  =========================================================
  LOAD ALL PROJECT DATA
  =========================================================
  */

  useEffect(() => {

    if (!id) {
      return;
    }

    loadProjectData();

  }, [id]);


  const loadProjectData =
    async () => {

      try {

        setLoading(true);

        setError("");


        /*
        =====================================================
        01. LOAD PROBLEM
        =====================================================
        */

        const problemResponse =
          await api(
            `/problems/${encodeURIComponent(id)}`
          );


        const loadedProblem =
          problemResponse.problem ||
          null;


        if (!loadedProblem) {

          throw new Error(
            "Challenge not found."
          );

        }


        setProblem(
          loadedProblem
        );


        const problemId =
          loadedProblem.problemId ||
          id;


        /*
        =====================================================
        02. LOAD PROJECT
        =====================================================
        */

        let loadedProject = null;


        try {

          const projectResponse =
            await api(
              `/advanced/projects/problem/${encodeURIComponent(
                problemId
              )}`
            );


          loadedProject =
            projectResponse.project ||
            null;


          setProject(
            loadedProject
          );

        } catch (projectError) {

          console.error(
            "Project loading error:",
            projectError
          );

          setProject(null);

        }


        /*
        =====================================================
        IF PROJECT EXISTS
        =====================================================
        */

        if (loadedProject) {


          /*
          ===================================================
          03. TEAM
          ===================================================
          */

          try {

            const teamResponse =
              await api(
                `/advanced/university/team/${encodeURIComponent(
                  problemId
                )}`
              );


            setTeam(
              teamResponse.team ||
              null
            );

          } catch (teamError) {

            console.error(
              "Team loading error:",
              teamError
            );

            setTeam(null);

          }


          /*
          ===================================================
          04. MENTOR
          ===================================================
          */

          try {

            const mentorResponse =
              await api(
                `/advanced/university/mentor/${encodeURIComponent(
                  problemId
                )}`
              );


            setMentor(
              mentorResponse.mentor ||
              null
            );

          } catch (mentorError) {

            console.error(
              "Mentor loading error:",
              mentorError
            );

            setMentor(null);

          }


          /*
          ===================================================
          05. SOLUTION PROPOSAL
          ===================================================
          */

          try {

            const proposalResponse =
              await api(
                `/advanced/proposals/project/${loadedProject.id}`
              );


            const proposals =
              proposalResponse.proposals ||
              [];


            if (
              proposals.length > 0
            ) {

              setProposal(
                proposals[0]
              );

            } else {

              setProposal(null);

            }

          } catch (proposalError) {

            console.error(
              "Proposal loading error:",
              proposalError
            );

            setProposal(null);

          }


          /*
          ===================================================
          06. PROTOTYPE
          ===================================================
          */

          try {

            const prototypeResponse =
              await api(
                `/advanced/projects/${loadedProject.id}/prototype-tests`
              );


            const tests =
              prototypeResponse.tests ||
              [];


            if (
              tests.length > 0
            ) {

              setPrototype(
                tests[0]
              );

            } else {

              setPrototype(null);

            }

          } catch (prototypeError) {

            console.error(
              "Prototype loading error:",
              prototypeError
            );

            setPrototype(null);

          }


          /*
          ===================================================
          07. IMPLEMENTATION
          ===================================================
          */

          try {

            const implementationResponse =
              await api(
                `/advanced/implementations/project/${loadedProject.id}`
              );


            setImplementation(
              implementationResponse.implementation ||
              null
            );

          } catch (implementationError) {

            console.error(
              "Implementation loading error:",
              implementationError
            );

            setImplementation(null);

          }


          /*
          ===================================================
          08. PROJECT COMPLETION

          READ THE COMPLETION RECORD FROM MYSQL.

          Backend endpoint:
          GET /api/advanced/project-completion/project/:projectId
          ===================================================
          */

          try {

            const completionResponse =
              await api(
                `/advanced/project-completion/project/${loadedProject.id}`
              );


            setCompletion(
              completionResponse.completion ||
              null
            );

          } catch (completionError) {

            console.error(
              "Project completion loading error:",
              completionError
            );

            setCompletion(null);

          }

        }

      } catch (loadError) {

        console.error(
          "University challenge loading error:",
          loadError
        );


        setError(
          loadError.message ||
          "Unable to load challenge."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <div className="university-empty">

        <h2>
          Loading Challenge...
        </h2>

        <p>
          Loading the project workflow from the database.
        </p>

      </div>

    );

  }


  /*
  =========================================================
  ERROR
  =========================================================
  */

  if (
    error ||
    !problem
  ) {

    return (

      <div className="university-empty">

        <h2>
          Challenge not found
        </h2>

        <p>
          {error ||
            "Unable to load this challenge."}
        </p>


        <Link to="/university">
          ← Back to University Dashboard
        </Link>

      </div>

    );

  }


  /*
  =========================================================
  EXACT PROBLEM ID
  =========================================================
  */

  const problemId =
    problem.problemId ||
    id;


  /*
  =========================================================
  WORKFLOW STATES

  ALL OF THESE COME FROM MYSQL.
  =========================================================
  */

  const teamSubmitted =
    Boolean(team);


  const mentorAssigned =
    Boolean(mentor);


  const proposalSubmitted =
    Boolean(proposal);


  const prototypeSubmitted =
    Boolean(prototype);


  const implementationSubmitted =
    Boolean(implementation);


  /*
  =========================================================
  PROJECT COMPLETION STATE

  TRUE ONLY WHEN THE COMPLETION RECORD EXISTS
  IN MYSQL.
  =========================================================
  */

  const completionSubmitted =
    Boolean(completion);


  return (

    <div className="university-dashboard">


      {/* =================================================
          SIDEBAR
      ================================================= */}

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


          <Link to="/university">
            📋 Assigned Challenges
          </Link>


          <a href="#projects">
            🚀 Projects
          </a>


          <a href="#teams">
            👥 Student Teams
          </a>


          <a href="#mentors">
            👨‍🏫 Faculty Mentors
          </a>

        </nav>


        <div className="university-logout">

          <Link to="/">
            🚪 Logout
          </Link>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="university-main">


        <div className="university-header">

          <div>

            <h1>
              Challenge Details
            </h1>


            <p>
              Review the challenge assigned by the Government.
            </p>

          </div>


          <Link
            to="/university"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>

        </div>


        <div className="university-details-grid">


          {/* =================================================
              CHALLENGE DETAILS
          ================================================= */}

          <section className="university-details-card">


            <div className="university-details-header">

              <div>

                <span className="university-problem-id">

                  {problem.problemId ||
                    problem.id}

                </span>


                <h2>
                  {problem.title}
                </h2>

              </div>


              <span className="university-progress">

                {problem.status ||
                  "Approved"}

              </span>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="university-detail-section">

              <h3>
                Problem Description
              </h3>


              <p>
                {problem.description}
              </p>

            </div>


            {/* =================================================
                LOCATION & IMPACT
            ================================================= */}

            <div className="university-detail-section">

              <h3>
                Location & Impact
              </h3>


              <div className="university-detail-grid">


                <div>

                  <span>
                    District
                  </span>


                  <strong>
                    {problem.district}
                  </strong>

                </div>


                <div>

                  <span>
                    Location
                  </span>


                  <strong>
                    {problem.location ||
                      "Not specified"}
                  </strong>

                </div>


                <div>

                  <span>
                    Domain
                  </span>


                  <strong>
                    {problem.domain}
                  </strong>

                </div>


                <div>

                  <span>
                    Severity
                  </span>


                  <strong>
                    {problem.severity}
                  </strong>

                </div>


                <div>

                  <span>
                    People Affected
                  </span>


                  <strong>
                    {problem.affectedPeople ||
                      "Not specified"}
                  </strong>

                </div>


                <div>

                  <span>
                    Assigned University
                  </span>


                  <strong>
                    Assigned
                  </strong>

                </div>

              </div>

            </div>


            {/* =================================================
                SUPPORTING EVIDENCE
            ================================================= */}

            <div className="university-detail-section">

              <h3>
                Supporting Evidence
              </h3>


              <div className="university-evidence">

                {problem.photo ? (

                  <p>
                    📷 {problem.photo}
                  </p>

                ) : (

                  <p>
                    No photo uploaded
                  </p>

                )}


                {problem.video && (

                  <p>
                    🎥 {problem.video}
                  </p>

                )}

              </div>

            </div>


            {/* =================================================
                PROJECT INFORMATION
            ================================================= */}

            {project && (

              <div className="university-detail-section">

                <h3>
                  Project Information
                </h3>


                <div className="university-detail-grid">

                  <div>

                    <span>
                      Project ID
                    </span>


                    <strong>
                      {project.id}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Project Status
                    </span>


                    <strong>
                      {project.status ||
                        "Assigned"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Progress
                    </span>


                    <strong>
                      {project.progressPercent ||
                        0}
                      %
                    </strong>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                STAKEHOLDER COMMUNICATION THREAD
            ================================================= */}
            <div style={{ marginTop: "24px" }}>
              <StakeholderChat
                problemId={problem?.problemId || id}
                currentUser={JSON.parse(localStorage.getItem("currentUser") || "{}")}
              />
            </div>

          </section>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <aside>


            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            <div className="university-ai-card">

              <h2>
                🤖 AI Analysis
              </h2>


              <p>
                Government validation results
              </p>


              <div className="university-ai-row">

                <span>
                  Category
                </span>


                <strong>
                  {problem.domain}
                </strong>

              </div>


              <div className="university-ai-row">

                <span>
                  Priority
                </span>


                <strong>
                  {problem.severity}
                </strong>

              </div>


              <div className="university-ai-row">

                <span>
                  Duplicate Check
                </span>


                <strong className="ai-success">

                  ✓ No Duplicate

                </strong>

              </div>

            </div>


            {/* =================================================
                ASSIGNMENT
            ================================================= */}

            <div className="university-action-card">

              <h2>
                Challenge Assignment
              </h2>


              <div className="university-accepted">

                ✓ Challenge Assigned


                <p>
                  Your institution has been selected
                  to develop a solution for this challenge.
                </p>

              </div>

            </div>


            {/* =================================================
                PROJECT WORKFLOW
            ================================================= */}

            <div className="university-next-card">

              <h2>
                Project Workflow
              </h2>


              {/* =================================================
                  01 CHALLENGE
              ================================================= */}

              <div className="workflow-step active">

                <span>
                  ✓
                </span>


                <div>

                  <strong>
                    Challenge Assigned
                  </strong>


                  <p>
                    Challenge available
                  </p>

                </div>

              </div>


              {/* =================================================
                  02 STUDENT TEAM
              ================================================= */}

              {teamSubmitted ? (

                <div className="workflow-step active">

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Form Student Team
                    </strong>


                    <p>
                      {team.name ||
                        "Team formed"}
                    </p>

                  </div>

                </div>

              ) : (

                <Link
                  to={`/university/team?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    02
                  </span>


                  <div>

                    <strong>
                      Form Student Team
                    </strong>


                    <p>
                      Add students
                    </p>

                  </div>

                </Link>

              )}


              {/* =================================================
                  03 FACULTY MENTOR
              ================================================= */}

              {mentorAssigned ? (

                <div className="workflow-step active">

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Faculty Mentor
                    </strong>


                    <p>

                      {mentor.faculty?.name ||
                        "Mentor Assigned"}

                    </p>

                  </div>

                </div>

              ) : (

                <Link
                  to={`/university/mentor?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    03
                  </span>


                  <div>

                    <strong>
                      Faculty Mentor
                    </strong>


                    <p>
                      Assign mentor
                    </p>

                  </div>

                </Link>

              )}


              {/* =================================================
                  04 SOLUTION PROPOSAL
              ================================================= */}

              {proposalSubmitted ? (

                <Link
                  to={`/university/proposal?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step active"
                >

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Solution Proposal
                    </strong>


                    <p>
                      Proposal submitted
                    </p>

                  </div>

                </Link>

              ) : (

                <Link
                  to={`/university/proposal?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    04
                  </span>


                  <div>

                    <strong>
                      Solution Proposal
                    </strong>


                    <p>
                      Develop solution
                    </p>

                  </div>

                </Link>

              )}


              {/* =================================================
                  05 PROTOTYPE
              ================================================= */}

              {prototypeSubmitted ? (

                <Link
                  to={`/university/prototype-testing?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step active"
                >

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Prototype & Testing
                    </strong>


                    <p>
                      Prototype submitted
                    </p>

                  </div>

                </Link>

              ) : (

                <Link
                  to={`/university/prototype-testing?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    05
                  </span>


                  <div>

                    <strong>
                      Prototype & Testing
                    </strong>


                    <p>
                      Build and validate
                    </p>

                  </div>

                </Link>

              )}


              {/* =================================================
                  06 IMPLEMENTATION
              ================================================= */}

              {implementationSubmitted ? (

                <Link
                  to={`/university/implementation?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step active"
                >

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Implementation
                    </strong>


                    <p>
                      Implementation plan submitted
                    </p>

                  </div>

                </Link>

              ) : (

                <Link
                  to={`/university/implementation?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    06
                  </span>


                  <div>

                    <strong>
                      Implementation
                    </strong>


                    <p>
                      Deploy solution
                    </p>

                  </div>

                </Link>

              )}


              {/* =================================================
                  07 PROJECT COMPLETION

                  NOW READS THE MYSQL COMPLETION RECORD.

                  IF COMPLETION EXISTS:
                  BLUE CHECKMARK ✓

                  IF NOT:
                  GREY 07
              ================================================= */}

              {completionSubmitted ? (

                <Link
                  to={`/university/completion?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step active"
                >

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      Project Completion
                    </strong>


                    <p>
                      Project completed
                    </p>

                  </div>

                </Link>

              ) : (

                <Link
                  to={`/university/completion?problemId=${encodeURIComponent(
                    problemId
                  )}`}
                  className="workflow-step"
                >

                  <span>
                    07
                  </span>


                  <div>

                    <strong>
                      Project Completion
                    </strong>


                    <p>
                      Submit final results
                    </p>

                  </div>

                </Link>

              )}


            </div>


          </aside>


        </div>


      </main>

    </div>

  );

}


export default UniversityProblemDetails;