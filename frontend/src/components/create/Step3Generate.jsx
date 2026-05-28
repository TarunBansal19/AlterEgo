import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useCreation } from '../../context/CreationContext'
import { useToast } from '../../hooks/useToast'
import { STYLE_LABELS } from '../../constants/styles'
import client from '../../api/client'
import Button from '../ui/Button'
import SSEGenerationView from '../generation/SSEGenerationView'

export default function Step3Generate() {
  const {
    uploadedPhoto,
    photoPreviewUrl,
    selectedPersonas,
    generationStatus,
    startGeneration,
    setCurrentStep,
    jobId,
  } = useCreation()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const personaLabels = selectedPersonas.map(
    (id) => STYLE_LABELS[id] || id
  )

  async function handleGenerate() {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedPhoto)

      const uploadRes = await client.post('/upload-headshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { data } = await client.post('/job', {
        prompt: `Create ${selectedPersonas.length} polished avatar portrait${selectedPersonas.length > 1 ? 's' : ''}.`,
        selected_styles: selectedPersonas,
        headshot_url: uploadRes.data.url,
        headshot_file_id: uploadRes.data.file_id,
      })

      startGeneration(data.job_id)
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || 'Failed to start generation. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (generationStatus !== 'idle') {
    return <SSEGenerationView jobId={jobId} expectedCount={selectedPersonas.length} />
  }

  return (
    <div className="animate-fadeInUp">
      <h2 className="font-display text-2xl font-semibold">Ready to create</h2>
      <p className="text-[var(--text-secondary)] text-base mt-2 mb-6">
        Blending {personaLabels.join(' + ')} · {selectedPersonas.length} images
      </p>

      <div className="flex gap-2 flex-wrap">
        {personaLabels.map((label) => (
          <span
            key={label}
            className="bg-[var(--bg-elevated)] rounded-full px-4 py-1.5 text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)] font-display"
          >
            {label}
          </span>
        ))}
      </div>

      {photoPreviewUrl && (
        <img
          src={photoPreviewUrl}
          alt="Uploaded photo"
          className="w-14 h-14 rounded-lg object-cover border border-[var(--border-subtle)] mt-5"
        />
      )}

      <Button
        size="lg"
        loading={loading}
        onClick={handleGenerate}
        className="mt-8 text-base px-8 py-3.5"
      >
        <Sparkles size={16} className="mr-1" /> Create My Alter Ego
      </Button>

      <div className="flex justify-between mt-10">
        <Button variant="ghost" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
      </div>
    </div>
  )
}
