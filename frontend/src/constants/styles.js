import { Briefcase, Clapperboard, Crown, Gamepad2, Palette, Zap } from 'lucide-react'

export const STYLE_OPTIONS = [
  {
    id: 'professional_founder',
    label: 'Founder',
    desc: 'Clean studio headshot.',
    icon: Briefcase,
    bg: '#111827',
    accent: '#60a5fa',
    tags: ['Professional', 'Clean'],
  },
  {
    id: 'anime_hero',
    label: 'Anime Hero',
    desc: 'Stylized character art.',
    icon: Palette,
    bg: '#1f1025',
    accent: '#f472b6',
    tags: ['Anime', 'Vibrant'],
  },
  {
    id: 'cyberpunk_hacker',
    label: 'Cyberpunk',
    desc: 'Neon future portrait.',
    icon: Zap,
    bg: '#071b1f',
    accent: '#22d3ee',
    tags: ['Neon', 'Tech'],
  },
  {
    id: 'gaming_streamer',
    label: 'Streamer',
    desc: 'RGB creator avatar.',
    icon: Gamepad2,
    bg: '#1c1230',
    accent: '#a78bfa',
    tags: ['Gaming', 'Bold'],
  },
  {
    id: 'cinematic_celebrity',
    label: 'Celebrity',
    desc: 'Red carpet lighting.',
    icon: Clapperboard,
    bg: '#251111',
    accent: '#fb7185',
    tags: ['Cinematic', 'Glam'],
  },
  {
    id: 'luxury_ceo',
    label: 'Luxury CEO',
    desc: 'Premium editorial look.',
    icon: Crown,
    bg: '#211a10',
    accent: '#fbbf24',
    tags: ['Luxury', 'Sharp'],
  },
]

export const STYLE_LABELS = Object.fromEntries(
  STYLE_OPTIONS.map((style) => [style.id, style.label])
)

export const STYLE_ICON_META = Object.fromEntries(
  STYLE_OPTIONS.map((style) => [style.id, { icon: style.icon, color: style.accent }])
)
