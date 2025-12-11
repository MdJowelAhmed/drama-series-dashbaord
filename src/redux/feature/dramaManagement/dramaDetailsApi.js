import { api } from "../../base-url/baseUrlApi";

const dramaDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createDramaSeason: builder.mutation({
      query: (body) => {
      
        return {
          url: "/season-management/create",
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: ["Drama"],
    }),

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
      providesTags: ["Drama"],
    }),

    getDramaSeasonById: builder.query({
      query: (id) => {
        return {
          url: `/season-management/get-season/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Drama"],
    }),

    updateDramaSeason: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/season-management/${id}`,
          method: "PUT",
          body: updatedData,
          // FormData is automatically handled by fetchBaseQuery
          // No need to set Content-Type header - browser sets it with boundary
        };
      },
      invalidatesTags: ["Drama"],
    }),

    deleteDramaSeason: builder.mutation({
      query: (id) => {
        return {
          url: `/season-management/get-movie/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Drama"],
    }),
  }),
});

export const {
  useCreateDramaSeasonMutation,
  useGetAllDramaSeasonsQuery,
  useGetDramaSeasonByIdQuery,
  useUpdateDramaSeasonMutation,
  useDeleteDramaSeasonMutation,
} = dramaDetailsApi;

