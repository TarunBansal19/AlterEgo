import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/SectionHeader";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({ component: Pricing });

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Test the vibe. No card needed.",
    features: ["1 generation job", "Up to 3 personas", "HD downloads", "24h headshot privacy"],
    cta: "Start free",
    to: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    per: "/mo",
    desc: "For creators who never pick just one persona.",
    features: ["Unlimited jobs", "All 6 personas", "Priority generation", "Profile · Banner · Story", "No watermark"],
    cta: "Coming soon",
    to: "/signup",
    highlight: true,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Navbar />
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple. Cinematic."
          subtitle="Start free with gpt-image-2 quality. Upgrade when one AlterEgo isn't enough."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl p-8 md:p-10 relative overflow-hidden ${
                t.highlight
                  ? "card-glow bg-gradient-to-b from-violet/10 to-transparent"
                  : "glass"
              }`}
            >
              {t.highlight && (
                <span className="absolute top-4 right-4 badge badge-violet">
                  <Sparkles className="w-3 h-3" /> Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{t.name}</h3>
              <p className="text-white/50 text-sm mt-1">{t.desc}</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-display text-5xl md:text-6xl font-bold text-aurora">{t.price}</span>
                {t.per && <span className="text-white/40 text-lg">{t.per}</span>}
              </div>
              <ul className="mt-8 space-y-3.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/75">
                    <span className="w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-cyan" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={t.to}
                className={`mt-10 block text-center py-3.5 rounded-full font-bold transition ${
                  t.highlight ? "btn-aurora" : "btn-ghost"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
