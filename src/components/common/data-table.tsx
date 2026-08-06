import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { TableSkeleton } from "./skeletons";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Column shown in the mobile card layout as the headline. */
  primary?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading,
  total = rows.length,
  page = 1,
  pageSize = 10,
  onPageChange,
  emptyTitle,
  emptyAction,
  rowActions,
}: DataTableProps<T>) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  if (loading) return <div className="panel"><TableSkeleton cols={columns.length} /></div>;
  if (rows.length === 0)
    return (
      <div className="panel">
        <EmptyState {...(emptyTitle ? { title: emptyTitle } : {})} action={emptyAction} />
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Desktop table */}
      <div className="panel hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn("text-xs uppercase", c.className)}>
                  {c.header}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-[1%] text-right text-xs uppercase">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} className="hover:bg-muted/40">
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn("py-2.5 text-sm", c.className)}>
                    {c.cell(row)}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell className="py-2 text-right whitespace-nowrap">{rowActions(row)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="panel p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                {columns.map((c) => (
                  <div key={c.key} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="text-xs text-muted-foreground">{c.header}</span>
                    <span className={cn(c.primary && "font-medium")}>{c.cell(row)}</span>
                  </div>
                ))}
              </div>
              {rowActions && <div className="shrink-0">{rowActions(row)}</div>}
            </div>
          </li>
        ))}
      </ul>

      {onPageChange && total > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="numeric">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="numeric px-1">
              {page} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
