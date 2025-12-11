import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const isProduction = true;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://10.10.7.48:5003/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      
      // Important: Do NOT set Content-Type for FormData uploads
      // The browser will automatically set it with the correct boundary
      // fetchBaseQuery handles this automatically when body is FormData
      
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
  ],
  endpoints: () => ({}),
});
