import { ResourceScreen } from "@/features/usuarios/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="findByEmail" params={values} />;
}
