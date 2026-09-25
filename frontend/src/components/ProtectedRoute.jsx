import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [authorized, setAuthorized] =
    useState(false);


  // =========================================================
  // VERIFY AUTHENTICATION
  // =========================================================

  useEffect(() => {

    let isMounted = true;


    const verifyAuthentication = async () => {

      const token =
        localStorage.getItem("authToken");


      // =====================================================
      // NO TOKEN
      // =====================================================

      if (!token) {

        if (!isMounted) return;

        setAuthenticated(false);
        setAuthorized(false);
        setCheckingAuth(false);

        return;
      }


      try {

        setCheckingAuth(true);


        // ===================================================
        // VERIFY JWT WITH BACKEND
        // ===================================================

        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );


        // ===================================================
        // READ RESPONSE
        // ===================================================

        const data =
          await response.json();


        // ===================================================
        // TOKEN INVALID / EXPIRED
        // ===================================================

        if (!response.ok) {

          localStorage.removeItem(
            "authToken"
          );

          localStorage.removeItem(
            "currentUser"
          );

          localStorage.removeItem(
            "userRole"
          );


          if (!isMounted) return;

          setAuthenticated(false);
          setAuthorized(false);
          setCheckingAuth(false);

          return;
        }


        // ===================================================
        // MAKE SURE USER EXISTS
        // ===================================================

        if (!data.user) {

          console.error(
            "Backend did not return user information."
          );


          if (!isMounted) return;

          setAuthenticated(false);
          setAuthorized(false);
          setCheckingAuth(false);

          return;
        }


        // ===================================================
        // BACKEND CONFIRMED USER
        // =====================================================

        const user =
          data.user;


        // ===================================================
        // KEEP FRONTEND USER DATA SYNCHRONIZED
        // ===================================================

        localStorage.setItem(
          "currentUser",
          JSON.stringify(user)
        );

        localStorage.setItem(
          "userRole",
          user.role
        );


        // ===================================================
        // USER IS AUTHENTICATED
        // ===================================================

        if (!isMounted) return;

        setAuthenticated(true);


        // ===================================================
        // CHECK ROLE
        // ===================================================

        const userIsAuthorized =
          allowedRoles.length === 0 ||
          allowedRoles.includes(user.role);


        setAuthorized(
          userIsAuthorized
        );

      } catch (error) {

        console.error(
          "Authentication verification failed:",
          error
        );


        // ===================================================
        // DON'T DELETE TOKEN FOR TEMPORARY NETWORK ERROR
        // ===================================================

        if (!isMounted) return;

        setAuthenticated(false);
        setAuthorized(false);

      } finally {

        if (isMounted) {
          setCheckingAuth(false);
        }

      }

    };


    verifyAuthentication();


    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      isMounted = false;
    };

  }, [allowedRoles]);


  // =========================================================
  // CHECKING AUTHENTICATION
  // =========================================================

  if (checkingAuth) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "12px",
          background: "#f8fafc"
        }}
      >

        <div
          style={{
            fontSize: "18px",
            fontWeight: "600"
          }}
        >
          Checking authentication...
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          Please wait
        </div>

      </div>

    );
  }


  // =========================================================
  // NOT AUTHENTICATED
  // =========================================================

  if (!authenticated) {

    return (

      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname
        }}
      />

    );
  }


  // =========================================================
  // AUTHENTICATED BUT WRONG ROLE
  // =========================================================

  if (!authorized) {

    const userRole =
      localStorage.getItem("userRole");


    // -------------------------------------------------------
    // CITIZEN
    // -------------------------------------------------------

    if (userRole === "citizen") {

      return (
        <Navigate
          to="/citizen"
          replace
        />
      );

    }


    // -------------------------------------------------------
    // GOVERNMENT
    // -------------------------------------------------------

    if (userRole === "government") {

      return (
        <Navigate
          to="/admin"
          replace
        />
      );

    }


    // -------------------------------------------------------
    // UNIVERSITY
    // -------------------------------------------------------

    if (userRole === "university") {

      return (
        <Navigate
          to="/university"
          replace
        />
      );

    }


    // -------------------------------------------------------
    // INDUSTRY
    // -------------------------------------------------------

    if (userRole === "industry") {

      return (
        <Navigate
          to="/industry"
          replace
        />
      );

    }


    // -------------------------------------------------------
    // UNKNOWN ROLE
    // -------------------------------------------------------

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  // =========================================================
  // AUTHENTICATED + AUTHORIZED
  // =========================================================

  return children;
}

export default ProtectedRoute;