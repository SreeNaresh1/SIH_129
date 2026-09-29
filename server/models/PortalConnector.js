const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "PortalConnector",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    connectorId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    department: { type: DataTypes.STRING(150), allowNull: false },
    systemType: { type: DataTypes.STRING(50), defaultValue: "Legacy Portal" }, // Legacy Portal, Modern Microservice, Central Registry
    protocol: { type: DataTypes.STRING(30), defaultValue: "REST" }, // REST, SOAP/XML, GraphQL, Webhook, Batch CSV
    authMethod: { type: DataTypes.STRING(50), defaultValue: "OAuth2" }, // OAuth2, e-Pramaan, API Key, Mutual TLS
    endpointUrl: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.STRING(30), defaultValue: "HEALTHY" }, // HEALTHY, DEGRADED, SYNCING, OFFLINE
    healthLatencyMs: { type: DataTypes.INTEGER, defaultValue: 45 },
    uptimePercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 99.95 },
    standardSchema: { type: DataTypes.STRING(50), defaultValue: "IndEA v2.0" }, // IndEA v2.0, OpenData JSON-LD, NDOH
    schemaMapping: { type: DataTypes.TEXT, allowNull: true }, // JSON translation schema
    adapterType: { type: DataTypes.STRING(50), defaultValue: "Bi-directional REST" },
    activeRecordsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastSyncAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dataQualityScore: { type: DataTypes.INTEGER, defaultValue: 98 },
    contactOfficer: { type: DataTypes.STRING(100), defaultValue: "Nodal IT Officer" },
    contactEmail: { type: DataTypes.STRING(100), defaultValue: "it-nodal@mahagov.in" },
    isMockConnector: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  { tableName: "portal_connectors", timestamps: true }
);
