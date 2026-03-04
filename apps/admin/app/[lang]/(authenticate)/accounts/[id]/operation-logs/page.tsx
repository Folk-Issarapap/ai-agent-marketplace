import { notFound } from "next/navigation";
import { getAccountById } from "@/actions/accounts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

export default async function AccountOperationLogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAccountById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const account = result.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operation Logs</CardTitle>
        <CardDescription>Audit/log route scaffold for {account.email}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This route mirrors admin-example structure at <code>/accounts/[id]/operation-logs</code>.
      </CardContent>
    </Card>
  );
}
