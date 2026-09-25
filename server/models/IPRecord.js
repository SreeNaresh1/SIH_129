const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("IPRecord", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(60), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.STRING(60), defaultValue: "Draft" },
  filingNumber: { type: DataTypes.STRING(120), allowNull: true },
  filingDate: { type: DataTypes.DATE, allowNull: true },
  owner: { type: DataTypes.STRING(200), allowNull: true },
  technologyTransferStatus: { type: DataTypes.STRING(80), defaultValue: "Not Started" }
}, { tableName: "ip_records", timestamps: true });
