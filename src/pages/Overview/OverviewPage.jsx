import { Film, Video, Users, CreditCard } from 'lucide-react';
import StatsCard from '@/components/cards/StatsCard';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import TopContentChart from '@/components/charts/TopContentChart';
import { dummyOverviewStats } from '@/utils/dummyData';

const OverviewPage = () => {
  const stats = [
    {
      title: 'Total Dramas',
      value: dummyOverviewStats.totalDramas,
      icon: Film,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: 12,
    },
    {
      title: 'Total Movies',
      value: dummyOverviewStats.totalMovies,
      icon: Video,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: 8,
    },
    {
      title: 'Total Users',
      value: dummyOverviewStats.totalUsers.toLocaleString(),
      icon: Users,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: 15,
    },
    {
      title: 'Active Subscriptions',
      value: dummyOverviewStats.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
      iconBgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      trend: 10,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-600 mt-1">Welcome back, here's what's happening</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={dummyOverviewStats.userGrowth} />
        <TopContentChart data={dummyOverviewStats.topWatchedContent} />
      </div>
    </div>
  );
};

export default OverviewPage;
