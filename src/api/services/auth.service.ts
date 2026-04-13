// services/auth.service.ts
import type { LoginRequest, LoginResponse } from '@dto/auth.types';
import { ENDPOINTS } from '@utils/constants';
import axiosInstance from '../axios.config';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    // Limpiar tokens locales (solo access_token y usuario)
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const response = await axiosInstance.post<{ access_token: string }>(
      ENDPOINTS.AUTH.REFRESH,
      {}, // No enviamos refresh_token en el cuerpo
      { withCredentials: true } // Asegura que se envíen cookies
    );
    return response.data;
  },
};