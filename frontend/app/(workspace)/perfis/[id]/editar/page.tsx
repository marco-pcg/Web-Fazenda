import { ResourceScreen } from "@/features/perfis/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="update" params={values} />;
}
