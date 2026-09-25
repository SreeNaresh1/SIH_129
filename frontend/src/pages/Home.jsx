import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6%",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* LOGO */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "19px",
              fontWeight: "800",
            }}
          >
            SI
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              Societal Innovation
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Innovation Portal
            </div>
          </div>
        </div>

        {/* LOGIN */}

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 22px",
            borderRadius: "8px",
            border: "1px solid #2563eb",
            background: "#ffffff",
            color: "#2563eb",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>
        <section
          style={{
            padding: "80px 6% 70px",
            textAlign: "center",
            background:
              "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)",
          }}
        >
          <div
            style={{
              maxWidth: "850px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "7px 14px",
                borderRadius: "999px",
                background: "#dbeafe",
                color: "#1d4ed8",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "18px",
              }}
            >
              SOCIETAL INNOVATION PORTAL
            </div>

            <h1
              style={{
                fontSize: "46px",
                lineHeight: "1.15",
                margin: "0 0 20px",
                fontWeight: "800",
              }}
            >
              Turning Community Problems
              <br />
              Into Real Solutions
            </h1>

            <p
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                fontSize: "18px",
                lineHeight: "1.7",
                color: "#64748b",
              }}
            >
              A collaborative platform connecting citizens,
              government, universities and industry to identify
              societal problems, develop innovative solutions and
              implement meaningful change.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "30px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  padding: "13px 28px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                style={{
                  padding: "13px 28px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          style={{
            padding: "65px 6%",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <h2
                style={{
                  fontSize: "30px",
                  margin: "0 0 10px",
                }}
              >
                How the Portal Works
              </h2>

              <p
                style={{
                  color: "#64748b",
                  margin: 0,
                }}
              >
                From reporting a problem to implementing a solution.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {/* STEP 1 */}

              <div
                style={{
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#dbeafe",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    marginBottom: "15px",
                  }}
                >
                  1
                </div>

                <h3>Citizen Reports</h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  Citizens report real problems affecting their
                  communities.
                </p>
              </div>

              {/* STEP 2 */}

              <div
                style={{
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#dcfce7",
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    marginBottom: "15px",
                  }}
                >
                  2
                </div>

                <h3>AI Analysis</h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  The system analyses and categorises submitted
                  societal problems.
                </p>
              </div>

              {/* STEP 3 */}

              <div
                style={{
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#fef3c7",
                    color: "#b45309",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    marginBottom: "15px",
                  }}
                >
                  3
                </div>

                <h3>University Solutions</h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  Universities work on suitable solutions,
                  prototypes and implementation plans.
                </p>
              </div>

              {/* STEP 4 */}

              <div
                style={{
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#f3e8ff",
                    color: "#7e22ce",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    marginBottom: "15px",
                  }}
                >
                  4
                </div>

                <h3>Implementation</h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: "1.6",
                  }}
                >
                  Approved solutions move toward implementation
                  with the relevant stakeholders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ROLES
        ===================================================== */}

        <section
          style={{
            padding: "65px 6%",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <h2
                style={{
                  fontSize: "30px",
                  margin: "0 0 10px",
                }}
              >
                One Platform, Multiple Stakeholders
              </h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Each participant has a dedicated portal.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3>👤 Citizens</h3>
                <p style={{ color: "#64748b" }}>
                  Report and track problems affecting your
                  community.
                </p>
              </div>

              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3>🏛️ Government</h3>
                <p style={{ color: "#64748b" }}>
                  Review problems, manage priorities and assign
                  challenges.
                </p>
              </div>

              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3>🎓 Universities</h3>
                <p style={{ color: "#64748b" }}>
                  Develop solutions, prototypes and implementation
                  plans.
                </p>
              </div>

              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3>🏢 Industry</h3>
                <p style={{ color: "#64748b" }}>
                  Support innovation through industry collaboration
                  and implementation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        style={{
          padding: "25px 6%",
          background: "#0f172a",
          color: "#cbd5e1",
          textAlign: "center",
          fontSize: "13px",
        }}
      >
        Societal Innovation Portal
      </footer>
    </div>
  );
}

export default Home;