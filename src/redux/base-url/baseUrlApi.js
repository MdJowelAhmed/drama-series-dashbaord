import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
    paramsSerializer: (params) => {
      const searchParams =
        params instanceof URLSearchParams
          ? params
          : new URLSearchParams(params);
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
    
  }),
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
