import { cn } from "~/lib/utils";

const CHART_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function BarChart({
  data,
  className,
}: {
  data: { label: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex h-40 items-end gap-2", className)}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            {d.value}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary transition-all"
              style={{
                height: `${Math.max(4, (d.value / max) * 100)}%`,
                opacity: 0.55 + (d.value / max) * 0.45,
              }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data,
  size = 140,
}: {
  data: { label: string; value: number }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const stroke = size * 0.16;
  const inner = radius - stroke / 2;
  const circumference = 2 * Math.PI * inner;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const seg = (
            <circle
              key={i}
              cx={radius}
              cy={radius}
              r={inner}
              fill="none"
              stroke={CHART_VARS[i % CHART_VARS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_VARS[i % CHART_VARS.length] }}
            />
            <span className="text-foreground">{d.label}</span>
            <span className="ml-auto font-semibold text-muted-foreground">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
