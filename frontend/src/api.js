// On Vercel: frontend and /api/* share the same domain — use relative URL (no host prefix)
// In local dev: VITE_API_URL is unset so we fall back to localhost:5000
const _isLocalDev = typeof window !== "undefined" && window.location.hostname === "localhost";
export const API_HOST = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : _isLocalDev ? "http://localhost:5000" : "";
export const API_BASE_URL = `${API_HOST}/api`;

export async function api(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {})
  };

  if (!headers["Content-Type"]) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  let data = null;

  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    contentType &&
    contentType.includes(
      "application/json"
    )
  ) {
    data = await response.json();
  } else {
    const text =
      await response.text();

    data = {
      success: false,
      message: text
    };
  }

  /*
   * IMPORTANT:
   *
   * Do NOT call every 404 an
   * "API endpoint not found".
   *
   * A valid endpoint can return 404
   * because a project/problem does not exist.
   */

  if (!response.ok) {

    const error =
      new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );

    error.status =
      response.status;

    error.response = {
      status:
        response.status,

      data
    };

    throw error;
  }

  return data;
}