import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

const steps = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Persona' },
  { num: 3, label: 'Generate' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-12">
      {steps.map((step, idx) => {
        const isCompleted = step.num < currentStep
        const isActive = step.num === currentStep
        const isInactive = step.num > currentStep

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-base font-display font-semibold border-2 transition-all duration-[400ms]',
                  isInactive && 'border-[var(--border-default)] text-[var(--text-muted)] bg-transparent',
                  isActive && 'border-[var(--accent)] text-[var(--accent)] bg-transparent',
                  isCompleted && 'bg-[var(--accent)] text-black border-[var(--accent)]'
                )}
              >
                {isCompleted ? <Check size={20} strokeWidth={2.5} /> : step.num}
              </div>
              <span
                className={cn(
                  'text-sm mt-2.5 font-medium',
                  isInactive && 'text-[var(--text-muted)]',
                  isActive && 'text-[var(--text-secondary)]',
                  isCompleted && 'text-[var(--accent)]'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line (not after last step) */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 relative bg-[var(--border-subtle)] rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--accent)] rounded-full transition-all duration-[400ms] ease-in-out"
                  style={{
                    width: steps[idx + 1].num <= currentStep ? '100%' : '0%',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
