import { api } from "../base-url/baseUrlApi";


const remainderApi = api.injectEndpoints({
  endpoints: (builder) => ({
  
    getAllRemainder: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
          if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/remainder",
          method: "GET",
           params,
        };
      },
      providesTags: ["Remainder"],
    }),
    createRemainder: builder.mutation({
      query: (remainder) => {
        return {
          url: "/reminder/create",
          method: "POST",
          body: remainder,
        };
      },
      invalidatesTags: ["Remainder"],
    }),
    updateRemainder: builder.mutation({
      query: ({ id, remainder }) => {
        return {
          url: `/reminder/update/${id}`,
          method: "PUT",
          body: remainder,
        };
      },
      invalidatesTags: ["Remainder"],
    }),
    deleteRemainder: builder.mutation({
      query: (id) => {
        return {
          url: `/reminder/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Remainder"],
    }),
    
  }),
});

export const {
    useCreateRemainderMutation,
    useUpdateRemainderMutation,
    useDeleteRemainderMutation,
    useGetAllRemainderQuery,
} = usersApi;
