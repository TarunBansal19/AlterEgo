import GalleryItem from './GalleryItem'

export default function GalleryGrid({ items, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <GalleryItem key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  )
}
