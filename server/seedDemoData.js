require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sequelize } = require("./config/database");

const User = require("./models/User");
const PortalConnector = require("./models/PortalConnector");
const ConsentRecord = require("./models/ConsentRecord");
const DataExchangeLog = require("./models/DataExchangeLog");
const WorkflowPipeline = require("./models/WorkflowPipeline");

function calculateSha256(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

async function seed() {
  try {
    console.log("===============================================================");
    console.log("SEEDING MAHASETU (MUIF) INTEROPERABILITY MIDDLEWARE PLATFORM");
    console.log("SIH PROBLEM STATEMENT ID: 26129 - GOVERNMENT OF MAHARASHTRA");
    console.log("===============================================================");

    await sequelize.authenticate();
    await User.sync();
    await PortalConnector.sync();
    await ConsentRecord.sync();
    await DataExchangeLog.sync();
    await WorkflowPipeline.sync();

    // 1. Seed Core User Accounts (Admin, Government, Citizen)
    console.log("\n1. Ensuring test user accounts (Government, Admin, Citizen)...");
    const accounts = [
      {
        name: "State Interoperability Administrator (MSInS)",
        email: "government@sihportal.com",
        password: "Government@123",
        role: "government",
        organization: "Maharashtra State Innovation Society (MSInS), Dept of Skills & Employment"
      },
      {
        name: "MahaSetu System Admin",
        email: "admin@sihportal.com",
        password: "Admin@123",
        role: "admin",
        organization: "Directorate of Information Technology (DIT), GoM"
      },
      {
        name: "Citizen Applicant (Aniket Patil)",
        email: "citizen@sihportal.com",
        password: "Citizen@123",
        role: "citizen",
        organization: "MahaSetu Single Window Resident Portal"
      }
    ];

    let citizenUser = null;

    for (const acc of accounts) {
      let user = await User.findOne({ where: { email: acc.email } });
      const hashedPassword = await bcrypt.hash(acc.password, 10);
      if (!user) {
        user = await User.create({
          name: acc.name,
          email: acc.email,
          password: hashedPassword,
          role: acc.role,
          organization: acc.organization
        });
        console.log(`✓ Created ${acc.role} account: ${acc.email}`);
      } else {
        await user.update({
          name: acc.name,
          password: hashedPassword,
          role: acc.role,
          organization: acc.organization
        });
        console.log(`✓ Verified and updated ${acc.role} account: ${acc.email}`);
      }
      if (acc.role === "citizen") citizenUser = user;
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
    console.log(`✓ Seeded & verified ${CONNECTORS.length} departmental portal connectors.`);

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
          { order: 4, portal: "MSInS Innovation", task: "Cross-Agency Sync & Escalation (if unresolved)", autoPass: true, slaHours: 48 }
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
      },
      {
        transactionId: "TX-MH-2026-0928-8815",
        sourceConnectorId: "CONN-DHE",
        targetConnectorId: "CONN-MAHADBT",
        sourcePortal: "Directorate Higher Ed (DHE)",
        targetPortal: "MahaDBT (Scholarships)",
        endpoint: "/api/v1/institutions/prn-verification",
        method: "POST",
        payloadSourceFormat: "REST / JSON",
        payloadTargetFormat: "IndEA JSON-LD",
        payloadSummary: "Validated Permanent Registration Number (PRN) for 480 post-matric scholars",
        transformedPayload: JSON.stringify({ verifiedPRNCount: 480, institute: "Government Polytechnic, Pune", status: "CONFIRMED" }),
        status: "SUCCESS",
        statusCode: 200,
        latencyMs: 24,
        dataQualityScore: 99,
        dataQualityWarnings: "[]",
        sha256VerificationHash: calculateSha256("DHE-MAHADBT-PRN-VALIDATION")
      }
    ];

    for (const l of LOGS) {
      const [logRec] = await DataExchangeLog.findOrCreate({
        where: { transactionId: l.transactionId },
        defaults: l
      });
      await logRec.update(l);
    }
    console.log(`✓ Seeded ${LOGS.length} inter-agency transaction audit logs.`);

    // 5. Seed Consent Records (DEPA Standard)
    console.log("\n5. Seeding Citizen Consent Records (DEPA 2.0)...");
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);

    const CONSENT_RECORDS = [
      {
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
      },
      {
        consentId: "CNSNT-MH-2026-002",
        citizenId: citizenUser?.id || 1,
        citizenName: "Aniket Suresh Patil",
        aadhaarMasked: "XXXX-XXXX-8921",
        sourceDepartment: "DigiLocker Resident Vault",
        targetDepartment: "MahaSwayam (Skills & Employment)",
        purpose: "ITI Machinist Certificate & Domicile Auto-Attestation",
        sharedAttributes: JSON.stringify(["fullName", "domicileCertificateNo", "itiTrade", "passingYear"]),
        status: "ACTIVE",
        expiresAt: expDate,
        consentArtifactHash: calculateSha256("CONSENT-ANIKET-PATIL-DIGILOCKER-SWAYAM"),
        depaFrameworkVersion: "DEPA 2.0 / DigiLocker Standard"
      },
      {
        consentId: "CNSNT-MH-2026-003",
        citizenId: citizenUser?.id || 1,
        citizenName: "Pooja Suresh Sharma",
        aadhaarMasked: "XXXX-XXXX-4912",
        sourceDepartment: "Revenue Department (Tahsildar)",
        targetDepartment: "Aaple Sarkar RTS Gateway",
        purpose: "Income & Non-Creamy Layer Certificate Verification",
        sharedAttributes: JSON.stringify(["fullName", "incomeCertificateNo", "annualIncome", "tehsil"]),
        status: "ACTIVE",
        expiresAt: expDate,
        consentArtifactHash: calculateSha256("CONSENT-POOJA-SHARMA-REVENUE-RTS"),
        depaFrameworkVersion: "DEPA 2.0 / DigiLocker Standard"
      }
    ];

    for (const c of CONSENT_RECORDS) {
      const [cr] = await ConsentRecord.findOrCreate({
        where: { consentId: c.consentId },
        defaults: c
      });
      await cr.update(c);
    }
    console.log(`✓ Seeded ${CONSENT_RECORDS.length} active citizen consent records.`);

    console.log("\n===============================================================");
    console.log("MAHASETU MIDDLEWARE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("Only Connectors, Logs, Consents, Workflows & Users seeded.");
    console.log("===============================================================");
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
