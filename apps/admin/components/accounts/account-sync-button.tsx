"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { syncAccountsFromAuth } from "@/actions/accounts/sync-accounts.action";
import { toast } from "sonner";

export function AccountSyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAccountsFromAuth();
      
      if (result.success) {
        toast.success(
          result.message || "Accounts synced successfully",
          {
            description: result.synced !== undefined 
              ? `Synced: ${result.synced}, Failed: ${result.failed || 0}`
              : undefined,
          }
        );
      } else {
        toast.error(result.message || "Failed to sync accounts");
      }
    } catch (error) {
      toast.error("An error occurred while syncing accounts");
      console.error("[AccountSyncButton] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Syncing..." : "Sync from Auth"}
    </Button>
  );
}
