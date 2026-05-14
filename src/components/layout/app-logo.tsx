import { WalletCards } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export function AppLogo() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <WalletCards className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-5">{APP_NAME}</p>
        <p className="truncate text-xs text-muted-foreground">Cockpit financier</p>
      </div>
    </div>
  );
}
