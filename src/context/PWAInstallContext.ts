import { createContext } from 'react';
import type { PWAInstallContextType } from '@interfaces/pwa';

export const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);