import { BarChart3 } from "lucide-react";

import { EmptyWorkspace } from "@/components/layout/empty-workspace";
import { PageTransition } from "@/components/layout/page-transition";

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <EmptyWorkspace icon={BarChart3} />
    </PageTransition>
  );
}
