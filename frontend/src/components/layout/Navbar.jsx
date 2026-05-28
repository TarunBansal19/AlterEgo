import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const avatarRef = useRef(null)

  const isAuthenticated = !!user

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside to close dropdown
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-20"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--border-subtle)'
            : '1px solid transparent',
          transition: 'background 200ms, backdrop-filter 200ms, border-bottom 200ms',
        }}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-8">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-3xl font-[800] tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            AE.
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/gallery"
                  className="px-4 py-2 text-base font-medium transition-colors hover:text-[var(--text-primary)]"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  Gallery
                </Link>
                <Button onClick={() => navigate('/create')} size="sm">
                  + New
                </Button>
                <div className="relative ml-1">
                  <button
                    ref={avatarRef}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-[var(--border-focus)]"
                    style={{
                      background: 'var(--bg-elevated)',
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    <span
                      className="font-display text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {getInitials(user.name)}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-2 min-w-[160px] rounded-[var(--radius-md)] border p-1"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border-default)',
                        boxShadow: 'var(--shadow-elevated)',
                      }}
                    >
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                        style={{
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button onClick={() => navigate('/auth')} size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ color: 'var(--text-primary)' }}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-5">
            <Link
              to="/"
              className="font-display text-2xl font-[800] tracking-tight"
              style={{ color: 'var(--accent)' }}
              onClick={() => setMobileOpen(false)}
            >
              AE.
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-primary)' }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile nav items */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/gallery"
                  className="text-lg font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  to="/create"
                  className="text-lg font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  + New
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-lg font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-lg font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Button
                  size="md"
                  onClick={() => { setMobileOpen(false); navigate('/auth') }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
