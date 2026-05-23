import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Aurora } from "@/components/Aurora";
import { StyleCard } from "@/components/StyleCard";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { STYLES } from "@/lib/styles";
import { Upload, Sparkles, Download, Zap, Shield, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const marqueeItems = [
  "Professional Founder", "Anime Hero", "Cyberpunk Hacker",
  "Gaming Streamer", "Cinematic Celebrity", "Luxury CEO",
];

const stats = [
  { value: "6", label: "Personas" },
  { value: "gpt-image-2", label: "AI Engine" },
  { value: "<60s", label: "Per avatar" },
  { value: "HD", label: "Exports" },
];

function Home() {
  return (
    <div className="min-h-screen relative">
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        <Aurora embers={70} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="badge badge-lime">No cap — it hits different</span>
              <span className="badge badge-violet">gpt-image-2 powered</span>
            </div>

            <h1 className="font-display font-extrabold leading-[0.95] tracking-tight text-[clamp(2.75rem,8vw,5.5rem)]">
              <span className="block text-white">Meet every version</span>
              <span className="block text-aurora italic mt-1">of you.</span>
            </h1>

            <p className="mt-8 text-white/65 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Upload a headshot. Pick your vibe. Walk away with cinematic avatars that actually look like you — founder, anime legend, cyberpunk icon, all of it.
            </p>
            <p className="mt-4 text-sm md:text-base text-white/45 max-w-lg mx-auto">
              Built on OpenAI&apos;s <span className="text-cyan font-semibold">gpt-image-2</span> — the latest image model for photoreal detail and consistent likeness.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-aurora px-10 py-4 text-base font-bold inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Create my AlterEgo
              </Link>
              <Link to="/gallery" className="btn-ghost px-8 py-4 text-base font-medium">
                See the gallery
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl py-4 px-3">
                <p className="font-display font-bold text-xl md:text-2xl text-aurora">{s.value}</p>
                <p className="text-[10px] md:text-xs text-white/45 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-16 w-full max-w-4xl"
        >
          <div className="glass rounded-full py-3.5 px-3 marquee border border-white/10">
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((s, i) => (
                <span key={i} className="text-sm text-white/60 px-2 font-medium">
                  {s} <span className="text-pink-400 mx-2">✦</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-28 max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. Zero fluff."
          subtitle="Private uploads, studio-grade prompts, instant HD downloads. That's the whole playbook."
        />

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {[
            { icon: Upload, num: "01", title: "Drop your headshot", desc: "Drag, drop, done. Auto-deleted in 24h — your face stays yours.", accent: "from-violet/20 to-transparent" },
            { icon: Sparkles, num: "02", title: "Pick your personas", desc: "Six curated aesthetics. Free tier gets 3 — still enough to go viral.", accent: "from-pink-500/20 to-transparent" },
            { icon: Download, num: "03", title: "Download in HD", desc: "Profile, banner, story — gpt-image-2 renders each format crisp.", accent: "from-cyan/20 to-transparent" },
          ].map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glow p-8 md:p-10 group hover:bg-white/[0.02] transition-colors"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accent} rounded-full blur-2xl opacity-60`} />
              <span className="font-display text-6xl font-bold text-white/[0.06] absolute top-4 right-6">{s.num}</span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet via-pink-500 to-cyan p-3.5 mb-6 shadow-lg shadow-violet/25 group-hover:scale-105 transition-transform">
                  <s.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 py-28 max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="The personas"
          title="Six versions. One you."
          subtitle="Each look is prompt-engineered for gpt-image-2 — no typing, no guesswork, just main-character energy."
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {STYLES.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <StyleCard styleKey={s.key} name={s.name} vibe={s.vibe} cls={s.cls} emoji={s.emoji} interactive />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/signup" className="btn-aurora px-10 py-4 text-base font-bold inline-flex">
            Start creating — it&apos;s free
          </Link>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 max-w-5xl mx-auto">
        <div className="card-glow p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-pink-500/5 to-cyan/10" />
          <div className="relative z-10">
            <div className="flex justify-center gap-4 mb-6 text-white/30">
              <Zap className="w-6 h-6" />
              <Shield className="w-6 h-6" />
              <ImageIcon className="w-6 h-6" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to meet your AlterEgo?</h2>
            <p className="mt-3 text-white/50 max-w-md mx-auto">Join creators turning one selfie into a whole aesthetic universe.</p>
            <Link to="/signup" className="btn-aurora mt-8 px-10 py-4 text-base font-bold inline-flex">
              Get started free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
