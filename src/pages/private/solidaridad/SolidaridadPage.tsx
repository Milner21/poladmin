//src/pages/private/solidaridad/SolidaridadPage.tsx
import { PageHeader } from "@components";
import type { ResultadoSolidaridad } from "@dto/solidaridad.types";
import { useAuth } from "@hooks/useAuth";
import { usePermisos } from "@hooks/usePermisos";
import { useConfiguracionCampana } from "@pages/private/campanas/hooks/useConfiguracionCampana";
import RoutesConfig from "@routes/RoutesConfig";
import { Calendar, CheckCircle, FileText, Heart, MapPin, User } from "lucide-react";
import { useState, type FC, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { EscanerQRSolidaridad } from "./components/EscanerQRSolidaridad";
import { useMisRegistrosSolidaridad } from "./hooks/useMisRegistrosSolidaridad";
import { useRegistrarSolidaridad } from "./hooks/useRegistrarSolidaridad";

const SolidaridadPage: FC = () => {
  const { tienePermiso } = usePermisos();
  const { usuario } = useAuth();
  const campanaId = usuario?.campana_id || "";
  const { data: configuracionCampana } = useConfiguracionCampana(campanaId);
  const metodoVerificacion = configuracionCampana?.configuracion?.metodo_verificacion || "PIN";

  const { data: misRegistros, isLoading: loadingRegistros } = useMisRegistrosSolidaridad();
  const solidaridadMutation = useRegistrarSolidaridad();

  const [pin, setPin] = useState("");
  const [ultimaSolidaridad, setUltimaSolidaridad] = useState<ResultadoSolidaridad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const puedeRegistrar = tienePermiso("registrar_solidaridad");

  if (!puedeRegistrar) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.length !== 6) return;
    setIsSubmitting(true);
    try {
      const resultado = await solidaridadMutation.mutateAsync({
        pin: pin.toUpperCase(),
        metodo: "PIN",
      });
      setUltimaSolidaridad(resultado);
      setPin("");
    } catch (error) {
      // error manejado
      console.error("Error al registrar solidaridad desde PIN:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRScanSuccess = async (pinDetectado: string) => {
    setIsSubmitting(true);
    try {
      const resultado = await solidaridadMutation.mutateAsync({
        pin: pinDetectado,
        metodo: "QR",
      });
      setUltimaSolidaridad(resultado);
      setShowQRScanner(false);
    } catch (error) {
      // error manejado
      console.error("Error al registrar solidaridad desde QR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      return err.response?.data?.message || "Error al registrar solidaridad";
    }
    return error instanceof Error ? error.message : "Error al registrar solidaridad";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Registro de Solidaridad"
        subtitle="Registra aportes de solidaridad de los simpatizantes"
      />

      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart size={24} className="text-warning" />
          <h2 className="text-lg font-semibold text-text-primary">Registrar Solidaridad</h2>
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
                  onChange={(e) => setPin(e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6))}
                  placeholder="Ej: ABC123"
                  className={`flex-1 px-4 py-3 border rounded-lg font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 ${
                    solidaridadMutation.isError ? 'border-danger' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                  maxLength={6}
                />
                <button
                  type="submit"
                  disabled={pin.length !== 6 || isSubmitting}
                  className="px-6 py-3 bg-warning text-white rounded-lg disabled:bg-text-tertiary"
                >
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </button>
              </div>
              {solidaridadMutation.isError && (
                <p className="mt-2 text-sm text-danger">{getErrorMessage(solidaridadMutation.error)}</p>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowQRScanner(true)}
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-warning text-white rounded-lg flex items-center justify-center gap-3"
            >
              Escanear Código QR
            </button>
            {solidaridadMutation.isError && (
              <p className="mt-2 text-sm text-danger text-center">{getErrorMessage(solidaridadMutation.error)}</p>
            )}
          </div>
        )}
      </div>

      {ultimaSolidaridad && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle size={24} className="text-warning mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-warning mb-2">¡Solidaridad Registrada!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} />
                    <span className="text-sm font-medium">Votante</span>
                  </div>
                  <p className="font-semibold">
                    {ultimaSolidaridad.simpatizante.nombre} {ultimaSolidaridad.simpatizante.apellido}
                  </p>
                  <p className="text-sm text-text-secondary">CI: {ultimaSolidaridad.simpatizante.documento}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">Lugar de Votación</span>
                  </div>
                  <p className="font-semibold">{ultimaSolidaridad.simpatizante.local_votacion || '-'}</p>
                  <p className="text-sm text-text-secondary">
                    Mesa: {ultimaSolidaridad.simpatizante.mesa_votacion || '-'} • Orden: {ultimaSolidaridad.simpatizante.orden_votacion || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary mt-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(ultimaSolidaridad.fecha_registro).toLocaleString('es-PY')}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Puesto: {ultimaSolidaridad.puesto.codigo}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-bg-content border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Registros Recientes</h2>
        {loadingRegistros ? (
          <div className="text-center py-8">Cargando...</div>
        ) : misRegistros && misRegistros.length > 0 ? (
          <div className="space-y-2">
            {misRegistros.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="font-medium">{r.simpatizante?.nombre} {r.simpatizante?.apellido}</p>
                  <p className="text-sm text-text-tertiary">CI: {r.simpatizante?.documento}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(r.fecha_registro).toLocaleTimeString('es-PY')}</p>
                  <p className="text-xs text-text-tertiary">{r.puesto?.codigo}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-tertiary">No hay registros aún</div>
        )}
      </div>

      {showQRScanner && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowQRScanner(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content rounded-xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold mb-4 text-center">Escanear Código QR</h3>
            <EscanerQRSolidaridad
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

export default SolidaridadPage;