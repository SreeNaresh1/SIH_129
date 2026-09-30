/**
 * JanSetu In-Memory Lightweight Event Bus & Notification Dispatcher
 * Mirrors Kafka / Redis Streams architecture with topics, event logs, and notification sinks.
 */

const crypto = require("crypto");

class JanSetuEventBus {
  constructor() {
    this.events = [];
    this.subscribers = {};
    this.dispatchedNotifications = [];

    // Register default event listeners
    this.initDefaultSubscribers();
  }

  initDefaultSubscribers() {
    // 1. When an application is submitted
    this.subscribe("application.submitted", (payload) => {
      this.dispatchNotification({
        channel: "SMS",
        recipient: payload.mobile || "+91-98XXXXX412",
        recipientName: payload.applicantName || "Resident",
        template: "APPLICATION_RECEIVED",
        message: `JanSetu Alert: Your application #${payload.trackingId} for ${payload.serviceType} has been received. Track live: https://jansetu.gov.in/track/${payload.trackingId}`,
        timestamp: new Date().toISOString()
      });
    });

    // 2. When citizen grants consent
    this.subscribe("consent.granted", (payload) => {
      this.dispatchNotification({
        channel: "WHATSAPP",
        recipient: payload.mobile || "+91-98XXXXX412",
        recipientName: payload.citizenName || "Resident",
        template: "CONSENT_AUTHORIZATION",
        message: `JanSetu DEPA 2.0: You authorized ${payload.targetDepartment} to fetch your credentials from ${payload.sourceDepartment}. Valid for 24h. SHA-256: ${payload.consentArtifactHash ? payload.consentArtifactHash.slice(0, 16) : "e3b0c442..."}`,
        timestamp: new Date().toISOString()
      });
    });

    // 3. When an SLA timeout or error occurs
    this.subscribe("sla.breached", (payload) => {
      this.dispatchNotification({
        channel: "ESCALATION_EMAIL",
        recipient: payload.nodalEmail || "nodal-escalations@mahagov.in",
        recipientName: "District Nodal Officer (Pune)",
        template: "SLA_BREACH_ESCALATION",
        message: `CRITICAL SLA BREACH ALERT: Application #${payload.trackingId} timed out on ${payload.connectorName || "Legacy SOAP Adapter"}. Elapsed: 3.2s (Threshold: 3.0s). Routed to Dead-Letter Queue for auto-retry.`,
        timestamp: new Date().toISOString()
      });
    });

    // 4. When application is approved
    this.subscribe("application.approved", (payload) => {
      this.dispatchNotification({
        channel: "SMS_AND_DIGILOCKER",
        recipient: payload.mobile || "+91-98XXXXX412",
        recipientName: payload.applicantName || "Resident",
        template: "SANCTION_APPROVED",
        message: `Congratulations! Your DBT Scholarship under MahaDBT has been Sanctioned (Direct Credit to SBI Account: XXXX-9901). DigiLocker sanction certificate issued.`,
        timestamp: new Date().toISOString()
      });
    });
  }

  subscribe(topic, handler) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(handler);
  }

  publish(topic, payload) {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const eventRecord = {
      eventId,
      topic,
      payload,
      timestamp: new Date().toISOString(),
      hash: crypto.createHash("sha256").update(JSON.stringify(payload) + eventId).digest("hex")
    };

    this.events.unshift(eventRecord);
    if (this.events.length > 100) this.events.pop();

    // Trigger subscribers
    const handlers = this.subscribers[topic] || [];
    handlers.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`Error executing event handler for ${topic}:`, err);
      }
    });

    return eventRecord;
  }

  dispatchNotification(notification) {
    const notifRecord = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      ...notification,
      status: "DELIVERED_SIMULATED",
      deliveredAt: new Date().toISOString()
    };
    this.dispatchedNotifications.unshift(notifRecord);
    if (this.dispatchedNotifications.length > 50) this.dispatchedNotifications.pop();
    return notifRecord;
  }

  getRecentEvents(limit = 20) {
    return this.events.slice(0, limit);
  }

  getDispatchedNotifications(limit = 20) {
    return this.dispatchedNotifications.slice(0, limit);
  }
}

const eventBusInstance = new JanSetuEventBus();
module.exports = eventBusInstance;
