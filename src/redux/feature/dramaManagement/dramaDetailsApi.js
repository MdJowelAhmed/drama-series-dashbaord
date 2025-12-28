import { api } from "../../base-url/baseUrlApi";

const dramaDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new season for a drama/movie
    createDramaSeason: builder.mutation({
      query: (body) => ({
        url: "/season-management/create",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Drama", "Season"],
    }),

    // Get all seasons (optionally filtered by movieId)
    getAllDramaSeasons: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/season-management/get-seasons",
          method: "GET",
          params,
        };
      },
      providesTags: ["Drama", "Season"],
    }),

    // Get seasons by movie/drama ID
    getSeasonsByMovieId: builder.query({
      query: (movieId) => ({
        url: `/season-management/get-seasons`,
        method: "GET",
        params: { movieId },
      }),
      providesTags: ["Drama", "Season"],
    }),

    // Get single season by ID
    getDramaSeasonById: builder.query({
      query: (id) => ({
        url: `/season-management/get-season/${id}`,
        method: "GET",
      }),
      providesTags: ["Drama", "Season"],
    }),

    // Update a season
    updateDramaSeason: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/season-management/update-season/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Drama", "Season"],
    }),

    // Delete a season
    deleteDramaSeason: builder.mutation({
      query: (id) => ({
        url: `/season-management/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Drama", "Season"],
    }),
  }),
});

export const {
  useCreateDramaSeasonMutation,
  useGetAllDramaSeasonsQuery,
  useGetSeasonsByMovieIdQuery,
  useGetDramaSeasonByIdQuery,
  useUpdateDramaSeasonMutation,
  useDeleteDramaSeasonMutation,
} = dramaDetailsApi;

