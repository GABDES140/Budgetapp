import { DashboardCanvas } from "@/components/layout/dashboard-canvas";
import { PageTransition } from "@/components/layout/page-transition";

export default function DashboardPage() {
  return (
    <PageTransition>
      <DashboardCanvas />
    </PageTransition>
  );
}
