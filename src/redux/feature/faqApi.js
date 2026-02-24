import { api } from "../base-url/baseUrlApi";

const faqApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createFaq: builder.mutation({
      query: (faq) => ({
        url: "/faq",
        method: "POST",
        body: faq,
      }),
      invalidatesTags: ["Faq"],
    }),
    getAllFaq: builder.query({
      query: () => ({
        url: "/faq",
        method: "GET",
      }),
      providesTags: ["Faq"],
    }),
    updateFaq: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body: updatedData,
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
