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
          url: "/reminder",
          method: "GET",
          params,
        };
      },
      providesTags: ["Remainder"],
    }),

    getRemainderById: builder.query({
      query: (id) => ({
        url: `/reminder/${id}`,
        method: "GET",
      }),
      providesTags: ["Remainder"],
    }),

    createRemainder: builder.mutation({
      query: (formData) => {
        return {
          url: "/reminder/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Remainder"],
    }),

    updateRemainder: builder.mutation({
      query: ({ id, formData }) => {
        return {
          url: `/reminder/update/${id}`,
          method: "PUT",
          body: formData,
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

    toggleRemainderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/reminder/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Remainder"],
    }),
  }),
});

export const {
  useCreateRemainderMutation,
  useUpdateRemainderMutation,
  useDeleteRemainderMutation,
  useGetAllRemainderQuery,
  useGetRemainderByIdQuery,
  useToggleRemainderStatusMutation,
} = remainderApi;
