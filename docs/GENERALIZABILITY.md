# MahaSetu — Generalizability & State-Agnostic Replication Playbook
## Plug-and-Play Adapter Model for Any Indian State or Central Department

> **SIH 2026 Problem Statement ID:** 26129  
> **PS Requirement:** *"The solution should provide reusable connectors for legacy and modern systems."*

---

## 1. Design Philosophy: Maharashtra-First, State-Agnostic by Architecture

The Maharashtra portals (MahaSwayam, MahaDBT, Aaple Sarkar, DigiLocker) are used as **concrete, well-documented reference implementations** in this prototype. They represent the full spectrum of real-world government integration challenges:

| Portal | Integration Challenge |
|---|---|
| **MahaSwayam** | Modern REST/JSON — well-documented |
| **MahaDBT** | Legacy SOAP/XML with non-standard tags |
| **Aaple Sarkar** | Webhook + REST hybrid with RTS Act SLAs |
| **DigiLocker** | OAuth 2.0 / DEPA 2.0 consent protocol |
| **PFMS / Banking** | CSV/SFTP batch drops — no HTTP API |
| **Mahabhumi** | Direct DB read-only SQL view |

This combination covers **every adapter type** that any Indian state will encounter. The framework is therefore **directly replicable to any state without core code changes**.

---

## 2. The Declarative Adapter SDK — Config, Not Code

MahaSetu uses a **declarative YAML/JSON connector configuration** to onboard any new department or portal. No middleware code changes are required.

### 2.1 Connector Config Structure

```yaml
# MahaSetu Connector Configuration Schema v2.0
connectorId: <unique-connector-id>
name: <Human-readable portal name>
adapterType: REST_OPENAPI_ADAPTER | SOAP_XML_ADAPTER | CSV_BATCH_ADAPTER | DIRECT_DB_VIEW_ADAPTER
protocol: <e.g., REST / JSON OpenAPI 3.0>
endpoint: <Base URL or connection string>

declarativeMapping:
  sourceRoot: <JSONPath or XPath to the data root in source payload>
  canonicalTarget: <Target canonical schema type>
  fieldMappings:
    - sourceField: <field name in source system>
      targetField: <field name in IndEA canonical schema>
      transform: DIRECT | TRIM_UPPERCASE | PARSE_INTEGER | DATE_ISO | MASK_ACCOUNT | PARSE_BOOLEAN_Y_N
```

### 2.2 Supported Transform Functions

| Transform | Description | Example Use |
|---|---|---|
| `DIRECT` | Pass-through, no transformation | IDs, codes |
| `TRIM_UPPERCASE` | Trim whitespace + uppercase | Names |
| `PARSE_INTEGER` | Strip non-numeric chars + parseInt | Income amounts |
| `PARSE_FLOAT` | parseFloat | Land area in hectares |
| `DATE_ISO` | Convert any date format to ISO 8601 | Certificate issue dates |
| `MASK_ACCOUNT` | Mask account number, show last 4 digits | Bank account numbers |
| `PARSE_BOOLEAN_Y_N` | Y/N/YES/NO/true/false to boolean | NPCI Aadhaar linked |
| `MAP_BOOLEAN` | VALID/VERIFIED/true to boolean | Verification status |

---

## 3. State-by-State Onboarding Examples

### 3.1 Kerala — SEEDS Social Welfare Portal (REST/JSON)
```yaml
connectorId: CONN-KERALA-SEEDS-REST
name: Kerala SEEDS Social Welfare Portal
adapterType: REST_OPENAPI_ADAPTER
protocol: REST / JSON OpenAPI 3.0
endpoint: https://seeds.kerala.gov.in/api/v1/beneficiaries
declarativeMapping:
  sourceRoot: data.beneficiaryRecord
  canonicalTarget: CanonicalPerson.Beneficiary
  fieldMappings:
    - { sourceField: applicant_name,  targetField: applicantFullName, transform: TRIM_UPPERCASE }
    - { sourceField: uid_token,       targetField: aadhaarTokenHash,  transform: DIRECT }
    - { sourceField: district_code,   targetField: districtLGDCode,   transform: DIRECT }
    - { sourceField: scheme_id,       targetField: schemeIdentifier,  transform: DIRECT }
    - { sourceField: approval_status, targetField: applicationStatus, transform: DIRECT }
```
**Onboarding effort:** ~15 minutes to write YAML + register in connector registry.

---

### 3.2 Rajasthan — RajSSP Legacy SOAP Portal (SOAP/XML)
```yaml
connectorId: CONN-RAJASTHAN-RAJSSP-SOAP
name: Rajasthan Social Security Pension Portal (RajSSP)
adapterType: SOAP_XML_ADAPTER
protocol: SOAP 1.1 / XML
endpoint: https://rajssp.raj.nic.in/ws/PensionService.asmx
declarativeMapping:
  sourceRoot: soap:Body.GetPensionStatusResponse.PensionRecord
  canonicalTarget: CanonicalPerson.PensionBeneficiary
  fieldMappings:
    - { sourceField: Applicant_Nm,    targetField: applicantFullName, transform: TRIM_UPPERCASE }
    - { sourceField: UID_No_Hash,     targetField: aadhaarTokenHash,  transform: DIRECT }
    - { sourceField: Pension_Amt_Rs,  targetField: pensionAmountINR,  transform: PARSE_INTEGER }
    - { sourceField: Disb_Dt,         targetField: disbursementDate,  transform: DATE_ISO }
    - { sourceField: Dist_LGD_Cd,     targetField: districtLGDCode,   transform: DIRECT }
```
**Onboarding effort:** ~30 minutes (SOAP payloads require XPath mapping configuration).

---

### 3.3 Odisha — BASIX Tribal Welfare Portal (CSV/SFTP Batch)
```yaml
connectorId: CONN-ODISHA-BASIX-CSV
name: Odisha BASIX Tribal Welfare CSV Drop
adapterType: CSV_BATCH_ADAPTER
protocol: SFTP / CSV Batch Feed
endpoint: sftp://basix.odisha.gov.in/drops/daily_beneficiary.csv
declarativeMapping:
  sourceFormat: CSV_HEADER_DELIMITED
  delimiter: ","
  canonicalTarget: CanonicalPerson.Beneficiary
  fieldMappings:
    - { sourceField: NAME,         targetField: applicantFullName, transform: TRIM_UPPERCASE }
    - { sourceField: AADHAAR_HASH, targetField: aadhaarTokenHash,  transform: DIRECT }
    - { sourceField: DISTRICT,     targetField: districtName,      transform: DIRECT }
    - { sourceField: AMOUNT,       targetField: grantAmountINR,    transform: PARSE_INTEGER }
```
**Onboarding effort:** ~20 minutes.

---

## 4. National Rollout Architecture

```
+------------------------------------------------------------------+
|              NATIONAL INTEROPERABILITY PLATFORM                   |
|                      (MeghRaj / NIC Cloud)                        |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |             MAHASETU MIDDLEWARE CORE (Shared)                |  |
|  |  - IndEA v2.0 Schema Engine   - MDM Golden Record Engine     |  |
|  |  - DEPA 2.0 Consent Manager   - Data Quality Layer           |  |
|  |  - Workflow Orchestrator       - DLQ Exception Handler        |  |
|  |  - SHA-256 Audit Chain         - Monitoring Dashboards        |  |
|  +-------------------------------+------------------------------+  |
|                                  |                                  |
|     +----------------------------+--------------------------+       |
|     |                            |                          |       |
|     v                            v                          v       |
|  +-----------------+  +-----------------+  +-----------------+     |
|  | Maharashtra     |  | Kerala          |  | Rajasthan       |     |
|  | Connector Pack  |  | Connector Pack  |  | Connector Pack  |     |
|  | (YAML configs)  |  | (YAML configs)  |  | (YAML configs)  |     |
|  | - MahaSwayam   |  | - SEEDS         |  | - RajSSP        |     |
|  | - MahaDBT      |  | - Kerala DBT    |  | - eGras         |     |
|  | - Aaple Sarkar |  | - DigiSeva      |  | - Jan Soochna   |     |
|  +-----------------+  +-----------------+  +-----------------+     |
+------------------------------------------------------------------+
```

**Deployment steps for a new state:**
1. Provision MahaSetu middleware container on NIC/MeghRaj (Docker/Kubernetes).
2. Create one YAML connector config file per departmental portal.
3. Register connectors via `/api/interop/connectors` POST endpoint.
4. MDM Golden Records are auto-provisioned on first citizen resolution.
5. Data Quality and DLQ layers activate automatically — zero configuration required.

---

## 5. Compliance with National Standards

| Standard | Coverage |
|---|---|
| **IndEA v2.0** | All canonical data models and field mappings conform to India Enterprise Architecture |
| **DEPA 2.0** | Consent artifacts cryptographically signed; purpose-bound and time-limited |
| **Open API 3.0** | API Gateway enforces OpenAPI spec for every registered connector |
| **DPDP Act 2023** | Consent-based data access; no data retained beyond consent window |
| **NIC Cloud Policy** | Stateless middleware; state data stays in originating departmental system |
| **e-Governance Standards** | SHA-256 audit chain; role-based access (RBAC); TLS 1.3 in transit |

---

## 6. Summary: What Evaluators Should Note

> MahaSetu uses Maharashtra's portals as a demonstration canvas. The **core middleware architecture, MDM engine, Data Quality Layer, DLQ, and workflow orchestrator are completely state-agnostic**. They require only YAML connector configuration files to integrate any portal in any Indian state.

This directly satisfies the Problem Statement 26129 requirement:
> *"The solution should provide **reusable connectors** for legacy and modern systems."*

The framework is ready for national deployment via NIC/MeghRaj cloud infrastructure with minimal per-state onboarding effort.
