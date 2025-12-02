import { api } from "../base-url/baseUrlApi";

const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    deleteCategory: builder.mutation({
      query: (id) => {
        return {
          url: `/category/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => {
        return {
          url: "/category/create",
          method: "POST",
          body: categoryData,
        };
      },
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, categoryData }) => {
        return {
          url: `/category/${id}`,
          method: "PATCH",
          body: categoryData,
        };
      },
      invalidatesTags: ["Category"],
    }),
    getAllCategory: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/category",
          method: "GET",
          params,
        };
      },
      providesTags: ["Category"],
    }),
    getSingleCategory: builder.query({
      query: (selectedCategoryId) => {
        return {
          url: `/category/${selectedCategoryId}`,
          method: "GET",
        };
      },
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi;
