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

        const _loc = typeof window !== "undefined" && window.location.hostname === "localhost";
        const API_HOST = import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
          : _loc ? "http://localhost:5000" : "";
        const response = await fetch(
          `${API_HOST}/api/auth/me`,
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
      try {
        sessionStorage.setItem(
          "gov_access_denied",
          JSON.stringify({
            attemptedPath: location.pathname,
            timestamp: new Date().toISOString(),
            message: "Access Restricted: Government Nodal Desks and Administrative Portals require verified departmental credentials. Citizen accounts cannot access administrative routes."
          })
        );
      } catch (e) {
        // Ignore sessionStorage errors
      }

      return (
        <Navigate
          to="/citizen"
          replace
          state={{
            accessDenied: true,
            deniedPath: location.pathname,
            deniedMessage: "Access Restricted: Government Nodal Desks require verified departmental credentials. You have been redirected to your Citizen Portal."
          }}
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
