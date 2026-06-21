import { useConfigurables } from "~/modules/configurables";
import { Activity } from "lucide-react";
import { cn } from "~/lib/utils";

export function useBrand() {
  const { config, loading } = useConfigurables();
  return {
    loading,
    appName: config?.appName ?? "MEGMA Healthcare",
    tagline: config?.tagline ?? "",
    companyName: config?.companyName ?? "",
    logoUrl: config?.logoUrl ?? "",
    supportEmail: config?.supportEmail ?? "",
  };
}

export function BrandMark({
  size = "md",
  withText = true,
  onDark = false,
}: {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  onDark?: boolean;
}) {
  const { appName, logoUrl } = useBrand();
  const box = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={appName}
          className={cn(box, "rounded-lg object-cover")}
        />
      ) : (
        <div
          className={cn(
            box,
            "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          )}
        >
          <Activity className="h-1/2 w-1/2" strokeWidth={2.4} />
        </div>
      )}
      {withText ? (
        <span
          className={cn(
            "font-bold tracking-tight",
            text,
            onDark ? "text-sidebar-foreground" : "text-foreground",
          )}
          style={{ fontFamily: "var(--heading-font)" }}
        >
          {appName}
        </span>
      ) : null}
    </div>
  );
}
