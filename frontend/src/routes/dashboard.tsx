import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { PageBackground } from "@/components/PageBackground";
import { StyleCard } from "@/components/StyleCard";
import { STYLES, type StyleKey } from "@/lib/styles";
import { useAuth } from "@/context/AuthContext";
import { uploadHeadshot, createJob } from "@/lib/api";
import { Upload, X, Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

interface Headshot { url: string; file_id: string; preview: string }

const STEPS = ["Upload", "Personas", "Generate"] as const;

function Dashboard() {
  const { user, tier, loading } = useAuth();
  const nav = useNavigate();
  const [headshot, setHeadshot] = useState<Headshot | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<StyleKey[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  const maxStyles = tier === "free" ? 3 : 6;
  const step = !headshot ? 0 : selected.length === 0 ? 1 : 2;

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image");
    setUploading(true);
    const preview = URL.createObjectURL(file);
    try {
      const r = await uploadHeadshot(file);
      setHeadshot({ ...r, preview });
      toast.success("Headshot uploaded");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const toggleStyle = (k: StyleKey) => {
    setSelected((cur) => {
      if (cur.includes(k)) return cur.filter((x) => x !== k);
      if (cur.length >= maxStyles) {
        toast.error(tier === "free" ? `Free plan: max ${maxStyles} personas` : `Max ${maxStyles} personas`);
        return cur;
      }
      return [...cur, k];
    });
  };

  const onGenerate = async () => {
    if (!headshot) return toast.error("Upload a headshot first");
    if (selected.length === 0) return toast.error("Pick at least one persona");
    setSubmitting(true);
    try {
      const { job_id } = await createJob({
        prompt: "",
        selected_styles: selected,
        headshot_url: headshot.url,
        headshot_file_id: headshot.file_id,
      });
      nav({ to: "/generate/$jobId", params: { jobId: job_id } });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to create job");
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
            <div>
              <span className="badge badge-violet mb-4">Studio</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Build your <span className="text-aurora">AlterEgo</span>
              </h1>
              <p className="text-white/50 mt-3 max-w-xl text-sm md:text-base leading-relaxed">
                Powered by <span className="text-cyan font-medium">gpt-image-2</span> — pick personas, we run the prompts. You just show up looking iconic.
              </p>
            </div>
            {tier === "free" && (
              <div className="glass rounded-2xl px-4 py-3 text-sm text-amber-200/90 border border-amber-500/25 max-w-xs">
                <Sparkles className="w-4 h-4 inline mr-2 text-amber-400" />
                Free: 1 job · up to 3 personas
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-12 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  i <= step
                    ? "bg-gradient-to-r from-violet/30 to-pink-500/20 text-white border border-violet/40"
                    : "glass text-white/40"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4 text-lime" /> : <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">{i + 1}</span>}
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <section className="mb-14">
          <StepHeader n="01" title="Upload your headshot" />
          <div className="card-glow p-6 md:p-8">
            <DropZone headshot={headshot} uploading={uploading} onFile={onFile} onClear={() => setHeadshot(null)} />
          </div>
        </section>

        <section className="mb-14">
          <StepHeader n="02" title="Choose your personas" subtitle={`${selected.length}/${maxStyles} selected`} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {STYLES.map((s) => {
              const isSel = selected.includes(s.key);
              const locked = !isSel && selected.length >= maxStyles;
              return (
                <div key={s.key} className={!isSel && !locked ? "opacity-70 hover:opacity-100 transition-opacity" : ""}>
                  <StyleCard
                    styleKey={s.key} name={s.name} vibe={s.vibe} cls={s.cls} emoji={s.emoji}
                    selected={isSel} locked={locked}
                    onClick={() => toggleStyle(s.key)}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-glow p-6 md:p-8">
          <StepHeader n="03" title="Generate" />
          <p className="text-sm text-white/45 mb-6 -mt-2">
            Studio-tuned prompts + gpt-image-2 = cinematic output. No extra typing needed.
          </p>
          <button
            onClick={onGenerate}
            disabled={submitting || !headshot || selected.length === 0}
            className="btn-aurora w-full py-5 text-lg font-bold disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            <Wand2 className="w-5 h-5" />
            {submitting ? "Creating your AlterEgo..." : "Generate my AlterEgo"}
          </button>
        </section>
      </main>
    </div>
  );
}

function StepHeader({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-4xl md:text-5xl font-bold text-white/[0.07]">{n}</span>
        <h2 className="text-xl md:text-2xl font-display font-bold">{title}</h2>
      </div>
      {subtitle && <span className="text-sm text-cyan font-medium">{subtitle}</span>}
    </div>
  );
}

function DropZone({ headshot, uploading, onFile, onClear }: {
  headshot: Headshot | null; uploading: boolean;
  onFile: (f: File) => void; onClear: () => void;
}) {
  const [drag, setDrag] = useState(false);

  if (headshot) {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <motion.img
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src={headshot.preview} alt="Headshot"
          className="w-full aspect-square object-cover rounded-2xl ring-2 ring-violet/40 shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)]"
        />
        <button onClick={onClear} className="absolute top-3 right-3 w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/15 transition">
          <X className="w-4 h-4" />
        </button>
        <p className="text-xs text-white/40 text-center mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          Auto-deleted after 24 hours
        </p>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onFile(f);
      }}
      className={`block w-full border-2 border-dashed rounded-2xl py-16 md:py-20 text-center cursor-pointer transition-all ${
        drag
          ? "border-pink-400 bg-pink-500/10 scale-[1.01]"
          : "border-white/15 hover:border-violet/50 hover:bg-violet/5"
      }`}
    >
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center ${drag ? "bg-violet/20" : "glass"}`}>
        <Upload className={`w-8 h-8 ${drag ? "text-violet" : "text-white/50"}`} />
      </div>
      <p className="font-display text-xl font-semibold">{uploading ? "Uploading..." : "Drop your headshot"}</p>
      <p className="text-sm text-white/40 mt-2">PNG or JPG · up to 10MB</p>
    </label>
  );
}
