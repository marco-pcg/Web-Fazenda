import { EndpointScreen } from "@/components/resources/endpoint-screen";
import { resource } from "../definition";

type Props = {
  endpointId:
    "create" | "findAll" | "findById" | "update" | "remove" | "adicionarAluno";
  params?: Record<string, string>;
};
export function ResourceScreen({ endpointId, params }: Props) {
  const endpoint = resource.endpoints.find((item) => item.id === endpointId);
  if (!endpoint) throw new Error("Unknown endpoint for turmas.");
  return <EndpointScreen endpoint={endpoint} params={params} />;
}
