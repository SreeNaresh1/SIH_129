const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "WorkflowPipeline",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pipelineId: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    serviceCategory: { type: DataTypes.STRING(100), allowNull: false }, // e.g. "Apprenticeship Grant", "Citizen Grievance Redressal", "Caste & Scholarship InterOp"
    participatingPortals: { type: DataTypes.TEXT, allowNull: false }, // JSON array of portals e.g. ["MahaSwayam", "MahaDBT", "Aaple Sarkar"]
    stepsConfiguration: { type: DataTypes.TEXT, allowNull: false }, // JSON array of workflow steps with auto-actions, SLAs, conditions
    activeInstancesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    avgCompletionHours: { type: DataTypes.DECIMAL(6, 2), defaultValue: 4.5 },
    slaTargetHours: { type: DataTypes.INTEGER, defaultValue: 24 },
    slaComplianceRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 96.8 },
    status: { type: DataTypes.STRING(30), defaultValue: "ACTIVE" }, // ACTIVE, PAUSED, DRAFT
    triggerEventType: { type: DataTypes.STRING(100), defaultValue: "ON_APPLICATION_SUBMITTED" }
  },
  { tableName: "workflow_pipelines", timestamps: true }
);
