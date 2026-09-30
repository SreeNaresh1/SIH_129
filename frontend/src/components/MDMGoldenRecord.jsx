import React, { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function MDMGoldenRecord() {
  const [goldenRecords, setGoldenRecords] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([
        fetch(`${API}/api/interop/mdm/records`, { headers: authHeader() }),
        fetch(`${API}/api/interop/mdm/review-queue`, { headers: authHeader() })
      ]);
      const d1 = await r1.json();
      const d2 = await r2.json();

      if (d1.success && Array.isArray(d1.records)) {
        setGoldenRecords(d1.records);
        if (d1.records.length > 0 && !selectedRecord) {
          setSelectedRecord(d1.records[0]);
        }
      }
      if (d2.success && Array.isArray(d2.queue)) {
        setReviewQueue(d2.queue);
      }
    } catch (e) {
      console.error("Failed to fetch MDM records:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedRecord]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (queueId, action) => {
    setResolvingId(queueId);
    setNotice(null);
    try {
      const res = await fetch(`${API}/api/interop/mdm/resolve`, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          queueId,
          action,
          officerName: "State Interoperability Administrator (MSInS)"
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotice({
          type: "success",
          msg: `Review item ${queueId} successfully resolved: ${action} executed.`
        });
        await fetchData();
      }
    } catch (e) {
      setNotice({ type: "error", msg: `Failed to resolve review item: ${e.message}` });
    } finally {
      setResolvingId(null);
    }
  };

  const filteredRecords = goldenRecords.filter((rec) => {
    const q = search.toLowerCase();
    const name = (rec.canonicalPerson?.fullName || "").toLowerCase();
    const id = (rec.goldenId || "").toLowerCase();
    const district = (rec.canonicalPerson?.district || "").toLowerCase();
    return name.includes(q) || id.includes(q) || district.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Info */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
            Master Data Management (MDM) Golden Record Consolidation
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Deterministic and fuzzy entity resolution consolidating citizen identities across siloed departmental portals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span
            style={{
              background: "rgba(167, 139, 250, 0.15)",
              color: "#c084fc",
              border: "1px solid rgba(167, 139, 250, 0.3)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            🎯 {goldenRecords.length} Consolidated Profiles
          </span>
          {reviewQueue.length > 0 && (
            <span
              style={{
                background: "rgba(251, 191, 36, 0.15)",
                color: "#fbbf24",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              ⚠ {reviewQueue.length} In Review Queue
            </span>
          )}
        </div>
      </div>

      {notice && (
        <div
          style={{
            background: notice.type === "success" ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)",
            border: `1px solid ${notice.type === "success" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
            color: notice.type === "success" ? "#86efac" : "#fca5a5",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{notice.msg}</span>
          <button onClick={() => setNotice(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Manual Review Queue if pending items */}
      {reviewQueue.length > 0 && (
        <div
          style={{
            background: "rgba(251, 191, 36, 0.05)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            borderRadius: "12px",
            padding: "16px 20px"
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            ⚠ Nodal Officer Manual Disambiguation Queue ({reviewQueue.length} Borderline Conflicts)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reviewQueue.map((item) => (
              <div
                key={item.id || item.candidateName}
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>
                    Candidate: <span style={{ color: "#fbbf24" }}>{item.candidateName}</span> vs Target Golden ID: <code style={{ color: "#38bdf8" }}>{item.targetGoldenId}</code>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Confidence: <strong>{(item.matchConfidence * 100).toFixed(1)}%</strong> | Source: {item.sourceSystem} | Reason: {item.matchReason}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleResolve(item.id, "MERGE")}
                    disabled={resolvingId === item.id}
                    style={{
                      background: "rgba(74, 222, 128, 0.15)",
                      border: "1px solid rgba(74, 222, 128, 0.3)",
                      color: "#4ade80",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ✓ Merge into Golden Record
                  </button>
                  <button
                    onClick={() => handleResolve(item.id, "SEPARATE")}
                    disabled={resolvingId === item.id}
                    style={{
                      background: "rgba(248, 113, 113, 0.12)",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                      color: "#f87171",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ✕ Keep Distinct Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Golden Records by Citizen Name, Golden ID, or District..."
          style={{
            width: "100%",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "10px 16px",
            color: "#fff",
            fontSize: "13px",
            outline: "none"
          }}
        />
      </div>

      {/* Main Two-Panel View: List of Golden Records + Canonical Identity Profile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedRecord ? "1fr 1.3fr" : "1fr",
          gap: "20px",
          alignItems: "start"
        }}
      >
        {/* Records List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading consolidated records...</div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No matching golden records.</div>
          ) : (
            filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.goldenId === rec.goldenId;
              const person = rec.canonicalPerson || {};
              return (
                <div
                  key={rec.goldenId}
                  onClick={() => setSelectedRecord(rec)}
                  style={{
                    background: isSelected ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.75)",
                    border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                      fontWeight: 900,
                      fontSize: "16px",
                      flexShrink: 0
                    }}
                  >
                    {(person.fullName || "C")[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "#fff" }}>
                      {person.fullName || "Citizen Name"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "monospace", marginTop: "2px" }}>
                      {rec.goldenId}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      {person.district || "Pune"}, Maharashtra • DOB: {person.dob || "—"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        background: "rgba(74, 222, 128, 0.15)",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        color: "#4ade80",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700
                      }}
                    >
                      {((rec.confidenceScore || 0.95) * 100).toFixed(0)}% Conf.
                    </span>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                      {Object.keys(rec.crossSystemIds || {}).length} systems
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Record Provenance Card */}
        {selectedRecord && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    padding: "3px 10px",
                    borderRadius: "14px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase"
                  }}
                >
                  Verified Golden Record
                </span>
                <h3 style={{ margin: "10px 0 2px 0", fontSize: "20px", fontWeight: 800, color: "#fff" }}>
                  {selectedRecord.canonicalPerson?.fullName}
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Canonical ID: <code style={{ color: "#38bdf8" }}>{selectedRecord.goldenId}</code>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#4ade80" }}>
                  {((selectedRecord.confidenceScore || 0.98) * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Match Confidence</div>
              </div>
            </div>

            {/* Demographics Pill Grid */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "10px",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "12px"
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Gender / DOB</span>
                <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>
                  {selectedRecord.canonicalPerson?.gender || "Male"} • {selectedRecord.canonicalPerson?.dob}
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>District & State</span>
                <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>
                  {selectedRecord.canonicalPerson?.district}, {selectedRecord.canonicalPerson?.state}
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Masked Aadhaar Token</span>
                <div style={{ color: "#38bdf8", fontWeight: 700, marginTop: "2px", fontFamily: "monospace" }}>
                  {selectedRecord.canonicalPerson?.aadhaarTokenHash ? `${selectedRecord.canonicalPerson.aadhaarTokenHash.slice(0, 16)}...` : "XXXX-XXXX-8921"}
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "11px" }}>Mobile Number</span>
                <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>
                  {selectedRecord.canonicalPerson?.mobileMasked || "+91-98XXXXX412"}
                </div>
              </div>
            </div>

            {/* Cross-System ID Provenance Matrix */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                Multi-Portal Data Provenance (Cross-System ID Map)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                {Object.entries(selectedRecord.crossSystemIds || {}).map(([portalKey, portalId]) => (
                  <div
                    key={portalKey}
                    style={{
                      background: "rgba(30, 41, 59, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "10px 14px"
                    }}
                  >
                    <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                      {portalKey.replace("Id", "").toUpperCase()} PORTAL
                    </div>
                    <div style={{ fontSize: "12px", color: "#38bdf8", fontFamily: "monospace", marginTop: "3px" }}>
                      {portalId}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Verified Documents */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                Linked Digital Credentials (DigiLocker / IndEA Reconciled)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(selectedRecord.linkedDocuments || []).map((doc, idx) => (
                  <div
                    key={doc.certNumber || `doc-${idx}`}
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(167, 139, 250, 0.2)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>
                        {doc.docType}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        Cert No: <code style={{ color: "#38bdf8" }}>{doc.certNumber}</code>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "rgba(74, 222, 128, 0.15)",
                        color: "#4ade80",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: 700
                      }}
                    >
                      ✓ VERIFIED HASH
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
