import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useMemo, useState } from "react";
import { Search, Gauge } from "lucide-react";
import { getVisits } from "~/megma/services/megma.service";
import { Card, Pill, EmptyState } from "~/megma/components/ui";
import { formatDate, interestStyle } from "~/megma/lib/format";

export async function loader(_args: LoaderFunctionArgs) {
  const visits = await getVisits({ limit: 100 });
  return { visits };
}

export default function ManagerVisits() {
  const { visits } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter(
      (v: any) =>
        v.hcpName.toLowerCase().includes(q) ||
        v.repName.toLowerCase().includes(q) ||
        v.specialty.toLowerCase().includes(q) ||
        v.territory.toLowerCase().includes(q),
    );
  }, [visits, query]);

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          Call Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Every logged detail visit — searchable and compliance-ready.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search HCP, rep, specialty or territory"
          className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((v: any) => (
            <Card key={v._id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {v.hcpName}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {v.specialty}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.repName} · {v.territory} · {formatDate(v.visitedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="border-primary/25 bg-primary/10 text-primary">
                    <Gauge className="h-3 w-3" /> {v.qualityScore}
                  </Pill>
                  <Pill className={interestStyle(v.interestLevel)}>
                    {v.interestLevel}
                  </Pill>
                </div>
              </div>
              {v.feedback ? (
                <p className="mt-2 text-sm text-muted-foreground">{v.feedback}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {v.slidesPresented} slide{v.slidesPresented === 1 ? "" : "s"}
                </span>
                {(v.dispensed ?? []).map((d: any, i: number) => (
                  <span
                    key={i}
                    className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent"
                  >
                    {d.product} ×{d.quantity}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No matching call reports" />
      )}
    </div>
  );
}
