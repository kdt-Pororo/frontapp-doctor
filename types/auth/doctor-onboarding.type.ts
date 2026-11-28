// 추가정보와 면허증 단계 사이에는 메모리에만 보관하고 최종 제출 때 전송합니다.
export interface DoctorAdditionalFormValues {
    doctor_name: string;
    doctor_email: string;
    doctor_phone: string;
    doctor_hospital: string;
    hospital_id: number | null;
    doctor_license_number: string;
    confirmed_information: boolean;
}

export interface DoctorEvidenceDraft {
    file: File;
    previewUrl: string;
}
