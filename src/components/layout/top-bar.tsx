"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AppNavigationItem } from "@/lib/constants/navigation";

type TopBarProps = {
  activeItem: AppNavigationItem;
};

export function TopBar({ activeItem }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-8">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Ouvrir la navigation">
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[18rem] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted-foreground">{activeItem.description}</p>
        <h1 className="truncate text-lg font-semibold tracking-normal sm:text-xl">{activeItem.label}</h1>
      </div>

      <ThemeToggle />
    </header>
  );
}
