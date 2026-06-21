import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * MEGMA HEALTHCARE domain models.
 *
 * All collections are prefixed `tbl_megma_*`. Models register with Mongoose on
 * import; React Router loaders import the services which import these models, so
 * registration happens lazily on first server use.
 */

const baseOptions = {
  options: { allowMixed: Severity.ALLOW },
} as const;

/* ── Rep (Medical Sales Representative) ──────────────────────────────────── */
@modelOptions({
  ...baseOptions,
  schemaOptions: { collection: "tbl_megma_reps", timestamps: true },
})
export class MegmaRep extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  territory!: string;

  @prop({ type: String, default: "" })
  region!: string;

  @prop({ type: String, default: "" })
  avatarColor!: string;
}

/* ── HCP (Healthcare Professional / Doctor) ─────────────────────────────── */
@modelOptions({
  ...baseOptions,
  schemaOptions: { collection: "tbl_megma_hcps", timestamps: true },
})
export class MegmaHcp extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  specialty!: string;

  @prop({ type: String, default: "" })
  clinic!: string;

  @prop({ type: String, default: "" })
  territory!: string;

  @prop({ type: String, default: "" })
  city!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  // The rep who owns this HCP relationship
  @prop({ type: String, default: "" })
  repId!: string;

  // Engagement metadata maintained as visits are logged
  @prop({ type: Date })
  lastVisitAt?: Date;

  @prop({ type: Number, default: 0 })
  totalVisits!: number;

  @prop({ type: String, default: "Moderate" })
  lastInterest!: string;
}

/* ── Visual Aid (a single approved detailing slide / asset) ─────────────── */
@modelOptions({
  ...baseOptions,
  schemaOptions: { collection: "tbl_megma_visual_aids", timestamps: true },
})
export class MegmaVisualAid extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, default: "" })
  product!: string;

  @prop({ type: String, default: "" })
  description!: string;

  // Resolved URL from the uploader scaffold
  @prop({ type: String, required: true })
  fileUrl!: string;

  @prop({ type: String, default: "image" })
  fileType!: string;

  // approved | pending | archived
  @prop({ type: String, default: "pending" })
  status!: string;

  @prop({ type: String, default: "" })
  uploadedBy!: string;

  @prop({ type: Number, default: 0 })
  order!: number;
}

/* ── Sample (product sample inventory line) ─────────────────────────────── */
@modelOptions({
  ...baseOptions,
  schemaOptions: { collection: "tbl_megma_samples", timestamps: true },
})
export class MegmaSample extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  product!: string;

  @prop({ type: String, default: "" })
  sku!: string;

  @prop({ type: Number, default: 0 })
  stock!: number;

  @prop({ type: String, default: "" })
  repId!: string;
}

/* ── Visit / Call Report ────────────────────────────────────────────────── */
class DispensedLine {
  @prop({ type: String, default: "" })
  sampleId!: string;

  @prop({ type: String, default: "" })
  product!: string;

  @prop({ type: Number, default: 0 })
  quantity!: number;
}

@modelOptions({
  ...baseOptions,
  schemaOptions: { collection: "tbl_megma_visits", timestamps: true },
})
export class MegmaVisit extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  hcpId!: string;

  @prop({ type: String, default: "" })
  hcpName!: string;

  @prop({ type: String, default: "" })
  specialty!: string;

  @prop({ type: String, required: true })
  repId!: string;

  @prop({ type: String, default: "" })
  repName!: string;

  @prop({ type: String, default: "" })
  territory!: string;

  @prop({ type: Date, default: () => new Date() })
  visitedAt!: Date;

  // The visual aids presented during this detail session
  @prop({ type: () => [String], default: [] })
  presentedAidIds!: string[];

  @prop({ type: Number, default: 0 })
  slidesPresented!: number;

  @prop({ type: String, default: "Moderate" })
  interestLevel!: string;

  @prop({ type: String, default: "" })
  feedback!: string;

  @prop({ type: String, default: "" })
  nextStep!: string;

  @prop({ type: () => [DispensedLine], default: [] })
  dispensed!: DispensedLine[];

  // Computed call-quality score 0..100
  @prop({ type: Number, default: 0 })
  qualityScore!: number;

  @prop({ type: () => [String], default: [] })
  qualityFactors!: string[];
}

export const MegmaRepModel = getModelForClass(MegmaRep);
export const MegmaHcpModel = getModelForClass(MegmaHcp);
export const MegmaVisualAidModel = getModelForClass(MegmaVisualAid);
export const MegmaSampleModel = getModelForClass(MegmaSample);
export const MegmaVisitModel = getModelForClass(MegmaVisit);
