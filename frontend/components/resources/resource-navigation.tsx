"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ResourceDefinition } from "@/lib/contracts";
import { fillRoute } from "@/lib/forms";
import { EndpointForm } from "./endpoint-form";

export function ResourceNavigation({
  resource,
}: {
  resource: ResourceDefinition;
}) {
  const router = useRouter();
  return (
    <nav
      aria-label={`Operações de ${resource.title}`}
      className="flex flex-wrap gap-3"
    >
      {resource.endpoints.map((endpoint) =>
        endpoint.params.length ? (
          <details key={endpoint.id} className="w-full rounded-md border p-3">
            <summary className="cursor-pointer text-sm">
              {endpoint.title}
            </summary>
            <div className="pt-4">
              <EndpointForm
                fields={endpoint.params}
                submitLabel="Abrir"
                onSubmit={(values) => {
                  router.push(
                    fillRoute(
                      endpoint.route,
                      Object.fromEntries(
                        Object.entries(values).map(([key, value]) => [
                          key,
                          String(value),
                        ]),
                      ),
                    ),
                  );
                }}
              />
            </div>
          </details>
        ) : (
          <Link
            key={endpoint.id}
            href={endpoint.route}
            className="rounded-md border px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            {endpoint.title}
          </Link>
        ),
      )}
    </nav>
  );
}
