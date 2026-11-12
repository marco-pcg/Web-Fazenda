import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/content-state";
import { navigation } from "@/lib/navigation";

export default function Home() {
  return (
    <>
      <PageHeader
        title="Web Fazenda"
        description="Gestão acadêmica e agropecuária"
      />
      {navigation.length ? (
        <nav aria-label="Recursos" className="grid gap-3 sm:grid-cols-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border p-4 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : (
        <EmptyState
          title="Recursos em preparação"
          description="Os módulos serão disponibilizados por etapas."
        />
      )}
    </>
  );
}
