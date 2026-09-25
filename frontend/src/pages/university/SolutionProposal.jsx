import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { api } from "../../api";

import "../../App.css";


function SolutionProposal() {

  const navigate =
    useNavigate();

  const [
    searchParams
  ] = useSearchParams();


  /*
  =========================================================
  EXACT PROBLEM ID
  =========================================================
  */

  const problemId =
    searchParams.get(
      "problemId"
    );


  /*
  =========================================================
  STATE
  =========================================================
  */

  const [
    problem,
    setProblem
  ] = useState(null);


  const [
    project,
    setProject
  ] = useState(null);


  const [
    mentor,
    setMentor
  ] = useState(null);


  const [
    existingProposal,
    setExistingProposal
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  /*
  ---------------------------------------------------------
  FORM
  ---------------------------------------------------------
  */

  const [
    solutionTitle,
    setSolutionTitle
  ] = useState("");


  const [
    solution,
    setSolution
  ] = useState("");


  const [
    technology,
    setTechnology
  ] = useState("");


  const [
    impact,
    setImpact
  ] = useState("");


  const [
    cost,
    setCost
  ] = useState("");


  const [
    implementation,
    setImplementation
  ] = useState("");


  /*
  =========================================================
  LOAD PAGE DATA
  =========================================================
  */

  useEffect(() => {

    if (!problemId) {
      setLoading(false);
      return;
    }

    loadData();

  }, [problemId]);


  /*
  =========================================================
  LOAD PROBLEM + PROJECT + MENTOR + PROPOSAL
  =========================================================
  */

  const loadData =
    async () => {

      try {

        setLoading(true);

        setError("");


        /*
        =====================================================
        1. LOAD EXACT PROBLEM
        =====================================================
        */

        const problemResult =
          await api(
            `/problems/${encodeURIComponent(
              problemId
            )}`
          );


        const loadedProblem =
          problemResult.problem ||
          problemResult.data ||
          null;


        if (!loadedProblem) {

          throw new Error(
            "Challenge not found."
          );

        }


        setProblem(
          loadedProblem
        );


        /*
        -----------------------------------------------------
        CHECK ASSIGNED UNIVERSITY
        -----------------------------------------------------
        */

        if (
          !loadedProblem.assignedUniversityId
        ) {

          alert(
            "This challenge has not been assigned to a university yet."
          );

          navigate(
            "/university"
          );

          return;

        }


        /*
        =====================================================
        2. LOAD EXACT PROJECT
        =====================================================
        */

        const projectResult =
          await api(
            `/advanced/projects/problem/${encodeURIComponent(
              problemId
            )}`
          );


        const loadedProject =
          projectResult.project ||
          null;


        if (!loadedProject) {

          throw new Error(
            "Project not found for this challenge."
          );

        }


        setProject(
          loadedProject
        );


        /*
        =====================================================
        3. LOAD FACULTY MENTOR
        =====================================================

        This confirms that Step 03 has actually been
        completed before the university starts Step 04.
        =====================================================
        */

        try {

          const mentorResult =
            await api(
              `/advanced/university/mentor/${encodeURIComponent(
                problemId
              )}`
            );


          if (
            mentorResult.success &&
            mentorResult.mentor
          ) {

            setMentor(
              mentorResult.mentor
            );

          } else {

            setMentor(null);

          }

        } catch (mentorError) {

          console.warn(
            "Mentor loading warning:",
            mentorError.message
          );

          setMentor(null);

        }


        /*
        =====================================================
        4. LOAD EXISTING PROPOSAL
        =====================================================

        This loads the latest proposal from the database.

        IMPORTANT:

        If Government requested changes, the existing
        proposal remains editable.

        If Government approved it, the proposal becomes
        locked.

        If it is still pending Government review, it
        remains locked until Government makes a decision.
        =====================================================
        */

        try {

          const proposalResult =
            await api(
              `/advanced/proposals/project/${loadedProject.id}`
            );


          if (
            proposalResult.success
          ) {

            const proposals =
              proposalResult.proposals ||
              [];


            if (
              proposals.length > 0
            ) {

              /*
               * Most recent proposal.
               *
               * The backend orders proposals by
               * createdAt DESC.
               */

              const savedProposal =
                proposals[0];


              setExistingProposal(
                savedProposal
              );


              /*
               * Populate form with saved
               * proposal data.
               */

              setSolutionTitle(
                savedProposal.title ||
                ""
              );


              setSolution(
                savedProposal.solution ||
                ""
              );


              setImpact(
                savedProposal.expectedImpact ||
                ""
              );


              setCost(
                savedProposal.budget !==
                null &&
                savedProposal.budget !==
                undefined
                  ? String(
                      savedProposal.budget
                    )
                  : ""
              );


              /*
               * methodology contains:

               Technology

               +

               Implementation Approach

               The backend stores them together.
               */

              const methodology =
                savedProposal.methodology ||
                "";


              if (
                methodology.includes(
                  "\n\n"
                )
              ) {

                const parts =
                  methodology.split(
                    "\n\n"
                  );


                setTechnology(
                  parts[0] ||
                  ""
                );


                setImplementation(
                  parts
                    .slice(1)
                    .join(
                      "\n\n"
                    )
                );

              } else {

                setTechnology(
                  methodology
                );

              }

            }

          }

        } catch (proposalError) {

          /*
           * No proposal is not an error.
           *
           * It simply means Step 04 has not
           * been submitted yet.
           */

          console.warn(
            "Existing proposal loading warning:",
            proposalError.message
          );

          setExistingProposal(
            null
          );

        }

      } catch (loadError) {

        console.error(
          "Load proposal data error:",
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
  GOVERNMENT REVIEW STATUS
  =========================================================
  */

  const proposalReviewStatus =
    existingProposal?.governmentReviewStatus ||
    "";


  const proposalReviewComment =
    existingProposal?.governmentReviewComment ||
    "";


  /*
  =========================================================
  PROPOSAL STATE
  =========================================================

  NEW:
  No proposal exists
  → editable

  CHANGES REQUESTED:
  Government requested changes
  → editable

  PENDING:
  Submitted but Government has not decided
  → locked

  APPROVED:
  Government approved
  → locked
  =========================================================
  */

  const proposalChangesRequested =
    proposalReviewStatus ===
    "Changes Requested";


  const proposalApproved =
    proposalReviewStatus ===
    "Approved";


  const proposalPendingReview =
    Boolean(
      existingProposal
    ) &&
    !proposalChangesRequested &&
    !proposalApproved;


  const proposalCanBeEdited =
    !existingProposal ||
    proposalChangesRequested;


  /*
  =========================================================
  SUBMIT / RESUBMIT PROPOSAL
  =========================================================
  */

  const submitProposal =
    async () => {

      /*
      -------------------------------------------------------
      VALIDATE PROBLEM
      -------------------------------------------------------
      */

      if (!problemId) {

        alert(
          "Challenge ID is missing."
        );

        return;

      }


      /*
      -------------------------------------------------------
      VALIDATE PROJECT
      -------------------------------------------------------
      */

      if (!project) {

        alert(
          "Project information is not available."
        );

        return;

      }


      /*
      -------------------------------------------------------
      VALIDATE MENTOR
      -------------------------------------------------------
      */

      if (
        !mentor ||
        !mentor.facultyId
      ) {

        alert(
          "Please assign a faculty mentor before submitting the solution proposal."
        );

        return;

      }


      /*
      -------------------------------------------------------
      PREVENT SUBMISSION WHEN LOCKED
      -------------------------------------------------------
      */

      if (
        existingProposal &&
        !proposalCanBeEdited
      ) {

        alert(
          proposalApproved
            ? "This solution proposal has already been approved by the Government."
            : "This solution proposal is currently waiting for Government review."
        );

        return;

      }


      /*
      -------------------------------------------------------
      VALIDATE FORM
      -------------------------------------------------------
      */

      if (
        !solutionTitle.trim() ||
        !solution.trim() ||
        !technology.trim() ||
        !impact.trim() ||
        !cost.trim() ||
        !implementation.trim()
      ) {

        alert(
          "Please fill all fields."
        );

        return;

      }


      /*
      -------------------------------------------------------
      VALIDATE COST
      -------------------------------------------------------
      */

      const numericCost =
        Number(
          String(
            cost
          ).replace(
            /[^0-9.]/g,
            ""
          )
        );


      if (
        Number.isNaN(
          numericCost
        ) ||
        numericCost < 0
      ) {

        alert(
          "Please enter a valid estimated cost."
        );

        return;

      }


      try {

        setSubmitting(true);


        /*
        =====================================================
        DATABASE FIELD MAPPING
        =====================================================

        Proposal table:

        title
        solution
        methodology
        expectedImpact
        budget

        IMPORTANT:

        The backend finds the existing proposal for
        this project and updates it.

        Therefore, when Government requested changes,
        this becomes a RESUBMISSION instead of creating
        another proposal.
        =====================================================
        */

        const response =
          await api(
            `/advanced/proposals/project/${project.id}`,
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  title:
                    solutionTitle.trim(),

                  solution:
                    solution.trim(),

                  methodology:
                    `${technology.trim()}\n\n${implementation.trim()}`,

                  expectedImpact:
                    impact.trim(),

                  budget:
                    numericCost

                })

            }
          );


        /*
        -----------------------------------------------------
        CHECK RESPONSE
        -----------------------------------------------------
        */

        if (
          !response.success
        ) {

          throw new Error(
            response.message ||
            "Unable to submit solution proposal."
          );

        }


        /*
        -----------------------------------------------------
        SUCCESS
        -----------------------------------------------------
        */

        alert(
          proposalChangesRequested
            ? "Solution proposal resubmitted successfully for Government review!"
            : "Solution proposal submitted successfully!"
        );


        /*
        -----------------------------------------------------
        GO BACK TO THE EXACT PROBLEM
        -----------------------------------------------------
        */

        navigate(
          `/university/problem/${encodeURIComponent(
            problemId
          )}`
        );

      } catch (submitError) {

        console.error(
          "Proposal submission error:",
          submitError
        );


        alert(
          submitError.message ||
          "Unable to submit solution proposal."
        );

      } finally {

        setSubmitting(false);

      }

    };


  /*
  =========================================================
  NO PROBLEM ID
  =========================================================
  */

  if (!problemId) {

    return (

      <div className="proposal-page">

        <div className="proposal-card">

          <h2>
            Challenge Not Selected
          </h2>


          <p>
            Please open the solution proposal
            from an assigned challenge.
          </p>


          <Link to="/university">

            ← Back to Dashboard

          </Link>

        </div>

      </div>

    );

  }


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <div className="proposal-page">

        <div className="proposal-header">

          <div>

            <h1>
              Solution Proposal
            </h1>

            <p>
              Loading project information...
            </p>

          </div>

        </div>


        <div className="proposal-card">

          <h2>
            Loading...
          </h2>

          <p>
            Loading the challenge, project,
            mentor and proposal information
            from the database.
          </p>

        </div>

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
    !problem ||
    !project
  ) {

    return (

      <div className="proposal-page">

        <div className="proposal-header">

          <div>

            <h1>
              Solution Proposal
            </h1>

            <p>
              Unable to load project information.
            </p>

          </div>


          <Link
            to={`/university/problem/${encodeURIComponent(
              problemId
            )}`}
            className="back-link"
          >
            ← Back to Challenge
          </Link>

        </div>


        <div className="proposal-card">

          <h2>
            Unable to Load Challenge
          </h2>


          <p>
            {error ||
              "Project information is unavailable."}
          </p>


          <Link
            to="/university"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </div>

    );

  }


  /*
  =========================================================
  MENTOR STATUS
  =========================================================
  */

  const mentorAssigned =
    Boolean(
      mentor &&
      mentor.facultyId
    );


  /*
  =========================================================
  MAIN UI
  =========================================================
  */

  return (

    <div className="proposal-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="proposal-header">

        <div>

          <h1>
            Solution Proposal
          </h1>

          <p>
            Develop a solution for the assigned societal challenge.
          </p>

        </div>


        <Link
          to={`/university/problem/${encodeURIComponent(
            problemId
          )}`}
          className="back-link"
        >
          ← Back to Challenge
        </Link>

      </div>


      {/* ===================================================
          MAIN CARD
      =================================================== */}

      <div className="proposal-card">


        {/* =================================================
            CHALLENGE INFORMATION
        ================================================= */}

        <h2>
          Challenge Information
        </h2>


        <div className="challenge-info">

          <strong>
            {problem.title}
          </strong>


          <p>
            {problem.description}
          </p>


          <span>

            📍 {problem.district}

            {" | "}

            🏷️ {problem.domain}

            {" | "}

            ⚠️ {problem.severity}

          </span>

        </div>


        {/* =================================================
            PROJECT INFORMATION
        ================================================= */}

        <h2>
          Project Information
        </h2>


        <div className="team-info">


          <div>

            <span>
              Challenge ID
            </span>


            <strong>
              {problemId}
            </strong>

          </div>


          <div>

            <span>
              Project ID
            </span>


            <strong>
              {project.id}
            </strong>

          </div>


        </div>


        {/* =================================================
            FACULTY MENTOR INFORMATION
        ================================================= */}

        <h2>
          Faculty Mentor
        </h2>


        {mentorAssigned ? (

          <div
            style={{
              padding:
                "14px 16px",
              border:
                "1px solid #b7dfbd",
              background:
                "#effaf1",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>
              ✓ Faculty Mentor Assigned
            </strong>


            <p
              style={{
                margin:
                  "6px 0 0"
              }}
            >

              {mentor?.faculty?.name ||
                "Assigned Faculty"}

            </p>


            {mentor?.faculty?.department && (

              <small>

                {mentor.faculty.department}

              </small>

            )}

          </div>

        ) : (

          <div
            style={{
              padding:
                "14px 16px",
              border:
                "1px solid #f0c36d",
              background:
                "#fff8e8",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>
              ⚠ Faculty Mentor Required
            </strong>


            <p
              style={{
                margin:
                  "6px 0 0"
              }}
            >
              Please assign a faculty mentor
              before submitting the solution proposal.
            </p>


            <Link
              to={`/university/mentor?problemId=${encodeURIComponent(
                problemId
              )}`}
              style={{
                display:
                  "inline-block",
                marginTop:
                  "10px"
              }}
            >
              Assign Faculty Mentor →
            </Link>

          </div>

        )}


        {/* =================================================
            GOVERNMENT REVIEW STATUS
        ================================================= */}

        {proposalChangesRequested && (

          <div
            style={{
              padding:
                "16px 18px",
              border:
                "1px solid #f0c36d",
              background:
                "#fff8e8",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>
              ⚠ Government Requested Changes
            </strong>


            <p
              style={{
                margin:
                  "7px 0 0"
              }}
            >
              The Government has reviewed this
              Solution Proposal and requested changes.
              You can edit the existing proposal below
              and resubmit it for Government review.
            </p>


            {proposalReviewComment && (

              <div
                style={{
                  marginTop:
                    "12px",
                  padding:
                    "12px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #ead7a1",
                  borderRadius:
                    "8px"
                }}
              >

                <strong>
                  Government Comment:
                </strong>


                <p
                  style={{
                    margin:
                      "6px 0 0",
                    whiteSpace:
                      "pre-wrap"
                  }}
                >
                  {proposalReviewComment}
                </p>

              </div>

            )}

          </div>

        )}


        {proposalPendingReview && (

          <div
            style={{
              padding:
                "16px 18px",
              border:
                "1px solid #bfdbfe",
              background:
                "#eff6ff",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>
              ⏳ Waiting for Government Review
            </strong>


            <p
              style={{
                margin:
                  "7px 0 0"
              }}
            >
              Your Solution Proposal has been submitted
              and is currently waiting for Government approval.
              The proposal cannot be edited until the Government
              completes its review.
            </p>

          </div>

        )}


        {proposalApproved && (

          <div
            style={{
              padding:
                "16px 18px",
              border:
                "1px solid #b7dfbd",
              background:
                "#effaf1",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>
              ✓ Solution Proposal Approved
            </strong>


            <p
              style={{
                margin:
                  "7px 0 0"
              }}
            >
              The Government has approved this
              Solution Proposal. The proposal is now
              locked and the project can proceed to
              the Prototype & Testing stage.
            </p>


            {proposalReviewComment && (

              <div
                style={{
                  marginTop:
                    "12px",
                  padding:
                    "12px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #cce8d2",
                  borderRadius:
                    "8px"
                }}
              >

                <strong>
                  Government Comment:
                </strong>


                <p
                  style={{
                    margin:
                      "6px 0 0",
                    whiteSpace:
                      "pre-wrap"
                  }}
                >
                  {proposalReviewComment}
                </p>

              </div>

            )}

          </div>

        )}


        {/* =================================================
            EXISTING PROPOSAL NOTICE
        ================================================= */}

        {existingProposal &&
          !proposalChangesRequested &&
          !proposalPendingReview &&
          !proposalApproved && (

            <div
              style={{
                padding:
                  "14px 16px",
                border:
                  "1px solid #dce3ef",
                background:
                  "#f8fafc",
                borderRadius:
                  "10px",
                marginBottom:
                  "24px"
              }}
            >

              <strong>
                Solution Proposal Submitted
              </strong>

            </div>

        )}


        {/* =================================================
            PROPOSED SOLUTION
        ================================================= */}

        <h2>
          {proposalChangesRequested
            ? "Edit Solution Proposal"
            : "Proposed Solution"}
        </h2>


        {proposalChangesRequested && (

          <p
            style={{
              marginTop:
                "-10px",
              marginBottom:
                "20px",
              color:
                "#64748b"
            }}
          >
            Update the requested fields below and
            resubmit the proposal for Government review.
          </p>

        )}


        {/* =================================================
            SOLUTION TITLE
        ================================================= */}

        <div className="form-group">

          <label>
            Solution Title *
          </label>


          <input
            type="text"
            value={
              solutionTitle
            }
            onChange={(e) =>
              setSolutionTitle(
                e.target.value
              )
            }
            placeholder="Enter solution title"
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            PROPOSED SOLUTION
        ================================================= */}

        <div className="form-group">

          <label>
            Proposed Solution *
          </label>


          <textarea
            rows="6"
            value={
              solution
            }
            onChange={(e) =>
              setSolution(
                e.target.value
              )
            }
            placeholder="Describe the proposed solution..."
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            TECHNOLOGY
        ================================================= */}

        <div className="form-group">

          <label>
            Technology Used *
          </label>


          <textarea
            rows="4"
            value={
              technology
            }
            onChange={(e) =>
              setTechnology(
                e.target.value
              )
            }
            placeholder="Example: IoT, Sensors, React, AI"
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            EXPECTED IMPACT
        ================================================= */}

        <div className="form-group">

          <label>
            Expected Impact *
          </label>


          <textarea
            rows="5"
            value={
              impact
            }
            onChange={(e) =>
              setImpact(
                e.target.value
              )
            }
            placeholder="Describe the expected social impact..."
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            ESTIMATED COST
        ================================================= */}

        <div className="form-group">

          <label>
            Estimated Cost *
          </label>


          <input
            type="text"
            value={
              cost
            }
            onChange={(e) =>
              setCost(
                e.target.value
              )
            }
            placeholder="Example: ₹5,00,000"
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            IMPLEMENTATION APPROACH
        ================================================= */}

        <div className="form-group">

          <label>
            Implementation Approach *
          </label>


          <textarea
            rows="5"
            value={
              implementation
            }
            onChange={(e) =>
              setImplementation(
                e.target.value
              )
            }
            placeholder="Describe how the solution will be implemented..."
            disabled={
              !proposalCanBeEdited ||
              !mentorAssigned ||
              submitting
            }
          />

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="form-actions">


          <button
            className="cancel-button"
            onClick={() =>
              navigate(
                `/university/problem/${encodeURIComponent(
                  problemId
                )}`
              )
            }
            disabled={
              submitting
            }
          >
            Cancel
          </button>


          {proposalCanBeEdited && (

            <button
              className="submit-button"
              onClick={
                submitProposal
              }
              disabled={
                submitting ||
                !mentorAssigned
              }
            >

              {submitting
                ? "Submitting..."
                : proposalChangesRequested
                ? "🔄 Resubmit for Government Review"
                : "🚀 Submit Proposal"}

            </button>

          )}


          {proposalApproved && (

            <button
              className="submit-button"
              onClick={() =>
                navigate(
                  `/university/problem/${encodeURIComponent(
                    problemId
                  )}`
                )
              }
            >
              ✓ View Project Workflow
            </button>

          )}


          {proposalPendingReview && (

            <button
              className="submit-button"
              onClick={() =>
                navigate(
                  `/university/problem/${encodeURIComponent(
                    problemId
                  )}`
                )
              }
            >
              ⏳ View Project Workflow
            </button>

          )}

        </div>


      </div>

    </div>

  );

}


export default SolutionProposal;