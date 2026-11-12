"use client";

import { PaginatedContent } from "@/components/shared/paginated-content";
import { EmptyState } from "@/components/shared/content-state";
import { PageHeader } from "@/components/shared/page-header";
import type { EndpointDefinition } from "@/lib/contracts";
import { EndpointForm } from "./endpoint-form";

export function EndpointScreen({
  endpoint,
  params = {},
}: {
  endpoint: EndpointDefinition;
  params?: Record<string, string>;
}) {
  const readOnly = endpoint.method === "GET";
  const title =
    endpoint.method === "DELETE" ? "Confirmar exclusão" : endpoint.title;
  return (
    <section className="space-y-6">
      <PageHeader title={title} />
      {Object.keys(params).length > 0 && (
        <dl className="flex flex-wrap gap-4 text-sm">
          {endpoint.params.map((param) => (
            <div key={param.name}>
              <dt className="text-muted-foreground">{param.label}</dt>
              <dd className="break-all">{params[param.name]}</dd>
            </div>
          ))}
        </dl>
      )}
      {readOnly ? (
        <>
          {endpoint.query.length > 0 && (
            <details className="rounded-md border p-4">
              <summary className="cursor-pointer font-medium">Filtros</summary>
              <div className="pt-4">
                <EndpointForm
                  fields={endpoint.query}
                  submitLabel="Aplicar filtros"
                />
              </div>
            </details>
          )}
          {endpoint.query.some((field) => field.name === "page") ? (
            <PaginatedContent
              items={[]}
              meta={{ page: 1, limit: 10, total: 0, totalPages: 0 }}
              renderItem={() => null}
            />
          ) : (
            <EmptyState />
          )}
        </>
      ) : (
        <EndpointForm
          key={`${endpoint.id}:${JSON.stringify(params)}`}
          fields={endpoint.body}
          submitLabel={
            endpoint.method === "DELETE"
              ? "Excluir"
              : endpoint.method === "PATCH"
                ? "Atualizar"
                : "Confirmar"
          }
          destructive={endpoint.method === "DELETE"}
          confirmation={
            endpoint.method === "DELETE" || endpoint.body.length === 0
          }
        />
      )}
    </section>
  );
}
