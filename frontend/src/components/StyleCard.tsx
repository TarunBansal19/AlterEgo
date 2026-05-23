import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { StyleKey } from "@/lib/styles";

interface Props {
  styleKey: StyleKey;
  name: string;
  vibe: string;
  cls: string;
  emoji?: string;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export function StyleCard({ styleKey, name, vibe, cls, emoji, selected, locked, onClick, interactive = true }: Props) {
  return (
    <motion.button
      type="button"
      onClick={locked ? undefined : onClick}
      whileHover={interactive && !locked ? { y: -6, scale: 1.02 } : {}}
      whileTap={interactive && !locked ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative w-full aspect-[3/4] rounded-2xl overflow-hidden text-left
        ${cls}
        ${selected ? "ring-2 ring-violet shadow-[0_0_50px_-8px_rgba(168,85,247,0.7)] scale-[1.02]" : "ring-1 ring-white/10"}
        ${locked ? "opacity-40 cursor-not-allowed grayscale" : interactive ? "cursor-pointer hover:ring-white/25" : ""}
      `}
      data-style={styleKey}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      {emoji && (
        <span className="absolute top-4 left-4 text-2xl drop-shadow-lg opacity-90 group-hover:scale-110 transition-transform">
          {emoji}
        </span>
      )}

      {selected && (
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gradient-to-br from-violet to-pink-500 text-white flex items-center justify-center shadow-lg shadow-violet/50">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}
      {locked && (
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center">
          <Lock className="w-4 h-4 text-white/70" />
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-4 md:p-5">
        <p className="font-display font-bold text-white text-base md:text-lg leading-tight">{name}</p>
        <p className={`text-xs text-white/55 mt-1.5 font-medium ${interactive ? "group-hover:text-cyan transition-colors" : ""}`}>
          {vibe}
        </p>
      </div>
    </motion.button>
  );
}
