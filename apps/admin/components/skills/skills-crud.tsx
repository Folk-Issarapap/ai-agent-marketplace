"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createSkill, deleteSkill, updateSkill } from "@/actions/skills";
import type { AdminSkill, AdminSkillCategory } from "@/actions/skills";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";

interface SkillsCrudProps {
  lang: string;
  initialSkills: AdminSkill[];
  initialCategories: AdminSkillCategory[];
}

export function SkillsCrud({ lang, initialSkills, initialCategories }: SkillsCrudProps) {
  const [skills, setSkills] = useState<AdminSkill[]>(initialSkills);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [skills]
  );

  const categoryOptions = useMemo(() => {
    const values = initialCategories
      .filter((item) => item.status === "active")
      .map((item) => item.name);

    const merged = new Set(["general", ...values]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [initialCategories]);

  const editCategoryOptions = useMemo(() => {
    const merged = new Set([...categoryOptions, editCategory || "general"]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [categoryOptions, editCategory]);

  const resetCreateForm = () => {
    setName("");
    setDisplayName("");
    setCategory("general");
    setDescription("");
    setStatus("active");
  };

  const handleCreate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("displayName", displayName);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("lang", lang);

      const result = await createSkill(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const normalizedDisplayName = displayName.trim() || name.trim();
      const normalizedName = (name.trim() || normalizedDisplayName.toLowerCase()).replace(/[^a-z0-9]+/g, "-");
      const optimistic: AdminSkill = {
        id: crypto.randomUUID(),
        name: normalizedName,
        displayName: normalizedDisplayName,
        category: category.trim() || "general",
        description: description.trim() || null,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSkills((prev) => [optimistic, ...prev]);
      resetCreateForm();
      toast.success(result.message);
    });
  };

  const beginEdit = (skill: AdminSkill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditDisplayName(skill.displayName);
    setEditCategory(skill.category);
    setEditDescription(skill.description || "");
    setEditStatus(skill.status);
  };

  const saveEdit = (skillId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("displayName", editDisplayName);
      formData.append("category", editCategory);
      formData.append("description", editDescription);
      formData.append("status", editStatus);
      formData.append("lang", lang);

      const result = await updateSkill(skillId, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === skillId
            ? {
                ...skill,
                name: editName,
                displayName: editDisplayName,
                category: editCategory,
                description: editDescription || null,
                status: editStatus,
                updatedAt: new Date().toISOString(),
              }
            : skill
        )
      );
      setEditingId(null);
      toast.success(result.message);
    });
  };

  const handleDelete = (skillId: string) => {
    const confirmed = window.confirm("Delete this skill?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteSkill(skillId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
      toast.success(result.message);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Skill</CardTitle>
          <CardDescription>Create a canonical skill for agent matching and analytics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="name (slug), e.g. prompt-engineering" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="display name, e.g. Prompt Engineering" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="flex items-center justify-end">
            <Button onClick={handleCreate} disabled={isPending}>
              Create Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>List / update / delete skills</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSkills.length === 0 && <p className="text-sm text-muted-foreground">No skills found.</p>}

          {sortedSkills.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSkills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">
                      {editingId === skill.id ? (
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      ) : (
                        skill.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === skill.id ? (
                        <Input value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
                      ) : (
                        skill.displayName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === skill.id ? (
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {editCategoryOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        skill.category
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === skill.id ? (
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="description (optional)"
                        />
                      ) : (
                        skill.description || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === skill.id ? (
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
                        <Badge variant={skill.status === "active" ? "success" : "secondary"} size="sm">
                          {skill.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === skill.id ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(skill.id)} disabled={isPending}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => beginEdit(skill)} disabled={isPending}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(skill.id)} disabled={isPending}>
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
