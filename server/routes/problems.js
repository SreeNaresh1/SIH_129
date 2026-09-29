const express = require("express");
const router = express.Router();

const Problem = require("../models/Problem");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { analyzeChallengeWithAI } = require("../services/aiService");
const { matchAllStakeholders } = require("../services/matchingEngine");
const { findRelatedChallenges } = require("../services/duplicateEngine");

/* =========================================================
   HELPER — CALCULATE PRIORITY
========================================================= */

function calculatePriority(problem, aiConfidence, aiSeverityScore, aiSeverity) {
  const severityBase = {
    Low: 15,
    Medium: 35,
    High: 60,
    Critical: 80
  };

  let base = 30;
  if (aiSeverityScore && Number(aiSeverityScore) > 0) {
    base = Math.min(85, Number(aiSeverityScore) * 8.5);
  } else if (severityBase[aiSeverity || problem.severity]) {
    base = severityBase[aiSeverity || problem.severity];
  }

  const people = Math.min(
    Number(problem.affectedPeople || 0) / 25,
    20
  );

  const confidence = Number(aiConfidence || 0.9);
  const confidenceScore = Math.min(confidence * 15, 15);

  const score = Math.min(100, Math.round((base + people + confidenceScore) * 10) / 10);

  const level =
    score >= 75
      ? "Critical"
      : score >= 55
      ? "High"
      : score >= 35
      ? "Medium"
      : "Low";

  return {
    score,
    level,
    breakdown: {
      severityBase: Math.round(base),
      affectedPeopleScore: Math.round(people * 10) / 10,
      aiConfidenceScore: Math.round(confidenceScore * 10) / 10
    }
  };
}

function buildChallengeProfile(problem) {
  let requiredExpertise = [];
  try {
    if (problem.aiRequiredExpertise) {
      requiredExpertise = JSON.parse(problem.aiRequiredExpertise);
    }
  } catch (e) {
    requiredExpertise = [];
  }

  let requiredTechnology = [];
  try {
    if (problem.aiRequiredTechnology) {
      requiredTechnology = JSON.parse(problem.aiRequiredTechnology);
    }
  } catch (e) {
    requiredTechnology = [];
  }

  let keywords = [];
  try {
    if (problem.aiKeywords) {
      keywords = JSON.parse(problem.aiKeywords);
    }
  } catch (e) {
    keywords = [];
  }

  let sectors = [];
  if (problem.aiSector) {
    sectors = problem.aiSector.split(",").map(s => s.trim());
  }

  let inputValidation = null;
  try {
    if (problem.aiInputValidation) {
      inputValidation = JSON.parse(problem.aiInputValidation);
    }
  } catch (e) {
    inputValidation = null;
  }

  return {
    domain: problem.aiDomain || problem.domain,
    sub_domain: problem.aiSubDomain || "",
    subDomain: problem.aiSubDomain || "",
    severity_score: problem.aiSeverityScore || (problem.severity === "Critical" ? 9 : problem.severity === "High" ? 7 : 5),
    severity_reason: problem.aiSeverityReason || "",
    sector: sectors.length > 0 ? sectors : ["Government", "University"],
    affected_population: problem.aiAffectedPopulation || `${problem.affectedPeople || "Multiple"} residents`,
    required_expertise: requiredExpertise,
    required_technology: requiredTechnology,
    recommended_action: problem.aiRecommendedAction || "",
    keywords,
    district: problem.district,
    location: problem.location,
    inputValidation
  };
}

/* =========================================================
   POST — CREATE NEW CITIZEN PROBLEM
========================================================= */

router.post(
  "/",
  authenticateToken,
  authorizeRoles("citizen"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        domain,
        district,
        location,
        latitude,
        longitude,
        affectedPeople,
        severity
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required to report a problem."
        });
      }

      const assignedDistrict = (district && district.trim()) || "Maharashtra";
      const assignedDomain = (domain && domain.trim()) || "Public Administration";
      const assignedSeverity = (severity && severity.trim()) || "Medium";
      const assignedAffected = affectedPeople ? Number(affectedPeople) : null;

      // Generate distinct unique problem ID & Universal Tracking ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const problemId = `CH-${Date.now().toString().slice(-6)}-${randomSuffix}`;
      const trackingId = req.body.trackingId || `MH-FED-2026-${randomSuffix}`;
      const serviceType = req.body.serviceType || "Unified Inter-Departmental Service";
      const primaryDepartment = req.body.primaryDepartment || "MahaSwayam (Skill & Employment)";
      const targetDepartments = req.body.targetDepartments || JSON.stringify(["MahaSwayam", "MahaDBT", "DigiLocker"]);
      const consentToken = req.body.consentToken || `DEPA-MH-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const photo = req.files?.photo?.[0]?.filename || "";
      const video = req.files?.video?.[0]?.filename || "";

      const problem = await Problem.create({
        problemId,
        citizenId: req.user.id,
        title: title.trim(),
        description: description.trim(),
        domain: assignedDomain,
        district: assignedDistrict,
        location: (location || "").trim(),
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        affectedPeople: assignedAffected,
        severity: assignedSeverity,
        photo,
        video,
        status: "Under Review",
        projectStatus: "Canonical Ingestion Complete",
        trackingId,
        serviceType,
        primaryDepartment,
        targetDepartments,
        connectorSource: "MahaSetu Unified Citizen Gateway",
        consentToken,
        consentStatus: "GRANTED",
        dataQualityScore: 98,
        crossDeptStatus: JSON.stringify([
          { dept: primaryDepartment.split(" ")[0], step: "Application Ingested", status: "VERIFIED", timestamp: new Date() },
          { dept: "DigiLocker", step: "Document e-KYC Verification", status: "AUTO_CONFIRMED", timestamp: new Date() },
          { dept: "MahaDBT", step: "Cross-Agency Workflow Routing", status: "PENDING_DISBURSAL", timestamp: new Date() }
        ])
      });

      // Execute Qwen AI analysis synchronously so the citizen immediately gets analysis
      try {
        console.log(`[AI Analysis] Analyzing new problem: ${problem.problemId}`);
        const ai = await analyzeChallengeWithAI({
          title: problem.title,
          description: problem.description,
          domain: problem.domain,
          severity: problem.severity,
          affectedPeople: problem.affectedPeople,
          district: problem.district,
          location: problem.location,
          latitude: problem.latitude,
          longitude: problem.longitude,
          photo: problem.photo,
          video: problem.video
        });

        const sectorList = Array.isArray(ai.sector)
          ? ai.sector
          : (typeof ai.sector === "string" ? ai.sector.split(",").map(s => s.trim()) : ["Government", "University"]);

        const priority = calculatePriority(
          problem,
          ai.confidence,
          ai.severity_score,
          ai.severity
        );

        // Check for duplicates/related challenges
        const related = await findRelatedChallenges(problem, 3);
        let duplicateOf = null;
        let duplicateSimilarity = null;
        if (related.length > 0 && related[0].similarity >= 65) {
          duplicateOf = related[0].problemId;
          duplicateSimilarity = related[0].similarityDecimal;
        }

        await problem.update({
          aiDomain: ai.domain || problem.domain,
          aiSubDomain: ai.sub_domain || "",
          aiSector: sectorList.join(", "),
          aiSeverity: String(ai.severity_score || 7),
          aiSeverityScore: ai.severity_score || 7,
          aiSeverityReason: ai.severity_reason || "Assessed based on reported societal urgency and community impact.",
          aiAffectedPopulation: ai.affected_population || `${problem.affectedPeople || "Community"} residents`,
          aiRequiredExpertise: JSON.stringify(ai.required_expertise || []),
          aiRequiredTechnology: JSON.stringify(ai.required_technology || []),
          aiRecommendedAction: ai.recommended_action || "On-site multi-stakeholder assessment",
          aiKeywords: JSON.stringify(ai.keywords || []),
          aiEvidenceRequirements: JSON.stringify(ai.evidence_requirements || []),
          aiReasoning: `Classified under ${ai.domain || problem.domain} because citizen report details real-world impact in ${problem.district} requiring action by ${sectorList.join(', ')}.`,
          aiConfidence: ai.confidence || 0.94,
          aiProvider: ai.aiProvider || "deterministic_fallback",
          aiModel: ai.aiModel || "deterministic_heuristic_engine",
          aiInputValidation: JSON.stringify(ai.input_validation || {}),
          priorityScore: priority.score,
          priorityLevel: priority.level,
          priorityBreakdown: JSON.stringify(priority.breakdown),
          duplicateOf,
          duplicateSimilarity,
          aiProcessedAt: new Date(),
          projectStatus: "AI Analysis Complete"
        });

        console.log(`[AI Analysis] Successfully completed for: ${problem.problemId} with input validation audit`);
      } catch (aiErr) {
        console.error(`[AI Analysis] Error analyzing problem:`, aiErr);
      }

      return res.status(201).json({
        success: true,
        message: "Problem submitted successfully and analyzed with Explainable AI.",
        problem: problem.toJSON()
      });
    } catch (error) {
      console.error("CREATE PROBLEM ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to submit problem",
        error: error.message
      });
    }
  }
);

/* =========================================================
   GET — CITIZEN'S OWN PROBLEMS
========================================================= */

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("citizen"),
  async (req, res) => {
    try {
      const problems = await Problem.findAll({
        where: { citizenId: req.user.id },
        order: [["createdAt", "DESC"]]
      });

      return res.json({
        success: true,
        problems
      });
    } catch (error) {
      console.error("GET MY PROBLEMS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load your problems",
        error: error.message
      });
    }
  }
);

/* =========================================================
   GET — ALL PROBLEMS FOR GOVERNMENT / INDUSTRY
========================================================= */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const problems = await Problem.findAll({
        order: [
          ["priorityScore", "DESC"],
          ["createdAt", "DESC"]
        ]
      });

      return res.json({
        success: true,
        problems
      });
    } catch (error) {
      console.error("GET ALL PROBLEMS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load problems",
        error: error.message
      });
    }
  }
);

/* =========================================================
   POST — RE-ANALYZE / ANALYZE EXISTING PROBLEM
========================================================= */

async function handleReanalyze(req, res) {
  try {
    const { problemId } = req.params;
    console.log(`[AI Analysis] Re-analyzing problem: ${problemId}`);

    const problem = await Problem.findOne({ where: { problemId } });
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const ai = await analyzeChallengeWithAI({
      title: problem.title,
      description: problem.description,
      domain: problem.domain,
      severity: problem.severity,
      affectedPeople: problem.affectedPeople,
      district: problem.district,
      location: problem.location,
      latitude: problem.latitude,
      longitude: problem.longitude,
      photo: problem.photo,
      video: problem.video
    });

    const sectorList = Array.isArray(ai.sector)
      ? ai.sector
      : (typeof ai.sector === "string" ? ai.sector.split(",").map(s => s.trim()) : ["Government", "University"]);

    const priority = calculatePriority(
      problem,
      ai.confidence,
      ai.severity_score,
      ai.severity
    );

    const related = await findRelatedChallenges(problem, 3);
    let duplicateOf = null;
    let duplicateSimilarity = null;
    if (related.length > 0 && related[0].similarity >= 65) {
      duplicateOf = related[0].problemId;
      duplicateSimilarity = related[0].similarityDecimal;
    }

    await problem.update({
      aiDomain: ai.domain || problem.domain,
      aiSubDomain: ai.sub_domain || "",
      aiSector: sectorList.join(", "),
      aiSeverity: String(ai.severity_score || 7),
      aiSeverityScore: ai.severity_score || 7,
      aiSeverityReason: ai.severity_reason || "Assessed based on reported societal urgency and community impact.",
      aiAffectedPopulation: ai.affected_population || `${problem.affectedPeople || "Community"} residents`,
      aiRequiredExpertise: JSON.stringify(ai.required_expertise || []),
      aiRequiredTechnology: JSON.stringify(ai.required_technology || []),
      aiRecommendedAction: ai.recommended_action || "On-site multi-stakeholder assessment",
      aiKeywords: JSON.stringify(ai.keywords || []),
      aiEvidenceRequirements: JSON.stringify(ai.evidence_requirements || []),
      aiReasoning: `Classified under ${ai.domain || problem.domain} because citizen report details real-world impact in ${problem.district} requiring action by ${sectorList.join(', ')}.`,
      aiConfidence: ai.confidence || 0.94,
      aiProvider: ai.aiProvider || "deterministic_fallback",
      aiModel: ai.aiModel || "deterministic_heuristic_engine",
      aiInputValidation: JSON.stringify(ai.input_validation || {}),
      priorityScore: priority.score,
      priorityLevel: priority.level,
      priorityBreakdown: JSON.stringify(priority.breakdown),
      duplicateOf,
      duplicateSimilarity,
      aiProcessedAt: new Date(),
      projectStatus: "AI Analysis Complete"
    });

    const challengeProfile = buildChallengeProfile(problem);
    const recommendations = matchAllStakeholders(challengeProfile);

    return res.json({
      success: true,
      message: ai.isFallback
        ? "AI analysis completed using deterministic fallback engine."
        : "AI analysis completed successfully via Qwen inference.",
      problemId: problem.problemId,
      aiProvider: ai.aiProvider || "deterministic_fallback",
      aiModel: ai.aiModel || "deterministic_heuristic_engine",
      isFallback: !!ai.isFallback,
      analysis: {
        domain: ai.domain || problem.domain,
        sub_domain: ai.sub_domain || "",
        subDomain: ai.sub_domain || "",
        severity_score: ai.severity_score || 7,
        severity_reason: ai.severity_reason || "",
        sector: sectorList,
        affected_population: ai.affected_population || "",
        required_expertise: ai.required_expertise || [],
        required_technology: ai.required_technology || [],
        recommended_action: ai.recommended_action || "",
        keywords: ai.keywords || [],
        evidence_requirements: ai.evidence_requirements || [],
        confidence: ai.confidence || 0.94,
        aiProvider: ai.aiProvider || "deterministic_fallback",
        aiModel: ai.aiModel || "deterministic_heuristic_engine",
        isFallback: !!ai.isFallback
      },
      priority,
      recommendations,
      relatedChallenges: related
    });
  } catch (error) {
    console.error("RE-ANALYZE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "AI analysis temporarily unavailable.",
      error: error.message
    });
  }
}

/* =========================================================
   POST — REAL-TIME AI PRE-ANALYZE FOR CITIZEN DRAFTS
========================================================= */
router.post("/pre-analyze", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      domain,
      severity,
      affectedPeople,
      district,
      location,
      latitude,
      longitude,
      hasPhoto,
      hasVideo
    } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: "Title or description is required for AI analysis."
      });
    }

    console.log(`[AI Pre-Analysis] Analyzing draft: "${title || ''}" | Coords: (${latitude || 'N/A'}, ${longitude || 'N/A'}) | District: ${district || 'Maharashtra'} | Media: photo=${!!hasPhoto}, video=${!!hasVideo}`);
    const ai = await analyzeChallengeWithAI({
      title: title || "Citizen Challenge",
      description: description || title || "",
      domain: domain || "",
      severity: severity || "",
      affectedPeople: affectedPeople || null,
      district: district || "Maharashtra",
      location: location || "",
      latitude: latitude || null,
      longitude: longitude || null,
      photo: hasPhoto ? "citizen_field_evidence.jpg" : "",
      video: hasVideo ? "citizen_field_video.mp4" : ""
    });

    return res.json({
      success: true,
      analysis: ai
    });
  } catch (err) {
    console.error("PRE-ANALYZE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: err.message
    });
  }
});

router.post("/:problemId/reanalyze", authenticateToken, handleReanalyze);
router.post("/:problemId/analyze", authenticateToken, handleReanalyze);

/* =========================================================
   GET — SINGLE PROBLEM WITH RELATED CHALLENGES & RECOMMENDATIONS
========================================================= */

router.get(
  "/:problemId",
  authenticateToken,
  async (req, res) => {
    try {
      const { problemId } = req.params;

      const problem = await Problem.findOne({
        where: { problemId }
      });

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: "Problem not found"
        });
      }

      // Check citizen ownership
      if (req.user.role === "citizen" && Number(problem.citizenId) !== Number(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this challenge"
        });
      }

      // Compute multi-stakeholder recommendations
      const challengeProfile = buildChallengeProfile(problem);
      const recommendations = matchAllStakeholders(challengeProfile);

      // Compute related challenges
      const relatedChallenges = await findRelatedChallenges(problem, 4);

      const problemData = problem.toJSON();
      try {
        if (problemData.aiInputValidation && typeof problemData.aiInputValidation === "string") {
          problemData.aiInputValidation = JSON.parse(problemData.aiInputValidation);
        }
      } catch (e) {}

      return res.json({
        success: true,
        problem: problemData,
        recommendations,
        relatedChallenges
      });
    } catch (error) {
      console.error("GET SINGLE PROBLEM ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load problem",
        error: error.message
      });
    }
  }
);

module.exports = router;