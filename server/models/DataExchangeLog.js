const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "DataExchangeLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    transactionId: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    sourceConnectorId: { type: DataTypes.STRING(50), allowNull: false },
    targetConnectorId: { type: DataTypes.STRING(50), allowNull: false },
    sourcePortal: { type: DataTypes.STRING(100), allowNull: false }, // e.g. "MahaSwayam Portal"
    targetPortal: { type: DataTypes.STRING(100), allowNull: false }, // e.g. "MahaDBT Benefits Registry"
    endpoint: { type: DataTypes.STRING(255), allowNull: false },
    method: { type: DataTypes.STRING(10), defaultValue: "POST" },
    payloadSourceFormat: { type: DataTypes.STRING(30), defaultValue: "XML/SOAP" }, // XML/SOAP, JSON, CSV
    payloadTargetFormat: { type: DataTypes.STRING(30), defaultValue: "IndEA JSON-LD" }, // IndEA JSON-LD, GeoJSON
    payloadSummary: { type: DataTypes.TEXT, allowNull: true },
    transformedPayload: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(30), defaultValue: "SUCCESS" }, // SUCCESS, RECONCILED, EXCEPTION, RETRYING, FAILED
    statusCode: { type: DataTypes.INTEGER, defaultValue: 200 },
    latencyMs: { type: DataTypes.INTEGER, defaultValue: 32 },
    dataQualityScore: { type: DataTypes.INTEGER, defaultValue: 99 },
    dataQualityWarnings: { type: DataTypes.TEXT, defaultValue: "[]" }, // JSON array of warnings
    exceptionType: { type: DataTypes.STRING(100), allowNull: true },
    exceptionMessage: { type: DataTypes.TEXT, allowNull: true },
    resolutionAction: { type: DataTypes.STRING(150), allowNull: true },
    sha256VerificationHash: { type: DataTypes.STRING(128), allowNull: false }
  },
  { tableName: "data_exchange_logs", timestamps: true }
);
