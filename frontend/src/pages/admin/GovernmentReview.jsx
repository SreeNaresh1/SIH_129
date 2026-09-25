import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import "./GovernmentReview.css";

function GovernmentReview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const challengeId = id;

  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [problem, setProblem] = useState(null);
  const [project, setProject] = useState(null);

  const [proposal, setProposal] = useState(null);
  const [prototype, setPrototype] = useState(null);
  const [team, setTeam] = useState(null);
  const [mentor, setMentor] = useState(null);

  const [implementation, setImplementation] = useState(null);

  // =====================================================
  // INDUSTRY IMPLEMENTATION PROPOSAL
  // =====================================================

  const [industryProposal, setIndustryProposal] = useState(null);

  const [industryReviewComment, setIndustryReviewComment] =
    useState("");

  const [industryReviewStatus, setIndustryReviewStatus] =
    useState("");

  const [industryReviewMessage, setIndustryReviewMessage] =
    useState("");

  const [industryReviewError, setIndustryReviewError] =
    useState("");

  const [submittingIndustryReview, setSubmittingIndustryReview] =
    useState(false);

  // =====================================================
  // UNIVERSITY IMPLEMENTATION REVIEW
  // =====================================================

  const [
    implementationReviewComment,
    setImplementationReviewComment,
  ] = useState("");

  const [
    implementationReviewStatus,
    setImplementationReviewStatus,
  ] = useState("");

  const [
    implementationReviewMessage,
    setImplementationReviewMessage,
  ] = useState("");

  const [
    implementationReviewError,
    setImplementationReviewError,
  ] = useState("");

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    loadGovernmentReviewData();
  }, [challengeId]);

  // =====================================================
  // LOAD ALL GOVERNMENT REVIEW DATA
  // =====================================================

  const loadGovernmentReviewData = async () => {
    try {
      setLoading(true);

      setImplementationReviewError("");
      setImplementationReviewMessage("");

      setIndustryReviewError("");
      setIndustryReviewMessage("");

      // =================================================
      // 1. LOAD CITIZEN PROBLEM
      // =================================================

      const problemResponse = await api(
        `/problems/${encodeURIComponent(challengeId)}`
      );

      const loadedProblem =
        problemResponse?.problem ||
        problemResponse?.data?.problem ||
        null;

      if (!loadedProblem) {
        throw new Error("Challenge not found.");
      }

      setProblem(loadedProblem);

      // =================================================
      // 2. LOAD PROJECT
      // =================================================

      let loadedProject = null;

      try {
        const projectResponse = await api(
          `/advanced/projects/problem/${encodeURIComponent(
            challengeId
          )}`
        );

        loadedProject =
          projectResponse?.project ||
          projectResponse?.data?.project ||
          null;
      } catch (error) {
        console.error(
          "Project loading error:",
          error
        );
      }

      setProject(loadedProject);

      if (!loadedProject) {
        setLoading(false);
        return;
      }

      // =================================================
      // 3. LOAD ALL PROPOSALS
      // =================================================

      let allProposals = [];

      try {
        const proposalResponse = await api(
          `/advanced/proposals/project/${loadedProject.id}`
        );

        if (Array.isArray(proposalResponse?.proposals)) {
          allProposals = proposalResponse.proposals;
        } else if (
          Array.isArray(proposalResponse?.data?.proposals)
        ) {
          allProposals =
            proposalResponse.data.proposals;
        } else if (proposalResponse?.proposal) {
          allProposals = [
            proposalResponse.proposal,
          ];
        } else if (
          proposalResponse?.data?.proposal
        ) {
          allProposals = [
            proposalResponse.data.proposal,
          ];
        }
      } catch (error) {
        console.log(
          "Proposal list loading information not available:",
          error.message
        );
      }

      // =================================================
      // 4. FIND UNIVERSITY PROPOSAL
      // =================================================

      const universityProposals =
        allProposals.filter(
          (item) =>
            item?.submittedByRole ===
              "university" ||
            !item?.submittedByRole
        );

      let loadedUniversityProposal =
        universityProposals.length > 0
          ? universityProposals[
              universityProposals.length - 1
            ]
          : null;

      /*
       * If the endpoint returned a single proposal
       * that is explicitly University submitted,
       * keep it.
       */

      if (
        !loadedUniversityProposal &&
        allProposals.length === 1 &&
        allProposals[0]?.submittedByRole !==
          "industry"
      ) {
        loadedUniversityProposal =
          allProposals[0];
      }

      setProposal(
        loadedUniversityProposal
      );

      // =================================================
      // 5. FIND INDUSTRY PROPOSAL
      // =================================================

      const industryProposals =
        allProposals.filter(
          (item) =>
            item?.submittedByRole ===
            "industry"
        );

      let loadedIndustryProposal =
        industryProposals.length > 0
          ? industryProposals[
              industryProposals.length - 1
            ]
          : null;

      // =================================================
      // 6. IF INDUSTRY PROPOSAL EXISTS,
      //    LOAD THE FULL GOVERNMENT REVIEW RECORD
      // =================================================

      if (loadedIndustryProposal?.id) {
        try {
          const industryReviewResponse =
            await api(
              `/advanced/government/industry-proposals/${loadedIndustryProposal.id}/review`
            );

          const fullIndustryProposal =
            industryReviewResponse?.proposal ||
            industryReviewResponse?.data?.proposal ||
            null;

          if (fullIndustryProposal) {
            loadedIndustryProposal =
              fullIndustryProposal;
          }
        } catch (industryReviewError) {
          console.log(
            "Full Industry Government review information not available:",
            industryReviewError.message
          );
        }
      }

      // =================================================
      // 7. SET INDUSTRY PROPOSAL
      // =================================================

      setIndustryProposal(
        loadedIndustryProposal
      );

      if (loadedIndustryProposal) {
        setIndustryReviewStatus(
          loadedIndustryProposal
            .governmentReviewStatus ||
            ""
        );

        setIndustryReviewComment(
          loadedIndustryProposal
            .governmentReviewComment ||
            ""
        );
      } else {
        setIndustryReviewStatus("");
        setIndustryReviewComment("");
      }

      // =================================================
      // 8. LOAD PROTOTYPE
      // =================================================

      try {
        const prototypeResponse = await api(
          `/advanced/prototype-tests/project/${loadedProject.id}`
        );

        const loadedPrototype =
          prototypeResponse?.prototype ||
          prototypeResponse?.prototypeTest ||
          prototypeResponse?.data?.prototype ||
          prototypeResponse?.data?.prototypeTest ||
          null;

        setPrototype(
          loadedPrototype
        );
      } catch (error) {
        console.log(
          "No prototype found:",
          error.message
        );

        setPrototype(null);
      }

      // =================================================
      // 9. LOAD UNIVERSITY IMPLEMENTATION
      // =================================================

      try {
        const implementationResponse =
          await api(
            `/advanced/implementations/project/${loadedProject.id}`
          );

        let loadedImplementation =
          implementationResponse?.implementation ||
          implementationResponse?.data?.implementation ||
          null;

        if (loadedImplementation?.id) {
          try {
            const reviewResponse =
              await api(
                `/advanced/government/implementations/${loadedImplementation.id}/review`
              );

            const reviewImplementation =
              reviewResponse?.implementation ||
              reviewResponse?.data?.implementation ||
              null;

            if (reviewImplementation) {
              loadedImplementation =
                reviewImplementation;
            }
          } catch (reviewError) {
            console.log(
              "Implementation government review information not available:",
              reviewError.message
            );
          }
        }

        setImplementation(
          loadedImplementation
        );

        if (loadedImplementation) {
          setImplementationReviewStatus(
            loadedImplementation
              .governmentReviewStatus ||
              ""
          );

          setImplementationReviewComment(
            loadedImplementation
              .governmentReviewComment ||
              ""
          );
        }
      } catch (error) {
        console.log(
          "No implementation found:",
          error.message
        );

        setImplementation(null);
      }

      // =================================================
      // 10. LOAD STUDENT TEAM
      // =================================================

      try {
        const teamResponse = await api(
          `/advanced/university/team/${encodeURIComponent(
            challengeId
          )}`
        );

        const loadedTeam =
          teamResponse?.team ||
          teamResponse?.data?.team ||
          null;

        setTeam(
          loadedTeam
        );
      } catch (error) {
        console.log(
          "Team loading information not available:",
          error.message
        );

        setTeam(null);
      }

      // =================================================
      // 11. LOAD FACULTY MENTOR
      // =================================================

      try {
        const mentorResponse =
          await api(
            `/advanced/projects/${loadedProject.id}/mentor`
          );

        const loadedMentor =
          mentorResponse?.mentor ||
          mentorResponse?.data?.mentor ||
          null;

        setMentor(
          loadedMentor
        );
      } catch (error) {
        console.log(
          "Mentor loading information not available:",
          error.message
        );

        setMentor(null);
      }
    } catch (error) {
      console.error(
        "Government review loading error:",
        error
      );

      setImplementationReviewError(
        error.message ||
          "Unable to load Government review data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PARSE IMPLEMENTATION PLAN
  // =====================================================

  const getImplementationPlanPart = (
    plan,
    label,
    nextLabels = []
  ) => {
    if (!plan) {
      return "";
    }

    const escapedLabel =
      label.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    let endingPattern = "";

    if (nextLabels.length > 0) {
      const escapedNextLabels =
        nextLabels.map((item) =>
          item.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )
        );

      endingPattern = `(?=\\n\\n(?:${escapedNextLabels.join(
        "|"
      )})|$)`;
    } else {
      endingPattern = "$";
    }

    const regex = new RegExp(
      `${escapedLabel}:\\s*([\\s\\S]*?)${endingPattern}`,
      "i"
    );

    const match =
      plan.match(regex);

    return match
      ? match[1].trim()
      : "";
  };

  // =====================================================
  // UNIVERSITY IMPLEMENTATION DETAILS
  // =====================================================

  const implementationPlan =
    implementation?.plan || "";

  const implementationTitle =
    getImplementationPlanPart(
      implementationPlan,
      "Implementation Title",
      ["Implementation Activities"]
    );

  const implementationActivities =
    getImplementationPlanPart(
      implementationPlan,
      "Implementation Activities",
      ["Resources Required"]
    );

  const implementationResources =
    getImplementationPlanPart(
      implementationPlan,
      "Resources Required",
      ["Implementation Timeline"]
    );

  const implementationTimeline =
    getImplementationPlanPart(
      implementationPlan,
      "Implementation Timeline",
      []
    );

  // =====================================================
  // INDUSTRY REVIEW STATUS
  // =====================================================

  const industryReviewStatusValue =
    industryReviewStatus || "";

  const industryProposalApproved =
    industryReviewStatusValue ===
    "Approved";

  const industryProposalChangesRequested =
    industryReviewStatusValue ===
    "Changes Requested";

  const industryProposalPending =
    !industryReviewStatusValue ||
    industryReviewStatusValue ===
      "Pending" ||
    industryReviewStatusValue ===
      "Under Review";

  // =====================================================
  // PROTOTYPE REVIEW STATUS
  // =====================================================

  const prototypeGovernmentReviewStatus =
    prototype?.governmentReviewStatus ||
    "";

  const prototypeApproved =
    prototypeGovernmentReviewStatus ===
    "Approved";

  // =====================================================
  // IMPLEMENTATION REVIEW STATUS
  // IMPORTANT:
  // This was missing in the previous code.
  // =====================================================

  const implementationApproved =
    implementationReviewStatus ===
    "Approved";

  // =====================================================
  // INDUSTRY PROPOSAL REVIEW
  // =====================================================

  const reviewIndustryProposal =
    async (decision) => {
      if (!industryProposal?.id) {
        setIndustryReviewError(
          "No Industry Implementation Proposal is available for review."
        );

        return;
      }

      if (
        decision ===
          "Changes Requested" &&
        !industryReviewComment.trim()
      ) {
        setIndustryReviewError(
          "Please enter a comment explaining the changes required."
        );

        return;
      }

      try {
        setSubmittingIndustryReview(
          true
        );

        setIndustryReviewError("");
        setIndustryReviewMessage("");

        const response =
          await api(
            `/advanced/government/industry-proposals/${industryProposal.id}/review`,
            {
              method: "POST",
              body: JSON.stringify({
                decision,
                comment:
                  industryReviewComment.trim(),
              }),
            }
          );

        const updatedProposal =
          response?.proposal ||
          response?.data?.proposal ||
          null;

        if (updatedProposal) {
          setIndustryProposal(
            updatedProposal
          );

          setIndustryReviewStatus(
            updatedProposal
              .governmentReviewStatus ||
              decision
          );

          setIndustryReviewComment(
            updatedProposal
              .governmentReviewComment ||
              ""
          );
        } else {
          setIndustryReviewStatus(
            decision
          );
        }

        if (
          decision ===
          "Approved"
        ) {
          setIndustryReviewMessage(
            "Industry Implementation Proposal approved successfully. The University can now proceed to Prototype & Testing."
          );
        } else {
          setIndustryReviewMessage(
            "Changes have been requested from Industry for the Implementation Proposal."
          );
        }

        await loadGovernmentReviewData();
      } catch (error) {
        console.error(
          "Industry proposal review error:",
          error
        );

        setIndustryReviewError(
          error.message ||
            "Unable to review the Industry Implementation Proposal."
        );
      } finally {
        setSubmittingIndustryReview(
          false
        );
      }
    };

  // =====================================================
  // UNIVERSITY IMPLEMENTATION REVIEW
  // =====================================================

  const reviewImplementation =
    async (decision) => {
      if (!implementation?.id) {
        setImplementationReviewError(
          "No implementation plan is available for review."
        );

        return;
      }

      if (!prototypeApproved) {
        setImplementationReviewError(
          "Government must approve the Prototype before the Implementation Plan can be reviewed."
        );

        return;
      }

      if (
        decision ===
          "Changes Requested" &&
        !implementationReviewComment.trim()
      ) {
        setImplementationReviewError(
          "Please enter a comment explaining the changes required."
        );

        return;
      }

      try {
        setSubmittingReview(true);

        setImplementationReviewError("");
        setImplementationReviewMessage("");

        const response =
          await api(
            `/advanced/government/implementations/${implementation.id}/review`,
            {
              method: "POST",
              body: JSON.stringify({
                decision,
                comment:
                  implementationReviewComment.trim(),
              }),
            }
          );

        const updatedImplementation =
          response?.implementation ||
          response?.data?.implementation ||
          null;

        if (updatedImplementation) {
          setImplementation(
            updatedImplementation
          );

          setImplementationReviewStatus(
            updatedImplementation
              .governmentReviewStatus ||
              decision
          );

          setImplementationReviewComment(
            updatedImplementation
              .governmentReviewComment ||
              ""
          );
        } else {
          setImplementationReviewStatus(
            decision
          );
        }

        if (
          decision ===
          "Approved"
        ) {
          setImplementationReviewMessage(
            "Implementation Plan approved successfully. The University can now proceed with implementation."
          );
        } else {
          setImplementationReviewMessage(
            "Changes have been requested from the University for the Implementation Plan."
          );
        }

        await loadGovernmentReviewData();
      } catch (error) {
        console.error(
          "Implementation review error:",
          error
        );

        setImplementationReviewError(
          error.message ||
            "Unable to submit the Implementation review."
        );
      } finally {
        setSubmittingReview(
          false
        );
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="government-review-page">
        <div className="review-card">
          <h2>
            Loading Government Review...
          </h2>

          <p>
            Loading the challenge and project
            submissions.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO CHALLENGE
  // =====================================================

  if (!challengeId) {
    return (
      <div className="government-review-page">
        <div className="review-card">
          <h2>
            Challenge not found
          </h2>

          <button
            className="back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="government-review-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="government-review-header">

        <div>
          <h1>
            Government Project Review
          </h1>

          <p>
            Review the University solution,
            Industry implementation proposal,
            prototype, and implementation plan.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* =================================================
          PROJECT WORKFLOW STATUS
      ================================================= */}

      <div
        className="review-card"
        style={{
          background: "#eff6ff",
          border:
            "1px solid #93c5fd",
        }}
      >

        <h2>
          Project Workflow
        </h2>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >

          <div>
            <strong>
              1. University Solution:
            </strong>{" "}
            {proposal?.governmentReviewStatus ||
              proposal?.status ||
              "Submitted"}
          </div>

          <div>
            <strong>
              2. Industry Assignment:
            </strong>{" "}
            {project?.industryPartnerId ||
              project?.industryPartner
              ? "Assigned"
              : "Not Assigned"}
          </div>

          <div>
            <strong>
              3. Industry Implementation:
            </strong>{" "}
            {!industryProposal
              ? "Not Submitted"
              : industryProposalApproved
              ? "Government Approved"
              : industryProposalChangesRequested
              ? "Changes Requested"
              : "Under Government Review"}
          </div>

          <div>
            <strong>
              4. Prototype & Testing:
            </strong>{" "}
            {!prototype
              ? "Not Submitted"
              : prototypeApproved
              ? "Government Approved"
              : "Under Government Review"}
          </div>

          <div>
            <strong>
              5. University Implementation:
            </strong>{" "}
            {!implementation
              ? "Not Submitted"
              : implementationApproved
              ? "Government Approved"
              : "Under Government Review"}
          </div>

        </div>

      </div>

      {/* =================================================
          CHALLENGE INFORMATION
      ================================================= */}

      <div className="review-card">

        <h2>
          Challenge Information
        </h2>

        <div className="challenge-info">

          <div>
            <span>
              Challenge ID
            </span>

            <strong>
              {problem?.problemId ||
                problem?.id ||
                challengeId}
            </strong>
          </div>

          <div>
            <span>
              Challenge
            </span>

            <strong>
              {problem?.title ||
                "Challenge"}
            </strong>
          </div>

          <div>
            <span>
              District
            </span>

            <strong>
              {problem?.district ||
                "Not specified"}
            </strong>
          </div>

          <div>
            <span>
              Domain
            </span>

            <strong>
              {problem?.domain ||
                "Not specified"}
            </strong>
          </div>

          <div>
            <span>
              Priority
            </span>

            <strong>
              {problem?.priorityLevel ||
                problem?.severity ||
                "Not specified"}
            </strong>
          </div>

          <div>
            <span>
              Assigned University
            </span>

            <strong>
              {problem?.assignedUniversity ||
                problem?.assignedUniversityName ||
                project?.universityName ||
                "Assigned University"}
            </strong>
          </div>

        </div>

        <div className="problem-description">

          <h3>
            Problem Description
          </h3>

          <p>
            {problem?.description ||
              "No problem description available."}
          </p>

        </div>

      </div>

      {/* =================================================
          UNIVERSITY TEAM
      ================================================= */}

      <div className="review-card">

        <h2>
          University Team
        </h2>

        <div className="team-review">

          <div className="info-row">

            <span>
              Student Team
            </span>

            <strong>
              {team?.name ||
                team?.teamName ||
                "Student team information not available"}
            </strong>

          </div>

          <div className="info-row">

            <span>
              Faculty Mentor
            </span>

            <strong>
              {mentor?.name ||
                mentor?.facultyName ||
                mentor?.mentorName ||
                "Faculty mentor information not available"}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          UNIVERSITY SOLUTION PROPOSAL
      ================================================= */}

      <div className="review-card">

        <div className="card-title">

          <div>

            <h2>
              Solution Proposal
            </h2>

            <p>
              Submitted by the University team.
            </p>

          </div>

          {proposal && (
            <span className="completed-badge">
              ✓ Submitted
            </span>
          )}

        </div>

        {proposal ? (

          <div className="proposal-content">

            <div className="detail-box">

              <span>
                Solution Title
              </span>

              <strong>
                {proposal.title ||
                  proposal.solutionTitle ||
                  "Solution Proposal"}
              </strong>

            </div>

            <div className="detail-box">

              <span>
                Proposed Solution
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {proposal.solution ||
                  "No solution description available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Methodology
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {proposal.methodology ||
                  proposal.technology ||
                  "Methodology information not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Expected Social Impact
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {proposal.expectedImpact ||
                  proposal.impact ||
                  "Impact information not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Estimated Cost
              </span>

              <strong>
                ₹
                {proposal.budget ||
                  proposal.cost ||
                  "Not specified"}
              </strong>

            </div>

            {proposal.governmentReviewStatus && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "14px",
                  borderRadius: "8px",
                  background:
                    proposal.governmentReviewStatus ===
                    "Approved"
                      ? "#ecfdf5"
                      : "#fff7ed",
                  border:
                    proposal.governmentReviewStatus ===
                    "Approved"
                      ? "1px solid #a7f3d0"
                      : "1px solid #fed7aa",
                }}
              >
                <strong>
                  Government Review:{" "}
                  {proposal.governmentReviewStatus}
                </strong>
              </div>
            )}

          </div>

        ) : (

          <div className="empty-message">
            No solution proposal found.
          </div>

        )}

      </div>

      {/* =================================================
          INDUSTRY IMPLEMENTATION PROPOSAL
      ================================================= */}

      <div
        className="review-card"
        style={{
          border:
            "2px solid #2563eb",
        }}
      >

        <div className="card-title">

          <div>

            <h2>
              🏭 Industry Implementation Proposal
            </h2>

            <p>
              Submitted by the Industry partner after
              Government approval of the University Solution.
            </p>

          </div>

          {industryProposal && (
            <span className="completed-badge">
              ✓ Submitted
            </span>
          )}

        </div>

        {!industryProposal ? (

          <div
            className="empty-message"
            style={{
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
              color: "#9a3412",
            }}
          >

            <strong>
              No Industry Implementation Proposal Found
            </strong>

            <p>
              The Industry has not submitted an
              Implementation Proposal for this project yet.
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                STATUS
            ================================================= */}

            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "8px",
                background:
                  industryProposalApproved
                    ? "#f0fdf4"
                    : industryProposalChangesRequested
                    ? "#fff7ed"
                    : "#eff6ff",
                border:
                  industryProposalApproved
                    ? "1px solid #86efac"
                    : industryProposalChangesRequested
                    ? "1px solid #fdba74"
                    : "1px solid #93c5fd",
              }}
            >

              <strong>
                Government Review Status:{" "}
                {industryReviewStatusValue ||
                  "Under Review"}
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  marginTop: "8px",
                }}
              >

                {industryProposalApproved &&
                  "The Industry Implementation Proposal has been approved by Government."}

                {industryProposalChangesRequested &&
                  "Government has requested changes from Industry."}

                {industryProposalPending &&
                  "Industry has submitted its implementation proposal. Government review is required before Prototype & Testing can proceed."}

              </p>

            </div>

            {/* =================================================
                1. IMPLEMENTATION PLAN
            ================================================= */}

            <div className="detail-box">

              <span>
                Industry Implementation Plan
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {industryProposal.implementationPlan ||
                  industryProposal.solution ||
                  industryProposal.description ||
                  "No Industry Implementation Plan provided."}
              </p>

            </div>

            {/* =================================================
                2. INDUSTRY RESOURCES
            ================================================= */}

            <div className="detail-box">

              <span>
                Industry Resources / Expertise
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {industryProposal.industryResources ||
                  "No Industry Resources / Expertise provided."}
              </p>

            </div>

            {/* =================================================
                3. DEPLOYMENT PLAN
            ================================================= */}

            <div className="detail-box">

              <span>
                Deployment & Scaling Plan
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {industryProposal.deploymentPlan ||
                  industryProposal.methodology ||
                  "No Deployment & Scaling Plan provided."}
              </p>

            </div>

            {/* =================================================
                4 + 5 COST AND TIMELINE
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
                marginTop: "15px",
              }}
            >

              <div className="detail-box">

                <span>
                  Estimated Industry Cost
                </span>

                <strong>
                  {industryProposal.estimatedCost ||
                    industryProposal.budget ||
                    "Not specified"}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Implementation Timeline
                </span>

                <strong>
                  {industryProposal.implementationTimeline ||
                    industryProposal.timeline ||
                    "Not specified"}
                </strong>

              </div>

            </div>

            {/* =================================================
                6. INFRASTRUCTURE / TECHNOLOGY
            ================================================= */}

            <div className="detail-box">

              <span>
                Industry Infrastructure / Technology
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {industryProposal.infrastructureTechnology ||
                  industryProposal.technicalApproach ||
                  "No Infrastructure / Technology details provided."}
              </p>

            </div>

            {/* =================================================
                7. INDUSTRY CONTRIBUTION
            ================================================= */}

            <div className="detail-box">

              <span>
                Industry Contribution
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {industryProposal.industryContribution ||
                  industryProposal.expectedImpact ||
                  "No Industry Contribution details provided."}
              </p>

            </div>

            {/* =================================================
                GOVERNMENT REVIEW
            ================================================= */}

            <div
              style={{
                marginTop: "22px",
                padding: "20px",
                borderRadius: "10px",
                background: "#f8fafc",
                border:
                  "1px solid #dbe3ef",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Government Review
              </h3>

              {/* SUCCESS */}

              {industryReviewMessage && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color: "#065f46",
                  }}
                >
                  {industryReviewMessage}
                </div>
              )}

              {/* ERROR */}

              {industryReviewError && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color: "#991b1b",
                  }}
                >
                  {industryReviewError}
                </div>
              )}

              {/* PREVIOUS COMMENT */}

              {industryProposal.governmentReviewComment && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                  }}
                >

                  <strong>
                    Government Review Comment
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                      marginTop: "8px",
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {
                      industryProposal
                        .governmentReviewComment
                    }
                  </p>

                </div>
              )}

              {/* COMMENT INPUT */}

              {!industryProposalApproved && (
                <div>

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Government Review Comment
                    {industryReviewStatusValue ===
                      "Changes Requested" &&
                      " *"}
                  </label>

                  <textarea
                    value={
                      industryReviewComment
                    }
                    onChange={(event) =>
                      setIndustryReviewComment(
                        event.target.value
                      )
                    }
                    disabled={
                      submittingIndustryReview
                    }
                    placeholder="Enter your Government review comments. If requesting changes, clearly explain what Industry needs to modify."
                    rows={5}
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "12px",
                      borderRadius: "8px",
                      border:
                        "1px solid #cbd5e1",
                      resize: "vertical",
                      fontFamily:
                        "inherit",
                    }}
                  />

                </div>
              )}

              {/* BUTTONS */}

              {!industryProposalApproved && (
                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    onClick={() =>
                      reviewIndustryProposal(
                        "Changes Requested"
                      )
                    }
                    disabled={
                      submittingIndustryReview
                    }
                    style={{
                      padding:
                        "12px 20px",
                      border: "none",
                      borderRadius:
                        "7px",
                      background:
                        submittingIndustryReview
                          ? "#cbd5e1"
                          : "#f97316",
                      color:
                        "#ffffff",
                      cursor:
                        submittingIndustryReview
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    {submittingIndustryReview
                      ? "Submitting..."
                      : "✕ Request Changes"}
                  </button>

                  <button
                    onClick={() =>
                      reviewIndustryProposal(
                        "Approved"
                      )
                    }
                    disabled={
                      submittingIndustryReview
                    }
                    style={{
                      padding:
                        "12px 20px",
                      border: "none",
                      borderRadius:
                        "7px",
                      background:
                        submittingIndustryReview
                          ? "#cbd5e1"
                          : "#16a34a",
                      color:
                        "#ffffff",
                      cursor:
                        submittingIndustryReview
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    {submittingIndustryReview
                      ? "Submitting..."
                      : "✓ Approve Industry Proposal"}
                  </button>

                </div>
              )}

              {/* APPROVED */}

              {industryProposalApproved && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "16px",
                    borderRadius: "8px",
                    background:
                      "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color:
                      "#065f46",
                  }}
                >

                  <strong>
                    ✓ Industry Implementation Proposal Approved
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                      marginTop: "8px",
                    }}
                  >
                    The Government has approved the
                    Industry Implementation Proposal.
                    The University can now proceed to
                    Prototype & Testing.
                  </p>

                </div>
              )}

              {/* CHANGES REQUESTED */}

              {industryProposalChangesRequested && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "16px",
                    borderRadius: "8px",
                    background:
                      "#fff7ed",
                    border:
                      "1px solid #fdba74",
                    color:
                      "#9a3412",
                  }}
                >

                  <strong>
                    ⚠ Changes Requested
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                      marginTop: "8px",
                    }}
                  >
                    Changes have been requested from
                    Industry. Industry must revise and
                    resubmit the Implementation Proposal.
                  </p>

                </div>
              )}

            </div>

          </>

        )}

      </div>

      {/* =================================================
          PROTOTYPE & TESTING
      ================================================= */}

      <div className="review-card">

        <div className="card-title">

          <div>

            <h2>
              Prototype & Testing
            </h2>

            <p>
              Prototype submitted by the
              University team.
            </p>

          </div>

          {prototype && (
            <span className="completed-badge">
              ✓ Submitted
            </span>
          )}

        </div>

        {!prototype ? (

          <div className="empty-message">

            {!industryProposalApproved
              ? "Prototype & Testing will become available after Government approves the Industry Implementation Proposal."
              : "No prototype submission found."}

          </div>

        ) : (

          <div className="prototype-content">

            <div className="detail-box">

              <span>
                Prototype Name
              </span>

              <strong>
                {prototype.testName ||
                  prototype.prototypeName ||
                  "Prototype"}
              </strong>

            </div>

            <div className="detail-box">

              <span>
                Prototype Description / Findings
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {prototype.findings ||
                  prototype.description ||
                  "Prototype description not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Technology Used
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {prototype.technology ||
                  prototype.evidenceUrl ||
                  "Technology information not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Testing Result
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {prototype.result ||
                  prototype.testingResult ||
                  "Testing result not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Government Review Status
              </span>

              <strong>
                {prototype.governmentReviewStatus ||
                  "Pending Government Review"}
              </strong>

            </div>

          </div>

        )}

      </div>

      {/* =================================================
          UNIVERSITY IMPLEMENTATION PLAN
      ================================================= */}

      <div className="review-card">

        <div className="card-title">

          <div>

            <h2>
              🛠 Implementation Plan
            </h2>

            <p>
              Review the Implementation Plan submitted
              by the University after Prototype approval.
            </p>

          </div>

          {implementation && (
            <span className="completed-badge">
              ✓ Submitted
            </span>
          )}

        </div>

        {!implementation ? (

          <div className="empty-message">

            {!prototypeApproved
              ? "The University Implementation Plan will be reviewed after Government approves the Prototype."
              : "No Implementation Plan has been submitted by the University yet."}

          </div>

        ) : (

          <>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >

              <div className="detail-box">

                <span>
                  Location
                </span>

                <strong>
                  {implementation.location ||
                    "Not specified"}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Beneficiaries
                </span>

                <strong>
                  {implementation.beneficiaries ||
                    "Not specified"}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Start Date
                </span>

                <strong>
                  {implementation.startDate
                    ? new Date(
                        implementation.startDate
                      ).toLocaleString()
                    : "Not specified"}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Status
                </span>

                <strong>
                  {implementation.status ||
                    "Implementation Plan Submitted"}
                </strong>

              </div>

            </div>

            <div className="detail-box">

              <span>
                Implementation Title
              </span>

              <strong>
                {implementationTitle ||
                  "Implementation title not available."}
              </strong>

            </div>

            <div className="detail-box">

              <span>
                Implementation Activities
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {implementationActivities ||
                  "Implementation activities not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Resources Required
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {implementationResources ||
                  "Resources information not available."}
              </p>

            </div>

            <div className="detail-box">

              <span>
                Implementation Timeline
              </span>

              <p
                style={{
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {implementationTimeline ||
                  "Timeline information not available."}
              </p>

            </div>

            {/* =================================================
                GOVERNMENT IMPLEMENTATION REVIEW
            ================================================= */}

            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "10px",
                border:
                  "1px solid #dbe3ef",
                background:
                  "#f8fafc",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Government Review
              </h3>

              <p
                style={{
                  marginTop: 0,
                  marginBottom:
                    "16px",
                }}
              >
                Current status:{" "}
                <strong>
                  {implementationReviewStatus ===
                  "Approved"
                    ? "Approved"
                    : implementationReviewStatus ===
                      "Changes Requested"
                    ? "Changes Requested"
                    : "Pending Government Review"}
                </strong>
              </p>

              {!prototypeApproved && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom:
                      "16px",
                    borderRadius: "8px",
                    background:
                      "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color:
                      "#9a3412",
                  }}
                >

                  <strong>
                    Prototype approval required
                  </strong>

                  <p
                    style={{
                      marginBottom:
                        0,
                    }}
                  >
                    The Prototype must be approved
                    by Government before this
                    Implementation Plan can be
                    approved or sent back for changes.
                  </p>

                </div>
              )}

              {implementationReviewMessage && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom:
                      "16px",
                    borderRadius: "8px",
                    background:
                      "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color:
                      "#065f46",
                  }}
                >
                  {implementationReviewMessage}
                </div>
              )}

              {implementationReviewError && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom:
                      "16px",
                    borderRadius: "8px",
                    background:
                      "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color:
                      "#991b1b",
                  }}
                >
                  {implementationReviewError}
                </div>
              )}

              {implementation.governmentReviewComment && (
                <div
                  style={{
                    padding: "14px",
                    marginBottom:
                      "16px",
                    borderRadius: "8px",
                    background:
                      "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                  }}
                >

                  <strong>
                    Previous Government Comment
                  </strong>

                  <p
                    style={{
                      marginBottom:
                        0,
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {
                      implementation
                        .governmentReviewComment
                    }
                  </p>

                </div>
              )}

              {!implementationApproved && (
                <div>

                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      marginBottom:
                        "8px",
                    }}
                  >
                    Government Review Comment
                    {implementationReviewStatus ===
                      "Changes Requested" &&
                      " *"}
                  </label>

                  <textarea
                    value={
                      implementationReviewComment
                    }
                    onChange={(
                      event
                    ) =>
                      setImplementationReviewComment(
                        event.target.value
                      )
                    }
                    placeholder="Enter your review comment."
                    rows={5}
                    disabled={
                      submittingReview ||
                      !prototypeApproved
                    }
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #cbd5e1",
                      resize:
                        "vertical",
                      fontFamily:
                        "inherit",
                    }}
                  />

                </div>
              )}

              {!implementationApproved && (
                <div
                  style={{
                    marginTop:
                      "18px",
                    display:
                      "flex",
                    gap:
                      "12px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <button
                    onClick={() =>
                      reviewImplementation(
                        "Changes Requested"
                      )
                    }
                    disabled={
                      submittingReview ||
                      !prototypeApproved
                    }
                    style={{
                      padding:
                        "12px 20px",
                      border:
                        "none",
                      borderRadius:
                        "7px",
                      background:
                        submittingReview
                          ? "#cbd5e1"
                          : "#f97316",
                      color:
                        "#ffffff",
                      cursor:
                        submittingReview
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "✕ Request Changes"}
                  </button>

                  <button
                    onClick={() =>
                      reviewImplementation(
                        "Approved"
                      )
                    }
                    disabled={
                      submittingReview ||
                      !prototypeApproved
                    }
                    style={{
                      padding:
                        "12px 20px",
                      border:
                        "none",
                      borderRadius:
                        "7px",
                      background:
                        submittingReview
                          ? "#cbd5e1"
                          : "#16a34a",
                      color:
                        "#ffffff",
                      cursor:
                        submittingReview
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "✓ Approve Implementation"}
                  </button>

                </div>
              )}

              {implementationApproved && (
                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "8px",
                    background:
                      "#ecfdf5",
                    border:
                      "1px solid #a7f3d0",
                    color:
                      "#065f46",
                  }}
                >

                  <strong>
                    ✓ Implementation Plan Approved
                  </strong>

                  <p
                    style={{
                      marginBottom:
                        0,
                    }}
                  >
                    The Government has approved
                    this Implementation Plan.
                  </p>

                </div>
              )}

            </div>

          </>

        )}

      </div>

      {/* =================================================
          FINAL STATUS
      ================================================= */}

      {implementation &&
        implementationReviewStatus ===
          "Changes Requested" && (
        <div
          className="review-card"
          style={{
            border:
              "1px solid #fed7aa",
            background:
              "#fffaf5",
          }}
        >

          <h2>
            ⚠ Changes Requested
          </h2>

          <p>
            The University has been asked to
            modify the Implementation Plan.
          </p>

        </div>
      )}

      {implementation &&
        implementationReviewStatus ===
          "Approved" && (
        <div className="approved-card">

          <div className="approved-icon">
            ✓
          </div>

          <div>

            <h2>
              Implementation Approved
            </h2>

            <p>
              The Government has approved the
              Implementation Plan.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default GovernmentReview;