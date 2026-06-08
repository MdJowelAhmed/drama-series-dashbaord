import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useRevenueAnalyticsQuery } from "@/redux/base-url/dashboardApi";

const EXPORT_FILE_BASE = "C&S-drama-revenue-report";

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

const MONTH_VALUES = MONTH_NAMES_FULL.map((m) => m.toLowerCase());

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -3; i <= 1; i++) {
    years.push(currentYear + i);
  }
  return years;
};

const yearOptions = getYearOptions();

const getTodayParts = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
    day: now.getDate(),
  };
};

const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Start of current week (Monday) as YYYY-MM-DD */
const getCurrentWeekStartDate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return formatDateISO(monday);
};

/** Month API period "2026-05-15" → axis label "15" */
const formatMonthDayLabel = (period) => {
  if (typeof period !== "string") return period;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period.trim());
  return m ? m[3] : period;
};

const selectFilterClass =
  "px-4 py-2 border border-gray-300 rounded-md bg-gray-500 text-white min-w-[7rem]";

const exportBtnClass =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors";

function sanitizeFileStem(stem) {
  const s = String(stem)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
  return s.slice(0, 120) || "export";
}

function buildRevenueExportRows(rows) {
  return (rows || []).map((r) => ({
    period: r.period,
    revenue: r.revenue ?? 0,
  }));
}

function downloadRevenuePdf({ chartTitle, subtitle, metaLines, rows, fileStem }) {
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
    const line = `${row.period} | revenue: $${row.revenue ?? 0}`;
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, y);
    y += 4 * wrapped.length + 1;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });
  doc.save(`${EXPORT_FILE_BASE}-${sanitizeFileStem(fileStem)}.pdf`);
}

function downloadRevenueExcel({ rows, sheetName, fileStem }) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(buildRevenueExportRows(rows));
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    sheetName.replace(/[:\\/?*[\]]/g, "").slice(0, 31)
  );
  XLSX.writeFile(wb, `${EXPORT_FILE_BASE}-${sanitizeFileStem(fileStem)}.xlsx`);
}

/** YYYY-MM-DD + N calendar days → YYYY-MM-DD */
const addDaysToDate = (dateStr, days) => {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatFilterSubtitle = (filter) => {
  if (!filter) return "";
  const { view, year, month, day, range } = filter;
  const parts = [view];
  if (year) parts.push(String(year));
  if (month) parts.push(month);
  if (day != null) parts.push(`day ${day}`);
  if (range?.start && range?.end) {
    parts.push(`${range.start.slice(0, 10)} → ${range.end.slice(0, 10)}`);
  }
  return parts.join(" · ");
};

const buildRevenueQueryArgs = ({
  view,
  year,
  month,
  day,
  startDate,
  endDate,
}) => {
  const args = [{ name: "view", value: view }];

  if (view === "year") {
    args.push({ name: "year", value: String(year) });
  } else if (view === "month") {
    args.push({ name: "month", value: month });
  } else if (view === "week") {
    args.push({ name: "startDate", value: startDate });
    args.push({ name: "endDate", value: endDate });
  } else if (view === "day") {
    args.push({ name: "year", value: String(year) });
    args.push({ name: "month", value: month });
    args.push({ name: "day", value: String(day) });
  }

  return args;
};

const RevenueAnalyticsChart = () => {
  const today = getTodayParts();

  const [view, setView] = useState("year");
  const [year, setYear] = useState(today.year);
  const [monthIndex, setMonthIndex] = useState(today.monthIndex);
  const [day, setDay] = useState(today.day);
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStartDate);

  const monthValue = MONTH_VALUES[monthIndex];

  const weekEndDate = useMemo(
    () => addDaysToDate(weekStartDate, 7),
    [weekStartDate]
  );

  const queryArgs = useMemo(
    () =>
      buildRevenueQueryArgs({
        view,
        year,
        month: monthValue,
        day,
        startDate: weekStartDate,
        endDate: weekEndDate,
      }),
    [view, year, monthValue, day, weekStartDate, weekEndDate]
  );

  const { data, isLoading, isError } = useRevenueAnalyticsQuery(queryArgs);

  const breakdown = data?.data?.breakdown ?? [];
  const filter = data?.data?.filter;

  const chartData = useMemo(() => {
    if (view !== "month") return breakdown;
    return breakdown.map((row) => ({
      ...row,
      periodAxis: formatMonthDayLabel(row.period),
    }));
  }, [breakdown, view]);

  const xAxisDataKey = view === "month" ? "periodAxis" : "period";
  const xAxisAngle = view === "day" ? -35 : 0;
  const xAxisHeight = view === "day" ? 48 : 30;

  const handleViewChange = (nextView) => {
    const t = getTodayParts();
    setView(nextView);

    if (nextView === "year") {
      setYear(t.year);
    } else if (nextView === "month") {
      setMonthIndex(t.monthIndex);
    } else if (nextView === "day") {
      setYear(t.year);
      setMonthIndex(t.monthIndex);
      setDay(t.day);
    } else if (nextView === "week") {
      setWeekStartDate(getCurrentWeekStartDate());
    }
  };

  const subtitle = formatFilterSubtitle(filter);

  const exportMetaLines = useMemo(() => {
    const lines = [`View: ${view}`];
    if (view === "year") lines.push(`Year: ${year}`);
    if (view === "month") lines.push(`Month: ${MONTH_NAMES_FULL[monthIndex]}`);
    if (view === "week") {
      lines.push(`Start: ${weekStartDate}`);
      lines.push(`End: ${weekEndDate}`);
    }
    if (view === "day") {
      lines.push(`Year: ${year}`);
      lines.push(`Month: ${MONTH_NAMES_FULL[monthIndex]}`);
      lines.push(`Day: ${day}`);
    }
    return lines;
  }, [view, year, monthIndex, day, weekStartDate, weekEndDate]);

  const fileStem = useMemo(() => {
    if (view === "year") return `revenue-year-${year}`;
    if (view === "month") return `revenue-month-${MONTH_NAMES_FULL[monthIndex]}`;
    if (view === "week") return `revenue-week-${weekStartDate}-to-${weekEndDate}`;
    return `revenue-day-${year}-${MONTH_NAMES_FULL[monthIndex]}-${day}`;
  }, [view, year, monthIndex, day, weekStartDate, weekEndDate]);

  const excelSheetName = useMemo(() => {
    const names = { year: "Year", month: "Month", week: "Week", day: "Day" };
    return names[view] || "Revenue";
  }, [view]);

  return (
    <div className="bg-secondary rounded-lg mb-6 p-6">
      <div className="flex flex-wrap justify-end gap-2 mb-3">
        <button
          type="button"
          disabled={!breakdown.length || isLoading}
          onClick={() =>
            downloadRevenuePdf({
              chartTitle: "Revenue Analytics",
              subtitle,
              metaLines: exportMetaLines,
              rows: breakdown,
              fileStem,
            })
          }
          className={`${exportBtnClass} bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          PDF
        </button>
        <button
          type="button"
          disabled={!breakdown.length || isLoading}
          onClick={() =>
            downloadRevenueExcel({
              rows: breakdown,
              sheetName: excelSheetName,
              fileStem,
            })
          }
          className={`${exportBtnClass} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          Excel
        </button>
      </div>
      <div className="mb-4">
        <div className="flex flex-row justify-between items-start gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-accent">Revenue Analytics</h4>
            {subtitle ? (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <label className="text-sm font-semibold text-white">View:</label>
            <select
              value={view}
              onChange={(e) => handleViewChange(e.target.value)}
              className={selectFilterClass}
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>

            {view === "year" && (
              <>
                <label className="text-sm font-semibold text-white">Year:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            )}

            {view === "month" && (
              <>
                <label className="text-sm font-semibold text-white">Month:</label>
                <select
                  value={monthIndex}
                  onChange={(e) => setMonthIndex(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {view === "week" && (
              <>
                <label className="text-sm font-semibold text-white">Start date:</label>
                <input
                  type="date"
                  value={weekStartDate}
                  onChange={(e) => setWeekStartDate(e.target.value)}
                  className={selectFilterClass}
                />
                {weekEndDate ? (
                  <span className="text-sm text-white/60">
                    End: {weekEndDate} (+7 days)
                  </span>
                ) : null}
              </>
            )}

            {view === "day" && (
              <>
                <label className="text-sm font-semibold text-white">Year:</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <label className="text-sm font-semibold text-white">Month:</label>
                <select
                  value={monthIndex}
                  onChange={(e) => setMonthIndex(Number(e.target.value))}
                  className={selectFilterClass}
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name.slice(0, 3)}
                    </option>
                  ))}
                </select>
                <label className="text-sm font-semibold text-white">Day:</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value) || 1)}
                  className={`${selectFilterClass} w-20 min-w-[5rem]`}
                />
              </>
            )}
          </div>
        </div>
        <div className="border-b-2 border-white/30 mb-4 mt-2" />
      </div>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-white">Loading revenue...</div>
        </div>
      ) : isError ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-red-400">Error loading revenue data</div>
        </div>
      ) : !breakdown.length ? (
        <div className="h-72 flex items-center justify-center">
          <div className="text-white/70">No revenue data</div>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                interval={view === "month" ? "preserveStartEnd" : 0}
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
                  view === "month" && payload?.length
                    ? payload[0].payload?.period ?? _label
                    : _label
                }
                formatter={(value) => [`$${value}`, "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="#a855f7"
                name="Revenue"
                radius={[4, 4, 0, 0]}
                maxBarSize={view === "month" ? 12 : 48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalyticsChart;
