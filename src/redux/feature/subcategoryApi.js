import { api } from "../base-url/baseUrlApi";

const subcategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSubcategory: builder.mutation({
      query: ({ categoryId, name }) => ({
        url: "/subcategory/create",
        method: "POST",
        body: { categoryId, name },
      }),
      invalidatesTags: ["Subcategory"],
    }),
    getSubcategoriesByCategory: builder.query({
      query: (categoryId) => ({
        url: "/subcategory/",
        method: "GET",
        params: { categoryId },
      }),
      providesTags: (result, error, categoryId) => [
        { type: "Subcategory", id: categoryId },
        "Subcategory",
      ],
    }),
    deleteSubcategory: builder.mutation({
      query: (id) => ({
        url: `/subcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subcategory"],
    }),
  }),
});

export const {
  useCreateSubcategoryMutation,
  useGetSubcategoriesByCategoryQuery,
  useDeleteSubcategoryMutation,
} = subcategoryApi;
