import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { api } from "../../api";

import "./PrototypeTesting.css";


function PrototypeTesting() {

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
  PROJECT / PROBLEM / PROPOSAL STATE
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
    proposal,
    setProposal
  ] = useState(null);


  const [
    existingPrototype,
    setExistingPrototype
  ] = useState(null);


  /*
  =========================================================
  FORM STATE
  =========================================================
  */

  const [
    prototypeName,
    setPrototypeName
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  const [
    technology,
    setTechnology
  ] = useState("");


  const [
    testingResult,
    setTestingResult
  ] = useState("");


  /*
  =========================================================
  PAGE STATE
  =========================================================
  */

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
  =========================================================
  LOAD DATA
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
  LOAD EXACT PROBLEM + PROJECT + PROPOSAL + PROTOTYPE
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

        const problemResponse =
          await api(
            `/problems/${encodeURIComponent(
              problemId
            )}`
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


        /*
        =====================================================
        2. LOAD EXACT PROJECT
        =====================================================
        */

        const projectResponse =
          await api(
            `/advanced/projects/problem/${encodeURIComponent(
              problemId
            )}`
          );


        const loadedProject =
          projectResponse.project ||
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
        3. LOAD SOLUTION PROPOSAL
        =====================================================
        */

        try {

          const proposalResponse =
            await api(
              `/advanced/proposals/project/${loadedProject.id}`
            );


          if (
            proposalResponse.success
          ) {

            const proposals =
              proposalResponse.proposals ||
              [];


            if (
              proposals.length > 0
            ) {

              setProposal(
                proposals[0]
              );

            }

          }

        } catch (proposalError) {

          console.warn(
            "Proposal loading warning:",
            proposalError.message
          );

          setProposal(null);

        }


        /*
        =====================================================
        4. LOAD EXISTING PROTOTYPE TEST
        =====================================================
        */

        try {

          const prototypeResponse =
            await api(
              `/advanced/projects/${loadedProject.id}/prototype-tests`
            );


          if (
            prototypeResponse.success
          ) {

            const tests =
              prototypeResponse.tests ||
              [];


            if (
              tests.length > 0
            ) {

              /*
              * The backend returns the newest
              * prototype test first.
              */

              const savedPrototype =
                tests[0];


              setExistingPrototype(
                savedPrototype
              );


              /*
              -------------------------------------------------
              LOAD EXISTING VALUES INTO FORM
              -------------------------------------------------
              */

              setPrototypeName(
                savedPrototype.testName ||
                ""
              );


              setDescription(
                savedPrototype.findings ||
                ""
              );


              setTechnology(
                savedPrototype.evidenceUrl ||
                ""
              );


              setTestingResult(
                savedPrototype.result ||
                ""
              );

            }

          }

        } catch (prototypeError) {

          console.warn(
            "Prototype loading warning:",
            prototypeError.message
          );

          setExistingPrototype(
            null
          );

        }

      } catch (loadError) {

        console.error(
          "Load prototype data error:",
          loadError
        );


        setError(
          loadError.message ||
          "Unable to load prototype information."
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

  const prototypeReviewStatus =
    existingPrototype?.governmentReviewStatus ||
    "";


  const prototypeReviewComment =
    existingPrototype?.governmentReviewComment ||
    "";


  /*
  =========================================================
  GOVERNMENT REVIEW STATE
  =========================================================

  NEW PROTOTYPE
      ↓
  Editable

  PENDING GOVERNMENT REVIEW
      ↓
  Locked

  GOVERNMENT APPROVED
      ↓
  Locked

  CHANGES REQUESTED
      ↓
  Editable
  =========================================================
  */

  const prototypeChangesRequested =
    prototypeReviewStatus ===
    "Changes Requested";


  const prototypeApproved =
    prototypeReviewStatus ===
    "Approved";


  const prototypePendingReview =
    Boolean(
      existingPrototype
    ) &&
    !prototypeChangesRequested &&
    !prototypeApproved;


  const prototypeCanBeEdited =
    !existingPrototype ||
    prototypeChangesRequested;


  /*
  =========================================================
  SUBMIT / RESUBMIT PROTOTYPE
  =========================================================
  */

  const submitPrototype =
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
      PROPOSAL MUST EXIST FIRST
      -------------------------------------------------------
      */

      if (!proposal) {

        alert(
          "Please submit the Solution Proposal before submitting the prototype."
        );

        return;

      }


      /*
      -------------------------------------------------------
      PROPOSAL MUST BE GOVERNMENT APPROVED
      -------------------------------------------------------

      Prototype must not bypass Government approval
      of the Solution Proposal.
      -------------------------------------------------------
      */

      if (
        proposal.governmentReviewStatus !==
        "Approved"
      ) {

        alert(
          "Government must approve the Solution Proposal before submitting the prototype."
        );

        return;

      }


      /*
      -------------------------------------------------------
      PREVENT SUBMISSION WHEN LOCKED
      -------------------------------------------------------
      */

      if (
        existingPrototype &&
        !prototypeCanBeEdited
      ) {

        alert(
          prototypeApproved
            ? "This prototype has already been approved by the Government."
            : "This prototype is currently waiting for Government review."
        );

        return;

      }


      /*
      -------------------------------------------------------
      VALIDATE FORM
      -------------------------------------------------------
      */

      if (
        !prototypeName.trim() ||
        !description.trim() ||
        !technology.trim() ||
        !testingResult.trim()
      ) {

        alert(
          "Please fill all fields."
        );

        return;

      }


      try {

        setSubmitting(true);


        /*
        =====================================================
        DATABASE MAPPING

        PrototypeTest model:

        projectId
        testName
        testDate
        sampleSize
        result
        findings
        evidenceUrl

        UI:

        Prototype Name
              ↓
        testName

        Description
              ↓
        findings

        Technology
              ↓
        evidenceUrl

        Testing Result
              ↓
        result
        =====================================================
        */

        const response =
          await api(
            `/advanced/projects/${project.id}/prototype-tests`,
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  testName:
                    prototypeName.trim(),

                  testDate:
                    new Date()
                      .toISOString(),

                  sampleSize:
                    0,

                  result:
                    testingResult.trim(),

                  findings:
                    `${description.trim()}\n\nTechnology Used:\n${technology.trim()}`,

                  evidenceUrl:
                    technology.trim()

                })

            }
          );


        /*
        -----------------------------------------------------
        CHECK BACKEND RESPONSE
        -----------------------------------------------------
        */

        if (
          !response.success
        ) {

          throw new Error(
            response.message ||
            "Unable to submit prototype."
          );

        }


        /*
        -----------------------------------------------------
        SUCCESS
        -----------------------------------------------------
        */

        alert(
          prototypeChangesRequested
            ? "Prototype resubmitted successfully for Government review!"
            : "Prototype submitted successfully!"
        );


        /*
        -----------------------------------------------------
        RETURN TO EXACT CHALLENGE
        -----------------------------------------------------
        */

        navigate(
          `/university/problem/${encodeURIComponent(
            problemId
          )}`
        );

      } catch (submitError) {

        console.error(
          "Prototype submission error:",
          submitError
        );


        alert(
          submitError.message ||
          "Unable to submit prototype."
        );

      } finally {

        setSubmitting(false);

      }

    };


  /*
  =========================================================
  NO PROBLEM SELECTED
  =========================================================
  */

  if (!problemId) {

    return (

      <div className="prototype-page">

        <div className="prototype-header">

          <div>

            <h1>
              Prototype & Testing
            </h1>


            <p>
              Build, test and validate your proposed solution.
            </p>

          </div>

        </div>


        <div className="prototype-card">

          <h2>
            Challenge Not Selected
          </h2>


          <p className="subtitle">

            Please open Prototype & Testing
            from a specific assigned challenge.

          </p>


          <div className="form-actions">

            <button
              className="back-button"
              onClick={() =>
                navigate(
                  "/university"
                )
              }
            >
              ← Back to Dashboard
            </button>

          </div>

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

      <div className="prototype-page">

        <div className="prototype-header">

          <div>

            <h1>
              Prototype & Testing
            </h1>


            <p>
              Loading project information...
            </p>

          </div>

        </div>


        <div className="prototype-card">

          <h2>
            Loading...
          </h2>


          <p className="subtitle">

            Loading the challenge,
            project and prototype information
            from MySQL.

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

      <div className="prototype-page">

        <div className="prototype-header">

          <div>

            <h1>
              Prototype & Testing
            </h1>


            <p>
              Unable to load project information.
            </p>

          </div>


          <button
            className="back-button"
            onClick={() =>
              navigate(
                `/university/problem/${encodeURIComponent(
                  problemId
                )}`
              )
            }
          >
            ← Back to Challenge
          </button>

        </div>


        <div className="prototype-card">

          <h2>
            Unable to Load Challenge
          </h2>


          <p className="subtitle">

            {error ||
              "Project information is unavailable."}

          </p>


          <div className="form-actions">

            <button
              className="back-button"
              onClick={() =>
                navigate(
                  "/university"
                )
              }
            >
              ← Back to Dashboard
            </button>

          </div>

        </div>

      </div>

    );

  }


  /*
  =========================================================
  MAIN PAGE
  =========================================================
  */

  return (

    <div className="prototype-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="prototype-header">

        <div>

          <h1>
            Prototype & Testing
          </h1>


          <p>
            Build, test and validate your proposed solution.
          </p>

        </div>


        <button
          className="back-button"
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
          ← Back to Challenge
        </button>

      </div>


      {/* ===================================================
          CARD
      =================================================== */}

      <div className="prototype-card">


        {/* =================================================
            CHALLENGE INFORMATION
        ================================================= */}

        <h2>
          Challenge Information
        </h2>


        <div
          className="subtitle"
          style={{
            marginBottom:
              "24px"
          }}
        >

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


        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap:
              "20px",
            marginBottom:
              "24px"
          }}
        >

          <div>

            <span
              style={{
                display:
                  "block",
                fontSize:
                  "13px",
                color:
                  "#64748b",
                marginBottom:
                  "5px"
              }}
            >
              Challenge ID
            </span>


            <strong>
              {problemId}
            </strong>

          </div>


          <div>

            <span
              style={{
                display:
                  "block",
                fontSize:
                  "13px",
                color:
                  "#64748b",
                marginBottom:
                  "5px"
              }}
            >
              Project ID
            </span>


            <strong>
              {project.id}
            </strong>

          </div>

        </div>


        {/* =================================================
            PROPOSAL STATUS
        ================================================= */}

        <h2>
          Solution Proposal
        </h2>


        {proposal ? (

          <div
            style={{
              padding:
                "14px 16px",
              border:
                proposal.governmentReviewStatus === "Approved"
                  ? "1px solid #b7dfbd"
                  : proposal.governmentReviewStatus === "Changes Requested"
                  ? "1px solid #f0c36d"
                  : "1px solid #bfdbfe",
              background:
                proposal.governmentReviewStatus === "Approved"
                  ? "#effaf1"
                  : proposal.governmentReviewStatus === "Changes Requested"
                  ? "#fff8e8"
                  : "#eff6ff",
              borderRadius:
                "10px",
              marginBottom:
                "24px"
            }}
          >

            <strong>

              {proposal.governmentReviewStatus === "Approved"
                ? "✓ Solution Proposal Approved"
                : proposal.governmentReviewStatus === "Changes Requested"
                ? "⚠ Solution Proposal Changes Requested"
                : "⏳ Solution Proposal Pending Government Review"}

            </strong>


            <p
              style={{
                margin:
                  "6px 0 0"
              }}
            >

              {proposal.title}

            </p>


            {proposal.governmentReviewComment && (

              <div
                style={{
                  marginTop:
                    "10px",
                  padding:
                    "10px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #dce3ef",
                  borderRadius:
                    "7px"
                }}
              >

                <strong>
                  Government Comment:
                </strong>


                <p
                  style={{
                    margin:
                      "5px 0 0",
                    whiteSpace:
                      "pre-wrap"
                  }}
                >
                  {proposal.governmentReviewComment}
                </p>

              </div>

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
              ⚠ Solution Proposal Required
            </strong>


            <p
              style={{
                margin:
                  "6px 0 0"
              }}
            >
              Please submit the Solution Proposal
              before starting prototype testing.
            </p>

          </div>

        )}


        {/* =================================================
            GOVERNMENT PROTOTYPE REVIEW STATUS
        ================================================= */}

        {prototypeChangesRequested && (

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
              Prototype & Testing submission and
              requested changes. You can edit the
              existing prototype below and resubmit it
              for Government review.
            </p>


            {prototypeReviewComment && (

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
                  {prototypeReviewComment}
                </p>

              </div>

            )}

          </div>

        )}


        {prototypePendingReview && (

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
              Your Prototype & Testing submission has
              been submitted and is currently waiting
              for Government approval. The prototype
              cannot be edited until Government completes
              its review.
            </p>

          </div>

        )}


        {prototypeApproved && (

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
              ✓ Prototype Approved
            </strong>


            <p
              style={{
                margin:
                  "7px 0 0"
              }}
            >
              The Government has approved this
              Prototype & Testing submission. It is now
              locked and the project can proceed to
              the next workflow stage.
            </p>


            {prototypeReviewComment && (

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
                  {prototypeReviewComment}
                </p>

              </div>

            )}

          </div>

        )}


        {/* =================================================
            EXISTING PROTOTYPE
        ================================================= */}

        {existingPrototype &&
          !prototypeChangesRequested &&
          !prototypePendingReview &&
          !prototypeApproved && (

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
                Prototype Submitted
              </strong>

            </div>

        )}


        {/* =================================================
            PROTOTYPE INFORMATION
        ================================================= */}

        <h2>
          {prototypeChangesRequested
            ? "Edit Prototype & Testing"
            : "Prototype Information"}
        </h2>


        {prototypeChangesRequested && (

          <p
            className="subtitle"
            style={{
              marginBottom:
                "20px"
            }}
          >
            Update the requested fields below and
            resubmit the prototype for Government review.
          </p>

        )}


        {!prototypeChangesRequested && (

          <p className="subtitle">

            Provide details about the prototype developed
            for the societal challenge.

          </p>

        )}


        {/* =================================================
            PROTOTYPE NAME
        ================================================= */}

        <div className="form-group">

          <label>
            Prototype Name *
          </label>


          <input
            id="prototypeName"
            type="text"
            value={
              prototypeName
            }
            onChange={(e) =>
              setPrototypeName(
                e.target.value
              )
            }
            placeholder="Example: Smart Dengue Risk Monitoring System"
            disabled={
              !prototypeCanBeEdited ||
              !proposal ||
              proposal.governmentReviewStatus !== "Approved" ||
              submitting
            }
          />

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="form-group">

          <label>
            Prototype Description *
          </label>


          <textarea
            id="description"
            rows="5"
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Describe your prototype and how it works..."
            disabled={
              !prototypeCanBeEdited ||
              !proposal ||
              proposal.governmentReviewStatus !== "Approved" ||
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


          <input
            id="technology"
            type="text"
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
              !prototypeCanBeEdited ||
              !proposal ||
              proposal.governmentReviewStatus !== "Approved" ||
              submitting
            }
          />

        </div>


        {/* =================================================
            TESTING RESULT
        ================================================= */}

        <div className="form-group">

          <label>
            Testing Result *
          </label>


          <textarea
            id="testingResult"
            rows="5"
            value={
              testingResult
            }
            onChange={(e) =>
              setTestingResult(
                e.target.value
              )
            }
            placeholder="Describe the testing performed and the results..."
            disabled={
              !prototypeCanBeEdited ||
              !proposal ||
              proposal.governmentReviewStatus !== "Approved" ||
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


          {prototypeCanBeEdited && (

            <button
              className="submit-button"
              onClick={
                submitPrototype
              }
              disabled={
                submitting ||
                !proposal ||
                proposal.governmentReviewStatus !== "Approved"
              }
            >

              {submitting
                ? "Submitting..."
                : prototypeChangesRequested
                ? "🔄 Resubmit for Government Review"
                : "🚀 Submit Prototype"}

            </button>

          )}


          {prototypeApproved && (

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


          {prototypePendingReview && (

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


export default PrototypeTesting;