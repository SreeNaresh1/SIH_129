const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Proposal",
  {
    /* =====================================================
       PRIMARY KEY
    ===================================================== */

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },


    /* =====================================================
       PROJECT
    ===================================================== */

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    /* =====================================================
       COMMON PROPOSAL INFORMATION
       
       These fields continue to support the existing
       University Solution Proposal workflow.
    ===================================================== */

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    solution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    methodology: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    expectedImpact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    budget: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
    },


    /* =====================================================
       PROPOSAL STATUS
    ===================================================== */

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Draft",
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },


    /* =====================================================
       PROPOSAL SUBMITTED BY
       
       university = University Solution Proposal
       industry   = Industry Implementation Proposal
    ===================================================== */

    submittedByRole: {
      type: DataTypes.ENUM(
        "university",
        "industry"
      ),
      allowNull: true,
      defaultValue: "university",
    },


    /* =====================================================
       INDUSTRY IMPLEMENTATION PROPOSAL

       These fields are used ONLY when:

       submittedByRole = "industry"

       Industry does NOT create another societal solution.

       Industry explains how it will implement, deploy,
       scale and support the already Government-approved
       University solution.
    ===================================================== */

    implementationPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    industryResources: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deploymentPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    implementationTimeline: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    infrastructureTechnology: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    industryContribution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },


    /* =====================================================
       GOVERNMENT REVIEW
    ===================================================== */

    governmentReviewStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },

    governmentReviewComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    governmentReviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    governmentReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "proposals",
    timestamps: true,
  }
);