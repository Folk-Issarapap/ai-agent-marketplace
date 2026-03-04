"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteAccount, updateAccount } from "@/actions/accounts/account.mutation.action";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

interface AccountsCrudProps {
  lang: string;
  initialAccounts: AdminAccount[];
}

type AdminAccount = {
  id: string;
  email: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string | null;
};

export function AccountsCrud({ lang, initialAccounts }: AccountsCrudProps) {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? "") * -1),
    [accounts]
  );

  const beginEdit = (account: AdminAccount) => {
    setEditingId(account.id);
    setEditName(account.name);
    setEditStatus(account.status);
  };

  const saveEdit = (accountId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("status", editStatus);
      formData.append("lang", lang);

      const result = await updateAccount(accountId, null, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === accountId ? { ...account, name: editName, status: editStatus } : account
        )
      );
      setEditingId(null);
    });
  };

  const handleDelete = (accountId: string) => {
    const confirmed = window.confirm("Delete this account?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteAccount(accountId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setAccounts((prev) => prev.filter((account) => account.id !== accountId));
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>List / update / delete accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedAccounts.length === 0 && <p className="text-sm text-muted-foreground">No accounts found.</p>}

          {sortedAccounts.map((account) => (
            <div
              key={account.id}
              className="grid gap-3 rounded-md border border-border/60 p-3 md:grid-cols-[1fr_1fr_120px_220px]"
            >
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{account.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                {editingId === account.id ? (
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium">{account.name}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                {editingId === account.id ? (
                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as "active" | "inactive")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm">{account.status}</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                {editingId === account.id ? (
                  <>
                    <Button size="sm" onClick={() => saveEdit(account.id)} disabled={isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/${lang}/accounts/${account.id}`}>View</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => beginEdit(account)} disabled={isPending}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(account.id)} disabled={isPending}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
