import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Aurora } from "@/components/Aurora";
import { PageBackground } from "@/components/PageBackground";
import { Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
  tagline?: string;
}

export function AuthLayout({ children, title, subtitle, tagline }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden bg-[#030305]">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <Aurora embers={45} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-[#030305]/80" />

        <Link to="/" className="relative z-10 flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          AlterEgo
        </Link>

        <div className="relative z-10">
          <p className="badge badge-lime mb-6 w-fit">gpt-image-2 inside</p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight max-w-md">
            Your next profile pic is <span className="text-aurora italic">not</span> a filter.
          </h2>
          <p className="text-white/50 mt-4 max-w-sm text-lg leading-relaxed">
            {tagline ?? "Six personas. One headshot. Main-character energy on demand."}
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/30">© AlterEgo · Private by default</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 relative">
        <div className="lg:hidden fixed inset-0 z-0"><PageBackground /></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md card-glow p-8 md:p-10"
        >
          <Link to="/" className="lg:hidden font-display font-bold text-lg mb-8 inline-block">
            Alter<span className="text-aurora">Ego</span>
          </Link>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-white/50 text-sm mt-2">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
