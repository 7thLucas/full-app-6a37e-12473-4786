import { Outlet, NavLink, Link } from "react-router";
import { LayoutGrid, UploadCloud, ShieldCheck, ChevronLeft } from "lucide-react";
import { BrandMark } from "~/megma/components/brand";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/brand", label: "Content Library", icon: LayoutGrid, end: true },
  { to: "/brand/upload", label: "Upload Visual Aid", icon: UploadCloud, end: false },
  { to: "/brand/approvals", label: "Compliance Approvals", icon: ShieldCheck, end: false },
];

export default function BrandShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border px-5 py-4">
          <BrandMark size="md" onDark />
          <p className="mt-1 text-xs text-sidebar-foreground/70">Content Studio</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Switch workspace
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <BrandMark size="sm" />
          <Link to="/" className="text-xs font-medium text-muted-foreground">
            Switch
          </Link>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )
              }
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
