"use client";

import { useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { decideCareRequestApi } from "@/api/doctor/doctor-patient.api";
import { doctorDate } from "@/lib/doctor";

export default function PatientConnect() {
  const { requests, loading, loadError, refreshConnections, notify } =
    useDoctor();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function decide(id: number, decision: "APPROVED" | "REJECTED") {
    if (busy !== null) return;
    setBusy(id);
    setError("");
    try {
      await decideCareRequestApi(id, decision);
      notify(
        decision === "APPROVED"
          ? "연결 요청을 수락했습니다."
          : "연결 요청을 거절했습니다.",
      );
      refreshConnections();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "요청을 처리하지 못했습니다.",
      );
      refreshConnections();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        title="연결 요청"
        description="산모가 병원과 의료진을 선택해 보낸 연결 요청을 확인합니다."
        action={
          <Button
            variant="secondary"
            disabled={loading || busy !== null}
            onClick={refreshConnections}
          >
            <RefreshCw size={16} />
            새로고침
          </Button>
        }
      />
      <Card
        title="수락 대기 중인 요청"
        description="수락하면 요청한 임신이 담당 산모 목록에 추가됩니다. 다음 임신은 별도로 연결합니다."
        action={
          <Badge tone="amber">
            {loading ? "확인 중" : `${requests.length}건`}
          </Badge>
        }
      >
        {(error || loadError) && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error || loadError}
          </p>
        )}
        {loading ? (
          <p role="status" className="py-12 text-center text-sm text-[#879FA7]">
            연결 요청을 불러오고 있습니다.
          </p>
        ) : !loadError && requests.length === 0 ? (
          <EmptyState
            title="새로운 연결 요청이 없습니다"
            description="산모가 앱에서 의료진을 선택해 요청하면 이곳에 표시됩니다."
          />
        ) : (
          <div className="divide-y divide-[#EDF1F3]">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-6 py-6"
              >
                <div>
                  <h2 className="font-semibold">{request.mother_name}</h2>
                  <p className="mt-2 text-sm text-[#8297A2]">
                    임신 ID {request.pregnancy_id} · 요청일{" "}
                    {doctorDate(request.requested_at)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    disabled={busy !== null || loading}
                    onClick={() => decide(request.id, "REJECTED")}
                  >
                    <X size={16} />
                    거절
                  </Button>
                  <Button
                    disabled={busy !== null || loading}
                    onClick={() => decide(request.id, "APPROVED")}
                  >
                    <Check size={16} />
                    {busy === request.id ? "처리 중…" : "수락"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
