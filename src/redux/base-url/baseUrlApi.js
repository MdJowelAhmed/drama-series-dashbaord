import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const isProduction = true;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://10.10.7.48:5003/api/v1`,
    prepareHeaders: (headers, { endpoint }) => {
      if (endpoint !== "resetPassword") {
        const token =
          localStorage.getItem("token") 
    
        if (token) {
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
  ],
  endpoints: () => ({}),
});
