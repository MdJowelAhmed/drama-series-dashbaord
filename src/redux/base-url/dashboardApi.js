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
        reportAnalytics: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (args) {
                    args.forEach((arg) => {
                        params.append(arg.name, arg.value);
                    });
                }
                return {
                url: "/dashboard/production-report",
                method: "GET",
                params,
            };
        },
            providesTags: ["Dashboard"],
        }),
    }),
})

export const {
    useUserGrowthDataQuery,
    useTopWatchDataQuery,
    useDashboardStatsQuery,
    useReportAnalyticsQuery,
} = dashboardApi;