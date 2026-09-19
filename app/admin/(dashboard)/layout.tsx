import { Aurora } from "@/components/ui/Aurora";
import { AdminShell } from "@/components/admin/AdminShell";
import { isPersistent } from "@/lib/db";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Aurora />
      <AdminShell persistent={isPersistent()}>{children}</AdminShell>
    </>
  );
}
