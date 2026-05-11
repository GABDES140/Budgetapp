import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>BudgetApp</CardTitle>
          <CardDescription>Socle technique initialise pour la phase MVP.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts et Framer Motion sont prepares.
        </CardContent>
      </Card>
    </main>
  );
}
