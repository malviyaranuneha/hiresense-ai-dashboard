import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — HireSense AI" },
      {
        name: "description",
        content: "Sign in to HireSense AI, the AI-powered resume shortlisting workspace for recruiters.",
      },
      { property: "og:title", content: "Sign in — HireSense AI" },
      {
        property: "og:description",
        content: "Sign in to HireSense AI, the AI-powered resume shortlisting workspace for recruiters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        navigate({ to: "/", replace: true });
        return;
      }
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate({ to: "/", replace: true });
  };

  const handleGoogle = async () => {
    setError(null);
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <div className="size-3.5 rounded-full bg-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight">HireSense AI</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your recruiting workspace"
                : "Create your recruiting workspace"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/5"
        >
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ava Mitchell"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    setError("Enter your email first.");
                    return;
                  }
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  setError(resetError ? resetError.message : null);
                  if (!resetError) setMessage("Password reset link sent.");
                }}
                className="text-xs font-medium text-success"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {message && <p className="text-xs text-success">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground ring-1 ring-foreground/10 transition-colors hover:bg-secondary/70"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "New to HireSense? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-foreground"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
