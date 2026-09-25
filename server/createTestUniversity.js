const bcrypt = require("bcryptjs");

const { sequelize } = require("./config/database");
const User = require("./models/User");
const University = require("./models/University");

async function createTestUniversity() {
  try {
    console.log("Connecting to database...");

    await sequelize.authenticate();

    console.log("Database connected.");

    /*
    ========================================================
    FIND UNIVERSITY
    ========================================================
    */

    const university = await University.findByPk(2);

    if (!university) {
      console.error(
        "University ID 2 was not found."
      );

      process.exit(1);
    }

    console.log(
      "University found:",
      university.name
    );


    /*
    ========================================================
    TEST ACCOUNT DETAILS
    ========================================================
    */

    const name = "NIT Jamshedpur University Admin";
    const email = "nitjsr@sihportal.com";
    const password = "University@123";


    /*
    ========================================================
    CHECK EXISTING ACCOUNT
    ========================================================
    */

    let user = await User.findOne({
      where: {
        email
      }
    });


    /*
    ========================================================
    CREATE OR UPDATE ACCOUNT
    ========================================================
    */

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    if (user) {

      console.log(
        "Account already exists. Updating it..."
      );

      await user.update({

        name,

        password:
          hashedPassword,

        role:
          "university",

        organization:
          university.name,

        universityId:
          university.id

      });

    } else {

      console.log(
        "Creating new university account..."
      );

      user = await User.create({

        name,

        email,

        password:
          hashedPassword,

        role:
          "university",

        organization:
          university.name,

        universityId:
          university.id

      });

    }


    /*
    ========================================================
    SUCCESS
    ========================================================
    */

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "UNIVERSITY ACCOUNT READY"
    );
    console.log(
      "=========================================="
    );

    console.log(
      "Name:",
      user.name
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Password:",
      password
    );

    console.log(
      "Role:",
      user.role
    );

    console.log(
      "University ID:",
      user.universityId
    );

    console.log(
      "University:",
      university.name
    );

    console.log(
      "=========================================="
    );

  } catch (error) {

    console.error(
      "ERROR CREATING UNIVERSITY ACCOUNT:"
    );

    console.error(error);

  } finally {

    await sequelize.close();

  }
}


createTestUniversity();