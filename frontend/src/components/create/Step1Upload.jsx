import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { useCreation } from '../../context/CreationContext'
import Button from '../ui/Button'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
}

export default function Step1Upload() {
  const { uploadedPhoto, photoPreviewUrl, setPhoto, setCurrentStep } = useCreation()
  const [error, setError] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setError(null)

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        const code = rejection.errors[0]?.code
        if (code === 'file-too-large') {
          setError('File is too large. Maximum size is 10MB.')
        } else if (code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.')
        } else {
          setError(rejection.errors[0]?.message || 'Upload failed. Please try again.')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        setPhoto(acceptedFiles[0])
      }
    },
    [setPhoto]
  )

  const removePhoto = useCallback(() => {
    setPhoto(null)
    setError(null)
  }, [setPhoto])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  })

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
        Upload your photo
      </h2>
      <p className="text-[var(--text-secondary)] text-base mt-2 mb-8">
        Use a clear, front-facing photo for best results
      </p>

      <div
        {...getRootProps()}
        className={
          'border-2 border-dashed rounded-[var(--radius-lg)] p-12 text-center transition-all duration-150 cursor-pointer min-h-[280px] flex flex-col items-center justify-center ' +
          (isDragActive
            ? 'border-solid border-[var(--accent)] bg-[var(--accent-dim)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-focus)]')
        }
      >
        <input {...getInputProps()} />

        {photoPreviewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={photoPreviewUrl}
              alt="Uploaded preview"
              className="w-[140px] h-[140px] rounded-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removePhoto()
              }}
              className="inline-flex items-center gap-2 text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
            >
              Replace photo <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={48} className="text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-secondary)] text-base">
              Drag & drop or click to upload
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              PNG, JPG, WEBP — up to 10MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-[var(--error)] text-sm mt-3">{error}</p>
      )}

      <div className="flex justify-end mt-8">
        <Button
          variant="primary"
          disabled={!uploadedPhoto}
          onClick={() => setCurrentStep(2)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
