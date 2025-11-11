import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, FileDown } from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const dramaProductionData = [
  { month: "Jan", audience: 45, subscription: 60, view: 25 },
  { month: "Feb", audience: 55, subscription: 70, view: 30 },
  { month: "Mar", audience: 40, subscription: 55, view: 35 },
  { month: "Apr", audience: 60, subscription: 75, view: 40 },
  { month: "May", audience: 50, subscription: 65, view: 45 },
  { month: "Jun", audience: 35, subscription: 50, view: 30 },
  { month: "Jul", audience: 70, subscription: 85, view: 50 },
  { month: "Aug", audience: 65, subscription: 80, view: 55 },
  { month: "Sep", audience: 75, subscription: 90, view: 60 },
  { month: "Oct", audience: 80, subscription: 95, view: 65 },
  { month: "Nov", audience: 55, subscription: 70, view: 40 },
  { month: "Dec", audience: 40, subscription: 60, view: 35 },
];

const monthOptions = [...new Set(dramaProductionData.map((d) => d.month))];
const categoryOptions = ["All", "audience", "subscription", "view"];

const maxValues = {
  audience: Math.max(...dramaProductionData.map((d) => d.audience)),
  subscription: Math.max(...dramaProductionData.map((d) => d.subscription)),
  view: Math.max(...dramaProductionData.map((d) => d.view)),
};

const Custom3DBarWithWatermark = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "#000",
  dataKey,
  payload,
}) => {
  const depth = 10;
  const maxValue = maxValues[dataKey];
  const scale = maxValue / payload[dataKey];
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
  const [fromMonth, setFromMonth] = useState(monthOptions[0]);
  const [toMonth, setToMonth] = useState(monthOptions[monthOptions.length - 1]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData = useMemo(() => {
    return dramaProductionData.filter((d) => {
      const monthIndex = monthOptions.indexOf(d.month);
      const fromIndex = monthOptions.indexOf(fromMonth);
      const toIndex = monthOptions.indexOf(toMonth);
      return monthIndex >= fromIndex && monthIndex <= toIndex;
    });
  }, [fromMonth, toMonth]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Drama Production Management Report", 14, 20);
    
    // Add filter info
    doc.setFontSize(11);
    doc.text(`Period: ${fromMonth} - ${toMonth}`, 14, 30);
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
    doc.text("Active Productions: 24 (18% increase)", 14, yPos);
    yPos += 7;
    doc.text("Cast Members: 156 (22% increase)", 14, yPos);
    yPos += 7;
    doc.text("Completed Shows: 8 (5% decrease)", 14, yPos);
    yPos += 7;
    doc.text("Attendance Rate: 94.5% (8% increase)", 14, yPos);
    
    doc.save("drama-production-report.pdf");
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredData.map((row) => ({
      Month: row.month,
      audience: row.audience,
      subscription: row.subscription,
      view: row.view,
    }));
    
    // Add statistics as separate sheet data
    const statsData = [
      { Metric: "Active Productions", Value: 24, Change: "↑18%" },
      { Metric: "Cast Members", Value: 156, Change: "↑22%" },
      { Metric: "Completed Shows", Value: 8, Change: "↓5%" },
      { Metric: "Attendance Rate", Value: "94.5%", Change: "↑8%" },
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
          Drama Production Management
        </h1>

        <div className="rounded-lg mb-6">
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4 flex-wrap items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
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
                <label className="font-semibold text-white">From:</label>
                <select
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="px-10 py-3 border border-gray-300 rounded-md bg-gray-500 text-white"
                >
                  {monthOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-white">To:</label>
                <select
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="px-10 py-3 border border-gray-300 rounded-md bg-gray-500 text-white"
                >
                  {monthOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  <Legend />

                  {(selectedCategory === "All" ||
                    selectedCategory === "audience") && (
                    <Bar
                      dataKey="audience"
                      fill="#981C2C"
                      name="audience"
                      shape={(props) => (
                        <Custom3DBarWithWatermark
                          {...props}
                          dataKey="audience"
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
                        />
                      )}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Metrics Cards */}
          <Card className="mb-6 backdrop-blur-md  p-6 rounded-lg">
            <h4 className="text-lg text-white font-semibold mb-3">
              Production Statistics
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <MetricsCards
                value="24"
                label="Active Movie"
                icons={<ChevronUp className="w-4 h-4 text-green-500" />}
                percentage="18"
              />
              <MetricsCards
                value="156"
                label="Cast Members"
                icons={<ChevronUp className="w-4 h-4 text-green-500" />}
                percentage="22"
              />
              <MetricsCards
                value="8"
                label="Total Trailer"
                icons={<ChevronDown className="w-4 h-4 text-red-500" />}
                percentage="5"
              />
              <MetricsCards
                value="94.5%"
                label="Total View"
                icons={<ChevronUp className="w-4 h-4 text-green-500" />}
                percentage="8"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DramaManagementDashboard;