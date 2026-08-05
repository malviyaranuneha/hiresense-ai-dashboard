import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  FileText,
  Upload,
  Users,
  BarChart3,
  Settings,
  Search,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";

import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutGrid, exact: true },
  { title: "Job Descriptions", url: "/jobs", icon: FileText, exact: false },
  { title: "Resume Upload", url: "/upload", icon: Upload, exact: false },
  { title: "Candidate Ranking", url: "/ranking", icon: Users, exact: false },
  { title: "Reports", url: "/reports", icon: BarChart3, exact: false },
];

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const currentPath = useRouterState({ select: (router) => router.location.pathname });

  const isActive = (path: string, exact: boolean) =>
    exact ? currentPath === path : currentPath.startsWith(path);

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center justify-center md:justify-start gap-3 rounded-lg px-2 md:px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-secondary text-foreground ring-1 ring-foreground/5"
        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar: icon rail on mobile, expanded on desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-14 flex-col border-r border-border bg-card md:w-60">
        <div className="flex h-14 items-center justify-center border-b border-border md:justify-start md:px-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <div className="size-3 rounded-full bg-primary-foreground" />
          </div>
          <span className="ml-3 hidden text-sm font-semibold tracking-tight md:block">
            HireSense AI
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={linkClass(isActive(item.url, item.exact))}
              title={item.title}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="hidden md:block">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border p-2 md:p-3">
          <Link to="/settings" className={linkClass(isActive("/settings", false))} title="Settings">
            <Settings className="size-4 shrink-0" />
            <span className="hidden md:block">Settings</span>
          </Link>
          <Link
            to="/login"
            className={linkClass(false)}
            title="Sign out"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="hidden md:block">Sign out</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-14 flex min-h-screen flex-col md:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <h1 className="text-sm font-medium tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <Search className="size-4" />
            </button>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              width={512}
              height={512}
              loading="lazy"
              className="size-7 rounded-full object-cover ring-1 ring-foreground/10"
            />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
