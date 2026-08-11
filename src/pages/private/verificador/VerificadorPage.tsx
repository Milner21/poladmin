//src/pages/private/verificador/VerificadorPage.tsx
import { PageHeader } from "@components";
import type { ResultadoVerificacion } from "@dto/verificador.types";
import { useAuth } from "@hooks/useAuth";
import { usePermisos } from "@hooks/usePermisos";
import { useConfiguracionCampana } from "@pages/private/campanas/hooks/useConfiguracionCampana";
import RoutesConfig from "@routes/RoutesConfig";
import { Calendar, CheckCircle, FileText, MapPin, User } from "lucide-react";
import { useState, type FC, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { EscanerQRVerificador } from "./components/EscanerQRVerificador";
import { useMisVerificaciones } from "./hooks/useMisVerificaciones";
import { useVerificarAsistencia } from "./hooks/useVerificarAsistencia";

const VerificadorPage: FC = () => {
  const { tienePermiso } = usePermisos();
  const { usuario } = useAuth();
  const campanaId = usuario?.campana_id || "";
  const { data: configuracionCampana } = useConfiguracionCampana(campanaId);
  const metodoVerificacion =
    configuracionCampana?.configuracion?.metodo_verificacion || "PIN";

  const { data: misVerificaciones, isLoading: loadingVerificaciones } =
    useMisVerificaciones();
  const verificarMutation = useVerificarAsistencia();

  const [pin, setPin] = useState("");
  const [ultimaVerificacion, setUltimaVerificacion] =
    useState<ResultadoVerificacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const puedeVerificar = tienePermiso("verificar_asistencia");

  if (!puedeVerificar) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.length !== 6) return;
    setIsSubmitting(true);
    try {
      const resultado = await verificarMutation.mutateAsync({
        pin: pin.toUpperCase(),
        metodo: "PIN",
      });
      setUltimaVerificacion(resultado);
      setPin("");
    } catch (error) {
      // error manejado
      console.error("Error al verificar asistencia desde PIN:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (value: string) => {
    const cleanValue = value
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 6);
    setPin(cleanValue);
    if (ultimaVerificacion) setUltimaVerificacion(null);
  };

  const handleQRScanSuccess = async (pinDetectado: string) => {
    setIsSubmitting(true);
    try {
      const resultado = await verificarMutation.mutateAsync({
        pin: pinDetectado,
        metodo: "QR",
      });
      setUltimaVerificacion(resultado);
      setShowQRScanner(false);
    } catch (error) {
      // error manejado
      console.error("Error al verificar asistencia desde QR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      return err.response?.data?.message || "Error al verificar asistencia";
    }
    return error instanceof Error
      ? error.message
      : "Error al verificar asistencia";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Verificar Asistencia"
        subtitle="Confirma la asistencia de los votantes al local"
      />

      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Verificar Asistencia
        </h2>

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
                  className={`flex-1 px-4 py-3 border rounded-lg font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 ${
                    verificarMutation.isError
                      ? "border-danger focus:ring-danger/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                  disabled={isSubmitting}
                  maxLength={6}
                />
                <button
                  type="submit"
                  disabled={pin.length !== 6 || isSubmitting}
                  className="px-6 py-3 bg-primary text-white rounded-lg disabled:bg-text-tertiary"
                >
                  {isSubmitting ? "Verificando..." : "Verificar"}
                </button>
              </div>
              {verificarMutation.isError && (
                <p className="mt-2 text-sm text-danger">
                  {getErrorMessage(verificarMutation.error)}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowQRScanner(true)}
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg flex items-center justify-center gap-3"
            >
              Escanear Código QR
            </button>
            {verificarMutation.isError && (
              <p className="mt-2 text-sm text-danger text-center">
                {getErrorMessage(verificarMutation.error)}
              </p>
            )}
          </div>
        )}
      </div>

      {ultimaVerificacion && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle size={24} className="text-success mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-success mb-2">
                ¡Asistencia Verificada!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} />
                    <span className="text-sm font-medium">Votante</span>
                  </div>
                  <p className="font-semibold">
                    {ultimaVerificacion.simpatizante.nombre}{" "}
                    {ultimaVerificacion.simpatizante.apellido}
                  </p>
                  <p className="text-sm text-text-secondary">
                    CI: {ultimaVerificacion.simpatizante.documento}
                  </p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">
                      Lugar de Votación
                    </span>
                  </div>
                  <p className="font-semibold">
                    {ultimaVerificacion.simpatizante.local_votacion || "-"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Mesa: {ultimaVerificacion.simpatizante.mesa_votacion || "-"}{" "}
                    • Orden:{" "}
                    {ultimaVerificacion.simpatizante.orden_votacion || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary mt-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(
                    ultimaVerificacion.fecha_verificacion,
                  ).toLocaleString("es-PY")}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Puesto: {ultimaVerificacion.puesto.codigo}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-bg-content border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Verificaciones Recientes
        </h2>
        {loadingVerificaciones ? (
          <div className="text-center py-8">Cargando...</div>
        ) : misVerificaciones && misVerificaciones.length > 0 ? (
          <div className="space-y-2">
            {misVerificaciones.slice(0, 10).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-2 border-b border-border/50"
              >
                <div>
                  <p className="font-medium">
                    {v.simpatizante?.nombre} {v.simpatizante?.apellido}
                  </p>
                  <p className="text-sm text-text-tertiary">
                    CI: {v.simpatizante?.documento}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(v.fecha_verificacion).toLocaleTimeString("es-PY")}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {v.puesto?.codigo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            No hay verificaciones aún
          </div>
        )}
      </div>

      {showQRScanner && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setShowQRScanner(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content rounded-xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold mb-4 text-center">
              Escanear Código QR
            </h3>
            <EscanerQRVerificador
              onScanSuccess={handleQRScanSuccess}
              onClose={() => setShowQRScanner(false)}
              bloqueado={isSubmitting}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VerificadorPage;
