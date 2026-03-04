import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

export function StatisticCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-0">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="border-t pt-2.5">
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
