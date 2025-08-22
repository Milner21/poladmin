import React, { useState, useEffect } from "react";
import { PWAInstallContext } from "../context/PWAInstallContext";
import type {
  PWAInstallProviderProps,
  PWAInstallContextType,
  BeforeInstallPromptEvent,
  NavigatorWithStandalone,
} from "@interfaces/pwa";

const PWAInstallProvider: React.FC<PWAInstallProviderProps> = ({
  children,
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase()
    );
    setIsIOS(iOS);

    // Detectar si ya está instalado (modo standalone)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true;
    setIsStandalone(standalone);

    // Listener para Android/Windows/Linux/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallPrompt(true);
    };

    // Listener para cuando se instala la app
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    /* 🔥 SOLO PARA TESTING - Remover en producción
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 2000); // Muestra el banner después de 2 segundos*/

    // Para iOS, mostrar prompt si no está en modo standalone
    if (iOS && !standalone) {
      setShowInstallPrompt(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const dismissPrompt = (): void => {
    setShowInstallPrompt(false);
  };

  const value: PWAInstallContextType = {
    showInstallPrompt,
    isIOS,
    isStandalone,
    installApp,
    dismissPrompt,
    canInstall: !!deferredPrompt || (isIOS && !isStandalone),
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
};

export default PWAInstallProvider;
