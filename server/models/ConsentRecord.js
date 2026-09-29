const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "ConsentRecord",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    consentId: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    citizenId: { type: DataTypes.INTEGER, allowNull: false },
    citizenName: { type: DataTypes.STRING(150), allowNull: false },
    aadhaarMasked: { type: DataTypes.STRING(30), defaultValue: "XXXX-XXXX-8921" },
    sourceDepartment: { type: DataTypes.STRING(150), allowNull: false }, // e.g. "MahaDBT / UIDAI Vault"
    targetDepartment: { type: DataTypes.STRING(150), allowNull: false }, // e.g. "Department of Skills & Employment"
    purpose: { type: DataTypes.STRING(255), allowNull: false }, // e.g. "Skill Voucher Subsidy & Apprenticeship Enrollment"
    sharedAttributes: { type: DataTypes.TEXT, allowNull: false }, // JSON array of fields e.g. ["fullName", "casteCertificateNo", "annualIncome", "itiQualification"]
    status: { type: DataTypes.STRING(30), defaultValue: "ACTIVE" }, // ACTIVE, REVOKED, EXPIRED
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    consentArtifactHash: { type: DataTypes.STRING(128), allowNull: false }, // SHA-256 digital signature
    ipAddress: { type: DataTypes.STRING(50), defaultValue: "127.0.0.1" },
    depaFrameworkVersion: { type: DataTypes.STRING(30), defaultValue: "DEPA 2.0" }
  },
  { tableName: "consent_records", timestamps: true }
);
