const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    studentName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    department: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    role: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Member"
    }
  },
  {
    tableName: "team_members",
    timestamps: true
  }
);

module.exports = TeamMember;