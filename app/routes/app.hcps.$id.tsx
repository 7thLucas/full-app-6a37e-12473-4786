import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  ChevronLeft,
  Phone,
  MapPin,
  Stethoscope,
  History,
  Play,
  PackageCheck,
} from "lucide-react";
import { getHcp, getVisits } from "~/megma/services/megma.service";
import { Card, Avatar, Pill, Button, EmptyState } from "~/megma/components/ui";
import { formatDate, interestStyle } from "~/megma/lib/format";

export async function loader({ params }: LoaderFunctionArgs) {
  const hcp = await getHcp(params.id!);
  if (!hcp) {
    throw new Response("HCP not found", { status: 404 });
  }
  const visits = await getVisits({ hcpId: params.id! });
  return { hcp, visits };
}

export default function HcpProfile() {
  const { hcp, visits } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-5">
      <Link
        to="/app/hcps"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Contacts
      </Link>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={hcp.name} className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <h1
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              {hcp.name}
            </h1>
            <p className="flex items-center gap-1 text-sm text-primary">
              <Stethoscope className="h-3.5 w-3.5" /> {hcp.specialty}
            </p>
            <Pill className={`mt-1.5 ${interestStyle(hcp.lastInterest)}`}>
              {hcp.lastInterest} interest
            </Pill>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {hcp.clinic}, {hcp.city}
          </div>
          {hcp.phone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {hcp.phone}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {hcp.totalVisits ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Total visits</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{visits.length}</p>
            <p className="text-xs text-muted-foreground">Logged reports</p>
          </div>
        </div>

        <Link to={`/app/detail/${hcp._id}`} className="mt-4 block">
          <Button className="w-full" size="lg">
            <Play className="h-4 w-4" /> Start detail visit
          </Button>
        </Link>
      </Card>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4" /> Visit history
        </h2>
        {visits.length > 0 ? (
          <div className="space-y-2">
            {visits.map((v: any) => (
              <Card key={v._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(v.visitedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.slidesPresented} slide
                      {v.slidesPresented === 1 ? "" : "s"} presented · by{" "}
                      {v.repName}
                    </p>
                  </div>
                  <Pill className={interestStyle(v.interestLevel)}>
                    {v.interestLevel}
                  </Pill>
                </div>
                {v.feedback ? (
                  <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                    {v.feedback}
                  </p>
                ) : null}
                {v.nextStep ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Next step:
                    </span>{" "}
                    {v.nextStep}
                  </p>
                ) : null}
                {v.dispensed && v.dispensed.length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <PackageCheck className="h-3.5 w-3.5 text-accent" />
                    {v.dispensed.map((d: any, i: number) => (
                      <span
                        key={i}
                        className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent"
                      >
                        {d.product} ×{d.quantity}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No visit history"
            description="Start a detail visit to create the first call report."
            icon={<History className="h-5 w-5" />}
          />
        )}
      </div>
    </div>
  );
}
