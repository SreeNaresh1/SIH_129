import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    applicantCategory: "Individual Citizen",
    entityIdentifier: "", // Aadhaar Ref / Udyam / GSTIN / Student ID
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // PASSWORD STRENGTH ANALYSIS
  // =========================================================
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password || "";
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    };
  }, [formData.password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasLength) score += 25;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 25;
    if (passwordCriteria.hasNumber) score += 25;
    if (passwordCriteria.hasSpecial) score += 25;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!formData.password) return { text: "None", color: "#94a3b8", width: "0%" };
    if (strengthScore <= 25) return { text: "Weak", color: "#ef4444", width: "25%" };
    if (strengthScore <= 50) return { text: "Fair", color: "#f97316", width: "50%" };
    if (strengthScore <= 75) return { text: "Good", color: "#eab308", width: "75%" };
    return { text: "Strong & Secure", color: "#10b981", width: "100%" };
  }, [formData.password, strengthScore]);

  const passwordsMatch = useMemo(() => {
    if (!formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      strengthScore === 100 &&
      passwordsMatch === true
    );
  }, [formData.name, formData.email, strengthScore, passwordsMatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      setError("Please enter your full legal name or authorized representative name.");
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (strengthScore < 100) {
      setError("Please satisfy all password security criteria (minimum 8 characters, uppercase, lowercase, number, and special character).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirmation password do not match.");
      return;
    }

    /*
     * PUBLIC REGISTRATION PRIVILEGES
     * Public self-registration is strictly restricted to Citizens and Businesses (applicant tier).
     * Government Nodal Desks and Administrative Interoperability tools cannot be accessed by citizen credentials.
     */
    const role = "citizen";

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          organization: `${formData.applicantCategory}${formData.entityIdentifier ? ` (${formData.entityIdentifier})` : ""}`,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error("The backend returned an unexpected response. Please ensure backend is running.");
      }

      if (!response.ok) {
        setError(data.message || "Registration failed. Please check your credentials.");
        return;
      }

      setSuccess("Account created successfully! Redirecting to secure login...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email,
          },
        });
      }, 1400);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to connect to the authentication server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* TOP NAVIGATION */}
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 0",
          }}
        >
          ← Return to MahaSetu Home
        </button>

        <span
          style={{
            fontSize: "11px",
            background: "rgba(245, 158, 11, 0.15)",
            color: "#fbbf24",
            padding: "4px 10px",
            borderRadius: "20px",
            fontWeight: "700",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          SIH 2026 • PS 26129
        </span>
      </div>

      {/* REGISTER CARD */}
      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          padding: "36px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* LOGO & HEADING */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#0f172a",
              fontWeight: "900",
              fontSize: "20px",
              boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
              marginBottom: "12px",
            }}
          >
            MH
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 6px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Create Citizen / Business Account
          </h1>
          <p
            style={{
              fontSize: "13.5px",
              color: "#64748b",
              margin: 0,
            }}
          >
            MahaSetu Single-Window Portal • Government of Maharashtra
          </p>
        </div>

        {/* SECURITY & RBAC ADVISORY BANNER */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "22px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "18px" }}>🛡️</span>
          <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5" }}>
            <strong>Strict Role-Based Access Isolation:</strong>
            <br />
            Public self-registration creates Citizen &amp; Enterprise applicant credentials for single-window service delivery. 
            Government Nodal Desks and Administrative Interoperability controls require verified state PKI tokens and <strong>cannot</strong> be accessed with citizen credentials.
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "13px",
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "13px",
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit}>
          {/* APPLICANT CATEGORY */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="applicantCategory"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "13px",
                color: "#1e293b",
              }}
            >
              Applicant Category *
            </label>
            <select
              id="applicantCategory"
              name="applicantCategory"
              value={formData.applicantCategory}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "13.5px",
                color: "#1e293b",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="Individual Citizen">👤 Individual Citizen (Aadhaar / DigiLocker linked)</option>
              <option value="Registered Business / MSME">🏢 Registered Enterprise / MSME / Startup (GSTIN &amp; Udyam linked)</option>
              <option value="Farmer / Agricultural Producer">🌾 Farmer / Agricultural Producer (7/12 Land Registry linked)</option>
              <option value="Student / Vocational Trainee">🎓 Student / Apprentice (APAAR / Skill Registry linked)</option>
            </select>
          </div>

          {/* FULL LEGAL NAME */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="name"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "13px",
                color: "#1e293b",
              }}
            >
              Full Legal Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Ramesh V. Kadam or Horizon Agro Tech LLP"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "14px",
                color: "#1e293b",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* EMAIL ADDRESS */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "13px",
                color: "#1e293b",
              }}
            >
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. citizen.user@mahasetu.gov.in"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "14px",
                color: "#1e293b",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* PASSWORD WITH STRENGTH METER */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                htmlFor="password"
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#1e293b",
                }}
              >
                Password *
              </label>
              <span style={{ fontSize: "11.5px", fontWeight: "700", color: strengthLabel.color }}>
                {formData.password ? `Strength: ${strengthLabel.text}` : "Min 8 chars with symbols"}
              </span>
            </div>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 13px",
                  borderRadius: "8px",
                  border: `1px solid ${formData.password ? (strengthScore === 100 ? "#10b981" : "#cbd5e1") : "#cbd5e1"}`,
                  background: "#ffffff",
                  fontSize: "14px",
                  color: "#1e293b",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px",
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* LIVE STRENGTH PROGRESS BAR */}
            <div
              style={{
                width: "100%",
                height: "5px",
                background: "#f1f5f9",
                borderRadius: "3px",
                marginTop: "7px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: strengthLabel.width,
                  height: "100%",
                  background: strengthLabel.color,
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            </div>

            {/* REAL-TIME CRITERIA CHECKLIST */}
            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5px 12px",
                fontSize: "11.5px",
              }}
            >
              <div style={{ color: passwordCriteria.hasLength ? "#059669" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{passwordCriteria.hasLength ? "✅" : "⚪"}</span>
                <span>8+ Characters</span>
              </div>
              <div style={{ color: passwordCriteria.hasUpper ? "#059669" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{passwordCriteria.hasUpper ? "✅" : "⚪"}</span>
                <span>Uppercase Letter (A-Z)</span>
              </div>
              <div style={{ color: passwordCriteria.hasLower ? "#059669" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{passwordCriteria.hasLower ? "✅" : "⚪"}</span>
                <span>Lowercase Letter (a-z)</span>
              </div>
              <div style={{ color: passwordCriteria.hasNumber ? "#059669" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{passwordCriteria.hasNumber ? "✅" : "⚪"}</span>
                <span>Number (0-9)</span>
              </div>
              <div style={{ color: passwordCriteria.hasSpecial ? "#059669" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{passwordCriteria.hasSpecial ? "✅" : "⚪"}</span>
                <span>Special Symbol (@, #, $, etc.)</span>
              </div>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#1e293b",
                }}
              >
                Confirm Password *
              </label>
              {passwordsMatch !== null && (
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: passwordsMatch ? "#10b981" : "#ef4444" }}>
                  {passwordsMatch ? "✅ Passwords match" : "❌ Passwords do not match"}
                </span>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password to confirm"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 13px",
                  borderRadius: "8px",
                  border: `1px solid ${
                    passwordsMatch === null
                      ? "#cbd5e1"
                      : passwordsMatch
                      ? "#10b981"
                      : "#ef4444"
                  }`,
                  background: "#ffffff",
                  fontSize: "14px",
                  color: "#1e293b",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  padding: "4px",
                }}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: isFormValid
                ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                : "#cbd5e1",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: isFormValid && !loading ? "pointer" : "not-allowed",
              boxShadow: isFormValid ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Verifying & Creating Account..." : "Create Citizen / Business Account"}
          </button>
        </form>

        {/* ALREADY REGISTERED */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "13.5px",
            color: "#64748b",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Sign In Here
          </Link>
        </div>

        {/* GOVERNMENT PORTAL NOTICE */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #f1f5f9",
            color: "#64748b",
            fontSize: "11.5px",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          🏛️ <strong>Government Nodal Officers &amp; State InterOp Admins:</strong>
          <br />
          Administrative credentials are provisioned directly by the Government of Maharashtra IT Directorate.
          <br />
          <Link
            to="/login"
            style={{
              color: "#475569",
              fontWeight: "600",
              textDecoration: "underline",
              display: "inline-block",
              marginTop: "4px",
            }}
          >
            Access Nodal Officer Login Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;