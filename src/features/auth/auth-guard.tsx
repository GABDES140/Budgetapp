"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Verification de la session locale...
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
