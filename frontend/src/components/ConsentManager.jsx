import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ConsentManager() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [masterRecord, setMasterRecord] = useState(null);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [toast, setToast] = useState(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interop/consent/records`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.consents)) {
        setConsents(data.consents);
      }
    } catch (e) {
      console.error("Failed to load consent records:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoadingMaster(true);
      const res = await fetch(`${API}/api/interop/master-data/lookup`, {
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success && data.masterRecord) {
        setMasterRecord(data.masterRecord);
      }
    } catch (e) {
      console.error("Failed to load master record:", e);
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    fetchConsents();
    fetchMasterData();
  }, [fetchConsents, fetchMasterData]);

  const handleRevoke = async (consentId) => {
    setRevokingId(consentId);
    setToast(null);
    try {
      const res = await fetch(`${API}/api/interop/consent/revoke/${consentId}`, {
        method: "POST",
        headers: authHeader()
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "info", msg: data.message });
        await fetchConsents();
      }
    } catch (e) {
      setToast({ type: "error", msg: `Revoke failed: ${e.message}` });
    } finally {
      setRevokingId(null);
    }
  };

  const handleApproveAll = async () => {
    setApprovingAll(true);
    setToast(null);
    try {
      // Grant active consent for all primary state portals
      const departments = [
        {
          source: "MahaDBT / UIDAI Vault",
          target: "Maharashtra State Innovation Society (MSInS)",
          purpose: "Direct Benefit Verification and One-Click Scheme Auto-Fill",
          attributes: ["fullName", "casteCertificateNo", "annualIncome", "district", "educationalCredentials"]
        },
        {
          source: "DigiLocker Resident Vault",
          target: "MahaSwayam (Skills & Employment)",
          purpose: "Apprentice Stipend & Trade Certificate Cross-Verification",
          attributes: ["fullName", "itiTrade", "passingYear", "domicileCertificateNo"]
        },
        {
          source: "Revenue Department (Tahsildar)",
          target: "Aaple Sarkar RTS Gateway",
          purpose: "Income & Non-Creamy Layer Certificate Verification",
          attributes: ["fullName", "incomeCertificateNo", "annualIncome", "tehsil"]
        }
      ];

      for (const d of departments) {
        await fetch(`${API}/api/interop/consent/grant`, {
          method: "POST",
          headers: {
            ...authHeader(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            citizenId: 1,
            citizenName: "Aniket Suresh Patil",
            sourceDepartment: d.source,
            targetDepartment: d.target,
            purpose: d.purpose,
            sharedAttributes: d.attributes,
            validityDays: 90
          })
        });
      }

      setToast({
        type: "success",
        msg: "All department data-sharing consents approved! Verified credentials enabled for 1-click application auto-fill."
      });
      await fetchConsents();
    } catch (e) {
      setToast({ type: "error", msg: `Failed to approve all: ${e.message}` });
    } finally {
      setApprovingAll(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Overview Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <span
            style={{
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase"
            }}
          >
            DEPA 2.0 / India Stack Standard
          </span>
          <h2 style={{ margin: "10px 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#fff" }}>
            Citizen Consent &amp; Data Sharing Manager
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            You have total cryptographic control. Decide which government departments can access your verified credentials.
          </p>
        </div>

        <button
          onClick={handleApproveAll}
          disabled={approvingAll}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "13px",
            cursor: approvingAll ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
          }}
        >
          {approvingAll ? "⏳ Granting..." : "✓ Approve All for 1-Click Auto-Fill"}
        </button>
      </div>

      {toast && (
        <div
          style={{
            background: toast.type === "success" ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: toast.type === "success" ? "#86efac" : "#fca5a5",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Two Column Layout: Consent Requests + Master Resident Data Auto-Fill */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Department Requests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>
            Active Departmental Access Requests
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading consent requests...</div>
          ) : consents.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No active consent records.</div>
          ) : (
            consents.map((c) => {
              let attrs = [];
              try {
                attrs = typeof c.sharedAttributes === "string" ? JSON.parse(c.sharedAttributes) : (c.sharedAttributes || []);
              } catch {
                attrs = [];
              }
              const isActive = c.status === "ACTIVE";

              return (
                <div
                  key={c.consentId}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: isActive ? "1px solid rgba(56, 189, 248, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>
                        {c.targetDepartment}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Requesting from: <strong style={{ color: "#cbd5e1" }}>{c.sourceDepartment}</strong>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: isActive ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                        border: `1px solid ${isActive ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
                        color: isActive ? "#4ade80" : "#f87171"
                      }}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    <strong>Purpose:</strong> {c.purpose}
                  </div>

                  {/* Requested Attributes Chips */}
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Requested Data Fields:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                      {attrs.map((att, i) => (
                        <span
                          key={i}
                          style={{
                            background: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            color: "#38bdf8",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontFamily: "monospace"
                          }}
                        >
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "90 days"}
                    </span>

                    {isActive && (
                      <button
                        onClick={() => handleRevoke(c.consentId)}
                        disabled={revokingId === c.consentId}
                        style={{
                          background: "rgba(248, 113, 113, 0.12)",
                          border: "1px solid rgba(248, 113, 113, 0.3)",
                          color: "#f87171",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: revokingId === c.consentId ? "not-allowed" : "pointer"
                        }}
                      >
                        {revokingId === c.consentId ? "Revoking..." : "Revoke Access"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Master Data Auto-Fill Preview */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8" }}>
              ⚡ State Resident Data Hub (Auto-Fill)
            </div>
            <span style={{ fontSize: "10px", color: "#4ade80", fontWeight: 700 }}>
              VERIFIED
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            Because your consent is granted, the following certificates auto-populate across state portals without document re-uploads:
          </p>

          {masterRecord?.verifiedCredentials ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {masterRecord.verifiedCredentials.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "12px"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>
                    {doc.credentialType}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    Issuer: {doc.issuingAuthority || doc.institution}
                  </div>
                  <div style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "monospace", marginTop: "3px" }}>
                    {doc.certificateNo || doc.course}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: "12px" }}>Loading verified credentials...</div>
          )}

          <div
            style={{
              background: "rgba(56, 189, 248, 0.06)",
              border: "1px dashed rgba(56, 189, 248, 0.2)",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "11px",
              color: "#7dd3fc"
            }}
          >
            🔒 Protected under DEPA 2.0. Consent artifacts are digitally signed and expire automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
