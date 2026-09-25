const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define("UniversityExpertise", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  universityId: { type: DataTypes.INTEGER, allowNull: false },
  domain: { type: DataTypes.STRING(100), allowNull: false },
  subDomain: { type: DataTypes.STRING(150), allowNull: true },
  expertiseLevel: { type: DataTypes.INTEGER, defaultValue: 3 },
  keywords: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "university_expertise", timestamps: true });
