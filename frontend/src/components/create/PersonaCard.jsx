import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function PersonaCard({ persona, isSelected, isDisabled, onSelect }) {
  const [shaking, setShaking] = useState(false)

  const handleClick = () => {
    if (isDisabled && !isSelected) {
      setShaking(true)
      setTimeout(() => setShaking(false), 300)
    }
    onSelect(persona.id)
  }

  const Icon = persona.icon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'rounded-[var(--radius-md)] overflow-hidden border transition-all duration-150 cursor-pointer relative',
        !isSelected && !isDisabled && 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:-translate-y-0.5',
        isSelected && 'border-[var(--accent)] animate-glowPulse',
        isDisabled && !isSelected && 'opacity-40 cursor-not-allowed',
        shaking && 'animate-shake'
      )}
    >
      {/* Top half — icon hero */}
      <div
        className="h-[120px] flex items-center justify-center"
        style={{ background: persona.bg }}
      >
        {Icon && <Icon size={36} style={{ color: persona.accent }} />}
      </div>

      {/* Bottom half — info */}
      <div className="bg-[var(--bg-card)] p-4">
        <p className="font-display text-sm font-semibold text-[var(--text-primary)]">
          {persona.label}
        </p>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">
          {persona.desc}
        </p>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {persona.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Selected checkmark badge */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center">
          <Check size={14} strokeWidth={2.5} />
        </div>
      )}
    </div>
  )
}
