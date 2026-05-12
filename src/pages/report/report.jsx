import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileDown } from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useReportAnalyticsQuery } from "@/redux/base-url/dashboardApi";

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -3; i <= 1; i++) {
    years.push(currentYear + i);
  }
  return years;
};

const yearOptions = getYearOptions();
const categoryOptions = ["All", "movies", "trailers", "views", "revenue"];

const buildYearViewQueryArgs = (year) => [
  { name: "view", value: "year" },
  { name: "year", value: String(year) },
];

const buildMonthViewQueryArgs = (year, monthFullName) => [
  { name: "view", value: "month" },
  { name: "year", value: String(year) },
  { name: "month", value: monthFullName.toLowerCase() },
];

/** Week/day charts: only `view` — no year/month query params */
const WEEK_VIEW_QUERY_ARGS = [{ name: "view", value: "week" }];
const DAY_VIEW_QUERY_ARGS = [{ name: "view", value: "day" }];

const Custom3DBarWithWatermark = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "#000",
  dataKey,
  payload,
  maxValues,
}) => {
  const depth = 10;
  const maxValue = maxValues?.[dataKey] || 1;
  const currentValue = payload[dataKey] || 0;
  const scale = maxValue > 0 && currentValue > 0 ? maxValue / currentValue : 1;
  const watermarkHeight = height * scale;
  const watermarkY = y - (watermarkHeight - height);

  return (
    <g>
      <g opacity={0.1}>
        <rect
          x={x}
          y={watermarkY}
          width={width}
          height={watermarkHeight}
          fill={fill}
        />
        <polygon
          points={`${x},${watermarkY} ${x + depth},${watermarkY - depth} ${
            x + width + depth
          },${watermarkY - depth} ${x + width},${watermarkY}`}
          fill={fill}
        />
        <polygon
          points={`${x + width},${watermarkY} ${x + width + depth},${
            watermarkY - depth
          } ${x + width + depth},${watermarkY + watermarkHeight} ${x + width},${
            watermarkY + watermarkHeight
          }`}
          fill={fill}
        />
      </g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={0.4}
      />
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${
          y - depth
        } ${x + width},${y}`}
        fill={fill}
        opacity={0.6}
      />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${
          x + width + depth
        },${y + height} ${x + width},${y + height}`}
        fill={fill}
        opacity={0.7}
      />
    </g>
  );
};

const Card = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const MetricsCards = ({ value, label, icons, growth }) => (
  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-white/80 mb-2">{label}</div>
    <div className="flex items-center gap-1">
      {icons}
      <span className="text-sm text-white/70">{growth ?? "0%"}</span>
    </div>
  </div>
);

function useBreakdownMaxValues(breakdown) {
  return useMemo(() => {
    if (!breakdown?.length) {
      return { movies: 1, trailers: 1, views: 1, revenue: 1 };
    }
    return {
      movies: Math.max(...breakdown.map((d) => d.movies ?? 0), 1),
      trailers: Math.max(...breakdown.map((d) => d.trailers ?? 0), 1),
      views: Math.max(...breakdown.map((d) => d.views ?? 0), 1),
      revenue: Math.max(...breakdown.map((d) => d.revenue ?? 0), 1),
    };
  }, [breakdown]);
}

function ProductionBreakdownChart({
  title,
  subtitle,
  filterSlot,
  breakdown,
  isLoading,
  isError,
  selectedCategory,
  maxValues,
  xAxisAngle = 0,
  xAxisHeight = 30,
}) {
  const data = breakdown ?? [];

  return (
    <Card className="bg-secondary rounded-lg mb-6 p-6">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-accent">{title}</h4>
        {subtitle ? (
          <p className="text-sm text-white/60 mt-1">{subtitle}</p>
        ) : null}
        {filterSlot ? (
          <div className="mt-3 flex flex-wrap gap-4 items-center">{filterSlot}</div>
        ) : null}
        <div className="border-b-2 border-white/30 mb-4 mt-2" />
      </div>
      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      ) : isError ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-red-400">Error loading data</div>
        </div>
      ) : !data.length ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-white/70">No breakdown data</div>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 24, left: 8, bottom: xAxisAngle ? 48 : 8 }}
            >
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fff", fontSize: 11 }}
                angle={xAxisAngle}
                textAnchor={xAxisAngle ? "end" : "middle"}
                height={xAxisHeight}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fff", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255, 255, 255, 0.08)" }}
                formatter={(value, name) =>
                  name === "revenue" ? `$${value}` : value
                }
              />
              <Legend />

              {(selectedCategory === "All" || selectedCategory === "movies") && (
                <Bar
                  dataKey="movies"
                  fill="#CA8A04"
                  name="movies"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="movies"
                      maxValues={maxValues}
                    />
                  )}
                />
              )}
              {(selectedCategory === "All" || selectedCategory === "trailers") && (
                <Bar
                  dataKey="trailers"
                  fill="#3b82f6"
                  name="trailers"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="trailers"
                      maxValues={maxValues}
                    />
                  )}
                />
              )}
              {(selectedCategory === "All" || selectedCategory === "views") && (
                <Bar
                  dataKey="views"
                  fill="#10b981"
                  name="views"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="views"
                      maxValues={maxValues}
                    />
                  )}
                />
              )}
              {(selectedCategory === "All" || selectedCategory === "revenue") && (
                <Bar
                  dataKey="revenue"
                  fill="#a855f7"
                  name="revenue"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="revenue"
                      maxValues={maxValues}
                    />
                  )}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

const selectFilterClass =
  "px-6 py-2 border border-gray-300 rounded-md bg-gray-500 text-white min-w-[7rem]";

const DramaManagementDashboard = () => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  const [yearViewYear, setYearViewYear] = useState(currentYear);
  const [monthViewYear, setMonthViewYear] = useState(currentYear);
  const [monthViewMonthIndex, setMonthViewMonthIndex] = useState(currentMonthIdx);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const monthViewMonthName = MONTH_NAMES_FULL[monthViewMonthIndex];

  const yearQueryArgs = useMemo(
    () => buildYearViewQueryArgs(yearViewYear),
    [yearViewYear]
  );
  const monthQueryArgs = useMemo(
    () => buildMonthViewQueryArgs(monthViewYear, monthViewMonthName),
    [monthViewYear, monthViewMonthName]
  );

  const {
    data: yearReport,
    isLoading: yearLoading,
    isError: yearError,
  } = useReportAnalyticsQuery(yearQueryArgs);
  const {
    data: monthReport,
    isLoading: monthLoading,
    isError: monthError,
  } = useReportAnalyticsQuery(monthQueryArgs);
  const {
    data: weekReport,
    isLoading: weekLoading,
    isError: weekError,
  } = useReportAnalyticsQuery(WEEK_VIEW_QUERY_ARGS);
  const {
    data: dayReport,
    isLoading: dayLoading,
    isError: dayError,
  } = useReportAnalyticsQuery(DAY_VIEW_QUERY_ARGS);

  const yearBreakdown = yearReport?.data?.breakdown ?? [];
  const monthBreakdown = monthReport?.data?.breakdown ?? [];
  const weekBreakdown = weekReport?.data?.breakdown ?? [];
  const dayBreakdown = dayReport?.data?.breakdown ?? [];

  const yearStats = yearReport?.data?.statistics ?? {};

  const maxYear = useBreakdownMaxValues(yearBreakdown);
  const maxMonth = useBreakdownMaxValues(monthBreakdown);
  const maxWeek = useBreakdownMaxValues(weekBreakdown);
  const maxDay = useBreakdownMaxValues(dayBreakdown);

  const formatFilterSubtitle = (filter) => {
    if (!filter) return "";
    const { view, year, month, range } = filter;
    const parts = [`${view} · ${year}`];
    if (month && view !== "year") parts.push(month);
    if (range?.start && range?.end) {
      parts.push(`${range.start.slice(0, 10)} → ${range.end.slice(0, 10)}`);
    }
    return parts.join(" · ");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Production report (all views)", 14, 18);
    doc.setFontSize(10);
    doc.text(`Year view year: ${yearViewYear}`, 14, 28);
    doc.text(
      `Month view: ${monthViewYear} / ${monthViewMonthName} · Week/Day: direct (no query filters)`,
      14,
      35
    );
    doc.text(`Category bars: ${selectedCategory}`, 14, 42);

    const sections = [
      { label: "Year (by month)", rows: yearBreakdown },
      { label: "Month (by day)", rows: monthBreakdown },
      { label: "Week (by weekday)", rows: weekBreakdown },
      { label: "Day (by hour)", rows: dayBreakdown },
    ];

    let y = 52;
    sections.forEach(({ label, rows }) => {
      doc.setFontSize(11);
      doc.text(label, 14, y);
      y += 7;
      doc.setFontSize(8);
      rows.slice(0, 18).forEach((row) => {
        doc.text(
          `${row.period} | m:${row.movies} t:${row.trailers} v:${row.views} $:${row.revenue}`,
          14,
          y
        );
        y += 5;
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
      });
      y += 6;
    });

    doc.save("production-report.pdf");
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const addSheet = (name, rows) => {
      const sheet = XLSX.utils.json_to_sheet(
        (rows || []).map((r) => ({
          period: r.period,
          revenue: r.revenue,
          views: r.views,
          movies: r.movies,
          trailers: r.trailers,
        }))
      );
      XLSX.utils.book_append_sheet(wb, sheet, name.slice(0, 31));
    };
    addSheet("Year", yearBreakdown);
    addSheet("Month", monthBreakdown);
    addSheet("Week", weekBreakdown);
    addSheet("Day", dayBreakdown);

    const stats = yearStats;
    const statsRows = [
      {
        metric: "activeMovie",
        total: stats?.activeMovie?.total,
        period: stats?.activeMovie?.periodCount,
        growth: stats?.activeMovie?.growth,
      },
      {
        metric: "totalTrailer",
        total: stats?.totalTrailer?.total,
        period: stats?.totalTrailer?.periodCount,
        growth: stats?.totalTrailer?.growth,
      },
      {
        metric: "totalView",
        total: stats?.totalView?.total,
        period: stats?.totalView?.periodCount,
        growth: stats?.totalView?.growth,
      },
      {
        metric: "totalRevenue",
        total: stats?.totalRevenue?.total,
        period: stats?.totalRevenue?.periodAmount,
        growth: stats?.totalRevenue?.growth,
      },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsRows), "Year stats");

    XLSX.writeFile(wb, "production-report.xlsx");
  };

  const growthIcon = (growthStr) =>
    String(growthStr || "").trim().startsWith("-") ? (
      <ChevronDown className="w-4 h-4 text-red-500" />
    ) : (
      <ChevronUp className="w-4 h-4 text-green-500" />
    );

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Series Production Management
        </h1>

        <div className="rounded-lg mb-6">
          <div className="flex gap-4 mb-4 flex-wrap items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export Excel
              </button>
            </div>

            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-white">Bars:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={selectFilterClass}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ProductionBreakdownChart
            title="Production breakdown — Year view"
            subtitle={formatFilterSubtitle(yearReport?.data?.filter)}
            filterSlot={
              <>
                <label className="text-sm font-semibold text-white">Year:</label>
                <select
                  value={yearViewYear}
                  onChange={(e) => setYearViewYear(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            }
            breakdown={yearBreakdown}
            isLoading={yearLoading}
            isError={yearError}
            selectedCategory={selectedCategory}
            maxValues={maxYear}
          />

          <ProductionBreakdownChart
            title="Production breakdown — Month view"
            subtitle={formatFilterSubtitle(monthReport?.data?.filter)}
            filterSlot={
              <>
                <label className="text-sm font-semibold text-white">Year:</label>
                <select
                  value={monthViewYear}
                  onChange={(e) => setMonthViewYear(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <label className="text-sm font-semibold text-white">Month:</label>
                <select
                  value={monthViewMonthIndex}
                  onChange={(e) => setMonthViewMonthIndex(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </>
            }
            breakdown={monthBreakdown}
            isLoading={monthLoading}
            isError={monthError}
            selectedCategory={selectedCategory}
            maxValues={maxMonth}
            xAxisAngle={-35}
            xAxisHeight={70}
          />

          <ProductionBreakdownChart
            title="Production breakdown — Week view"
            subtitle={formatFilterSubtitle(weekReport?.data?.filter)}
            breakdown={weekBreakdown}
            isLoading={weekLoading}
            isError={weekError}
            selectedCategory={selectedCategory}
            maxValues={maxWeek}
          />

          <ProductionBreakdownChart
            title="Production breakdown — Day view"
            subtitle={formatFilterSubtitle(dayReport?.data?.filter)}
            breakdown={dayBreakdown}
            isLoading={dayLoading}
            isError={dayError}
            selectedCategory={selectedCategory}
            maxValues={maxDay}
            xAxisAngle={-45}
            xAxisHeight={72}
          />

          <Card className="mb-6 backdrop-blur-md p-6 rounded-lg">
            <h4 className="text-lg text-white font-semibold mb-3">
              Production statistics (year scope)
            </h4>
            {yearLoading ? (
              <div className="text-white">Loading statistics...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricsCards
                  value={yearStats?.activeMovie?.total?.toString() ?? "0"}
                  label="Active movie"
                  icons={growthIcon(yearStats?.activeMovie?.growth)}
                  growth={yearStats?.activeMovie?.growth ?? "0%"}
                />
                <MetricsCards
                  value={yearStats?.totalTrailer?.total?.toString() ?? "0"}
                  label="Total trailer"
                  icons={growthIcon(yearStats?.totalTrailer?.growth)}
                  growth={yearStats?.totalTrailer?.growth ?? "0%"}
                />
                <MetricsCards
                  value={yearStats?.totalView?.total?.toString() ?? "0"}
                  label="Total views"
                  icons={growthIcon(yearStats?.totalView?.growth)}
                  growth={yearStats?.totalView?.growth ?? "0%"}
                />
                <MetricsCards
                  value={yearStats?.totalRevenue?.total?.toString() ?? "0"}
                  label="Total revenue"
                  icons={growthIcon(yearStats?.totalRevenue?.growth)}
                  growth={yearStats?.totalRevenue?.growth ?? "0%"}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DramaManagementDashboard;
