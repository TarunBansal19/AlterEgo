import { supabase } from "@/integrations/supabase/client";

export async function signInWithGoogle(redirectPath = "/dashboard") {
  const redirectTo = `${window.location.origin}${redirectPath}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return { error };
}
