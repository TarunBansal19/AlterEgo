import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './hooks/useToast'
import Toaster from './components/ui/Toaster'
import ProtectedRoute from './routes/ProtectedRoute'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import CreatePage from './pages/CreatePage'
import GalleryPage from './pages/GalleryPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/create" element={<CreatePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
