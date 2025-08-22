export interface PWAInstallContextType {
  showInstallPrompt: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  installApp: () => Promise<void>;
  dismissPrompt: () => void;
  canInstall: boolean;
}

export interface PWAInstallProviderProps {
  children: React.ReactNode;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}