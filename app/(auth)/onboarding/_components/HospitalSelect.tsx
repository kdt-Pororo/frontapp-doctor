"use client";

import { useEffect, useState } from "react";
import { searchDoctorHospitalsApi } from "@/api/auth/doctor-auth.api";
import type { DoctorHospitalDTO } from "@/types/auth/doctor-auth.type";

export default function HospitalSelect({ name, selectedId, onChange, inputClass, invalid }: {
    name: string; selectedId: number | null; onChange: (id: number | null, name: string) => void;
    inputClass: string; invalid: boolean;
}) {
    const [query, setQuery] = useState(name);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<DoctorHospitalDTO[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true); setError("");
            try { const result = await searchDoctorHospitalsApi(query, controller.signal); if (!controller.signal.aborted) setItems(result.data ?? []); }
            catch { if (!controller.signal.aborted) { setItems([]); setError("병원을 검색하지 못했습니다. 다시 입력해 주세요."); } }
            finally { if (!controller.signal.aborted) setLoading(false); }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [query, open]);

    return <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <input id="doctor_hospital" value={query} onFocus={() => setOpen(true)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
            onChange={(event) => { setQuery(event.target.value); onChange(null, event.target.value); setOpen(true); setItems([]); }}
            autoComplete="off" placeholder="병원명 또는 주소 검색" aria-invalid={invalid} aria-describedby="hospital-help" className={inputClass} />
        <p id="hospital-help" className="mt-2 text-xs text-[#879FA7]">{selectedId ? "등록된 병원을 선택했습니다." : "검색 결과에서 소속 병원을 선택해 주세요."}</p>
        {open && <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#DCE5E9] bg-white p-2 shadow-lg">
            {loading && <p role="status" className="p-3 text-sm text-[#879FA7]">검색 중입니다.</p>}
            {error && <p role="alert" className="p-3 text-sm text-red-700">{error}</p>}
            {!loading && !error && items.length === 0 && <p className="p-3 text-sm text-[#879FA7]">등록된 검색 결과가 없습니다. 병원명이나 주소를 확인해 주세요.</p>}
            {items.map((hospital) => <button key={hospital.id} type="button" onClick={() => { onChange(hospital.id, hospital.hospital_name); setQuery(hospital.hospital_name); setOpen(false); }}
                className="block w-full rounded-lg p-3 text-left hover:bg-[#F1F7FA] focus-visible:outline-2 focus-visible:outline-[#1B3E59]">
                <span className="block text-sm font-medium">{hospital.hospital_name}</span><span className="mt-1 block text-xs text-[#879FA7]">{hospital.hospital_address}</span>
            </button>)}
        </div>}
    </div>;
}
