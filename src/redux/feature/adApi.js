import { api } from "../base-url/baseUrlApi";

const adApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAd: builder.mutation({
      query: (ad) => {
        return {
          url: "/ad/create",
          method: "POST",
          body: ad,
        };
      },
      invalidatesTags: ["Ad"],
    }),
    videoUrlGenerateAd: builder.mutation({
      query: (videoUrl) => {
        return {
          url: "/ad/generate-upload-url",
          method: "POST",
          body: videoUrl,
        };
      },
      invalidatesTags: ["Ad"],
    }),
    updateAd: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/ad/update/${id}`,
          method: "PUT",
          body: updatedData,
        };
      },
      invalidatesTags: ["Ad"],
    }),
    deleteAd: builder.mutation({
      query: (id) => {
        return {
          url: `/ad/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Ad"],
    }),
    getAllAd: builder.query({
      query: () => {
        return {
          url: "/ad",
          method: "GET",
        };
      },
      providesTags: ["Ad"],
    }),
    toggleAdStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/ad/single/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: ["Ad"],
    }),
  }),
});

export const {
  useCreateAdMutation,
  useVideoUrlGenerateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useGetAllAdQuery,
  useToggleAdStatusMutation,
} = adApi;

