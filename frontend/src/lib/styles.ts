export type StyleKey =
  | "professional_founder"
  | "anime_hero"
  | "cyberpunk_hacker"
  | "gaming_streamer"
  | "cinematic_celebrity"
  | "luxury_ceo";

export const STYLES: { key: StyleKey; name: string; vibe: string; cls: string; emoji: string }[] = [
  { key: "professional_founder", name: "Professional Founder", vibe: "Boardroom-ready", cls: "style-pf", emoji: "💼" },
  { key: "anime_hero", name: "Anime Hero", vibe: "Main character energy", cls: "style-ah", emoji: "⚡" },
  { key: "cyberpunk_hacker", name: "Cyberpunk Hacker", vibe: "Neon. Glitch. Power.", cls: "style-ch", emoji: "🌃" },
  { key: "gaming_streamer", name: "Gaming Streamer", vibe: "RGB everything", cls: "style-gs", emoji: "🎮" },
  { key: "cinematic_celebrity", name: "Cinematic Celebrity", vibe: "Red carpet. Always.", cls: "style-cc", emoji: "✨" },
  { key: "luxury_ceo", name: "Luxury CEO", vibe: "Old money, new AI", cls: "style-lc", emoji: "👑" },
];

export const styleByKey = (k: string) => STYLES.find((s) => s.key === k);
