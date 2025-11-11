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
  { month: "Jan", auditions: 45, rehearsals: 60, performances: 25 },
  { month: "Feb", auditions: 55, rehearsals: 70, performances: 30 },
  { month: "Mar", auditions: 40, rehearsals: 55, performances: 35 },
  { month: "Apr", auditions: 60, rehearsals: 75, performances: 40 },
  { month: "May", auditions: 50, rehearsals: 65, performances: 45 },
  { month: "Jun", auditions: 35, rehearsals: 50, performances: 30 },
  { month: "Jul", auditions: 70, rehearsals: 85, performances: 50 },
  { month: "Aug", auditions: 65, rehearsals: 80, performances: 55 },
  { month: "Sep", auditions: 75, rehearsals: 90, performances: 60 },
  { month: "Oct", auditions: 80, rehearsals: 95, performances: 65 },
  { month: "Nov", auditions: 55, rehearsals: 70, performances: 40 },
  { month: "Dec", auditions: 40, rehearsals: 60, performances: 35 },
];

const monthOptions = [...new Set(dramaProductionData.map((d) => d.month))];
const categoryOptions = ["All", "Auditions", "Rehearsals", "Performances"];

const maxValues = {
  auditions: Math.max(...dramaProductionData.map((d) => d.auditions)),
  rehearsals: Math.max(...dramaProductionData.map((d) => d.rehearsals)),
  performances: Math.max(...dramaProductionData.map((d) => d.performances)),
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
    doc.text("Auditions", 50, yPos);
    doc.text("Rehearsals", 90, yPos);
    doc.text("Performances", 130, yPos);
    
    // Add line
    doc.line(14, yPos + 2, 195, yPos + 2);
    yPos += 10;
    
    // Add data
    filteredData.forEach((row) => {
      doc.text(row.month, 14, yPos);
      doc.text(row.auditions.toString(), 50, yPos);
      doc.text(row.rehearsals.toString(), 90, yPos);
      doc.text(row.performances.toString(), 130, yPos);
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
      Auditions: row.auditions,
      Rehearsals: row.rehearsals,
      Performances: row.performances,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
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
          <Card className="bg-white/10 backdrop-blur-md rounded-lg mb-6 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white">
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
                    selectedCategory === "Auditions") && (
                    <Bar
                      dataKey="auditions"
                      fill="#981C2C"
                      name="Auditions"
                      shape={(props) => (
                        <Custom3DBarWithWatermark
                          {...props}
                          dataKey="auditions"
                        />
                      )}
                    />
                  )}
                  {(selectedCategory === "All" ||
                    selectedCategory === "Rehearsals") && (
                    <Bar
                      dataKey="rehearsals"
                      fill="#3b82f6"
                      name="Rehearsals"
                      shape={(props) => (
                        <Custom3DBarWithWatermark
                          {...props}
                          dataKey="rehearsals"
                        />
                      )}
                    />
                  )}
                  {(selectedCategory === "All" ||
                    selectedCategory === "Performances") && (
                    <Bar
                      dataKey="performances"
                      fill="#10b981"
                      name="Performances"
                      shape={(props) => (
                        <Custom3DBarWithWatermark
                          {...props}
                          dataKey="performances"
                        />
                      )}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Metrics Cards */}
          <Card className="mb-6 backdrop-blur-md bg-white/10 p-6 rounded-lg">
            <h4 className="text-lg text-white font-semibold mb-3">
              Production Statistics
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <MetricsCards
                value="24"
                label="Active Productions"
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
                label="Completed Shows"
                icons={<ChevronDown className="w-4 h-4 text-red-500" />}
                percentage="5"
              />
              <MetricsCards
                value="94.5%"
                label="Attendance Rate"
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