import jsPDF from "jspdf";

const MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const BOTTOM_MARGIN = 18;

const TABLE = {
  headerHeight: 9,
  rowHeight: 8,
  headerFontSize: 9,
  bodyFontSize: 9,
  cellPaddingX: 3,
};

const MONTH_SORT_INDEX = Object.fromEntries(
  [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].map((name, index) => [name, index])
);

const WEEKDAY_SORT_INDEX = {
  monday: 0,
  mon: 0,
  tuesday: 1,
  tue: 1,
  tues: 1,
  wednesday: 2,
  wed: 2,
  thursday: 3,
  thu: 3,
  thur: 3,
  thurs: 3,
  friday: 4,
  fri: 4,
  saturday: 5,
  sat: 5,
  sunday: 6,
  sun: 6,
};

function getMonthSortIndex(period) {
  const lower = String(period).trim().toLowerCase();
  if (MONTH_SORT_INDEX[lower] != null) return MONTH_SORT_INDEX[lower];

  const abbrev = lower.slice(0, 3);
  return Object.entries(MONTH_SORT_INDEX).find(([name]) =>
    name.startsWith(abbrev)
  )?.[1];
}

function getPeriodSortKey(period) {
  if (period == null) return [9, 0];

  const raw = String(period).trim();
  const lower = raw.toLowerCase();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) {
    return [0, Date.parse(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00`)];
  }

  const monthIdx = getMonthSortIndex(raw);
  if (monthIdx != null) return [1, monthIdx];

  const weekdayIdx = WEEKDAY_SORT_INDEX[lower] ?? WEEKDAY_SORT_INDEX[lower.slice(0, 3)];
  if (weekdayIdx != null) return [2, weekdayIdx];

  if (/^\d{1,2}$/.test(raw)) return [3, Number(raw)];

  return [9, lower];
}

function comparePeriodKeys(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] < b[1]) return -1;
  if (a[1] > b[1]) return 1;
  return 0;
}

export function sortRowsByPeriod(rows) {
  return [...(rows || [])].sort((a, b) =>
    comparePeriodKeys(getPeriodSortKey(a.period), getPeriodSortKey(b.period))
  );
}

function asciiSafe(text) {
  return String(text ?? "")
    .replace(/\u2192/g, " to ")
    .replace(/\u00b7/g, " | ")
    .replace(/[^\x20-\x7E]/g, "");
}

export function sanitizeFileStem(stem) {
  const s = String(stem)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
  return s.slice(0, 120) || "export";
}

function formatCount(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
}

function formatCurrency(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "$0";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function drawPageHeader(doc, { chartTitle, subtitle, metaLines }, yStart) {
  let y = yStart;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(asciiSafe(chartTitle), PAGE_WIDTH - MARGIN * 2);
  doc.text(titleLines, MARGIN, y);
  y += 7 * titleLines.length + 3;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const subLines = doc.splitTextToSize(asciiSafe(subtitle), PAGE_WIDTH - MARGIN * 2);
    doc.text(subLines, MARGIN, y);
    y += 6 * subLines.length + 2;
  }

  if (metaLines?.length) {
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    metaLines.forEach((line) => {
      doc.text(asciiSafe(line), MARGIN, y);
      y += 6;
    });
  }

  y += 4;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;

  return y;
}

function drawTableHeader(doc, columns, y) {
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);

  doc.setFillColor(31, 41, 55);
  doc.rect(MARGIN, y, tableWidth, TABLE.headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(TABLE.headerFontSize);
  doc.setTextColor(255, 255, 255);

  let x = MARGIN;
  columns.forEach((col) => {
    const textX =
      col.align === "right"
        ? x + col.width - TABLE.cellPaddingX
        : x + TABLE.cellPaddingX;
    doc.text(col.header, textX, y + 6, {
      align: col.align === "right" ? "right" : "left",
      maxWidth: col.width - TABLE.cellPaddingX * 2,
    });
    x += col.width;
  });

  return y + TABLE.headerHeight;
}

function drawTableRow(doc, columns, row, y, isAlt) {
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);

  if (isAlt) {
    doc.setFillColor(249, 250, 251);
    doc.rect(MARGIN, y, tableWidth, TABLE.rowHeight, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(TABLE.bodyFontSize);
  doc.setTextColor(31, 41, 55);

  let x = MARGIN;
  columns.forEach((col) => {
    const raw = col.getValue ? col.getValue(row) : row[col.key];
    const text = col.format ? col.format(raw, row) : String(raw ?? "");
    const textX =
      col.align === "right"
        ? x + col.width - TABLE.cellPaddingX
        : x + TABLE.cellPaddingX;
    doc.text(text, textX, y + 5.5, {
      align: col.align === "right" ? "right" : "left",
      maxWidth: col.width - TABLE.cellPaddingX * 2,
    });
    x += col.width;
  });

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.15);
  doc.line(MARGIN, y + TABLE.rowHeight, MARGIN + tableWidth, y + TABLE.rowHeight);

  return y + TABLE.rowHeight;
}

function drawTable(doc, columns, rows, startY, headerContext) {
  let y = startY;
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const ensureSpace = (needed) => {
    if (y + needed <= PAGE_HEIGHT - BOTTOM_MARGIN) return;
    doc.addPage();
    y = drawPageHeader(doc, headerContext, MARGIN);
    y = drawTableHeader(doc, columns, y);
  };

  y = drawTableHeader(doc, columns, y);

  rows.forEach((row, index) => {
    ensureSpace(TABLE.rowHeight);
    y = drawTableRow(doc, columns, row, y, index % 2 === 1);
  });

  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, startY, tableWidth, y - startY);
  return y;
}

export function downloadReportPdf({
  fileBase,
  chartTitle,
  subtitle,
  metaLines,
  columns,
  rows,
  fileStem,
}) {
  const doc = new jsPDF();
  const headerContext = { chartTitle, subtitle, metaLines };
  const tableStartY = drawPageHeader(doc, headerContext, MARGIN);
  drawTable(doc, columns, sortRowsByPeriod(rows), tableStartY, headerContext);
  doc.save(`${fileBase}-${sanitizeFileStem(fileStem)}.pdf`);
}

function drawSectionTitle(doc, title, y, headerContext) {
  const ensureSpace = (needed) => {
    if (y + needed <= PAGE_HEIGHT - BOTTOM_MARGIN) return;
    doc.addPage();
    y = drawPageHeader(doc, headerContext, MARGIN);
  };

  ensureSpace(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text(asciiSafe(title), MARGIN, y);
  y += 5;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;
  return y;
}

function drawNoData(doc, y, headerContext) {
  if (y > PAGE_HEIGHT - BOTTOM_MARGIN - 14) {
    doc.addPage();
    y = drawPageHeader(doc, headerContext, MARGIN);
  }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("No data", MARGIN, y);
  return y + 10;
}

export function downloadReportPdfSections({
  fileBase,
  chartTitle,
  subtitle,
  metaLines,
  sections,
  fileStem,
}) {
  const doc = new jsPDF();
  const headerContext = { chartTitle, subtitle, metaLines };
  let y = drawPageHeader(doc, headerContext, MARGIN);

  (sections || []).forEach((section) => {
    y = drawSectionTitle(doc, section.title, y, headerContext);
    const rows = section.sortRows ? sortRowsByPeriod(section.rows) : section.rows || [];
    if (!rows.length) {
      y = drawNoData(doc, y, headerContext);
      return;
    }
    y = drawTable(doc, section.columns, rows, y, headerContext) + 10;
  });

  doc.save(`${fileBase}-${sanitizeFileStem(fileStem)}.pdf`);
}

export const PRODUCTION_BREAKDOWN_COLUMNS = [
  { header: "Period", key: "period", width: 42, align: "left" },
  {
    header: "Series",
    width: 28,
    align: "right",
    getValue: (row) => row.movies ?? row.series ?? 0,
    format: formatCount,
  },
  {
    header: "Trailers",
    key: "trailers",
    width: 28,
    align: "right",
    format: formatCount,
  },
  {
    header: "Views",
    key: "views",
    width: 28,
    align: "right",
    format: formatCount,
  },
  {
    header: "Revenue",
    key: "revenue",
    width: 34,
    align: "right",
    format: formatCurrency,
  },
];

export const REVENUE_BREAKDOWN_COLUMNS = [
  { header: "Period", key: "period", width: 40, align: "left" },
  {
    header: "Revenue",
    key: "revenue",
    width: 32,
    align: "right",
    format: formatCurrency,
  },
  {
    header: "Weekly",
    key: "weekly",
    width: 32,
    align: "right",
    format: formatCurrency,
  },
  {
    header: "Monthly",
    key: "monthly",
    width: 32,
    align: "right",
    format: formatCurrency,
  },
  {
    header: "Yearly",
    key: "yearly",
    width: 32,
    align: "right",
    format: formatCurrency,
  },
];
