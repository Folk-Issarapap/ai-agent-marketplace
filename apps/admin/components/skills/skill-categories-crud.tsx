"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createSkillCategory, deleteSkillCategory, updateSkillCategory } from "@/actions/skills";
import type { AdminSkillCategory } from "@/actions/skills";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";

interface SkillCategoriesCrudProps {
  lang: string;
  initialCategories: AdminSkillCategory[];
}

export function SkillCategoriesCrud({ lang, initialCategories }: SkillCategoriesCrudProps) {
  const [categories, setCategories] = useState<AdminSkillCategory[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [categories]
  );

  const resetCreateForm = () => {
    setName("");
    setDisplayName("");
    setDescription("");
    setStatus("active");
  };

  const handleCreate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("displayName", displayName);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("lang", lang);

      const result = await createSkillCategory(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const normalizedDisplayName = displayName.trim() || name.trim();
      const normalizedName = (name.trim() || normalizedDisplayName.toLowerCase()).replace(/[^a-z0-9]+/g, "-");

      setCategories((prev) => [
        {
          id: crypto.randomUUID(),
          name: normalizedName,
          displayName: normalizedDisplayName,
          description: description.trim() || null,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      resetCreateForm();
      toast.success(result.message);
    });
  };

  const beginEdit = (category: AdminSkillCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDisplayName(category.displayName);
    setEditDescription(category.description || "");
    setEditStatus(category.status);
  };

  const saveEdit = (categoryId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("displayName", editDisplayName);
      formData.append("description", editDescription);
      formData.append("status", editStatus);
      formData.append("lang", lang);

      const result = await updateSkillCategory(categoryId, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCategories((prev) =>
        prev.map((item) =>
          item.id === categoryId
            ? {
                ...item,
                name: editName,
                displayName: editDisplayName,
                description: editDescription || null,
                status: editStatus,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setEditingId(null);
      toast.success(result.message);
    });
  };

  const handleDelete = (categoryId: string) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteSkillCategory(categoryId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCategories((prev) => prev.filter((item) => item.id !== categoryId));
      toast.success(result.message);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
          <CardDescription>Create and maintain canonical skill categories.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="name (slug), e.g. llm" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="display name, e.g. LLM" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input placeholder="description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select value={status} onValueChange={(value) => setStatus(value as "active" | "inactive")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="inactive">inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-end md:col-span-2">
            <Button onClick={handleCreate} disabled={isPending}>
              Create Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>List / update / delete categories</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCategories.length === 0 && <p className="text-sm text-muted-foreground">No categories found.</p>}
          {sortedCategories.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((categoryItem) => (
                  <TableRow key={categoryItem.id}>
                    <TableCell className="font-medium">
                      {editingId === categoryItem.id ? (
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      ) : (
                        categoryItem.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === categoryItem.id ? (
                        <Input value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
                      ) : (
                        categoryItem.displayName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === categoryItem.id ? (
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                      ) : (
                        categoryItem.description || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === categoryItem.id ? (
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
                        <Badge variant={categoryItem.status === "active" ? "success" : "secondary"} size="sm">
                          {categoryItem.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === categoryItem.id ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(categoryItem.id)} disabled={isPending}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => beginEdit(categoryItem)} disabled={isPending}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(categoryItem.id)} disabled={isPending}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
