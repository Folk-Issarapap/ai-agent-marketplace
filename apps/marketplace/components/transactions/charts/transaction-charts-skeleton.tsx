import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export function TransactionChartsSkeleton() {
  return (
    <Card>
      <CardHeader className="h-auto py-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-64" />
              </CardDescription>
            </div>
            <Skeleton className="h-8 w-[240px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}
