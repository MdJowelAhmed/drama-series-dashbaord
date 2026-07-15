/**
 * Shared helpers for consistent API / app error handling.
 */

export const AUTH_SKIP_ENDPOINTS = new Set([
  "login",
  "forgotPassword",
  "otpVerify",
  "resendOtp",
  "resetPassword",
]);

export function getErrorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  const data = error?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (Array.isArray(data?.error) && data.error[0]?.message) {
    return String(data.error[0].message);
  }
  if (Array.isArray(data?.message) && data.message[0]) return String(data.message[0]);
  if (typeof error?.error === "string" && error.error.trim()) return error.error;
  if (typeof error?.message === "string" && error.message.trim()) {
    if (error.message === "Rejected") return fallback;
    return error.message;
  }

  if (error?.status === "FETCH_ERROR") {
    return "Network error. Please check your connection.";
  }
  if (error?.status === "PARSING_ERROR") {
    return "Invalid response from server.";
  }
  if (error?.status === "TIMEOUT_ERROR") {
    return "Request timed out. Please try again.";
  }

  return fallback;
}

export function isUnauthorizedError(error) {
  const status = error?.status ?? error?.originalStatus;
  return status === 401 || status === 403;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("resetToken");
}

export function redirectToLogin() {
  const path = window.location.pathname;
  if (path === "/login" || path.startsWith("/forgot") || path.startsWith("/verify") || path.startsWith("/reset")) {
    return;
  }
  window.location.assign("/login");
}
