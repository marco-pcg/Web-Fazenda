import Link from "next/link";
import { EmptyState } from "@/components/shared/content-state";
export default function NotFound() {
  return (
    <>
      <EmptyState
        title="Página não encontrada"
        description="Verifique o endereço ou volte ao início."
      />
      <Link href="/" className="underline">
        Voltar ao início
      </Link>
    </>
  );
}
