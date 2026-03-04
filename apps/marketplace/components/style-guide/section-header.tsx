interface SectionHeaderProps {
  title: string
  description: string
  reference?: string
}

export function SectionHeader({ title, description, reference }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 max-w-8 bg-primary/60" />
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-2xl">
        {description}
      </p>
      {reference && (
        <span className="inline-block mt-2 text-xs font-mono text-muted-foreground/60">
          {reference}
        </span>
      )}
    </div>
  )
}
