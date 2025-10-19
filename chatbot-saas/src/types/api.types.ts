// Tipos para API
export interface ApiResponse<T = any> {
  data?: T;
  status: number;
  statusText?: string;
  errors?: any;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface ApiMethods {
  get: <T = any>(path: string, params?: any) => Promise<ApiResponse<T>>;
  post: <T = any>(path: string, params?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(path: string, params?: any) => Promise<ApiResponse<T>>;
  deleted: <T = any>(path: string, params?: any) => Promise<ApiResponse<T>>;
  setHeader: (name: string, value: string) => void;
  setHeaderFile: (name: string, value: string) => void;
}

export interface ApiContextType {
  api: ApiMethods;
}
