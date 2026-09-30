/**
 * JanSetu / MahaSetu Declarative Adapter Engine
 * Implements non-invasive connectors for:
 * 1. Legacy SOAP / XML (e.g., Revenue Dept Income Certificate)
 * 2. Modern REST / JSON (e.g., Social Welfare Caste Verification API)
 * 3. CSV / SFTP Batch Drops (e.g., Banking / PFMS / DBT Account Verification)
 * 4. Direct DB Read-Only View (e.g., Mahabhumi Cadastral Land Records)
 *
 * Each connector maps legacy proprietary fields to the JanSetu Canonical Schema
 * via declarative YAML/JSON configuration without changing underlying source systems.
 */

const crypto = require("crypto");

function calculateSha256(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

// Declarative Mapping Configurations (YAML / JSON Schema)
const DECLARATIVE_SCHEMAS = {
  "CONN-REVENUE-SOAP": {
    name: "Revenue Department (Tahsildar Portal)",
    adapterType: "SOAP_XML_ADAPTER",
    protocol: "SOAP 1.2 / XML",
    endpoint: "https://revenue.mahagov.in/ws/IncomeCertificateService.asmx",
    declarativeMapping: {
      sourceRoot: "soap:Body.GetIncomeCertificateResponse.IncomeRecord",
      canonicalTarget: "CanonicalDocument.IncomeCertificate",
      fieldMappings: [
        { sourceField: "Inc_Amt_Rs", targetField: "annualIncomeINR", transform: "PARSE_INTEGER" },
        { sourceField: "Applicant_Name_Eng", targetField: "applicantFullName", transform: "TRIM_UPPERCASE" },
        { sourceField: "Applicant_UID_Hash", targetField: "aadhaarTokenHash", transform: "DIRECT" },
        { sourceField: "Cert_No_AlphaNum", targetField: "certificateNumber", transform: "DIRECT" },
        { sourceField: "Tahsildar_Sign_Dt", targetField: "issuedDate", transform: "DATE_ISO" },
        { sourceField: "Validity_Yrs", targetField: "validityYears", transform: "DEFAULT_1" },
        { sourceField: "District_Code_LGD", targetField: "districtLGDCode", transform: "DIRECT" }
      ]
    }
  },

  "CONN-SOCIAL-WELFARE-REST": {
    name: "Social Welfare Department (Caste Validation)",
    adapterType: "REST_OPENAPI_ADAPTER",
    protocol: "REST / JSON OpenAPI 3.0",
    endpoint: "https://socialwelfare.mahagov.in/api/v1/caste-certificates/verify",
    declarativeMapping: {
      sourceRoot: "data.verificationDetails",
      canonicalTarget: "CanonicalDocument.CasteCertificate",
      fieldMappings: [
        { sourceField: "certificate_number", targetField: "certificateNumber", transform: "DIRECT" },
        { sourceField: "beneficiary_full_name", targetField: "applicantFullName", transform: "TRIM_UPPERCASE" },
        { sourceField: "caste_category", targetField: "category", transform: "DIRECT" }, // SC, ST, OBC, VJNT
        { sourceField: "caste_subcaste", targetField: "subCaste", transform: "DIRECT" },
        { sourceField: "issuing_scrutiny_committee", targetField: "issuingAuthority", transform: "DIRECT" },
        { sourceField: "verification_status", targetField: "validationStatus", transform: "MAP_BOOLEAN" },
        { sourceField: "issued_on", targetField: "issuedDate", transform: "DATE_ISO" }
      ]
    }
  },

  "CONN-PFMS-BANKING-CSV": {
    name: "PFMS / Core Banking DBT Direct Validation",
    adapterType: "CSV_BATCH_ADAPTER",
    protocol: "SFTP / CSV Batch Feed",
    endpoint: "sftp://pfms-gateway.dbt.gov.in/drops/daily_beneficiary_status.csv",
    declarativeMapping: {
      sourceFormat: "CSV_HEADER_DELIMITED",
      delimiter: ",",
      canonicalTarget: "CanonicalPerson.BankMandate",
      fieldMappings: [
        { sourceField: "Account_No", targetField: "maskedAccountNumber", transform: "MASK_ACCOUNT" },
        { sourceField: "IFSC_Code", targetField: "ifscCode", transform: "TRIM_UPPERCASE" },
        { sourceField: "Bank_Name", targetField: "bankName", transform: "DIRECT" },
        { sourceField: "Beneficiary_Name", targetField: "accountHolderName", transform: "TRIM_UPPERCASE" },
        { sourceField: "NPCI_Aadhaar_Linked", targetField: "dbtEnabled", transform: "PARSE_BOOLEAN_Y_N" },
        { sourceField: "Verification_Status", targetField: "mandateStatus", transform: "DIRECT" }
      ]
    }
  },

  "CONN-MAHABHUMI-DB-VIEW": {
    name: "Mahabhumi Cadastral 7/12 Read-Only DB Replica",
    adapterType: "DIRECT_DB_VIEW_ADAPTER",
    protocol: "PostgreSQL Read-Only Replica / SQL View",
    endpoint: "jdbc:postgresql://mahabhumi-replica.internal:5432/land_registry?currentSchema=readonly_views",
    declarativeMapping: {
      sourceView: "vw_7_12_khatadaar_ro",
      canonicalTarget: "CanonicalDocument.LandHolding",
      fieldMappings: [
        { sourceField: "survey_gut_number", targetField: "surveyNumber", transform: "DIRECT" },
        { sourceField: "khatadaar_name", targetField: "ownerName", transform: "TRIM_UPPERCASE" },
        { sourceField: "area_in_hectare", targetField: "totalLandAreaHa", transform: "PARSE_FLOAT" },
        { sourceField: "irrigation_type", targetField: "irrigationStatus", transform: "DIRECT" },
        { sourceField: "village_lgd", targetField: "villageCode", transform: "DIRECT" },
        { sourceField: "taluka_name", targetField: "taluka", transform: "DIRECT" }
      ]
    }
  }
};

/**
 * Transforms legacy raw data into Canonical JSON-LD using declarative mapping rules
 */
function applyDeclarativeMapping(connectorId, rawInput) {
  const schema = DECLARATIVE_SCHEMAS[connectorId];
  if (!schema) {
    throw new Error(`Declarative schema not found for connector: ${connectorId}`);
  }

  const { fieldMappings, canonicalTarget } = schema.declarativeMapping;
  const canonicalOutput = {
    "@context": "https://standards.gov.in/jansetu/v2.0/canonical.jsonld",
    "@type": canonicalTarget,
    connectorId,
    sourceProtocol: schema.protocol,
    adapterType: schema.adapterType,
    transformedAt: new Date().toISOString(),
    canonicalData: {}
  };

  fieldMappings.forEach(mapping => {
    let rawVal = rawInput[mapping.sourceField];
    if (rawVal === undefined || rawVal === null) {
      rawVal = "";
    }

    let transformedVal = rawVal;
    switch (mapping.transform) {
      case "PARSE_INTEGER":
        transformedVal = parseInt(String(rawVal).replace(/[^0-9]/g, ""), 10) || 0;
        break;
      case "PARSE_FLOAT":
        transformedVal = parseFloat(String(rawVal)) || 0.0;
        break;
      case "TRIM_UPPERCASE":
        transformedVal = String(rawVal).trim().toUpperCase();
        break;
      case "MASK_ACCOUNT":
        const s = String(rawVal);
        transformedVal = s.length > 4 ? `XXXX-XXXX-${s.slice(-4)}` : "XXXX-XXXX-9901";
        break;
      case "PARSE_BOOLEAN_Y_N":
        transformedVal = String(rawVal).trim().toUpperCase() === "Y" || String(rawVal).trim().toUpperCase() === "YES" || String(rawVal) === "true";
        break;
      case "MAP_BOOLEAN":
        transformedVal = String(rawVal).toUpperCase() === "VALID" || String(rawVal).toUpperCase() === "VERIFIED" || String(rawVal) === "true";
        break;
      case "DATE_ISO":
        try {
          transformedVal = new Date(rawVal).toISOString().split("T")[0];
        } catch {
          transformedVal = "2025-06-15";
        }
        break;
      case "DEFAULT_1":
        transformedVal = parseInt(rawVal, 10) || 1;
        break;
      case "DIRECT":
      default:
        transformedVal = rawVal;
        break;
    }

    canonicalOutput.canonicalData[mapping.targetField] = transformedVal;
  });

  canonicalOutput.verificationProofHash = calculateSha256(canonicalOutput.canonicalData);
  return canonicalOutput;
}

/**
 * Simulates real-time fetch through the 3 diverse department connectors:
 * 1. Revenue Dept (Legacy SOAP XML)
 * 2. Social Welfare Dept (Modern REST)
 * 3. PFMS Banking (CSV Drop)
 */
async function simulateMultiDepartmentFanOut({
  applicantName = "Aniket Suresh Patil",
  district = "Pune",
  injectTimeoutOnSoap = false
}) {
  const results = {
    executionId: `EXEC-MH-${Date.now()}`,
    startTime: new Date().toISOString(),
    fanOutSummary: "Concurrently dispatched fetch requests across 3 distinct adapter protocols",
    departments: {}
  };

  // 1. Revenue Dept (Legacy SOAP/XML simulation)
  if (injectTimeoutOnSoap) {
    results.departments.revenue = {
      connectorId: "CONN-REVENUE-SOAP",
      department: "Revenue and Forest Department",
      protocol: "SOAP 1.2 / XML Envelope",
      status: "FAILED_TIMEOUT",
      statusCode: 504,
      latencyMs: 3200,
      error: "SOAP Gateway Connection Timeout (3000ms threshold breached). Remote legacy endpoint did not reply.",
      deadLetterQueueTriggered: true,
      rawXmlPayload: `<soapenv:Fault><faultcode>soapenv:Server</faultcode><faultstring>Connection timed out at Tahsildar Gateway</faultstring></soapenv:Fault>`
    };
  } else {
    const rawSoapXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetIncomeCertificateResponse xmlns="http://revenue.mahagov.in/ws/">
      <IncomeRecord>
        <Cert_No_AlphaNum>INC-MH-2025-01934</Cert_No_AlphaNum>
        <Applicant_Name_Eng>${applicantName}</Applicant_Name_Eng>
        <Inc_Amt_Rs>180000</Inc_Amt_Rs>
        <Applicant_UID_Hash>${calculateSha256(`AADHAAR-${applicantName}-PUNE`)}</Applicant_UID_Hash>
        <Tahsildar_Sign_Dt>2025-05-18</Tahsildar_Sign_Dt>
        <Validity_Yrs>3</Validity_Yrs>
        <District_Code_LGD>491</District_Code_LGD>
      </IncomeRecord>
    </GetIncomeCertificateResponse>
  </soap:Body>
</soap:Envelope>`;

    const parsedXmlFields = {
      Cert_No_AlphaNum: "INC-MH-2025-01934",
      Applicant_Name_Eng: applicantName,
      Inc_Amt_Rs: "180000",
      Applicant_UID_Hash: calculateSha256(`AADHAAR-${applicantName}-PUNE`),
      Tahsildar_Sign_Dt: "2025-05-18",
      Validity_Yrs: "3",
      District_Code_LGD: "491"
    };

    const canonicalIncome = applyDeclarativeMapping("CONN-REVENUE-SOAP", parsedXmlFields);

    results.departments.revenue = {
      connectorId: "CONN-REVENUE-SOAP",
      department: "Revenue Department (Tahsildar)",
      protocol: "SOAP 1.2 / XML",
      status: "SUCCESS",
      statusCode: 200,
      latencyMs: 42,
      rawPayloadPreview: rawSoapXml,
      canonicalRecord: canonicalIncome
    };
  }

  // 2. Social Welfare Dept (Modern REST JSON simulation)
  const rawRestJson = {
    status: "OK",
    data: {
      verificationDetails: {
        certificate_number: "CC-MH-2023-884129",
        beneficiary_full_name: applicantName,
        caste_category: "OBC",
        caste_subcaste: "Mali",
        issuing_scrutiny_committee: "District Caste Scrutiny Committee, Pune Division",
        verification_status: "VERIFIED",
        issued_on: "2023-08-12"
      }
    }
  };

  const canonicalCaste = applyDeclarativeMapping("CONN-SOCIAL-WELFARE-REST", rawRestJson.data.verificationDetails);

  results.departments.socialWelfare = {
    connectorId: "CONN-SOCIAL-WELFARE-REST",
    department: "Social Justice & Special Assistance",
    protocol: "REST OpenAPI 3.0 / JSON",
    status: "SUCCESS",
    statusCode: 200,
    latencyMs: 24,
    rawPayloadPreview: JSON.stringify(rawRestJson, null, 2),
    canonicalRecord: canonicalCaste
  };

  // 3. PFMS Banking (CSV Drop Batch simulation)
  const rawCsvRow = "Account_No,IFSC_Code,Bank_Name,Beneficiary_Name,NPCI_Aadhaar_Linked,Verification_Status\n5010042891924,SBIN0001428,State Bank of India,ANIKET SURESH PATIL,Y,ACTIVE";
  const parsedCsvFields = {
    Account_No: "5010042891924",
    IFSC_Code: "SBIN0001428",
    Bank_Name: "State Bank of India",
    Beneficiary_Name: applicantName.toUpperCase(),
    NPCI_Aadhaar_Linked: "Y",
    Verification_Status: "ACTIVE_MANDATE"
  };

  const canonicalBank = applyDeclarativeMapping("CONN-PFMS-BANKING-CSV", parsedCsvFields);

  results.departments.banking = {
    connectorId: "CONN-PFMS-BANKING-CSV",
    department: "Public Financial Management System (PFMS) & Core Banking",
    protocol: "SFTP / CSV Batch Feed",
    status: "SUCCESS",
    statusCode: 200,
    latencyMs: 18,
    rawPayloadPreview: rawCsvRow,
    canonicalRecord: canonicalBank
  };

  results.endTime = new Date().toISOString();
  return results;
}

module.exports = {
  DECLARATIVE_SCHEMAS,
  applyDeclarativeMapping,
  simulateMultiDepartmentFanOut
};
