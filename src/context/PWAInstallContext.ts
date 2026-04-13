import { createContext } from 'react';
import type { PWAInstallContextType } from '@dto/pwa';

export const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);