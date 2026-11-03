import { redirect } from "next/navigation";

export default async function LegacyPlayerDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/participants/${encodeURIComponent(id)}`);
}
