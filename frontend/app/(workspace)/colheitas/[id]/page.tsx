import { ResourceScreen } from "@/features/colheitas/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="findOne" params={values} />;
}
