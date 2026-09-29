import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDirectDemoLogin = async (demoEmail, demoPassword, targetRoute) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        setError(data.message || "Demo login failed.");
        return;
      }
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
      navigate(targetRoute, { replace: true });
    } catch (e) {
      console.error("Direct demo login error:", e);
      setError("Unable to connect to authentication backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /*
      ========================================================
      BACKEND LOGIN ERROR
      ========================================================
      */

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password. Please try again."
        );

        return;
      }

      /*
      ========================================================
      VALIDATE TOKEN
      ========================================================
      */

      if (!data.token) {
        setError(
          "Login failed because the server did not return an authentication token."
        );

        return;
      }

      /*
      ========================================================
      VALIDATE USER
      ========================================================
      */

      if (!data.user) {
        setError(
          "Login failed because the server did not return user information."
        );

        return;
      }

      const loggedInUser = data.user;

      /*
      ========================================================
      GET ACTUAL ROLE FROM BACKEND
      ========================================================

      The backend is the authority for the account role.

      Example:

      industry1@sihportal.com
      -> backend returns role = "industry"

      Even if Citizen was selected on the screen,
      the backend role is used for the actual login.
      ========================================================
      */

      const actualRole = loggedInUser.role;

      if (!actualRole) {
        setError(
          "Login failed because the server did not return the account role."
        );

        return;
      }

      /*
      ========================================================
      SAVE AUTHENTICATION DATA
      ========================================================
      */

      localStorage.setItem(
        "authToken",
        data.token
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        "userRole",
        actualRole
      );

      /*
      ========================================================
      UPDATE ROLE SELECTOR
      ========================================================

      This makes the UI show the actual role returned
      by the backend after successful login.
      ========================================================
      */

      setRole(actualRole);

      /*
      ========================================================
      REDIRECT TO CORRECT PORTAL
      ========================================================
      */

      switch (actualRole) {
        case "citizen":
          navigate("/citizen", {
            replace: true,
          });
          break;

        case "government":
          navigate("/admin", {
            replace: true,
          });
          break;

        case "university":
          navigate("/admin", {
            replace: true,
          });
          break;

        case "industry":
          navigate("/interop", {
            replace: true,
          });
          break;

        default:
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("userRole");

          setError(
            "Your account has an invalid role. Please contact the administrator."
          );
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to the SIH server. Please make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  ROLE CHANGE
  ============================================================
  */

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };

  /*
  ============================================================
  LOGIN PAGE
  ============================================================
  */

  return (
    <div className="login-page">

      {/* ====================================================
          BACK TO HOME
      ==================================================== */}

      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          color: "#475569",
        }}
      >
        ← Back to Home
      </button>


      {/* ====================================================
          LOGIN CARD
      ==================================================== */}

      <div className="login-card">

        {/* ==================================================
            LOGO
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <div
            className="login-logo"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              fontSize: "22px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#000"
            }}
          >
            MH
          </div>
        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="login-header">

          <h1 style={{ fontSize: "22px", fontWeight: "800" }}>
            MahaSetu Portal
          </h1>

          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Government of Maharashtra • Unified Interoperability &amp; Federated Service Delivery (PS 26129)
          </p>

        </div>


        {/* ==================================================
            ROLE SELECTOR
        ================================================== */}

        <div
          style={{
            marginBottom: "20px",
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "9px",
              fontWeight: "600",
            }}
          >
            Login As
          </label>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "8px",
            }}
          >

            {/* =================================================
                CITIZEN
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleRoleChange("citizen")
              }
              style={{
                padding: "11px 8px",
                borderRadius: "8px",
                border:
                  role === "citizen"
                    ? "2px solid #2563eb"
                    : "1px solid #cbd5e1",
                background:
                  role === "citizen"
                    ? "#eff6ff"
                    : "#ffffff",
                color:
                  role === "citizen"
                    ? "#1d4ed8"
                    : "#475569",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              👤 Citizen / Business
            </button>


            {/* =================================================
                GOVERNMENT
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleRoleChange("government")
              }
              style={{
                padding: "11px 8px",
                borderRadius: "8px",
                border:
                  role === "government"
                    ? "2px solid #2563eb"
                    : "1px solid #cbd5e1",
                background:
                  role === "government"
                    ? "#eff6ff"
                    : "#ffffff",
                color:
                  role === "government"
                    ? "#1d4ed8"
                    : "#475569",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              🏛️ Nodal Officer
            </button>

          </div>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
              ⚡ 1-Click Evaluator Demo Logins:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin("citizen@sihportal.com", "Citizen@123", "/citizen")}
                  style={{ fontSize: "12px", padding: "8px 10px", borderRadius: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", cursor: "pointer", fontWeight: 700, textAlign: "left" }}
                >
                  ⚡ Instant Login: Citizen / Business (Pooja Sharma)
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("citizen"); setEmail("citizen@sihportal.com"); setPassword("Citizen@123"); setError(""); }}
                  style={{ fontSize: "11px", padding: "8px 10px", borderRadius: "6px", background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", cursor: "pointer", fontWeight: 600 }}
                  title="Fill form fields only"
                >
                  Fill Form
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin("government@sihportal.com", "Government@123", "/admin")}
                  style={{ fontSize: "12px", padding: "8px 10px", borderRadius: "6px", background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", cursor: "pointer", fontWeight: 700, textAlign: "left" }}
                >
                  🏛️ Instant Login: Nodal Review Officer (MahaDBT Desk)
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("government"); setEmail("government@sihportal.com"); setPassword("Government@123"); setError(""); }}
                  style={{ fontSize: "11px", padding: "8px 10px", borderRadius: "6px", background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", cursor: "pointer", fontWeight: 600 }}
                  title="Fill form fields only"
                >
                  Fill Form
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDirectDemoLogin("government@sihportal.com", "Government@123", "/admin/interop")}
                style={{ fontSize: "12px", padding: "8px 10px", borderRadius: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", cursor: "pointer", fontWeight: 700, textAlign: "left", display: "flex", justifyContent: "space-between" }}
              >
                <span>⚡ Instant Login: State Interoperability Gateway Studio</span>
                <span style={{ fontSize: "11px", color: "#15803d" }}>Launch Hub ➔</span>
              </button>
            </div>
          </div>

        </div>


        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form onSubmit={handleLogin}>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="login-email"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Email Address
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="login-password"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Password
            </label>


            <div
              style={{
                position: "relative",
              }}
            >

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  paddingRight: "80px",
                }}
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* =================================================
              GOVERNMENT INFORMATION
          ================================================= */}

          {role === "government" && (

            <div
              style={{
                marginBottom: "16px",
                padding: "11px 13px",
                borderRadius: "8px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                color: "#1e40af",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              🏛️ Government accounts are
              created by the SIH system
              administrator. Use the official
              Government account credentials.
            </div>

          )}


          {/* =================================================
              INDUSTRY INFORMATION
          ================================================= */}

          {role === "industry" && (

            <div
              style={{
                marginBottom: "16px",
                padding: "11px 13px",
                borderRadius: "8px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                color: "#1e40af",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              🏢 Industry accounts are
              private accounts created by
              Government. Industry users can
              sign in using the credentials
              provided to them.
            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              style={{
                marginBottom: "16px",
                padding: "11px 13px",
                borderRadius: "8px",
                background: "#fef2f2",
                border:
                  "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              ❌ {error}
            </div>

          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
            style={{
              width: "100%",
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* ==================================================
            REGISTER
        ================================================== */}

        <div
          className="register-text"
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "700",
              marginLeft: "5px",
            }}
          >
            Register
          </button>

        </div>


        {/* ==================================================
            SECURITY NOTE
        ================================================== */}

        <div
          style={{
            marginTop: "18px",
            paddingTop: "14px",
            borderTop:
              "1px solid #e2e8f0",
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          🔐 Secure authentication powered by
          the SIH Portal backend
        </div>

      </div>

    </div>
  );
}

export default Login;