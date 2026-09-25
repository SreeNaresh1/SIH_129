const bcrypt = require("bcryptjs");

const User = require("./models/User");
const IndustryPartner = require("./models/IndustryPartner");

const { sequelize } = require("./config/database");


/*
============================================================
CREATE INDUSTRY ACCOUNTS
============================================================

This script creates multiple Industry accounts.

Industry accounts are independent participants.

Government does NOT create these accounts.

Each Industry gets:

1. User account
2. IndustryPartner profile

All Industry accounts use the same /industry portal.

============================================================
*/


const industries = [

  {
    name: "Industry Admin 1",
    email: "industry1@sihportal.com",
    password: "Industry@123",
    organization: "Tata Technologies",
    sector: "Information Technology",
    expertise:
      "Artificial Intelligence, Software Development, Digital Transformation",
    contactEmail: "industry1@sihportal.com",
  },

  {
    name: "Industry Admin 2",
    email: "industry2@sihportal.com",
    password: "Industry@123",
    organization: "Tata Steel",
    sector: "Manufacturing",
    expertise:
      "Steel Manufacturing, Industrial Automation, Smart Manufacturing",
    contactEmail: "industry2@sihportal.com",
  },

  {
    name: "Industry Admin 3",
    email: "industry3@sihportal.com",
    password: "Industry@123",
    organization: "Tech Mahindra",
    sector: "Information Technology",
    expertise:
      "Cloud Computing, AI, Cybersecurity, Software Engineering",
    contactEmail: "industry3@sihportal.com",
  },

  {
    name: "Industry Admin 4",
    email: "industry4@sihportal.com",
    password: "Industry@123",
    organization: "Larsen & Toubro",
    sector: "Engineering",
    expertise:
      "Infrastructure, Engineering, Construction Technology, Smart Cities",
    contactEmail: "industry4@sihportal.com",
  },

  {
    name: "Industry Admin 5",
    email: "industry5@sihportal.com",
    password: "Industry@123",
    organization: "Reliance Industries",
    sector: "Energy & Technology",
    expertise:
      "Energy, Digital Services, Telecommunications, Sustainability",
    contactEmail: "industry5@sihportal.com",
  }

];


async function createIndustryAccounts() {

  try {

    console.log("");
    console.log("==========================================");
    console.log("CREATING INDUSTRY ACCOUNTS");
    console.log("==========================================");


    /*
    --------------------------------------------------------
    CONNECT DATABASE
    --------------------------------------------------------
    */

    await sequelize.authenticate();

    console.log(
      "Database connection successful."
    );


    /*
    --------------------------------------------------------
    CREATE EACH INDUSTRY
    --------------------------------------------------------
    */

    for (
      const industry of industries
    ) {

      console.log("");
      console.log(
        "Processing:",
        industry.organization
      );


      /*
      ------------------------------------------------------
      CHECK EXISTING USER
      ------------------------------------------------------
      */

      let user =
        await User.findOne({

          where: {
            email:
              industry.email
          }

        });


      /*
      ------------------------------------------------------
      CREATE USER IF NOT EXISTS
      ------------------------------------------------------
      */

      if (!user) {

        const hashedPassword =
          await bcrypt.hash(
            industry.password,
            12
          );


        user =
          await User.create({

            name:
              industry.name,

            email:
              industry.email,

            password:
              hashedPassword,

            role:
              "industry",

            organization:
              industry.organization,

            universityId:
              null

          });


        console.log(
          "✓ Industry user created:",
          industry.email
        );

      } else {

        console.log(
          "✓ Industry user already exists:",
          industry.email
        );


        /*
        ------------------------------------------------------
        MAKE SURE ROLE IS INDUSTRY
        ------------------------------------------------------
        */

        if (
          user.role !==
          "industry"
        ) {

          user.role =
            "industry";

          user.organization =
            industry.organization;

          await user.save();

          console.log(
            "✓ Existing user converted to Industry role."
          );

        }

      }


      /*
      --------------------------------------------------------
      FIND INDUSTRY PARTNER
      --------------------------------------------------------
      */

      let partner =
        await IndustryPartner.findOne({

          where: {
            userId:
              user.id
          }

        });


      /*
      --------------------------------------------------------
      CREATE INDUSTRY PARTNER
      --------------------------------------------------------
      */

      if (!partner) {

        partner =
          await IndustryPartner.create({

            userId:
              user.id,

            organization:
              industry.organization,

            sector:
              industry.sector,

            expertise:
              industry.expertise,

            csrBudget:
              0,

            contactEmail:
              industry.contactEmail,

            active:
              true

          });


        console.log(
          "✓ Industry partner profile created."
        );

      } else {

        /*
        ------------------------------------------------------
        UPDATE PROFILE INFORMATION
        ------------------------------------------------------
        */

        partner.organization =
          industry.organization;

        partner.sector =
          industry.sector;

        partner.expertise =
          industry.expertise;

        partner.contactEmail =
          industry.contactEmail;

        partner.active =
          true;

        await partner.save();


        console.log(
          "✓ Industry partner profile already exists."
        );

      }

    }


    /*
    --------------------------------------------------------
    FINAL OUTPUT
    --------------------------------------------------------
    */

    console.log("");
    console.log("==========================================");
    console.log("INDUSTRY ACCOUNTS READY");
    console.log("==========================================");

    console.log("");

    console.log(
      "Industry 1:"
    );

    console.log(
      "Email: industry1@sihportal.com"
    );

    console.log(
      "Password: Industry@123"
    );

    console.log("");

    console.log(
      "Industry 2:"
    );

    console.log(
      "Email: industry2@sihportal.com"
    );

    console.log(
      "Password: Industry@123"
    );

    console.log("");

    console.log(
      "Industry 3:"
    );

    console.log(
      "Email: industry3@sihportal.com"
    );

    console.log(
      "Password: Industry@123"
    );

    console.log("");

    console.log(
      "Industry 4:"
    );

    console.log(
      "Email: industry4@sihportal.com"
    );

    console.log(
      "Password: Industry@123"
    );

    console.log("");

    console.log(
      "Industry 5:"
    );

    console.log(
      "Email: industry5@sihportal.com"
    );

    console.log(
      "Password: Industry@123"
    );

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      "All Industry accounts are ready."
    );

    console.log(
      "=========================================="
    );


  } catch (error) {

    console.error("");
    console.error(
      "=========================================="
    );

    console.error(
      "INDUSTRY ACCOUNT CREATION ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      error
    );

  } finally {

    await sequelize.close();

  }

}


/*
============================================================
RUN
============================================================
*/

createIndustryAccounts();