import { api } from "./baseUrlApi";

const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        userGrowthData: builder.query({
            query: () => ({
                url: "/dashboard/user-growth",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
        topWatchData: builder.query({
            query: () => ({
                url: "/dashboard/top-watched",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
        dashboardStats: builder.query({
            query: () => ({
                url: "/dashboard/overview",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
    }),
})

export const {
    useUserGrowthDataQuery,
    useTopWatchDataQuery,
    useDashboardStatsQuery,
} = dashboardApi;