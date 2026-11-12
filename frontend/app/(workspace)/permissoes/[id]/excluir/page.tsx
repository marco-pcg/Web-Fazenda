import { ResourceScreen } from "@/features/permissoes/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="remove" params={values} />;
}
