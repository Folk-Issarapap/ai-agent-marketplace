'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

import { Button } from '@workspace/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

interface DataTablePaginationProps {
  total: number; // Total number of items
  totalPages: number; // Total number of pages
}

export function DataTablePagination({ total, totalPages }: DataTablePaginationProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const [pageSize, setPageSize] = useQueryState(
    'pageSize',
    parseAsInteger.withDefault(20).withOptions({ shallow: false })
  );

  const getPageNumbers = () => {
    const currentPage = page ?? 1;
    const pageNumbers = [];
    const maxVisiblePages = {
      mobile: 3, // Show 3 pages on mobile
      desktop: 5, // Show 5 pages on desktop
    };
    const ellipsis = '...';

    // For mobile screens (show less pages)
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      if (totalPages <= maxVisiblePages.mobile) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage <= 2) {
          for (let i = 1; i <= 3; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push(ellipsis);
          pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 1) {
          pageNumbers.push(1);
          pageNumbers.push(ellipsis);
          for (let i = totalPages - 2; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push(ellipsis);
          pageNumbers.push(currentPage);
          pageNumbers.push(ellipsis);
          pageNumbers.push(totalPages);
        }
      }
    } else {
      // For desktop screens (show more pages)
      if (totalPages <= maxVisiblePages.desktop) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push(ellipsis);
          pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pageNumbers.push(1);
          pageNumbers.push(ellipsis);
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push(ellipsis);
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push(ellipsis);
          pageNumbers.push(totalPages);
        }
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setPage(1); // Reset to first page when changing page size
  };

  // Calculate the range of items being displayed
  const currentPage = page ?? 1;
  const currentPageSize = pageSize ?? 20;
  const start = (currentPage - 1) * currentPageSize + 1;
  const end = Math.min(currentPage * currentPageSize, total);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
        <div className="hidden sm:block">
          Showing {start} to {end} of {total} items
        </div>
        <div className="sm:hidden">
          {start}-{end} of {total} items
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 order-1 sm:order-2">
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select value={pageSize?.toString() ?? '20'} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize?.toString() ?? '20'} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={(page ?? 1) === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(Math.max((page ?? 1) - 1, 1))}
            disabled={(page ?? 1) === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {getPageNumbers().map((pageNumber, index) =>
              pageNumber === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                  {pageNumber}
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant={(page ?? 1) === pageNumber ? 'primary' : 'outline'}
                  className="h-8 w-8 p-0 hidden sm:flex"
                  onClick={() => handlePageChange(pageNumber as number)}
                >
                  {pageNumber}
                </Button>
              )
            )}
            {/* Current page indicator for mobile */}
            <span className="sm:hidden text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(Math.min((page ?? 1) + 1, totalPages))}
            disabled={(page ?? 1) === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={(page ?? 1) === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
