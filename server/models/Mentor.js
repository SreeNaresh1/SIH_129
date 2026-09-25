const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Mentor", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  facultyId: { type: DataTypes.INTEGER, allowNull: false },
  assignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(40), defaultValue: "Active" }
}, { tableName: "mentors", timestamps: true });
