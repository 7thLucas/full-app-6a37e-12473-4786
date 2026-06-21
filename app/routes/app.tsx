import { Outlet, NavLink, Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Home, Users, Package, ChevronLeft } from "lucide-react";
import { getReps } from "~/megma/services/megma.service";
import { BrandMark } from "~/megma/components/brand";
import { Avatar } from "~/megma/components/ui";
import { cn } from "~/lib/utils";

export async function loader(_args: LoaderFunctionArgs) {
  const reps = await getReps();
  const activeRep = reps[0] ?? null;
  return { activeRep };
}

const TABS = [
  { to: "/app", label: "Today", icon: Home, end: true },
  { to: "/app/hcps", label: "HCPs", icon: Users, end: false },
  { to: "/app/samples", label: "Samples", icon: Package, end: false },
];

export default function RepShell() {
  const { activeRep } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Back to workspace selection"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <BrandMark size="sm" />
        </div>
        {activeRep ? (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold leading-tight text-foreground">
                {activeRep.name}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {activeRep.territory}
              </p>
            </div>
            <Avatar
              name={activeRep.name}
              color={activeRep.avatarColor}
              className="h-9 w-9"
            />
          </div>
        ) : null}
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <Outlet context={{ activeRep }} />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-3">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
