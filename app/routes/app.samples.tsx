import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Package, TriangleAlert, CheckCircle2 } from "lucide-react";
import { getReps, getSamples, getVisits } from "~/megma/services/megma.service";
import { useConfigurables } from "~/modules/configurables";
import { Card, Pill, ProgressBar, EmptyState } from "~/megma/components/ui";

export async function loader(_args: LoaderFunctionArgs) {
  const reps = await getReps();
  const rep = reps[0];
  if (!rep) return { samples: [], dispensedTotals: {} as Record<string, number> };
  const repId = rep.id ?? rep._id;
  const [samples, visits] = await Promise.all([
    getSamples(repId),
    getVisits({ repId }),
  ]);

  const dispensedTotals: Record<string, number> = {};
  for (const v of visits as any[]) {
    for (const d of v.dispensed ?? []) {
      dispensedTotals[d.product] = (dispensedTotals[d.product] ?? 0) + d.quantity;
    }
  }
  return { samples, dispensedTotals };
}

export default function Samples() {
  const { samples, dispensedTotals } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const lowThreshold = config?.lowSampleThreshold ?? 20;

  if (config?.enableSampleTracking === false) {
    return (
      <EmptyState
        title="Sample tracking is disabled"
        description="Enable it from the app configuration to manage sample inventory."
        icon={<Package className="h-5 w-5" />}
      />
    );
  }

  const maxStock = Math.max(...samples.map((s: any) => s.stock), 1);

  return (
    <div className="space-y-4">
      <div>
        <h1
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          Sample Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Paperless, audit-ready stock and dispensing records.
        </p>
      </div>

      {samples.length > 0 ? (
        <div className="space-y-2">
          {samples.map((s: any) => {
            const low = s.stock <= lowThreshold;
            return (
              <Card key={s._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {s.product}
                    </p>
                    <p className="text-xs text-muted-foreground">SKU {s.sku}</p>
                  </div>
                  {low ? (
                    <Pill className="border-[#e8a23b]/30 bg-[#e8a23b]/15 text-[#b97d1d]">
                      <TriangleAlert className="h-3 w-3" /> Low
                    </Pill>
                  ) : (
                    <Pill className="border-accent/30 bg-accent/15 text-accent">
                      <CheckCircle2 className="h-3 w-3" /> In stock
                    </Pill>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">
                    {s.stock}{" "}
                    <span className="font-normal text-muted-foreground">
                      units
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dispensedTotals[s.product] ?? 0} dispensed
                  </span>
                </div>
                <ProgressBar value={(s.stock / maxStock) * 100} className="mt-2" />
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No samples assigned"
          icon={<Package className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
