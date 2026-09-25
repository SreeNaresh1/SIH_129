const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PrototypeTest = sequelize.define(
  "PrototypeTest",
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

    testName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    testDate: {
      type: DataTypes.DATE,
      allowNull: true
    },

    sampleSize: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    /*
    =========================================================
    PROTOTYPE TEST RESULT
    =========================================================
    */

    result: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Pending"
    },

    findings: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    evidenceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    /*
    =========================================================
    GOVERNMENT REVIEW
    =========================================================

    Government can review the prototype after the
    university submits the testing information.
    =========================================================
    */

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
    tableName: "prototype_tests",
    timestamps: true
  }
);

module.exports = PrototypeTest;