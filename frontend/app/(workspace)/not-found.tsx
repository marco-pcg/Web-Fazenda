import Link from "next/link";
import { EmptyState } from "@/components/shared/content-state";
export default function NotFound() {
  return (
    <>
      <EmptyState
        title="Registro não encontrado"
        description="Verifique o endereço e tente novamente."
      />
      <Link href="/" className="underline">
        Voltar ao início
      </Link>
    </>
  );
}
