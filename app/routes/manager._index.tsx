import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  Activity,
  Users,
  MapPinned,
  Gauge,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getManagerAnalytics } from "~/megma/services/megma.service";
import { useConfigurables } from "~/modules/configurables";
import { Card, KpiCard, Avatar, Pill } from "~/megma/components/ui";
import { BarChart, Donut } from "~/megma/components/charts";
import { timeAgo, interestStyle } from "~/megma/lib/format";

export async function loader(_args: LoaderFunctionArgs) {
  const analytics = await getManagerAnalytics();
  return { analytics };
}

export default function ManagerDashboard() {
  const { analytics } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();

  if (config?.enableManagerDashboard === false) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        The manager analytics dashboard is currently disabled in app
        configuration.
      </Card>
    );
  }

  const t = analytics.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          Territory Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Live field activity — updated the moment a rep submits a call report.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Visits Today"
          value={t.visitsToday}
          sub={`${t.visits} all-time`}
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          label="HCP Coverage"
          value={`${t.coverage}%`}
          sub={`${t.hcps} HCPs in territory`}
          icon={<MapPinned className="h-4 w-4" />}
          accent
        />
        <KpiCard
          label="Avg Call Quality"
          value={t.avgQuality}
          sub="out of 100"
          icon={<Gauge className="h-4 w-4" />}
        />
        <KpiCard
          label="Active Reps"
          value={t.reps}
          sub="reporting live"
          icon={<Users className="h-4 w-4" />}
          accent
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" /> Visits — last 7 days
            </h2>
          </div>
          <div className="mt-5">
            <BarChart data={analytics.trend} />
          </div>
        </Card>

        {/* Specialty mix */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Visits by specialty
          </h2>
          <div className="mt-4">
            {analytics.bySpecialty.length > 0 ? (
              <Donut data={analytics.bySpecialty.slice(0, 5)} />
            ) : (
              <p className="text-sm text-muted-foreground">No visits yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top reps */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Rep performance
          </h2>
          <Link
            to="/manager/reps"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {analytics.repStats.slice(0, 3).map((r: any) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <Avatar name={r.name} color={r.avatarColor} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {r.name}
                </p>
                <p className="text-xs text-muted-foreground">{r.territory}</p>
              </div>
              <div className="flex items-center gap-4 text-right text-xs">
                <div>
                  <p className="font-bold text-foreground">{r.visits}</p>
                  <p className="text-muted-foreground">visits</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{r.coverage}%</p>
                  <p className="text-muted-foreground">coverage</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{r.avgQuality}</p>
                  <p className="text-muted-foreground">quality</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent activity */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Latest call reports
        </h2>
        <div className="mt-4 divide-y divide-border">
          {analytics.recentVisits.map((v: any) => (
            <div
              key={v._id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {v.hcpName}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {v.specialty}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {v.repName} · {timeAgo(v.visitedAt)}
                </p>
              </div>
              <Pill className={interestStyle(v.interestLevel)}>
                {v.interestLevel}
              </Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
