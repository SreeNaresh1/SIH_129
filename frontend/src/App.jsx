import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportProblem from "./pages/citizen/ReportProblem";
import MyProblems from "./pages/citizen/MyProblems";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ProblemDetails from "./pages/admin/ProblemDetails";
import GovernmentReview from "./pages/admin/GovernmentReview";

import UniversityDashboard from "./pages/university/UniversityDashboard";
import UniversityProblemDetails from "./pages/university/UniversityProblemDetails";
import CreateTeam from "./pages/university/CreateTeam";
import FacultyMentor from "./pages/university/FacultyMentor";
import SolutionProposal from "./pages/university/SolutionProposal";
import PrototypeTesting from "./pages/university/PrototypeTesting";
import Implementation from "./pages/university/Implementation";
import ProjectCompletion from "./pages/university/ProjectCompletion";

import Industry from "./pages/Industry";

import AdvancedAdminCenter from "./pages/admin/AdvancedAdminCenter";

import Notifications from "./pages/Notifications";

import CollaborationCenter from "./pages/CollaborationCenter";


/* =========================================================
   HOME PAGE
========================================================= */

function Home() {

  return (

    <div className="app">

      {/* ================= NAVIGATION BAR ================= */}

      <nav className="navbar">

        <div className="logo">

          <span>
            SI
          </span>

          Portal

        </div>


        <div className="nav-links">

          <Link to="/">
            Home
          </Link>


          <a href="#about">
            About
          </a>


          <a href="#how-it-works">
            How It Works
          </a>


          <a href="#contact">
            Contact
          </a>


          <Link to="/login">

            <button className="login-btn">
              Login
            </button>

          </Link>

        </div>

      </nav>


      {/* ================= HERO SECTION ================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="small-title">
            JHARKHAND SOCIETAL INNOVATION
          </p>


          <h1>

            Turning Community

            <br />

            <span>
              Problems Into Solutions
            </span>

          </h1>


          <p className="description">

            A collaborative platform connecting citizens,
            universities, industries and government to transform
            real-world societal challenges into innovative and
            measurable solutions.

          </p>


          <div className="hero-buttons">

            <Link to="/login">

              <button className="primary-btn">
                Report a Problem
              </button>

            </Link>


            <button className="secondary-btn">
              Explore Challenges
            </button>

          </div>

        </div>


        {/* ================= INNOVATION JOURNEY ================= */}

        <div className="hero-card">

          <h2>
            Innovation Journey
          </h2>


          <div className="journey">

            <div className="journey-item">

              <div className="circle">
                01
              </div>

              <div>

                <h3>
                  Citizen
                </h3>

                <p>
                  Report a local challenge
                </p>

              </div>

            </div>


            <div className="line"></div>


            <div className="journey-item">

              <div className="circle">
                02
              </div>

              <div>

                <h3>
                  AI Analysis
                </h3>

                <p>
                  Classify and prioritize
                </p>

              </div>

            </div>


            <div className="line"></div>


            <div className="journey-item">

              <div className="circle">
                03
              </div>

              <div>

                <h3>
                  University
                </h3>

                <p>
                  Develop the solution
                </p>

              </div>

            </div>


            <div className="line"></div>


            <div className="journey-item">

              <div className="circle">
                04
              </div>

              <div>

                <h3>
                  Industry
                </h3>

                <p>
                  Support and implement
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= PARTICIPANTS ================= */}

      <section
        className="participants"
        id="about"
      >

        <div className="section-heading">

          <p>
            COLLABORATION ECOSYSTEM
          </p>


          <h2>
            Everyone Can Contribute
          </h2>

        </div>


        <div className="participant-grid">


          {/* CITIZENS */}

          <div className="participant-card">

            <div className="icon">
              👥
            </div>

            <h3>
              Citizens
            </h3>

            <p>
              Identify and report problems
              affecting your community.
            </p>

          </div>


          {/* UNIVERSITIES */}

          <div className="participant-card">

            <div className="icon">
              🎓
            </div>

            <h3>
              Universities
            </h3>

            <p>
              Use academic expertise and
              student innovation to solve challenges.
            </p>

          </div>


          {/* INDUSTRY */}

          <div className="participant-card">

            <div className="icon">
              🏢
            </div>

            <h3>
              Industry
            </h3>

            <p>
              Provide mentorship, funding,
              technology and implementation support.
            </p>

          </div>


          {/* GOVERNMENT */}

          <div className="participant-card">

            <div className="icon">
              🏛️
            </div>

            <h3>
              Government
            </h3>

            <p>
              Validate challenges, coordinate
              stakeholders and measure impact.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer id="contact">

        <p>
          © 2026 Societal Innovation Portal | Jharkhand
        </p>

      </footer>

    </div>

  );

}


/* =========================================================
   APP ROUTES
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* ================= REGISTER ================= */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
           CITIZEN
        ================================================= */}

        <Route
          path="/citizen"
          element={

            <ProtectedRoute
              allowedRoles={[
                "citizen"
              ]}
            >

              <CitizenDashboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/citizen/report"
          element={

            <ProtectedRoute
              allowedRoles={[
                "citizen"
              ]}
            >

              <ReportProblem />

            </ProtectedRoute>

          }
        />


        <Route
          path="/citizen/problems"
          element={

            <ProtectedRoute
              allowedRoles={[
                "citizen"
              ]}
            >

              <MyProblems />

            </ProtectedRoute>

          }
        />

        <Route
          path="/citizen/notifications"
          element={

            <ProtectedRoute
              allowedRoles={[
                "citizen",
                "government",
                "university",
                "industry"
              ]}
            >

              <Notifications />

            </ProtectedRoute>

          }
        />


        {/* =================================================
           GOVERNMENT
        ================================================= */}

        <Route
          path="/admin"
          element={

            <ProtectedRoute
              allowedRoles={[
                "government"
              ]}
            >

              <AdminDashboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/problem/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "government",
                "citizen",
                "university",
                "industry"
              ]}
            >

              <ProblemDetails />

            </ProtectedRoute>

          }
        />

        <Route
          path="/problem/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "government",
                "citizen",
                "university",
                "industry"
              ]}
            >

              <ProblemDetails />

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/review/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "government"
              ]}
            >

              <GovernmentReview />

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin/advanced"
          element={

            <ProtectedRoute
              allowedRoles={[
                "government"
              ]}
            >

              <AdvancedAdminCenter />

            </ProtectedRoute>

          }
        />


        {/* =================================================
           UNIVERSITY
        ================================================= */}

        <Route
          path="/university"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <UniversityDashboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/problem/:id"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <UniversityProblemDetails />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/team"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <CreateTeam />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/mentor"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <FacultyMentor />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/proposal"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <SolutionProposal />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/prototype-testing"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <PrototypeTesting />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/implementation"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <Implementation />

            </ProtectedRoute>

          }
        />


        <Route
          path="/university/completion"
          element={

            <ProtectedRoute
              allowedRoles={[
                "university"
              ]}
            >

              <ProjectCompletion />

            </ProtectedRoute>

          }
        />


        {/* =================================================
           NOTIFICATIONS
           
           THIS WAS MISSING.
           
           Government review notifications are stored in
           the database for the concerned university user.
           This route allows that university user to open
           and see those notifications.
        ================================================= */}

        <Route
          path="/notifications"
          element={

            <ProtectedRoute
              allowedRoles={[
                "citizen",
                "government",
                "university",
                "industry"
              ]}
            >

              <Notifications />

            </ProtectedRoute>

          }
        />


        {/* =================================================
           INDUSTRY
        ================================================= */}

        <Route
          path="/industry"
          element={

            <ProtectedRoute
              allowedRoles={[
                "industry"
              ]}
            >

              <Industry />

            </ProtectedRoute>

          }
        />


        <Route
          path="/collaboration"
          element={

            <ProtectedRoute
              allowedRoles={[
                "industry",
                "university",
                "government"
              ]}
            >

              <CollaborationCenter />

            </ProtectedRoute>

          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;