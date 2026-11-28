import { doctorWorkspaceRequest } from "./doctor-patient.api";
import type {
  DoctorRecordCreateDTO,
  DoctorRecordDTO,
  FeatureSchemaDTO,
  RiskKind,
  RiskReviewDTO,
  ReviewItem,
} from "@/types/doctor/doctor-record.type";

export const getFeatureSchemaApi = (signal?: AbortSignal) =>
  doctorWorkspaceRequest<FeatureSchemaDTO>(
    "/feature-schema",
    "GET",
    undefined,
    signal,
  );
export const getDoctorRecordsApi = (
  pregnancyId: string,
  signal?: AbortSignal,
) =>
  doctorWorkspaceRequest<{ records: DoctorRecordDTO[]; limit: number }>(
    `/pregnancies/${encodeURIComponent(pregnancyId)}/records`,
    "GET",
    undefined,
    signal,
  );
export const createDoctorRecordApi = (
  pregnancyId: string,
  values: DoctorRecordCreateDTO,
) =>
  doctorWorkspaceRequest<{ id: number; prediction_status: "NOT_CONFIGURED" }>(
    `/pregnancies/${encodeURIComponent(pregnancyId)}/records`,
    "POST",
    values,
  );
export const saveRiskReviewApi = (
  pregnancyId: string,
  recordId: number,
  kind: RiskKind,
  values: {
    expected_version: number;
    note_text: string;
    checked_items: ReviewItem[];
  },
) =>
  doctorWorkspaceRequest<RiskReviewDTO>(
    `/pregnancies/${encodeURIComponent(pregnancyId)}/records/${recordId}/reviews/${kind}`,
    "PUT",
    values,
  );
