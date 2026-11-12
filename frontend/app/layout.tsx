import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContextProvider } from "@/components/providers/context-provider";
import { WorkspaceShell } from "@/components/shared/workspace-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Web Fazenda", template: "%s | Web Fazenda" },
  description: "Plataforma de gestão acadêmica e agropecuária",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ContextProvider>
          <WorkspaceShell>{children}</WorkspaceShell>
        </ContextProvider>
      </body>
    </html>
  );
}
