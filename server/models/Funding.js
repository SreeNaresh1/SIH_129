const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Funding", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  industryPartnerId: { type: DataTypes.INTEGER, allowNull: true },
  amount: { type: DataTypes.DECIMAL(14,2), allowNull: false },
  purpose: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(50), defaultValue: "Proposed" },
  approvedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: "funding", timestamps: true });
