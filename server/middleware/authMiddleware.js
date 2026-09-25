const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// JWT SECRET
// ============================================================
//
// IMPORTANT:
// The same secret must be used by auth.js when creating
// the JWT and here when verifying the JWT.
//
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "sih_portal_secret_key";


// ============================================================
// AUTHENTICATE JWT TOKEN
// ============================================================

const authenticateToken = async (req, res, next) => {
  try {
    // --------------------------------------------------------
    // Get Authorization header
    // --------------------------------------------------------

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      console.log(
        "AUTH ERROR: Authorization header missing."
      );

      return res.status(401).json({
        success: false,
        message:
          "Access token required.",
      });
    }


    // --------------------------------------------------------
    // Validate Bearer token format
    // --------------------------------------------------------

    const parts =
      authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      console.log(
        "AUTH ERROR: Invalid authorization format."
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format.",
      });
    }


    const token = parts[1];


    // --------------------------------------------------------
    // Verify JWT
    // --------------------------------------------------------

    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );
    } catch (jwtError) {
      console.log(
        "JWT VERIFICATION ERROR:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired token.",
      });
    }


    // --------------------------------------------------------
    // Validate decoded token
    // --------------------------------------------------------

    if (
      !decoded ||
      !decoded.id
    ) {
      console.log(
        "AUTH ERROR: JWT does not contain user ID."
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }


    // ========================================================
    // GET ACTUAL USER FROM DATABASE
    // ========================================================
    //
    // We do NOT trust only the role stored inside JWT.
    //
    // We use the user ID from the JWT and retrieve the
    // current role directly from MySQL.
    //
    // ========================================================

    const user =
      await User.findByPk(
        decoded.id
      );


    // --------------------------------------------------------
    // User does not exist
    // --------------------------------------------------------

    if (!user) {
      console.log(
        "AUTH ERROR: User not found.",
        decoded.id
      );

      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists.",
      });
    }


    // ========================================================
    // NORMALIZE USER ROLE
    // ========================================================

    const userRole =
      String(
        user.role || ""
      )
        .trim()
        .toLowerCase();


    // --------------------------------------------------------
    // Make sure role exists
    // --------------------------------------------------------

    if (!userRole) {
      console.log(
        "AUTH ERROR: User has no role.",
        user.id
      );

      return res.status(403).json({
        success: false,
        message:
          "User account does not have a valid role.",
      });
    }


    // ========================================================
    // CREATE req.user
    // ========================================================

    req.user = {
      id: user.id,

      email:
        user.email,

      name:
        user.name,

      role:
        userRole,

      organization:
        user.organization || "",

      universityId:
        user.universityId || null,
    };


    // ========================================================
    // DEBUG INFORMATION
    // ========================================================

    console.log(
      "================================================"
    );

    console.log(
      "AUTHENTICATED USER"
    );

    console.log(
      "User ID:",
      req.user.id
    );

    console.log(
      "User Email:",
      req.user.email
    );

    console.log(
      "User Name:",
      req.user.name
    );

    console.log(
      "User Role:",
      req.user.role
    );

    console.log(
      "Organization:",
      req.user.organization
    );

    console.log(
      "University ID:",
      req.user.universityId
    );

    console.log(
      "================================================"
    );


    // --------------------------------------------------------
    // Continue request
    // --------------------------------------------------------

    next();

  } catch (error) {

    console.error(
      "AUTHENTICATION MIDDLEWARE ERROR:"
    );

    console.error(
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication service error.",
    });
  }
};


// ============================================================
// AUTHORIZE USER ROLES
// ============================================================

const authorizeRoles = (...allowedRoles) => {

  return (req, res, next) => {

    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
      "================================================"
    );

    console.log(
      "ROLE AUTHORIZATION CHECK"
    );

    console.log(
      "Authenticated User:",
      req.user
    );

    console.log(
      "Allowed Roles:",
      allowedRoles
    );

    console.log(
      "================================================"
    );


    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user) {

      console.log(
        "AUTHORIZATION FAILED: No req.user."
      );

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // ========================================================
    // NORMALIZE CURRENT USER ROLE
    // ========================================================

    const userRole =
      String(
        req.user.role || ""
      )
        .trim()
        .toLowerCase();


    // ========================================================
    // NORMALIZE ALLOWED ROLES
    // ========================================================

    const normalizedAllowedRoles =
      allowedRoles.map(
        (role) =>
          String(
            role || ""
          )
            .trim()
            .toLowerCase()
      );


    // ========================================================
    // DEBUG ROLE VALUES
    // ========================================================

    console.log(
      "User Role:",
      userRole
    );

    console.log(
      "Allowed Roles:",
      normalizedAllowedRoles
    );


    // ========================================================
    // CHECK ROLE
    // ========================================================

    if (
      !normalizedAllowedRoles.includes(
        userRole
      )
    ) {

      console.log(
        "================================================"
      );

      console.log(
        "AUTHORIZATION DENIED"
      );

      console.log(
        "User ID:",
        req.user.id
      );

      console.log(
        "User Email:",
        req.user.email
      );

      console.log(
        "Actual Role:",
        userRole
      );

      console.log(
        "Allowed Roles:",
        normalizedAllowedRoles
      );

      console.log(
        "================================================"
      );


      return res.status(403).json({
        success: false,

        message:
          "You are not authorized to access this resource.",

        debugRole:
          userRole,

        debugAllowedRoles:
          normalizedAllowedRoles,
      });
    }


    // ========================================================
    // AUTHORIZATION SUCCESS
    // ========================================================

    console.log(
      "AUTHORIZATION SUCCESS"
    );

    console.log(
      "User:",
      req.user.email
    );

    console.log(
      "Role:",
      userRole
    );


    next();
  };
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  authenticateToken,
  authorizeRoles,
};