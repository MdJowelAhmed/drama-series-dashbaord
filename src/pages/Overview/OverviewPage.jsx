import { Video, Users, CreditCard, DollarSign } from 'lucide-react';
import StatsCard from '@/components/cards/StatsCard';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import TopContentChart from '@/components/charts/TopContentChart';
import { 
  useDashboardStatsQuery, 
  useUserGrowthDataQuery, 
  useTopWatchDataQuery 
} from '@/redux/base-url/dashboardApi';

const OverviewPage = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStatsQuery();
  const { data: userGrowthData, isLoading: userGrowthLoading } = useUserGrowthDataQuery();
  const { data: topWatchData, isLoading: topWatchLoading } = useTopWatchDataQuery();

  // Transform user growth data: API returns {month, count} but chart expects {month, users}
  const transformedUserGrowth = userGrowthData?.data?.map(item => ({
    month: item.month,
    users: item.count
  })) || [];

  // Transform top watched data: API returns {title, views} but chart expects {name, views}
  const transformedTopWatch = topWatchData?.data?.map(item => ({
    name: item.title,
    views: item.views
  })) || [];

  const stats = [
    {
      title: 'Total Series',
      value: statsData?.data?.totalMovies || 0,
      icon: Video,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: 8,
    },
    {
      title: 'Total Users',
      value: (statsData?.data?.totalUsers || 0).toLocaleString(),
      icon: Users,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: 15,
    },
    {
      title: 'Active Subscriptions',
      value: (statsData?.data?.activeSubscriptions || 0).toLocaleString(),
      icon: CreditCard,
      iconBgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      trend: 10,
    },
    {
      title: 'Total Revenue',
      value: (statsData?.data?.totalRevenue || 0).toLocaleString(),
      icon: DollarSign,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Overview</h1>
        <p className="text-accent mt-1">Welcome back, here's what's happening</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userGrowthLoading ? (
          <div className="bg-secondary rounded-lg p-6 flex items-center justify-center h-[400px]">
            <p className="text-accent">Loading user growth data...</p>
          </div>
        ) : (
          <UserGrowthChart data={transformedUserGrowth} />
        )}
        {topWatchLoading ? (
          <div className="bg-secondary rounded-lg p-6 flex items-center justify-center h-[400px]">
            <p className="text-accent">Loading top watched content...</p>
          </div>
        ) : (
          <TopContentChart data={transformedTopWatch} />
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
