import { useRef } from 'react'
import { useCreation } from '../../context/CreationContext'
import { useToast } from '../../hooks/useToast'
import { STYLE_OPTIONS } from '../../constants/styles'
import PersonaCard from './PersonaCard'
import Button from '../ui/Button'

export default function Step2Persona() {
  const { selectedPersonas, togglePersona, setCurrentStep } = useCreation()
  const toast = useToast()
  const shakeCardRef = useRef(null)

  const handleSelect = (personaId) => {
    if (selectedPersonas.length >= 3 && !selectedPersonas.includes(personaId)) {
      toast.error('You can select up to 3 styles')
      shakeCardRef.current = personaId
      return
    }
    togglePersona(personaId)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
          Choose your personas
        </h2>
      </div>

      <p className="text-[var(--text-secondary)] text-base mb-5">
        Pick up to 3 styles to blend together
      </p>

      {/* Selection counter */}
      <p className="text-base mb-5 text-[var(--text-secondary)]">
        <span className="text-[var(--accent)] font-semibold">{selectedPersonas.length}</span>/3 selected
      </p>

      {/* Persona grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STYLE_OPTIONS.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={selectedPersonas.includes(persona.id)}
            isDisabled={selectedPersonas.length >= 3 && !selectedPersonas.includes(persona.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-10">
        <Button variant="ghost" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={selectedPersonas.length === 0}
          onClick={() => setCurrentStep(3)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
