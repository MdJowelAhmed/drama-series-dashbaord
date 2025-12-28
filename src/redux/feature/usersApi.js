import { api } from "../base-url/baseUrlApi";


const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
  
    deleteUser: builder.mutation({
      query: (id) => {
        return {
          url: `/user-management/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Admin"],
    }),
    getAllUser: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
          if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
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
