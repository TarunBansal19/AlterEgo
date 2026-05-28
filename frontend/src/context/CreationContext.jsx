/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useContext } from 'react'

export const CreationContext = createContext(null)

export function CreationProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null)
  const [selectedPersonas, setSelectedPersonas] = useState([])
  const [jobId, setJobId] = useState(null)
  const [generationStatus, setGenerationStatus] = useState('idle') // idle | pending | streaming | complete | error

  const setPhoto = useCallback((file) => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    if (file) {
      setUploadedPhoto(file)
      setPhotoPreviewUrl(URL.createObjectURL(file))
    } else {
      setUploadedPhoto(null)
      setPhotoPreviewUrl(null)
    }
  }, [photoPreviewUrl])

  const togglePersona = useCallback((personaId, maxAllowed = 3) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        return prev.filter(id => id !== personaId)
      }
      if (prev.length >= maxAllowed) {
        return prev // max hit, don't modify state — caller handles toast
      }
      return [...prev, personaId]
    })
  }, [])

  const startGeneration = useCallback((newJobId) => {
    setJobId(newJobId)
    setGenerationStatus('streaming')
  }, [])

  const reset = useCallback(() => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    setCurrentStep(1)
    setUploadedPhoto(null)
    setPhotoPreviewUrl(null)
    setSelectedPersonas([])
    setJobId(null)
    setGenerationStatus('idle')
  }, [photoPreviewUrl])

  return (
    <CreationContext.Provider value={{
      currentStep, setCurrentStep,
      uploadedPhoto, photoPreviewUrl,
      selectedPersonas, setSelectedPersonas,
      jobId, generationStatus, setGenerationStatus,
      setPhoto, togglePersona, startGeneration, reset,
    }}>
      {children}
    </CreationContext.Provider>
  )
}

export function useCreation() {
  const ctx = useContext(CreationContext)
  if (!ctx) throw new Error('useCreation must be used within CreationProvider')
  return ctx
}
