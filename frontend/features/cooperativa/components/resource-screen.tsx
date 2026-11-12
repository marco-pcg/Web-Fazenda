import { EndpointScreen } from "@/components/resources/endpoint-screen";
import { resource } from "../definition";

type Props = {
  endpointId:
    | "listar"
    | "criar"
    | "detalhe"
    | "contribuir"
    | "alterar"
    | "retirar"
    | "distribuir"
    | "extrato";
  params?: Record<string, string>;
};
export function ResourceScreen({ endpointId, params }: Props) {
  const endpoint = resource.endpoints.find((item) => item.id === endpointId);
  if (!endpoint) throw new Error("Unknown endpoint for cooperativa.");
  return <EndpointScreen endpoint={endpoint} params={params} />;
}
