import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight, MapPin, Users } from "lucide-react";
import { getReps, getHcps } from "~/megma/services/megma.service";
import { Card, Avatar, Pill, EmptyState } from "~/megma/components/ui";
import { timeAgo, interestStyle } from "~/megma/lib/format";

export async function loader(_args: LoaderFunctionArgs) {
  const reps = await getReps();
  const rep = reps[0];
  const hcps = rep ? await getHcps(rep.id ?? rep._id) : [];
  return { rep, hcps };
}

export default function HcpList() {
  const { rep, hcps } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hcps;
    return hcps.filter(
      (h: any) =>
        h.name.toLowerCase().includes(q) ||
        h.specialty.toLowerCase().includes(q) ||
        h.clinic.toLowerCase().includes(q),
    );
  }, [hcps, query]);

  return (
    <div className="space-y-4">
      <div>
        <h1
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          HCP Contacts
        </h1>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {rep?.territory ?? "Territory"} ·{" "}
          {hcps.length} doctors
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, specialty or clinic"
          className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((h: any) => (
            <Link key={h._id} to={`/app/hcps/${h._id}`}>
              <Card className="flex items-center gap-3 p-3 transition-all active:scale-[.99]">
                <Avatar name={h.name} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {h.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {h.specialty} · {h.clinic}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Pill className={interestStyle(h.lastInterest)}>
                      {h.lastInterest}
                    </Pill>
                    <span className="text-[11px] text-muted-foreground">
                      {h.lastVisitAt
                        ? `Visited ${timeAgo(h.lastVisitAt)}`
                        : "No visits yet"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No HCPs found"
          description="Try a different search term."
          icon={<Users className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
