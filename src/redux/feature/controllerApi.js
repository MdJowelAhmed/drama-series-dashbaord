import { api } from "../base-url/baseUrlApi";


const controllerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBackUpAdmin: builder.mutation({
      query: (admin) => {
        return {
          url: "/admin/create-admin",
          method: "POST",
          body: admin,
        };
      },
      invalidatesTags: ["Admin"],
    }),
    updateBackUpAdmin: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/admin/update-admin/${id}`,
          method: "PATCH",
          body: updatedData,
        };
      },
      invalidatesTags: ["Admin"],
    }),
    deleteBackUpAdmin: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Admin"],
    }),
    getAllBackUpAdmin: builder.query({
      query: () => {
        return {
          url: "/admin/get-admin",
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),
    getSingleSubCategory: builder.query({
      query: (selectedCategoryId) => {
        return {
          url: `/admin/subcategory/${selectedCategoryId}`,
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),
    toggleBackUpAdminStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "PUT",
          body: { status },
        };
      },
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useCreateBackUpAdminMutation,
  useUpdateBackUpAdminMutation,
  useDeleteBackUpAdminMutation,
  useGetSingleSubCategoryQuery,
  useToggleBackUpAdminStatusMutation,
  useGetAllBackUpAdminQuery,
} = controllerApi;
