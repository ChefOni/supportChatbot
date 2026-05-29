import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await cookies()).get(COOKIE_NAME);
  const user = cookie ? verifySession(cookie.value) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <main className="ml-56 min-h-dvh px-8 py-8">{children}</main>
    </div>
  );
}
