import { api } from "../base-url/baseUrlApi";

const trailerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTrailer: builder.mutation({
      query: (trailer) => {
        // Handle FormData for file uploads
        if (trailer instanceof FormData) {
          return {
            url: "/trailer/create",
            method: "POST",
            body: trailer,
          };
        }
        return {
          url: "/trailer/create",
          method: "POST",
          body: trailer,
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    videoUrlGenerate: builder.mutation({
      query: (videoUrl) => {
        return {
          url: "/trailer/generate-upload-url",
          method: "POST",
          body: videoUrl,
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    // Upload thumbnail to server - returns CDN URL
    uploadThumbnail: builder.mutation({
      query: (formData) => {
        return {
          url: "/trailer/upload-thumbnail",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    // Set thumbnail for a specific video
    setVideoThumbnail: builder.mutation({
      query: ({ videoId, thumbnailUrl }) => {
        return {
          url: `/trailer/${videoId}/thumbnail`,
          method: "POST",
          body: { thumbnailUrl },
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    updateTrailer: builder.mutation({
      query: ({ id, updatedData }) => {
        // Handle FormData for file uploads
        if (updatedData instanceof FormData) {
          return {
            url: `/trailer/update/${id}`,
            method: "PUT",
            body: updatedData,
          };
        }
        return {
          url: `/trailer/update/${id}`,
          method: "PUT",
          body: updatedData,
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    deleteTrailer: builder.mutation({
      query: (id) => {
        return {
          url: `/trailer/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Trailer"],
    }),

    getAllTrailer: builder.query({
      query: () => {
        return {
          url: "/trailer",
          method: "GET",
        };
      },
      providesTags: ["Trailer"],
    }),

    getTrailerById: builder.query({
      query: (id) => {
        return {
          url: `/trailer/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Trailer"],
    }),

    toggleTrailerStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/trailer/single/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: ["Trailer"],
    }),
  }),
});

export const {
  useCreateTrailerMutation,
  useVideoUrlGenerateMutation,
  useUploadThumbnailMutation,
  useSetVideoThumbnailMutation,
  useUpdateTrailerMutation,
  useDeleteTrailerMutation,
  useGetAllTrailerQuery,
  useGetTrailerByIdQuery,
  useToggleTrailerStatusMutation,
} = trailerApi;
