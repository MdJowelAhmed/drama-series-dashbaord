import React, { useState, useMemo } from "react";
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

// Generate year options: past 3 years, current year, future 1 year
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -3; i <= 1; i++) {
    years.push(currentYear + i);
  }
  return years;
};

const yearOptions = getYearOptions();
const categoryOptions = ["All", "audience", "subscription", "view"];
const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const MetricsCards = ({ value, label, icons, percentage }) => (
  <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-white/80 mb-2">{label}</div>
    <div className="flex items-center gap-1">
      {icons}
      <span className="text-sm text-white/70">{percentage}%</span>
    </div>
  </div>
);

const StatsCard = ({ value, text }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-white/70 uppercase">{text}</div>
  </div>
);

const DramaManagementDashboard = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch data from API
  const { data: reportData, isLoading, isError } = useReportAnalyticsQuery([
    { name: "year", value: selectedYear.toString() },
  ]);

  // Extract data from API response
  const dramaProductionData = reportData?.data?.productionPipeline || [];
  const statistics = reportData?.data?.statistics || {};

  // Calculate max values for watermark effect
  const maxValues = useMemo(() => {
    if (!dramaProductionData || dramaProductionData.length === 0) {
      return { audience: 1, subscription: 1, view: 1 };
    }
    return {
      audience: Math.max(...dramaProductionData.map((d) => d.audience || 0), 1),
      subscription: Math.max(...dramaProductionData.map((d) => d.subscription || 0), 1),
      view: Math.max(...dramaProductionData.map((d) => d.view || 0), 1),
    };
  }, [dramaProductionData]);

  // Use data directly - category filtering is handled by conditional Bar rendering
  const filteredData = dramaProductionData;

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Drama Production Management Report", 14, 20);
    
    // Add filter info
    doc.setFontSize(11);
    doc.text(`Year: ${selectedYear}`, 14, 30);
    doc.text(`Category: ${selectedCategory}`, 14, 37);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 50;
    doc.text("Month", 14, yPos);
    doc.text("audience", 50, yPos);
    doc.text("subscription", 90, yPos);
    doc.text("view", 130, yPos);
    
    // Add line
    doc.line(14, yPos + 2, 195, yPos + 2);
    yPos += 10;
    
    // Add data
    filteredData.forEach((row) => {
      doc.text(row.month, 14, yPos);
      doc.text(row.audience.toString(), 50, yPos);
      doc.text(row.subscription.toString(), 90, yPos);
      doc.text(row.view.toString(), 130, yPos);
      yPos += 8;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Add statistics
    yPos += 10;
    doc.setFontSize(12);
    doc.text("Production Statistics", 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const activeMovie = statistics?.activeMovie || {};
    const totalTrailer = statistics?.totalTrailer || {};
    const totalView = statistics?.totalView || {};
    doc.text(`Active Movie: ${activeMovie.total || 0} (${activeMovie.growth || "0%"})`, 14, yPos);
    yPos += 7;
    doc.text(`Total Trailer: ${totalTrailer.total || 0} (${totalTrailer.growth || "0%"})`, 14, yPos);
    yPos += 7;
    doc.text(`Total View: ${totalView.total || 0} (${totalView.growth || "0%"})`, 14, yPos);
    
    doc.save("drama-production-report.pdf");
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredData.map((row) => ({
      Month: row.month,
      audience: row.audience || 0,
      subscription: row.subscription || 0,
      view: row.view || 0,
    }));
    
    // Add statistics as separate sheet data
    const activeMovie = statistics?.activeMovie || {};
    const totalTrailer = statistics?.totalTrailer || {};
    const totalView = statistics?.totalView || {};
    const statsData = [
      { Metric: "Active Movie", Value: activeMovie.total || 0, Change: activeMovie.growth || "0%" },
      { Metric: "Total Trailer", Value: totalTrailer.total || 0, Change: totalTrailer.growth || "0%" },
      { Metric: "Total View", Value: totalView.total || 0, Change: totalView.growth || "0%" },
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add production data sheet
    const ws1 = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws1, "Production Data");
    
    // Add statistics sheet
    const ws2 = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, ws2, "Statistics");
    
    // Save file
    XLSX.writeFile(wb, "drama-production-report.xlsx");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Series Production Management
        </h1>

        <div className="rounded-lg mb-6">
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4 flex-wrap items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export Excel
              </button>
            </div>
            
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-white">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-10 py-3 border border-gray-300 rounded-md bg-gray-500 text-white"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-white">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-10 py-3 border border-gray-300 rounded-md bg-gray-500 text-white"
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

          {/* Chart */}
          <Card className="bg-secondary rounded-lg mb-6 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-accent">
                Production Pipeline
              </h4>
              <div className="border-b-2 border-white/30 mb-4" />
            </div>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-white">Loading...</div>
              </div>
            ) : isError ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-red-500">Error loading data</div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      itemStyle={{ color: "#fff" }}
                      cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                      formatter={(value, name) =>
                        name === "subscription" ? `$${value}` : value
                      }
                    />
                    <Legend />

                    {(selectedCategory === "All" ||
                      selectedCategory === "audience") && (
                      <Bar
                        dataKey="audience"
                        fill="#CA8A04"
                        name="audience"
                        shape={(props) => (
                          <Custom3DBarWithWatermark
                            {...props}
                            dataKey="audience"
                            maxValues={maxValues}
                          />
                        )}
                      />
                    )}
                    {(selectedCategory === "All" ||
                      selectedCategory === "subscription") && (
                      <Bar
                        dataKey="subscription"
                        fill="#3b82f6"
                        name="subscription"
                        shape={(props) => (
                          <Custom3DBarWithWatermark
                            {...props}
                            dataKey="subscription"
                            maxValues={maxValues}
                          />
                        )}
                      />
                    )}
                    {(selectedCategory === "All" ||
                      selectedCategory === "view") && (
                      <Bar
                        dataKey="view"
                        fill="#10b981"
                        name="view"
                        shape={(props) => (
                          <Custom3DBarWithWatermark
                            {...props}
                            dataKey="view"
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

          {/* Metrics Cards */}
          <Card className="mb-6 backdrop-blur-md  p-6 rounded-lg">
            <h4 className="text-lg text-white font-semibold mb-3">
              Production Statistics
            </h4>
            {isLoading ? (
              <div className="text-white">Loading statistics...</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <MetricsCards
                  value={statistics?.activeMovie?.total?.toString() || "0"}
                  label="Active Movie"
                  icons={
                    statistics?.activeMovie?.growth?.startsWith("-") ? (
                      <ChevronDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-green-500" />
                    )
                  }
                  percentage={
                    statistics?.activeMovie?.growth
                      ? Math.abs(parseFloat(statistics.activeMovie.growth)).toFixed(1)
                      : "0"
                  }
                />
                <MetricsCards
                  value={statistics?.totalTrailer?.total?.toString() || "0"}
                  label="Total Trailer"
                  icons={
                    statistics?.totalTrailer?.growth?.startsWith("-") ? (
                      <ChevronDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-green-500" />
                    )
                  }
                  percentage={
                    statistics?.totalTrailer?.growth
                      ? Math.abs(parseFloat(statistics.totalTrailer.growth)).toFixed(1)
                      : "0"
                  }
                />
                <MetricsCards
                  value={statistics?.totalView?.total?.toString() || "0"}
                  label="Total View"
                  icons={
                    statistics?.totalView?.growth?.startsWith("-") ? (
                      <ChevronDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-green-500" />
                    )
                  }
                  percentage={
                    statistics?.totalView?.growth
                      ? Math.abs(parseFloat(statistics.totalView.growth)).toFixed(1)
                      : "0"
                  }
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