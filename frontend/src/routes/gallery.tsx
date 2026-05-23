import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { listJobs, variantUrl, type Job } from "@/lib/api";
import { STYLES, styleByKey } from "@/lib/styles";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Download, Images } from "lucide-react";

export const Route = createFileRoute("/gallery")({ component: Gallery });

const STATUS: Record<string, { cls: string; label: string }> = {
  pending: { cls: "bg-amber-500/15 text-amber-200 border-amber-500/30", label: "Pending" },
  processing: { cls: "bg-violet/20 text-violet-200 border-violet/40 animate-pulse", label: "Processing" },
  completed: { cls: "bg-lime/15 text-lime-200 border-lime/30", label: "Done" },
  failed: { cls: "bg-red-500/15 text-red-200 border-red-500/30", label: "Failed" },
};

function Gallery() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    listJobs().then(setJobs).catch(() => setJobs([]));
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <Navbar />
        <div className="relative z-10 pt-36 text-center px-6">
          <Images className="w-14 h-14 mx-auto text-white/20 mb-6" />
          <h1 className="font-display text-3xl font-bold">Your gallery lives here</h1>
          <p className="text-white/50 mt-3">Sign in to see every AlterEgo you&apos;ve created.</p>
          <Link to="/login" className="btn-aurora inline-flex mt-8 px-8 py-3.5 font-semibold">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Navbar />
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24">
        <span className="badge badge-cyan mb-4">Archive</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Your <span className="text-aurora">AlterEgos</span>
        </h1>
        <p className="text-white/50 mt-3 mb-10">Every version you&apos;ve unlocked — filter by vibe.</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {[{ key: "all", name: "All", emoji: "✦" }, ...STYLES.map((s) => ({ key: s.key, name: s.name, emoji: s.emoji }))].map((p) => (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              className={`text-xs px-4 py-2.5 rounded-full border font-medium transition-all ${
                filter === p.key
                  ? "bg-gradient-to-r from-violet/40 to-pink-500/30 border-violet/50 text-white shadow-lg shadow-violet/20"
                  : "glass text-white/55 hover:text-white hover:border-white/25"
              }`}
            >
              <span className="mr-1.5">{p.emoji}</span>
              {p.name}
            </button>
          ))}
        </div>

        {jobs === null ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 card-glow">
            <Sparkles className="w-14 h-14 mx-auto text-violet/50 mb-5" />
            <h3 className="font-display text-2xl font-bold mb-2">No AlterEgos yet</h3>
            <p className="text-white/45 mb-8 max-w-sm mx-auto">Your gallery is empty. Time to hit the studio.</p>
            <Link to="/dashboard" className="btn-aurora inline-flex px-8 py-3.5 font-semibold">
              Open Studio
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {jobs.map((job) => {
              const filtered = filter === "all" ? job.avatars : job.avatars.filter((a) => a.style_name === filter);
              if (filtered.length === 0) return null;
              const st = STATUS[job.status] ?? STATUS.pending;
              return (
                <motion.section
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="card-glow p-6 md:p-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <p className="text-xs text-white/40 font-medium">
                      {new Date(job.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wide ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin">
                    {filtered.map((a) => {
                      const meta = styleByKey(a.style_name);
                      const ready = a.status === "completed" && a.imagekit_url;
                      return (
                        <div
                          key={a.id ?? a.style_name}
                          className={`relative shrink-0 w-44 md:w-52 aspect-[3/4] rounded-2xl overflow-hidden snap-start group ring-1 ring-white/10 ${meta?.cls ?? ""}`}
                        >
                          {ready ? (
                            <img src={variantUrl(a.imagekit_url, "profile")} alt={meta?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 skeleton" />
                          )}
                          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <p className="text-sm font-display font-semibold truncate">{meta?.emoji} {meta?.name ?? a.style_name}</p>
                          </div>
                          {ready && (
                            <a
                              href={variantUrl(a.imagekit_url, "profile")}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm"
                            >
                              <Download className="w-8 h-8 text-white" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
