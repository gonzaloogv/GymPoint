import React from 'react';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  caption?: string;
  'aria-label'?: string;
}

const Table = <T extends { id: string | number }>({ 
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  caption,
  ...ariaProps
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full" {...ariaProps}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className="px-3 py-4 text-left font-semibold bg-bg dark:bg-bg-dark text-text dark:text-text-dark border-b border-border dark:border-border-dark"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <div className="w-12 h-12 border-4 border-border dark:border-border-dark border-t-primary rounded-full animate-spin mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className="px-3 py-4 text-subtext dark:text-subtext-dark border-b border-border dark:border-border-dark"
                  >
                    {column.render ? column.render(item) : (item[column.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
