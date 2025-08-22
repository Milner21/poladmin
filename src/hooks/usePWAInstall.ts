import { useContext } from 'react';
import { PWAInstallContext } from '@context/PWAInstallContext';
import type { PWAInstallContextType } from '@interfaces/pwa';

export const usePWAInstall = (): PWAInstallContextType => {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall debe usarse dentro de PWAInstallProvider');
  }
  return context;
};