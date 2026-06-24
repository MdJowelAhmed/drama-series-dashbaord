import { useMemo } from 'react';
import { Video, Users, CreditCard, DollarSign, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import StatsCard from '@/components/cards/StatsCard';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import TopContentChart from '@/components/charts/TopContentChart';
import {
  useDashboardStatsQuery,
  useUserGrowthDataQuery,
  useTopWatchDataQuery,
} from '@/redux/base-url/dashboardApi';

const EXPORT_FILE_BASE = 'C&C Creepy Shorts Exhibition-overview';

const sanitizeFileStem = (stem) => {
  const s = String(stem)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-');
  return s.slice(0, 120) || 'export';
};

const buildSummaryRows = (stats) => [
  { Metric: 'Total Series', Value: stats?.totalMovies ?? 0 },
  { Metric: 'Total Users', Value: stats?.totalUsers ?? 0 },
  { Metric: 'Active Subscriptions', Value: stats?.activeSubscriptions ?? 0 },
  { Metric: 'Total Revenue', Value: stats?.totalRevenue ?? 0 },
];

const writePdfSection = (doc, title, lines, startY) => {
  let y = startY;
  if (y > 250) {
    doc.addPage();
    y = 16;
  }

  doc.setFontSize(11);
  doc.text(title, 14, y);
  y += 8;

  doc.setFontSize(8);
  (lines || []).forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), 180);
    doc.text(wrapped, 14, y);
    y += 4 * wrapped.length + 1;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });

  return y + 6;
};

const downloadOverviewPdf = ({ summaryRows, userGrowthRows, topWatchRows, fileStem }) => {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(14);
  doc.text('Dashboard Overview Export', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Exported: ${fileStem}`, 14, y);
  y += 10;

  const summaryLines = summaryRows.map((row) => `${row.Metric}: ${row.Value}`);
  y = writePdfSection(doc, 'Summary Statistics', summaryLines, y);

  const growthLines = userGrowthRows.length
    ? userGrowthRows.map((row) => `${row.Month}: ${row.Users} users`)
    : ['No user growth data'];
  y = writePdfSection(doc, 'User Growth', growthLines, y);

  const topWatchLines = topWatchRows.length
    ? topWatchRows.map((row) => `${row.Title}: ${row.Views} views`)
    : ['No top watched content data'];
  writePdfSection(doc, 'Top Watched Content', topWatchLines, y);

  doc.save(`${EXPORT_FILE_BASE}-${sanitizeFileStem(fileStem)}.pdf`);
};

const downloadOverviewExcel = ({ summaryRows, userGrowthRows, topWatchRows, fileStem }) => {
  const wb = XLSX.utils.book_new();

  const sheetRows = [
    ['Dashboard Overview Export'],
    ['Exported', fileStem],
    [],
    ['Summary Statistics'],
    ['Metric', 'Value'],
    ...summaryRows.map((row) => [row.Metric, row.Value]),
    [],
    ['User Growth'],
    ['Month', 'Users'],
    ...(userGrowthRows.length
      ? userGrowthRows.map((row) => [row.Month, row.Users])
      : [['No user growth data', '']]),
    [],
    ['Top Watched Content'],
    ['Title', 'Views'],
    ...(topWatchRows.length
      ? topWatchRows.map((row) => [row.Title, row.Views])
      : [['No top watched content data', '']]),
  ];

  const overviewSheet = XLSX.utils.aoa_to_sheet(sheetRows);
  XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');

  if (userGrowthRows.length) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(userGrowthRows),
      'User Growth'
    );
  }

  if (topWatchRows.length) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(topWatchRows),
      'Top Watched'
    );
  }

  XLSX.writeFile(wb, `${EXPORT_FILE_BASE}-${sanitizeFileStem(fileStem)}.xlsx`);
};

const exportBtnClass =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const OverviewPage = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStatsQuery();
  const { data: userGrowthData, isLoading: userGrowthLoading } = useUserGrowthDataQuery();
  const { data: topWatchData, isLoading: topWatchLoading } = useTopWatchDataQuery();

  const transformedUserGrowth = useMemo(
    () =>
      userGrowthData?.data?.growthData?.map((item) => ({
        month: item?.label,
        users: item?.count,
      })) || [],
    [userGrowthData]
  );

  const transformedTopWatch = useMemo(
    () =>
      topWatchData?.data?.data?.map((item) => ({
        name: item?.title,
        views: item?.views,
      })) || [],
    [topWatchData]
  );

  const rawStats = statsData?.data;
  const isExportDisabled = statsLoading || userGrowthLoading || topWatchLoading;

  const stats = [
    {
      title: 'Total Series',
      value: rawStats?.totalMovies || 0,
      icon: Video,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: 8,
    },
    {
      title: 'Total Users',
      value: (rawStats?.totalUsers || 0).toLocaleString(),
      icon: Users,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: 15,
    },
    {
      title: 'Active Subscriptions',
      value: (rawStats?.activeSubscriptions || 0).toLocaleString(),
      icon: CreditCard,
      iconBgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      trend: 10,
    },
    {
      title: 'Total Revenue',
      value: (rawStats?.totalRevenue || 0).toLocaleString(),
      icon: DollarSign,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: 12,
    },
  ];

  const handleExport = (format) => {
    try {
      const fileStem = new Date().toISOString().slice(0, 10);
      const userGrowthRows = (userGrowthData?.data?.growthData || []).map((item) => ({
        Month: item?.label ?? '',
        Users: item?.count ?? 0,
      }));
      const topWatchRows = (topWatchData?.data?.data || []).map((item) => ({
        Title: item?.title ?? '',
        Views: item?.views ?? 0,
      }));
      const exportPayload = {
        summaryRows: buildSummaryRows(rawStats),
        userGrowthRows,
        topWatchRows,
        fileStem,
      };

      if (format === 'pdf') {
        downloadOverviewPdf(exportPayload);
      } else {
        downloadOverviewExcel(exportPayload);
      }

      toast.success(`Overview exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(error?.message || 'Failed to export overview');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-accent">Overview</h1>
          <p className="text-accent mt-1">Welcome back, here's what's happening</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={isExportDisabled}
            className={`${exportBtnClass} bg-red-600 hover:bg-red-700`}
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            disabled={isExportDisabled}
            className={`${exportBtnClass} bg-green-600 hover:bg-green-700`}
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
