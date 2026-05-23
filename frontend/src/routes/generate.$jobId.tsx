import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { getJob, openJobStream, parseStreamAvatar, variantUrl, jobStyleKeys, type Job, type Avatar } from "@/lib/api";
import { styleByKey } from "@/lib/styles";
import { Download, Share2, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/generate/$jobId")({ component: Generate });

function Generate() {
  const { jobId } = Route.useParams();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let active = true;
    (async () => {
      try {
        const j = await getJob(jobId);
        if (active) setJob(j);
      } catch { /* retry via stream */ }
      es = await openJobStream(jobId);
      es.addEventListener("avatar_ready", (e: MessageEvent) => {
        const a = parseStreamAvatar(JSON.parse(e.data));
        setJob((prev) => prev ? { ...prev, avatars: upsertAvatar(prev.avatars, a) } : prev);
      });
      es.addEventListener("avatar_failed", (e: MessageEvent) => {
        const a = parseStreamAvatar(JSON.parse(e.data));
        setJob((prev) => prev ? { ...prev, avatars: upsertAvatar(prev.avatars, { ...a, status: "failed" }) } : prev);
      });
      es.addEventListener("job_completed", () => {
        setJob((prev) => prev ? { ...prev, status: "completed" } : prev);
        toast.success("Your AlterEgo is ready");
      });
      es.onerror = () => { /* keep alive */ };
    })();
    return () => { active = false; es?.close(); };
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <Navbar />
        <div className="relative z-10 pt-36 flex flex-col items-center gap-4 text-white/50">
          <Loader2 className="w-10 h-10 text-violet animate-spin" />
          <p className="font-display text-lg">Summoning your AlterEgo...</p>
        </div>
      </div>
    );
  }

  const done = job.status === "completed";
  const completedCount = job.avatars.filter((a) => a.status === "completed").length;
  const total = jobStyleKeys(job).length;

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Navbar />
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center mb-12">
          {!done && (
            <span className="badge badge-violet mb-4 inline-flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              gpt-image-2 at work
            </span>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            {done ? (
              <>Your AlterEgos are <span className="text-aurora">ready</span></>
            ) : (
              <>Cooking your <span className="text-aurora">AlterEgo</span>...</>
            )}
          </h1>
          <p className="text-white/50 mt-3">
            {done
              ? "Pick a format and download in HD."
              : `${completedCount}/${total} personas rendered — hang tight.`}
          </p>
          {!done && total > 0 && (
            <div className="mt-6 max-w-xs mx-auto h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet via-pink-500 to-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / total) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {jobStyleKeys(job).map((key, i) => {
            const meta = styleByKey(key);
            const avatar = job.avatars.find((a) => a.style_name === key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <AvatarSlot
                  styleKey={key}
                  name={meta?.name ?? key}
                  emoji={meta?.emoji}
                  cls={meta?.cls ?? "style-pf"}
                  avatar={avatar}
                />
              </motion.div>
            );
          })}
        </div>

        {done && (
          <div className="text-center mt-14">
            <Link to="/gallery" className="btn-aurora px-10 py-4 text-base font-bold inline-flex">
              View full gallery
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function upsertAvatar(list: Avatar[], a: Avatar): Avatar[] {
  const i = list.findIndex((x) => x.style_name === a.style_name);
  if (i === -1) return [...list, a];
  const copy = [...list];
  copy[i] = a;
  return copy;
}

function AvatarSlot({ styleKey, name, emoji, cls, avatar }: { styleKey: string; name: string; emoji?: string; cls: string; avatar?: Avatar }) {
  const status = avatar?.status ?? "pending";
  const ready = status === "completed" && avatar?.imagekit_url;
  const failed = status === "failed";
  const [variant, setVariant] = useState<"profile" | "banner" | "story">("profile");

  return (
    <div className={`relative rounded-2xl overflow-hidden ring-1 ring-white/10 ${cls}`}>
      <div className="aspect-[3/4] relative">
        {ready ? (
          <motion.img
            key={variant}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
            src={variantUrl(avatar!.imagekit_url!, variant)}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
            <p className="text-sm text-white/70">Generation failed</p>
          </div>
        ) : (
          <div className="absolute inset-0 skeleton flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-violet animate-spin" />
            <p className="text-xs text-white/40 font-medium">Rendering...</p>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2 glass-strong rounded-full px-3 py-1.5">
          {emoji && <span>{emoji}</span>}
          <span className="text-xs font-semibold">{name}</span>
        </div>
      </div>

      {ready && (
        <div className="p-4 glass-strong border-t border-white/5">
          <div className="flex gap-1 mb-3 p-1 rounded-xl bg-white/5">
            {(["profile", "banner", "story"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`flex-1 text-xs py-2 rounded-lg capitalize font-medium transition ${
                  variant === v ? "bg-gradient-to-r from-violet to-pink-500 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <a
              href={variantUrl(avatar!.imagekit_url!, variant)}
              download={`alterego-${styleKey}-${variant}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="btn-aurora flex-1 text-xs py-2.5 font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download HD
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(variantUrl(avatar!.imagekit_url!, variant));
                toast.success("Link copied");
              }}
              className="btn-ghost px-4 py-2.5"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
