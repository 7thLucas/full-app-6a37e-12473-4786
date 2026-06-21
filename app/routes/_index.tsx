import { Link } from "react-router";
import {
  Stethoscope,
  LineChart,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Clock,
  Radio,
} from "lucide-react";
import { useBrand } from "~/megma/components/brand";
import { BrandMark } from "~/megma/components/brand";
import { Card } from "~/megma/components/ui";

const ROLES = [
  {
    to: "/app",
    title: "Sales Rep",
    subtitle: "Field detailing on mobile",
    desc: "Select an HCP, present approved slides, log call reports and samples on the spot.",
    icon: Stethoscope,
  },
  {
    to: "/manager",
    title: "Sales Manager",
    subtitle: "Live territory dashboard",
    desc: "Track visit frequency, coverage, rep performance and call quality in real time.",
    icon: LineChart,
  },
  {
    to: "/brand",
    title: "Brand Manager",
    subtitle: "Visual aid content studio",
    desc: "Upload, organise and compliance-approve the slides reps present in the field.",
    icon: LayoutGrid,
  },
];

const PRINCIPLES = [
  { icon: Radio, label: "Every visit logged in real time" },
  { icon: ShieldCheck, label: "Compliance-approved content only" },
  { icon: Clock, label: "Reports submitted on the spot" },
];

export default function Landing() {
  const { appName, tagline, companyName } = useBrand();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <BrandMark size="md" />
          {companyName ? (
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">
              {companyName}
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Stethoscope className="h-3.5 w-3.5" /> Digital Detailing Platform
          </span>
          <h1
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            {appName}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {tagline ||
              "Present approved product slides, capture structured call reports, and give HQ real-time visibility from the first clinic to the last."}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {PRINCIPLES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              <Icon className="h-4 w-4 text-accent" /> {label}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Choose your workspace
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {ROLES.map(({ to, title, subtitle, desc, icon: Icon }) => (
              <Link key={to} to={to} className="group">
                <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="text-xs font-medium text-primary">{subtitle}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
