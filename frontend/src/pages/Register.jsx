import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "citizen",
    organization: "",
    organizationType: "Individual",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;


    /*
    ========================================================
    PUBLIC REGISTRATION
    ========================================================

    ONLY CITIZEN CAN REGISTER PUBLICLY.

    Industry accounts are PRIVATE and will be created
    by Government administration.

    University accounts are created by Government.

    Government accounts are administrator controlled.
    ========================================================
    */

    const role = "citizen";


    /*
    ========================================================
    VALIDATION
    ========================================================
    */

    if (!name) {
      setError("Please enter your full name.");
      return;
    }


    if (!email) {
      setError("Please enter your email address.");
      return;
    }


    if (!password) {
      setError("Please enter a password.");
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }


    if (password !== confirmPassword) {
      setError(
        "Password and Confirm Password do not match."
      );
      return;
    }


    /*
    ========================================================
    START REGISTRATION
    ========================================================
    */

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
            role,
            organization: formData.organizationType || "Individual",
          }),
        }
      );


      /*
      ========================================================
      SAFELY READ SERVER RESPONSE
      ========================================================
      */

      const contentType =
        response.headers.get("content-type") || "";

      let data = {};


      if (
        contentType.includes("application/json")
      ) {

        data = await response.json();

      } else {

        const text = await response.text();

        console.error(
          "Server returned non-JSON response:",
          text
        );

        throw new Error(
          "The SIH backend returned an invalid response. Make sure the backend is running on port 5000."
        );

      }


      /*
      ========================================================
      BACKEND ERROR
      ========================================================
      */

      if (!response.ok) {

        setError(
          data.message ||
          "Registration failed. Please try again."
        );

        return;

      }


      /*
      ========================================================
      REGISTRATION SUCCESS
      ========================================================
      */

      setSuccess(
        "Citizen account created successfully. Redirecting to login..."
      );


      /*
      Do not automatically create a token.
      The user must login using the real account.
      */

      setTimeout(() => {

        navigate(
          "/login",
          {
            replace: true,

            state: {
              registered: true,
              email,
            },
          }
        );

      }, 1200);


    } catch (err) {

      console.error(
        "Registration error:",
        err
      );


      setError(
        err.message ||
        "Unable to connect to the SIH backend. Please make sure the backend is running."
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >


      {/* ====================================================
          BACK TO HOME
      ==================================================== */}

      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          color: "#475569",
        }}
      >
        ← Back to Home
      </button>


      {/* ====================================================
          REGISTER CARD
      ==================================================== */}

      <div
        className="login-card"
        style={{
          maxWidth: "520px",
          width: "100%",
        }}
      >


        {/* LOGO */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              background: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
            }}
          >
            SI
          </div>

        </div>


        {/* HEADER */}

        <div className="login-header">

          <h1>
            Create Your Account
          </h1>

          <p>
            Join the Societal Innovation Portal
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            ❌ {error}
          </div>

        )}


        {/* SUCCESS */}

        {success && (

          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            ✅ {success}
          </div>

        )}


        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleSubmit}>


          {/* FULL NAME */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="name"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Full Name *
            </label>


            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />

          </div>


          {/* EMAIL */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Email Address *
            </label>


            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Password *
            </label>


            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Confirm Password *
            </label>


            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

          </div>


          {/* ==================================================
              ACCOUNT TYPE
          ================================================== */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Account Type
            </label>


            <div
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              👤 Citizen
            </div>

          </div>


          {/* ==================================================
              SUBMITTER / ORGANIZATION TYPE
          ================================================== */}

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="organizationType"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600",
              }}
            >
              Submitter Type *
            </label>
            <select
              id="organizationType"
              name="organizationType"
              value={formData.organizationType}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="Individual">👤 Individual Citizen</option>
              <option value="Community Group">👥 Community Group / NGO</option>
              <option value="Panchayati Raj Institution">🏘️ Panchayati Raj Institution (PRI)</option>
              <option value="Urban Local Body">🏙️ Urban Local Body (ULB)</option>
              <option value="Government Department">🏛️ Government Department</option>
            </select>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
              Select the type of organization you represent.
            </p>
          </div>

          {/* ==================================================
              CITIZEN INFORMATION
          ================================================== */}

          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              color: "#0369a1",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            👤 Citizen accounts can report community problems, upload
            photos/videos, use GPS location and track the progress of submitted
            challenges. All PRIs and ULBs are also welcome to submit challenges.
          </div>


          {/* ==================================================
              CREATE ACCOUNT
          ================================================== */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>


        {/* ==================================================
            LOGIN
        ================================================== */}

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >

          <span>
            Already have an account?
          </span>


          <Link
            to="/login"
            style={{
              marginLeft: "5px",
              color: "#2563eb",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Login
          </Link>

        </div>


        {/* ==================================================
            PRIVATE ACCOUNT NOTICE
        ================================================== */}

        <div
          style={{
            marginTop: "18px",
            paddingTop: "15px",
            borderTop: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "12px",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >

          🏢 Industry accounts are private
          and cannot be created through public registration.

          <br />

          🏛️ Industry accounts are created
          by Government administration.

          <br />

          🎓 University accounts are also created
          by Government administration.

        </div>


      </div>

    </div>

  );

}

export default Register;