import { useLoaderData, useNavigate, useNavigation, useSubmit } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Presentation,
  ClipboardList,
  PackageCheck,
  Check,
  Minus,
  Plus,
  Maximize2,
} from "lucide-react";
import {
  getHcp,
  getReps,
  getVisualAids,
  getSamples,
  createVisit,
} from "~/megma/services/megma.service";
import { useConfigurables } from "~/modules/configurables";
import { Card, Button, Avatar, Pill } from "~/megma/components/ui";
import { cn } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const hcp = await getHcp(params.hcpId!);
  if (!hcp) throw new Response("HCP not found", { status: 404 });
  const [reps, aids, samples] = await Promise.all([
    getReps(),
    getVisualAids("approved"),
    getSamples(hcp.repId),
  ]);
  return { hcp, rep: reps[0] ?? null, aids, samples };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.formData();
  const payload = JSON.parse(String(form.get("payload") || "{}"));
  const reps = await getReps();
  const repId = reps[0]?.id ?? reps[0]?._id;

  await createVisit({
    hcpId: params.hcpId!,
    repId,
    presentedAidIds: payload.presentedAidIds ?? [],
    interestLevel: payload.interestLevel,
    feedback: payload.feedback ?? "",
    nextStep: payload.nextStep ?? "",
    dispensed: payload.dispensed ?? [],
    qualityFactors: payload.qualityFactors ?? [],
  });

  return Response.json({ ok: true, hcpId: params.hcpId });
}

type Step = "present" | "report" | "samples" | "done";

export default function DetailSession() {
  const { hcp, aids, samples } = useLoaderData<typeof loader>();
  const { config } = useConfigurables();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();

  const interestLevels = config?.interestLevels ?? [
    "High",
    "Moderate",
    "Low",
    "No Interest",
  ];
  const qualityFactors = config?.callQualityFactors ?? [];
  const sampleTracking = config?.enableSampleTracking !== false;

  const [step, setStep] = useState<Step>("present");
  const [slideIdx, setSlideIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [presented, setPresented] = useState<Set<string>>(new Set());

  const [interest, setInterest] = useState(interestLevels[1] ?? "Moderate");
  const [feedback, setFeedback] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [factors, setFactors] = useState<Set<string>>(new Set());
  const [dispense, setDispense] = useState<Record<string, number>>({});

  const submitting = navigation.state === "submitting";

  const goSlide = (dir: number) => {
    setSlideIdx((i) => {
      const next = Math.min(aids.length - 1, Math.max(0, i + dir));
      const aid = aids[next];
      if (aid) {
        setPresented((p) => new Set(p).add(aid._id));
      }
      return next;
    });
  };

  const markCurrentPresented = () => {
    const aid = aids[slideIdx];
    if (aid) setPresented((p) => new Set(p).add(aid._id));
  };

  const toggleFactor = (f: string) => {
    setFactors((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const dispensedLines = useMemo(
    () =>
      Object.entries(dispense)
        .filter(([, qty]) => qty > 0)
        .map(([sampleId, quantity]) => {
          const s = samples.find((x: any) => x._id === sampleId);
          return { sampleId, product: s?.product ?? "", quantity };
        }),
    [dispense, samples],
  );

  const handleSubmit = () => {
    const payload = {
      presentedAidIds: [...presented],
      interestLevel: interest,
      feedback,
      nextStep,
      qualityFactors: [...factors],
      dispensed: dispensedLines,
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    submit(fd, { method: "post" });
    setStep("done");
  };

  /* ── Done screen ──────────────────────────────────────────────────────── */
  if (step === "done") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1
          className="mt-4 text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          Call report submitted
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Synced to the manager dashboard for {hcp.name}.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button onClick={() => navigate(`/app/hcps/${hcp._id}`)}>
            View HCP profile
          </Button>
          <Button variant="outline" onClick={() => navigate("/app")}>
            Back to today
          </Button>
        </div>
      </div>
    );
  }

  /* ── Fullscreen slide viewer ──────────────────────────────────────────── */
  if (fullscreen && aids.length > 0) {
    const aid = aids[slideIdx];
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-secondary">
        <div className="flex items-center justify-between px-4 py-3 text-secondary-foreground">
          <span className="text-sm font-medium">
            {slideIdx + 1} / {aids.length}
          </span>
          <button
            onClick={() => setFullscreen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Exit fullscreen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <img
            src={aid.fileUrl}
            alt={aid.title}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-secondary-foreground hover:bg-white/10"
            disabled={slideIdx === 0}
            onClick={() => goSlide(-1)}
          >
            <ChevronLeft className="h-5 w-5" /> Prev
          </Button>
          <p className="flex-1 truncate text-center text-sm text-secondary-foreground">
            {aid.title}
          </p>
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-secondary-foreground hover:bg-white/10"
            disabled={slideIdx === aids.length - 1}
            onClick={() => goSlide(1)}
          >
            Next <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/hcps/${hcp._id}`)}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={hcp.name} className="h-7 w-7 text-xs" />
          <span className="text-sm font-semibold text-foreground">{hcp.name}</span>
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} sampleTracking={sampleTracking} />

      {/* ── Present ─────────────────────────────────────────────────────── */}
      {step === "present" ? (
        <div className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Presentation className="h-4 w-4 text-primary" /> Present approved
              slides
            </h2>
            <p className="text-xs text-muted-foreground">
              Swipe through compliance-approved visual aids.
            </p>
          </div>

          {aids.length > 0 ? (
            <>
              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    markCurrentPresented();
                    setFullscreen(true);
                  }}
                  className="group relative block w-full"
                >
                  <img
                    src={aids[slideIdx].fileUrl}
                    alt={aids[slideIdx].title}
                    className="aspect-[4/3] w-full bg-muted object-cover"
                  />
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-1 text-xs font-medium text-secondary-foreground">
                    <Maximize2 className="h-3.5 w-3.5" /> Present
                  </span>
                </button>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {aids[slideIdx].title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {aids[slideIdx].product}
                  </p>
                </div>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slideIdx === 0}
                  onClick={() => goSlide(-1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="flex gap-1.5">
                  {aids.map((_: any, i: number) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === slideIdx ? "w-5 bg-primary" : "w-1.5 bg-border",
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slideIdx === aids.length - 1}
                  onClick={() => goSlide(1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {presented.size} of {aids.length} slides presented
              </p>
            </>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No approved visual aids yet. Ask your Brand Manager to publish
              content.
            </Card>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              markCurrentPresented();
              setStep("report");
            }}
          >
            Continue to call report
          </Button>
        </div>
      ) : null}

      {/* ── Report ──────────────────────────────────────────────────────── */}
      {step === "report" ? (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ClipboardList className="h-4 w-4 text-primary" /> Call report
          </h2>

          <div>
            <label className="text-sm font-medium text-foreground">
              Doctor interest level
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {interestLevels.map((lvl: string) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setInterest(lvl)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                    interest === lvl
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {qualityFactors.length > 0 ? (
            <div>
              <label className="text-sm font-medium text-foreground">
                What happened in this call?
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {qualityFactors.map((f: string) => {
                  const on = factors.has(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFactor(f)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        on
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {on ? <Check className="h-3 w-3" /> : null}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-foreground">
              Doctor feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Key reactions, objections, questions raised…"
              className="mt-2 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Next step
            </label>
            <input
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Schedule follow-up, send trial data"
              className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("present")}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={() => (sampleTracking ? setStep("samples") : handleSubmit())}
            >
              {sampleTracking ? "Continue to samples" : "Submit call report"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Samples ─────────────────────────────────────────────────────── */}
      {step === "samples" ? (
        <div className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <PackageCheck className="h-4 w-4 text-primary" /> Samples dispensed
            </h2>
            <p className="text-xs text-muted-foreground">
              Record what was left with the doctor. Stock updates automatically.
            </p>
          </div>

          <div className="space-y-2">
            {samples.map((s: any) => {
              const qty = dispense[s._id] ?? 0;
              return (
                <Card key={s._id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {s.product}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.stock} in stock
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDispense((d) => ({
                          ...d,
                          [s._id]: Math.max(0, (d[s._id] ?? 0) - 1),
                        }))
                      }
                      disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDispense((d) => ({
                          ...d,
                          [s._id]: Math.min(s.stock, (d[s._id] ?? 0) + 1),
                        }))
                      }
                      disabled={qty >= s.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="rounded-lg border border-dashed border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            Digital compliance signature is captured automatically on submission —
            paperless and audit-ready.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("report")}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1"
              variant="accent"
              disabled={submitting}
              onClick={handleSubmit}
            >
              <Check className="h-4 w-4" /> Submit call report
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stepper({
  step,
  sampleTracking,
}: {
  step: Step;
  sampleTracking: boolean;
}) {
  const steps = [
    { key: "present", label: "Present" },
    { key: "report", label: "Report" },
    ...(sampleTracking ? [{ key: "samples", label: "Samples" }] : []),
  ];
  const order = steps.map((s) => s.key);
  const current = order.indexOf(step);

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-1 items-center gap-1.5">
          <div className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-1.5 w-full rounded-full",
                i <= current ? "bg-primary" : "bg-border",
              )}
            />
            <span
              className={cn(
                "text-[11px] font-medium",
                i <= current ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
