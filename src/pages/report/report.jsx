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

/** Month API `period` like "2026-04-05" → axis label "05" only */
function formatMonthViewDayLabel(period) {
  if (typeof period !== "string") return period;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period.trim());
  return m ? m[3] : period;
}

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
          points={`${x},${watermarkY} ${x + depth},${watermarkY - depth} ${x + width + depth
            },${watermarkY - depth} ${x + width},${watermarkY}`}
          fill={fill}
        />
        <polygon
          points={`${x + width},${watermarkY} ${x + width + depth},${watermarkY - depth
            } ${x + width + depth},${watermarkY + watermarkHeight} ${x + width},${watermarkY + watermarkHeight
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
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${y - depth
          } ${x + width},${y}`}
        fill={fill}
        opacity={0.6}
      />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${x + width + depth
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

function buildBreakdownTableRows(rows) {
  return (rows || []).map((r) => ({
    period: r.period,
    revenue: r.revenue ?? 0,
    views: r.views ?? 0,
    movies: r.movies ?? 0,
    trailers: r.trailers ?? 0,
  }));
}

function buildStatisticsTableRows(stats) {
  if (!stats || typeof stats !== "object") return null;
  return [
    {
      metric: "activeMovie",
      total: stats.activeMovie?.total,
      periodCount: stats.activeMovie?.periodCount,
      growth: stats.activeMovie?.growth,
    },
    {
      metric: "totalTrailer",
      total: stats.totalTrailer?.total,
      periodCount: stats.totalTrailer?.periodCount,
      growth: stats.totalTrailer?.growth,
    },
    {
      metric: "totalView",
      total: stats.totalView?.total,
      periodCount: stats.totalView?.periodCount,
      growth: stats.totalView?.growth,
    },
    {
      metric: "totalRevenue",
      total: stats.totalRevenue?.total,
      periodCount: stats.totalRevenue?.periodAmount,
      growth: stats.totalRevenue?.growth,
    },
  ];
}

function sanitizeFileStem(stem) {
  const s = String(stem)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
  return s.slice(0, 120) || "export";
}

function downloadProductionViewPdf({ chartTitle, subtitle, metaLines, rows, fileStem }) {
  const doc = new jsPDF();
  let y = 16;
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(chartTitle, 180);
  doc.text(titleLines, 14, y);
  y += 6 * titleLines.length + 4;
  doc.setFontSize(10);
  if (subtitle) {
    const subLines = doc.splitTextToSize(subtitle, 180);
    doc.text(subLines, 14, y);
    y += 6 * subLines.length + 2;
  }
  (metaLines || []).forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });
  y += 4;
  doc.setFontSize(8);
  (rows || []).forEach((row) => {
    const line = `${row.period} | movies:${row.movies ?? 0} trailers:${row.trailers ?? 0} views:${row.views ?? 0} revenue:${row.revenue ?? 0}`;
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, y);
    y += 4 * wrapped.length + 1;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });
  doc.save(`production-report-${sanitizeFileStem(fileStem)}.pdf`);
}

function downloadProductionViewExcel({ rows, statistics, sheetName, fileStem }) {
  const wb = XLSX.utils.book_new();
  const wsMain = XLSX.utils.json_to_sheet(buildBreakdownTableRows(rows));
  XLSX.utils.book_append_sheet(wb, wsMain, sheetName.replace(/[:\\/?*[\]]/g, "").slice(0, 31));
  const statRows = buildStatisticsTableRows(statistics);
  if (statRows?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statRows), "Statistics");
  }
  XLSX.writeFile(wb, `production-report-${sanitizeFileStem(fileStem)}.xlsx`);
}

const exportBtnClass =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors";

function ProductionBreakdownChart({
  title,
  subtitle,
  filterSlot,
  breakdown,
  exportRows,
  statistics,
  exportMetaLines = [],
  fileStem,
  excelSheetName = "Breakdown",
  isLoading,
  isError,
  selectedCategory,
  maxValues,
  xAxisDataKey = "period",
  tooltipLabelKey,
  xAxisAngle = 0,
  xAxisHeight = 30,
}) {
  const data = breakdown ?? [];
  const rowsForExport = exportRows ?? breakdown;

  return (
    <Card className="bg-secondary rounded-lg mb-6 p-6">
      <div className="flex flex-wrap justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={() =>
            downloadProductionViewPdf({
              chartTitle: title,
              subtitle,
              metaLines: exportMetaLines,
              rows: rowsForExport,
              fileStem,
            })
          }
          className={`${exportBtnClass} bg-red-600 hover:bg-red-700`}
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          PDF
        </button>
        <button
          type="button"
          onClick={() =>
            downloadProductionViewExcel({
              rows: rowsForExport,
              statistics,
              sheetName: excelSheetName,
              fileStem,
            })
          }
          className={`${exportBtnClass} bg-green-600 hover:bg-green-700`}
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          Excel
        </button>
      </div>
      <div className="mb-4">
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-accent">{title}</h4>
            {subtitle ? (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            ) : null}
          </div>
          {filterSlot ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-4">
              {filterSlot}
            </div>
          ) : null}
        </div>
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
                dataKey={xAxisDataKey}
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
                labelFormatter={(_label, payload) =>
                  tooltipLabelKey && payload?.length
                    ? payload[0].payload?.[tooltipLabelKey] ?? _label
                    : _label
                }
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
  const monthStats = monthReport?.data?.statistics;
  const weekStats = weekReport?.data?.statistics;
  const dayStats = dayReport?.data?.statistics;

  const maxYear = useBreakdownMaxValues(yearBreakdown);
  const maxMonth = useBreakdownMaxValues(monthBreakdown);

  const monthBreakdownForChart = useMemo(
    () =>
      monthBreakdown.map((row) => ({
        ...row,
        periodAxis: formatMonthViewDayLabel(row.period),
      })),
    [monthBreakdown]
  );
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
          <div className="flex gap-4 mb-4 flex-wrap items-center justify-end">
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

          <ProductionBreakdownChart
            title="Production breakdown — Year view"
            subtitle={formatFilterSubtitle(yearReport?.data?.filter)}
            fileStem={`year-${yearViewYear}`}
            excelSheetName="Year"
            exportMetaLines={[
              `Bars: ${selectedCategory}`,
              `Year filter: ${yearViewYear}`,
            ]}
            statistics={yearStats}
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
            fileStem={`month-${monthViewYear}-${monthViewMonthName}`}
            excelSheetName="Month"
            exportRows={monthBreakdown}
            exportMetaLines={[
              `Bars: ${selectedCategory}`,
              `Year: ${monthViewYear}`,
              `Month: ${monthViewMonthName}`,
            ]}
            statistics={monthStats}
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
            breakdown={monthBreakdownForChart}
            isLoading={monthLoading}
            isError={monthError}
            selectedCategory={selectedCategory}
            maxValues={maxMonth}
            xAxisDataKey="periodAxis"
            tooltipLabelKey="period"
            xAxisAngle={-35}
            xAxisHeight={70}
          />

          <ProductionBreakdownChart
            title="Production breakdown — Week view"
            subtitle={formatFilterSubtitle(weekReport?.data?.filter)}
            fileStem="week"
            excelSheetName="Week"
            exportMetaLines={[`Bars: ${selectedCategory}`]}
            statistics={weekStats}
            breakdown={weekBreakdown}
            isLoading={weekLoading}
            isError={weekError}
            selectedCategory={selectedCategory}
            maxValues={maxWeek}
          />

          <ProductionBreakdownChart
            title="Production breakdown — Day view"
            subtitle={formatFilterSubtitle(dayReport?.data?.filter)}
            fileStem="day"
            excelSheetName="Day"
            exportMetaLines={[`Bars: ${selectedCategory}`]}
            statistics={dayStats}
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
