const { Op } = require("sequelize");
const Problem = require("../models/Problem");

function tokenize(text) {
  if (!text) return [];
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);
  const stopwords = new Set(["this", "that", "with", "from", "have", "were", "there", "their", "problem", "village", "near", "many", "been", "some"]);
  return words.filter(w => !stopwords.has(w));
}

function calculateSimilarity(textA, textB, domainA, domainB, districtA, districtB) {
  let score = 0;

  // Domain match gives 30% baseline
  if (domainA && domainB && String(domainA).toLowerCase() === String(domainB).toLowerCase()) {
    score += 0.30;
  }

  // District match gives 25%
  if (districtA && districtB && String(districtA).toLowerCase() === String(districtB).toLowerCase()) {
    score += 0.25;
  }

  // Token overlap on title and description (45%)
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));
  if (tokensA.size > 0 && tokensB.size > 0) {
    let intersection = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) intersection++;
    });
    const union = new Set([...tokensA, ...tokensB]).size;
    const jaccard = union > 0 ? intersection / union : 0;
    score += jaccard * 0.45;
  }

  return Math.min(1.0, Math.round(score * 1000) / 1000);
}

/**
 * Finds related/duplicate challenges in the database for a given problem.
 */
async function findRelatedChallenges(problem, limit = 5) {
  if (!problem) return [];

  const textQuery = `${problem.title || ""} ${problem.description || ""}`;
  const currentProblemId = problem.problemId || problem.id;

  // Find recent challenges in same domain or district
  const candidates = await Problem.findAll({
    where: {
      id: { [Op.ne]: problem.id || 0 },
      [Op.or]: [
        { domain: problem.domain || "" },
        { district: problem.district || "" }
      ]
    },
    limit: 30,
    order: [["createdAt", "DESC"]]
  });

  const matches = [];

  for (const candidate of candidates) {
    if (candidate.problemId === currentProblemId) continue;

    const candText = `${candidate.title || ""} ${candidate.description || ""}`;
    const similarity = calculateSimilarity(
      textQuery,
      candText,
      problem.domain,
      candidate.domain,
      problem.district,
      candidate.district
    );

    // Only consider challenges with noticeable relationship (> 0.35)
    if (similarity >= 0.35) {
      let relationship = "Similar societal theme and nearby geography";
      if (similarity >= 0.70) {
        relationship = "High overlap: Likely the same local societal event or infrastructure issue reported by multiple citizens";
      } else if (similarity >= 0.50) {
        relationship = "Moderate overlap: Related challenge in the same district and domain";
      }

      // Count evidence
      let evidenceCount = 0;
      if (candidate.photo) evidenceCount++;
      if (candidate.video) evidenceCount++;

      matches.push({
        problemId: candidate.problemId,
        id: candidate.id,
        title: candidate.title,
        description: candidate.description,
        domain: candidate.domain,
        district: candidate.district,
        location: candidate.location,
        createdAt: candidate.createdAt,
        status: candidate.status,
        similarity: Math.round(similarity * 100),
        similarityDecimal: similarity,
        relationship,
        evidenceCount
      });
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, limit);
}

module.exports = {
  findRelatedChallenges,
  calculateSimilarity
};
