"use client";

import { Settings2, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  addChatAgent,
  deleteChatAgent,
  getChatAgents,
  resetToDefaults,
  updateChatAgent,
  type ChatAgentItem,
} from "@/lib/chat-agents";

interface AgentManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentsChange?: (agents: ChatAgentItem[]) => void;
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "...";
}

export function AgentManagementSheet({
  open,
  onOpenChange,
  onAgentsChange,
}: AgentManagementSheetProps) {
  const [agents, setAgents] = useState<ChatAgentItem[]>(() => getChatAgents());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHost, setEditHost] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHost, setNewHost] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const refreshAgents = useCallback(() => {
    const list = getChatAgents();
    setAgents(list);
    onAgentsChange?.(list);
  }, [onAgentsChange]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      refreshAgents();
      setEditingId(null);
      setIsAdding(false);
      setNewName("");
      setNewHost("");
      setNewDescription("");
    }
    onOpenChange(next);
  };

  const startEdit = (agent: ChatAgentItem) => {
    setEditingId(agent.id);
    setEditName(agent.name);
    setEditHost(agent.host);
    setEditDescription(agent.description ?? "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = updateChatAgent(editingId, {
      name: editName.trim(),
      host: editHost.trim(),
      description: editDescription.trim() || undefined,
    });
    if (updated) {
      refreshAgents();
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => setDeleteTargetId(id);

  const confirmDelete = () => {
    if (deleteTargetId && deleteChatAgent(deleteTargetId)) {
      refreshAgents();
      setDeleteTargetId(null);
    }
  };

  const handleAdd = () => {
    const name = newName.trim();
    const host = newHost.trim();
    if (!name || !host) return;
    addChatAgent({
      name,
      host,
      description: newDescription.trim() || undefined,
    });
    refreshAgents();
    setNewName("");
    setNewHost("");
    setNewDescription("");
    setIsAdding(false);
  };

  const handleReset = () => {
    resetToDefaults();
    refreshAgents();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="size-5" />
              จัดการ Chat Agents
            </SheetTitle>
            <SheetDescription>
              เพิ่ม แก้ไข หรือลบ Cloudflare Chat Agents ที่ใช้ในแชท
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              {!isAdding ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAdding(true)}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  เพิ่ม Agent
                </Button>
              ) : null}
            </div>

            {isAdding && (
              <div className="flex shrink-0 flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                <Input
                  placeholder="ชื่อ Agent"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Host URL (เช่น https://xxx.workers.dev/agents/chat-agent)"
                  value={newHost}
                  onChange={(e) => setNewHost(e.target.value)}
                />
                <Input
                  placeholder="จุดเด่น / คำอธิบาย (ไม่บังคับ)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAdd}>
                    บันทึก
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewName("");
                      setNewHost("");
                      setNewDescription("");
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {agents.map((agent) => (
                  <li
                    key={agent.id}
                    className="flex flex-col gap-2 rounded-lg border p-3"
                  >
                    {editingId === agent.id ? (
                      <>
                        <Input
                          placeholder="ชื่อ"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <Input
                          placeholder="Host URL"
                          value={editHost}
                          onChange={(e) => setEditHost(e.target.value)}
                        />
                        <Input
                          placeholder="จุดเด่น / คำอธิบาย (ไม่บังคับ)"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            บันทึก
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => startEdit(agent)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(agent.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {truncateUrl(agent.host, 50)}
                        </p>
                        {agent.description && (
                          <p className="text-xs text-muted-foreground">
                            {agent.description}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(o) => !o && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ Agent</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ Agent นี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
