const path = require("path");
const fs = require("fs");

// Load prototype knowledge base
const KNOWLEDGE_BASE_PATH = path.join(__dirname, "../data/prototype_knowledge_base.json");
let knowledgeBase = {
  universities: [],
  governmentDepartments: [],
  industryPartners: [],
  ngos: []
};

try {
  if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    const raw = fs.readFileSync(KNOWLEDGE_BASE_PATH, "utf-8");
    knowledgeBase = JSON.parse(raw);
  }
} catch (e) {
  console.error("Failed to load prototype knowledge base:", e);
}

// Configurable prototype weights as requested in Part 4
const MATCHING_WEIGHTS = {
  domain: 0.35,      // Semantic / domain relevance: 35%
  expertise: 0.25,   // Expertise match: 25%
  project: 0.15,     // Previous project relevance: 15%
  technology: 0.10,  // Required technology/resource match: 10%
  sector: 0.10,      // Sector relevance: 10%
  location: 0.05     // Geographic relevance: 5%
};

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function calculateTokenOverlap(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const matches = tokensB.filter(t => setA.has(t));
  return matches.length;
}

/**
 * Score a single stakeholder profile against the structured AI challenge profile.
 */
function scoreStakeholder(stakeholder, stakeholderType, challengeProfile, customWeights = MATCHING_WEIGHTS) {
  const weights = { ...MATCHING_WEIGHTS, ...(customWeights || {}) };

  const targetDomain = String(challengeProfile.domain || "").toLowerCase();
  const targetSubDomain = String(challengeProfile.sub_domain || challengeProfile.subDomain || "").toLowerCase();
  const targetDistrict = String(challengeProfile.district || challengeProfile.location || "").toLowerCase();
  const targetExpertise = (challengeProfile.required_expertise || []).map(e => String(e).toLowerCase());
  const targetTech = (challengeProfile.required_technology || []).map(t => String(t).toLowerCase());
  const targetSectors = (challengeProfile.sector || []).map(s => String(s).toLowerCase());
  const targetKeywords = (challengeProfile.keywords || []).map(k => String(k).toLowerCase());

  const reasons = [];
  const relevantCapabilities = [];

  // 1. Domain Score (0-100)
  let domainScore = 0;
  const stakeholderDomains = (stakeholder.domains || [stakeholder.domain || ""]).map(d => String(d).toLowerCase());
  const stakeholderSubDomains = (stakeholder.subDomains || []).map(sd => String(sd).toLowerCase());

  const exactDomainMatch = stakeholderDomains.some(d => d === targetDomain || d.includes(targetDomain) || targetDomain.includes(d));
  if (exactDomainMatch) {
    domainScore = 95;
    reasons.push(`✓ ${challengeProfile.domain} domain match`);
  } else if (stakeholderDomains.length > 0) {
    const domainTokens = stakeholderDomains.flatMap(d => tokenize(d));
    const targetTokens = tokenize(targetDomain);
    const overlap = calculateTokenOverlap(domainTokens, targetTokens);
    if (overlap > 0) {
      domainScore = 65;
      reasons.push(`✓ Related domain capability in ${stakeholderDomains[0]}`);
    } else {
      domainScore = 30;
    }
  }

  // Bonus for sub-domain
  if (targetSubDomain && stakeholderSubDomains.some(sd => sd.includes(targetSubDomain) || targetSubDomain.includes(sd))) {
    domainScore = Math.min(100, domainScore + 5);
    reasons.push(`✓ Specific sub-domain alignment: ${challengeProfile.sub_domain || challengeProfile.subDomain}`);
  }

  // 2. Expertise Score (0-100)
  let expertiseScore = 30; // base potential
  const stakeholderExpertise = (stakeholder.expertise || []).map(e => String(e).toLowerCase());
  const matchedExpertise = [];

  targetExpertise.forEach(req => {
    const found = stakeholderExpertise.find(exp => exp.includes(req) || req.includes(exp));
    if (found) {
      matchedExpertise.push(found);
      relevantCapabilities.push(found);
    }
  });

  // Check keyword overlap against expertise
  targetKeywords.forEach(kw => {
    const found = stakeholderExpertise.find(exp => exp.includes(kw));
    if (found && !matchedExpertise.includes(found)) {
      matchedExpertise.push(found);
      relevantCapabilities.push(found);
    }
  });

  if (matchedExpertise.length >= 3) {
    expertiseScore = 95;
    matchedExpertise.slice(0, 2).forEach(m => reasons.push(`✓ ${m} core expertise`));
  } else if (matchedExpertise.length === 2) {
    expertiseScore = 85;
    matchedExpertise.forEach(m => reasons.push(`✓ ${m} expertise`));
  } else if (matchedExpertise.length === 1) {
    expertiseScore = 70;
    reasons.push(`✓ ${matchedExpertise[0]} expertise`);
  } else if (stakeholderExpertise.length > 0) {
    expertiseScore = 50;
  }

  // 3. Previous Project Relevance Score (0-100)
  let projectScore = 35;
  const stakeholderProjects = (stakeholder.projects || stakeholder.keyProjects || []).map(p => String(p).toLowerCase());
  const relevantProjects = [];

  stakeholderProjects.forEach(proj => {
    const projTokens = tokenize(proj);
    const domainTokens = tokenize(targetDomain);
    const kwTokens = targetKeywords.flatMap(k => tokenize(k));
    const overlap = calculateTokenOverlap(projTokens, [...domainTokens, ...kwTokens]);
    if (overlap >= 2) {
      relevantProjects.push(proj);
    }
  });

  if (relevantProjects.length >= 2) {
    projectScore = 90;
    reasons.push(`✓ Previous proven project: "${relevantProjects[0]}"`);
  } else if (relevantProjects.length === 1) {
    projectScore = 80;
    reasons.push(`✓ Prior work on similar challenge: "${relevantProjects[0]}"`);
  } else if (stakeholderProjects.length > 0) {
    projectScore = 60;
  }

  // 4. Required Technology / Resource Match (0-100)
  let technologyScore = 40;
  const stakeholderResources = (stakeholder.resources || stakeholder.focusAreas || []).map(r => String(r).toLowerCase());
  const matchedTech = [];

  targetTech.forEach(t => {
    const found = stakeholderResources.find(res => res.includes(t) || t.includes(res));
    if (found) {
      matchedTech.push(found);
      relevantCapabilities.push(found);
    }
  });

  if (matchedTech.length >= 2) {
    technologyScore = 92;
    matchedTech.slice(0, 2).forEach(t => reasons.push(`✓ ${t} technical resource`));
  } else if (matchedTech.length === 1) {
    technologyScore = 78;
    reasons.push(`✓ ${matchedTech[0]} equipment/facility`);
  } else if (stakeholderResources.length > 0) {
    technologyScore = 60;
  }

  // 5. Sector Relevance Score (0-100)
  let sectorScore = 50;
  let typeMappedSector = "University";
  if (stakeholderType === "government") typeMappedSector = "Government";
  if (stakeholderType === "industry") typeMappedSector = "Industry";
  if (stakeholderType === "ngo") typeMappedSector = "NGO";

  if (targetSectors.includes(typeMappedSector.toLowerCase())) {
    sectorScore = 95;
    reasons.push(`✓ Explicitly identified as target ${typeMappedSector} sector`);
  } else {
    sectorScore = 70;
  }

  // 6. Geographic / Location Relevance Score (0-100)
  let locationScore = 50;
  const stakeholderDistrict = String(stakeholder.district || stakeholder.location || stakeholder.districts || "").toLowerCase();

  if (targetDistrict && (stakeholderDistrict.includes(targetDistrict) || targetDistrict.includes(stakeholderDistrict))) {
    locationScore = 95;
    reasons.push(`✓ Direct district presence in ${stakeholder.district || stakeholder.location}`);
  } else if (stakeholderDistrict.includes("all districts") || stakeholderDistrict.includes("statewide")) {
    locationScore = 85;
    reasons.push(`✓ Statewide jurisdiction covering reported area`);
  } else if (stakeholderDistrict.includes("ranchi") || targetDistrict.includes("ranchi")) {
    locationScore = 75;
    reasons.push(`✓ Regional capital accessibility`);
  }

  // Calculate Weighted Final Score
  const rawScore = (
    domainScore * weights.domain +
    expertiseScore * weights.expertise +
    projectScore * weights.project +
    technologyScore * weights.technology +
    sectorScore * weights.sector +
    locationScore * weights.location
  );

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine Next Action based on stakeholder type and domain
  let nextAction = "Assign for initial feasibility study and community engagement";
  if (stakeholderType === "government") {
    nextAction = `Initiate departmental site verification under ${stakeholder.schemes ? stakeholder.schemes.split(",")[0] : "state departmental program"}`;
  } else if (stakeholderType === "university") {
    nextAction = "Deploy student/faculty team for on-site diagnostic sample collection and technical design";
  } else if (stakeholderType === "industry") {
    nextAction = "Invite for CSR sponsorship, technical solution pilot, or equipment deployment";
  } else if (stakeholderType === "ngo") {
    nextAction = "Mobilize community action group for grassroots verification and citizen feedback";
  }

  const sTypeFormatted = stakeholderType === "government"
    ? "GovernmentDepartment"
    : stakeholderType === "university"
    ? "University"
    : stakeholderType === "industry"
    ? "IndustryPartner"
    : "NGO";

  const sName = stakeholder.name || stakeholder.organization || "Stakeholder";

  return {
    stakeholderId: stakeholder.id,
    stakeholderName: sName,
    name: sName,
    code: stakeholder.code || "",
    location: stakeholder.location || stakeholder.district || "Maharashtra",
    district: stakeholder.district || "",
    stakeholderType: sTypeFormatted,
    type: stakeholderType,
    compatibilityScore: finalScore,
    finalScore: finalScore,
    score: finalScore,
    matchScore: finalScore,
    componentScores: {
      domainScore: Math.round(domainScore),
      expertiseScore: Math.round(expertiseScore),
      projectScore: Math.round(projectScore),
      technologyScore: Math.round(technologyScore),
      sectorScore: Math.round(sectorScore),
      locationScore: Math.round(locationScore),
      domain: Math.round(domainScore),
      expertise: Math.round(expertiseScore),
      previousProjects: Math.round(projectScore),
      technology: Math.round(technologyScore),
      sector: Math.round(sectorScore),
      location: Math.round(locationScore)
    },
    reasons: reasons.length > 0 ? reasons : ["✓ General societal innovation compatibility"],
    matchReasons: reasons.length > 0 ? reasons : ["✓ General societal innovation compatibility"],
    relevantCapabilities: Array.from(new Set(relevantCapabilities)).slice(0, 4),
    recommendedNextAction: nextAction,
    nextAction: nextAction,
    isPrototypeSampleData: stakeholder.isPrototypeSampleData !== false
  };
}

/**
 * Main Multi-Stakeholder Matching Engine
 * Recommends across all 4 categories with transparent explainability.
 */
function matchAllStakeholders(challengeProfile, customWeights = MATCHING_WEIGHTS) {
  // 1. Universities
  const universityMatches = (knowledgeBase.universities || []).map(u =>
    scoreStakeholder(u, "university", challengeProfile, customWeights)
  ).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // 2. Government Departments
  const governmentMatches = (knowledgeBase.governmentDepartments || []).map(g =>
    scoreStakeholder(g, "government", challengeProfile, customWeights)
  ).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // 3. Industry / CSR Partners
  const industryMatches = (knowledgeBase.industryPartners || []).map(i =>
    scoreStakeholder(i, "industry", challengeProfile, customWeights)
  ).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // 4. NGOs
  const ngoMatches = (knowledgeBase.ngos || []).map(n =>
    scoreStakeholder(n, "ngo", challengeProfile, customWeights)
  ).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const topArray = [
    ...(universityMatches[0] ? [universityMatches[0]] : []),
    ...(governmentMatches[0] ? [governmentMatches[0]] : []),
    ...(industryMatches[0] ? [industryMatches[0]] : []),
    ...(ngoMatches[0] ? [ngoMatches[0]] : [])
  ];

  return {
    universities: universityMatches,
    government: governmentMatches,
    industry: industryMatches,
    ngo: ngoMatches,
    weights: customWeights || MATCHING_WEIGHTS,
    topRecommendations: topArray,
    topRecommendationsMap: {
      university: universityMatches[0] || null,
      government: governmentMatches[0] || null,
      industry: industryMatches[0] || null,
      ngo: ngoMatches[0] || null
    }
  };
}

function matchProblemToAllStakeholders(problem, customWeights = MATCHING_WEIGHTS) {
  let challengeProfile = problem;
  if (problem && problem.dataValues) {
    challengeProfile = problem.dataValues;
  }
  return matchAllStakeholders(challengeProfile, customWeights);
}

module.exports = {
  scoreStakeholder,
  matchAllStakeholders,
  matchProblemToAllStakeholders,
  MATCHING_WEIGHTS,
  knowledgeBase
};
