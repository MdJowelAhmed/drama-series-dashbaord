import { api } from "../base-url/baseUrlApi";


const authSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    otpVerify: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/auth/verify-email",
        body: data,
      }),
    }),

    login: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/auth/login",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/auth/forget-password",
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/auth/resend-otp",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => {
        const resetToken = localStorage.getItem("resetToken");
    
        return {
          url: "/auth/reset-password",
          method: "POST",
          headers: {
            "Accept": "application/json",
            token: `${resetToken}`
          },
          body: data,
        };
      },
    }),
    

    changePassword: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "/auth/change-password",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        method: "PATCH",
        url: "/users/profile",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    profile: builder.query({
      query: () => ({
        method: "GET",
        url: "/users/profile",
      }),
      providesTags: ["Auth"],
    }),
  }),

});

export const {
  useOtpVerifyMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useProfileQuery,
} = authSlice;
