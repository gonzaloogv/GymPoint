import React from 'react';

export interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  caption?: string;
  'aria-label'?: string;
}

const thClasses =
  'px-3 py-4 text-left font-semibold bg-bg dark:bg-bg-dark text-text dark:text-text-dark border-b border-border dark:border-border-dark';
const tdClasses =
  'px-3 py-4 text-subtext dark:text-subtext-dark border-b border-border dark:border-border-dark';
const centeredCellClasses = 'text-center py-8';
const loadingSpinnerClasses =
  'w-12 h-12 border-4 border-border dark:border-border-dark border-t-primary rounded-full animate-spin mx-auto';
const emptyMessageClasses = 'text-center py-8 text-text-muted';

const Table = <T extends object>({
  columns,
  data,
  rowKey,
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
            {columns.map(column => (
              <th key={column.key as string} scope="col" className={thClasses}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className={centeredCellClasses}>
                <div className={loadingSpinnerClasses} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={emptyMessageClasses}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={item[rowKey] as React.Key}>
                {columns.map(column => (
                  <td key={column.key as string} className={tdClasses}>
                    {column.render
                      ? column.render(item)
                      : (item[column.key as keyof T] as React.ReactNode)}
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