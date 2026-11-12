import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ResourceNavigation } from "@/components/resources/resource-navigation";
import { resource } from "@/features/especies/definition";

export const metadata: Metadata = { title: "Espécies" };
export default function ResourceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <nav
        aria-label="Localização"
        className="flex flex-wrap gap-2 text-sm text-muted-foreground"
      >
        <Link href="/" className="underline">
          Início
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/especies" className="underline">
          {resource.title}
        </Link>
      </nav>
      <ResourceNavigation resource={resource} />
      {children}
    </div>
  );
}
