import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useTheme } from '../contexts/ThemeContext';
import { formatColumnName } from '../utils/formatColumnName';

export default function EnhancedTableViewer({ data, columns: initialColumns }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const { theme } = useTheme();

  // Convert data to table format if needed
  const tableData = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (data.length === 0) return [];
      if (typeof data[0] === 'object') {
        return data;
      }
    }
    return [];
  }, [data]);

  // Auto-generate columns from data if not provided
  const columns = useMemo(() => {
    if (initialColumns) return initialColumns;
    if (tableData.length === 0) return [];
    
    return Object.keys(tableData[0]).map((key) => ({
      accessorKey: key,
      header: formatColumnName(key),
      cell: (info) => {
        const value = info.getValue();
        if (value === null || value === undefined) {
          return <span className="text-gray-400 italic">null</span>;
        }
        if (typeof value === 'number') {
          return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        if (typeof value === 'boolean') {
          return value ? '✓' : '✗';
        }
        return String(value);
      },
      enableSorting: true,
      enableResizing: true,
      size: 150,
    }));
  }, [tableData, initialColumns]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Update selected rows when selection changes
  useMemo(() => {
    const selected = table.getSelectedRowModel().rows.map(row => row.original);
    setSelectedRows(selected);
  }, [rowSelection, table]);

  if (!tableData || tableData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No data to display
      </div>
    );
  }

  const exportSelected = () => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : tableData;
    const csv = [
      columns.map((col) => col.header).join(','),
      ...dataToExport.map((row) =>
        columns.map((col) => {
          const value = row[col.accessorKey];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative group rounded-xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 group-hover:group-hover:group-hover:transition-all duration-500 pointer-events-none rounded-xl z-0" />
      
      {/* Toolbar */}
      <div className="relative px-4 py-3 dark:dark:dark:backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30 flex items-center justify-between flex-wrap gap-3 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search table..."
              className="w-full pl-10 pr-4 py-2 text-sm border-2 border-white/30 dark:border-gray-600/50 rounded-lg backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-gray-300 dark:border-gray-700 outline-none transition-all shadow-sm"
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {table.getFilteredRowModel().rows.length} of {tableData.length} rows
            {selectedRows.length > 0 && (
              <span className="ml-2 text-gray-900 dark:text-gray-100 dark:text-gray-900 dark:text-gray-100">
                ({selectedRows.length} selected)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Column Visibility Toggle */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 text-xs font-medium backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 border border-white/30 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all shadow-sm"
              title="Toggle columns"
            >
              Columns
            </motion.button>
            <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-glass dark:shadow-glass-dark z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-2 max-h-64 overflow-y-auto">
                {table.getAllColumns().filter(col => col.getCanHide()).map((column) => (
                  <label key={column.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-gray-300 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : column.id}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {selectedRows.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={exportSelected}
              className="px-3 py-1.5 text-xs font-medium dark:dark:text-white rounded-lg hover:hover:dark:hover:dark:hover:transition-all duration-200 shadow-md hover:shadow-sm backdrop-blur-sm"
            >
              📥 Export Selected ({selectedRows.length})
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={exportSelected}
            className="px-3 py-1.5 text-xs font-medium dark:dark:text-white rounded-lg hover:hover:dark:hover:dark:hover:transition-all duration-200 shadow-md hover:shadow-sm backdrop-blur-sm"
          >
            📥 Export CSV
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto max-h-[70vh] overflow-y-auto z-10">
        <table className="min-w-full divide-y divide-white/10 dark:divide-gray-700/30">
          <thead className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 sticky top-0 z-10 border-b border-white/20 dark:border-gray-700/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {/* Select All Checkbox */}
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="rounded border-gray-300 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400 dark:text-gray-500">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted()] ?? '⇅'}
                        </span>
                      )}
                    </div>
                    {/* Column Resize Handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 bg-transparent hover:bg-gray-200 dark:bg-gray-800 cursor-col-resize ${
                          header.column.getIsResizing() ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/50 transition-colors ${
                  row.getIsSelected() ? 'bg-gray-200 dark:bg-gray-800 dark:bg-gray-800' : ''
                }`}
              >
                {/* Row Selection Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="rounded border-gray-300 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
                  />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {[5, 10, 20, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-2 py-1 text-sm rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              ««
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2 py-1 text-sm rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              ‹
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2 py-1 text-sm rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              ›
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-2 py-1 text-sm rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              »»
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
