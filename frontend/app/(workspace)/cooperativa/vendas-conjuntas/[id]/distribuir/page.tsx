import { ResourceScreen } from "@/features/cooperativa/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="distribuir" params={values} />;
}
