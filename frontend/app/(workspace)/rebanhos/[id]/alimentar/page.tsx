import { ResourceScreen } from "@/features/rebanhos/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="alimentar" params={values} />;
}
