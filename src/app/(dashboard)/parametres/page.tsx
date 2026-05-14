import { Settings } from "lucide-react";

import { EmptyWorkspace } from "@/components/layout/empty-workspace";
import { PageTransition } from "@/components/layout/page-transition";

export default function ParametresPage() {
  return (
    <PageTransition>
      <EmptyWorkspace icon={Settings} />
    </PageTransition>
  );
}
