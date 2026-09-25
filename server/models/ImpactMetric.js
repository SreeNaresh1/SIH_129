const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("ImpactMetric", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  metricName: { type: DataTypes.STRING(150), allowNull: false },
  baselineValue: { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  targetValue: { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  actualValue: { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  unit: { type: DataTypes.STRING(50), allowNull: true },
  evidence: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "impact_metrics", timestamps: true });
