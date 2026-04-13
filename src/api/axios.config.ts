import { RoutesConfig } from "@routes/RoutesConfig";
import { API_BASE_URL, ENDPOINTS } from "@utils/constants";
import { storage } from "@utils/storage";
import { tokenEventBus } from "@utils/tokenEventBus";
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    const campanaId = localStorage.getItem("campana_seleccionada_root");
    if (campanaId) {
      config.headers.set("x-campana-id", campanaId);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      storage.getToken()
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        );

        const { access_token } = response.data as { access_token: string };

        storage.setToken(access_token);
        tokenEventBus.emit(access_token);

        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }
        originalRequest.headers.set("Authorization", `Bearer ${access_token}`);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        storage.clearAuth();
        window.location.href = RoutesConfig.login;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;