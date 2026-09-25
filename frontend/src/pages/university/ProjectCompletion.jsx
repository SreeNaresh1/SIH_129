import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api";

export default function ProjectCompletion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const problemId = searchParams.get("problemId");

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    completionTitle:
      "Smart Drinking Water Management System Successfully Implemented",

    workCompleted:
      "The proposed smart drinking water management system was developed and implemented in the selected rural area. The system uses IoT-based water-level sensors, water-quality monitoring sensors, and a centralized monitoring mechanism to track the availability and quality of drinking water. The system was installed at the identified water source and tested under actual field conditions.\n\nThe student innovation team completed system installation, sensor integration, data collection, testing, and deployment activities with guidance from the faculty mentor.",

    finalResults:
      "The implemented system successfully monitored water availability and basic water-quality parameters. Real-time information from the sensors helped identify water-level changes and potential quality issues. The system reduced the need for continuous manual monitoring and provided timely information for taking corrective action.\n\nField testing confirmed that the prototype operated successfully under the selected deployment conditions.",

    challenges:
      "The major challenges during implementation were sensor calibration, maintaining stable sensor readings, providing reliable power supply, and ensuring connectivity at the deployment location. Environmental conditions and limited infrastructure also required adjustments during installation and testing.\n\nThese issues were addressed through repeated testing, sensor calibration, system adjustments, and field-level validation.",

    beneficiaries: "250",

    finalImpact:
      "The project improved the monitoring of drinking water availability and quality in the selected community. It reduced dependence on manual inspection and enabled faster identification of potential water-related issues.\n\nThe implementation provides a practical technology-based approach for improving drinking water monitoring and can be extended to additional rural locations in the future.",

    completionDate: "2026-09-23",

    // Innovation Outcomes (NEP 2020 / Problem Statement requirement)
    patentFiled: false,
    patentTitle: "",
    startupCreated: false,
    startupName: "",
    techTransferDone: false,
    techTransferPartner: "",
    communityDeployed: true,
    directBeneficiaries: "250"
  });

  useEffect(() => {
    loadProject();
  }, [problemId]);

  async function loadProject() {
    try {
      setLoading(true);

      if (!problemId) {
        alert("Problem ID is missing.");
        navigate("/university");
        return;
      }

      const response = await api(
        `/advanced/projects/problem/${encodeURIComponent(problemId)}`
      );

      if (!response?.success || !response?.project) {
        alert(
          response?.message ||
            "Project could not be found for this problem."
        );
        return;
      }

      setProject(response.project);

      // Load existing completion record if one already exists.
      try {
        const completionResponse = await api(
          `/advanced/project-completion/project/${response.project.id}`
        );

        if (
          completionResponse?.success &&
          completionResponse?.completion
        ) {
          const completion = completionResponse.completion;

          setFormData({
            completionTitle:
              completion.completionTitle || "",

            workCompleted:
              completion.workCompleted || "",

            finalResults:
              completion.finalResults || "",

            challenges:
              completion.challenges || "",

            beneficiaries:
              completion.beneficiaries?.toString() || "",

            finalImpact:
              completion.finalImpact || "",

            completionDate:
              completion.completionDate
                ? String(completion.completionDate).slice(0, 10)
                : "2026-09-23",

            patentFiled: completion.patentFiled || false,
            patentTitle: completion.patentTitle || "",
            startupCreated: completion.startupCreated || false,
            startupName: completion.startupName || "",
            techTransferDone: completion.techTransferDone || false,
            techTransferPartner: completion.techTransferPartner || "",
            communityDeployed: completion.communityDeployed !== false,
            directBeneficiaries: completion.directBeneficiaries?.toString() || completion.beneficiaries?.toString() || ""
          });
        }
      } catch (completionError) {
        // A missing completion record is normal for a new completion form.
        // Do not stop the page from loading.
        console.log(
          "No existing project completion found."
        );
      }
    } catch (error) {
      console.error("Error loading project:", error);

      alert(
        error?.message ||
          "Unable to load the project."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!project?.id) {
      alert("Project information is not available.");
      return;
    }

    if (!formData.completionTitle.trim()) {
      alert("Please enter the completion title.");
      return;
    }

    if (!formData.workCompleted.trim()) {
      alert("Please enter the work completed.");
      return;
    }

    if (!formData.finalResults.trim()) {
      alert("Please enter the final results.");
      return;
    }

    if (!formData.challenges.trim()) {
      alert("Please enter the challenges faced.");
      return;
    }

    if (!formData.beneficiaries.trim()) {
      alert("Please enter the number of actual beneficiaries.");
      return;
    }

    if (!formData.finalImpact.trim()) {
      alert("Please enter the final impact.");
      return;
    }

    if (!formData.completionDate) {
      alert("Please select the completion date.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT:
       * This is the correct backend endpoint.
       *
       * Correct:
       * /advanced/project-completion/project/:projectId
       *
       * NOT:
       * /advanced/completions/project/:projectId
       */
      const response = await api(
        `/advanced/project-completion/project/${project.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            completionTitle:
              formData.completionTitle.trim(),

            workCompleted:
              formData.workCompleted.trim(),

            finalResults:
              formData.finalResults.trim(),

            challenges:
              formData.challenges.trim(),

            beneficiaries:
              Number(formData.beneficiaries),

            finalImpact:
              formData.finalImpact.trim(),

            completionDate:
              formData.completionDate,

            // Innovation Outcomes
            patentFiled: formData.patentFiled,
            patentTitle: formData.patentTitle.trim(),
            startupCreated: formData.startupCreated,
            startupName: formData.startupName.trim(),
            techTransferDone: formData.techTransferDone,
            techTransferPartner: formData.techTransferPartner.trim(),
            communityDeployed: formData.communityDeployed,
            directBeneficiaries: Number(formData.directBeneficiaries || formData.beneficiaries)
          })
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Project completion could not be submitted."
        );
      }

      alert(
        "Project completion submitted successfully."
      );

      navigate(
        `/university/problem/${encodeURIComponent(problemId)}`
      );
    } catch (error) {
      console.error(
        "Project completion submission error:",
        error
      );

      alert(
        error?.message ||
          "Failed to submit project completion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "30px 40px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            fontSize: "16px",
            color: "#333"
          }}
        >
          Loading project...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "40px",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h2>Project Not Found</h2>

          <p>
            No project was found for problem{" "}
            <strong>{problemId}</strong>.
          </p>

          <button
            type="button"
            onClick={() => navigate("/university")}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#1d4ed8",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Back to University Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0 0 8px",
                  color: "#1f2937"
                }}
              >
                Project Completion
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280"
                }}
              >
                Submit the final project completion details.
              </p>
            </div>

            <div
              style={{
                background: "#eef2ff",
                padding: "10px 16px",
                borderRadius: "8px",
                color: "#3730a3",
                fontWeight: "600"
              }}
            >
              Project ID: {project.id}
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              background: "#f9fafb",
              borderRadius: "8px"
            }}
          >
            <strong>Problem ID:</strong>{" "}
            {problemId}
          </div>
        </div>

        {/* Completion Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Completion Title *
            </label>

            <input
              type="text"
              name="completionTitle"
              value={formData.completionTitle}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter project completion title"
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Work Completed *
            </label>

            <textarea
              name="workCompleted"
              value={formData.workCompleted}
              onChange={handleChange}
              required
              rows={7}
              style={textareaStyle}
              placeholder="Describe the work completed..."
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Final Results / Outcomes *
            </label>

            <textarea
              name="finalResults"
              value={formData.finalResults}
              onChange={handleChange}
              required
              rows={7}
              style={textareaStyle}
              placeholder="Describe the final results and outcomes..."
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Challenges Faced *
            </label>

            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              required
              rows={6}
              style={textareaStyle}
              placeholder="Describe challenges faced during implementation..."
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Actual Beneficiaries *
            </label>

            <input
              type="number"
              name="beneficiaries"
              value={formData.beneficiaries}
              onChange={handleChange}
              min="0"
              required
              style={inputStyle}
              placeholder="Number of beneficiaries"
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Final Impact *
            </label>

            <textarea
              name="finalImpact"
              value={formData.finalImpact}
              onChange={handleChange}
              required
              rows={6}
              style={textareaStyle}
              placeholder="Describe the final impact of the project..."
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#1f2937"
              }}
            >
              Completion Date *
            </label>

            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* ====================================================
              INNOVATION OUTCOMES (NEP 2020 / Problem Statement)
          ==================================================== */}
          <div style={{ marginBottom: "28px", padding: "22px", background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: "12px", border: "1px solid #bae6fd" }}>
            <h3 style={{ margin: "0 0 18px", color: "#0369a1", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              🚀 Innovation Outcomes <span style={{ fontSize: "12px", fontWeight: 400, color: "#0284c7" }}>(Required for NEP 2020 & Analytics Dashboard)</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

              {/* Patent */}
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e0f2fe" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
                  <input type="checkbox" name="patentFiled" checked={formData.patentFiled} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>🏅 Patent / IP Filed</span>
                </label>
                {formData.patentFiled && (
                  <input type="text" name="patentTitle" value={formData.patentTitle} onChange={handleChange} placeholder="Patent title or application number" style={{ ...inputStyle, marginTop: 0, fontSize: "13px" }} />
                )}
              </div>

              {/* Startup */}
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e0f2fe" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
                  <input type="checkbox" name="startupCreated" checked={formData.startupCreated} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>🌱 Startup Spawned</span>
                </label>
                {formData.startupCreated && (
                  <input type="text" name="startupName" value={formData.startupName} onChange={handleChange} placeholder="Startup / venture name" style={{ ...inputStyle, marginTop: 0, fontSize: "13px" }} />
                )}
              </div>

              {/* Tech Transfer */}
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e0f2fe" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
                  <input type="checkbox" name="techTransferDone" checked={formData.techTransferDone} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>🔄 Technology Transfer</span>
                </label>
                {formData.techTransferDone && (
                  <input type="text" name="techTransferPartner" value={formData.techTransferPartner} onChange={handleChange} placeholder="Industry partner for handover" style={{ ...inputStyle, marginTop: 0, fontSize: "13px" }} />
                )}
              </div>

              {/* Community Deployment */}
              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e0f2fe" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
                  <input type="checkbox" name="communityDeployed" checked={formData.communityDeployed} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>🚀 Solution Deployed in Community</span>
                </label>
                <input type="number" name="directBeneficiaries" value={formData.directBeneficiaries} onChange={handleChange} min="0" placeholder="Direct beneficiaries post-deployment" style={{ ...inputStyle, marginTop: 0, fontSize: "13px" }} />
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/university/problem/${encodeURIComponent(
                    problemId
                  )}`
                )
              }
              disabled={submitting}
              style={{
                padding: "12px 22px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#374151",
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: submitting
                  ? "#9ca3af"
                  : "#1d4ed8",
                color: "#ffffff",
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600"
              }}
            >
              {submitting
                ? "Submitting..."
                : "Submit Completion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  background: "#ffffff"
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
  lineHeight: "1.5",
  background: "#ffffff"
};