import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_HOST = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("government");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDirectDemoLogin = async (demoEmail, demoPassword, targetRoute) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_HOST}/api/auth/login`, {
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
      const response = await fetch(`${API_HOST}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.token || !data.user) {
        setError("Login response missing token or user data.");
        return;
      }

      const loggedInUser = data.user;
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      localStorage.setItem("userRole", loggedInUser.role);

      if (loggedInUser.role === "citizen") {
        navigate("/citizen", { replace: true });
      } else {
        // Admin and Government both land on Middleware Dashboard
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please check backend on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #090e1a 0%, #0b1329 50%, #0d1b38 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#f8fafc",
        position: "relative"
      }}
    >
      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          color: "#94a3b8"
        }}
      >
        ← Back to Overview
      </button>

      {/* Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "18px",
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Emblem Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "900",
              color: "#000",
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)"
            }}
          >
            MH
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#fff", margin: "0 0 6px 0" }}>
            MahaSetu Middleware
          </h1>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
            Unified Interoperability Framework • PS 26129
          </p>
        </div>

        {/* 1-Click Evaluator Demo Logins */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.6)",
            border: "1px dashed rgba(56, 189, 248, 0.3)",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "20px"
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            ⚡ 1-Click Evaluator Quick Login:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin("government@sihportal.com", "Government@123", "/admin")}
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#fbbf24",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>🏛️ Nodal Officer (Government)</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Admin Hub ➔</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectDemoLogin("admin@sihportal.com", "Admin@123", "/admin")}
              style={{
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>🛡️ System Administrator</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Admin Hub ➔</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectDemoLogin("citizen@sihportal.com", "Citizen@123", "/citizen")}
              style={{
                background: "rgba(74, 222, 128, 0.12)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                color: "#4ade80",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>👤 Citizen Resident (Aniket Patil)</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Consent &amp; Status ➔</span>
            </button>
          </div>
        </div>

        {/* 3-Role Selector */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "8px" }}>
            Select Role:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { id: "government", label: "Government" },
              { id: "admin", label: "Admin" },
              { id: "citizen", label: "Citizen" }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  if (r.id === "government") {
                    setEmail("government@sihportal.com");
                    setPassword("Government@123");
                  } else if (r.id === "admin") {
                    setEmail("admin@sihportal.com");
                    setPassword("Admin@123");
                  } else {
                    setEmail("citizen@sihportal.com");
                    setPassword("Citizen@123");
                  }
                  setError("");
                }}
                style={{
                  padding: "8px 4px",
                  borderRadius: "8px",
                  border: role === r.id ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
                  background: role === r.id ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.5)",
                  color: role === r.id ? "#38bdf8" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              marginBottom: "16px"
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "11px", cursor: "pointer" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, #38bdf8, #2563eb)",
              border: "none",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}