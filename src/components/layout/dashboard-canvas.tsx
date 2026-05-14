import { Card, CardContent } from "@/components/ui/card";

export function DashboardCanvas() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="min-h-32">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="h-3 w-24 rounded-full bg-muted" />
              <div className="h-8 w-8 rounded-md bg-muted" />
            </div>
            <div className="h-7 w-32 rounded-full bg-muted/80" />
            <div className="h-2.5 w-40 rounded-full bg-muted/70" />
          </CardContent>
        </Card>
      ))}
      <Card className="md:col-span-2 xl:col-span-3">
        <CardContent className="min-h-80 p-5">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="h-3 w-36 rounded-full bg-muted" />
            <div className="h-8 w-28 rounded-md bg-muted" />
          </div>
          <div className="flex h-52 items-end gap-3">
            {[42, 66, 50, 78, 58, 86, 70].map((height, index) => (
              <div key={index} className="flex flex-1 items-end">
                <div className="w-full rounded-t-md bg-muted" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 xl:col-span-1">
        <CardContent className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-full rounded-full bg-muted/90" />
                <div className="h-2 w-2/3 rounded-full bg-muted/70" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
