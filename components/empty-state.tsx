interface EmptyStateProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <p className="text-lg text-foreground/60">{title}</p>
      <p className="mt-1 text-sm text-foreground/40">{description}</p>
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  )
}
