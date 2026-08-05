import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";

export const Route = createFileRoute("/login")({
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // UI-only demo: any credentials proceed to the dashboard.
    navigate({ to: "/" });
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
              Sign in to your recruiting workspace
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@company.com"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <button type="button" className="text-xs font-medium text-success">
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>

          <button
            type="submit"
            className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98]"
          >
            Sign in
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Demo build — any credentials will sign you in.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to HireSense? <span className="font-medium text-foreground">Start a free trial</span>
        </p>
      </div>
    </div>
  );
}
