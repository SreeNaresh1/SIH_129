import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";
import "../../App.css";
import { api } from "../../api";

function CreateTeam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const problemId = searchParams.get("problemId");

  const [teamName, setTeamName] = useState("");

  const [students, setStudents] = useState([
    {
      name: "",
      department: ""
    },
    {
      name: "",
      department: ""
    }
  ]);

  const [existingTeam, setExistingTeam] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      if (!problemId) {
        setError(
          "Problem ID is missing. Please open this page from the assigned challenge."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api(
          `/advanced/university/team/${encodeURIComponent(
            problemId
          )}`
        );

        if (
          response &&
          response.success &&
          response.team
        ) {
          setExistingTeam(response.team);

          setTeamName(
            response.team.name || ""
          );

          if (
            Array.isArray(response.members) &&
            response.members.length > 0
          ) {
            setStudents(
              response.members.map(
                (member) => ({
                  name:
                    member.studentName || "",
                  department:
                    member.department || ""
                })
              )
            );
          }
        }
      } catch (err) {
        console.error(
          "Load student team error:",
          err
        );

        /*
         * 404 simply means that a team has
         * not been created yet.
         */
        if (
          err?.response?.status === 404
        ) {
          setExistingTeam(null);
        } else {
          setError(
            err?.message ||
              "Unable to load student team."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [problemId]);

  const handleStudentChange = (
    index,
    field,
    value
  ) => {
    setStudents((current) =>
      current.map(
        (student, studentIndex) =>
          studentIndex === index
            ? {
                ...student,
                [field]: value
              }
            : student
      )
    );
  };

  const addStudent = () => {
    setStudents((current) => [
      ...current,
      {
        name: "",
        department: ""
      }
    ]);
  };

  const removeStudent = (index) => {
    if (students.length <= 1) {
      return;
    }

    setStudents((current) =>
      current.filter(
        (_, studentIndex) =>
          studentIndex !== index
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!problemId) {
      alert(
        "Problem ID is missing."
      );

      return;
    }

    if (!teamName.trim()) {
      alert(
        "Please enter the team name."
      );

      return;
    }

    const cleanedStudents =
      students.map((student) => ({
        name: student.name.trim(),
        department:
          student.department.trim()
      }));

    const invalidStudent =
      cleanedStudents.find(
        (student) =>
          !student.name ||
          !student.department
      );

    if (invalidStudent) {
      alert(
        "Please enter the student name and department for every team member."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api(
        `/advanced/university/team/${encodeURIComponent(
          problemId
        )}`,
        {
          method: "POST",

          body: JSON.stringify({
            name: teamName.trim(),

            students:
              cleanedStudents
          })
        }
      );

      if (
        !response ||
        !response.success
      ) {
        throw new Error(
          response?.message ||
            "Unable to save student team."
        );
      }

      alert(
        "Student team saved successfully!"
      );

      navigate(
        `/university/problem/${encodeURIComponent(
          problemId
        )}`
      );
    } catch (err) {
      console.error(
        "Save student team error:",
        err
      );

      const message =
        err?.message ||
        "Unable to save student team.";

      setError(message);

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="university-empty">
        <h2>
          Loading student team...
        </h2>
      </div>
    );
  }

  return (
    <div className="university-dashboard">

      {/* SIDEBAR */}

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

        </nav>

        <div className="university-logout">

          <Link to="/">
            🚪 Logout
          </Link>

        </div>

      </aside>

      {/* MAIN */}

      <main className="university-main">

        <div className="university-header">

          <div>

            <h1>
              Create Student Team
            </h1>

            <p>
              Form a multidisciplinary team
              to work on the assigned challenge.
            </p>

          </div>

          <Link
            to={
              problemId
                ? `/university/problem/${encodeURIComponent(
                    problemId
                  )}`
                : "/university"
            }
            className="back-link"
          >
            ← Back to Challenge
          </Link>

        </div>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fecaca"
            }}
          >
            {error}
          </div>
        )}

        <section className="university-details-card">

          <div className="university-details-header">

            <div>

              <span className="university-problem-id">
                STEP 02
              </span>

              <h2>
                Team Information
              </h2>

              <p>
                Add students from different
                departments who will collaborate
                on the assigned challenge.
              </p>

            </div>

            {existingTeam && (
              <span className="university-progress">
                Team Saved
              </span>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
          >

            {/* TEAM NAME */}

            <div
              className="university-detail-section"
            >

              <h3>
                Team Name *
              </h3>

              <input
                type="text"
                value={teamName}
                onChange={(event) =>
                  setTeamName(
                    event.target.value
                  )
                }
                placeholder="Enter team name"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border:
                    "1px solid #d1d5db",
                  fontSize: "15px"
                }}
              />

            </div>

            {/* STUDENTS */}

            <div
              className="university-detail-section"
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "18px"
                }}
              >

                <div>

                  <h3>
                    Team Members
                  </h3>

                  <p>
                    Add students from the
                    university who will work
                    on this challenge.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={addStudent}
                  style={{
                    padding:
                      "10px 16px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    background:
                      "#f8fafc",
                    cursor:
                      "pointer",
                    fontWeight:
                      "600"
                  }}
                >
                  + Add Student
                </button>

              </div>

              {students.map(
                (student, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "45px 1fr 1fr 50px",
                      gap: "12px",
                      alignItems: "end",
                      padding: "18px",
                      marginBottom: "14px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        "10px",
                      background:
                        "#fafafa"
                    }}
                  >

                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius:
                          "50%",
                        background:
                          "#e8eefc",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontWeight:
                          "700"
                      }}
                    >
                      {index + 1}
                    </div>

                    <div>

                      <label>
                        Student Name
                      </label>

                      <input
                        type="text"
                        value={
                          student.name
                        }
                        onChange={(event) =>
                          handleStudentChange(
                            index,
                            "name",
                            event.target
                              .value
                          )
                        }
                        placeholder="Student name"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "11px",
                          marginTop:
                            "7px",
                          borderRadius:
                            "8px",
                          border:
                            "1px solid #d1d5db"
                        }}
                      />

                    </div>

                    <div>

                      <label>
                        Department
                      </label>

                      <select
                        value={
                          student.department
                        }
                        onChange={(event) =>
                          handleStudentChange(
                            index,
                            "department",
                            event.target
                              .value
                          )
                        }
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "11px",
                          marginTop:
                            "7px",
                          borderRadius:
                            "8px",
                          border:
                            "1px solid #d1d5db",
                          background:
                            "white"
                        }}
                      >

                        <option value="">
                          Select Department
                        </option>

                        <option value="Computer Science">
                          Computer Science
                        </option>

                        <option value="Information Technology">
                          Information Technology
                        </option>

                        <option value="Electronics and Communication">
                          Electronics and Communication
                        </option>

                        <option value="Electrical Engineering">
                          Electrical Engineering
                        </option>

                        <option value="Mechanical Engineering">
                          Mechanical Engineering
                        </option>

                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>

                        <option value="Environmental Engineering">
                          Environmental Engineering
                        </option>

                        <option value="Biotechnology">
                          Biotechnology
                        </option>

                        <option value="Chemical Engineering">
                          Chemical Engineering
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeStudent(index)
                      }
                      disabled={
                        students.length <= 1
                      }
                      style={{
                        height:
                          "42px",
                        borderRadius:
                          "8px",
                        border:
                          "1px solid #fecaca",
                        background:
                          students.length <=
                          1
                            ? "#f3f4f6"
                            : "#fff1f2",
                        color:
                          students.length <=
                          1
                            ? "#9ca3af"
                            : "#dc2626",
                        cursor:
                          students.length <=
                          1
                            ? "not-allowed"
                            : "pointer",
                        fontSize:
                          "18px"
                      }}
                    >
                      ×
                    </button>

                  </div>
                )
              )}

            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "12px",
                marginTop: "25px"
              }}
            >

              <Link
                to={
                  problemId
                    ? `/university/problem/${encodeURIComponent(
                        problemId
                      )}`
                    : "/university"
                }
                className="back-link"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="university-accept-button"
              >
                {saving
                  ? "Saving..."
                  : existingTeam
                  ? "✓ Update Team"
                  : "✓ Save Team"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default CreateTeam;