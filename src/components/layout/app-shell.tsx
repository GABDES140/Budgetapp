"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { APP_NAVIGATION } from "@/lib/constants/navigation";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const activeItem =
    APP_NAVIGATION.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    APP_NAVIGATION[0];

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r bg-background lg:block">
        <Sidebar />
      </aside>
      <div className="min-h-screen lg:pl-72">
        <TopBar activeItem={activeItem} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
