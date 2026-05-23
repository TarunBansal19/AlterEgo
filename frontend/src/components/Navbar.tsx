import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gallery", label: "Gallery" },
    { to: "/pricing", label: "Pricing" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-2"
            : "py-3"
        }`}
      >
        <nav
          className={`max-w-6xl mx-auto px-4 md:px-6 transition-all duration-500 ${
            scrolled
              ? "h-14 glass-strong rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-white/10"
              : "h-14"
          } flex items-center justify-between`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet via-pink-500 to-cyan flex items-center justify-center shadow-lg shadow-violet/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Alter<span className="text-aurora">Ego</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 p-1 rounded-full glass">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm px-4 py-2 rounded-full text-white/65 hover:text-white hover:bg-white/8 transition-all"
                activeProps={{ className: "text-sm px-4 py-2 rounded-full bg-white/10 text-white font-medium" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-ghost text-sm px-4 py-2 font-medium">
                  Studio
                </Link>
                <button onClick={signOut} className="text-sm px-4 py-2 text-white/50 hover:text-white transition">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm px-4 py-2 text-white/70 hover:text-white transition">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-aurora text-sm px-5 py-2.5 font-semibold">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden w-10 h-10 rounded-xl glass flex items-center justify-center" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] bg-[#030305]/95 backdrop-blur-2xl flex flex-col p-6">
          <div className="flex justify-end">
            <button onClick={() => setOpen(false)} className="w-10 h-10 rounded-xl glass flex items-center justify-center" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-8">
            {navLinks.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-3xl font-display font-bold py-3 opacity-0 animate-fade-in hover:text-aurora transition-colors"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3 pb-8">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost py-4 text-center text-lg font-medium">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="btn-aurora py-4 text-center text-lg font-semibold">
                  Get started free
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-aurora py-4 text-center text-lg font-semibold">
                  Open Studio
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="text-white/50 py-2">
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
