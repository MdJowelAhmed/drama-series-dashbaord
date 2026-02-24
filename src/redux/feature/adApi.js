import { api } from "../base-url/baseUrlApi";

const adApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAd: builder.mutation({
      query: (ad) => {
        return {
          url: "/ad-management/create",
          method: "POST",
          body: ad,
        };
      },
      invalidatesTags: ["Ad"],
    }),
    videoUrlGenerateAd: builder.mutation({
      query: (videoUrl) => {
        return {
          url: "/ad-management/generate-upload-url",
          method: "POST",
          body: videoUrl,
        };
      },
    }),
    updateAd: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/ad-management/update/${id}`,
          method: "PATCH",
          body: updatedData,
        };
      },
      invalidatesTags: ["Ad"],
    }),
    deleteAd: builder.mutation({
      query: (id) => {
        return {
          url: `/ad-management/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Ad"],
    }),
    getAllAd: builder.query({
      query: () => ({
        url: "/ad-management",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Ad", id })),
              { type: "Ad", id: "LIST" },
            ]
          : [{ type: "Ad", id: "LIST" }],
    }),
  
  }),
});

export const {
  useCreateAdMutation,
  useVideoUrlGenerateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useGetAllAdQuery,
} = adApi;

