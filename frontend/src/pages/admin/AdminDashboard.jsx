import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ConnectorRegistry from "../../components/ConnectorRegistry";
import ExchangeStream from "../../components/ExchangeStream";
import MDMGoldenRecord from "../../components/MDMGoldenRecord";
import WorkflowOrchestrator from "../../components/WorkflowOrchestrator";
import SLAMonitor from "../../components/SLAMonitor";
import AuditLog from "../../components/AuditLog";
import DLQPanel from "../../components/DLQPanel";

const TABS = [
  { id: "connectors", label: "Connector Registry", icon: "🔌" },
  { id: "exchange", label: "Live API Exchange", icon: "⚡" },
  { id: "mdm", label: "MDM Golden Record", icon: "🎯" },
  { id: "workflow", label: "Workflow Orchestrator", icon: "🔄" },
  { id: "sla", label: "SLA Compliance", icon: "📊" },
  { id: "audit", label: "Audit Log", icon: "🔒" },
  { id: "dlq", label: "DLQ / Exceptions", icon: "⚠" }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("connectors");

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#0b1329", color: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Header */}
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
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#000",
              fontSize: "14px",
              boxShadow: "0 2px 10px rgba(245, 158, 11, 0.3)"
            }}
          >
            MH
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              MahaSetu Middleware
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}
              >
                PS 26129
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              MahaSetu Middleware — PS 26129 | Maharashtra State Innovation Society
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 10px #4ade80",
                display: "inline-block"
              }}
            />
            <span style={{ color: "#94a3b8" }}>Middleware Grid Online</span>
          </div>

          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            {user.name || user.email || "State Administrator"} &nbsp;·&nbsp;
            <span style={{ color: "#fbbf24", textTransform: "capitalize", fontWeight: 700 }}>
              {user.role || "government"}
            </span>
          </div>

          <button
            onClick={() => navigate("/citizen")}
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "#38bdf8",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            👤 Citizen View
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

      {/* Main Grid: Sidebar + Active Tab Content */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "230px",
            flexShrink: 0,
            borderRight: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(11, 19, 41, 0.8)",
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", padding: "0 12px 10px 12px" }}>
            Middleware Consoles
          </div>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? "rgba(56, 189, 248, 0.12)" : "transparent",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  borderLeft: isActive ? "3px solid #38bdf8" : "3px solid transparent",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxWidth: "1500px" }}>
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>
                {TABS.find((t) => t.id === activeTab)?.icon} {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                API Endpoint: <code style={{ color: "#38bdf8" }}>http://localhost:5000/api/interop</code>
              </div>
            </div>
          </div>

          {/* Render Active Tab */}
          {activeTab === "connectors" && <ConnectorRegistry />}
          {activeTab === "exchange" && <ExchangeStream />}
          {activeTab === "mdm" && <MDMGoldenRecord />}
          {activeTab === "workflow" && <WorkflowOrchestrator />}
          {activeTab === "sla" && <SLAMonitor />}
          {activeTab === "audit" && <AuditLog />}
          {activeTab === "dlq" && <DLQPanel />}
        </main>
      </div>
    </div>
  );
}