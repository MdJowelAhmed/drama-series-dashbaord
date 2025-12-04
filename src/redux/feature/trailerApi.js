import { api } from "../base-url/baseUrlApi";

const trailerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTrailer: builder.mutation({
      query: (trailer) => ({
        url: "/trailer/create",
        method: "POST",
        body: trailer,
      }),
      invalidatesTags: ["Trailer"],
    }),

    videoUrlGenerate: builder.mutation({
      query: (videoUrl) => ({
        url: "/trailer/generate-upload-url",
        method: "POST",
        body: videoUrl,
      }),
      invalidatesTags: ["Trailer"],
    }),

    // Upload thumbnail - Note: For FormData uploads, native fetch is used in the modal
    // This mutation is kept for potential future use or alternative implementations
    uploadThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `/trailer/${videoId}/thumbnail`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Trailer"],
    }),

    updateTrailer: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/trailer/update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Trailer"],
    }),

    deleteTrailer: builder.mutation({
      query: (id) => ({
        url: `/trailer/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trailer"],
    }),

    getAllTrailer: builder.query({
      query: () => ({
        url: "/trailer",
        method: "GET",
      }),
      providesTags: ["Trailer"],
    }),

    getTrailerById: builder.query({
      query: (id) => ({
        url: `/trailer/${id}`,
        method: "GET",
      }),
      providesTags: ["Trailer"],
    }),

    toggleTrailerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/trailer/single/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Trailer"],
    }),
  }),
});

export const {
  useCreateTrailerMutation,
  useVideoUrlGenerateMutation,
  useUploadThumbnailMutation,
  useUpdateTrailerMutation,
  useDeleteTrailerMutation,
  useGetAllTrailerQuery,
  useGetTrailerByIdQuery,
  useToggleTrailerStatusMutation,
} = trailerApi;
