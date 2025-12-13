import { api } from "../base-url/baseUrlApi";

const settingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSetting: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
            args.forEach((arg) => {
                params.append(arg.name, arg.value);
            });
        }
        return {
            url: "/settings",
            method: "GET",
            params,
        }
      },
      transformResponse: ({ data }) => data,
      providesTags: ["Settings"],
    }),
    updateSetting: builder.mutation({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: data,
      }),
      transformResponse: ({ data }) => data,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingQuery, useUpdateSettingMutation } = settingApi;
