import { ResourceScreen } from "@/features/eventos/components/resource-screen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const values = await params;
  return <ResourceScreen endpointId="encerrar" params={values} />;
}
