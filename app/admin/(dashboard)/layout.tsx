import { Aurora } from "@/components/ui/Aurora";
import { AdminShell } from "@/components/admin/AdminShell";
import { isPersistent, storageLabel } from "@/lib/db";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Aurora />
      <AdminShell persistent={isPersistent()} storage={storageLabel()}>
        {children}
      </AdminShell>
    </>
  );
}
