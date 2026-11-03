import { redirect } from "next/navigation";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAdminAccess();

  if (!auth.authorized || !auth.email) {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={auth.email}>{children}</AdminShell>;
}

