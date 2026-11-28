import { BadgeCheck, FileClock } from "lucide-react";

export default function DoctorVerificationIcon({ approved = false }: { approved?: boolean }) {
    const Icon = approved ? BadgeCheck : FileClock;

    return (
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-[#D8E5EC] bg-[#F2F7FA] text-[#122E3D]">
            <Icon aria-hidden="true" className="size-9" strokeWidth={1.6} />
        </div>
    );
}
