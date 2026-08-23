import apiClient from './client';
import type { ApiResponse, AuthUser, LoginResponse } from '../../types/api.types';
import type {
  RegisterFormValues,
  LoginFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from '../validations/auth.schema';

export const authApi = {
  register: async (data: Omit<RegisterFormValues, 'confirmPassword'>) => {
    const response = await apiClient.post<ApiResponse<{ user: AuthUser; message: string }>>(
      '/auth/register',
      data,
    );
    return response.data;
  },

  login: async (data: LoginFormValues) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  refresh: async () => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', {
      token,
    });
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordFormValues) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      data,
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordFormValues) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      {
        token: data.token,
        newPassword: data.newPassword,
      },
    );
    return response.data;
  },

  resendVerification: async () => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/resend-verification',
    );
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/change-password',
      data,
    );
    return response.data;
  },
};
