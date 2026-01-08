import { api } from "../base-url/baseUrlApi";

const faqApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createFaq: builder.mutation({
      query: (faq) => ({
        url: "/faq",
        method: "POST",
        body: faq,
      }),
    }),
    getAllFaq: builder.query({
      query: () => ({
        url: "/faq",
        method: "GET",
      }),
      providesTags: ["Faq"],
    }),
    updateFaq: builder.mutation({
      query: (faq) => ({
        url: "/faq",
        method: "PUT",
        body: faq,
      }),
      invalidatesTags: ["Faq"],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faq"],
    }),
  }),
});

export const { useCreateFaqMutation, useGetAllFaqQuery, useUpdateFaqMutation, useDeleteFaqMutation } = faqApi;
