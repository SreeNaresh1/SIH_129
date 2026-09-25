const express = require("express");

const router = express.Router();

const User = require("../models/User");
const IndustryPartner = require("../models/IndustryPartner");
const Project = require("../models/Project");
const Problem = require("../models/Problem");
const University = require("../models/University");
const Proposal = require("../models/Proposal");
const Collaboration = require("../models/Collaboration");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/authMiddleware");


/*
=========================================================
HELPER
GET CURRENT INDUSTRY PARTNER
=========================================================
*/

async function getCurrentIndustryPartner(userId) {

  const partner = await IndustryPartner.findOne({
    where: {
      userId,
      active: true
    }
  });

  return partner || null;
}


/*
=========================================================
INDUSTRY PROFILE
GET CURRENT INDUSTRY PROFILE
=========================================================
*/

router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Industry user not found."
        });
      }

      let partner = await IndustryPartner.findOne({
        where: {
          userId: req.user.id
        }
      });

      /*
      -------------------------------------------------------
      IF INDUSTRY ACCOUNT EXISTS BUT PROFILE ROW DOES NOT
      CREATE THE PROFILE AUTOMATICALLY
      -------------------------------------------------------
      */

      if (!partner) {

        partner = await IndustryPartner.create({
          userId: user.id,
          organization:
            user.organization ||
            user.name ||
            "Industry Organization",
          sector: "",
          expertise: "",
          csrBudget: 0,
          contactEmail: user.email,
          active: true
        });

      }

      return res.json({

        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization
        },

        partner

      });

    } catch (error) {

      console.error(
        "Industry profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load Industry profile."
      });

    }

  }
);


/*
=========================================================
INDUSTRY PROFILE
UPDATE CURRENT INDUSTRY PROFILE
=========================================================
*/

router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const {
        organization,
        sector,
        expertise,
        csrBudget,
        contactEmail
      } = req.body;

      if (
        !organization ||
        !String(organization).trim()
      ) {

        return res.status(400).json({
          success: false,
          message: "Organization is required."
        });

      }

      let partner = await IndustryPartner.findOne({
        where: {
          userId: req.user.id
        }
      });

      if (!partner) {

        partner = await IndustryPartner.create({

          userId: req.user.id,

          organization:
            String(organization).trim(),

          sector:
            sector
              ? String(sector).trim()
              : "",

          expertise:
            expertise
              ? String(expertise).trim()
              : "",

          csrBudget:
            csrBudget !== undefined &&
            csrBudget !== ""
              ? Number(csrBudget)
              : 0,

          contactEmail:
            contactEmail
              ? String(contactEmail).trim()
              : "",

          active: true

        });

      } else {

        await partner.update({

          organization:
            String(organization).trim(),

          sector:
            sector
              ? String(sector).trim()
              : "",

          expertise:
            expertise
              ? String(expertise).trim()
              : "",

          csrBudget:
            csrBudget !== undefined &&
            csrBudget !== ""
              ? Number(csrBudget)
              : 0,

          contactEmail:
            contactEmail
              ? String(contactEmail).trim()
              : ""

        });

      }


      /*
      -------------------------------------------------------
      ALSO UPDATE USER ORGANIZATION
      -------------------------------------------------------
      */

      const user = await User.findByPk(req.user.id);

      if (user) {

        await user.update({
          organization:
            String(organization).trim()
        });

      }


      return res.json({

        success: true,

        message:
          "Industry profile updated successfully.",

        partner

      });

    } catch (error) {

      console.error(
        "Industry profile update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update Industry profile."
      });

    }

  }
);


/*
=========================================================
INDUSTRY NETWORK
ALL INDUSTRIES CAN SEE THE COMMON INDUSTRY DIRECTORY
=========================================================
*/

router.get(
  "/network",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const partners =
        await IndustryPartner.findAll({

          where: {
            active: true
          },

          order: [
            ["organization", "ASC"]
          ]

        });


      const currentPartner =
        await IndustryPartner.findOne({

          where: {
            userId: req.user.id
          }

        });


      return res.json({

        success: true,

        currentIndustry:
          currentPartner,

        partners

      });

    } catch (error) {

      console.error(
        "Industry network error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load Industry Network."

      });

    }

  }
);


/*
=========================================================
MY ASSIGNED PROJECTS
ONLY PROJECTS ASSIGNED TO CURRENT INDUSTRY
=========================================================
*/

router.get(
  "/projects",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.json({

          success: true,

          industry: null,

          projects: []

        });

      }


      const projects =
        await Project.findAll({

          where: {

            industryPartnerId:
              partner.id

          },

          order: [
            ["createdAt", "DESC"]
          ]

        });


      const result = [];


      for (
        const project of projects
      ) {

        const problem =
          await Problem.findOne({

            where: {

              problemId:
                project.problemId

            }

          });


        let university = null;


        if (
          project.universityId
        ) {

          university =
            await University.findByPk(
              project.universityId
            );

        }


        result.push({

          ...project.toJSON(),

          problem:
            problem
              ? problem.toJSON()
              : null,

          university:
            university
              ? {

                  id:
                    university.id,

                  name:
                    university.name,

                  code:
                    university.code,

                  city:
                    university.city,

                  district:
                    university.district,

                  state:
                    university.state

                }
              : null

        });

      }


      return res.json({

        success: true,

        industry: partner,

        count:
          result.length,

        projects:
          result

      });

    } catch (error) {

      console.error(
        "Industry projects error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load Industry projects."

      });

    }

  }
);


/*
=========================================================
GET ONE INDUSTRY PROJECT
ONLY CURRENT INDUSTRY CAN OPEN IT
=========================================================
*/

router.get(
  "/projects/:projectId",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.status(403).json({

          success: false,

          message:
            "Industry profile not found."

        });

      }


      const project =
        await Project.findByPk(
          req.params.projectId
        );


      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found."

        });

      }


      /*
      -------------------------------------------------------
      PRIVATE INDUSTRY CHECK
      -------------------------------------------------------
      */

      if (
        Number(
          project.industryPartnerId
        ) !==
        Number(
          partner.id
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "This project is not assigned to your Industry account."

        });

      }


      const problem =
        await Problem.findOne({

          where: {

            problemId:
              project.problemId

          }

        });


      let university = null;


      if (
        project.universityId
      ) {

        university =
          await University.findByPk(
            project.universityId
          );

      }


      return res.json({

        success: true,

        project,

        problem,

        university

      });

    } catch (error) {

      console.error(
        "Industry project details error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load Industry project."

      });

    }

  }
);


/*
=========================================================
INDUSTRY PROPOSALS FOR CURRENT INDUSTRY PROJECT
=========================================================
*/

router.get(
  "/projects/:projectId/proposals",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.status(403).json({

          success: false,

          message:
            "Industry profile not found."

        });

      }


      const project =
        await Project.findByPk(
          req.params.projectId
        );


      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found."

        });

      }


      if (
        Number(
          project.industryPartnerId
        ) !==
        Number(
          partner.id
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "This project is not assigned to your Industry account."

        });

      }


      const proposals =
        await Proposal.findAll({

          where: {

            projectId:
              project.id,

            submittedByRole:
              "industry"

          },

          order: [
            ["createdAt", "DESC"]
          ]

        });


      return res.json({

        success: true,

        project,

        proposals

      });

    } catch (error) {

      console.error(
        "Industry proposals error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load Industry proposals."

      });

    }

  }
);


/*
=========================================================
INDUSTRY SUBMIT SOLUTION PROPOSAL
=========================================================
*/

router.post(
  "/projects/:projectId/proposals",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const {
        title,
        solution,
        methodology,
        expectedImpact,
        budget
      } = req.body;


      if (
        !title ||
        !String(title).trim() ||
        !solution ||
        !String(solution).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Proposal title and solution are required."

        });

      }


      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.status(403).json({

          success: false,

          message:
            "Industry profile not found."

        });

      }


      const project =
        await Project.findByPk(
          req.params.projectId
        );


      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found."

        });

      }


      /*
      -------------------------------------------------------
      PRIVATE INDUSTRY CHECK
      -------------------------------------------------------
      */

      if (
        Number(
          project.industryPartnerId
        ) !==
        Number(
          partner.id
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "This project is not assigned to your Industry account."

        });

      }


      const problem =
        await Problem.findOne({

          where: {

            problemId:
              project.problemId

          }

        });


      if (!problem) {

        return res.status(404).json({

          success: false,

          message:
            "Problem not found."

        });

      }


      /*
      -------------------------------------------------------
      UNIVERSITY PROPOSAL MUST BE APPROVED
      -------------------------------------------------------
      */

      const universityProposal =
        await Proposal.findOne({

          where: {

            projectId:
              project.id,

            submittedByRole:
              "university"

          },

          order: [
            ["createdAt", "DESC"]
          ]

        });


      if (
        !universityProposal ||
        universityProposal.governmentReviewStatus !==
          "Approved"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Government must approve the University Solution Proposal before Industry can submit its proposal."

        });

      }


      /*
      -------------------------------------------------------
      FIND EXISTING INDUSTRY PROPOSAL
      -------------------------------------------------------
      */

      let proposal =
        await Proposal.findOne({

          where: {

            projectId:
              project.id,

            submittedByRole:
              "industry"

          },

          order: [
            ["createdAt", "DESC"]
          ]

        });


      if (
        proposal &&
        proposal.governmentReviewStatus ===
          "Approved"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This Industry Solution Proposal has already been approved."

        });

      }


      if (
        proposal &&
        proposal.governmentReviewStatus !==
          "Changes Requested"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This Industry Solution Proposal is already waiting for Government review."

        });

      }


      const data = {

        projectId:
          project.id,

        title:
          String(title).trim(),

        solution:
          String(solution).trim(),

        methodology:
          methodology
            ? String(methodology).trim()
            : null,

        expectedImpact:
          expectedImpact
            ? String(expectedImpact).trim()
            : null,

        budget:
          budget !== undefined &&
          budget !== ""
            ? Number(budget)
            : 0,

        status:
          "Submitted",

        submittedAt:
          new Date(),

        submittedByRole:
          "industry",

        governmentReviewStatus:
          null,

        governmentReviewComment:
          null,

        governmentReviewedBy:
          null,

        governmentReviewedAt:
          null

      };


      if (proposal) {

        await proposal.update(data);

      } else {

        proposal =
          await Proposal.create(data);

      }


      await project.update({

        status:
          "Industry Proposal Submitted",

        progressPercent:
          Math.max(
            Number(
              project.progressPercent || 0
            ),
            35
          )

      });


      await problem.update({

        projectStatus:
          "Industry Proposal Submitted"

      });


      return res.status(201).json({

        success: true,

        message:
          "Industry Solution Proposal submitted successfully.",

        proposal,

        project,

        problem

      });

    } catch (error) {

      console.error(
        "Industry proposal submission error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to submit Industry Solution Proposal.",

        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined

      });

    }

  }
);


/*
=========================================================
COLLABORATIONS
GET CURRENT INDUSTRY COLLABORATIONS
=========================================================
*/

router.get(
  "/collaborations",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.json({

          success: true,

          collaborations: []

        });

      }


      const collaborations =
        await Collaboration.findAll({

          where: {

            industryPartnerId:
              partner.id

          },

          order: [
            ["createdAt", "DESC"]
          ]

        });


      return res.json({

        success: true,

        collaborations

      });

    } catch (error) {

      console.error(
        "Industry collaborations error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load collaborations."

      });

    }

  }
);


/*
=========================================================
CREATE COLLABORATION
CURRENT INDUSTRY ID IS TAKEN FROM LOGIN
NOT FROM FRONTEND
=========================================================
*/

router.post(
  "/collaborations",
  authenticateToken,
  authorizeRoles("industry"),
  async (req, res) => {

    try {

      const {
        projectId,
        type,
        scope
      } = req.body;


      if (!projectId) {

        return res.status(400).json({

          success: false,

          message:
            "projectId is required."

        });

      }


      const partner =
        await getCurrentIndustryPartner(
          req.user.id
        );


      if (!partner) {

        return res.status(403).json({

          success: false,

          message:
            "Industry profile not found."

        });

      }


      const project =
        await Project.findByPk(
          projectId
        );


      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found."

        });

      }


      /*
      -------------------------------------------------------
      INDUSTRY CANNOT PRETEND TO BE ANOTHER INDUSTRY
      -------------------------------------------------------
      */

      const collaboration =
        await Collaboration.create({

          projectId:
            project.id,

          industryPartnerId:
            partner.id,

          type:
            type
              ? String(type).trim()
              : "Industry Collaboration",

          scope:
            scope
              ? String(scope).trim()
              : "",

          status:
            "Proposed"

        });


      return res.status(201).json({

        success: true,

        message:
          "Collaboration request created successfully.",

        collaboration

      });

    } catch (error) {

      console.error(
        "Create industry collaboration error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to create collaboration."

      });

    }

  }
);


/*
=========================================================
EXPORT
=========================================================
*/

module.exports = router;