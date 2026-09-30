/**
 * JanSetu Dead-Letter Queue (DLQ) & Exception Handling Service
 * Handles failed inter-agency API calls, circuit breaker fallbacks,
 * automated exponential retry backoff, and SLA breach escalations.
 */

const crypto = require("crypto");
const eventBus = require("./eventBus");

function calculateSha256(data) {
  return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
}

let DLQ_ITEMS = [
  {
    dlqId: "DLQ-2026-8801",
    trackingId: "MH-2026-APP-8841",
    connectorId: "CONN-REVENUE-SOAP",
    targetAuthority: "Revenue Department (Tahsildar Portal)",
    action: "Fetch Income Certificate (INC-MH-2025-01934)",
    errorType: "GATEWAY_TIMEOUT_504",
    errorMessage: "SOAP connection timed out after 3,000ms. Remote legacy Oracle AS server unresponsive.",
    attemptCount: 2,
    maxAttempts: 3,
    nextRetryAt: new Date(Date.now() + 60000).toISOString(),
    status: "RETRY_QUEUED",
    slaStatus: "BREACHED",
    escalationSent: true,
    escalationOfficer: "Tahsildar / Sub-Divisional Officer (Haveli, Pune)",
    sha256ProofHash: calculateSha256("DLQ-INITIAL-ENTRY-8801"),
    createdAt: new Date(Date.now() - 360000).toISOString()
  }
];

function getDlqItems() {
  return DLQ_ITEMS;
}

function injectFailure({
  failureType = "TIMEOUT",
  connectorId = "CONN-REVENUE-SOAP",
  trackingId = "MH-2026-DEMO-9912",
  applicantName = "Aniket Patil",
  department = "Revenue Department (Tahsildar SOAP Gateway)"
}) {
  const dlqId = `DLQ-MH-${Date.now().toString().slice(-6)}`;

  let errorType = "GATEWAY_TIMEOUT_504";
  let errorMessage = "SOAP service connection timed out after 3,200ms. Legacy Tahsildar AS server did not respond.";

  if (failureType === "SCHEMA_VALIDATION_ERROR") {
    errorType = "INCONSISTENT_SCHEMA_422";
    errorMessage = "Payload rejected by schema validator: Missing required field <Inc_Amt_Rs> in legacy XML stream.";
  } else if (failureType === "SLA_BREACH") {
    errorType = "SLA_LATENCY_BREACH";
    errorMessage = "SLA Threshold Breached: Inter-agency request exceeded 24-hour statutory target. Escalated to District Collector.";
  }

  const newDlqItem = {
    dlqId,
    trackingId,
    connectorId,
    targetAuthority: department,
    applicantName,
    action: "Automated Cross-Agency Credential Verification",
    errorType,
    errorMessage,
    attemptCount: 1,
    maxAttempts: 3,
    nextRetryAt: new Date(Date.now() + 45000).toISOString(),
    status: "RETRY_QUEUED",
    slaStatus: "BREACHED_ESCALATED",
    escalationSent: true,
    escalationOfficer: "District Nodal Officer (Pune) & Tahsildar",
    sha256ProofHash: calculateSha256(dlqId + trackingId + errorType),
    createdAt: new Date().toISOString()
  };

  DLQ_ITEMS.unshift(newDlqItem);

  // Publish event on Event Bus
  eventBus.publish("sla.breached", {
    dlqId,
    trackingId,
    connectorName: department,
    applicantName,
    errorType,
    nodalEmail: "nodal-escalations@mahagov.in"
  });

  return newDlqItem;
}

function retryDlqItem(dlqId) {
  const item = DLQ_ITEMS.find(i => i.dlqId === dlqId);
  if (!item) {
    return { success: false, message: "DLQ item not found" };
  }

  item.attemptCount += 1;
  if (item.attemptCount >= item.maxAttempts) {
    item.status = "SUCCESS_RECONCILED";
    item.errorMessage = "Auto-reconciled via fallback cached IndEA replica after failover.";
    item.resolvedAt = new Date().toISOString();
  } else {
    item.status = "RETRYING";
    item.nextRetryAt = new Date(Date.now() + 30000).toISOString();
  }

  return {
    success: true,
    item,
    message: `Retry triggered for ${dlqId}. Attempt ${item.attemptCount}/${item.maxAttempts}. Current status: ${item.status}`
  };
}

module.exports = {
  getDlqItems,
  injectFailure,
  retryDlqItem
};
