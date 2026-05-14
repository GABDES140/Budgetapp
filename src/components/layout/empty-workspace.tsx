import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyWorkspaceProps = {
  icon: LucideIcon;
};

export function EmptyWorkspace({ icon: Icon }: EmptyWorkspaceProps) {
  return (
    <Card className="min-h-[360px] overflow-hidden">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <div className="mx-auto h-3 w-40 rounded-full bg-muted" />
          <div className="mx-auto h-2.5 w-64 max-w-full rounded-full bg-muted/80" />
          <div className="mx-auto h-2.5 w-52 max-w-full rounded-full bg-muted/70" />
        </div>
      </CardContent>
    </Card>
  );
}
