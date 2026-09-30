/**
 * JanSetu Master Data Management (MDM) & Entity Resolution Engine
 *
 * Implements:
 * 1. Canonical Schema (Person, Application, Service, Document, Grievance)
 * 2. Fuzzy Entity Resolution on Name, DOB, Tokenized Aadhaar Hash, and District
 * 3. Golden Record Generation with Cross-System IDs
 * 4. Synthetic testbed with planted duplicates and borderline manual-review queue
 */

const crypto = require("crypto");

function calculateSha256(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

// Jaro-Winkler string distance implementation for robust Name matching
function jaroDistance(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();

  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
}

function jaroWinkler(s1, s2, p = 0.1) {
  const jd = jaroDistance(s1, s2);
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i].toLowerCase() === s2[i].toLowerCase()) prefix++;
    else break;
  }
  return jd + prefix * p * (1 - jd);
}

// Pre-seeded Synthetic Golden Records
let GOLDEN_RECORDS = [
  {
    goldenId: "GLD-MH-100412",
    canonicalPerson: {
      fullName: "Aniket Suresh Patil",
      dob: "1999-04-14",
      gender: "Male",
      aadhaarTokenHash: calculateSha256("AADHAAR-ANIKET-001"),
      mobileMasked: "+91-98XXXXX412",
      district: "Pune",
      state: "Maharashtra"
    },
    crossSystemIds: {
      mahaswayamId: "MSW-PUN-2024-819",
      mahadbtId: "DBT-MH-994102",
      aapleSarkarId: "AS-RTS-84190",
      digiLockerId: "DL-DOC-8941",
      pfmsId: "PFMS-501004289"
    },
    linkedDocuments: [
      { docType: "Income Certificate", certNumber: "INC-MH-2025-01934", verified: true },
      { docType: "Caste Certificate", certNumber: "CC-MH-2023-884129", category: "OBC", verified: true },
      { docType: "ITI Technical Diploma", certNumber: "ITI-MECH-2024-88", verified: true }
    ],
    confidenceScore: 0.98,
    lastConsolidatedAt: "2026-09-28T14:20:00Z"
  },
  {
    goldenId: "GLD-MH-100413",
    canonicalPerson: {
      fullName: "Priya Ramesh Deshmukh",
      dob: "2001-11-03",
      gender: "Female",
      aadhaarTokenHash: calculateSha256("AADHAAR-PRIYA-002"),
      mobileMasked: "+91-97XXXXX831",
      district: "Nagpur",
      state: "Maharashtra"
    },
    crossSystemIds: {
      mahaswayamId: "MSW-NAG-2025-412",
      mahadbtId: "DBT-MH-772190",
      digiLockerId: "DL-DOC-4412"
    },
    linkedDocuments: [
      { docType: "Higher Secondary Certificate", certNumber: "HSC-NAG-2023-112", verified: true },
      { docType: "Domicile Certificate", certNumber: "DOM-MH-2022-901", verified: true }
    ],
    confidenceScore: 0.95,
    lastConsolidatedAt: "2026-09-27T10:15:00Z"
  },
  {
    goldenId: "GLD-MH-100414",
    canonicalPerson: {
      fullName: "Sachin Baburao Jadhav",
      dob: "1995-08-22",
      gender: "Male",
      aadhaarTokenHash: calculateSha256("AADHAAR-SACHIN-003"),
      mobileMasked: "+91-94XXXXX119",
      district: "Nashik",
      state: "Maharashtra"
    },
    crossSystemIds: {
      mahadbtId: "DBT-MH-661029",
      aapleSarkarId: "AS-RTS-33109"
    },
    linkedDocuments: [
      { docType: "Farmer 7/12 Holding", certNumber: "712-NSK-GUT-44", verified: true }
    ],
    confidenceScore: 0.92,
    lastConsolidatedAt: "2026-09-26T16:45:00Z"
  }
];

// Pre-seeded Borderline Manual Review Queue (Synthetic Planted Edge Cases)
let MANUAL_REVIEW_QUEUE = [
  {
    queueId: "MRQ-2026-01",
    candidatePerson: {
      fullName: "Ankit S. Patil", // Spelling typo vs Aniket Suresh Patil
      dob: "1999-04-14",
      gender: "Male",
      district: "Pune (Haveli)",
      sourceSystem: "MahaSwayam (Apprentice Intake Form)",
      sourceRecordId: "MSW-FORM-RAW-8812"
    },
    matchedGoldenRecordId: "GLD-MH-100412",
    matchedGoldenName: "Aniket Suresh Patil",
    matchScores: {
      nameSimilarity: 0.81, // Jaro-Winkler
      dobExactMatch: true,
      districtMatch: true,
      aadhaarProvided: false,
      overallCompositeConfidence: 0.78 // Borderline: between 0.65 and 0.85
    },
    reason: "High name phonetic proximity and matching DOB, but partial initial 'S.' and missing Aadhaar token.",
    status: "PENDING_REVIEW",
    createdAt: "2026-09-29T09:30:00Z"
  },
  {
    queueId: "MRQ-2026-02",
    candidatePerson: {
      fullName: "Sachin B. Jadhav",
      dob: "1995-08-20", // 2-day transposition discrepancy vs 1995-08-22
      gender: "Male",
      district: "Chhatrapati Sambhajinagar",
      sourceSystem: "MahaDBT (Scholarship Re-application)",
      sourceRecordId: "DBT-APPL-77491"
    },
    matchedGoldenRecordId: "GLD-MH-100414",
    matchedGoldenName: "Sachin Baburao Jadhav",
    matchScores: {
      nameSimilarity: 0.88,
      dobExactMatch: false,
      districtMatch: false,
      aadhaarProvided: false,
      overallCompositeConfidence: 0.72
    },
    reason: "Name strongly matches but Date of Birth has a 2-day discrepancy and district differs. Possible sibling or clerical error.",
    status: "PENDING_REVIEW",
    createdAt: "2026-09-29T11:10:00Z"
  }
];

/**
 * Computes composite match confidence between an incoming person record and a candidate golden record
 */
function computeMatchConfidence(incoming, candidate) {
  const gPerson = candidate.canonicalPerson;

  // 1. Name Similarity (Jaro-Winkler)
  const nameScore = jaroWinkler(incoming.fullName || "", gPerson.fullName || "");

  // 2. Aadhaar Token Hash
  let aadhaarScore = 0.0;
  if (incoming.aadhaarTokenHash && gPerson.aadhaarTokenHash) {
    aadhaarScore = incoming.aadhaarTokenHash === gPerson.aadhaarTokenHash ? 1.0 : 0.0;
  }

  // 3. DOB Match
  let dobScore = 0.0;
  if (incoming.dob && gPerson.dob) {
    dobScore = incoming.dob === gPerson.dob ? 1.0 : 0.0;
  }

  // 4. District Proximity
  let districtScore = 0.0;
  if (incoming.district && gPerson.district) {
    districtScore = incoming.district.toLowerCase().includes(gPerson.district.toLowerCase()) ||
                    gPerson.district.toLowerCase().includes(incoming.district.toLowerCase()) ? 1.0 : 0.0;
  }

  // Weighted formula
  let compositeScore = 0;
  if (incoming.aadhaarTokenHash && gPerson.aadhaarTokenHash) {
    // High weight on Aadhaar if present
    compositeScore = (aadhaarScore * 0.45) + (nameScore * 0.35) + (dobScore * 0.15) + (districtScore * 0.05);
  } else {
    // Name + DOB heavier weight
    compositeScore = (nameScore * 0.60) + (dobScore * 0.25) + (districtScore * 0.15);
  }

  return {
    compositeScore: parseFloat(compositeScore.toFixed(3)),
    nameScore: parseFloat(nameScore.toFixed(3)),
    dobScore,
    districtScore,
    aadhaarScore
  };
}

/**
 * Resolves incoming person against existing Golden Records
 */
function resolvePersonEntity(incomingPerson) {
  let highestMatch = null;
  let bestScore = 0;

  for (const golden of GOLDEN_RECORDS) {
    const scores = computeMatchConfidence(incomingPerson, golden);
    if (scores.compositeScore > bestScore) {
      bestScore = scores.compositeScore;
      highestMatch = { golden, scores };
    }
  }

  if (bestScore >= 0.85) {
    return {
      action: "AUTO_MERGED",
      confidence: bestScore,
      goldenId: highestMatch.golden.goldenId,
      goldenRecord: highestMatch.golden,
      message: `Entity confidently resolved (${(bestScore * 100).toFixed(1)}% match). Merged into existing Golden Record ${highestMatch.golden.goldenId}.`
    };
  } else if (bestScore >= 0.65) {
    const newQueueItem = {
      queueId: `MRQ-2026-${Date.now().toString().slice(-4)}`,
      candidatePerson: incomingPerson,
      matchedGoldenRecordId: highestMatch.golden.goldenId,
      matchedGoldenName: highestMatch.golden.canonicalPerson.fullName,
      matchScores: highestMatch.scores,
      reason: `Borderline match confidence (${(bestScore * 100).toFixed(1)}%). Requires nodal officer verification.`,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString()
    };
    MANUAL_REVIEW_QUEUE.unshift(newQueueItem);

    return {
      action: "ROUTED_TO_MANUAL_REVIEW",
      confidence: bestScore,
      queueId: newQueueItem.queueId,
      matchedGoldenId: highestMatch.golden.goldenId,
      message: `Borderline match (${(bestScore * 100).toFixed(1)}%). Planted in Manual Review Queue for official sign-off.`
    };
  } else {
    // Create new Golden Record
    const newGoldenId = `GLD-MH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newGoldenRecord = {
      goldenId: newGoldenId,
      canonicalPerson: {
        fullName: incomingPerson.fullName,
        dob: incomingPerson.dob || "2000-01-01",
        gender: incomingPerson.gender || "Unspecified",
        aadhaarTokenHash: incomingPerson.aadhaarTokenHash || calculateSha256(`AADHAAR-${incomingPerson.fullName}`),
        mobileMasked: incomingPerson.mobileMasked || "+91-9XXXXXXXXX",
        district: incomingPerson.district || "Maharashtra",
        state: "Maharashtra"
      },
      crossSystemIds: {
        portalGeneratedId: `SYS-${Date.now().toString().slice(-6)}`
      },
      linkedDocuments: [],
      confidenceScore: 1.0,
      lastConsolidatedAt: new Date().toISOString()
    };
    GOLDEN_RECORDS.unshift(newGoldenRecord);

    return {
      action: "NEW_GOLDEN_RECORD_CREATED",
      confidence: 1.0,
      goldenId: newGoldenId,
      goldenRecord: newGoldenRecord,
      message: `Distinct individual identified (highest match was only ${(bestScore * 100).toFixed(1)}%). Created new Golden Record ${newGoldenId}.`
    };
  }
}

/**
 * Admin resolves a borderline queue item (Merge or Separate)
 */
function resolveManualReview(queueId, action, officerName = "State Nodal Reviewer") {
  const itemIndex = MANUAL_REVIEW_QUEUE.findIndex(q => q.queueId === queueId);
  if (itemIndex === -1) {
    return { success: false, message: "Review queue item not found" };
  }

  const item = MANUAL_REVIEW_QUEUE[itemIndex];
  if (action === "MERGE") {
    item.status = "APPROVED_MERGED";
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = officerName;

    // Link alias into Golden Record
    const golden = GOLDEN_RECORDS.find(g => g.goldenId === item.matchedGoldenRecordId);
    if (golden) {
      if (!golden.aliases) golden.aliases = [];
      golden.aliases.push({
        aliasName: item.candidatePerson.fullName,
        sourceSystem: item.candidatePerson.sourceSystem,
        mergedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      action: "MERGE_CONFIRMED",
      message: `Entity '${item.candidatePerson.fullName}' manually verified and linked to Golden Record ${item.matchedGoldenRecordId}.`
    };
  } else {
    item.status = "REJECTED_SEPARATE";
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = officerName;

    return {
      success: true,
      action: "REJECTED_AS_DISTINCT",
      message: `Confirmed that '${item.candidatePerson.fullName}' is a distinct resident. Treated as separate profile.`
    };
  }
}

module.exports = {
  GOLDEN_RECORDS,
  MANUAL_REVIEW_QUEUE,
  resolvePersonEntity,
  resolveManualReview,
  computeMatchConfidence
};
