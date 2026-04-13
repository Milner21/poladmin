import type { FC } from 'react';
import { usePWAInstall } from '@hooks/usePWAInstall';
import { X, Download } from 'lucide-react';

const PWAInstallBanner: FC = () => {
  const { showInstallPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();

  if (!showInstallPrompt) return null;

  return (
    <div className="
      fixed bottom-0 left-0 right-0 z-1000
      bg-linear-to-r from-[#667eea] to-[#764ba2]
      text-white px-4 py-4 shadow-lg
      animate-in slide-in-from-bottom duration-300
    ">
      <div className="
        flex items-center justify-between gap-4
        max-w-300 mx-auto
        flex-col sm:flex-row text-center sm:text-left
      ">
        {/* Text */}
        <div>
          <h3 className="text-base font-semibold m-0 mb-1">
            ¡Instala nuestra app!
          </h3>
          {isIOS ? (
            <p className="text-sm opacity-90 m-0">
              Para instalar: toca{" "}
              <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded mx-1">
                ⎋
              </span>
              y luego "Agregar a pantalla de inicio"
            </p>
          ) : (
            <p className="text-sm opacity-90 m-0">
              Instala la app para una mejor experiencia
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isIOS && (
            <button
              onClick={installApp}
              className="
                flex items-center gap-2
                bg-white/20 hover:bg-white/30
                border border-white/30
                text-white text-sm font-medium
                px-4 py-2 rounded-lg
                transition-all hover:-translate-y-0.5
              "
            >
              <Download size={16} />
              Instalar
            </button>
          )}

          <button
            onClick={dismissPrompt}
            className="
              text-white/70 hover:text-white
              p-1 transition-opacity
            "
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;