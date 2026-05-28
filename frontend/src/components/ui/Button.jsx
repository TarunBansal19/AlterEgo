import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)]',
  ghost: 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]',
  outline: 'bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)]',
  danger: 'bg-[rgba(255,77,77,0.1)] text-[var(--error)] border border-[rgba(255,77,77,0.3)]',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-base',
}

function Spinner({ className }) {
  return (
    <span
      className={cn('inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin', className)}
      role="status"
      aria-label="Loading"
    />
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-display rounded-[var(--radius-md)] transition-all duration-150 cursor-pointer',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        loading && 'pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
