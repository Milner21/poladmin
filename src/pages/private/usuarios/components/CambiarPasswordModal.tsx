//src/pages/private/usuarios/components/CambiarPasswordModal.tsx

import { useState, type FC } from "react";
import { X, Eye, EyeOff, Wand2 } from "lucide-react";

interface CambiarPasswordModalProps {
  visible: boolean;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
  };
  onClose: () => void;
  onConfirm: (passwordNuevo: string, passwordActual?: string) => void;
  isPending: boolean;
  requierePasswordActual: boolean;
}

export const CambiarPasswordModal: FC<CambiarPasswordModalProps> = ({
  visible,
  usuario,
  onClose,
  onConfirm,
  isPending,
  requierePasswordActual,
}) => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNuevo, setMostrarPasswordNuevo] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] =
    useState(false);
  const [modoAutomatico, setModoAutomatico] = useState(false);

  const [errores, setErrores] = useState<{
    passwordActual?: string;
    passwordNuevo?: string;
    confirmarPassword?: string;
  }>({});

  const limpiarFormulario = () => {
    setPasswordActual("");
    setPasswordNuevo("");
    setConfirmarPassword("");
    setModoAutomatico(false);
    setErrores({});
    setMostrarPasswordActual(false);
    setMostrarPasswordNuevo(false);
    setMostrarConfirmarPassword(false);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  const generarPasswordAutomatica = () => {
    setPasswordNuevo(usuario.documento);
    setConfirmarPassword(usuario.documento);
    setModoAutomatico(true);
  };

  const handleModoManual = () => {
    setPasswordNuevo("");
    setConfirmarPassword("");
    setModoAutomatico(false);
  };

  const validar = (): boolean => {
    const nuevosErrores: typeof errores = {};

    if (requierePasswordActual && !passwordActual.trim()) {
      nuevosErrores.passwordActual = "La contraseña actual es requerida";
    }

    if (!passwordNuevo.trim()) {
      nuevosErrores.passwordNuevo = "La nueva contraseña es requerida";
    } else if (passwordNuevo.length < 6) {
      nuevosErrores.passwordNuevo =
        "La contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmarPassword.trim()) {
      nuevosErrores.confirmarPassword = "Confirmar la contraseña es requerido";
    } else if (passwordNuevo !== confirmarPassword) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    onConfirm(
      passwordNuevo,
      requierePasswordActual ? passwordActual : undefined,
    );
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary m-0">
              Cambiar Contraseña
            </h3>
            <p className="text-sm text-text-tertiary m-0">
              {usuario.nombre} {usuario.apellido}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual (solo si es requerida) */}
          {requierePasswordActual && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Contraseña Actual <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarPasswordActual ? "text" : "password"}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className={`
                    w-full px-4 py-2 pr-10 rounded-lg border bg-bg-content
                    text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:ring-2 focus:ring-primary
                    transition-all
                    ${errores.passwordActual ? "border-danger ring-2 ring-danger/20" : "border-border"}
                  `}
                  placeholder="Ingresá tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMostrarPasswordActual(!mostrarPasswordActual)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  {mostrarPasswordActual ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errores.passwordActual && (
                <p className="text-danger text-xs mt-1">
                  {errores.passwordActual}
                </p>
              )}
            </div>
          )}

          {/* Botones de modo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={generarPasswordAutomatica}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                transition-colors flex-1
                ${
                  modoAutomatico
                    ? "bg-primary text-white"
                    : "bg-bg-base hover:bg-bg-title text-text-primary border border-border"
                }
              `}
            >
              <Wand2 size={14} />
              Usar CI ({usuario.documento})
            </button>
            <button
              type="button"
              onClick={handleModoManual}
              className={`
                px-3 py-2 text-sm rounded-lg
                transition-colors flex-1
                ${
                  !modoAutomatico
                    ? "bg-primary text-white"
                    : "bg-bg-base hover:bg-bg-title text-text-primary border border-border"
                }
              `}
            >
              Manual
            </button>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nueva Contraseña <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarPasswordNuevo ? "text" : "password"}
                value={passwordNuevo}
                onChange={(e) => setPasswordNuevo(e.target.value)}
                disabled={modoAutomatico}
                className={`
                  w-full px-4 py-2 pr-10 rounded-lg border bg-bg-content
                  text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-all
                  ${modoAutomatico ? "opacity-50 cursor-not-allowed" : ""}
                  ${errores.passwordNuevo ? "border-danger ring-2 ring-danger/20" : "border-border"}
                `}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setMostrarPasswordNuevo(!mostrarPasswordNuevo)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {mostrarPasswordNuevo ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errores.passwordNuevo && (
              <p className="text-danger text-xs mt-1">
                {errores.passwordNuevo}
              </p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Confirmar Contraseña <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmarPassword ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                disabled={modoAutomatico}
                className={`
                  w-full px-4 py-2 pr-10 rounded-lg border bg-bg-content
                  text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-all
                  ${modoAutomatico ? "opacity-50 cursor-not-allowed" : ""}
                  ${errores.confirmarPassword ? "border-danger ring-2 ring-danger/20" : "border-border"}
                `}
                placeholder="Repetir la nueva contraseña"
              />
              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmarPassword(!mostrarConfirmarPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                {mostrarConfirmarPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errores.confirmarPassword && (
              <p className="text-danger text-xs mt-1">
                {errores.confirmarPassword}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-base transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
