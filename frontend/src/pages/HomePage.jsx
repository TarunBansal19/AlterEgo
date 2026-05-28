import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import animeHero from '../assets/anime_hero.png'
import founder from '../assets/founder.png'
import streamer from '../assets/streamer.png'

const FLOATING_CARDS = [
  { image: founder, label: 'Founder', rotate: '-6deg', offsetY: '-20px', delay: '0s' },
  { image: animeHero, label: 'Anime Hero', rotate: '0deg', offsetY: '0px', delay: '0.5s' },
  { image: streamer, label: 'Streamer', rotate: '6deg', offsetY: '-10px', delay: '1s' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const auth = useAuth()

  const handleCTA = () => {
    if (auth.user) {
      navigate('/create')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Side */}
            <div>
              <Badge variant="accent" className="animate-badgeFadeIn text-sm px-4 py-1.5">
                AI-Powered Identity Generator
              </Badge>

              <h1
                className="font-display text-[52px] md:text-[68px] lg:text-[84px] leading-[0.95] font-extrabold tracking-[-2px] mt-8"
              >
                <span
                  className="inline-block animate-fadeInUp text-white"
                  style={{ animationDelay: '0ms' }}
                >
                  Meet
                </span>{' '}
                <span
                  className="inline-block animate-fadeInUp text-white"
                  style={{ animationDelay: '80ms' }}
                >
                  your
                </span>
                <br />
                <span
                  className="inline-block animate-fadeInUp text-[var(--accent)]"
                  style={{ animationDelay: '160ms' }}
                >
                  alter
                </span>{' '}
                <span
                  className="inline-block animate-fadeInUp text-[var(--accent)]"
                  style={{ animationDelay: '240ms' }}
                >
                  ego.
                </span>
              </h1>

              <p
                className="text-[var(--text-muted)] text-lg max-w-lg mt-6 animate-fadeIn leading-relaxed"
                style={{ animationDelay: '400ms' }}
              >
                Upload a photo. Pick a persona. Let AI reimagine you.
              </p>

              <div
                className="mt-10 animate-scaleIn"
                style={{ animationDelay: '600ms' }}
              >
                <Button variant="primary" size="lg" onClick={handleCTA} className="text-base px-8 py-3.5">
                  Generate Your Alter Ego <ArrowRight size={18} className="ml-1" />
                </Button>
              </div>

              <p
                className="text-[var(--text-muted)] text-sm mt-4 animate-fadeIn"
                style={{ animationDelay: '700ms' }}
              >
                Upload once. Generate polished avatars in minutes.
              </p>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex flex-col items-center gap-12">
              {/* Floating Cards */}
              <div className="relative h-[360px] w-full flex items-center justify-center">
                {FLOATING_CARDS.map((card, i) => {
                  return (
                    <div
                      key={i}
                      className="absolute w-[170px] h-[220px] bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden animate-float"
                      style={{
                        transform: `rotate(${card.rotate}) translateY(${card.offsetY})`,
                        animationDelay: card.delay,
                        boxShadow: 'var(--shadow-card)',
                        left: `${i * 140 + 20}px`,
                      }}
                    >
                      <img src={card.image} alt={card.label} className="h-full w-full object-cover" />
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="h-[60px] flex items-center justify-center shrink-0">
        <p className="text-[var(--text-muted)] text-xs">
          Made with ❤️ by <a href="https://x.com/etoEpsilon">Epsilon</a>
        </p>
      </footer>
    </div>
  )
}
