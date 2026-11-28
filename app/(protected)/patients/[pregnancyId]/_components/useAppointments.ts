"use client";
import { useEffect, useState } from "react";
import { listAppointmentsApi } from "@/api/doctor/doctor-appointment.api";
import type {
  AppointmentList,
  AppointmentScope,
} from "@/types/doctor/doctor-appointment.type";

export default function useAppointments(
  id: string,
  enabled: boolean,
  scope: AppointmentScope = "upcoming",
  page = 1,
  size = 20,
) {
  const [revision, setRevision] = useState(0);
  const key = `${id}:${scope}:${page}:${size}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: AppointmentList;
    error?: string;
  }>();
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    listAppointmentsApi(id, scope, page, size, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              cause instanceof Error
                ? cause.message
                : "일정을 불러오지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [id, enabled, scope, page, size, key]);
  return {
    data: result?.key === key ? result.data : undefined,
    error: result?.key === key ? result.error : undefined,
    loading: enabled && result?.key !== key,
    refresh: () => setRevision((value) => value + 1),
  };
}
