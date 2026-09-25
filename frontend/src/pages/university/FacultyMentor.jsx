import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api";
import "../../App.css";

function FacultyMentor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const problemId = searchParams.get("problemId");

  const [problem, setProblem] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [mentor, setMentor] = useState("");
  const [existingMentor, setExistingMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!problemId) {
      setError("Problem ID is missing.");
      setLoading(false);
      return;
    }

    loadMentorData();
  }, [problemId]);

  async function loadMentorData() {
    try {
      setLoading(true);
      setError("");

      const response = await api(
        `/advanced/university/mentor/${encodeURIComponent(
          problemId
        )}`
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load mentor information."
        );
      }

      setProblem(response.problem || null);
      setFaculty(response.faculty || []);

      if (response.mentor) {
        setExistingMentor(response.mentor);

        if (response.mentor.facultyId) {
          setMentor(String(response.mentor.facultyId));
        }
      } else {
        setExistingMentor(null);
        setMentor("");
      }
    } catch (err) {
      console.error("Mentor loading error:", err);

      setError(
        err.message ||
          "Unable to load faculty mentor information."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedFaculty = faculty.find(
    (item) => String(item.id) === String(mentor)
  );

  async function assignMentor() {
    if (!mentor) {
      alert("Please select a faculty mentor.");
      return;
    }

    if (!problemId) {
      alert("Problem ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api(
        `/advanced/university/mentor/${encodeURIComponent(
          problemId
        )}`,
        {
          method: "POST",
          body: JSON.stringify({
            facultyId: Number(mentor)
          })
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to assign faculty mentor."
        );
      }

      alert(
        response.message ||
          "Faculty mentor assigned successfully!"
      );

      /*
       * IMPORTANT:
       * Go back to the exact problem workflow.
       * Do NOT go only to /university because then the
       * workflow page may not know which problem was updated.
       */
      navigate(
        `/university/problem/${encodeURIComponent(
          problemId
        )}`
      );
    } catch (err) {
      console.error("Mentor assignment error:", err);

      alert(
        err.message ||
          "Unable to assign faculty mentor."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="university-dashboard">
        <aside className="university-sidebar">
          <div className="university-logo">
            <span>SI</span>
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

        <main className="university-main">
          <div className="university-header">
            <div>
              <h1>Faculty Mentor</h1>
              <p>
                Assign a faculty mentor to guide
                the student innovation team.
              </p>
            </div>

            <Link
              to="/university"
              className="back-link"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mentor-card">
            <h2>Loading Faculty...</h2>
            <p className="mentor-description">
              Loading the assigned challenge and
              faculty members from the database.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-dashboard">
        <aside className="university-sidebar">
          <div className="university-logo">
            <span>SI</span>
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

        <main className="university-main">
          <div className="university-header">
            <div>
              <h1>Faculty Mentor</h1>
              <p>
                Assign a faculty mentor to guide
                the student innovation team.
              </p>
            </div>

            <Link
              to="/university"
              className="back-link"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mentor-card">
            <h2>Unable to Load Mentor Information</h2>

            <p className="mentor-description">
              {error}
            </p>

            <div className="mentor-actions">
              <Link
                to={
                  problemId
                    ? `/university/problem/${problemId}`
                    : "/university"
                }
                className="cancel-team-button"
              >
                ← Back
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="university-dashboard">
      <aside className="university-sidebar">
        <div className="university-logo">
          <span>SI</span>
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

      <main className="university-main">
        <div className="university-header">
          <div>
            <h1>Faculty Mentor</h1>

            <p>
              Assign a faculty mentor to guide
              the student innovation team.
            </p>
          </div>

          <Link
            to={
              problemId
                ? `/university/problem/${problemId}`
                : "/university"
            }
            className="back-link"
          >
            ← Back to Challenge
          </Link>
        </div>

        <div className="mentor-card">
          <h2>Assign Faculty Mentor</h2>

          <p className="mentor-description">
            Select a faculty member whose expertise
            matches the societal challenge.
          </p>

          {/* ACTUAL PROBLEM FROM MYSQL */}
          <div className="mentor-challenge">
            <span>Current Challenge</span>

            <strong>
              {problem?.title || "Assigned Challenge"}
            </strong>

            <small>
              {problem?.domain || "—"}
              {" • "}
              {problem?.severity || "—"}
              {" • "}
              {problem?.district || "—"}
            </small>
          </div>

          {existingMentor && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "#eef7ee",
                border: "1px solid #b9dfb9"
              }}
            >
              <strong>
                ✓ Mentor Already Assigned
              </strong>

              <div style={{ marginTop: "5px" }}>
                {existingMentor.faculty?.name ||
                  selectedFaculty?.name ||
                  "Faculty Mentor"}
              </div>
            </div>
          )}

          <div className="mentor-field">
            <label>Faculty Mentor *</label>

            <select
              value={mentor}
              onChange={(e) =>
                setMentor(e.target.value)
              }
              disabled={saving}
            >
              <option value="">
                Select Faculty Mentor
              </option>

              {faculty.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name}
                  {" — "}
                  {member.department}
                </option>
              ))}
            </select>

            {faculty.length === 0 && (
              <small
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: "#b42318"
                }}
              >
                No available faculty members were
                found for this university.
              </small>
            )}
          </div>

          {selectedFaculty && (
            <div className="selected-mentor">
              <div className="mentor-avatar">
                👨‍🏫
              </div>

              <div>
                <h3>
                  {selectedFaculty.name}
                </h3>

                <p>
                  {selectedFaculty.department}
                </p>

                <span>
                  Expertise:{" "}
                  {selectedFaculty.expertise}
                </span>
              </div>
            </div>
          )}

          <div className="mentor-actions">
            <Link
              to={
                problemId
                  ? `/university/problem/${problemId}`
                  : "/university"
              }
              className="cancel-team-button"
            >
              Cancel
            </Link>

            <button
              className="assign-mentor-button"
              onClick={assignMentor}
              disabled={
                saving ||
                faculty.length === 0
              }
            >
              {saving
                ? "Saving..."
                : existingMentor
                ? "👨‍🏫 Reassign Mentor"
                : "👨‍🏫 Assign Mentor"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FacultyMentor;