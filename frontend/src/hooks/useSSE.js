import { useState, useEffect } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useSSE(jobId, expectedCount = 3) {
  const [status, setStatus] = useState('idle')      // idle|connecting|streaming|complete|error
  const [images, setImages] = useState(() => Array.from({ length: expectedCount }, () => null))
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jobId) return
    // Reset the transient stream view whenever a new backend job starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages(Array.from({ length: expectedCount }, () => null))
    setProgress(0)
    setError(null)
    const token = localStorage.getItem('token')
    if (!token) {
      setStatus('error')
      setError('You need to sign in again.')
      return
    }

    const streamUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/jobs/${jobId}/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(streamUrl)
    setStatus('connecting')
    setStatusText('Connecting...')

    es.addEventListener('avatar_ready', (e) => {
      const d = JSON.parse(e.data)
      setImages(prev => {
        const n = [...prev]
        const nextIndex = n.findIndex((img) => img === null)
        if (nextIndex !== -1) {
          n[nextIndex] = { url: d.imagekit_url, style: d.style_name }
        }
        return n
      })
      setProgress(prev => Math.min(prev + Math.floor(100 / Math.max(expectedCount, 1)), 99))
      setStatusText(`${d.style_name} is ready`)
      setStatus('streaming')
    })

    es.addEventListener('avatar_failed', (e) => {
      const d = JSON.parse(e.data)
      setStatus('error')
      setError(d.error_message || 'Generation failed')
      es.close()
    })

    es.addEventListener('job_completed', () => {
      setStatus('complete')
      setStatusText('Complete')
      setProgress(100)
      es.close()
    })

    es.addEventListener('error', (e) => {
      try {
        const d = JSON.parse(e.data || '{}')
        setStatus('error')
        setError(d.error || d.message || 'Generation failed')
      } catch {
        setStatus('error')
        setError('Generation failed')
      }
      es.close()
    })

    es.onerror = () => {
      if (es.readyState !== EventSource.CLOSED) {
        setStatus('error')
        setError('Connection lost')
        es.close()
      }
    }

    return () => es.close()
  }, [jobId, expectedCount])

  return { status, images, progress, statusText, error }
}
