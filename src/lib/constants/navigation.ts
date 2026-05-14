import {
  BarChart3,
  Gauge,
  ReceiptText,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export type AppNavigationItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export const APP_NAVIGATION: AppNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Vue principale",
    icon: Gauge,
  },
  {
    label: "Transactions",
    href: "/transactions",
    description: "Mouvements financiers",
    icon: ReceiptText,
  },
  {
    label: "Analytics",
    href: "/analytics",
    description: "Analyse visuelle",
    icon: BarChart3,
  },
  {
    label: "Objectifs",
    href: "/objectifs",
    description: "Progression financiere",
    icon: Target,
  },
  {
    label: "Parametres",
    href: "/parametres",
    description: "Preferences",
    icon: Settings,
  },
];
