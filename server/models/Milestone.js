const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Milestone", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(50), defaultValue: "Pending" },
  progressPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
  completedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: "milestones", timestamps: true });
