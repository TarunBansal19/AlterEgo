export default function PageWrapper({ children, className = '' }) {
  return (
    <main className={`min-h-screen pt-20 ${className}`}>
      {children}
    </main>
  )
}
