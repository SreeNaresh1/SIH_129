require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/database");

const User = require("./models/User");
const Problem = require("./models/Problem");
const University = require("./models/University");
const UniversityExpertise = require("./models/UniversityExpertise");
const Faculty = require("./models/Faculty");
const IndustryPartner = require("./models/IndustryPartner");
const GovernmentDepartment = require("./models/GovernmentDepartment");
const NGO = require("./models/NGO");

const { knowledgeBase } = require("./services/matchingEngine");
const { analyzeChallengeWithAI } = require("./services/aiService");
const { matchAllStakeholders } = require("./services/matchingEngine");

const DEMO_CHALLENGES = [
  {
    problemId: "CH-WATER-001",
    title: "Contaminated Drinking Water from Hand Pumps in Dumka",
    description: "Several villages near Dumka are facing severe drinking water contamination. Hand pumps in Ward 4 and surrounding tolas are discharging turbid, foul-smelling water with high iron and suspected fluoride levels. Multiple children and elderly residents have developed gastrointestinal illness. Urgent water quality testing and alternative supply needed.",
    domain: "Water Management",
    district: "Dumka",
    location: "Dumka Sadar Block, Ward 4 & Shikaripara Road",
    latitude: 24.2690,
    longitude: 87.2560,
    affectedPeople: 1450,
    severity: "Critical",
    status: "Under Review",
    photo: "demo_water_sample.jpg"
  },
  {
    problemId: "CH-WATER-002",
    title: "Hand Pump Discoloration and Arsenic Suspicions in Dumka",
    description: "Follow-up report from adjacent village hamlet near Dumka where two deep tubewells are also pumping discolored water causing skin irritation among farmers after washing.",
    domain: "Water Management",
    district: "Dumka",
    location: "Dumka Shikaripara Border Hamlets",
    latitude: 24.2750,
    longitude: 87.2610,
    affectedPeople: 400,
    severity: "High",
    status: "Under Review",
    photo: "demo_water_handpump.jpg"
  },
  {
    problemId: "CH-HEALTH-003",
    title: "Lack of Emergency Maternal Healthcare and Ambulance in Latehar",
    description: "Remote forest villages in Latehar district have no primary health worker or ambulance connectivity. The nearest PHC is 28 km away across unpaved forest paths. Expectant mothers are carried on cots during monsoon rains. Telemedicine diagnostic unit and all-weather medical transport are desperately required.",
    domain: "Healthcare",
    district: "Latehar",
    location: "Mahuadanr Block forest hamlets, Latehar",
    latitude: 23.7420,
    longitude: 84.5020,
    affectedPeople: 850,
    severity: "High",
    status: "Under Review",
    photo: "demo_health_center.jpg"
  },
  {
    problemId: "CH-AGRI-004",
    title: "Severe Irrigation Canal Breach and Drought in Palamu",
    description: "The minor lift irrigation canal supplying water to 180 smallholder farmers in Palamu has suffered severe structural breaches. Over 300 acres of paddy and pulses are drying up rapidly due to delayed monsoon rains. Farmers need solar-powered micro-lift irrigation and rapid canal lining to save standing crops.",
    domain: "Agriculture",
    district: "Palamu",
    location: "Chainpur Block, Palamu",
    latitude: 24.0410,
    longitude: 84.0720,
    affectedPeople: 1100,
    severity: "High",
    status: "Under Review",
    photo: "demo_agri_irrigation.jpg"
  },
  {
    problemId: "CH-EDU-005",
    title: "Dilapidated School Building and Digital Isolation in Khunti",
    description: "Government Middle School in Khunti has leaking asbestos roofs, no functional electricity, and lack of drinking water facilities. Students have zero digital learning access, and tribal dialect bilingual study materials are completely missing, causing high dropout rates after class 5.",
    domain: "Education",
    district: "Khunti",
    location: "Torpa Block, Khunti",
    latitude: 22.9730,
    longitude: 85.2790,
    affectedPeople: 320,
    severity: "Medium",
    status: "Under Review",
    photo: "demo_school_infra.jpg"
  },
  {
    problemId: "CH-SAN-006",
    title: "Open Dumpsite Waste Accumulation and Drainage Overflow in Dhanbad",
    description: "A peri-urban market settlement in Dhanbad has accumulated over 50 metric tons of unsegregated plastic and organic waste on the roadside. The open monsoon drains are blocked with plastic bags, causing foul water to enter residential homes and breeding disease-carrying mosquitoes.",
    domain: "Sanitation",
    district: "Dhanbad",
    location: "Govindpur Haat Area, Dhanbad",
    latitude: 23.8340,
    longitude: 86.5210,
    affectedPeople: 2200,
    severity: "High",
    status: "Under Review",
    photo: "demo_waste_dump.jpg"
  },
  {
    problemId: "CH-INFRA-007",
    title: "Collapsed Culvert Cutting Off 4 Tribal Villages in Simdega",
    description: "A concrete culvert over the seasonal hill stream collapsed during flash floods, completely severing road connectivity between 4 tribal villages and the main market road. School children and milk vendors must wade through dangerous knee-deep mud.",
    domain: "Infrastructure",
    district: "Simdega",
    location: "Kolebira Block, Simdega",
    latitude: 22.6140,
    longitude: 84.7310,
    affectedPeople: 1600,
    severity: "Critical",
    status: "Under Review",
    photo: "demo_bridge_road.jpg"
  },
  {
    problemId: "CH-ENV-008",
    title: "Industrial Slag Dust and Effluent Discharge in Bokaro River",
    description: "Heavy industrial dust emissions and untreated chemical slurry discharge from industrial processing units are coating surrounding agricultural soil and polluting the local stream. Residents complain of chronic respiratory irritation and stunted crop growth.",
    domain: "Environment",
    district: "Bokaro",
    location: "Chas-Bokaro Industrial Corridor",
    latitude: 23.6390,
    longitude: 86.1780,
    affectedPeople: 3400,
    severity: "High",
    status: "Under Review",
    photo: "demo_env_pollution.jpg"
  },
  {
    problemId: "CH-ACCESS-009",
    title: "Inaccessible District Government Complex for Persons with Disabilities",
    description: "The main block administrative complex in Ranchi has steep stairs without any accessibility ramps, narrow entrance doors that cannot fit wheelchairs, and zero tactile signage or braille notices for visually impaired citizens seeking disability certificates and pensions.",
    domain: "Accessibility",
    district: "Ranchi",
    location: "Kutchery Road Administrative Complex, Ranchi",
    latitude: 23.3680,
    longitude: 85.3250,
    affectedPeople: 450,
    severity: "Medium",
    status: "Under Review",
    photo: "demo_accessibility.jpg"
  }
];

async function seed() {
  try {
    console.log("==========================================");
    console.log("SEEDING JHARKHAND PLATFORM KNOWLEDGE BASE & DEMO SCENARIOS");
    console.log("==========================================");

    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    // 1. Create Default User Accounts
    console.log("\n1. Ensuring test user accounts...");
    const accounts = [
      { name: "Government Administrator", email: "government@sihportal.com", password: "Government@123", role: "government", organization: "Government of Jharkhand" },
      { name: "Citizen Reporter (Ramesh Soren)", email: "citizen@sihportal.com", password: "Citizen@123", role: "citizen", organization: "Santhal Pargana Gram Sabha" },
      { name: "University Innovation Lead", email: "university@sihportal.com", password: "University@123", role: "university", organization: "Prototype University A" },
      { name: "Industry CSR Lead", email: "industry@sihportal.com", password: "Industry@123", role: "industry", organization: "Prototype WaterTech CSR" }
    ];

    let citizenUser = null;
    let universityUser = null;

    for (const acc of accounts) {
      let user = await User.findOne({ where: { email: acc.email } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        user = await User.create({
          name: acc.name,
          email: acc.email,
          password: hashedPassword,
          role: acc.role,
          organization: acc.organization
        });
        console.log(`✓ Created ${acc.role} account: ${acc.email}`);
      } else {
        console.log(`✓ Verified existing ${acc.role} account: ${acc.email}`);
      }
      if (acc.role === "citizen") citizenUser = user;
      if (acc.role === "university") universityUser = user;
    }

    // 2. Seed Stakeholders into DB Tables
    console.log("\n2. Seeding prototype stakeholder profiles...");

    // Universities
    for (const u of knowledgeBase.universities) {
      const [univ] = await University.findOrCreate({
        where: { name: u.name },
        defaults: {
          name: u.name,
          code: u.code,
          city: u.location,
          district: u.district,
          state: "Jharkhand",
          description: `Prototype University profile covering ${u.domains.join(", ")}`,
          contactEmail: u.contactEmail,
          active: true
        }
      });

      // Expertise
      for (const d of u.domains) {
        await UniversityExpertise.findOrCreate({
          where: { universityId: univ.id, domain: d },
          defaults: {
            universityId: univ.id,
            domain: d,
            subDomain: u.departments[0] || "",
            expertiseLevel: 4,
            keywords: u.expertise.join(", ")
          }
        });
      }

      // Faculty coordinator
      await Faculty.findOrCreate({
        where: { universityId: univ.id, name: `Dr. Coordinator (${u.code})` },
        defaults: {
          universityId: univ.id,
          name: `Dr. Coordinator (${u.code})`,
          email: u.contactEmail,
          department: u.departments[0] || "Research",
          expertise: u.expertise.join(", "),
          available: true
        }
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.universities.length} universities with expertise and faculty.`);

    // Government Departments
    for (const g of knowledgeBase.governmentDepartments) {
      await GovernmentDepartment.findOrCreate({
        where: { name: g.name },
        defaults: {
          name: g.name,
          code: g.code,
          domain: g.domain,
          subDomains: g.subDomains.join(", "),
          jurisdiction: g.jurisdiction,
          district: g.district,
          keyResponsibilities: g.keyResponsibilities.join("; "),
          contactEmail: g.contactEmail,
          nodalOfficer: g.nodalOfficer,
          schemes: g.schemes,
          isPrototypeSampleData: true,
          active: true
        }
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.governmentDepartments.length} government departments.`);

    // Industry Partners
    for (const ind of knowledgeBase.industryPartners) {
      await IndustryPartner.findOrCreate({
        where: { organization: ind.organization },
        defaults: {
          userId: universityUser?.id || 1,
          organization: ind.organization,
          sector: ind.sector,
          expertise: ind.expertise.join(", "),
          csrBudget: ind.csrBudget,
          contactEmail: ind.contactEmail,
          active: true
        }
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.industryPartners.length} industry/CSR partners.`);

    // NGOs
    for (const ngo of knowledgeBase.ngos) {
      await NGO.findOrCreate({
        where: { name: ngo.name },
        defaults: {
          name: ngo.name,
          domain: ngo.domain,
          focusAreas: ngo.focusAreas.join(", "),
          location: ngo.location,
          districts: ngo.districts,
          expertise: ngo.expertise.join(", "),
          fieldReach: ngo.fieldReach,
          contactEmail: ngo.contactEmail,
          keyProjects: ngo.keyProjects.join("; "),
          isPrototypeSampleData: true,
          active: true
        }
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.ngos.length} NGO partners.`);

    // 3. Seed Demo Societal Challenges with AI Analysis
    console.log("\n3. Seeding the 8+ Societal Challenge scenarios with AI analysis...");

    for (const ch of DEMO_CHALLENGES) {
      let existing = await Problem.findOne({ where: { problemId: ch.problemId } });
      if (!existing) {
        console.log(`Analyzing and creating: ${ch.problemId} - ${ch.title}`);
        const aiAnalysis = await analyzeChallengeWithAI({
          title: ch.title,
          description: ch.description,
          domain: ch.domain,
          severity: ch.severity,
          affectedPeople: ch.affectedPeople
        });

        const sectorList = Array.isArray(aiAnalysis.sector)
          ? aiAnalysis.sector
          : (typeof aiAnalysis.sector === "string" ? aiAnalysis.sector.split(",").map(s => s.trim()) : ["Government", "University"]);

        const expertiseList = Array.isArray(aiAnalysis.required_expertise)
          ? aiAnalysis.required_expertise
          : [];

        const techList = Array.isArray(aiAnalysis.required_technology)
          ? aiAnalysis.required_technology
          : [];

        const keywordsList = Array.isArray(aiAnalysis.keywords)
          ? aiAnalysis.keywords
          : [];

        const evidenceReqList = Array.isArray(aiAnalysis.evidence_requirements)
          ? aiAnalysis.evidence_requirements
          : [];

        const problem = await Problem.create({
          problemId: ch.problemId,
          citizenId: citizenUser?.id || 1,
          title: ch.title,
          description: ch.description,
          domain: ch.domain,
          district: ch.district,
          location: ch.location,
          latitude: ch.latitude,
          longitude: ch.longitude,
          affectedPeople: ch.affectedPeople,
          severity: ch.severity,
          status: ch.status,
          projectStatus: "AI Analysis Complete",
          photo: ch.photo,
          video: "",

          // AI Fields
          aiDomain: aiAnalysis.domain || ch.domain,
          aiSubDomain: aiAnalysis.sub_domain || "",
          aiSector: sectorList.join(", "),
          aiSeverity: String(aiAnalysis.severity_score || 7),
          aiSeverityScore: aiAnalysis.severity_score || 7,
          aiSeverityReason: aiAnalysis.severity_reason || "Assessed based on population affected and public urgency.",
          aiAffectedPopulation: aiAnalysis.affected_population || `${ch.affectedPeople} residents`,
          aiRequiredExpertise: JSON.stringify(expertiseList),
          aiRequiredTechnology: JSON.stringify(techList),
          aiRecommendedAction: aiAnalysis.recommended_action || "On-site multi-stakeholder assessment",
          aiKeywords: JSON.stringify(keywordsList),
          aiEvidenceRequirements: JSON.stringify(evidenceReqList),
          aiReasoning: `Classified under ${aiAnalysis.domain} (${aiAnalysis.sub_domain}) because citizen report details severe community impact in ${ch.district} requiring coordinated response across ${sectorList.join(', ')}.`,
          aiConfidence: 0.94,
          aiProvider: aiAnalysis.aiProvider || "deterministic_fallback",
          aiModel: aiAnalysis.aiModel || "deterministic_heuristic_engine",

          priorityScore: (aiAnalysis.severity_score || 7) * 9.5,
          priorityLevel: (aiAnalysis.severity_score || 7) >= 8 ? "Critical" : (aiAnalysis.severity_score || 7) >= 6 ? "High" : "Medium",
          priorityBreakdown: JSON.stringify({
            severityBase: (aiAnalysis.severity_score || 7) * 5,
            affectedPopulationScore: Math.min(25, (ch.affectedPeople || 0) / 50),
            confidenceBoost: 14.1
          }),
          aiProcessedAt: new Date(),
          isPrototypeSampleData: true
        });

        // If it's the second water challenge, link as duplicate/related to first
        if (ch.problemId === "CH-WATER-002") {
          await problem.update({
            duplicateOf: "CH-WATER-001",
            duplicateSimilarity: 0.7420
          });
        }
      } else {
        console.log(`✓ Existing challenge verified: ${ch.problemId}`);
      }
    }

    console.log("\n==========================================");
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
