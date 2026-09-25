const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("StudentTeam", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  leadUserId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING(40), defaultValue: "Active" }
}, { tableName: "student_teams", timestamps: true });
