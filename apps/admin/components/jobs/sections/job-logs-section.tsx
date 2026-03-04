import "server-only";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { createSupabaseAdminClientWithoutCookies } from '@/utils/supabase/server-admin';
import { format } from 'date-fns';
import { History } from 'lucide-react';

type JobLogsSectionProps = {
  jobId: string;
};

export async function JobLogsSection({ jobId }: JobLogsSectionProps) {
  const adminClient = createSupabaseAdminClientWithoutCookies();
  
  const { data: logs, error } = await adminClient
    .from("job_logs")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Error loading logs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const logsList = logs || [];

  if (logsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Logs
          </CardTitle>
          <CardDescription>Activity log for this job</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No logs found for this job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Logs
        </CardTitle>
        <CardDescription>Activity log for this job ({logsList.length} entries)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logsList.map((log: any) => {
            const actionType = log.action_type || 'unknown';
            const summary = log.summary || actionType;
            const createdAt = log.created_at ? new Date(log.created_at) : null;
            const payload = log.payload || {};

            return (
              <div key={log.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{summary}</span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                        {actionType}
                      </span>
                    </div>
                    {Object.keys(payload).length > 0 && (
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  {createdAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(createdAt, "PPpp")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
