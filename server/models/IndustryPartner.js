const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "IndustryPartner",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    organization: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    sector: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    expertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    csrBudget: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
    },

    contactEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "industry_partners",
    timestamps: true,
  }
);