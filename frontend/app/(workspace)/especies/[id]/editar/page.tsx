import { ResourceScreen } from "@/features/especies/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="atualizar" params={values} />;
}
