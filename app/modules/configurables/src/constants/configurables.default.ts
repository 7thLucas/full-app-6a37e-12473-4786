/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline?: string;
  companyName?: string;
  supportEmail?: string;
  brandColor: TBrandColor;
  font: TFont;
  repHomeGreeting?: string;
  callReportReminder?: string;
  dailyVisitTarget?: number;
  lowSampleThreshold?: number;
  requireComplianceApproval?: boolean;
  enableSampleTracking?: boolean;
  enableManagerDashboard?: boolean;
  interestLevels?: string[];
  specialties?: string[];
  callQualityFactors?: string[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "MEGMA Healthcare",
  logoUrl: "",
  tagline: "Digital detailing for pharma field teams",
  companyName: "MEGMA Pharmaceuticals",
  supportEmail: "support@megma.health",
  brandColor: {
    // Base
    background:        "#f4f7f9",
    foreground:        "#14233a",
    // Card
    card:              "#ffffff",
    cardForeground:    "#14233a",
    // Popover
    popover:           "#ffffff",
    popoverForeground: "#14233a",
    // Primary — medical teal
    primary:           "#0e7c86",
    primaryForeground: "#ffffff",
    // Secondary — deep navy
    secondary:           "#14233a",
    secondaryForeground: "#ffffff",
    // Muted — clinical gray
    muted:           "#eef2f5",
    mutedForeground: "#5a6b7b",
    // Accent — clean green
    accent:           "#2ba84a",
    accentForeground: "#ffffff",
    // Destructive — muted compliance red
    destructive:           "#d14343",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#e2e8ed",
    input:  "#e2e8ed",
    ring:   "#0e7c86",
    // Charts
    chart1: "#0e7c86",
    chart2: "#2ba84a",
    chart3: "#14233a",
    chart4: "#e8a23b",
    chart5: "#3d8ab5",
    // Navbar
    navbarBackground: "#ffffff",
    // Sidebar — deep navy rail
    sidebarBackground:        "#14233a",
    sidebarForeground:        "#c4d0db",
    sidebarPrimary:           "#0e7c86",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#1d3454",
    sidebarAccentForeground:  "#ffffff",
    sidebarBorder:            "#24395a",
    sidebarRing:              "#0e7c86",
  },
  font: {
    headingFont: "Inter Tight",
    textFont: "Inter",
  },
  repHomeGreeting: "Ready for today's visits",
  callReportReminder: "Submit your call report before leaving the clinic.",
  dailyVisitTarget: 8,
  lowSampleThreshold: 20,
  requireComplianceApproval: true,
  enableSampleTracking: true,
  enableManagerDashboard: true,
  interestLevels: ["High", "Moderate", "Low", "No Interest"],
  specialties: [
    "Cardiology",
    "Endocrinology",
    "General Practice",
    "Neurology",
    "Oncology",
    "Pediatrics",
    "Pulmonology",
  ],
  callQualityFactors: [
    "Slides Presented",
    "Key Message Delivered",
    "Doctor Engagement",
    "Next Step Agreed",
  ],
};
