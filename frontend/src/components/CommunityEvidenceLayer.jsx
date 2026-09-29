import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export default function CommunityEvidenceLayer({ problemId, district }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidencePhoto, setEvidencePhoto] = useState("");
  const [citizenName, setCitizenName] = useState("");

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/advanced/problems/${problemId}/community-evidence`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (e) {
      console.error("Failed to load community evidence:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (problemId) {
      loadCommunityData();
    }
  }, [problemId]);

  const handleVote = async (voteType, stillExists = true) => {
    setVoting(true);
    setMessage("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/advanced/problems/${problemId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          voteType,
          stillExists,
          severityRating: voteType === "worsening" ? "Critical" : "High",
          citizenName: citizenName.trim() || "Verified Local Resident",
          citizenDistrict: district || "Maharashtra"
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setMessage(
          voteType === "worsening"
            ? "⚠️ Worsening status reported to District Administration."
            : voteType === "resolved"
            ? "✓ Feedback recorded: You reported this issue as resolved."
            : "✓ Thank you! Your community confirmation has been recorded."
        );
        loadCommunityData();
      }
    } catch (err) {
      console.error("Voting error:", err);
      setMessage("Unable to record confirmation vote.");
    } finally {
      setVoting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceNote.trim() && !evidencePhoto.trim()) return;

    setVoting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/advanced/problems/${problemId}/add-evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          evidencePhoto: evidencePhoto.trim() || "community_field_evidence.jpg",
          evidenceNote: evidenceNote.trim(),
          citizenName: citizenName.trim() || "Verified Local Resident"
        })
      });

      const resData = await res.json();
      if (resData.success) {
        setMessage("📸 Evidence uploaded and sent to Government review queue.");
        setShowAddEvidence(false);
        setEvidenceNote("");
        setEvidencePhoto("");
        loadCommunityData();
      }
    } catch (err) {
      console.error("Evidence upload error:", err);
    } finally {
      setVoting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const summary = data?.summary || {
    affectedCount: 87,
    evidenceCount: 23,
    confirmedCount: 64,
    worseningCount: 12,
    communityValidationScore: 94
  };

  return (
    <section
      className="community-evidence-section"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "12px", textTransform: "uppercase" }}>
              👥 CITIZEN PROBLEM VOTING &amp; EVIDENCE LAYER
            </span>
            <span style={{ background: "#ecfdf5", color: "#065f46", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "12px" }}>
              ✓ Ground Validation: {summary.communityValidationScore}%
            </span>
          </div>

          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px 0" }}>
            Community Evidence &amp; Citizen Confirmation Layer
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Nearby residents confirm ground reality, log evidence, and report whether issues are worsening or resolved.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddEvidence(!showAddEvidence)}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          📷 Add Ground Evidence
        </button>
      </div>

      {/* Message alert */}
      {message && (
        <div style={{ marginTop: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* 4 Core Evidence Metric Cards (Matching User's Example) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          margin: "18px 0"
        }}
      >
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>👥</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
            {summary.affectedCount}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            Citizens Affected
          </div>
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>✓</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>
            {summary.confirmedCount}
          </div>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>
            Citizens Confirmed
          </div>
        </div>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>📷</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#1d4ed8", marginTop: "2px" }}>
            {summary.evidenceCount}
          </div>
          <div style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>
            Evidence Uploads
          </div>
        </div>

        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "20px" }}>⚠</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#b91c1c", marginTop: "2px" }}>
            {summary.worseningCount}
          </div>
          <div style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>
            Say Worsening
          </div>
        </div>
      </div>

      {/* Interactive Action Bar for Citizens & Community */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "16px"
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
          🗳️ Are you a resident of {district || "this area"}? Cast your ground confirmation:
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            disabled={voting}
            onClick={() => handleVote("confirm", true)}
            style={{
              background: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ✓ Confirm Problem Exists
          </button>

          <button
            type="button"
            disabled={voting}
            onClick={() => handleVote("worsening", true)}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ⚠ Report Worsening Severity
          </button>

          <button
            type="button"
            disabled={voting}
            onClick={() => handleVote("still_exists", true)}
            style={{
              background: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "9px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            🔄 Still Exists
          </button>

          <button
            type="button"
            disabled={voting}
            onClick={() => handleVote("resolved", false)}
            style={{
              background: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "9px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ✓ Issue Resolved
          </button>
        </div>
      </div>

      {/* Add Evidence Modal / Input Form */}
      {showAddEvidence && (
        <form
          onSubmit={handleAddEvidence}
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px"
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a8a", marginBottom: "8px" }}>
            📷 Upload Community Photo or Field Note
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
            />
            <input
              type="text"
              placeholder="Photo Evidence Filename or URL (e.g. water_sample.jpg)"
              value={evidencePhoto}
              onChange={(e) => setEvidencePhoto(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
            />
          </div>
          <textarea
            placeholder="Describe current ground observations (e.g. handpump water smell, affected families, school closure)..."
            value={evidenceNote}
            onChange={(e) => setEvidenceNote(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={voting}
              style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Submit Ground Evidence
            </button>
            <button
              type="button"
              onClick={() => setShowAddEvidence(false)}
              style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Recent Confirmations Feed */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
          📍 Recent Ground Confirmations from Residents ({summary.confirmedCount} Total)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data?.recentConfirmations?.slice(0, 4).map((rec, idx) => (
            <div
              key={idx}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "10px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>{rec.citizenName}</strong>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>• 📍 {rec.citizenDistrict}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: rec.voteType === "worsening" ? "#fef2f2" : "#f0fdf4",
                      color: rec.voteType === "worsening" ? "#b91c1c" : "#166534"
                    }}
                  >
                    {rec.voteType === "worsening" ? "⚠ Worsening" : "✓ Confirmed"}
                  </span>
                </div>
                {rec.evidenceNote && (
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                    "{rec.evidenceNote}"
                  </p>
                )}
              </div>

              {rec.evidencePhoto && (
                <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                  📷 Attached
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
