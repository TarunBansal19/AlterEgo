import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-[160px] font-extrabold text-[var(--border-default)] leading-none">
              404
            </h1>
            <p className="text-[var(--text-secondary)] text-xl mt-3">
              Page not found
            </p>
            <Button
              variant="ghost"
              className="mt-6"
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
