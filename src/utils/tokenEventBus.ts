type TokenRefreshHandler = (nuevoAccessToken: string) => void;

let handler: TokenRefreshHandler | null = null;

export const tokenEventBus = {
  onTokenRefreshed: (fn: TokenRefreshHandler): void => {
    handler = fn;
  },

  emit: (nuevoAccessToken: string): void => {
    if (handler) {
      handler(nuevoAccessToken);
    }
  },

  clear: (): void => {
    handler = null;
  },
};