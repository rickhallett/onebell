interface EmptyStateProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <p className="font-serif text-lg text-foreground/60">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {children && <div className="mt-8 w-full max-w-xs">{children}</div>}
    </div>
  )
}
