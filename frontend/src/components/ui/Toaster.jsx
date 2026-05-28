import { useContext } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

const borderColors = {
  success: 'var(--success)',
  error: 'var(--error)',
  info: 'var(--accent)',
}

export default function Toaster() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null

  const { toasts } = ctx

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'max-w-[360px] w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm font-body text-[var(--text-primary)]',
            'shadow-[var(--shadow-elevated)]',
            toast.exiting ? 'animate-[toastExit_250ms_ease-in_forwards]' : 'animate-[toastEnter_250ms_ease-out]'
          )}
          style={{
            borderLeft: `3px solid ${borderColors[toast.type] || borderColors.info}`,
          }}
        >
          {toast.message}
        </div>
      ))}

      <style>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toastExit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(16px);
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
