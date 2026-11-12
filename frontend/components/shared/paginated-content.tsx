"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/contracts";
import { EmptyState, ErrorState, LoadingState } from "./content-state";

type Props<T> = {
  items: T[];
  meta: PaginationMeta;
  onPageChange?: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};
export function PaginatedContent<T>({
  items,
  meta,
  onPageChange,
  renderItem,
  loading = false,
  error,
  onRetry,
}: Props<T>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  const pages = Math.max(1, meta.totalPages);
  const page = Math.min(pages, Math.max(1, meta.page));
  return (
    <div className="space-y-4">
      <div aria-live="polite">
        {items.length ? items.map(renderItem) : <EmptyState />}
      </div>
      <nav
        aria-label="Paginação"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <span className="text-sm text-muted-foreground">
          Página {page} de {pages} · {meta.total} registros
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Página anterior"
            disabled={!onPageChange || page <= 1 || !meta.total}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Próxima página"
            disabled={!onPageChange || page >= pages || !meta.total}
            onClick={() => onPageChange?.(page + 1)}
          >
            Próxima
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
