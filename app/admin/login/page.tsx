import type { Metadata } from "next";
import { Aurora } from "@/components/ui/Aurora";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <Aurora />
      <main className="relative z-10 grid min-h-dvh place-items-center p-4">
        <LoginForm next={next} />
      </main>
    </>
  );
}
