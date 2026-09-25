const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Collaboration",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    industryPartnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Proposed",
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "collaborations",
    timestamps: true,
  }
);