const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "NGO",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    domain: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    focusAreas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    districts: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fieldReach: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    keyProjects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPrototypeSampleData: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "ngos",
    timestamps: true,
  }
);
