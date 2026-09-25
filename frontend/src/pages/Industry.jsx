import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StakeholderChat from "../components/StakeholderChat";

const API_BASE = "http://localhost:5000/api";

function Industry() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [collaborations, setCollaborations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [selectedProposal, setSelectedProposal] =
    useState(null);

  const [submittingProposal, setSubmittingProposal] =
    useState(false);

  const [proposalForm, setProposalForm] = useState({
    implementationPlan: "",
    industryResources: "",
    deploymentPlan: "",
    estimatedCost: "",
    implementationTimeline: "",
    infrastructureTechnology: "",
    industryContribution: "",
  });

  const token =
    localStorage.getItem("authToken");

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const savedUser =
      JSON.parse(
        localStorage.getItem("currentUser") ||
          "{}"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      savedUser.role &&
      savedUser.role !== "industry"
    ) {
      navigate("/login");
      return;
    }

    loadIndustryData();
  }, []);

  /* =========================================================
     API REQUEST
  ========================================================= */

  const apiRequest = async (
    url,
    options = {}
  ) => {
    const response =
      await fetch(
        `${API_BASE}${url}`,
        {
          ...options,

          headers: {
            "Content-Type":
              "application/json",

            ...(options.headers || {}),

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    let data = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Something went wrong."
      );
    }

    return data;
  };

  /* =========================================================
     LOAD INDUSTRY DATA
  ========================================================= */

  const loadIndustryData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        projectsResponse,
        partnersResponse,
        collaborationsResponse,
      ] = await Promise.all([
        apiRequest(
          "/advanced/industry/projects"
        ),

        apiRequest(
          "/advanced/industry/partners"
        ),

        apiRequest(
          "/advanced/industry/collaborations"
        ),
      ]);

      const loadedProjects =
        Array.isArray(
          projectsResponse
        )
          ? projectsResponse
          : projectsResponse.projects ||
            [];

      const loadedPartners =
        Array.isArray(
          partnersResponse
        )
          ? partnersResponse
          : partnersResponse.partners ||
            [];

      const loadedCollaborations =
        Array.isArray(
          collaborationsResponse
        )
          ? collaborationsResponse
          : collaborationsResponse.collaborations ||
            [];

      setProjects(
        loadedProjects
      );

      setPartners(
        loadedPartners
      );

      setCollaborations(
        loadedCollaborations
      );

      /*
       * If a project is currently open, refresh
       * that project from the newly loaded list.
       */
      if (selectedProject) {
        const refreshedProject =
          loadedProjects.find(
            (item) =>
              Number(item.id) ===
              Number(selectedProject.id)
          );

        if (refreshedProject) {
          setSelectedProject(
            refreshedProject
          );

          setSelectedProposal(
            refreshedProject.industryProposal ||
              null
          );
        }
      }

    } catch (error) {
      console.error(
        "Industry dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load Industry Portal."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     OPEN PROJECT

     IMPORTANT:
     There is NO request to:

     /advanced/industry/projects/:projectId

     The project already exists in the list returned by:

     /advanced/industry/projects

     So we use that project directly.
  ========================================================= */

  const openProject = async (
    projectId
  ) => {
    try {
      setError("");

      const project =
        projects.find(
          (item) =>
            Number(item.id) ===
            Number(projectId)
        );

      if (!project) {
        throw new Error(
          "Project details could not be found in the Industry project list."
        );
      }

      const combinedProject = {
        ...project,

        problem:
          project.problem ||
          null,

        universityProposal:
          project.universityProposal ||
          null,

        industryProposal:
          project.industryProposal ||
          null,

        prototype:
          project.prototype ||
          null,

        implementation:
          project.implementation ||
          null,

        completion:
          project.completion ||
          null,

        collaborations:
          project.collaborations ||
          [],

        partner:
          project.partner ||
          null,
      };

      setSelectedProject(
        combinedProject
      );

      const existingProposal =
        combinedProject.industryProposal ||
        null;

      setSelectedProposal(
        existingProposal
      );

      /*
       * If Industry already submitted an implementation
       * proposal, show the saved information.
       */
      if (existingProposal) {
        setProposalForm({
          implementationPlan:
            existingProposal.implementationPlan ||
            existingProposal.description ||
            existingProposal.solution ||
            "",

          industryResources:
            existingProposal.industryResources ||
            "",

          deploymentPlan:
            existingProposal.deploymentPlan ||
            existingProposal.methodology ||
            "",

          estimatedCost:
            existingProposal.estimatedCost ||
            existingProposal.budget ||
            "",

          implementationTimeline:
            existingProposal.implementationTimeline ||
            existingProposal.timeline ||
            "",

          infrastructureTechnology:
            existingProposal.infrastructureTechnology ||
            existingProposal.technicalApproach ||
            "",

          industryContribution:
            existingProposal.industryContribution ||
            existingProposal.expectedImpact ||
            "",
        });

      } else {
        setProposalForm({
          implementationPlan: "",
          industryResources: "",
          deploymentPlan: "",
          estimatedCost: "",
          implementationTimeline: "",
          infrastructureTechnology: "",
          industryContribution: "",
        });
      }

    } catch (error) {
      console.error(
        "Project details error:",
        error
      );

      setError(
        error.message ||
          "Unable to load project details."
      );
    }
  };

  /* =========================================================
     CLOSE PROJECT
  ========================================================= */

  const closeProject = () => {
    setSelectedProject(null);

    setSelectedProposal(null);

    setProposalForm({
      implementationPlan: "",
      industryResources: "",
      deploymentPlan: "",
      estimatedCost: "",
      implementationTimeline: "",
      infrastructureTechnology: "",
      industryContribution: "",
    });
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleProposalChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProposalForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =========================================================
     UNIVERSITY PROPOSAL APPROVED?
  ========================================================= */

  const isUniversityProposalApproved = (
    project
  ) => {
    if (!project) {
      return false;
    }

    const proposal =
      project.universityProposal;

    if (!proposal) {
      return false;
    }

    return (
      proposal.governmentReviewStatus ===
      "Approved"
    );
  };

  /* =========================================================
     UNIVERSITY PROPOSAL STATUS
  ========================================================= */

  const getUniversityProposalStatus = (
    project
  ) => {
    const proposal =
      project?.universityProposal;

    if (!proposal) {
      return "Not Available";
    }

    if (
      proposal.governmentReviewStatus ===
      "Approved"
    ) {
      return "Approved";
    }

    if (
      proposal.governmentReviewStatus ===
      "Rejected"
    ) {
      return "Rejected";
    }

    if (
      proposal.governmentReviewStatus ===
      "Changes Requested"
    ) {
      return "Changes Requested";
    }

    return "Under Government Review";
  };

  /* =========================================================
     INDUSTRY PROPOSAL STATUS
  ========================================================= */

  const getIndustryProposalStatus = (
    project
  ) => {
    const proposal =
      project?.industryProposal;

    if (!proposal) {
      return "Not Submitted";
    }

    if (
      proposal.governmentReviewStatus ===
      "Approved"
    ) {
      return "Approved";
    }

    if (
      proposal.governmentReviewStatus ===
      "Rejected"
    ) {
      return "Rejected";
    }

    if (
      proposal.governmentReviewStatus ===
      "Changes Requested"
    ) {
      return "Changes Requested";
    }

    return "Under Government Review";
  };

  /* =========================================================
     PROJECT STATUS
  ========================================================= */

  const getProjectStatus = (
    project
  ) => {
    return (
      project?.status ||
      project?.projectStatus ||
      "Industry Assigned"
    );
  };

  /* =========================================================
     SUBMIT INDUSTRY IMPLEMENTATION PROPOSAL
  ========================================================= */

  const submitIndustryProposal = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedProject) {
      alert(
        "Please select a project first."
      );
      return;
    }

    /*
     * University proposal MUST be approved
     * before Industry can respond.
     */
    if (
      !isUniversityProposalApproved(
        selectedProject
      )
    ) {
      alert(
        "The University Solution Proposal must be approved by Government before the Industry Implementation Proposal can be submitted."
      );
      return;
    }

    if (
      !proposalForm.implementationPlan.trim()
    ) {
      alert(
        "Please enter the Industry Implementation Plan."
      );
      return;
    }

    if (
      !proposalForm.industryResources.trim()
    ) {
      alert(
        "Please enter the Industry Resources / Expertise."
      );
      return;
    }

    if (
      !proposalForm.deploymentPlan.trim()
    ) {
      alert(
        "Please enter the Deployment & Scaling Plan."
      );
      return;
    }

    try {
      setSubmittingProposal(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Correct backend endpoint:
       *
       * POST /api/advanced/industry/proposals/project/:projectId
       *
       * NOT:
       *
       * /advanced/industry/projects/:projectId/proposal
       */
      const response =
        await apiRequest(
          `/advanced/industry/proposals/project/${selectedProject.id}`,
          {
            method: "POST",

            body:
              JSON.stringify({
                title:
                  "Industry Implementation & Support Proposal",

                /*
                 * Legacy fields are also sent so the
                 * existing Proposal structure continues
                 * to work.
                 */
                solution:
                  proposalForm.implementationPlan.trim(),

                methodology:
                  proposalForm.deploymentPlan.trim(),

                expectedImpact:
                  proposalForm.industryContribution.trim(),

                budget:
                  proposalForm.estimatedCost.trim(),

                /*
                 * New Industry implementation fields.
                 */
                implementationPlan:
                  proposalForm.implementationPlan.trim(),

                industryResources:
                  proposalForm.industryResources.trim(),

                deploymentPlan:
                  proposalForm.deploymentPlan.trim(),

                implementationTimeline:
                  proposalForm.implementationTimeline.trim(),

                infrastructureTechnology:
                  proposalForm.infrastructureTechnology.trim(),

                industryContribution:
                  proposalForm.industryContribution.trim(),

                /*
                 * These aliases are included for compatibility
                 * with any older frontend/backend mapping.
                 */
                description:
                  proposalForm.implementationPlan.trim(),

                technicalApproach:
                  proposalForm.infrastructureTechnology.trim(),

                estimatedCost:
                  proposalForm.estimatedCost.trim(),

                timeline:
                  proposalForm.implementationTimeline.trim(),
              }),
          }
        );

      alert(
        response.message ||
          "Industry Implementation Proposal submitted successfully."
      );

      /*
       * Update the open project immediately using
       * the proposal returned by the backend.
       */
      if (response.proposal) {
        setSelectedProposal(
          response.proposal
        );

        setSelectedProject(
          (previous) => ({
            ...previous,

            ...(response.project || {}),

            industryProposal:
              response.proposal,
          })
        );
      }

      /*
       * Refresh the dashboard so the card changes
       * from "Not Submitted" to the latest status.
       */
      await loadIndustryData();

    } catch (error) {
      console.error(
        "Industry implementation proposal error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit Industry Implementation Proposal."
      );

      alert(
        error.message ||
          "Unable to submit Industry Implementation Proposal."
      );

    } finally {
      setSubmittingProposal(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "authToken"
    );

    localStorage.removeItem(
      "currentUser"
    );

    localStorage.removeItem(
      "userRole"
    );

    navigate("/login");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#f8fafc",

          color:
            "#475569",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
          }}
        >
          <h2>
            Loading Industry Portal...
          </h2>

          <p>
            Loading assigned projects.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f8fafc",

        padding:
          "30px",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          maxWidth:
            "1250px",

          margin:
            "0 auto 25px",

          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          gap:
            "20px",

          flexWrap:
            "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin:
                0,

              color:
                "#0f172a",
            }}
          >
            Industry / Startup Portal
          </h1>

          <p
            style={{
              marginTop:
                "8px",

              color:
                "#64748b",
            }}
          >
            Implement and scale Government-approved
            University solutions.
          </p>
        </div>

        <button
          onClick={
            handleLogout
          }
          style={{
            padding:
              "11px 20px",

            border:
              "none",

            borderRadius:
              "7px",

            background:
              "#dc2626",

            color:
              "#ffffff",

            cursor:
              "pointer",

            fontWeight:
              "600",
          }}
        >
          Logout
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            maxWidth:
              "1250px",

            margin:
              "0 auto 20px",

            padding:
              "15px 18px",

            borderRadius:
              "8px",

            background:
              "#fef2f2",

            border:
              "1px solid #fecaca",

            color:
              "#991b1b",
          }}
        >
          <strong>
            Error:
          </strong>{" "}
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div
        style={{
          maxWidth:
            "1250px",

          margin:
            "0 auto 25px",

          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",

          gap:
            "18px",
        }}
      >
        <div
          style={{
            background:
              "#ffffff",

            padding:
              "22px",

            borderRadius:
              "10px",

            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              margin:
                0,

              color:
                "#64748b",
            }}
          >
            Assigned Projects
          </p>

          <h2
            style={{
              margin:
                "8px 0 0",

              color:
                "#0f172a",
            }}
          >
            {projects.length}
          </h2>
        </div>

        <div
          style={{
            background:
              "#ffffff",

            padding:
              "22px",

            borderRadius:
              "10px",

            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              margin:
                0,

              color:
                "#64748b",
            }}
          >
            Available Industry Partners
          </p>

          <h2
            style={{
              margin:
                "8px 0 0",

              color:
                "#0f172a",
            }}
          >
            {partners.length}
          </h2>
        </div>

        <div
          style={{
            background:
              "#ffffff",

            padding:
              "22px",

            borderRadius:
              "10px",

            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              margin:
                0,

              color:
                "#64748b",
            }}
          >
            Collaborations
          </p>

          <h2
            style={{
              margin:
                "8px 0 0",

              color:
                "#0f172a",
            }}
          >
            {collaborations.length}
          </h2>
        </div>
      </div>

      {/* =====================================================
          ASSIGNED PROJECTS
      ===================================================== */}

      <div
        style={{
          maxWidth:
            "1250px",

          margin:
            "0 auto 30px",
        }}
      >
        <div
          style={{
            background:
              "#ffffff",

            padding:
              "25px",

            borderRadius:
              "10px",

            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop:
                0,

              color:
                "#0f172a",
            }}
          >
            Assigned Projects
          </h2>

          <p
            style={{
              color:
                "#64748b",
            }}
          >
            Projects assigned by the Government after
            approval of the University Solution Proposal.
          </p>

          {projects.length === 0 ? (
            <div
              style={{
                marginTop:
                  "20px",

                padding:
                  "25px",

                borderRadius:
                  "8px",

                background:
                  "#f8fafc",

                textAlign:
                  "center",

                color:
                  "#64748b",
              }}
            >
              <h3>
                No projects assigned yet
              </h3>

              <p>
                The Government has not assigned an
                Industry project to your organization.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",

                gap:
                  "20px",

                marginTop:
                  "20px",
              }}
            >
              {projects.map(
                (project) => (
                  <div
                    key={
                      project.id
                    }
                    style={{
                      border:
                        "1px solid #e2e8f0",

                      borderRadius:
                        "10px",

                      padding:
                        "20px",

                      background:
                        "#ffffff",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "13px",

                        color:
                          "#64748b",
                      }}
                    >
                      Project #
                      {project.id}
                    </span>

                    <h3
                      style={{
                        margin:
                          "6px 0 10px",

                        color:
                          "#0f172a",
                      }}
                    >
                      {project.title ||
                        project.name ||
                        project.problem?.title ||
                        "Societal Innovation Project"}
                    </h3>

                    <p
                      style={{
                        color:
                          "#64748b",

                        lineHeight:
                          "1.6",
                      }}
                    >
                      {project.description ||
                        project.problem?.description ||
                        "No project description available."}
                    </p>

                    <div
                      style={{
                        marginTop:
                          "15px",

                        display:
                          "grid",

                        gap:
                          "9px",
                      }}
                    >
                      <div>
                        <strong>
                          University Proposal:
                        </strong>{" "}
                        {getUniversityProposalStatus(
                          project
                        )}
                      </div>

                      <div>
                        <strong>
                          Industry Proposal:
                        </strong>{" "}
                        {getIndustryProposalStatus(
                          project
                        )}
                      </div>

                      <div>
                        <strong>
                          Project Status:
                        </strong>{" "}
                        {getProjectStatus(
                          project
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openProject(
                          project.id
                        )
                      }
                      style={{
                        width:
                          "100%",

                        marginTop:
                          "18px",

                        padding:
                          "11px 15px",

                        border:
                          "none",

                        borderRadius:
                          "7px",

                        background:
                          "#2563eb",

                        color:
                          "#ffffff",

                        cursor:
                          "pointer",

                        fontWeight:
                          "600",
                      }}
                    >
                      View Project
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PROJECT DETAILS
      ===================================================== */}

      {selectedProject && (
        <div
          style={{
            maxWidth:
              "1250px",

            margin:
              "0 auto 30px",

            background:
              "#ffffff",

            padding:
              "28px",

            borderRadius:
              "10px",

            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* =================================================
              PROJECT HEADER
          ================================================= */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "flex-start",

              gap:
                "20px",

              flexWrap:
                "wrap",
            }}
          >
            <div>
              <span
                style={{
                  color:
                    "#64748b",

                  fontSize:
                    "13px",
                }}
              >
                Project #
                {selectedProject.id}
              </span>

              <h2
                style={{
                  margin:
                    "6px 0 8px",

                  color:
                    "#0f172a",
                }}
              >
                {selectedProject.title ||
                  selectedProject.name ||
                  selectedProject.problem?.title ||
                  "Assigned Project"}
              </h2>

              <p
                style={{
                  color:
                    "#64748b",

                  lineHeight:
                    "1.7",
                }}
              >
                {selectedProject.description ||
                  selectedProject.problem?.description ||
                  "No project description available."}
              </p>
            </div>

            <button
              onClick={
                closeProject
              }
              style={{
                padding:
                  "9px 15px",

                border:
                  "1px solid #cbd5e1",

                borderRadius:
                  "6px",

                background:
                  "#ffffff",

                cursor:
                  "pointer",
              }}
            >
              Close
            </button>
          </div>

          {/* =================================================
              CITIZEN PROBLEM
          ================================================= */}

          {selectedProject.problem && (
            <div
              style={{
                marginTop:
                  "25px",

                padding:
                  "22px",

                borderRadius:
                  "9px",

                background:
                  "#f8fafc",

                border:
                  "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  marginTop:
                    0,
                }}
              >
                Citizen Problem
              </h3>

              <p>
                <strong>
                  Problem ID:
                </strong>{" "}
                {selectedProject.problem.problemId ||
                  selectedProject.problem.id ||
                  "Not available"}
              </p>

              <p>
                <strong>
                  Title:
                </strong>{" "}
                {selectedProject.problem.title ||
                  "Not available"}
              </p>

              <p
                style={{
                  lineHeight:
                    "1.7",
                }}
              >
                <strong>
                  Description:
                </strong>{" "}
                {selectedProject.problem.description ||
                  "No description available."}
              </p>

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",

                  gap:
                    "12px",
                }}
              >
                <div>
                  <strong>
                    Domain
                  </strong>

                  <p
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    {selectedProject.problem.domain ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <strong>
                    Severity
                  </strong>

                  <p
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    {selectedProject.problem.severity ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <strong>
                    District
                  </strong>

                  <p
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    {selectedProject.problem.district ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <strong>
                    Location
                  </strong>

                  <p
                    style={{
                      color:
                        "#64748b",
                    }}
                  >
                    {selectedProject.problem.location ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              WORKFLOW
          ================================================= */}

          <div
            style={{
              marginTop:
                "25px",

              padding:
                "20px",

              borderRadius:
                "9px",

              background:
                "#eff6ff",

              border:
                "1px solid #bfdbfe",
            }}
          >
            <h3
              style={{
                marginTop:
                  0,

                color:
                  "#1e3a8a",
              }}
            >
              Project Workflow
            </h3>

            <div
              style={{
                display:
                  "grid",

                gap:
                  "10px",
              }}
            >
              <div>
                <strong>
                  1. University Solution:
                </strong>{" "}
                {getUniversityProposalStatus(
                  selectedProject
                )}
              </div>

              <div>
                <strong>
                  2. Industry Implementation:
                </strong>{" "}
                {getIndustryProposalStatus(
                  selectedProject
                )}
              </div>

              <div>
                <strong>
                  3. Project Status:
                </strong>{" "}
                {getProjectStatus(
                  selectedProject
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              UNIVERSITY APPROVED SOLUTION
          ================================================= */}

          <div
            style={{
              marginTop:
                "25px",

              padding:
                "22px",

              borderRadius:
                "9px",

              background:
                "#f8fafc",

              border:
                "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "15px",

                flexWrap:
                  "wrap",
              }}
            >
              <h3
                style={{
                  margin:
                    0,
                }}
              >
                University Solution Proposal
              </h3>

              {isUniversityProposalApproved(
                selectedProject
              ) && (
                <span
                  style={{
                    padding:
                      "7px 12px",

                    borderRadius:
                      "20px",

                    background:
                      "#dcfce7",

                    color:
                      "#166534",

                    fontSize:
                      "13px",

                    fontWeight:
                      "700",
                  }}
                >
                  ✓ GOVERNMENT APPROVED
                </span>
              )}
            </div>

            {selectedProject.universityProposal ? (
              <div
                style={{
                  marginTop:
                    "18px",
                }}
              >
                <p>
                  <strong>
                    Solution Title:
                  </strong>{" "}
                  {selectedProject
                    .universityProposal
                    .title ||
                    "Not provided"}
                </p>

                <div
                  style={{
                    marginTop:
                      "18px",
                  }}
                >
                  <strong>
                    Solution Description
                  </strong>

                  <div
                    style={{
                      marginTop:
                        "8px",

                      padding:
                        "15px",

                      background:
                        "#ffffff",

                      border:
                        "1px solid #e2e8f0",

                      borderRadius:
                        "7px",

                      lineHeight:
                        "1.7",

                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {selectedProject
                      .universityProposal
                      .description ||
                      selectedProject
                        .universityProposal
                        .solution ||
                      "The University proposal did not provide a description."}
                  </div>
                </div>

                {selectedProject
                  .universityProposal
                  .technicalApproach && (
                  <div
                    style={{
                      marginTop:
                        "18px",
                    }}
                  >
                    <strong>
                      University Technical Approach
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "8px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        selectedProject
                          .universityProposal
                          .technicalApproach
                      }
                    </div>
                  </div>
                )}

                <p
                  style={{
                    marginTop:
                      "18px",
                  }}
                >
                  <strong>
                    Government Review:
                  </strong>{" "}
                  {selectedProject
                    .universityProposal
                    .governmentReviewStatus ||
                    "Under Review"}
                </p>

                {selectedProject
                  .universityProposal
                  .governmentReviewComments && (
                  <div
                    style={{
                      marginTop:
                        "12px",

                      padding:
                        "14px",

                      borderRadius:
                        "7px",

                      background:
                        "#ffffff",

                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <strong>
                      Government Comments:
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
                        selectedProject
                          .universityProposal
                          .governmentReviewComments
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  marginTop:
                    "15px",

                  padding:
                    "15px",

                  background:
                    "#fff7ed",

                  border:
                    "1px solid #fed7aa",

                  borderRadius:
                    "7px",

                  color:
                    "#9a3412",
                }}
              >
                University Solution Proposal is not
                available.
              </div>
            )}
          </div>

          {/* =================================================
              INDUSTRY IMPLEMENTATION PROPOSAL
          ================================================= */}

          <div
            style={{
              marginTop:
                "25px",
            }}
          >
            <h3>
              Industry Implementation Proposal
            </h3>

            <p
              style={{
                color:
                  "#64748b",

                lineHeight:
                  "1.6",
              }}
            >
              The University has already developed the
              societal solution. Your role is to explain
              how your Industry organization will support
              implementation, deployment, scaling and
              real-world adoption of that approved solution.
            </p>

            {!isUniversityProposalApproved(
              selectedProject
            ) ? (
              <div
                style={{
                  marginTop:
                    "15px",

                  padding:
                    "20px",

                  borderRadius:
                    "9px",

                  background:
                    "#fff7ed",

                  border:
                    "1px solid #fed7aa",

                  color:
                    "#9a3412",
                }}
              >
                <strong>
                  Industry Proposal Locked
                </strong>

                <p
                  style={{
                    marginBottom:
                      0,
                  }}
                >
                  The University Solution Proposal must
                  first be approved by the Government.
                </p>
              </div>
            ) : selectedProposal ? (
              <div
                style={{
                  marginTop:
                    "15px",

                  padding:
                    "22px",

                  borderRadius:
                    "9px",

                  background:
                    "#f8fafc",

                  border:
                    "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    padding:
                      "15px",

                    borderRadius:
                      "8px",

                    background:
                      "#eff6ff",

                    border:
                      "1px solid #bfdbfe",

                    color:
                      "#1e3a8a",

                    marginBottom:
                      "20px",
                  }}
                >
                  <strong>
                    Industry Implementation Proposal Submitted
                  </strong>

                  <p
                    style={{
                      marginBottom:
                        0,
                    }}
                  >
                    This proposal is based on the
                    Government-approved University solution
                    and is now under Government review.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "grid",

                    gap:
                      "18px",
                  }}
                >
                  <div>
                    <strong>
                      Implementation Plan
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedProposal
                        .implementationPlan ||
                        selectedProposal.description ||
                        selectedProposal.solution ||
                        "Not provided"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Industry Resources / Expertise
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedProposal
                        .industryResources ||
                        "Not provided"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Deployment & Scaling Plan
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedProposal
                        .deploymentPlan ||
                        selectedProposal.methodology ||
                        "Not provided"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Estimated Industry Cost
                    </strong>

                    <p
                      style={{
                        color:
                          "#475569",
                      }}
                    >
                      {selectedProposal
                        .estimatedCost ||
                        selectedProposal.budget ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Implementation Timeline
                    </strong>

                    <p
                      style={{
                        color:
                          "#475569",
                      }}
                    >
                      {selectedProposal
                        .implementationTimeline ||
                        selectedProposal.timeline ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Infrastructure / Technology
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedProposal
                        .infrastructureTechnology ||
                        selectedProposal.technicalApproach ||
                        "Not provided"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      Industry Contribution
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "7px",

                        padding:
                          "15px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",

                        borderRadius:
                          "7px",

                        lineHeight:
                          "1.7",

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {selectedProposal
                        .industryContribution ||
                        selectedProposal.expectedImpact ||
                        "Not provided"}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "5px",

                      padding:
                        "15px",

                      borderRadius:
                        "8px",

                      background:
                        selectedProposal
                          .governmentReviewStatus ===
                        "Approved"
                          ? "#f0fdf4"
                          : "#fff7ed",

                      border:
                        selectedProposal
                          .governmentReviewStatus ===
                        "Approved"
                          ? "1px solid #bbf7d0"
                          : "1px solid #fed7aa",
                    }}
                  >
                    <strong>
                      Government Review:
                    </strong>{" "}
                    {selectedProposal
                      .governmentReviewStatus ||
                      "Under Review"}
                  </div>

                  {selectedProposal
                    .governmentReviewComments && (
                    <div
                      style={{
                        padding:
                          "15px",

                        borderRadius:
                          "8px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <strong>
                        Government Comments:
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
                          selectedProposal
                            .governmentReviewComments
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form
                onSubmit={
                  submitIndustryProposal
                }
                style={{
                  marginTop:
                    "15px",

                  padding:
                    "22px",

                  borderRadius:
                    "9px",

                  background:
                    "#f8fafc",

                  border:
                    "1px solid #e2e8f0",
                }}
              >
                {/* APPROVED SOLUTION NOTICE */}

                <div
                  style={{
                    marginBottom:
                      "22px",

                    padding:
                      "16px",

                    borderRadius:
                      "8px",

                    background:
                      "#f0fdf4",

                    border:
                      "1px solid #bbf7d0",

                    color:
                      "#166534",
                  }}
                >
                  <strong>
                    ✓ University Solution Approved
                  </strong>

                  <p
                    style={{
                      marginBottom:
                        0,

                      marginTop:
                        "7px",

                      lineHeight:
                        "1.6",
                    }}
                  >
                    The Government has approved the
                    University's solution. You are not
                    required to create another solution.
                    Submit your organization's plan for
                    implementing and supporting the
                    approved University solution.
                  </p>
                </div>

                {/* IMPLEMENTATION PLAN */}

                <div
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <label>
                    <strong>
                      Industry Implementation Plan
                    </strong>
                  </label>

                  <p
                    style={{
                      margin:
                        "6px 0",

                      color:
                        "#64748b",

                      fontSize:
                        "14px",
                    }}
                  >
                    Explain how your organization will
                    implement the University's approved
                    solution in the real world.
                  </p>

                  <textarea
                    name="implementationPlan"
                    value={
                      proposalForm
                        .implementationPlan
                    }
                    onChange={
                      handleProposalChange
                    }
                    placeholder="Explain how your Industry organization will implement the approved University solution..."
                    rows="6"
                    required
                    style={{
                      width:
                        "100%",

                      padding:
                        "11px",

                      border:
                        "1px solid #cbd5e1",

                      borderRadius:
                        "6px",

                      boxSizing:
                        "border-box",

                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* INDUSTRY RESOURCES */}

                <div
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <label>
                    <strong>
                      Industry Resources / Expertise
                    </strong>
                  </label>

                  <p
                    style={{
                      margin:
                        "6px 0",

                      color:
                        "#64748b",

                      fontSize:
                        "14px",
                    }}
                  >
                    Describe the technical team,
                    infrastructure, equipment,
                    domain expertise or other resources
                    your organization will provide.
                  </p>

                  <textarea
                    name="industryResources"
                    value={
                      proposalForm
                        .industryResources
                    }
                    onChange={
                      handleProposalChange
                    }
                    placeholder="Describe your organization's resources, expertise, infrastructure and implementation team..."
                    rows="5"
                    required
                    style={{
                      width:
                        "100%",

                      padding:
                        "11px",

                      border:
                        "1px solid #cbd5e1",

                      borderRadius:
                        "6px",

                      boxSizing:
                        "border-box",

                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* DEPLOYMENT AND SCALING */}

                <div
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <label>
                    <strong>
                      Deployment & Scaling Plan
                    </strong>
                  </label>

                  <p
                    style={{
                      margin:
                        "6px 0",

                      color:
                        "#64748b",

                      fontSize:
                        "14px",
                    }}
                  >
                    Explain how the approved University
                    solution will be deployed, maintained
                    and scaled.
                  </p>

                  <textarea
                    name="deploymentPlan"
                    value={
                      proposalForm
                        .deploymentPlan
                    }
                    onChange={
                      handleProposalChange
                    }
                    placeholder="Explain deployment, maintenance, field rollout and scaling..."
                    rows="5"
                    required
                    style={{
                      width:
                        "100%",

                      padding:
                        "11px",

                      border:
                        "1px solid #cbd5e1",

                      borderRadius:
                        "6px",

                      boxSizing:
                        "border-box",

                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* COST + TIMELINE */}

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",

                    gap:
                      "15px",

                    marginBottom:
                      "18px",
                  }}
                >
                  <div>
                    <label>
                      <strong>
                        Estimated Industry Cost
                      </strong>
                    </label>

                    <input
                      type="text"
                      name="estimatedCost"
                      value={
                        proposalForm
                          .estimatedCost
                      }
                      onChange={
                        handleProposalChange
                      }
                      placeholder="Example: ₹5,00,000"
                      style={{
                        width:
                          "100%",

                        marginTop:
                          "7px",

                        padding:
                          "11px",

                        border:
                          "1px solid #cbd5e1",

                        borderRadius:
                          "6px",

                        boxSizing:
                          "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label>
                      <strong>
                        Implementation Timeline
                      </strong>
                    </label>

                    <input
                      type="text"
                      name="implementationTimeline"
                      value={
                        proposalForm
                          .implementationTimeline
                      }
                      onChange={
                        handleProposalChange
                      }
                      placeholder="Example: 6 months"
                      style={{
                        width:
                          "100%",

                        marginTop:
                          "7px",

                        padding:
                          "11px",

                        border:
                          "1px solid #cbd5e1",

                        borderRadius:
                          "6px",

                        boxSizing:
                          "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* INFRASTRUCTURE */}

                <div
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <label>
                    <strong>
                      Industry Infrastructure / Technology
                    </strong>
                  </label>

                  <p
                    style={{
                      margin:
                        "6px 0",

                      color:
                        "#64748b",

                      fontSize:
                        "14px",
                    }}
                  >
                    Explain the technology platforms,
                    infrastructure, facilities or
                    deployment systems that Industry will
                    provide.
                  </p>

                  <textarea
                    name="infrastructureTechnology"
                    value={
                      proposalForm
                        .infrastructureTechnology
                    }
                    onChange={
                      handleProposalChange
                    }
                    placeholder="Describe cloud infrastructure, IoT infrastructure, manufacturing facilities, deployment systems, technical platforms, etc..."
                    rows="5"
                    style={{
                      width:
                        "100%",

                      padding:
                        "11px",

                      border:
                        "1px solid #cbd5e1",

                      borderRadius:
                        "6px",

                      boxSizing:
                        "border-box",

                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* INDUSTRY CONTRIBUTION */}

                <div
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  <label>
                    <strong>
                      Expected Industry Contribution
                    </strong>
                  </label>

                  <p
                    style={{
                      margin:
                        "6px 0",

                      color:
                        "#64748b",

                      fontSize:
                        "14px",
                    }}
                  >
                    Explain the measurable contribution
                    Industry will make toward deployment,
                    adoption and societal impact.
                  </p>

                  <textarea
                    name="industryContribution"
                    value={
                      proposalForm
                        .industryContribution
                    }
                    onChange={
                      handleProposalChange
                    }
                    placeholder="Describe the expected contribution of Industry to implementation, adoption, sustainability and impact..."
                    rows="5"
                    style={{
                      width:
                        "100%",

                      padding:
                        "11px",

                      border:
                        "1px solid #cbd5e1",

                      borderRadius:
                        "6px",

                      boxSizing:
                        "border-box",

                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    submittingProposal
                  }
                  style={{
                    width:
                      "100%",

                    padding:
                      "13px 20px",

                    border:
                      "none",

                    borderRadius:
                      "7px",

                    background:
                      submittingProposal
                        ? "#94a3b8"
                        : "#16a34a",

                    color:
                      "#ffffff",

                    cursor:
                      submittingProposal
                        ? "not-allowed"
                        : "pointer",

                    fontWeight:
                      "700",

                    fontSize:
                      "15px",
                  }}
                >
                  {submittingProposal
                    ? "Submitting..."
                    : "Submit Industry Implementation Proposal"}
                </button>
              </form>
            )}
          </div>

          {/* =================================================
              NEXT PROJECT STAGE
          ================================================= */}

          <div
            style={{
              marginTop:
                "25px",

              padding:
                "22px",

              borderRadius:
                "9px",

              background:
                "#f8fafc",

              border:
                "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                marginTop:
                  0,
              }}
            >
              Next Project Stage
            </h3>

            {!selectedProject.universityProposal ? (
              <div>
                <strong>
                  Awaiting University Solution
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  The University has not submitted
                  its solution proposal yet.
                </p>
              </div>
            ) : selectedProject
                .universityProposal
                .governmentReviewStatus !==
              "Approved" ? (
              <div>
                <strong>
                  Awaiting Government Approval
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  The Government must approve the
                  University solution before Industry
                  can submit its implementation plan.
                </p>
              </div>
            ) : !selectedProposal ? (
              <div>
                <strong>
                  Industry Implementation Proposal Required
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  The University solution has been
                  approved. Industry must now submit its
                  implementation, deployment and support
                  plan.
                </p>
              </div>
            ) : selectedProposal
                .governmentReviewStatus ===
              "Approved" ? (
              <div>
                <strong
                  style={{
                    color:
                      "#15803d",
                  }}
                >
                  ✓ Industry Implementation Approved
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  The Government has approved the
                  Industry implementation proposal.
                  The University can continue to
                  Prototype & Testing.
                </p>
              </div>
            ) : selectedProposal
                .governmentReviewStatus ===
              "Changes Requested" ? (
              <div>
                <strong
                  style={{
                    color:
                      "#c2410c",
                  }}
                >
                  Changes Requested by Government
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  Government has requested changes to
                  the Industry Implementation Proposal.
                  Please review the requested changes
                  and resubmit the proposal.
                </p>
              </div>
            ) : (
              <div>
                <strong>
                  Awaiting Government Approval
                </strong>

                <p
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  The Industry implementation proposal
                  has been submitted and is waiting for
                  Government review.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              STAKEHOLDER COMMUNICATION THREAD
          ================================================= */}
          <div style={{ marginTop: "25px" }}>
            <StakeholderChat
              problemId={
                selectedProject?.problemId ||
                selectedProject?.problem?.problemId ||
                selectedProject?.problem?.id ||
                selectedProject?.id
              }
              currentUser={JSON.parse(localStorage.getItem("currentUser") || "{}")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Industry;