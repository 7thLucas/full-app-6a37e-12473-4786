import { useLoaderData, useFetcher, Link } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useState } from "react";
import {
  LayoutGrid,
  UploadCloud,
  CheckCircle2,
  Archive,
  Trash2,
  FileText,
} from "lucide-react";
import {
  getVisualAids,
  setVisualAidStatus,
  deleteVisualAid,
} from "~/megma/services/megma.service";
import { Card, Pill, Button, EmptyState } from "~/megma/components/ui";
import { statusStyle } from "~/megma/lib/format";
import { cn } from "~/lib/utils";

export async function loader(_args: LoaderFunctionArgs) {
  const aids = await getVisualAids();
  return { aids };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const id = String(form.get("id"));
  if (intent === "delete") {
    await deleteVisualAid(id);
  } else if (intent === "status") {
    await setVisualAidStatus(id, String(form.get("status")));
  }
  return Response.json({ ok: true });
}

const FILTERS = ["all", "approved", "pending", "archived"] as const;

export default function ContentLibrary() {
  const { aids } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const visible = aids.filter((a: any) =>
    filter === "all" ? true : a.status === filter,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            Visual Aid Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the detailing content reps present in the field.
          </p>
        </div>
        <Link to="/brand/upload">
          <Button>
            <UploadCloud className="h-4 w-4" /> Upload visual aid
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f} (
            {f === "all"
              ? aids.length
              : aids.filter((a: any) => a.status === f).length}
            )
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a: any) => (
            <Card key={a._id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {a.fileType === "image" ? (
                  <img
                    src={a.fileUrl}
                    alt={a.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
                <Pill className={cn("absolute left-2 top-2 capitalize", statusStyle(a.status))}>
                  {a.status}
                </Pill>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-primary">{a.product}</p>
                {a.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {a.description}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {a.status !== "approved" ? (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="status" />
                      <input type="hidden" name="id" value={a._id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button size="sm" variant="accent" type="submit">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                    </fetcher.Form>
                  ) : null}
                  {a.status !== "archived" ? (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="status" />
                      <input type="hidden" name="id" value={a._id} />
                      <input type="hidden" name="status" value="archived" />
                      <Button size="sm" variant="outline" type="submit">
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </Button>
                    </fetcher.Form>
                  ) : null}
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={a._id} />
                    <Button size="sm" variant="ghost" type="submit" className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </fetcher.Form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No visual aids here yet"
          description="Upload product slides to build your detailing library."
          icon={<LayoutGrid className="h-5 w-5" />}
          action={
            <Link to="/brand/upload">
              <Button>
                <UploadCloud className="h-4 w-4" /> Upload visual aid
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
