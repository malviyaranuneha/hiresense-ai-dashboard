import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useUpdateProfile } from "@/lib/api";


export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HireSense AI" },
      {
        name: "description",
        content:
          "Manage your recruiter profile, AI matching preferences, and notification settings in HireSense AI.",
      },
      { property: "og:title", content: "Settings — HireSense AI" },
      {
        property: "og:description",
        content:
          "Manage your recruiter profile, AI matching preferences, and notification settings in HireSense AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function ToggleRow({
  label,
  description,
  defaultOn = false,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} aria-label={label} />
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setJobTitle(profile.job_title);
    }
  }, [profile]);

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <AppShell title="Settings">
      {/* Profile */}
      <section className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <h2 className="text-sm font-semibold tracking-tight">Profile</h2>
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-sm font-medium text-secondary-foreground ring-1 ring-foreground/10">
            {initials || "HS"}
          </span>
          <div>
            <p className="text-sm font-medium">{profile?.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{profile?.job_title ?? "Recruiter"}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-name" className="text-xs font-medium text-muted-foreground">
              Full name
            </label>
            <input
              id="settings-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-title" className="text-xs font-medium text-muted-foreground">
              Job title
            </label>
            <input
              id="settings-title"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-email" className="text-xs font-medium text-muted-foreground">
              Work email
            </label>
            <input
              id="settings-email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              className="h-9 rounded-lg border border-input bg-secondary/50 px-3 text-sm text-muted-foreground outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          {updateProfile.isSuccess && (
            <span className="text-xs text-success">Saved</span>
          )}
          <button
            type="button"
            disabled={updateProfile.isPending}
            onClick={() =>
              updateProfile.mutate({ full_name: fullName, job_title: jobTitle })
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </section>


      {/* Matching preferences */}
      <section className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <h2 className="text-sm font-semibold tracking-tight">Matching Preferences</h2>
        <p className="text-xs text-muted-foreground">
          These controls will steer AI scoring once the matching engine is connected.
        </p>
        <div className="divide-y divide-border">
          <ToggleRow
            label="Auto-shortlist top matches"
            description="Automatically shortlist candidates scoring above 90%"
            defaultOn
          />
          <ToggleRow
            label="Weight recent experience higher"
            description="Favor roles held in the last 3 years when scoring"
            defaultOn
          />
          <ToggleRow
            label="Flag missing must-have skills"
            description="Mark candidates who lack skills tagged as required in the JD"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <h2 className="text-sm font-semibold tracking-tight">Notifications</h2>
        <div className="divide-y divide-border">
          <ToggleRow
            label="New high-match candidates"
            description="Email me when a candidate scores above 85%"
            defaultOn
          />
          <ToggleRow
            label="Weekly pipeline digest"
            description="A Monday summary of uploads, shortlists, and open roles"
            defaultOn
          />
          <ToggleRow
            label="Product updates"
            description="Occasional news about HireSense AI features"
          />
        </div>
      </section>

      {/* Session */}
      <section className="flex items-center justify-between rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <div>
          <p className="text-sm font-medium">Sign out</p>
          <p className="text-xs text-muted-foreground">End your current recruiting session.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground ring-1 ring-foreground/10 transition-colors hover:bg-secondary/70"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </section>
    </AppShell>
  );
}
