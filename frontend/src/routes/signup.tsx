import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/oauth";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: fullName, tier: "free" },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to confirm.");
    nav({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const { error } = await signInWithGoogle("/dashboard");
    if (error) toast.error(error.message ?? "Google sign-up failed");
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever · 1 job · 3 personas."
      tagline="The internet doesn't need another boring headshot. It needs your AlterEgo."
    >
      <button onClick={onGoogle} className="mt-8 w-full btn-ghost py-3.5 flex items-center justify-center gap-3 font-medium">
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6 text-xs text-white/35 uppercase tracking-wider">
        <div className="flex-1 h-px bg-white/10" />
        or email
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="Full name" type="text" value={fullName} onChange={setFullName} required />
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} required />
        <AuthInput label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />
        <button disabled={loading} className="btn-aurora w-full py-3.5 font-bold disabled:opacity-50">
          {loading ? "Creating..." : "Create AlterEgo"}
        </button>
      </form>

      <p className="mt-8 text-sm text-white/50 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan font-medium hover:underline">Sign in</Link>
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
