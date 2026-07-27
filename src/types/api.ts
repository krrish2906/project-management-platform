export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    message: string;
    error: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
