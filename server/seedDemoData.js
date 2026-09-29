require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sequelize } = require("./config/database");

const User = require("./models/User");
const Problem = require("./models/Problem");
const University = require("./models/University");
const UniversityExpertise = require("./models/UniversityExpertise");
const Faculty = require("./models/Faculty");
const IndustryPartner = require("./models/IndustryPartner");
const GovernmentDepartment = require("./models/GovernmentDepartment");
const NGO = require("./models/NGO");

// Interoperability Models (PS 26129)
const PortalConnector = require("./models/PortalConnector");
const ConsentRecord = require("./models/ConsentRecord");
const DataExchangeLog = require("./models/DataExchangeLog");
const WorkflowPipeline = require("./models/WorkflowPipeline");

const { knowledgeBase } = require("./services/matchingEngine");
const { analyzeChallengeWithAI } = require("./services/aiService");

function calculateSha256(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

const DEMO_CHALLENGES = [
  {
    problemId: "MH-FED-2026-SKILL-001",
    trackingId: "MH-2026-APP-8841",
    title: "Apprenticeship Incentive & ITI Verification Discrepancy (Pune)",
    description: "Citizen registered on MahaSwayam portal for state apprentice stipend, but application stalled due to schema format mismatch with MahaDBT scholarship database and DigiLocker caste validation. Automated cross-agency data reconciliation required without forcing citizen to re-upload documents at multiple physical offices.",
    domain: "Digital Governance",
    district: "Pune",
    location: "Hadapsar Industrial Area, Pune",
    latitude: 18.5089,
    longitude: 73.9260,
    affectedPeople: 480,
    severity: "High",
    status: "Under Review",
    serviceType: "Apprenticeship Incentive & Skill Verification",
    primaryDepartment: "Department of Skills, Employment & Entrepreneurship (MahaSwayam)",
    targetDepartments: JSON.stringify(["MahaSwayam", "MahaDBT", "Treasury"]),
    connectorSource: "MahaSetu Single Window Gateway",
    consentStatus: "GRANTED",
    dataQualityScore: 98,
    photo: "demo_skill_apprenticeship.jpg"
  },
  {
    problemId: "MH-FED-2026-WATER-002",
    trackingId: "MH-2026-WTR-1042",
    title: "Rural Drinking Water Pipeline Rupture & Contamination in Nashik",
    description: "Main feeder pipeline under Jal Jeevan Mission suffered severe physical fracture in Dindori block. Groundwater turbidity and iron concentrations exceed permissible limits, impacting 1,800 villagers. Inter-departmental coordination between Water Supply Dept, Zilla Parishad, and Public Health is required for emergency tanker deployment and water filtration telemetry.",
    domain: "Water Management",
    district: "Nashik",
    location: "Dindori Taluka Rural Hamlets, Nashik",
    latitude: 20.2010,
    longitude: 73.8340,
    affectedPeople: 1800,
    severity: "Critical",
    status: "Under Review",
    serviceType: "Infrastructure & Public Health Grievance",
    primaryDepartment: "Water Supply and Sanitation Department, GoM",
    targetDepartments: JSON.stringify(["WSSD", "Public Health", "Zilla Parishad"]),
    connectorSource: "Aaple Sarkar Grievance Connector",
    consentStatus: "NOT_REQUIRED",
    dataQualityScore: 99,
    photo: "demo_water_sample.jpg"
  },
  {
    problemId: "MH-FED-2026-HEALTH-003",
    trackingId: "MH-2026-HLT-3921",
    title: "Remote Tribal Primary Healthcare Center Telemedicine Deficit in Gadchiroli",
    description: "Four isolated tribal gram panchayats in Bhamragad block lack all-weather emergency medical transport and real-time medical consultation with district civil hospitals. Expectant mothers and malaria patients face critical transit delays. Coordinated drone-assisted diagnostic delivery and satellite telehealth connection urgently required.",
    domain: "Healthcare",
    district: "Gadchiroli",
    location: "Bhamragad Forest Block, Gadchiroli",
    latitude: 19.1670,
    longitude: 80.3500,
    affectedPeople: 1250,
    severity: "Critical",
    status: "Under Review",
    serviceType: "Tribal Health & Emergency Service Delivery",
    primaryDepartment: "Public Health Department, GoM",
    targetDepartments: JSON.stringify(["Public Health", "Tribal Development", "MSInS"]),
    connectorSource: "MahaSetu Telehealth Bridge",
    consentStatus: "GRANTED",
    dataQualityScore: 95,
    photo: "demo_health_center.jpg"
  },
  {
    problemId: "MH-FED-2026-AGRI-004",
    trackingId: "MH-2026-AGR-4019",
    title: "Marathwada Micro-Irrigation Deficit & Solar Feeder Subsidy Alignment",
    description: "160 smallholder farmers in Chhatrapati Sambhajinagar face acute dry-season crop failure. Farmers have applied for solar agricultural pump subsidies on MSEDCL portal, while their drip irrigation subsidy is lodged on MahaDBT. Unsynchronized eligibility databases have halted subsidy release.",
    domain: "Agriculture",
    district: "Chhatrapati Sambhajinagar",
    location: "Paithan Taluka agricultural belt",
    latitude: 19.4800,
    longitude: 75.3800,
    affectedPeople: 950,
    severity: "High",
    status: "Under Review",
    serviceType: "Agriculture Subsidy Cross-Verification",
    primaryDepartment: "Agriculture Department, GoM",
    targetDepartments: JSON.stringify(["Agriculture", "Energy (MSEDCL)", "MahaDBT"]),
    connectorSource: "MahaDBT Agriculture Connector",
    consentStatus: "GRANTED",
    dataQualityScore: 96,
    photo: "demo_agri_irrigation.jpg"
  },
  {
    problemId: "MH-FED-2026-EDU-005",
    trackingId: "MH-2026-EDU-5512",
    title: "Zilla Parishad Tribal Bilingual Digital Classroom Infrastructure in Nandurbar",
    description: "Five primary schools in Dhadgaon block have zero functional digital connectivity and lack Bhili-Marathi bilingual study modules. High dropout rates documented after grade 4. Multi-stakeholder intervention needed to install solar-powered micro-servers and bilingual interactive modules.",
    domain: "Education",
    district: "Nandurbar",
    location: "Dhadgaon Block, Nandurbar",
    latitude: 21.6500,
    longitude: 74.3100,
    affectedPeople: 540,
    severity: "Medium",
    status: "Under Review",
    serviceType: "Education & Digital Equity Project",
    primaryDepartment: "School Education and Sports Department, GoM",
    targetDepartments: JSON.stringify(["School Education", "Tribal Development", "MSInS"]),
    connectorSource: "MahaSetu Unified Citizen Gateway",
    consentStatus: "NOT_REQUIRED",
    dataQualityScore: 94,
    photo: "demo_school_infra.jpg"
  },
  {
    problemId: "MH-FED-2026-SAN-006",
    trackingId: "MH-2026-SAN-6821",
    title: "Industrial Solid Waste & Slag Accumulation in Butibori MIDC (Nagpur)",
    description: "Over 60 metric tons of untreated chemical slag and composite industrial waste dumped on peri-urban drainage channels near Butibori MIDC. Monsoon drain clogging causing toxic water run-off into agricultural canals. Joint enforcement needed across MIDC, MPCB, and District Collectorate.",
    domain: "Sanitation",
    district: "Nagpur",
    location: "MIDC Industrial Estate Butibori, Nagpur",
    latitude: 20.9320,
    longitude: 78.9950,
    affectedPeople: 3100,
    severity: "High",
    status: "Under Review",
    serviceType: "Industrial Pollution & Municipal Enforcement",
    primaryDepartment: "Maharashtra Pollution Control Board (MPCB)",
    targetDepartments: JSON.stringify(["MPCB", "MIDC", "Urban Development"]),
    connectorSource: "Aaple Sarkar RTS Gateway",
    consentStatus: "NOT_REQUIRED",
    dataQualityScore: 97,
    photo: "demo_waste_dump.jpg"
  },
  {
    problemId: "MH-FED-2026-INFRA-007",
    trackingId: "MH-2026-INF-7734",
    title: "Collapsed Coastal Creek Culvert Isolating Fisherfolk Hamlets in Raigad",
    description: "A major reinforced concrete culvert over tidal creek collapsed in Alibaug-Murud coastal road, disconnecting 3 fishing villages from fish cold-storage depots and schools. Public Works Department and Fisheries Department require coordinated immediate Bailey bridge deployment.",
    domain: "Infrastructure",
    district: "Raigad",
    location: "Murud Coastal Belt, Raigad",
    latitude: 18.3000,
    longitude: 72.9600,
    affectedPeople: 2100,
    severity: "Critical",
    status: "Under Review",
    serviceType: "Public Infrastructure Restoration",
    primaryDepartment: "Public Works Department (PWD), GoM",
    targetDepartments: JSON.stringify(["PWD", "Fisheries Department", "District Disaster Management"]),
    connectorSource: "MahaSetu Unified Citizen Gateway",
    consentStatus: "NOT_REQUIRED",
    dataQualityScore: 99,
    photo: "demo_bridge_road.jpg"
  },
  {
    problemId: "MH-FED-2026-SKILL-008",
    trackingId: "MH-2026-DUP-8849",
    title: "Apprenticeship Incentive Duplicate Claim Detected in Hadapsar (Pune)",
    description: "Duplicate submission of apprenticeship verification for ITI Electrician subsidy in Hadapsar, Pune. Submitted under secondary phone number with identical Aadhaar hash and institute credentials as application MH-2026-APP-8841.",
    domain: "Digital Governance",
    district: "Pune",
    location: "Hadapsar Industrial Zone, Pune",
    latitude: 18.5095,
    longitude: 73.9268,
    affectedPeople: 480,
    severity: "High",
    status: "Under Review",
    serviceType: "Apprenticeship Incentive & Skill Verification",
    primaryDepartment: "Department of Skills, Employment & Entrepreneurship (MahaSwayam)",
    targetDepartments: JSON.stringify(["MahaSwayam", "MahaDBT"]),
    connectorSource: "MahaSwayam Direct API Connector",
    consentStatus: "GRANTED",
    dataQualityScore: 91,
    photo: "demo_skill_apprenticeship.jpg"
  }
];

async function seed() {
  try {
    console.log("===============================================================");
    console.log("SEEDING MAHASETU (MUIF) INTEROPERABILITY PLATFORM KNOWLEDGE BASE");
    console.log("SIH PROBLEM STATEMENT ID: 26129 - GOVERNMENT OF MAHARASHTRA");
    console.log("===============================================================");

    await sequelize.authenticate();
    await PortalConnector.sync();
    await ConsentRecord.sync();
    await DataExchangeLog.sync();
    await WorkflowPipeline.sync();

    // Safely ensure new columns exist in problems table
    try {
      const qi = sequelize.getQueryInterface();
      const tableInfo = await qi.describeTable("problems");
      const columnsToAdd = [
        { name: "trackingId", type: "VARCHAR(50)" },
        { name: "serviceType", type: "VARCHAR(100) DEFAULT 'Public Grievance Redressal'" },
        { name: "primaryDepartment", type: "VARCHAR(150) DEFAULT 'Department of Skills, Employment & Entrepreneurship'" },
        { name: "targetDepartments", type: "TEXT DEFAULT '[]'" },
        { name: "connectorSource", type: "VARCHAR(100) DEFAULT 'MahaSetu Unified Citizen Gateway'" },
        { name: "consentToken", type: "VARCHAR(128)" },
        { name: "consentStatus", type: "VARCHAR(40) DEFAULT 'GRANTED'" },
        { name: "dataQualityScore", type: "INTEGER DEFAULT 96" },
        { name: "dataQualityIssues", type: "TEXT DEFAULT '[]'" },
        { name: "crossDeptStatus", type: "TEXT" },
        { name: "federatedSyncTime", type: "DATETIME" }
      ];
      for (const col of columnsToAdd) {
        if (!tableInfo[col.name]) {
          try {
            await sequelize.query(`ALTER TABLE problems ADD COLUMN ${col.name} ${col.type};`);
            console.log(`✓ Added column ${col.name} to problems table.`);
          } catch (colErr) {
            // Already exists or ignore
          }
        }
      }
    } catch (migErr) {
      console.log("Migration check note:", migErr.message);
    }
    await sequelize.sync();

    // 1. Create Default User Accounts
    console.log("\n1. Ensuring test user accounts (Government of Maharashtra)...");
    const accounts = [
      {
        name: "State Interoperability Administrator (MSInS)",
        email: "government@sihportal.com",
        password: "Government@123",
        role: "government",
        organization: "Maharashtra State Innovation Society (MSInS), Dept of Skills & Employment"
      },
      {
        name: "Citizen Applicant (Aniket Patil)",
        email: "citizen@sihportal.com",
        password: "Citizen@123",
        role: "citizen",
        organization: "MahaSetu Single Window Resident Portal"
      },
      {
        name: "COEP Technological University Lead",
        email: "university@sihportal.com",
        password: "University@123",
        role: "university",
        organization: "COEP Technological University, Pune"
      },
      {
        name: "Tata Motors / Forbes Marshall CSR",
        email: "industry@sihportal.com",
        password: "Industry@123",
        role: "industry",
        organization: "Tata Motors & Forbes Marshall CSR Consortium"
      }
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
        await user.update({ name: acc.name, organization: acc.organization });
        console.log(`✓ Verified and updated ${acc.role} account: ${acc.email}`);
      }
      if (acc.role === "citizen") citizenUser = user;
      if (acc.role === "university") universityUser = user;
    }

    // 2. Seed Portal Connectors (Core PS 26129 Middleware Architecture)
    console.log("\n2. Seeding Portal Connectors (Legacy & Modern Government Systems)...");
    const CONNECTORS = [
      {
        connectorId: "CONN-MAHASWAYAM",
        name: "MahaSwayam Skill & Employment Exchange",
        department: "Department of Skills, Employment, Entrepreneurship & Innovation",
        systemType: "Modern State Portal",
        protocol: "REST / JSON",
        authMethod: "OAuth 2.0 (Mutual TLS)",
        endpointUrl: "https://mahaswayam.gov.in/api/v2/integration",
        status: "HEALTHY",
        healthLatencyMs: 28,
        uptimePercentage: 99.98,
        standardSchema: "IndEA v2.0 (Skill Taxonomy)",
        schemaMapping: JSON.stringify({ applicant: "beneficiary", skillTrade: "qualification.trade", status: "workflowState" }),
        adapterType: "Bi-directional REST Adapter",
        activeRecordsCount: 24810,
        dataQualityScore: 99,
        contactOfficer: "Director DVET (MahaSwayam Cell)",
        contactEmail: "dvet-nodal@mahaswayam.gov.in"
      },
      {
        connectorId: "CONN-MAHADBT",
        name: "MahaDBT Direct Benefit Transfer & Scholarship Registry",
        department: "Social Justice and Special Assistance Department",
        systemType: "Legacy Enterprise Registry",
        protocol: "SOAP/XML with JSON Wrapper",
        authMethod: "e-Pramaan / HMAC-SHA256",
        endpointUrl: "https://mahadbt.maharashtra.gov.in/ws/benefitRegistry.asmx",
        status: "HEALTHY",
        healthLatencyMs: 42,
        uptimePercentage: 99.92,
        standardSchema: "IndEA v2.0 (DBT Standard)",
        schemaMapping: JSON.stringify({ SchemeCode: "schemeId", BeneficiaryUID: "aadhaarTokenHash", SanctionAmount: "disbursementAmount" }),
        adapterType: "XML-to-JSON-LD Transformer",
        activeRecordsCount: 51200,
        dataQualityScore: 98,
        contactOfficer: "Director DBT (Social Justice)",
        contactEmail: "helpdesk@mahadbt.gov.in"
      },
      {
        connectorId: "CONN-AAPLE-SARKAR",
        name: "Aaple Sarkar Citizen Services & RTS Grievance Gateway",
        department: "Revenue and Forest Department / Right to Services",
        systemType: "State Citizen Portal",
        protocol: "REST & Event Webhooks",
        authMethod: "OAuth 2.0 / API Key",
        endpointUrl: "https://aaplesarkar.mahaonline.gov.in/api/v1/rts",
        status: "HEALTHY",
        healthLatencyMs: 31,
        uptimePercentage: 99.96,
        standardSchema: "OpenData RTS Standard",
        schemaMapping: JSON.stringify({ applicationNumber: "trackingId", serviceCode: "serviceType", complianceDays: "slaDays" }),
        adapterType: "Event-Driven Webhook Broker",
        activeRecordsCount: 18450,
        dataQualityScore: 97,
        contactOfficer: "State RTS Commissioner",
        contactEmail: "support@aaplesarkar.mahaonline.gov.in"
      },
      {
        connectorId: "CONN-DIGILOCKER",
        name: "DigiLocker & State Resident Data Hub (MSRDH)",
        department: "National Informatics Centre (NIC) / MahaOnline",
        systemType: "Central Identity & Document Vault",
        protocol: "OAuth 2.0 / OpenID Connect",
        authMethod: "DEPA 2.0 / Digital Signatures",
        endpointUrl: "https://digilocker.gov.in/public/oauth2/1/token",
        status: "HEALTHY",
        healthLatencyMs: 22,
        uptimePercentage: 99.99,
        standardSchema: "W3C Verifiable Credentials",
        schemaMapping: JSON.stringify({ docType: "credentialType", issuer: "issuingAuthority", docId: "certificateNo" }),
        adapterType: "Consent-Gated Document Vault",
        activeRecordsCount: 89300,
        dataQualityScore: 100,
        contactOfficer: "Resident Data Vault Manager",
        contactEmail: "locker@digilocker.gov.in"
      },
      {
        connectorId: "CONN-DHE",
        name: "Directorate of Higher & Technical Education (DHE)",
        department: "Higher and Technical Education Department",
        systemType: "University & College Registry",
        protocol: "REST / JSON",
        authMethod: "API Key / JWT",
        endpointUrl: "https://dhepune.gov.in/api/v1/institutions",
        status: "HEALTHY",
        healthLatencyMs: 38,
        uptimePercentage: 99.89,
        standardSchema: "IndEA v2.0 (Higher Ed)",
        schemaMapping: JSON.stringify({ collegeCode: "institutionId", prnNumber: "studentPrn", courseId: "discipline" }),
        adapterType: "Bi-directional REST Adapter",
        activeRecordsCount: 12400,
        dataQualityScore: 96,
        contactOfficer: "DHE IT Coordinator",
        contactEmail: "it@dhepune.gov.in"
      },
      {
        connectorId: "CONN-MAHARERA",
        name: "MahaRERA & Mahabhumi Property and Address Verification",
        department: "Revenue and Housing Department",
        systemType: "Geospatial Land Registry",
        protocol: "REST & WFS (OGC GeoJSON)",
        authMethod: "Mutual TLS",
        endpointUrl: "https://mahabhumi.gov.in/api/gis/v1/verifyAddress",
        status: "HEALTHY",
        healthLatencyMs: 46,
        uptimePercentage: 99.91,
        standardSchema: "GeoJSON / OGC Standard",
        schemaMapping: JSON.stringify({ surveyNo: "cadastralId", districtCode: "district", villageCode: "village" }),
        adapterType: "GIS Spatial Connector",
        activeRecordsCount: 31000,
        dataQualityScore: 98,
        contactOfficer: "State Remote Sensing Application Center",
        contactEmail: "gis@mahabhumi.gov.in"
      }
    ];

    for (const conn of CONNECTORS) {
      const [record] = await PortalConnector.findOrCreate({
        where: { connectorId: conn.connectorId },
        defaults: conn
      });
      await record.update(conn);
    }
    console.log(`✓ Seeded & updated ${CONNECTORS.length} legacy & modern portal connectors.`);

    // 3. Seed Configurable Workflow Pipelines (PS 26129)
    console.log("\n3. Seeding Configurable Inter-Agency Workflow Pipelines...");
    const PIPELINES = [
      {
        pipelineId: "PIPE-SKILL-SUBSIDY",
        name: "Unified Apprenticeship Incentive & Skill Voucher Orchestration",
        serviceCategory: "Skill Development & Direct Benefit",
        participatingPortals: JSON.stringify(["MahaSwayam", "MahaDBT", "Integrated Treasury", "DigiLocker"]),
        stepsConfiguration: JSON.stringify([
          { order: 1, portal: "MahaSwayam", task: "Intake & Qualification Scoring", autoPass: true, slaHours: 2 },
          { order: 2, portal: "DigiLocker", task: "Consent-based Verification of Domicile & Caste", autoPass: true, slaHours: 1 },
          { order: 3, portal: "MahaDBT", task: "Eligibility Sanction & Budget Reservation", autoPass: true, slaHours: 4 },
          { order: 4, portal: "Integrated Treasury", task: "DBT Payment Batch Dispatch", autoPass: false, slaHours: 8 }
        ]),
        activeInstancesCount: 342,
        avgCompletionHours: 3.8,
        slaTargetHours: 24,
        slaComplianceRate: 98.4,
        status: "ACTIVE",
        triggerEventType: "ON_APPLICATION_SUBMITTED"
      },
      {
        pipelineId: "PIPE-CROSS-GRIEVANCE",
        name: "Cross-Departmental Public Service & Infrastructure Grievance Routing",
        serviceCategory: "Public Grievance Redressal",
        participatingPortals: JSON.stringify(["Aaple Sarkar", "PWD", "Water Supply", "MSInS"]),
        stepsConfiguration: JSON.stringify([
          { order: 1, portal: "Aaple Sarkar", task: "AI Triage, Severity Classification & Deduplication", autoPass: true, slaHours: 0.5 },
          { order: 2, portal: "District Nodal", task: "Jurisdiction Dispatch & Verification", autoPass: false, slaHours: 12 },
          { order: 3, portal: "Line Department", task: "Field Work Order & Budget Allotment", autoPass: false, slaHours: 24 },
          { order: 4, portal: "MSInS Innovation", task: "R&D Prototype Escalation (if unresolved)", autoPass: true, slaHours: 48 }
        ]),
        activeInstancesCount: 189,
        avgCompletionHours: 14.2,
        slaTargetHours: 48,
        slaComplianceRate: 96.1,
        status: "ACTIVE",
        triggerEventType: "ON_GRIEVANCE_FILED"
      }
    ];

    for (const pipe of PIPELINES) {
      const [p] = await WorkflowPipeline.findOrCreate({
        where: { pipelineId: pipe.pipelineId },
        defaults: pipe
      });
      await p.update(pipe);
    }
    console.log(`✓ Seeded ${PIPELINES.length} workflow orchestration pipelines.`);

    // 4. Seed Live Data Exchange & Audit Logs (PS 26129)
    console.log("\n4. Seeding Data Exchange Logs with XML-to-JSON Transformations & SHA-256 Hashes...");
    const samplePayload1 = {
      "@context": "https://standards.gov.in/indea/v2.0/context.jsonld",
      "@type": "GovernmentInteroperabilityExchange",
      "transactionId": "TX-MH-2026-0928-8812",
      "sourceAuthority": "MahaSwayam (Skills)",
      "destinationAuthority": "MahaDBT (Scholarships)",
      "beneficiary": {
        "fullName": "Aniket Suresh Patil",
        "district": "Pune",
        "state": "Maharashtra",
        "aadhaarTokenHash": calculateSha256("AADHAAR-ANIKET-PATIL-PUNE"),
        "qualification": "ITI Machinist (Level 4 Certified)",
        "verificationStatus": "AUTHENTICATED_BY_SOURCE"
      }
    };

    const sampleHash1 = calculateSha256(JSON.stringify(samplePayload1));

    const LOGS = [
      {
        transactionId: "TX-MH-2026-0928-8812",
        sourceConnectorId: "CONN-MAHASWAYAM",
        targetConnectorId: "CONN-MAHADBT",
        sourcePortal: "MahaSwayam (Skills)",
        targetPortal: "MahaDBT (Benefits)",
        endpoint: "/api/v2/federated-exchange/conn-mahaswayam",
        method: "POST",
        payloadSourceFormat: "XML/SOAP",
        payloadTargetFormat: "IndEA JSON-LD",
        payloadSummary: "Exchanged verified beneficiary credential for Aniket Patil (Pune)",
        transformedPayload: JSON.stringify(samplePayload1, null, 2),
        status: "SUCCESS",
        statusCode: 200,
        latencyMs: 28,
        dataQualityScore: 99,
        dataQualityWarnings: "[]",
        sha256VerificationHash: sampleHash1
      },
      {
        transactionId: "TX-MH-2026-0928-8813",
        sourceConnectorId: "CONN-DIGILOCKER",
        targetConnectorId: "CONN-MAHASWAYAM",
        sourcePortal: "DigiLocker Vault",
        targetPortal: "MahaSwayam (Skills)",
        endpoint: "/api/v2/consent/fetch-credentials",
        method: "POST",
        payloadSourceFormat: "JSON",
        payloadTargetFormat: "IndEA JSON-LD",
        payloadSummary: "Fetched verified Caste & Domicile certificate via DEPA consent token",
        transformedPayload: JSON.stringify({ verifiedDoc: "CC-MH-2023-884129", issuer: "SDO Pune", status: "VALID" }),
        status: "SUCCESS",
        statusCode: 200,
        latencyMs: 19,
        dataQualityScore: 100,
        dataQualityWarnings: "[]",
        sha256VerificationHash: calculateSha256("DIGILOCKER-CREDENTIAL-PUNE")
      },
      {
        transactionId: "TX-MH-2026-0928-8814",
        sourceConnectorId: "CONN-AAPLE-SARKAR",
        targetConnectorId: "CONN-WSSD",
        sourcePortal: "Aaple Sarkar RTS",
        targetPortal: "Water Supply Dept (WSSD)",
        endpoint: "/api/v1/grievance/cross-dispatch",
        method: "POST",
        payloadSourceFormat: "XML/SOAP",
        payloadTargetFormat: "IndEA JSON-LD",
        payloadSummary: "Schema reconciliation: Legacy date '28/09/2026' translated to ISO '2026-09-28T00:00:00Z'",
        transformedPayload: JSON.stringify({ incident: "Pipeline Fracture", district: "Nashik", status: "DISPATCHED" }),
        status: "RECONCILED",
        statusCode: 200,
        latencyMs: 34,
        dataQualityScore: 98,
        dataQualityWarnings: JSON.stringify(["Warning: Legacy date format dd/mm/yyyy converted to ISO-8601 automatically"]),
        exceptionType: "SCHEMA_RECONCILIATION",
        exceptionMessage: "Legacy date format automatically adapted by IndEA schema translator",
        resolutionAction: "AUTO_TRANSFORMED_AND_LOGGED",
        sha256VerificationHash: calculateSha256("AAPLE-SARKAR-WSSD-NASHIK")
      }
    ];

    for (const l of LOGS) {
      await DataExchangeLog.findOrCreate({
        where: { transactionId: l.transactionId },
        defaults: l
      });
    }
    console.log(`✓ Seeded ${LOGS.length} inter-agency transaction audit logs.`);

    // 5. Seed Consent Records (DEPA Standard)
    console.log("\n5. Seeding Citizen Consent Records (DEPA 2.0)...");
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);

    await ConsentRecord.findOrCreate({
      where: { consentId: "CNSNT-MH-2026-001" },
      defaults: {
        consentId: "CNSNT-MH-2026-001",
        citizenId: citizenUser?.id || 1,
        citizenName: "Aniket Suresh Patil",
        aadhaarMasked: "XXXX-XXXX-8921",
        sourceDepartment: "MahaDBT / UIDAI Vault",
        targetDepartment: "Maharashtra State Innovation Society (MSInS)",
        purpose: "One-Click Scheme Enrollment & Apprenticeship Direct Stipend Verification",
        sharedAttributes: JSON.stringify(["fullName", "casteCertificateNo", "annualIncome", "district", "educationalCredentials"]),
        status: "ACTIVE",
        expiresAt: expDate,
        consentArtifactHash: calculateSha256("CONSENT-ANIKET-PATIL-MSINS-MAHADBT"),
        depaFrameworkVersion: "DEPA 2.0 / DigiLocker Standard"
      }
    });
    console.log(`✓ Seeded active citizen consent record.`);

    // 6. Seed Stakeholders (Universities, Govt, Industry, NGOs) from Maharashtra Knowledge Base
    console.log("\n6. Seeding Maharashtra stakeholder capability profiles...");

    // Universities
    for (const u of knowledgeBase.universities) {
      const [univ] = await University.findOrCreate({
        where: { name: u.name },
        defaults: {
          name: u.name,
          code: u.code,
          city: u.location,
          district: u.district,
          state: "Maharashtra",
          description: `Maharashtra Technical University Innovation Cell covering ${u.domains.join(", ")}`,
          contactEmail: u.contactEmail,
          active: true
        }
      });
      await univ.update({
        city: u.location,
        district: u.district,
        state: "Maharashtra"
      });

      // Expertise
      for (const d of u.domains) {
        await UniversityExpertise.findOrCreate({
          where: { universityId: univ.id, domain: d },
          defaults: {
            universityId: univ.id,
            domain: d,
            subDomain: u.departments[0] || "",
            expertiseLevel: 5,
            keywords: u.expertise.join(", ")
          }
        });
      }

      // Faculty coordinator
      await Faculty.findOrCreate({
        where: { universityId: univ.id, name: `Prof. Innovation Coordinator (${u.code})` },
        defaults: {
          universityId: univ.id,
          name: `Prof. Innovation Coordinator (${u.code})`,
          email: u.contactEmail,
          department: u.departments[0] || "Computer Engineering",
          expertise: u.expertise.join(", "),
          available: true
        }
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.universities.length} Maharashtra universities & research centers.`);

    // Government Departments
    for (const g of knowledgeBase.governmentDepartments) {
      const [dept] = await GovernmentDepartment.findOrCreate({
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
      await dept.update({
        district: g.district,
        nodalOfficer: g.nodalOfficer,
        schemes: g.schemes
      });
    }
    console.log(`✓ Seeded ${knowledgeBase.governmentDepartments.length} Maharashtra government departments.`);

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
    console.log(`✓ Seeded ${knowledgeBase.industryPartners.length} corporate CSR partners.`);

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

    // 7. Seed Demo Cross-Department Applications with AI Analysis & Interoperability Attributes
    console.log("\n7. Seeding Maharashtra Cross-Department Applications with AI Analysis & Deduplication...");

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

        const expertiseList = Array.isArray(aiAnalysis.required_expertise) ? aiAnalysis.required_expertise : [];
        const techList = Array.isArray(aiAnalysis.required_technology) ? aiAnalysis.required_technology : [];
        const keywordsList = Array.isArray(aiAnalysis.keywords) ? aiAnalysis.keywords : [];
        const evidenceReqList = Array.isArray(aiAnalysis.evidence_requirements) ? aiAnalysis.evidence_requirements : [];

        const multiDeptTimeline = [
          {
            portal: "MahaSetu Single Window Gateway",
            action: "Application Received & Federated Identifier Assigned",
            timestamp: new Date().toISOString(),
            status: "COMPLETED",
            proofHash: calculateSha256(`${ch.problemId}-SUBMITTED`)
          },
          {
            portal: ch.primaryDepartment.split("(")[0].trim(),
            action: "Jurisdictional Nodal Officer Notification Dispatched",
            timestamp: new Date().toISOString(),
            status: "COMPLETED",
            proofHash: calculateSha256(`${ch.problemId}-DISPATCHED`)
          },
          {
            portal: "Interoperability Middleware Hub",
            action: "Schema Conformance Checked (IndEA v2.0 - 99% Score)",
            timestamp: new Date().toISOString(),
            status: "COMPLETED"
          },
          {
            portal: "Cross-Agency Resolution / MSInS Innovation Bridge",
            action: "Synchronized Service Delivery in Progress",
            timestamp: new Date().toISOString(),
            status: "IN_PROGRESS"
          }
        ];

        const problem = await Problem.create({
          problemId: ch.problemId,
          trackingId: ch.trackingId,
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
          projectStatus: "InterOp Workflow Active",
          photo: ch.photo,
          video: "",
          serviceType: ch.serviceType,
          primaryDepartment: ch.primaryDepartment,
          targetDepartments: ch.targetDepartments,
          connectorSource: ch.connectorSource,
          consentStatus: ch.consentStatus,
          dataQualityScore: ch.dataQualityScore,
          crossDeptStatus: JSON.stringify(multiDeptTimeline),

          // AI Fields
          aiDomain: aiAnalysis.domain || ch.domain,
          aiSubDomain: aiAnalysis.sub_domain || "",
          aiSector: sectorList.join(", "),
          aiSeverity: String(aiAnalysis.severity_score || 7),
          aiSeverityScore: aiAnalysis.severity_score || 7,
          aiSeverityReason: aiAnalysis.severity_reason || "Assessed based on public urgency and inter-agency impact.",
          aiAffectedPopulation: aiAnalysis.affected_population || `${ch.affectedPeople} citizens`,
          aiRequiredExpertise: JSON.stringify(expertiseList),
          aiRequiredTechnology: JSON.stringify(techList),
          aiRecommendedAction: aiAnalysis.recommended_action || "Trigger federated data exchange and inter-agency resolution.",
          aiKeywords: JSON.stringify(keywordsList),
          aiEvidenceRequirements: JSON.stringify(evidenceReqList),
          aiReasoning: `Classified under ${aiAnalysis.domain} in ${ch.district} requiring interoperable coordination across ${sectorList.join(', ')}.`,
          aiConfidence: 0.95,
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

        // If it's the duplicate challenge, link to the first
        if (ch.problemId === "MH-FED-2026-SKILL-008") {
          await problem.update({
            duplicateOf: "MH-FED-2026-SKILL-001",
            duplicateSimilarity: 0.8420,
            status: "Duplicate Flagged",
            projectStatus: "Duplicate Claim Suppressed by AI Deduplication Engine"
          });
          console.log(`  -> Flagged ${ch.problemId} as duplicate of MH-FED-2026-SKILL-001 (84.2% match)!`);
        }
      } else {
        console.log(`✓ Existing application verified: ${ch.problemId}`);
      }
    }

    console.log("\n===============================================================");
    console.log("MAHASETU SEEDING COMPLETED SUCCESSFULLY WITH ZERO ERRORS!");
    console.log("===============================================================");
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
