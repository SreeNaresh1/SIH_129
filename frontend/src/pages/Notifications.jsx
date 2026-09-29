import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  api
} from "../api";


export default function Notifications() {

  const navigate =
    useNavigate();


  const [
    items,
    setItems
  ] = useState([]);


  const [
    error,
    setError
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    unread,
    setUnread
  ] = useState(0);


  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const load =
    useCallback(
      async () => {

        try {

          setError("");

          const response =
            await api(
              "/advanced/notifications"
            );


          setItems(
            response?.notifications || []
          );


          setUnread(
            Number(
              response?.unread || 0
            )
          );


        } catch (error) {

          console.error(
            "Notification loading error:",
            error
          );


          setError(
            error.message ||
              "Unable to load notifications."
          );


        } finally {

          setLoading(false);

        }

      },
      []
    );


  /* =========================================================
     INITIAL LOAD + AUTO REFRESH
  ========================================================= */

  useEffect(
    () => {

      load();


      /*
       * Check for new Government approvals /
       * changes every 5 seconds.
       */
      const timer =
        setInterval(
          load,
          5000
        );


      return () => {
        clearInterval(timer);
      };

    },
    [load]
  );


  /* =========================================================
     MARK NOTIFICATION AS READ
  ========================================================= */

  const markAsRead =
    async (id) => {

      try {

        await api(
          `/advanced/notifications/${id}/read`,
          {
            method:
              "PATCH"
          }
        );


        setItems(
          (previous) =>
            previous.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      readAt:
                        new Date().toISOString()
                    }
                  : item
            )
        );


        setUnread(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );


      } catch (error) {

        console.error(
          "Mark notification read error:",
          error
        );

      }

    };


  /* =========================================================
     OPEN NOTIFICATION
  ========================================================= */

  const openNotification =
    async (notification) => {

      /*
       * Mark unread notification as read.
       */
      if (
        !notification.readAt
      ) {

        await markAsRead(
          notification.id
        );

      }


      /*
       * If the backend supplied a link,
       * navigate directly to that page.
       */
      if (
        notification.link
      ) {

        navigate(
          notification.link
        );

        return;

      }

      const isCitizen = localStorage.getItem("userRole") === "citizen";

      if (notification.problemId) {
        navigate(isCitizen ? `/problem/${notification.problemId}` : `/admin/problem/${notification.problemId}`);
        return;
      }

      const text = `${notification.title || ""} ${notification.message || ""}`;
      const match = text.match(/(MH-FED-\d+-[A-Z0-9]+|CH-\d+-[A-Z0-9]+|[a-f0-9\-]{36})/i);
      if (match) {
        navigate(isCitizen ? `/problem/${match[0]}` : `/admin/problem/${match[0]}`);
        return;
      }

    };


  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f8fafc",

        padding:
          "40px 20px"
      }}
    >

      <div
        style={{
          maxWidth:
            "900px",

          margin:
            "0 auto"
        }}
      >


        {/* =================================================
           HEADER
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "20px",

            marginBottom:
              "25px"
          }}
        >

          <div>

            <h1
              style={{
                margin:
                  "0 0 8px 0"
              }}
            >
              Notifications
            </h1>


            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Government approvals, requested changes,
              assignments and project updates.
            </p>

          </div>


          <button
            onClick={
              () =>
                navigate(-1)
            }
            style={{
              border:
                "1px solid #cbd5e1",

              background:
                "#ffffff",

              padding:
                "10px 16px",

              borderRadius:
                "8px",

              cursor:
                "pointer",

              fontWeight:
                600
            }}
          >
            ← Back
          </button>

        </div>


        {/* =================================================
           UNREAD COUNT
        ================================================= */}

        {unread > 0 && (

          <div
            style={{
              marginBottom:
                "20px",

              padding:
                "14px 18px",

              borderRadius:
                "10px",

              background:
                "#eff6ff",

              border:
                "1px solid #bfdbfe",

              color:
                "#1d4ed8",

              fontWeight:
                600
            }}
          >

            🔔 {unread} unread notification
            {unread !== 1 ? "s" : ""}

          </div>

        )}


        {/* =================================================
           ERROR
        ================================================= */}

        {error && (

          <div
            style={{
              padding:
                "14px 18px",

              marginBottom:
                "20px",

              borderRadius:
                "10px",

              background:
                "#fee2e2",

              border:
                "1px solid #fecaca",

              color:
                "#991b1b"
            }}
          >

            {error}

          </div>

        )}


        {/* =================================================
           LOADING
        ================================================= */}

        {loading && (

          <div
            style={{
              padding:
                "30px",

              textAlign:
                "center",

              background:
                "#ffffff",

              borderRadius:
                "12px",

              border:
                "1px solid #e2e8f0"
            }}
          >

            Loading notifications...

          </div>

        )}


        {/* =================================================
           NOTIFICATION LIST
        ================================================= */}

        {!loading &&
          !error &&
          items.length > 0 && (

            <div>

              {items.map(
                (notification) => {

                  const isUnread =
                    !notification.readAt;


                  return (

                    <div
                      key={
                        notification.id
                      }

                      onClick={() =>
                        openNotification(
                          notification
                        )
                      }

                      style={{
                        padding:
                          "20px",

                        marginBottom:
                          "12px",

                        borderRadius:
                          "12px",

                        border:
                          isUnread
                            ? "1px solid #93c5fd"
                            : "1px solid #e2e8f0",

                        background:
                          isUnread
                            ? "#eff6ff"
                            : "#ffffff",

                        cursor:
                          notification.link
                            ? "pointer"
                            : "default",

                        boxShadow:
                          isUnread
                            ? "0 2px 8px rgba(59,130,246,0.08)"
                            : "none",

                        transition:
                          "0.2s"
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          alignItems:
                            "flex-start",

                          gap:
                            "15px"
                        }}
                      >

                        <div
                          style={{
                            flex:
                              1
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "10px",

                              marginBottom:
                                "8px"
                            }}
                          >

                            {isUnread && (

                              <span
                                style={{
                                  width:
                                    "9px",

                                  height:
                                    "9px",

                                  borderRadius:
                                    "50%",

                                  background:
                                    "#2563eb",

                                  display:
                                    "inline-block"
                                }}
                              />

                            )}


                            <strong
                              style={{
                                fontSize:
                                  "17px",

                                color:
                                  "#0f172a"
                              }}
                            >
                              {
                                notification.title
                              }
                            </strong>

                          </div>


                          <p
                            style={{
                              margin:
                                "0 0 12px 0",

                              lineHeight:
                                1.6,

                              color:
                                "#475569"
                            }}
                          >
                            {
                              notification.message
                            }
                          </p>


                          <small
                            style={{
                              color:
                                "#94a3b8"
                            }}
                          >

                            {
                              notification.createdAt
                                ? new Date(
                                    notification.createdAt
                                  ).toLocaleString()
                                : ""
                            }

                          </small>

                        </div>


                        {notification.link && (

                          <span
                            style={{
                              color:
                                "#2563eb",

                              fontWeight:
                                600,

                              whiteSpace:
                                "nowrap"
                            }}
                          >
                            Open →
                          </span>

                        )}

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}


        {/* =================================================
           NO NOTIFICATIONS
        ================================================= */}

        {!loading &&
          !error &&
          items.length === 0 && (

            <div
              style={{
                padding:
                  "50px 25px",

                textAlign:
                  "center",

                background:
                  "#ffffff",

                borderRadius:
                  "12px",

                border:
                  "1px solid #e2e8f0"
              }}
            >

              <div
                style={{
                  fontSize:
                    "42px",

                  marginBottom:
                    "15px"
                }}
              >
                🔔
              </div>


              <h2
                style={{
                  margin:
                    "0 0 8px 0"
                }}
              >
                No notifications yet
              </h2>


              <p
                style={{
                  margin:
                    0,

                  color:
                    "#64748b"
                }}
              >
                Government approvals and requested
                changes will appear here.
              </p>

            </div>

          )}

      </div>

    </div>

  );

}