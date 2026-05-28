import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  const redirectTo = location.state?.from?.pathname || '/create'

  return (
    <div className="bg-[var(--bg-base)] min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="font-display text-2xl font-extrabold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          AE.
        </Link>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className="max-w-[520px] w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-12 mx-4"
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          {/* Tab Toggle */}
          <div className="bg-[var(--bg-card)] rounded-full p-1 flex mb-8">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 text-center py-2.5 rounded-full text-base font-display font-medium transition-all duration-200 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 text-center py-2.5 rounded-full text-base font-display font-medium transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Create account
            </button>
          </div>

          {mode === 'signin' ? (
            <SignInForm auth={auth} redirectTo={redirectTo} navigate={navigate} />
          ) : (
            <SignUpForm auth={auth} redirectTo={redirectTo} navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Sign In Form
   ============================================================ */
function SignInForm({ auth, redirectTo, navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await auth.login(email, password)
      navigate(redirectTo)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Invalid email or password'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Email</label>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={`input-field input-with-icon ${errors.email ? 'error' : ''}`}
          />
        </div>
        {errors.email && <p className="text-[var(--error)] text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Password</label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`input-field input-with-icon input-with-action ${errors.password ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-[var(--error)] text-xs mt-1">{errors.password}</p>}
      </div>

      {/* General Error */}
      {errors.general && (
        <p className="text-[var(--error)] text-xs text-center">{errors.general}</p>
      )}

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

    </form>
  )
}

/* ============================================================
   Sign Up Form
   ============================================================ */
function SignUpForm({ auth, redirectTo, navigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await auth.signup(name, email, password)
      navigate(redirectTo)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Could not create account'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Name</label>
        <div className="relative">
          <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={`input-field input-with-icon ${errors.name ? 'error' : ''}`}
          />
        </div>
        {errors.name && <p className="text-[var(--error)] text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Email</label>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={`input-field input-with-icon ${errors.email ? 'error' : ''}`}
          />
        </div>
        {errors.email && <p className="text-[var(--error)] text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Password</label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`input-field input-with-icon input-with-action ${errors.password ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-[var(--error)] text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Confirm Password</label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className={`input-field input-with-icon input-with-action ${errors.confirmPassword ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[var(--error)] text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* General Error */}
      {errors.general && (
        <p className="text-[var(--error)] text-xs text-center">{errors.general}</p>
      )}

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
        {loading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
