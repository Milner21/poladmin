//src/pages/private/activador/ActivadorPage.tsx
import { PageHeader } from "@components";
import type { ResultadoActivacion } from "@dto/activador.types";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import {
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  Target,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import { useState, type FC, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useConfiguracionCampana } from "../campanas/hooks/useConfiguracionCampana";
import { EscanerQRActivador } from "./components/EscanerQRActivador";
import { useActivarTicket } from "./hooks/useActivarTicket";
import { useMiCupo } from "./hooks/useMiCupo";
import { useMisActivaciones } from "./hooks/useMisActivaciones";
import { useAuth } from "@hooks/useAuth";

const ActivadorPage: FC = () => {
  const { tienePermiso } = usePermisos();
  const { data: miCupo, isLoading: loadingCupo } = useMiCupo();
  const { data: misActivaciones, isLoading: loadingActivaciones } =
    useMisActivaciones();
  const activarMutation = useActivarTicket();
  const { usuario } = useAuth();
  const campanaId = usuario?.campana_id || "";
  const { data: configuracionCampana } = useConfiguracionCampana(campanaId);
  const metodoVerificacion =
    configuracionCampana?.configuracion?.metodo_verificacion || "PIN";
  const [pin, setPin] = useState("");
  const [ultimaActivacion, setUltimaActivacion] =
    useState<ResultadoActivacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const puedeActivar = tienePermiso("activar_ticket");

  if (!puedeActivar) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!pin.trim() || pin.length !== 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      const resultado = await activarMutation.mutateAsync({
        pin: pin.toUpperCase(),
        metodo: "PIN",
      });

      setUltimaActivacion(resultado);
      setPin("");
    } catch {
      // El error ya se maneja en el hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Solo permitir caracteres alfanumericos y convertir a mayusculas
    const cleanValue = value
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 6);
    setPin(cleanValue);

    // Limpiar ultima activacion cuando se empieza a escribir un nuevo PIN
    if (ultimaActivacion && cleanValue.length > 0) {
      setUltimaActivacion(null);
    }
  };

  const handleQRScanSuccess = async (pinDetectado: string) => {
    setIsSubmitting(true);

    try {
      const resultado = await activarMutation.mutateAsync({
        pin: pinDetectado,
        metodo: "QR",
      });

      setUltimaActivacion(resultado);
      setShowQRScanner(false);
    } catch {
      // El error ya se maneja en el hook
      // Mantener el escaner abierto para reintentar
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
    setIsSubmitting(false);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      return err.response?.data?.message || "Error al activar el ticket";
    }
    return error instanceof Error
      ? error.message
      : "Error al activar el ticket";
  };

  if (loadingCupo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Panel del Activador"
        subtitle="Activa los tickets de votación ingresando el PIN"
      />
      {/* Estado del Cupo */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Cupos Asignados
              </p>
              <p className="text-xl font-bold text-text-primary">
                {miCupo?.tiene_cupo ? miCupo.cupos_asignados : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                miCupo?.cupos_disponibles
                  ? "bg-success/10"
                  : "bg-text-tertiary/10"
              }`}
            >
              <CheckCircle
                size={20}
                className={
                  miCupo?.cupos_disponibles
                    ? "text-success"
                    : "text-text-tertiary"
                }
              />
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Cupos Disponibles
              </p>
              <p
                className={`text-xl font-bold ${
                  miCupo?.cupos_disponibles
                    ? "text-success"
                    : "text-text-tertiary"
                }`}
              >
                {miCupo?.tiene_cupo ? miCupo.cupos_disponibles : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-text-tertiary/10 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Cupos Utilizados
              </p>
              <p className="text-xl font-bold text-text-tertiary">
                {miCupo?.tiene_cupo ? miCupo.cupos_utilizados : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Alerta si no tiene cupos */}
      {!miCupo?.tiene_cupo && (
        <div className="mb-6 bg-warning/10 border border-warning/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning mb-1">
                No tienes cupos asignados
              </h3>
              <p className="text-sm text-text-secondary">
                Contacta al administrador para que te asigne cupos de
                activación.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Formulario de Activación */}
      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Ticket size={24} className="text-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Activar Ticket
          </h2>
        </div>

        {metodoVerificacion === "PIN" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                PIN del Ticket (6 caracteres)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="Ej: ABC123"
                  className={`flex-1 px-4 py-3 border rounded-lg font-mono text-lg tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 transition-colors ${
                    activarMutation.isError
                      ? "border-danger focus:ring-danger/20 bg-danger/5"
                      : "border-border focus:ring-primary/20 focus:border-primary"
                  }`}
                  disabled={!miCupo?.cupos_disponibles || isSubmitting}
                  maxLength={6}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={
                    !miCupo?.cupos_disponibles ||
                    pin.length !== 6 ||
                    isSubmitting
                  }
                  className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-text-tertiary disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors min-w-30"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activando...</span>
                    </div>
                  ) : (
                    "Activar"
                  )}
                </button>
              </div>

              {activarMutation.isError && (
                <p className="mt-2 text-sm text-danger flex items-center gap-2">
                  <XCircle size={16} />
                  {getErrorMessage(activarMutation.error)}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Escáner QR del Ticket
              </label>
              <button
                onClick={() => setShowQRScanner(true)}
                disabled={!miCupo?.cupos_disponibles || isSubmitting}
                className="w-full px-6 py-4 bg-primary hover:bg-primary-hover disabled:bg-text-tertiary disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando activación...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h2.99M12 12h-2.99M12 12h-4.01m7-7h2a2 2 0 012 2v2m0 0V9a2 2 0 00-2-2h-2m0 0h-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v0a2 2 0 002 2h2m0 0h2.99M13 12v7a2 2 0 01-2 2H9a2 2 0 01-2-2v-7m4 0V9H9v3"
                      />
                    </svg>
                    <span>Escanear Código QR</span>
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-text-tertiary text-center">
                Apunta la cámara al código QR del ticket para activarlo
                automáticamente
              </p>

              {activarMutation.isError && (
                <p className="mt-2 text-sm text-danger flex items-center gap-2 justify-center">
                  <XCircle size={16} />
                  {getErrorMessage(activarMutation.error)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Resultado de Activación */}
      {ultimaActivacion && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-success mb-2">
                ¡Ticket Activado Correctamente!
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-text-tertiary" />
                    <span className="text-sm font-medium text-text-primary">
                      Votante
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary">
                    {ultimaActivacion.simpatizante.nombre}{" "}
                    {ultimaActivacion.simpatizante.apellido}
                  </p>
                  <p className="text-sm text-text-secondary">
                    CI: {ultimaActivacion.simpatizante.documento}
                  </p>
                </div>

                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-text-tertiary" />
                    <span className="text-sm font-medium text-text-primary">
                      Lugar de Votación
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary">
                    {ultimaActivacion.simpatizante.local_votacion ||
                      "No especificado"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Mesa: {ultimaActivacion.simpatizante.mesa_votacion || "-"} •
                    Orden: {ultimaActivacion.simpatizante.orden_votacion || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(ultimaActivacion.fecha_activacion).toLocaleString(
                    "es-PY",
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Puesto: {ultimaActivacion.puesto.codigo}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={14} />
                  Cupos restantes: {ultimaActivacion.cupos_restantes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Historial Reciente */}
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Activaciones Recientes
        </h2>

        {loadingActivaciones ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : misActivaciones && misActivaciones.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {misActivaciones.slice(0, 10).map((activacion) => (
              <div
                key={activacion.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {activacion.simpatizante?.nombre}{" "}
                    {activacion.simpatizante?.apellido}
                  </p>
                  <p className="text-sm text-text-tertiary">
                    CI: {activacion.simpatizante?.documento}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">
                    {new Date(activacion.fecha_activacion).toLocaleTimeString(
                      "es-PY",
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {activacion.puesto?.codigo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <Ticket size={32} className="mx-auto mb-2 opacity-50" />
            <p>No hay activaciones registradas aún</p>
          </div>
        )}
      </div>
      {/* Modal Escáner QR */}
      {showQRScanner && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={handleCloseQRScanner}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-2xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 text-center">
              Escanear Código QR
            </h3>
            <EscanerQRActivador
              onScanSuccess={handleQRScanSuccess}
              onClose={handleCloseQRScanner}
              bloqueado={isSubmitting}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ActivadorPage;
