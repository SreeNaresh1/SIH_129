const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "GovernmentDepartment",
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    domain: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    subDomains: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jurisdiction: {
      type: DataTypes.STRING(150),
      defaultValue: "Jharkhand Statewide",
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "All Districts",
    },
    keyResponsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    nodalOfficer: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    schemes: {
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
    tableName: "government_departments",
    timestamps: true,
  }
);
