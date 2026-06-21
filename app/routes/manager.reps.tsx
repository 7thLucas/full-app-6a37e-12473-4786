import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getManagerAnalytics } from "~/megma/services/megma.service";
import { useConfigurables } from "~/modules/configurables";
import { Card, Avatar, ProgressBar } from "~/megma/components/ui";

export async function loader(_args: LoaderFunctionArgs) {
  const analytics = await getManagerAnalytics();
  return { analytics };
}

export default function ManagerReps() {
  const { analytics } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const target = config?.dailyVisitTarget ?? 8;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          Rep Performance
        </h1>
        <p className="text-sm text-muted-foreground">
          Coverage, visit volume and call quality by representative.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {analytics.repStats.map((r: any) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={r.name} color={r.avatarColor} className="h-12 w-12" />
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.territory} · {r.region}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted p-2.5">
                <p className="text-lg font-bold text-foreground">{r.visits}</p>
                <p className="text-[11px] text-muted-foreground">Visits</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <p className="text-lg font-bold text-foreground">{r.hcps}</p>
                <p className="text-[11px] text-muted-foreground">HCPs</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <p className="text-lg font-bold text-foreground">{r.avgQuality}</p>
                <p className="text-[11px] text-muted-foreground">Quality</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">HCP coverage</span>
                  <span className="font-semibold text-foreground">
                    {r.coverage}%
                  </span>
                </div>
                <ProgressBar value={r.coverage} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Today vs target
                  </span>
                  <span className="font-semibold text-foreground">
                    {r.visitsToday}/{target}
                  </span>
                </div>
                <ProgressBar value={(r.visitsToday / target) * 100} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
