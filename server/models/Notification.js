const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING(60), defaultValue: "system" },
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  link: { type: DataTypes.STRING(300), allowNull: true },
  readAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: "notifications", timestamps: true });
