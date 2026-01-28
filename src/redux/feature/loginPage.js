import { api } from "../base-url/baseUrlApi";

const loginPageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    loginPage: builder.mutation({
      query: (loginPage) => ({
        url: "/dynamic-content/upload",
        method: "POST",
        body: loginPage,
      }),
    }),
    getLoginPage: builder.query({
      query: (loginPage) => ({
        url: "/dynamic-content",
        method: "GET",
      }),
    }),

  }),
});

export const { useLoginPageMutation, useGetLoginPageQuery } = loginPageApi;
