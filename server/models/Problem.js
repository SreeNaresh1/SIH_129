const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Problem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    problemId: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    citizenId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    domain: { type: DataTypes.STRING(100), allowNull: false },
    district: { type: DataTypes.STRING(100), allowNull: false },
    location: { type: DataTypes.STRING(255), defaultValue: "" },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    affectedPeople: { type: DataTypes.INTEGER, allowNull: true },
    severity: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "Medium" },
    photo: { type: DataTypes.STRING(500), defaultValue: "" },
    video: { type: DataTypes.STRING(500), defaultValue: "" },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Under Review"
    },
    projectStatus: { type: DataTypes.STRING(100), defaultValue: "" },
    assignedUniversityId: { type: DataTypes.INTEGER, allowNull: true },
    assignedBy: { type: DataTypes.INTEGER, allowNull: true },
    assignedAt: { type: DataTypes.DATE, allowNull: true },

    // Core AI Analysis fields (Qwen2.5-7B-Instruct)
    aiDomain: { type: DataTypes.STRING(100), allowNull: true },
    aiSubDomain: { type: DataTypes.STRING(150), allowNull: true },
    aiSector: { type: DataTypes.STRING(120), allowNull: true },
    aiSeverity: { type: DataTypes.STRING(40), allowNull: true },
    aiConfidence: { type: DataTypes.DECIMAL(6, 4), allowNull: true },
    aiSeverityScore: { type: DataTypes.INTEGER, allowNull: true }, // 1-10
    aiSeverityReason: { type: DataTypes.TEXT, allowNull: true },
    aiAffectedPopulation: { type: DataTypes.STRING(255), allowNull: true },
    aiRequiredExpertise: { type: DataTypes.TEXT, allowNull: true },
    aiRequiredTechnology: { type: DataTypes.TEXT, allowNull: true },
    aiRecommendedAction: { type: DataTypes.TEXT, allowNull: true },
    aiKeywords: { type: DataTypes.TEXT, allowNull: true },
    aiEvidenceRequirements: { type: DataTypes.TEXT, allowNull: true },
    aiReasoning: { type: DataTypes.TEXT, allowNull: true },
    aiRawResponse: { type: DataTypes.TEXT, allowNull: true },
    aiProvider: { type: DataTypes.STRING(60), allowNull: true },
    aiModel: { type: DataTypes.STRING(100), allowNull: true },

    priorityScore: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    priorityLevel: { type: DataTypes.STRING(30), allowNull: true },
    priorityBreakdown: { type: DataTypes.TEXT, allowNull: true },
    duplicateOf: { type: DataTypes.STRING(30), allowNull: true },
    duplicateSimilarity: { type: DataTypes.DECIMAL(6, 4), allowNull: true },
    aiInputValidation: { type: DataTypes.TEXT, allowNull: true },
    aiProcessedAt: { type: DataTypes.DATE, allowNull: true },
    isPrototypeSampleData: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: "problems", timestamps: true }
);
