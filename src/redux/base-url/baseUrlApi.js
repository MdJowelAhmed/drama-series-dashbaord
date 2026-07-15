import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import {
  AUTH_SKIP_ENDPOINTS,
  clearAuthSession,
  getErrorMessage,
  isUnauthorizedError,
  redirectToLogin,
} from "@/utils/errorHandler";

export const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  paramsSerializer: (params) => {
    const searchParams =
      params instanceof URLSearchParams ? params : new URLSearchParams(params);
    return searchParams.toString().replace(/\+/g, "%20");
  },
  prepareHeaders: (headers, { endpoint }) => {
    if (endpoint !== "resetPassword") {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("token", token);
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

function shouldShowGlobalToast(error) {
  const status = error?.status;
  if (status === "FETCH_ERROR" || status === "PARSING_ERROR" || status === "TIMEOUT_ERROR") {
    return true;
  }
  if (typeof status === "number" && status >= 500) return true;
  return false;
}

/**
 * Global API error handling layered on fetchBaseQuery:
 * - 401/403 → clear session, toast, redirect to login
 * - Network / 5xx → toast automatically
 * - Auth endpoints skip redirect/toast so screens keep their own messages
 * - Pass `{ skipGlobalErrorToast: true }` in extraOptions to silence toast
 */
const baseQueryWithErrorHandling = async (args, api, extraOptions = {}) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error) return result;

  const endpoint = api.endpoint;
  const skipToast =
    extraOptions.skipGlobalErrorToast === true ||
    AUTH_SKIP_ENDPOINTS.has(endpoint);

  if (isUnauthorizedError(result.error) && !AUTH_SKIP_ENDPOINTS.has(endpoint)) {
    clearAuthSession();
    if (!skipToast) {
      toast.error(getErrorMessage(result.error, "Session expired. Please log in again."));
    }
    redirectToLogin();
    return result;
  }

  if (!skipToast && shouldShowGlobalToast(result.error)) {
    toast.error(getErrorMessage(result.error));
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "Auth",
    "User",
    "Trailer",
    "Ad",
    "Movie",
    "Drama",
    "Season",
    "DramaVideo",
    "Package",
    "Remainder",
    "Dashboard",
    "Category",
    "Subcategory",
  ],
  endpoints: () => ({}),
});
