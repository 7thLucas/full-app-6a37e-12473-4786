import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  Target,
  Stethoscope,
  TriangleAlert,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  getReps,
  getHcps,
  getVisits,
  getSamples,
} from "~/megma/services/megma.service";
import { useConfigurables } from "~/modules/configurables";
import { Card, ProgressBar, Pill, EmptyState } from "~/megma/components/ui";
import { timeAgo, interestStyle } from "~/megma/lib/format";

export async function loader(_args: LoaderFunctionArgs) {
  const reps = await getReps();
  const rep = reps[0];
  if (!rep) return { rep: null, hcps: [], todayVisits: [], lowSamples: [] };

  const [hcps, visits, samples] = await Promise.all([
    getHcps(rep.id ?? rep._id),
    getVisits({ repId: rep.id ?? rep._id, limit: 50 }),
    getSamples(rep.id ?? rep._id),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayVisits = visits.filter(
    (v: any) => new Date(v.visitedAt) >= startOfToday,
  );

  return {
    rep,
    hcps,
    todayVisits,
    recentVisits: visits.slice(0, 4),
    samples,
  };
}

export default function RepHome() {
  const data = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const target = config?.dailyVisitTarget ?? 8;
  const lowThreshold = config?.lowSampleThreshold ?? 20;
  const greeting = config?.repHomeGreeting ?? "Ready for today's visits";
  const reminder = config?.callReportReminder ?? "";
  const sampleTracking = config?.enableSampleTracking !== false;

  if (!data.rep) {
    return <EmptyState title="No rep profile found" icon={<Stethoscope className="h-5 w-5" />} />;
  }

  const done = data.todayVisits.length;
  const pct = Math.round((done / target) * 100);
  const lowSamples = sampleTracking
    ? (data.samples ?? []).filter((s: any) => s.stock <= lowThreshold)
    : [];
  const firstName = data.rep.name.split(" ")[0];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Hi {firstName},</p>
        <h1
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          {greeting}
        </h1>
      </div>

      {/* Daily target */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" /> Daily visit target
          </span>
          <span className="text-sm font-bold text-foreground">
            {done}
            <span className="text-muted-foreground">/{target}</span>
          </span>
        </div>
        <ProgressBar value={pct} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          {done >= target
            ? "Target reached — great work today."
            : `${target - done} more visit${target - done === 1 ? "" : "s"} to hit today's target.`}
        </p>
      </Card>

      {reminder ? (
        <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{reminder}</span>
        </div>
      ) : null}

      {/* Low samples */}
      {lowSamples.length > 0 ? (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TriangleAlert className="h-4 w-4 text-[#b97d1d]" /> Low sample stock
          </div>
          <div className="mt-3 space-y-2">
            {lowSamples.map((s: any) => (
              <div
                key={s._id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{s.product}</span>
                <Pill className="border-[#e8a23b]/30 bg-[#e8a23b]/15 text-[#b97d1d]">
                  {s.stock} left
                </Pill>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Quick start */}
      <Link to="/app/hcps">
        <Card className="flex items-center justify-between bg-primary p-4 text-primary-foreground transition-all active:scale-[.99]">
          <div>
            <p className="text-sm font-semibold">Start a detail visit</p>
            <p className="text-xs opacity-90">
              {data.hcps.length} HCPs in {data.rep.territory}
            </p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Card>
      </Link>

      {/* Recent activity */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">
          Recent visits
        </h2>
        {data.recentVisits && data.recentVisits.length > 0 ? (
          <div className="space-y-2">
            {data.recentVisits.map((v: any) => (
              <Card key={v._id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {v.hcpName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.specialty} · {timeAgo(v.visitedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className={interestStyle(v.interestLevel)}>
                    {v.interestLevel}
                  </Pill>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No visits logged yet"
            description="Pick an HCP and start your first detail session."
            icon={<Stethoscope className="h-5 w-5" />}
          />
        )}
      </div>
    </div>
  );
}
