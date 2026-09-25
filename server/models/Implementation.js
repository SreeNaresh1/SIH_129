const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Implementation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    plan: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    beneficiaries: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Planned"
    },

    evidenceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    /* =====================================================
       GOVERNMENT IMPLEMENTATION REVIEW
    ===================================================== */

    governmentReviewStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
    },

    governmentReviewComment: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    governmentReviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    governmentReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "implementations",
    timestamps: true
  }
);