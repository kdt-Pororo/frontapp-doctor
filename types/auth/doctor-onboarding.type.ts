// 화면 이동 중에만 사용하는 입력값입니다. 아직 가입 요청 DTO가 아닙니다.
export interface DoctorAdditionalFormValues {
    doctor_name: string;
    doctor_email: string;
    doctor_phone: string;
    doctor_hospital: string;
    doctor_license_number: string;
    confirmed_information: boolean;
}

export interface DoctorEvidenceDraft {
    file: File;
    previewUrl: string;
}
