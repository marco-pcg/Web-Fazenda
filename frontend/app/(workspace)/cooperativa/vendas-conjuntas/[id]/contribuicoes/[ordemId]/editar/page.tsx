import { ResourceScreen } from "@/features/cooperativa/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; ordemId: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="alterar" params={values} />;
}
