import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet via-pink-500 to-cyan flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-lg">AlterEgo</p>
            <p className="text-xs text-white/40">Every version of you, unlocked.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link to="/gallery" className="hover:text-white transition">Gallery</Link>
          <Link to="/dashboard" className="hover:text-white transition">Studio</Link>
        </div>
        <p className="text-xs text-white/30">Powered by gpt-image-2 · © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
