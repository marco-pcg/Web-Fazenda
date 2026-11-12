import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3"
      >
        Pular para o conteúdo
      </a>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <Link href="/" className="font-semibold">
          Web Fazenda
        </Link>
        <ThemeToggle />
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-6xl space-y-6 p-4 md:p-8"
      >
        {children}
      </main>
    </div>
  );
}
