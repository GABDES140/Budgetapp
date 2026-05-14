import { ReceiptText } from "lucide-react";

import { EmptyWorkspace } from "@/components/layout/empty-workspace";
import { PageTransition } from "@/components/layout/page-transition";

export default function TransactionsPage() {
  return (
    <PageTransition>
      <EmptyWorkspace icon={ReceiptText} />
    </PageTransition>
  );
}
