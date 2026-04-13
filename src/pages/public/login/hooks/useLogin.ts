import { authService } from "@api/services/auth.service";
import type { LoginRequest, LoginResponse } from "@dto/auth.types";
import { useAuth } from "@hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

export const useLogin = (options?: UseLoginOptions) => {
  const { iniciarSesion } = useAuth();

  return useMutation<LoginResponse, AxiosError<ErrorResponse>, LoginRequest>({
    mutationFn: async (credentials) => {
      return await authService.login(credentials);
    },
    onSuccess: (data: LoginResponse) => {
      iniciarSesion({
        usuario: data.usuario,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      options?.onError?.(error);
    },
  });
};