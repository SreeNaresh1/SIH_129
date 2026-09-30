const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM(
        "citizen",
        "government",
        "admin"
      ),
      allowNull: false,
      defaultValue: "citizen"
    },

    organization: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ""
    },

    universityId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "users",
    timestamps: true
  }
);

module.exports = User;