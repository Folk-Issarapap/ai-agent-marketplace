"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

export type ModelSelectorProps = ComponentProps<typeof Dialog> & {
  className?: string;
};

export const ModelSelector = ({ className, ...props }: ModelSelectorProps) => (
  <div className={cn(className)}>
    <Dialog {...props} />
  </div>
);

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = ({
  className,
  children,
  ...props
}: ModelSelectorTriggerProps) => (
  <DialogTrigger asChild>
    <Button
      aria-haspopup="listbox"
      aria-expanded="false"
      className={cn("w-[220px] justify-between font-normal", className)}
      role="combobox"
      variant="outline"
      {...props}
    >
      {children ?? (
        <>
          <span className="truncate">เลือก Agent</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </>
      )}
    </Button>
  </DialogTrigger>
);

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  title = "Agent Selector",
  className,
  children,
  ...props
}: ModelSelectorContentProps) => (
  <DialogContent
    className={cn("overflow-hidden p-0 shadow-lg", className)}
    showCloseButton
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
    >
      {children}
    </Command>
  </DialogContent>
);

export type ModelSelectorInputProps = ComponentProps<
  typeof CommandInput
>;

export const ModelSelectorInput = (props: ModelSelectorInputProps) => (
  <CommandInput placeholder="ค้นหา Agent..." {...props} />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = ({
  className,
  ...props
}: ModelSelectorListProps) => (
  <CommandList
    className={cn("max-h-[300px]", className)}
    {...props}
  />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => (
  <CommandEmpty>ไม่พบ Agent</CommandEmpty>
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = ({
  className,
  children,
  selected,
  ...props
}: ModelSelectorItemProps & { selected?: boolean }) => (
  <CommandItem className={cn(className)} {...props}>
    {children}
    {selected ? <Check className="ml-auto size-4 shrink-0" /> : null}
  </CommandItem>
);
