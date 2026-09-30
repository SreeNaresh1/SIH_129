import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ConsentManager from "../components/ConsentManager";
import UnifiedStatusTracker from "../components/UnifiedStatusTracker";

export default function CitizenPortal() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState("consent"); // "consent" | "status"

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  })();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1329", color: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Citizen Header */}
      <header
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#000",
              fontSize: "15px"
            }}
          >
            MS
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#fff" }}>
              MahaSetu Citizen Single-Window
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              Consent-Bound Cross-Department Service Interface (PS 26129)
            </div>
          </div>
        </div>

        {/* Screen Switcher Tabs */}
        <div
          style={{
            display: "flex",
            background: "rgba(30, 41, 59, 0.6)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <button
            onClick={() => setActiveScreen("consent")}
            style={{
              background: activeScreen === "consent" ? "#38bdf8" : "transparent",
              color: activeScreen === "consent" ? "#000" : "#94a3b8",
              border: "none",
              padding: "7px 16px",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            🛡️ Consent Manager
          </button>
          <button
            onClick={() => setActiveScreen("status")}
            style={{
              background: activeScreen === "status" ? "#38bdf8" : "transparent",
              color: activeScreen === "status" ? "#000" : "#94a3b8",
              border: "none",
              padding: "7px 16px",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            📋 Unified Application Status
          </button>
        </div>

        {/* User Pill & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            👤 {user.name || "Aniket Patil"} &nbsp;
            <span style={{ fontSize: "11px", color: "#4ade80", background: "rgba(74, 222, 128, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
              Verified Resident
            </span>
          </div>

          <button
            onClick={() => navigate("/admin")}
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fbbf24",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            ⚡ Admin Console
          </button>

          <button
            onClick={logout}
            style={{
              background: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              color: "#f87171",
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        {activeScreen === "consent" && <ConsentManager />}
        {activeScreen === "status" && <UnifiedStatusTracker />}
      </main>
    </div>
  );
}
