"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { getDoctorConnectionsApi } from "@/api/doctor/doctor-patient.api";
import type { DoctorCareRequestDTO } from "@/types/doctor/doctor-patient.type";
import type {
  DoctorWorkspaceState,
  DoctorProfile,
} from "@/types/doctor/doctor.type";

const emptyState: DoctorWorkspaceState = {
  profile: {
    name: "",
    nickname: "",
    phone: "",
    hospital: "",
    department: "",
    license: "",
    verification: "pending",
  },
  patients: [],
};

interface DoctorContextValue {
  state: DoctorWorkspaceState;
  requests: DoctorCareRequestDTO[];
  loading: boolean;
  loadError: string;
  refreshConnections: () => void;
  updateProfile: (profile: DoctorProfile) => void;
  notify: (message: string, tone?: "success" | "info" | "error") => void;
}

const DoctorContext = createContext<DoctorContextValue | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(emptyState);
  const [requests, setRequests] = useState<DoctorCareRequestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "info" | "error";
  } | null>(null);
  const doctorId = state.profile.id;
  const verified = state.profile.verification === "verified";

  const updateProfile = useCallback((profile: DoctorProfile) => {
    // 다른 계정으로 로그인하면 이전 계정 목록을 재사용하지 않습니다.
    setState((previous) =>
      previous.profile.id === profile.id
        ? { ...previous, profile }
        : { ...emptyState, profile },
    );
  }, []);
  const refreshConnections = useCallback(
    () => setRevision((value) => value + 1),
    [],
  );

  useEffect(() => {
    if (!doctorId || !verified) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setLoadError("");
        setRequests([]);
      }
    });
    getDoctorConnectionsApi(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setRequests(result.requests);
        setState((previous) => ({
          ...previous,
          patients: result.patients.map((patient) => ({
            id: String(patient.pregnancy_id),
            name: patient.mother_name,
            phone: patient.mother_phone,
            babyName: patient.baby_names.join(", "),
            weeks: patient.weeks,
            days: patient.days,
            dueDate: patient.due_date ?? "",
            status: patient.status,
            connection: "approved" as const,
            endedOn: patient.ended_on ?? undefined,
          })),
        }));
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "연결 목록을 불러오지 못했습니다.",
          );
          setState((previous) => ({
            ...emptyState,
            profile: previous.profile,
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [doctorId, verified, revision]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function notify(
    message: string,
    tone: "success" | "info" | "error" = "success",
  ) {
    setNotice({ message, tone });
  }
  const NoticeIcon =
    notice?.tone === "error"
      ? CircleAlert
      : notice?.tone === "info"
        ? Info
        : CheckCircle2;

  return (
    <DoctorContext.Provider
      value={{
        state,
        requests,
        loading,
        loadError,
        refreshConnections,
        updateProfile,
        notify,
      }}
    >
      {children}
      {notice && (
        <div
          role="status"
          className="fixed right-7 bottom-7 z-100 flex max-w-xl items-start gap-3 rounded-2xl border border-[#DEE7EA] bg-white px-5 py-4 text-sm text-[#23424D] shadow-xl"
        >
          <NoticeIcon
            size={19}
            className={
              notice.tone === "error"
                ? "shrink-0 text-red-600"
                : "shrink-0 text-[#168C87]"
            }
          />
          <span className="leading-6">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="알림 닫기"
            className="ml-2 rounded p-1 hover:bg-slate-100"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) throw new Error("DoctorProvider 안에서 사용해 주세요.");
  return context;
}
