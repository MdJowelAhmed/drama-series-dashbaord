import { api } from "../base-url/baseUrlApi";

const dramaVideoUploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDramaVideo: builder.mutation({
      query: (dramaVideo) => ({
        url: "/video-management/create",
        method: "POST",
        body: dramaVideo,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    videoUrlGenerate: builder.mutation({
      query: (videoUrl) => ({
        url: "/video-management/generate-upload-url",
        method: "POST",
        body: videoUrl,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    // Upload thumbnail - Note: For FormData uploads, native fetch is used in the modal
    // This mutation is kept for potential future use or alternative implementations
    uploadThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `/video-management/${videoId}/thumbnail`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    updateDramaVideo: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/video-management/update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    deleteDramaVideo: builder.mutation({
      query: (id) => ({
        url: `/video-management/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DramaVideo"],
    }),

    getAllDramaVideo: builder.query({
      query: () => ({
        url: "/video-management",
        method: "GET",
      }),
      providesTags: ["DramaVideo"],
    }),

    getDramaVideoById: builder.query({
      query: (id) => ({
        url: `/video-management/single/${id}`,
        method: "GET",
      }),
      providesTags: ["DramaVideo"],
    }),

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
  useVideoUrlGenerateMutation,
  useUploadThumbnailMutation,
  useUpdateDramaVideoMutation,
  useDeleteDramaVideoMutation,
  useGetAllDramaVideoQuery,
  useGetDramaVideoByIdQuery,
  useToggleDramaVideoStatusMutation,
} = dramaVideoUploadApi;
