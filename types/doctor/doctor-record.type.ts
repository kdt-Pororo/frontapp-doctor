export type RiskKind = "MATERNAL" | "PRETERM";

export interface FeatureSpec {
  key: string;
  label: string;
  unit: string;
  groups: RiskKind[];
  enabled: boolean;
  minimum: number;
  maximum: number;
  step: number;
  note?: string;
}

export interface FeatureSchemaDTO {
  version: string;
  provisional: boolean;
  features: FeatureSpec[];
}

export interface DoctorRecordCreateDTO {
  submission_key: string;
  visit_date: string;
  title: string;
  notes: string;
  test_results: string;
  feature_schema_version: string;
  features: Record<string, number | null>;
}

export interface FeatureContributionDTO {
  key: string;
  value: number;
  direction: "increase" | "decrease";
}

export interface RiskPredictionDTO {
  id: number | null;
  feature_schema_version: string | null;
  input_snapshot: Record<string, number | null> | null;
  created_at: string | null;
  risk_kind: RiskKind;
  status: "NOT_CONFIGURED" | "PENDING" | "SUCCEEDED" | "FAILED";
  model_version: string | null;
  output_kind: "PROBABILITY" | "RISK_INDEX" | null;
  output_definition: string | null;
  probability: number | null;
  score_0_100: number | null;
  predicted_at: string | null;
  explanation: { items?: FeatureContributionDTO[] } | null;
}

export type ReviewItem = "verify_inputs" | "review_context" | "plan_follow_up";
export interface RiskReviewDTO {
  risk_kind: RiskKind;
  note_text: string;
  checked_items: ReviewItem[];
  version: number;
  updated_at: string | null;
}

export interface DoctorRecordDTO {
  id: number;
  pregnancy_id: number;
  title: string;
  visited_at: string;
  notes: string;
  test_results: string;
  feature_schema_version: string;
  feature_values: Record<string, number | null>;
  predictions: RiskPredictionDTO[];
  reviews: RiskReviewDTO[];
}
