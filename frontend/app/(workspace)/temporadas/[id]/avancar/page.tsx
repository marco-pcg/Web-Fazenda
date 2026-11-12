import { ResourceScreen } from "@/features/temporadas/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="avancar" params={values} />;
}
