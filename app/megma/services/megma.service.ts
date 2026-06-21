import { connectMongoDB } from "~/lib/db.server";
import {
  MegmaRepModel,
  MegmaHcpModel,
  MegmaVisualAidModel,
  MegmaSampleModel,
  MegmaVisitModel,
} from "../models/megma.model";

/**
 * MEGMA service layer — all server-side data access used by React Router
 * loaders/actions. Ensures the DB connection is live and seeds demo data on
 * first call so the live preview is populated.
 */

let seeded = false;

export async function ensureReady() {
  await connectMongoDB();
  if (seeded) return;
  await seedDemoData();
  seeded = true;
}

function plain<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

/* ── Reps ────────────────────────────────────────────────────────────────── */
export async function getReps() {
  await ensureReady();
  const reps = await MegmaRepModel.find({ deletedAt: null }).sort({ name: 1 }).lean();
  return plain<any[]>(reps);
}

export async function getRep(id: string) {
  await ensureReady();
  const rep = await MegmaRepModel.findById(id).lean();
  return rep ? plain<any>(rep) : null;
}

/* ── HCPs ────────────────────────────────────────────────────────────────── */
export async function getHcps(repId?: string) {
  await ensureReady();
  const filter: any = { deletedAt: null };
  if (repId) filter.repId = repId;
  const hcps = await MegmaHcpModel.find(filter).sort({ name: 1 }).lean();
  return plain<any[]>(hcps);
}

export async function getHcp(id: string) {
  await ensureReady();
  const hcp = await MegmaHcpModel.findById(id).lean();
  return hcp ? plain<any>(hcp) : null;
}

/* ── Visual Aids ─────────────────────────────────────────────────────────── */
export async function getVisualAids(statusFilter?: string) {
  await ensureReady();
  const filter: any = { deletedAt: null };
  if (statusFilter) filter.status = statusFilter;
  const aids = await MegmaVisualAidModel.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return plain<any[]>(aids);
}

export async function createVisualAid(input: {
  title: string;
  product?: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  uploadedBy?: string;
  status?: string;
}) {
  await ensureReady();
  const count = await MegmaVisualAidModel.countDocuments({ deletedAt: null });
  const created = await MegmaVisualAidModel.create({
    title: input.title,
    product: input.product ?? "",
    description: input.description ?? "",
    fileUrl: input.fileUrl,
    fileType: input.fileType ?? "image",
    uploadedBy: input.uploadedBy ?? "Brand Manager",
    status: input.status ?? "pending",
    order: count,
  });
  return plain<any>(created.toObject());
}

export async function setVisualAidStatus(id: string, status: string) {
  await ensureReady();
  const updated = await MegmaVisualAidModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  ).lean();
  return updated ? plain<any>(updated) : null;
}

export async function deleteVisualAid(id: string) {
  await ensureReady();
  await MegmaVisualAidModel.findByIdAndUpdate(id, {
    $set: { deletedAt: new Date() },
  });
  return { ok: true };
}

/* ── Samples ─────────────────────────────────────────────────────────────── */
export async function getSamples(repId?: string) {
  await ensureReady();
  const filter: any = { deletedAt: null };
  if (repId) filter.repId = repId;
  const samples = await MegmaSampleModel.find(filter).sort({ product: 1 }).lean();
  return plain<any[]>(samples);
}

export async function adjustSampleStock(id: string, delta: number) {
  await ensureReady();
  const sample = await MegmaSampleModel.findById(id);
  if (!sample) return null;
  sample.stock = Math.max(0, sample.stock + delta);
  await sample.save();
  return plain<any>(sample.toObject());
}

/* ── Visits / Call Reports ───────────────────────────────────────────────── */
export async function getVisits(opts?: { repId?: string; hcpId?: string; limit?: number }) {
  await ensureReady();
  const filter: any = { deletedAt: null };
  if (opts?.repId) filter.repId = opts.repId;
  if (opts?.hcpId) filter.hcpId = opts.hcpId;
  let q = MegmaVisitModel.find(filter).sort({ visitedAt: -1 });
  if (opts?.limit) q = q.limit(opts.limit);
  const visits = await q.lean();
  return plain<any[]>(visits);
}

export async function createVisit(input: {
  hcpId: string;
  repId: string;
  presentedAidIds?: string[];
  interestLevel: string;
  feedback?: string;
  nextStep?: string;
  dispensed?: { sampleId: string; product: string; quantity: number }[];
  qualityFactors?: string[];
}) {
  await ensureReady();
  const hcp = await MegmaHcpModel.findById(input.hcpId);
  const rep = await MegmaRepModel.findById(input.repId);
  const presentedAidIds = input.presentedAidIds ?? [];

  // Compute a call quality score from completeness factors.
  const factors = input.qualityFactors ?? [];
  const factorScore = Math.min(factors.length, 4) * 15; // up to 60
  const presentScore = presentedAidIds.length > 0 ? 20 : 0;
  const nextStepScore = input.nextStep && input.nextStep.trim().length > 0 ? 20 : 0;
  const qualityScore = Math.min(100, factorScore + presentScore + nextStepScore);

  const visit = await MegmaVisitModel.create({
    hcpId: input.hcpId,
    hcpName: hcp?.name ?? "",
    specialty: hcp?.specialty ?? "",
    repId: input.repId,
    repName: rep?.name ?? "",
    territory: rep?.territory ?? hcp?.territory ?? "",
    visitedAt: new Date(),
    presentedAidIds,
    slidesPresented: presentedAidIds.length,
    interestLevel: input.interestLevel,
    feedback: input.feedback ?? "",
    nextStep: input.nextStep ?? "",
    dispensed: input.dispensed ?? [],
    qualityScore,
    qualityFactors: factors,
  });

  // Update HCP engagement
  if (hcp) {
    hcp.lastVisitAt = new Date();
    hcp.totalVisits = (hcp.totalVisits ?? 0) + 1;
    hcp.lastInterest = input.interestLevel;
    await hcp.save();
  }

  // Decrement sample stock
  for (const line of input.dispensed ?? []) {
    if (line.sampleId && line.quantity > 0) {
      const s = await MegmaSampleModel.findById(line.sampleId);
      if (s) {
        s.stock = Math.max(0, s.stock - line.quantity);
        await s.save();
      }
    }
  }

  return plain<any>(visit.toObject());
}

/* ── Manager analytics aggregation ───────────────────────────────────────── */
export async function getManagerAnalytics() {
  await ensureReady();
  const [reps, hcps, visits] = await Promise.all([
    MegmaRepModel.find({ deletedAt: null }).lean(),
    MegmaHcpModel.find({ deletedAt: null }).lean(),
    MegmaVisitModel.find({ deletedAt: null }).lean(),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const visitsToday = visits.filter(
    (v: any) => new Date(v.visitedAt) >= startOfToday,
  ).length;

  const coveredHcpIds = new Set(visits.map((v: any) => String(v.hcpId)));
  const coverage = hcps.length
    ? Math.round((coveredHcpIds.size / hcps.length) * 100)
    : 0;

  const avgQuality = visits.length
    ? Math.round(
        visits.reduce((sum: number, v: any) => sum + (v.qualityScore || 0), 0) /
          visits.length,
      )
    : 0;

  // Per-rep performance
  const repStats = reps.map((rep: any) => {
    const repVisits = visits.filter((v: any) => String(v.repId) === String(rep._id));
    const repHcps = hcps.filter((h: any) => String(h.repId) === String(rep._id));
    const repCovered = new Set(repVisits.map((v: any) => String(v.hcpId)));
    const repQuality = repVisits.length
      ? Math.round(
          repVisits.reduce((s: number, v: any) => s + (v.qualityScore || 0), 0) /
            repVisits.length,
        )
      : 0;
    return {
      id: String(rep._id),
      name: rep.name,
      territory: rep.territory,
      region: rep.region,
      avatarColor: rep.avatarColor,
      visits: repVisits.length,
      visitsToday: repVisits.filter(
        (v: any) => new Date(v.visitedAt) >= startOfToday,
      ).length,
      hcps: repHcps.length,
      coverage: repHcps.length
        ? Math.round((repCovered.size / repHcps.length) * 100)
        : 0,
      avgQuality: repQuality,
    };
  });

  // Visits by specialty (for chart)
  const specialtyMap = new Map<string, number>();
  for (const v of visits as any[]) {
    const key = v.specialty || "Other";
    specialtyMap.set(key, (specialtyMap.get(key) || 0) + 1);
  }
  const bySpecialty = [...specialtyMap.entries()].map(([label, value]) => ({
    label,
    value,
  }));

  // Last 7 days trend
  const trend: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const count = visits.filter((v: any) => {
      const d = new Date(v.visitedAt);
      return d >= day && d < next;
    }).length;
    trend.push({
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    });
  }

  return plain<any>({
    totals: {
      visits: visits.length,
      visitsToday,
      hcps: hcps.length,
      reps: reps.length,
      coverage,
      avgQuality,
    },
    repStats: repStats.sort((a, b) => b.visits - a.visits),
    bySpecialty: bySpecialty.sort((a, b) => b.value - a.value),
    trend,
    recentVisits: plain<any[]>(
      visits
        .sort(
          (a: any, b: any) =>
            new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime(),
        )
        .slice(0, 8),
    ),
  });
}

/* ── Demo seed ───────────────────────────────────────────────────────────── */
async function seedDemoData() {
  const existing = await MegmaRepModel.countDocuments({});
  if (existing > 0) return;

  const reps = await MegmaRepModel.create([
    { name: "Sarah Tan", email: "sarah.tan@megma.health", territory: "North Jakarta", region: "Jakarta", avatarColor: "#0e7c86" },
    { name: "David Lim", email: "david.lim@megma.health", territory: "Bandung", region: "West Java", avatarColor: "#2ba84a" },
    { name: "Aisha Rahman", email: "aisha.r@megma.health", territory: "Surabaya", region: "East Java", avatarColor: "#3d8ab5" },
  ]);

  const repA = reps[0];
  const repB = reps[1];
  const repC = reps[2];

  const hcps = await MegmaHcpModel.create([
    { name: "Dr. Maya Putri", specialty: "Cardiology", clinic: "Heart Centre Clinic", territory: "North Jakarta", city: "Jakarta", phone: "+62 811 2200 101", repId: String(repA._id) },
    { name: "Dr. Budi Santoso", specialty: "Endocrinology", clinic: "Metabolic Care", territory: "North Jakarta", city: "Jakarta", phone: "+62 811 2200 102", repId: String(repA._id) },
    { name: "Dr. Rina Wijaya", specialty: "General Practice", clinic: "Sehat Family Clinic", territory: "North Jakarta", city: "Jakarta", phone: "+62 811 2200 103", repId: String(repA._id) },
    { name: "Dr. Agus Pratama", specialty: "Pulmonology", clinic: "Respira Clinic", territory: "North Jakarta", city: "Jakarta", phone: "+62 811 2200 104", repId: String(repA._id) },
    { name: "Dr. Siti Nurhaliza", specialty: "Neurology", clinic: "NeuroCare Bandung", territory: "Bandung", city: "Bandung", phone: "+62 822 3300 201", repId: String(repB._id) },
    { name: "Dr. Hendra Gunawan", specialty: "Pediatrics", clinic: "Anak Sehat Clinic", territory: "Bandung", city: "Bandung", phone: "+62 822 3300 202", repId: String(repB._id) },
    { name: "Dr. Lia Kusuma", specialty: "Oncology", clinic: "Onco Surabaya", territory: "Surabaya", city: "Surabaya", phone: "+62 833 4400 301", repId: String(repC._id) },
    { name: "Dr. Fajar Nugroho", specialty: "Cardiology", clinic: "Jantung Sehat", territory: "Surabaya", city: "Surabaya", phone: "+62 833 4400 302", repId: String(repC._id) },
  ]);

  await MegmaSampleModel.create([
    { product: "CardioMax 10mg", sku: "CMX-10", stock: 120, repId: String(repA._id) },
    { product: "GlucoBalance 500mg", sku: "GLB-500", stock: 14, repId: String(repA._id) },
    { product: "RespiClear Inhaler", sku: "RSP-INH", stock: 45, repId: String(repA._id) },
    { product: "NeuroEase 25mg", sku: "NEU-25", stock: 8, repId: String(repB._id) },
    { product: "PediCare Syrup", sku: "PED-SYR", stock: 60, repId: String(repB._id) },
    { product: "OncoGuard 100mg", sku: "ONC-100", stock: 30, repId: String(repC._id) },
  ]);

  // Approved demo visual aids (use stable remote placeholder imagery)
  const aidUrls = [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
  ];
  await MegmaVisualAidModel.create([
    { title: "CardioMax — Mechanism of Action", product: "CardioMax 10mg", description: "Approved CLM slide covering the mechanism of action and dosing.", fileUrl: aidUrls[0], fileType: "image", status: "approved", uploadedBy: "Brand Manager", order: 0 },
    { title: "CardioMax — Clinical Outcomes", product: "CardioMax 10mg", description: "Key efficacy data from phase III trials.", fileUrl: aidUrls[1], fileType: "image", status: "approved", uploadedBy: "Brand Manager", order: 1 },
    { title: "GlucoBalance — Patient Profile", product: "GlucoBalance 500mg", description: "Ideal patient selection and titration guidance.", fileUrl: aidUrls[0], fileType: "image", status: "approved", uploadedBy: "Brand Manager", order: 2 },
    { title: "RespiClear — Inhaler Technique", product: "RespiClear Inhaler", description: "Step-by-step inhaler technique for HCP discussion.", fileUrl: aidUrls[1], fileType: "image", status: "pending", uploadedBy: "Brand Manager", order: 3 },
  ]);

  // A few historical visits across reps for the dashboard
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const seedVisits = [
    { hcp: hcps[0], rep: repA, interest: "High", offset: 0, slides: 2, factors: ["Slides Presented", "Key Message Delivered", "Next Step Agreed"], next: "Schedule follow-up next week" },
    { hcp: hcps[1], rep: repA, interest: "Moderate", offset: 0, slides: 1, factors: ["Slides Presented", "Doctor Engagement"], next: "" },
    { hcp: hcps[2], rep: repA, interest: "Low", offset: 1, slides: 1, factors: ["Slides Presented"], next: "Revisit after formulary review" },
    { hcp: hcps[4], rep: repB, interest: "High", offset: 1, slides: 2, factors: ["Slides Presented", "Key Message Delivered", "Doctor Engagement", "Next Step Agreed"], next: "Provide trial data" },
    { hcp: hcps[5], rep: repB, interest: "Moderate", offset: 2, slides: 1, factors: ["Slides Presented", "Doctor Engagement"], next: "" },
    { hcp: hcps[6], rep: repC, interest: "High", offset: 3, slides: 2, factors: ["Slides Presented", "Key Message Delivered", "Next Step Agreed"], next: "Send dosing guide" },
    { hcp: hcps[7], rep: repC, interest: "Moderate", offset: 4, slides: 1, factors: ["Slides Presented"], next: "" },
  ];

  for (const sv of seedVisits) {
    const factorScore = Math.min(sv.factors.length, 4) * 15;
    const presentScore = sv.slides > 0 ? 20 : 0;
    const nextScore = sv.next ? 20 : 0;
    const qualityScore = Math.min(100, factorScore + presentScore + nextScore);
    const v = await MegmaVisitModel.create({
      hcpId: String(sv.hcp._id),
      hcpName: sv.hcp.name,
      specialty: sv.hcp.specialty,
      repId: String(sv.rep._id),
      repName: sv.rep.name,
      territory: sv.rep.territory,
      visitedAt: new Date(now - sv.offset * day - Math.floor(Math.random() * 6) * 60 * 60 * 1000),
      presentedAidIds: [],
      slidesPresented: sv.slides,
      interestLevel: sv.interest,
      feedback: "Productive discussion; doctor receptive to key messages.",
      nextStep: sv.next,
      dispensed: [],
      qualityScore,
      qualityFactors: sv.factors,
    });
    // bump HCP counters
    sv.hcp.totalVisits = (sv.hcp.totalVisits ?? 0) + 1;
    sv.hcp.lastVisitAt = v.visitedAt;
    sv.hcp.lastInterest = sv.interest;
    await sv.hcp.save();
  }
}
