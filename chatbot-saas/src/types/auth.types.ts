export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  isEmailVerified?: boolean;
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
  cpf: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
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

export type AuthResult = 'success' | 'failure' | void;

export interface UpdateProfileData {
  name?: string;
  phone?: string | null;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, password: string) => Promise<AuthResult>;
  clearError: () => void;
}
