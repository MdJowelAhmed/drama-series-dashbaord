import { api } from "../base-url/baseUrlApi";


const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
  
    deleteUser: builder.mutation({
      query: (id) => {
        return {
          url: `/user-management/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Admin"],
    }),
    getAllUser: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.page != null) params.append("page", String(filters.page));
        if (filters.limit != null) params.append("limit", String(filters.limit));
        if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
        if (filters.status) params.append("status", filters.status);
        if (filters.isSubscribed != null && filters.isSubscribed !== "") {
          params.append("isSubscribed", String(filters.isSubscribed));
        }

        return {
          url: "/user-management",
          method: "GET",
          params,
        };
      },
      providesTags: ["Admin"],
    }),
    getSingleUser: builder.query({
      query: (selectedUserId) => {
        return {
          url: `/admin/get-admin/${selectedUserId}`,
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),
    toggleUserStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/user-management/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: ["Admin"],
    }),
    
  }),
});

export const {
    useDeleteUserMutation,
    useGetAllUserQuery,
    useGetSingleUserQuery,
    useToggleUserStatusMutation,
} = usersApi;
