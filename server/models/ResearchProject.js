const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("ResearchProject", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  universityId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  researchArea: { type: DataTypes.STRING(150), allowNull: true },
  abstract: { type: DataTypes.TEXT, allowNull: true },
  leadFacultyId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING(60), defaultValue: "Proposed" }
}, { tableName: "research_projects", timestamps: true });
