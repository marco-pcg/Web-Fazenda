import { ResourceScreen } from "@/features/produtos/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="editar" params={values} />;
}
