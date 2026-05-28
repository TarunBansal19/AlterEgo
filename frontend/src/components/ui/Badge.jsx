import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  accent: 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/20',
  warning: 'bg-[rgba(255,200,50,0.1)] text-[#ffcc80] border border-[rgba(255,200,50,0.2)]',
  muted: 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium font-display inline-flex items-center gap-1.5',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
