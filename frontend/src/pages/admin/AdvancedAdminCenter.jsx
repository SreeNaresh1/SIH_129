import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import "../../App.css";

function AdvancedAdminCenter() {
  const [analytics, setAnalytics] = useState(null);
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  /* ================================
     INDUSTRY ACCOUNT FORM
  ================================= */

  const [industryForm, setIndustryForm] = useState({
    name: "",
    organization: "",
    email: "",
    password: "",
    sector: "",
    expertise: "",
    contactEmail: "",
  });

  const [industryBusy, setIndustryBusy] = useState(false);

  const load = async () => {
    try {
      const [a, p] = await Promise.all([
        api("/advanced/analytics"),
        api("/problems/"),
      ]);

      setAnalytics(a);
      setProblems(p.problems || []);
    } catch (e) {
      setMessage(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================================
     AI ANALYSIS
  ================================= */

  const analyze = async (id) => {
    setBusy(true);
    setMessage("");

    try {
      await api(`/advanced/problems/${id}/ai-analyze`, {
        method: "POST",
      });

      const m = await api(`/advanced/problems/${id}/matches`);

      setSelected(id);
      setMatches(m.matches || []);

      await load();

      setMessage(
        "AI analysis completed. Matching universities are shown below."
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  /* ================================
     UNIVERSITY ASSIGNMENT
  ================================= */

  const assign = async (universityId) => {
    try {
      await api(`/advanced/problems/${selected}/assign`, {
        method: "POST",
        body: JSON.stringify({
          universityId,
        }),
      });

      setMessage(
        "Challenge assigned to the selected university."
      );

      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  /* ================================
     INDUSTRY FORM CHANGE
  ================================= */

  const handleIndustryChange = (e) => {
    const { name, value } = e.target;

    setIndustryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================================
     CREATE PRIVATE INDUSTRY ACCOUNT
  ================================= */

  const createIndustryAccount = async (e) => {
    e.preventDefault();

    setIndustryBusy(true);
    setMessage("");

    try {
      await api("/auth/government/create-industry-user", {
        method: "POST",
        body: JSON.stringify(industryForm),
      });

      setMessage(
        "Private Industry account created successfully. The Industry can now login using the created email and password."
      );

      setIndustryForm({
        name: "",
        organization: "",
        email: "",
        password: "",
        sector: "",
        expertise: "",
        contactEmail: "",
      });
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIndustryBusy(false);
    }
  };

  return (
    <div className="admin-dashboard">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <span>SI</span> Admin Portal
        </div>

        <nav className="admin-menu">

          <Link to="/admin">
            📊 Dashboard
          </Link>

          <Link to="/admin/advanced">
            🤖 AI & Analytics
          </Link>

          <a href="#matching">
            🎓 University Matching
          </a>

          <a href="#industry">
            🏢 Industry
          </a>

        </nav>

        <div className="admin-logout">
          <Link to="/login">
            🚪 Logout
          </Link>
        </div>

      </aside>

      {/* ================================
          MAIN
      ================================= */}

      <main className="admin-main">

        <div className="admin-header">

          <div>
            <h1>
              Advanced Government Control Center
            </h1>

            <p>
              AI triage, university matching, impact and ecosystem analytics.
            </p>
          </div>

          <Link
            to="/admin"
            className="back-link"
          >
            ← Basic Dashboard
          </Link>

        </div>

        {/* ================================
            MESSAGE
        ================================= */}

        {message && (
          <div
            style={{
              padding: 12,
              background: "#eef6ff",
              borderRadius: 10,
              marginBottom: 18,
            }}
          >
            {message}
          </div>
        )}

        {/* ================================
            ANALYTICS
        ================================= */}

        {analytics && (
          <div
            className="participant-grid"
            style={{ marginBottom: 25 }}
          >

            {[
              [
                "Challenges",
                analytics.totals.problems,
              ],
              [
                "Projects",
                analytics.totals.projects,
              ],
              [
                "Completed",
                analytics.totals.completed,
              ],
              [
                "Milestones",
                analytics.totals.milestones,
              ],
              [
                "Funding",
                `₹${Number(
                  analytics.totals.totalFunding || 0
                ).toLocaleString()}`,
              ],
            ].map(([k, v]) => (
              <div
                className="participant-card"
                key={k}
              >
                <h3>{k}</h3>

                <strong
                  style={{ fontSize: 28 }}
                >
                  {v}
                </strong>
              </div>
            ))}

          </div>
        )}

        {/* ================================
            AI PRIORITIZATION
        ================================= */}

        <section className="details-card">

          <h2>
            AI Prioritization & University Matching
          </h2>

          <p>
            Run the actual AI service against a challenge,
            then inspect the database-backed university match.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >

            {problems.slice(0, 12).map((p) => (

              <div
                key={p.problemId}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 15,
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    flexWrap: "wrap",
                  }}
                >

                  <div>

                    <strong>
                      {p.problemId} — {p.title}
                    </strong>

                    <div
                      style={{
                        color: "#64748b",
                      }}
                    >
                      {p.district} ·{" "}
                      {p.aiDomain || p.domain} · Priority{" "}
                      {p.priorityScore ?? "Pending"}
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      analyze(p.problemId)
                    }
                    disabled={busy}
                  >
                    {busy
                      ? "Processing…"
                      : "AI Analyze & Match"}
                  </button>

                </div>

                {selected === p.problemId && (
                  <div
                    id="matching"
                    style={{
                      marginTop: 14,
                    }}
                  >

                    {matches.length === 0 ? (

                      <p>
                        No database match found.
                        Seed university expertise first.
                      </p>

                    ) : (

                      matches.map((m) => (

                        <div
                          key={m.university.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderTop:
                              "1px solid #f1f5f9",
                          }}
                        >

                          <div>

                            <strong>
                              {m.university.name}
                            </strong>

                            <div
                              style={{
                                fontSize: 13,
                                color: "#64748b",
                              }}
                            >
                              {m.reasons.join(" · ") ||
                                "Profile match"}
                            </div>

                          </div>

                          <button
                            onClick={() =>
                              assign(m.university.id)
                            }
                          >
                            Assign (
                            {Math.round(m.score)}
                            )
                          </button>

                        </div>

                      ))

                    )}

                  </div>
                )}

              </div>

            ))}

          </div>

        </section>

        {/* ================================
            PRIVATE INDUSTRY ACCOUNT
        ================================= */}

        <section
          id="industry"
          className="details-card"
          style={{
            marginTop: 25,
          }}
        >

          <h2>
            🏢 Private Industry Account Management
          </h2>

          <p>
            Government can create private Industry accounts.
            Industry accounts are not available through public registration.
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              marginTop: 18,
            }}
          >

            <h3>
              Create Industry Account
            </h3>

            <form
              onSubmit={createIndustryAccount}
              style={{
                display: "grid",
                gap: 16,
                marginTop: 15,
              }}
            >

              {/* INDUSTRY ADMIN NAME */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Industry Admin Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={industryForm.name}
                  onChange={handleIndustryChange}
                  placeholder="Enter industry admin name"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* ORGANIZATION */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Organization Name
                </label>

                <input
                  type="text"
                  name="organization"
                  value={industryForm.organization}
                  onChange={handleIndustryChange}
                  placeholder="Enter company / organization name"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* LOGIN EMAIL */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Official Login Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={industryForm.email}
                  onChange={handleIndustryChange}
                  placeholder="industry@company.com"
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Login Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={industryForm.password}
                  onChange={handleIndustryChange}
                  placeholder="Create login password"
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* SECTOR */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Industry Sector
                </label>

                <input
                  type="text"
                  name="sector"
                  value={industryForm.sector}
                  onChange={handleIndustryChange}
                  placeholder="Example: Manufacturing, IT, Energy"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* EXPERTISE */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Expertise
                </label>

                <textarea
                  name="expertise"
                  value={industryForm.expertise}
                  onChange={handleIndustryChange}
                  placeholder="Describe the organization's expertise"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />

              </div>

              {/* CONTACT EMAIL */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Contact Email
                </label>

                <input
                  type="email"
                  name="contactEmail"
                  value={industryForm.contactEmail}
                  onChange={handleIndustryChange}
                  placeholder="Contact email"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border:
                      "1px solid #cbd5e1",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={industryBusy}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: 8,
                  cursor: industryBusy
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 600,
                }}
              >
                {industryBusy
                  ? "Creating Industry Account..."
                  : "🏢 Create Private Industry Account"}
              </button>

            </form>

          </div>

        </section>

        {/* ================================
            DISTRICT & DOMAIN ANALYTICS
        ================================= */}

        {analytics && (
          <section
            className="details-card"
            style={{
              marginTop: 25,
            }}
          >

            <h2>
              District & Domain Analytics
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: 15,
              }}
            >

              <div>

                <h3>
                  By Domain
                </h3>

                {Object.entries(
                  analytics.byDomain
                ).map(([k, v]) => (

                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "6px 0",
                    }}
                  >

                    <span>{k}</span>

                    <strong>{v}</strong>

                  </div>

                ))}

              </div>

              <div>

                <h3>
                  By District
                </h3>

                {Object.entries(
                  analytics.byDistrict
                ).map(([k, v]) => (

                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "6px 0",
                    }}
                  >

                    <span>{k}</span>

                    <strong>{v}</strong>

                  </div>

                ))}

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdvancedAdminCenter;