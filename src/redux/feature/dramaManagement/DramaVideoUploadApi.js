import { api } from "../../base-url/baseUrlApi";

const dramaVideoUploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new episode/video
    createDramaVideo: builder.mutation({
      query: (videoData) => ({
        url: "/video-management/create",
        method: "POST",
        body: videoData,
      }),
      invalidatesTags: ["DramaVideo", "Season"],
    }),

    // Generate upload URL for Bunny CDN
    dramaVideoUrlGenerate: builder.mutation({
      query: (videoUrl) => ({
        url: "/video-management/generate-upload-url",
        method: "POST",
        body: videoUrl,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    // Upload thumbnail - native fetch is used for FormData uploads
    uploadDramaVideoThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `/video-management/${videoId}/thumbnail`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    // Update an episode/video
    updateDramaVideo: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/video-management/update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["DramaVideo", "Season"],
    }),

    // Delete an episode/video
    deleteDramaVideo: builder.mutation({
      query: (id) => ({
        url: `/video-management/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DramaVideo", "Season"],
    }),

    // Get all videos
    getAllDramaVideo: builder.query({
      query: () => ({
        url: "/video-management",
        method: "GET",
      }),
      providesTags: ["DramaVideo"],
    }),

    // Get videos by season ID
    getVideosBySeasonId: builder.query({
      query: (seasonId) => ({
        url: `/video-management`,
        method: "GET",
        params: { seasonId },
      }),
      providesTags: ["DramaVideo"],
    }),

    // Get single video by ID
    getDramaVideoById: builder.query({
      query: (id) => ({
        url: `/video-management/single/${id}`,
        method: "GET",
      }),
      providesTags: ["DramaVideo"],
    }),

    // Toggle video status
    toggleDramaVideoStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/video-management/single/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["DramaVideo"],
    }),
  }),
});

export const {
  useCreateDramaVideoMutation,
  useDramaVideoUrlGenerateMutation,
  useUploadDramaVideoThumbnailMutation,
  useUpdateDramaVideoMutation,
  useDeleteDramaVideoMutation,
  useGetAllDramaVideoQuery,
  useGetVideosBySeasonIdQuery,
  useGetDramaVideoByIdQuery,
  useToggleDramaVideoStatusMutation,
} = dramaVideoUploadApi;
