import { Inbox, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Nenhum dado carregado",
  description = "Os registros serão exibidos aqui quando estiverem disponíveis.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="grid justify-items-center gap-3 rounded-md border border-dashed p-8 text-center"
      role="status"
    >
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <h2 className="font-medium">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
export function LoadingState() {
  return (
    <div role="status" aria-label="Carregando conteúdo" className="space-y-4">
      <span className="sr-only">Carregando conteúdo</span>
      {[1, 2, 3].map((key) => (
        <Skeleton key={key} className="h-12 w-full" />
      ))}
    </div>
  );
}
export function ErrorState({
  message = "Não foi possível carregar o conteúdo.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="grid justify-items-start gap-3 rounded-md border p-6"
    >
      <AlertCircle className="size-5" aria-hidden="true" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
