"use client";

import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type SkillsHeaderCreateButtonProps = {
  target: "skills" | "categories";
  lang: string;
};

export function SkillsHeaderCreateButton({ target, lang }: SkillsHeaderCreateButtonProps) {
  const isSkills = target === "skills";
  const href = isSkills ? `/${lang}/skills/create` : `/${lang}/skill-categories/create`;
  const label = isSkills ? "Create Skill" : "Create Category";

  return (
    <Link href={href}>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
