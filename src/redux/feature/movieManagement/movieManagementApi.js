import { api } from "../../base-url/baseUrlApi";

const movieManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createMovie: builder.mutation({
      query: (movie) => {
        return{
            url: "/movie-management/create",
            method: "POST",
            body: movie,
        }
      },
      invalidatesTags: ["Movie"],
    }),
    getAllMovie: builder.query({
        query: (args) => {
            const params = new URLSearchParams();
            if (args) {
                args.forEach((arg) => {
                    params.append(arg.name, arg.value);
                });
            }
          return{
            url: "/movie-management/get-movies",
            method: "GET",
            params,
          }
        },
        providesTags: ["Movie"],
      }),
      
      getMovieById: builder.query({
        query: (id) => {
          return{
            url: `/movie-management/get-movie/${id}`,
            method: "GET",
          }
        },
        providesTags: ["Movie"],
      }),


  

    updateMovie: builder.mutation({
      query: ({ id, updatedData }) => {
        return{
          url: `/movie-management/update-movie/${id}`,
          method: "PUT",
          body: updatedData,
        }
      },
      invalidatesTags: ["Movie"],
    }),

    deleteMovie: builder.mutation({
      query: (id) => {
        return{
          url: `/movie-management/delete-movie/${id}`,
          method: "DELETE",
        }
      },
      invalidatesTags: ["Movie"],
    }),

  }),
});

export const {
  useCreateMovieMutation,
  useGetAllMovieQuery,
  useGetMovieByIdQuery,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = movieManagementApi;
