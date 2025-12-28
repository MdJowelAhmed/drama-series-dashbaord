import { api } from "../../base-url/baseUrlApi";

const dramaManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDrama: builder.mutation({
      query: (formData) => {
        // Expects FormData with:
        // - thumbnail: File (image file)
        // - data: JSON string with { title, type, genre, tags, description, accentColor, status }
        return {
          url: "/movie-management/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Drama"],
    }),

    getAllDrama: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/movie-management/get-movies",
          method: "GET",
          params,
        };
      },
      providesTags: ["Drama"],
    }),

    getDramaById: builder.query({
      query: (id) => {
        return {
          url: `/movie-management/get-movie/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Drama"],
    }),

    updateDrama: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/movie-management/update-movie/${id}`,
          method: "PUT",
          body: updatedData,
          // FormData is automatically handled by fetchBaseQuery
          // No need to set Content-Type header - browser sets it with boundary
        };
      },
      invalidatesTags: ["Drama"],
    }),

    deleteDrama: builder.mutation({
      query: (id) => {
        return {
          url: `/movie-management/delete-movie/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Drama"],
    }),
  }),
});

export const {
  useCreateDramaMutation,
  useGetAllDramaQuery,
  useGetDramaByIdQuery,
  useUpdateDramaMutation,
  useDeleteDramaMutation,
} = dramaManagementApi;

