"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "◆" },
  { href: "/dashboard/conversations", label: "Conversations", icon: "◇" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="flex w-56 flex-col border-r border-foreground/10 px-4 py-6">
      <Link
        href="/dashboard"
        className="font-display text-lg font-semibold tracking-tight text-brand"
      >
        baki
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
      >
        Logout
      </button>
    </aside>
  );
}
