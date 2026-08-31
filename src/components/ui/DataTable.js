'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Inbox, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';
import Select from '@/components/ui/Select';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  pageSizeOptions = [10, 25, 50, 100],
  defaultSortColumn = null,
  defaultSortDirection = 'asc',
  loadingComponent = null,
  headers = [],
  skeleton = null,
  isEmpty = false,
  emptyState = null,
  children
}) {
  const isChildrenMode = Boolean(children || headers.length > 0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortColumn,
    direction: defaultSortDirection
  });

  // Reset to page 1 when data changes (e.g., on search)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Handle Sort
  const handleSort = (column) => {
    if (!column.accessor || column.sortable === false) return;

    let direction = 'asc';
    if (sortConfig.key === column.accessor && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column.accessor, direction });
  };

  // Sort and Process Data
  const processedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      // Find sorting values (handle nested accessors if needed, or fallback to key value)
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortConfig.direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortConfig.direction === 'asc'
        ? valA - valB
        : valB - valA;
    });

    return sorted;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Entry range indicators
  const startEntry = processedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, processedData.length);

  return (
    <div className="w-full space-y-4">
      {/* Table Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 min-h-[400px]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] select-none">
            <tr>
              {isChildrenMode ? (
                headers.map((headerText, idx) => (
                  <th key={idx} className="py-4 px-4 font-bold">
                    {headerText}
                  </th>
                ))
              ) : (
                columns.map((col, idx) => {
                  const isSortable = col.accessor && col.sortable !== false;
                  const isSorted = sortConfig.key === col.accessor;

                  return (
                    <th 
                      key={idx} 
                      onClick={() => isSortable && handleSort(col)}
                      className={`py-4 px-4 font-bold ${
                        isSortable ? 'cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition duration-150' : ''
                      } ${col.className || ''}`}
                    >
                      <div className={`flex items-center space-x-1.5 ${col.className?.includes('text-right') ? 'justify-end' : ''}`}>
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="text-slate-500 transition-colors">
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp size={13} className="text-primary-500" />
                              ) : (
                                <ArrowDown size={13} className="text-primary-500" />
                              )
                            ) : (
                              <ArrowUpDown size={13} className="opacity-40 group-hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {loading ? (
              skeleton ? (
                skeleton
              ) : loadingComponent ? (
                loadingComponent
              ) : (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {(isChildrenMode ? headers : columns).map((_, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-4 bg-slate-800/80 rounded-md w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              )
            ) : isChildrenMode ? (
              isEmpty ? (
                <tr>
                  <td colSpan={headers.length || 1} className="py-16 text-center text-slate-500">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Inbox className="w-10 h-10 text-slate-600 opacity-60" />
                        <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                children
              )
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || rIdx} className="hover:bg-slate-800/20 transition-all duration-150">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`py-4 px-4 ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length || 1} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Inbox className="w-10 h-10 text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && processedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 px-1 select-none">
          {/* Entries Info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <div className="w-[70px]">
                <Select
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                  options={pageSizeOptions}
                  size="sm"
                  triggerClassName="border-slate-700 bg-slate-800/80 text-slate-200"
                />
              </div>
              <span>entries</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Showing {startEntry} to {endEntry} of {processedData.length} entries
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition duration-150"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition duration-150"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page number buttons / indicators */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Only show page number if it is near the current page to avoid clutter
                if (
                  totalPages > 5 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 && currentPage > 3) return <span key={idx} className="px-1.5 text-slate-600">...</span>;
                  if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={idx} className="px-1.5 text-slate-600">...</span>;
                  return null;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-8 h-8 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-600/25'
                        : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition duration-150"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition duration-150"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Pagination Footer Loading Skeleton */}
      {loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs px-1 select-none animate-pulse">
          {/* Entries Info Skeleton */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <div className="h-3 bg-slate-800/80 rounded w-8"></div>
              <div className="h-7 bg-slate-800/80 rounded-xl w-14"></div>
              <div className="h-3 bg-slate-800/80 rounded w-10"></div>
            </div>
            <div className="h-3 bg-slate-800/40 rounded w-36"></div>
          </div>

          {/* Navigation Controls Skeleton */}
          <div className="flex items-center space-x-1.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800/80"></div>
            <div className="w-8 h-8 rounded-xl bg-slate-800/80"></div>
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 rounded-xl bg-slate-800/80"></div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-800/80"></div>
            <div className="w-8 h-8 rounded-xl bg-slate-800/80"></div>
          </div>
        </div>
      )}
    </div>
  );
}
