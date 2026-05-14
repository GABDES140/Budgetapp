"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/auth-provider";
import { APP_NAVIGATION } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 items-center px-5">
        <AppLogo />
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation principale">
        {APP_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground shadow-sm",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <div className="rounded-lg border bg-card p-3 text-card-foreground">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? "Espace local"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? "MVP"}</p>
            </div>
            <Badge variant="muted">V1</Badge>
          </div>
          <Button className="mt-3 w-full justify-start" variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Deconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
