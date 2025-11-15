// Tipos para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  companies?: Array<{
    id: string;
    name: string;
    description: string | null;
    whatsappNumber: string | null;
    createdAt: string;
  }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<string>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}
