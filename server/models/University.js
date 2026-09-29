const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("University", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  code: { type: DataTypes.STRING(50), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  district: { type: DataTypes.STRING(100), allowNull: true },
  state: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "Maharashtra" },
  website: { type: DataTypes.STRING(300), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  contactEmail: { type: DataTypes.STRING(150), allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: "universities", timestamps: true });
