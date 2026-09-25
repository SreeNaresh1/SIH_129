const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Project", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  problemId: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  universityId: { type: DataTypes.INTEGER, allowNull: true },
  industryPartnerId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING(60), defaultValue: "Assigned" },
  startDate: { type: DataTypes.DATE, allowNull: true },
  targetDate: { type: DataTypes.DATE, allowNull: true },
  completionDate: { type: DataTypes.DATE, allowNull: true },
  progressPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
  budget: { type: DataTypes.DECIMAL(14,2), defaultValue: 0 },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "projects", timestamps: true });
