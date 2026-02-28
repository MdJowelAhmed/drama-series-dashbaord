import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReusablePagination = ({
  page = 1,
  totalPage = 1,
  total = 0,
  limit = 10,
  onPageChange,
  itemLabel = "items",
  className = "",
}) => {
  if (totalPage <= 1) return null;

  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 10;
  const safeTotal = Number(total) || 0;
  const start = Math.max(1, (safePage - 1) * safeLimit + 1);
  const end = Math.min(safePage * safeLimit, safeTotal);

  const getVisiblePages = () => {
    const visibleCount = 5;
    let startPage = Math.max(1, safePage - Math.floor(visibleCount / 2));
    const endPage = Math.min(totalPage, startPage + visibleCount - 1);
    startPage = Math.max(1, endPage - visibleCount + 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`px-4 py-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${className}`}>
      <div className="text-sm text-slate-600">
        Showing {start} to {end} of {safeTotal} {itemLabel}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          variant="outline"
          size="sm"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            size="sm"
            variant={pageNumber === safePage ? "default" : "outline"}
            className="min-w-9"
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          onClick={() => onPageChange(Math.min(totalPage, safePage + 1))}
          disabled={safePage === totalPage}
          variant="outline"
          size="sm"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReusablePagination;
