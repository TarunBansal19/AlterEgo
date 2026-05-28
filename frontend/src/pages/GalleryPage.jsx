import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import PageWrapper from '../components/layout/PageWrapper'
import GalleryGrid from '../components/gallery/GalleryGrid'
import Button from '../components/ui/Button'
import client from '../api/client'
import { STYLE_LABELS } from '../constants/styles'

export default function GalleryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/jobs')
      const galleryItems = data.flatMap((job) =>
        job.avatars
          .filter((avatar) => avatar.status === 'completed' && avatar.imagekit_url)
          .map((avatar) => ({
            id: avatar.id,
            jobId: job.id,
            style: avatar.style_name,
            styleLabel: STYLE_LABELS[avatar.style_name] || avatar.style_name,
            url: avatar.imagekit_url,
            variants: avatar.variants || {},
            createdAt: job.created_at,
          }))
      )
      setItems(galleryItems)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    try {
      await client.delete(`/avatars/${id}`)
    } catch {
      fetchData()
    }
  }

  const uniqueStyles = [...new Set(items.map((item) => item.style).filter(Boolean))]
  const filters = ['All', ...uniqueStyles]

  const filteredItems =
    activeFilter === 'All'
      ? items
      : items.filter((item) => item.style === activeFilter)

  if (loading) {
    return (
      <>
        <Navbar />
        <PageWrapper>
          <div className="max-w-[1400px] mx-auto py-10 px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-shimmer"
                />
              ))}
            </div>
          </div>
        </PageWrapper>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <PageWrapper>
          <div className="max-w-[1400px] mx-auto py-10 px-8 flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-[var(--error)] font-display font-semibold text-lg mb-5">
              {error}
            </p>
            <Button variant="primary" onClick={fetchData}>
              Retry
            </Button>
          </div>
        </PageWrapper>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="max-w-[1400px] mx-auto py-10 px-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
                Your Alter Egos
              </h1>
              <p className="text-base text-[var(--text-secondary)] mt-1">
                {items.length} images generated
              </p>
            </div>
          </div>

          {/* Filter pills */}
          {items.length > 0 && (
            <div className="flex gap-2.5 mb-8 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-display font-medium border cursor-pointer transition-all duration-150 ${
                    activeFilter === filter
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(200,241,53,0.3)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }`}
                >
                  {filter === 'All' ? 'All' : STYLE_LABELS[filter] || filter}
                </button>
              ))}
            </div>
          )}

          {/* Gallery or empty state */}
          {filteredItems.length > 0 ? (
            <GalleryGrid items={filteredItems} onDelete={handleDelete} />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center mt-24">
              <div className="w-24 h-24 mx-auto rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mb-5">
                <Sparkles size={36} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-display font-semibold text-xl">
                No alter egos yet
              </p>
              <Button
                variant="primary"
                className="mt-5"
                onClick={() => navigate('/create')}
              >
                Create Your First One
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-24">
              <p className="text-[var(--text-secondary)] font-display font-semibold text-xl">
                No results for &quot;{activeFilter}&quot;
              </p>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  )
}
