// 일반 사용자 프론트와 동일한 공통 응답 형식입니다.
export interface ApiResponseDTO<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
}
