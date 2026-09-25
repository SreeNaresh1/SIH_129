import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { api } from "../../api";

import "./Implementation.css";


function Implementation() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  /*
  =========================================================
  EXACT PROBLEM ID
  =========================================================
  */

  const problemId =
    searchParams.get("problemId");


  /*
  =========================================================
  DATABASE DATA
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
    existingImplementation,
    setExistingImplementation
  ] = useState(null);


  /*
  =========================================================
  FORM DATA
  =========================================================
  */

  const [
    implementationTitle,
    setImplementationTitle
  ] = useState("");


  const [
    activities,
    setActivities
  ] = useState("");


  const [
    resources,
    setResources
  ] = useState("");


  const [
    timeline,
    setTimeline
  ] = useState("");


  const [
    location,
    setLocation
  ] = useState("");


  const [
    beneficiaries,
    setBeneficiaries
  ] = useState("");


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
  SUBMITTING
  =========================================================
  */

  const [
    submitting,
    setSubmitting
  ] = useState(false);


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
  LOAD IMPLEMENTATION DATA
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
  LOAD DATA
  =========================================================
  */

  const loadData =
    async () => {

      try {

        setLoading(true);

        setError("");


        /*
        =====================================================
        01. LOAD EXACT PROBLEM
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
        02. LOAD EXACT PROJECT
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
        03. LOAD EXISTING IMPLEMENTATION
        =====================================================
        */

        try {

          const implementationResponse =
            await api(
              `/advanced/implementations/project/${loadedProject.id}`
            );


          const savedImplementation =
            implementationResponse.implementation ||
            null;


          setExistingImplementation(
            savedImplementation
          );


          /*
          ===================================================
          LOAD EXISTING VALUES INTO FORM
          ===================================================
          */

          if (
            savedImplementation
          ) {

            const plan =
              savedImplementation.plan ||
              "";


            /*
            -------------------------------------------------
            READ IMPLEMENTATION TITLE
            -------------------------------------------------
            */

            const titleMatch =
              plan.match(
                /Implementation Title:\s*([\s\S]*?)(?:\n\nImplementation Activities:|$)/
              );


            /*
            -------------------------------------------------
            READ ACTIVITIES
            -------------------------------------------------
            */

            const activitiesMatch =
              plan.match(
                /Implementation Activities:\s*([\s\S]*?)(?:\n\nResources Required:|$)/
              );


            /*
            -------------------------------------------------
            READ RESOURCES
            -------------------------------------------------
            */

            const resourcesMatch =
              plan.match(
                /Resources Required:\s*([\s\S]*?)(?:\n\nImplementation Timeline:|$)/
              );


            /*
            -------------------------------------------------
            READ TIMELINE
            -------------------------------------------------
            */

            const timelineMatch =
              plan.match(
                /Implementation Timeline:\s*([\s\S]*?)(?:\n\n|$)/
              );


            if (
              titleMatch
            ) {

              setImplementationTitle(
                titleMatch[1].trim()
              );

            }


            if (
              activitiesMatch
            ) {

              setActivities(
                activitiesMatch[1].trim()
              );

            }


            if (
              resourcesMatch
            ) {

              setResources(
                resourcesMatch[1].trim()
              );

            }


            if (
              timelineMatch
            ) {

              setTimeline(
                timelineMatch[1].trim()
              );

            }


            /*
            -------------------------------------------------
            LOCATION
            -------------------------------------------------
            */

            setLocation(
              savedImplementation.location ||
              ""
            );


            /*
            -------------------------------------------------
            BENEFICIARIES
            -------------------------------------------------
            */

            setBeneficiaries(
              savedImplementation.beneficiaries !==
                null &&
              savedImplementation.beneficiaries !==
                undefined
                ? String(
                    savedImplementation.beneficiaries
                  )
                : ""
            );

          }

        } catch (
          implementationLoadError
        ) {

          /*
          ---------------------------------------------------
          404 means no implementation has been submitted yet.
          ---------------------------------------------------
          */

          console.log(
            "No existing implementation found:",
            implementationLoadError.message
          );


          setExistingImplementation(
            null
          );

        }

      } catch (loadError) {

        console.error(
          "Implementation load error:",
          loadError
        );


        setError(
          loadError.message ||
          "Unable to load implementation data."
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

  const implementationReviewStatus =
    existingImplementation?.governmentReviewStatus ||
    "";


  const implementationReviewComment =
    existingImplementation?.governmentReviewComment ||
    "";


  /*
  =========================================================
  REVIEW STATES
  =========================================================
  */

  const implementationChangesRequested =
    implementationReviewStatus ===
    "Changes Requested";


  const implementationApproved =
    implementationReviewStatus ===
    "Approved";


  const implementationPendingReview =
    Boolean(
      existingImplementation
    ) &&
    !implementationChangesRequested &&
    !implementationApproved;


  /*
  =========================================================
  EDIT PERMISSION
  =========================================================

  New implementation:
      EDITABLE

  Changes Requested:
      EDITABLE

  Pending Government Review:
      LOCKED

  Government Approved:
      LOCKED
  =========================================================
  */

  const implementationCanBeEdited =
    !existingImplementation ||
    implementationChangesRequested;


  /*
  =========================================================
  SUBMIT / RESUBMIT IMPLEMENTATION
  =========================================================
  */

  const submitImplementation =
    async () => {

      /*
      =====================================================
      VALIDATION
      =====================================================
      */

      if (
        !problemId ||
        !project ||
        !implementationTitle.trim() ||
        !activities.trim() ||
        !resources.trim() ||
        !timeline.trim() ||
        !location.trim() ||
        !beneficiaries.trim()
      ) {

        alert(
          "Please fill all fields."
        );

        return;

      }


      /*
      =====================================================
      PREVENT SUBMISSION WHEN LOCKED
      =====================================================
      */

      if (
        existingImplementation &&
        !implementationCanBeEdited
      ) {

        alert(
          implementationApproved
            ? "This Implementation Plan has already been approved by the Government."
            : "This Implementation Plan is currently waiting for Government review."
        );

        return;

      }


      /*
      =====================================================
      BENEFICIARY NUMBER
      =====================================================
      */

      const beneficiaryNumber =
        Number(
          String(
            beneficiaries
          ).replace(
            /[^0-9]/g,
            ""
          )
        );


      if (
        !beneficiaryNumber ||
        beneficiaryNumber <= 0
      ) {

        alert(
          "Please enter a valid number of beneficiaries."
        );

        return;

      }


      try {

        setSubmitting(true);


        /*
        =====================================================
        DATABASE PLAN

        The Implementation table stores the main
        implementation information in the TEXT field:

        plan

        The review fields are stored separately by
        the backend:

        governmentReviewStatus
        governmentReviewComment
        governmentReviewedBy
        governmentReviewedAt
        =====================================================
        */

        const plan =

`Implementation Title:
${implementationTitle.trim()}

Implementation Activities:
${activities.trim()}

Resources Required:
${resources.trim()}

Implementation Timeline:
${timeline.trim()}`;


        /*
        =====================================================
        SUBMIT / RESUBMIT TO MYSQL
        =====================================================

        The backend is responsible for:

        - finding the existing implementation
        - updating it
        - resetting Government review status
        - setting the status back to submitted
        =====================================================
        */

        const response =
          await api(
            `/advanced/implementations/project/${project.id}`,
            {

              method:
                "POST",

              body:
                JSON.stringify({

                  plan,

                  location:
                    location.trim(),

                  beneficiaries:
                    beneficiaryNumber,

                  startDate:
                    new Date().toISOString(),

                  status:
                    "Implementation Plan Submitted"

                })

            }
          );


        /*
        =====================================================
        CHECK RESPONSE
        =====================================================
        */

        if (
          response &&
          response.success === false
        ) {

          throw new Error(
            response.message ||
            "Unable to submit implementation plan."
          );

        }


        /*
        =====================================================
        SUCCESS
        =====================================================
        */

        alert(
          implementationChangesRequested
            ? "Implementation plan resubmitted successfully for Government review!"
            : "Implementation plan submitted successfully!"
        );


        /*
        =====================================================
        RETURN TO EXACT CHALLENGE
        =====================================================
        */

        navigate(
          `/university/problem/${encodeURIComponent(
            problemId
          )}`
        );

      } catch (submitError) {

        console.error(
          "Implementation submission error:",
          submitError
        );


        alert(
          submitError.message ||
          "Unable to submit implementation plan."
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

      <div className="implementation-page">

        <div className="implementation-card">

          <h2>
            Challenge not selected
          </h2>


          <p>
            Open the implementation plan
            from a specific assigned challenge.
          </p>


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

    );

  }


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <div className="implementation-page">

        <div className="implementation-card">

          <h2>
            Loading Implementation...
          </h2>


          <p>
            Loading the project information
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

      <div className="implementation-page">

        <div className="implementation-card">

          <h2>
            Unable to Load Implementation
          </h2>


          <p>
            {error ||
              "Project information is unavailable."}
          </p>


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

      </div>

    );

  }


  /*
  =========================================================
  MAIN UI
  =========================================================
  */

  return (

    <div className="implementation-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="implementation-header">

        <div>

          <h1>
            Implementation Plan
          </h1>


          <p>
            Plan and execute the approved solution
            for the societal challenge.
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
          GOVERNMENT REVIEW STATUS
      =================================================== */}

      {implementationChangesRequested && (

        <div
          className="implementation-success"
          style={{
            background:
              "#fff8e8",
            border:
              "1px solid #f0c36d",
            color:
              "#8a5a00"
          }}
        >

          <h2>
            ⚠ Changes Requested by Government
          </h2>


          <p>

            The Government has reviewed your
            Implementation Plan and requested changes.
            The existing implementation data has been
            loaded below so you can edit it and resubmit.

          </p>


          {implementationReviewComment && (

            <div
              style={{
                marginTop:
                  "14px",
                padding:
                  "14px",
                background:
                  "#ffffff",
                border:
                  "1px solid #ead7a1",
                borderRadius:
                  "8px",
                color:
                  "#475569"
              }}
            >

              <strong>
                Government Comment:
              </strong>


              <p
                style={{
                  margin:
                    "7px 0 0",
                  whiteSpace:
                    "pre-wrap"
                }}
              >
                {implementationReviewComment}
              </p>

            </div>

          )}

        </div>

      )}


      {implementationPendingReview && (

        <div
          className="implementation-success"
          style={{
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            color:
              "#1d4ed8"
          }}
        >

          <h2>
            ⏳ Waiting for Government Review
          </h2>


          <p>

            Your Implementation Plan has been
            submitted and is currently waiting
            for Government approval.

            <br />

            The Implementation Plan cannot be
            edited until Government completes
            its review.

          </p>

        </div>

      )}


      {implementationApproved && (

        <div
          className="implementation-success"
        >

          <h2>
            ✓ Implementation Plan Approved
          </h2>


          <p>

            The Government has approved your
            Implementation Plan. It is now locked
            and the project can proceed to
            implementation.

          </p>


          {implementationReviewComment && (

            <div
              style={{
                marginTop:
                  "14px",
                padding:
                  "14px",
                background:
                  "#ffffff",
                border:
                  "1px solid #cce8d2",
                borderRadius:
                  "8px",
                color:
                  "#475569"
              }}
            >

              <strong>
                Government Comment:
              </strong>


              <p
                style={{
                  margin:
                    "7px 0 0",
                  whiteSpace:
                    "pre-wrap"
                }}
              >
                {implementationReviewComment}
              </p>

            </div>

          )}

        </div>

      )}


      {/* ===================================================
          NEW IMPLEMENTATION
      =================================================== */}

      {!existingImplementation && (

        <div className="implementation-success">

          <h2>
            ✓ Project Approved
          </h2>


          <p>

            The Government has approved your
            project. You can now prepare and
            submit the implementation plan.

          </p>

        </div>

      )}


      {/* ===================================================
          CHALLENGE INFORMATION
      =================================================== */}

      {problem && (

        <div className="implementation-card">

          <h2>
            Challenge Information
          </h2>


          <div
            className="implementation-challenge-info"
          >

            <div>

              <span>
                Challenge
              </span>


              <strong>
                {problem.title}
              </strong>

            </div>


            <div>

              <span>
                Challenge ID
              </span>


              <strong>
                {problem.problemId ||
                  problemId}
              </strong>

            </div>


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
                Domain
              </span>


              <strong>
                {problem.domain}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ===================================================
          IMPLEMENTATION FORM
      =================================================== */}

      <div className="implementation-card">


        <h2>

          {implementationChangesRequested
            ? "Edit Implementation Plan"
            : "Implementation Information"}

        </h2>


        <p className="subtitle">

          {implementationChangesRequested
            ? "Update the requested fields and resubmit the Implementation Plan for Government review."
            : "Provide the details required to implement the approved solution."}

        </p>


        {/* =================================================
            EXISTING IMPLEMENTATION STATUS
        ================================================= */}

        {existingImplementation &&
          !implementationChangesRequested &&
          !implementationPendingReview &&
          !implementationApproved && (

            <div className="implementation-existing">

              <strong>
                Implementation Plan Submitted
              </strong>


              <p>
                The Implementation Plan has been
                submitted for Government review.
              </p>

            </div>

        )}


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="form-group">

          <label>
            Implementation Title *
          </label>


          <input
            type="text"
            value={
              implementationTitle
            }
            onChange={(e) =>
              setImplementationTitle(
                e.target.value
              )
            }
            placeholder="Example: Smart Dengue Prevention System Deployment"
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />

        </div>


        {/* =================================================
            ACTIVITIES
        ================================================= */}

        <div className="form-group">

          <label>
            Implementation Activities *
          </label>


          <textarea
            rows="6"
            value={
              activities
            }
            onChange={(e) =>
              setActivities(
                e.target.value
              )
            }
            placeholder="Describe the activities required to implement the solution..."
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />

        </div>


        {/* =================================================
            RESOURCES
        ================================================= */}

        <div className="form-group">

          <label>
            Resources Required *
          </label>


          <textarea
            rows="5"
            value={
              resources
            }
            onChange={(e) =>
              setResources(
                e.target.value
              )
            }
            placeholder="List equipment, materials, people and other resources required..."
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />

        </div>


        {/* =================================================
            TIMELINE
        ================================================= */}

        <div className="form-group">

          <label>
            Implementation Timeline *
          </label>


          <input
            type="text"
            value={
              timeline
            }
            onChange={(e) =>
              setTimeline(
                e.target.value
              )
            }
            placeholder="Example: 3 months"
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />

        </div>


        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="form-group">

          <label>
            Deployment Location *
          </label>


          <input
            type="text"
            value={
              location
            }
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
            placeholder="Example: Khunti district, affected residential areas"
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />

        </div>


        {/* =================================================
            BENEFICIARIES
        ================================================= */}

        <div className="form-group">

          <label>
            Expected Beneficiaries *
          </label>


          <input
            type="text"
            value={
              beneficiaries
            }
            onChange={(e) =>
              setBeneficiaries(
                e.target.value
              )
            }
            placeholder="Example: 1000"
            disabled={
              !implementationCanBeEdited ||
              submitting
            }
          />


          <small>
            Enter the number of people expected
            to benefit from the implementation.
          </small>

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


          {implementationCanBeEdited && (

            <button
              className="submit-button"
              onClick={
                submitImplementation
              }
              disabled={
                submitting
              }
            >

              {submitting
                ? "Submitting..."
                : implementationChangesRequested
                ? "🔄 Resubmit for Government Review"
                : "🚀 Submit Implementation Plan"}

            </button>

          )}


          {implementationPendingReview && (

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


          {implementationApproved && (

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

        </div>


      </div>


    </div>

  );

}


export default Implementation;