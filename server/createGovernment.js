require("dotenv").config();

const bcrypt = require("bcryptjs");

const { sequelize } = require("./config/database");
const User = require("./models/User");

async function createGovernmentAccount() {
  try {
    await sequelize.authenticate();

    console.log("Database connected.");

    const email = "government@sihportal.com";
    const password = "Government@123";

    // Check if account already exists
    const existingUser = await User.findOne({
      where: {
        email
      }
    });

    if (existingUser) {
      console.log("Government account already exists.");

      console.log({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });

      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create government account
    const governmentUser = await User.create({
      name: "Government Admin",
      email,
      password: hashedPassword,
      role: "government",
      organization: "Government of Maharashtra"
    });

    console.log("");
    console.log("======================================");
    console.log(" GOVERNMENT ACCOUNT CREATED");
    console.log("======================================");
    console.log("Email:", governmentUser.email);
    console.log("Password:", password);
    console.log("Role:", governmentUser.role);
    console.log("Organization:", governmentUser.organization);
    console.log("======================================");
    console.log("");

    process.exit(0);

  } catch (error) {
    console.error("Error creating government account:");
    console.error(error);

    process.exit(1);
  }
}

createGovernmentAccount();