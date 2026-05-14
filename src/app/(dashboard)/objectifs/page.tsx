import { Target } from "lucide-react";

import { EmptyWorkspace } from "@/components/layout/empty-workspace";
import { PageTransition } from "@/components/layout/page-transition";

export default function ObjectifsPage() {
  return (
    <PageTransition>
      <EmptyWorkspace icon={Target} />
    </PageTransition>
  );
}
