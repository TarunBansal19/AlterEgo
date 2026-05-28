import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Modal({ isOpen, onClose, title, children }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={cn(
          'relative bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-8 max-w-md w-full mx-4',
          'shadow-[var(--shadow-elevated)]',
          'animate-[modalIn_200ms_ease-out]'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title */}
        {title && (
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">
            {title}
          </h2>
        )}

        {/* Content */}
        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  )
}
