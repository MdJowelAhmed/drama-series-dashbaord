import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const isProduction = false;
export const baseUrl = isProduction ? "http://72.62.164.122:5000/api/v1" : "http://10.10.7.48:5003/api/v1";
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: `https://rakibur5003.binarybards.online/api/v1`,
    // baseUrl: `http://72.62.164.122:5000/api/v1`,
    // baseUrl: `http://10.10.7.48:5003/api/v1`,
    baseUrl: baseUrl,
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
    "Package",
  ],
  endpoints: () => ({}),
});
