"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDoctorRecordsApi,
  getFeatureSchemaApi,
} from "@/api/doctor/doctor-record.api";
import type {
  DoctorRecordDTO,
  FeatureSchemaDTO,
} from "@/types/doctor/doctor-record.type";

export default function usePatientRecords(
  pregnancyId: string,
  enabled: boolean,
) {
  const [records, setRecords] = useState<DoctorRecordDTO[]>([]);
  const [schema, setSchema] = useState<FeatureSchemaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => {
    setLoading(true);
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    Promise.all([
      getDoctorRecordsApi(pregnancyId, controller.signal),
      getFeatureSchemaApi(controller.signal),
    ])
      .then(([data, catalog]) => {
        if (!controller.signal.aborted) {
          setRecords(data.records);
          setSchema(catalog);
          setError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setRecords([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "검진 정보를 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [pregnancyId, enabled, revision]);
  return { records, schema, loading, error, refresh };
}
