const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  problemId: { type: DataTypes.STRING(30), allowNull: false },
  reviewerId: { type: DataTypes.INTEGER, allowNull: false },
  decision: { type: DataTypes.STRING(50), allowNull: false },
  comments: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "reviews", timestamps: true });
