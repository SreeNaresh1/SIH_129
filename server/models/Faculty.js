const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Faculty", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  universityId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: true },
  department: { type: DataTypes.STRING(150), allowNull: true },
  expertise: { type: DataTypes.TEXT, allowNull: true },
  available: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: "faculty", timestamps: true });
