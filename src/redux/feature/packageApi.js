import { api } from "../base-url/baseUrlApi";

const packageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPackage: builder.mutation({
      query: (packageData) => {
        return {
          url: "/package",
          method: "POST",
          body: packageData,
        };
      },
      invalidatesTags: ["Package"],
    }),

    updatePackage: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/package/${id}`,
          method: "PUT",
          body: updatedData,
        };
      },
      invalidatesTags: ["Package"],
    }),
    deletePackage: builder.mutation({
      query: (id) => {
        return {
          url: `/package/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Package"],
    }),
    getAllPackage: builder.query({
      query: () => {
        return {
          url: "/package",
          method: "GET",
        };
      },
      providesTags: ["Package"],
    }),
  }),
});

export const {
    useCreatePackageMutation,
    useUpdatePackageMutation,
    useDeletePackageMutation,
    useGetAllPackageQuery,
} = packageApi;

