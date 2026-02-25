import { api } from "./baseUrlApi";

const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        userGrowthData: builder.query({
            query: () => ({
                url: "/dashboard",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
        topWatchData: builder.query({
            query: () => ({
                url: "/top-watch-dramas",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
        dashboardStats: builder.query({
            query: () => ({
                url: "/dashboard-stats",
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