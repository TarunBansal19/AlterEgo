import { useNavigate } from 'react-router-dom'
import { Sparkles, MoreHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useSSE } from '../../hooks/useSSE'
import { useCreation } from '../../context/CreationContext'
import { STYLE_LABELS } from '../../constants/styles'
import Button from '../ui/Button'

export default function SSEGenerationView({ jobId, expectedCount = 3 }) {
  const navigate = useNavigate()
  const { status, images, progress, statusText, error } = useSSE(jobId, expectedCount)
  const { reset } = useCreation()

  const completedCount = images.filter((img) => img !== null).length
  const isStreaming = status === 'streaming' || status === 'connecting'
  const isComplete = status === 'complete'
  const isError = status === 'error'

  function getSlotState(index) {
    if (images[index] !== null) return 'done'
    if (isStreaming && index === completedCount) return 'active'
    return 'waiting'
  }

  const currentImageNum = isComplete ? expectedCount : Math.min(completedCount + 1, expectedCount)

  return (
    <div className="animate-fadeInUp">
      {/* Title area */}
      <div>
        {isStreaming && (
          <h2 className="font-display text-2xl font-semibold">
            Creating your alter egos...
          </h2>
        )}
        {isComplete && (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={22} className="text-[var(--success)]" />
            <h2 className="font-display text-2xl font-semibold text-[var(--success)]">
              Your alter egos are ready!
            </h2>
          </div>
        )}
        {isError && (
          <h2 className="font-display text-2xl font-semibold">
            Generation
          </h2>
        )}
        <p className="text-base text-[var(--text-secondary)] mt-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)] mr-2"></span>
          {statusText || 'Connecting...'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full mt-5 mb-8 overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 12px rgba(200,241,53,0.4)',
          }}
        />
      </div>

      {/* 3 image slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {images.map((_, index) => {
          const slotState = getSlotState(index)
          const image = images[index]

          return (
            <div
              key={index}
              className={`aspect-[3/4] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] relative bg-[var(--bg-card)] ${
                slotState === 'active' ? 'animate-shimmer' : ''
              }`}
            >
              {slotState === 'done' && image && (
                <>
                  <img
                    src={image.url}
                    alt={image.style || `Generated image ${index + 1}`}
                    className="w-full h-full object-cover animate-imageReveal"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-display font-semibold">
                    {STYLE_LABELS[image.style] || image.style}
                  </span>
                  <span className="absolute top-3 right-3 bg-[var(--success)]/20 text-[var(--success)] text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Done
                  </span>
                </>
              )}

              {slotState === 'active' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Sparkles size={28} className="text-[var(--text-muted)] animate-pulse" />
                  <span className="text-sm text-[var(--text-muted)] mt-3">
                    Generating...
                  </span>
                </div>
              )}

              {slotState === 'waiting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MoreHorizontal size={28} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-muted)] mt-3">
                    Waiting
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status text below slots */}
      {!isError && (
        <p className="text-base text-[var(--text-secondary)] mt-5">
          Image {currentImageNum} of {expectedCount} - {statusText || 'Initializing...'}
        </p>
      )}

      {/* Complete state */}
      {isComplete && (
        <div className="mt-8">
          <div className="flex gap-4 mt-4">
            <Button onClick={() => navigate('/gallery')}>
              View in Gallery
            </Button>
            <Button variant="ghost" onClick={reset}>
              Generate Again
            </Button>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-[var(--radius-md)] p-8 text-center mt-8">
          <AlertCircle size={36} className="text-[var(--error)] mx-auto mb-4" />
          <p className="text-[var(--error)] text-base font-medium mb-5">
            {error || 'Something went wrong during generation.'}
          </p>
          <Button variant="danger" onClick={reset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
