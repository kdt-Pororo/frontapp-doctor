"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, CircleAlert } from "lucide-react";
import {
  EXAMPLE_PATIENT_CODE,
  initialDoctorState,
} from "@/app/_data/doctor-demo";
import type {
  DoctorDemoState,
  DoctorProfile,
  ExamInput,
} from "@/types/doctor/doctor.type";

interface DoctorContextValue {
  state: DoctorDemoState;
  notify: (message: string, tone?: "success" | "info" | "error") => void;
  startDemo: () => void;
  updateProfile: (profile: DoctorProfile) => void;
  setVerification: (status: DoctorProfile["verification"]) => void;
  saveExam: (input: ExamInput) => void;
  registerCode: (code: string) => boolean;
  approveConnection: (requestId: string) => void;
  cancelConnection: (requestId: string) => void;
  revokeCare: (patientId: string) => void;
  requestEnd: (
    patientId: string,
    date: string,
    reason: string,
    note: string,
  ) => void;
  cancelEnd: (requestId: string) => void;
  completeEnd: (patientId: string, source: "mother" | "doctor") => void;
}

const DoctorContext = createContext<DoctorContextValue | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  // 프론트 시연 상태만 보관합니다. 실제 회원·검진 DB나 브라우저 영구 저장소에 쓰지 않습니다.
  const [state, setState] = useState<DoctorDemoState>(initialDoctorState);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "info" | "error";
  } | null>(null);
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
  function updateProfile(profile: DoctorProfile) {
    setState((s) => ({ ...s, profile }));
  }
  function setVerification(verification: DoctorProfile["verification"]) {
    setState((s) => ({ ...s, profile: { ...s.profile, verification } }));
  }
  function startDemo() {
    setState(initialDoctorState);
    notify("샘플 데이터로 의료진 화면을 시작합니다.", "info");
  }

  function saveExam(input: ExamInput) {
    const patient = state.patients.find((p) => p.id === input.patientId);
    if (
      !patient ||
      patient.connection !== "approved" ||
      patient.status === "ended"
    )
      throw new Error("현재 이 임신에 새 기록을 입력할 수 없습니다.");
    const record = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      visitedAt: input.visitedAt,
      title: input.title,
      notes: input.notes,
      results: input.results,
      bloodPressure: input.bloodPressure,
      weight: input.weight,
      predictionStatus: "not-configured" as const,
    };
    const appointment = input.nextDate
      ? {
          id: crypto.randomUUID(),
          patientId: input.patientId,
          date: input.nextDate,
          time: input.nextTime,
          title: input.nextTitle || "다음 검진",
          status: "scheduled" as const,
        }
      : null;
    setState((s) => ({
      ...s,
      records: [...s.records, record],
      appointments: appointment
        ? [...s.appointments, appointment]
        : s.appointments,
    }));
    notify(
      "검진 기록을 시연 화면에 저장했습니다. 모델 연결 전이라 예측은 실행하지 않습니다.",
      "info",
    );
  }

  function registerCode(code: string) {
    if (code.trim().toUpperCase() !== EXAMPLE_PATIENT_CODE) {
      notify("시연용 코드 NESTEP-1024를 입력해 주세요.", "error");
      return false;
    }
    const patient = state.patients.find((p) => p.id === "PG-1029");
    if (!patient || patient.connection !== "unlinked") {
      notify("이미 요청했거나 연결된 시연 코드입니다.", "info");
      return false;
    }
    const request = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      date: "2026-11-22",
      status: "pending" as const,
    };
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patient.id ? { ...p, connection: "pending" } : p,
      ),
      connectionRequests: [...s.connectionRequests, request],
    }));
    notify("산모 확인을 기다리는 시연 연결 요청을 만들었습니다.");
    return true;
  }

  function approveConnection(requestId: string) {
    const request = state.connectionRequests.find(
      (r) => r.id === requestId && r.status === "pending",
    );
    if (!request) return;
    setState((s) => ({
      ...s,
      connectionRequests: s.connectionRequests.map((r) =>
        r.id === requestId ? { ...r, status: "approved" } : r,
      ),
      patients: s.patients.map((p) =>
        p.id === request.patientId ? { ...p, connection: "approved" } : p,
      ),
    }));
    notify("산모가 연결을 승인한 상황을 시연했습니다.");
  }

  function cancelConnection(requestId: string) {
    const request = state.connectionRequests.find(
      (r) => r.id === requestId && r.status === "pending",
    );
    if (!request) return;
    setState((s) => ({
      ...s,
      connectionRequests: s.connectionRequests.map((r) =>
        r.id === requestId ? { ...r, status: "cancelled" } : r,
      ),
      patients: s.patients.map((p) =>
        p.id === request.patientId ? { ...p, connection: "unlinked" } : p,
      ),
    }));
    notify("연결 요청을 취소했습니다.");
  }

  function revokeCare(patientId: string) {
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patientId ? { ...p, connection: "revoked" } : p,
      ),
    }));
    notify("담당 연결을 해제했습니다. 산모의 임신 상태는 유지됩니다.");
  }

  function requestEnd(
    patientId: string,
    date: string,
    reason: string,
    note: string,
  ) {
    const patient = state.patients.find((p) => p.id === patientId);
    if (
      !patient ||
      patient.connection !== "approved" ||
      patient.status !== "active"
    )
      throw new Error("현재 종료 요청을 보낼 수 없습니다.");
    if (
      state.endRequests.some(
        (r) => r.patientId === patientId && r.status === "pending",
      )
    )
      throw new Error("확인 대기 중인 요청이 있습니다.");
    const request = {
      id: crypto.randomUUID(),
      patientId,
      date,
      reason,
      note,
      status: "pending" as const,
      source: "doctor" as const,
    };
    setState((s) => ({ ...s, endRequests: [...s.endRequests, request] }));
    notify(
      "산모 확인 대기 상태로 변경했습니다. 실제 알림은 발송되지 않습니다.",
      "info",
    );
  }

  function cancelEnd(requestId: string) {
    setState((s) => ({
      ...s,
      endRequests: s.endRequests.map((r) =>
        r.id === requestId && r.status === "pending"
          ? { ...r, status: "cancelled" }
          : r,
      ),
    }));
    notify("종료 요청을 취소했습니다.");
  }

  function completeEnd(patientId: string, source: "mother" | "doctor") {
    const patient = state.patients.find(
      (p) =>
        p.id === patientId &&
        p.status === "active" &&
        p.connection === "approved",
    );
    if (!patient) return;
    const pending = state.endRequests.find(
      (r) => r.patientId === patientId && r.status === "pending",
    );
    if (source === "doctor" && !pending) return;
    const date = source === "doctor" ? pending!.date : "2026-11-22";
    const completed = {
      id: crypto.randomUUID(),
      patientId,
      date,
      reason: "산모 직접 종료",
      note: "산모가 단독으로 종료한 상황의 시연입니다.",
      status: "completed" as const,
      source: "mother" as const,
    };
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patientId ? { ...p, status: "ended", endedOn: date } : p,
      ),
      appointments: s.appointments.map((a) =>
        a.patientId === patientId ? { ...a, status: "cancelled" } : a,
      ),
      endRequests:
        source === "doctor"
          ? s.endRequests.map((r) =>
              r.id === pending!.id ? { ...r, status: "completed" } : r,
            )
          : [
              ...s.endRequests.map((r) =>
                r.patientId === patientId && r.status === "pending"
                  ? { ...r, status: "cancelled" as const }
                  : r,
              ),
              completed,
            ],
    }));
    notify(
      "임신 관리 종료를 반영했습니다. 이전 기록은 계속 열람할 수 있습니다.",
    );
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
        notify,
        startDemo,
        updateProfile,
        setVerification,
        saveExam,
        registerCode,
        approveConnection,
        cancelConnection,
        revokeCare,
        requestEnd,
        cancelEnd,
        completeEnd,
      }}
    >
      {children}
      {notice && (
        <div
          role="status"
          className="fixed bottom-7 right-7 z-100 flex max-w-xl items-start gap-3 rounded-2xl border border-[#DEE7EA] bg-white px-5 py-4 text-sm text-[#23424D] shadow-xl"
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
