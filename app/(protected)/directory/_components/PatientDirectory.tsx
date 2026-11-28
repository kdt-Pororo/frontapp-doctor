"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  searchPatientsApi,
  requestRecordAccessApi,
  cancelRecordAccessApi,
} from "@/api/doctor/record-access.api";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  inputClass,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import { appointmentDate } from "@/lib/doctor-appointment";
import type { DirectoryResult } from "@/types/doctor/record-access.type";
const labels = {
  PENDING: "산모 확인 대기",
  APPROVED: "열람 승인",
  REJECTED: "반려",
  CANCELLED: "요청 취소",
  REVOKED: "승인 철회",
  EXPIRED: "기간 만료",
};

export default function PatientDirectory() {
  const { notify } = useDoctor();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: DirectoryResult;
    error?: string;
  }>();
  const [selected, setSelected] = useState<number>();
  const [purpose, setPurpose] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [cancel, setCancel] = useState<{ pregnancy: number; access: number }>();
  const lock = useRef(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const key = `${query}:${page}:${revision}`;
  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    searchPatientsApi(query, page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              cause instanceof Error ? cause.message : "검색하지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [query, page, key]);
  const current = result?.key === key ? result : undefined;
  function refresh() {
    setRevision((v) => v + 1);
  }
  function search(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const value = input.trim();
    if (!value || (!/^\d+$/.test(value) && value.length < 2)) {
      setActionError("산모 이름 전체 또는 임신 ID를 입력해 주세요.");
      return;
    }
    setQuery(value);
    setPage(1);
    setSelected(undefined);
    setActionError("");
    refresh();
  }
  async function requestAccess(event: FormEvent) {
    event.preventDefault();
    if (!selected || lock.current || !confirmed) return;
    const payload = JSON.stringify({
      pregnancy: selected,
      purpose: purpose.trim(),
    });
    if (submission.current?.payload !== payload)
      submission.current = { payload, key: crypto.randomUUID() };
    lock.current = true;
    setBusy(true);
    setActionError("");
    try {
      await requestRecordAccessApi(selected, {
        purpose: purpose.trim(),
        submission_key: submission.current!.key,
      });
      setSelected(undefined);
      setPurpose("");
      setConfirmed(false);
      notify("산모에게 검진 기록 열람을 요청했습니다.");
      refresh();
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "열람 요청을 보내지 못했습니다.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function cancelRequest() {
    if (!cancel || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await cancelRecordAccessApi(cancel.pregnancy, cancel.access);
      notify("열람 요청을 취소했습니다.");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "취소하지 못했습니다.",
        "error",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      setCancel(undefined);
      refresh();
    }
  }
  return (
    <>
      <PageHeader
        title="산모 조회"
        description="병원 구분 없이 산모를 검색하고, 산모의 승인을 받아 검진 기록을 읽기 전용으로 열람합니다."
      />
      <Card title="산모 검색">
        <form onSubmit={search} className="flex gap-3">
          <input
            aria-label="산모 이름 또는 임신 ID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={80}
            placeholder="산모 이름 전체 또는 임신 ID"
            disabled={busy}
            className={inputClass}
          />
          <Button type="submit" disabled={busy}>
            검색
          </Button>
        </form>
        <p className="mt-4 text-xs leading-6 text-[#8297A2]">
          이름은 정확히 일치하는 경우만 검색합니다. 승인 전에는 이름 일부와 임신
          ID, 본인의 요청 상태만 표시됩니다.
        </p>
      </Card>
      {actionError && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}
      <div className="mt-6">
        {!query ? (
          <EmptyState
            title="산모를 검색해 주세요"
            description="열람 승인과 담당 산모 연결은 별개입니다. 열람 승인을 받아도 담당 목록에 자동으로 추가되지 않습니다."
          />
        ) : !current ? (
          <p role="status" className="p-12 text-center text-sm text-[#8297A2]">
            검색하고 있습니다.
          </p>
        ) : current.error ? (
          <Card>
            <p role="alert" className="text-sm text-red-700">
              {current.error}
            </p>
            <Button variant="secondary" onClick={refresh}>
              다시 시도
            </Button>
          </Card>
        ) : current.data?.items.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다"
            description="입력한 산모 이름 또는 임신 ID를 확인해 주세요."
          />
        ) : (
          <Card
            title="검색 결과"
            action={
              <Button variant="ghost" disabled={busy} onClick={refresh}>
                요청 상태 새로 확인
              </Button>
            }
          >
            <ul className="divide-y divide-[#E7EDF1]">
              {current.data?.items.map((row) => (
                <li key={row.pregnancy_id} className="py-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h2 className="font-semibold">
                        {row.mother_name}{" "}
                        <span className="ml-3 text-xs font-normal text-[#8297A2]">
                          임신 ID {row.pregnancy_id}
                        </span>
                      </h2>
                      {row.access && (
                        <>
                          <p className="mt-3 text-xs text-[#8297A2]">
                            요청 목적 · {row.access.purpose}
                          </p>
                          {row.access.expires_at && (
                            <p className="mt-2 text-xs text-[#8297A2]">
                              허용 기한 ·{" "}
                              {appointmentDate(row.access.expires_at)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {row.managed && (
                        <Link
                          href={`/patients/${row.pregnancy_id}`}
                          className="text-sm text-[#168B86]"
                        >
                          담당 관리
                        </Link>
                      )}
                      {row.access && (
                        <Badge
                          tone={
                            row.access.status === "APPROVED"
                              ? "teal"
                              : "neutral"
                          }
                        >
                          {labels[row.access.status]}
                        </Badge>
                      )}
                      {row.access?.status === "APPROVED" ? (
                        <Link
                          href={`/directory/${row.pregnancy_id}`}
                          className="rounded-xl bg-[#168B86] px-5 py-3 text-sm font-semibold text-white"
                        >
                          공유 검진 기록 보기
                        </Link>
                      ) : row.access?.status === "PENDING" ? (
                        <Button
                          disabled={busy}
                          variant="danger"
                          onClick={() =>
                            setCancel({
                              pregnancy: row.pregnancy_id,
                              access: row.access!.id,
                            })
                          }
                        >
                          열람 요청 취소
                        </Button>
                      ) : (
                        <Button
                          disabled={busy}
                          onClick={() => {
                            setSelected(row.pregnancy_id);
                            setPurpose("");
                            setConfirmed(false);
                            setActionError("");
                          }}
                        >
                          검진 기록 열람 요청
                        </Button>
                      )}
                    </div>
                  </div>
                  {selected === row.pregnancy_id && (
                    <form
                      onSubmit={requestAccess}
                      className="mt-5 rounded-xl bg-[#F3F8F7] p-5"
                    >
                      <label className="block text-sm">
                        열람 목적 *
                        <textarea
                          required
                          rows={3}
                          maxLength={1000}
                          disabled={busy}
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="예: 진료 중 이전 검진 결과 확인"
                          className={`${inputClass} mt-3`}
                        />
                      </label>
                      <label className="mt-4 flex items-start gap-3 text-sm leading-6">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          disabled={busy}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          className="mt-1 size-4 accent-[#168B86]"
                        />
                        이 임신의 검진값·검사 결과·정정 이력·예측 및 의료진 소견
                        열람을 요청합니다. 산모가 승인한 기간에만 읽기 전용으로
                        이용합니다.
                      </label>
                      <div className="mt-5 flex justify-end gap-3">
                        <Button
                          variant="secondary"
                          disabled={busy}
                          onClick={() => setSelected(undefined)}
                        >
                          닫기
                        </Button>
                        <Button
                          type="submit"
                          disabled={busy || !confirmed || !purpose.trim()}
                        >
                          {busy ? "요청 중" : "산모에게 열람 요청 보내기"}
                        </Button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            {current.data &&
              (current.data.total > current.data.page_size || page > 1) && (
                <div className="mt-5 flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    disabled={busy || page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    이전
                  </Button>
                  <span className="text-sm">
                    {page} /{" "}
                    {Math.max(
                      1,
                      Math.ceil(current.data.total / current.data.page_size),
                    )}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={
                      busy ||
                      page * current.data.page_size >= current.data.total
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    다음
                  </Button>
                </div>
              )}
          </Card>
        )}
      </div>
      {cancel && (
        <Dialog
          title="열람 요청을 취소할까요?"
          onClose={() => {
            if (!busy) setCancel(undefined);
          }}
        >
          <p className="text-sm">
            임신 ID {cancel.pregnancy}의 확인 대기 요청을 취소합니다.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setCancel(undefined)}
            >
              유지
            </Button>
            <Button variant="danger" disabled={busy} onClick={cancelRequest}>
              요청 취소 확정
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
