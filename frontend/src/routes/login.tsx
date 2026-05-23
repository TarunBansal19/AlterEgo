import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/oauth";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    nav({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const { error } = await signInWithGoogle("/dashboard");
    if (error) toast.error(error.message ?? "Google sign-in failed");
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your studio." tagline="Pick up where you left off — your personas are waiting.">
      <button onClick={onGoogle} className="mt-8 w-full btn-ghost py-3.5 flex items-center justify-center gap-3 font-medium">
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6 text-xs text-white/35 uppercase tracking-wider">
        <div className="flex-1 h-px bg-white/10" />
        or email
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} required />
        <button disabled={loading} className="btn-aurora w-full py-3.5 font-bold disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-sm text-white/50 text-center">
        New here?{" "}
        <Link to="/signup" className="text-cyan font-medium hover:underline">Create account</Link>
      </p>
    </AuthLayout>
  );
}

function AuthInput({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50 font-semibold uppercase tracking-wide">{label}</span>
      <input
        type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input-field mt-2"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29.2 34.6 26.7 35.5 24 35.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.1 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.7 0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
