export function timeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const INTEREST_STYLES: Record<string, string> = {
  High: "bg-accent/15 text-accent border-accent/30",
  Moderate: "bg-primary/10 text-primary border-primary/25",
  Low: "bg-[#e8a23b]/15 text-[#b97d1d] border-[#e8a23b]/30",
  "No Interest": "bg-muted text-muted-foreground border-border",
};

export function interestStyle(level: string): string {
  return INTEREST_STYLES[level] ?? INTEREST_STYLES["Moderate"];
}

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-accent/15 text-accent border-accent/30",
  pending: "bg-[#e8a23b]/15 text-[#b97d1d] border-[#e8a23b]/30",
  archived: "bg-muted text-muted-foreground border-border",
};

export function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? STATUS_STYLES["pending"];
}
