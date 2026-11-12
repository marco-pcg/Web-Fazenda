import { ResourceScreen } from "@/features/usuarios/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="findById" params={values} />;
}
