const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "CommunityEvidence",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    problemId: { type: DataTypes.STRING(30), allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    citizenName: { type: DataTypes.STRING(100), defaultValue: "Verified Resident" },
    citizenDistrict: { type: DataTypes.STRING(100), defaultValue: "Dumka" },
    voteType: {
      type: DataTypes.STRING(50),
      defaultValue: "confirm" // confirm | worsening | still_exists | resolved
    },
    severityRating: { type: DataTypes.STRING(50), defaultValue: "High" },
    evidencePhoto: { type: DataTypes.STRING(500), defaultValue: "" },
    evidenceNote: { type: DataTypes.TEXT, defaultValue: "" },
    stillExists: { type: DataTypes.BOOLEAN, defaultValue: true },
    isVerifiedResident: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  { tableName: "community_evidence", timestamps: true }
);
