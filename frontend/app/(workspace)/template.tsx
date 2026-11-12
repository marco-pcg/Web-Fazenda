import type { ReactNode } from "react";

// Next.js remounts the form subtree on navigation; draft values never leak between records.
export default function WorkspaceTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-6">{children}</div>;
}
