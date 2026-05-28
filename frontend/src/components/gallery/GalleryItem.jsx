import { useState } from 'react'
import { Download, Trash2, Image } from 'lucide-react'
import { STYLE_ICON_META, STYLE_LABELS } from '../../constants/styles'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function GalleryItem({ item, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const styleData = STYLE_ICON_META[item.style] || { icon: Image, color: '#888888' }
  const FallbackIcon = styleData.icon
  const label = item.styleLabel || STYLE_LABELS[item.style] || 'Generated'
  const downloadOptions = [
    { label: 'Original', url: item.url },
    { label: 'Profile', url: item.variants?.profile },
    { label: 'Banner', url: item.variants?.banner },
    { label: 'Story', url: item.variants?.story },
  ].filter((option) => option.url)

  function download(url, name) {
    const link = document.createElement('a')
    link.href = url
    link.download = `alterego-${item.id}-${name.toLowerCase()}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleSaveClick(e) {
    e.stopPropagation()
    if (downloadOptions.length <= 1) {
      download(item.url, 'original')
      return
    }
    setMenuOpen((open) => !open)
  }

  function handleDelete(e) {
    e.stopPropagation()
    onDelete(item.id)
  }

  return (
    <div className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      {item.url ? (
        <img
          src={item.url}
          alt={label}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-elevated)]">
          <FallbackIcon size={48} style={{ color: styleData.color }} />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out" />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
        <p className="text-[var(--accent)] text-xs font-display font-bold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[var(--text-muted)] text-[11px] mt-1">
          {formatDate(item.createdAt)}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSaveClick}
            className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs px-3 py-1.5 rounded-full border border-[var(--border-subtle)] inline-flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            Save
          </button>
          {menuOpen && (
            <div className="absolute bottom-14 left-4 min-w-[136px] rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-xl">
              {downloadOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    download(option.url, option.label)
                    setMenuOpen(false)
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleDelete}
            className="bg-[var(--bg-elevated)] hover:bg-[rgba(255,77,77,0.15)] text-[var(--text-muted)] hover:text-[var(--error)] p-2 rounded-full border border-[var(--border-subtle)] transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
