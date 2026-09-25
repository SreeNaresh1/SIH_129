const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

const ProjectCompletion = sequelize.define(
  "ProjectCompletion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    completionTitle: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    workCompleted: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    finalResults: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    challenges: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    beneficiaries: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    finalImpact: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    completionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Project Completed"
    }
  },
  {
    tableName: "project_completions",
    timestamps: true
  }
);

module.exports = ProjectCompletion;