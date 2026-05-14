import { X, Loader2, User, Phone, MapPin, Calendar, FileText, TrendingUp, Car, CheckCircle, XCircle } from "lucide-react";
import { type FC } from "react";
import { useSimpatizanteDetalle } from "../../hooks/useSimpatizanteDetalle";

interface Props {
  isOpen: boolean;
  simpatizanteId: string | null;
  onClose: () => void;
}

export const ModalVerSimpatizante: FC<Props> = ({
  isOpen,
  simpatizanteId,
  onClose,
}) => {
  const { data: simpatizante, isLoading } = useSimpatizanteDetalle(simpatizanteId);

  if (!isOpen) return null;

  const getColorIntencion = (intencion: string): string => {
    switch (intencion) {
      case "SEGURO":
        return "bg-success text-white";
      case "PROBABLE":
        return "bg-info text-white";
      case "INDECISO":
        return "bg-warning text-white";
      case "CONTRARIO":
        return "bg-danger text-white";
      default:
        return "bg-text-tertiary text-white";
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Detalle del simpatizante
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <X size={18} className="text-text-tertiary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : simpatizante ? (
          <div className="space-y-4">
            <div className="bg-bg-base border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Nombre completo</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {simpatizante.nombre} {simpatizante.apellido}
                  </p>
                  <p className="text-sm text-text-tertiary mt-1">
                    CI: {simpatizante.documento}
                  </p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getColorIntencion(simpatizante.intencion_voto)}`}
                >
                  {simpatizante.intencion_voto}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Teléfono</p>
                </div>
                {simpatizante.telefono ? (
                  <a
                    href={`tel:${simpatizante.telefono}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {simpatizante.telefono}
                  </a>
                ) : (
                  <p className="text-sm text-text-tertiary">No registrado</p>
                )}
              </div>

              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Fecha de nacimiento</p>
                </div>
                <p className="text-sm text-text-primary">
                  {simpatizante.fecha_nacimiento
                    ? new Date(simpatizante.fecha_nacimiento).toLocaleDateString("es-PY")
                    : "No registrada"}
                </p>
              </div>

              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Ubicación</p>
                </div>
                <p className="text-sm text-text-primary">
                  {simpatizante.barrio || "Sin barrio"}
                </p>
                {(simpatizante.distrito || simpatizante.departamento) && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {[simpatizante.distrito, simpatizante.departamento]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>

              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Estado</p>
                </div>
                <div className="flex items-center gap-2">
                  {simpatizante.es_afiliado ? (
                    <CheckCircle size={14} className="text-success" />
                  ) : (
                    <XCircle size={14} className="text-text-tertiary" />
                  )}
                  <span className="text-sm text-text-primary">
                    {simpatizante.es_afiliado ? "Afiliado" : "No afiliado"}
                  </span>
                </div>
              </div>
            </div>

            {simpatizante.necesita_transporte && (
              <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-info" />
                  <span className="text-sm font-medium text-info">
                    Necesita transporte
                  </span>
                </div>
              </div>
            )}

            {(simpatizante.latitud && simpatizante.longitud) && (
              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-success" />
                  <p className="text-xs font-medium text-text-tertiary">Coordenadas GPS</p>
                </div>
                <p className="text-sm text-text-primary font-mono">
                  {simpatizante.latitud.toFixed(6)}, {simpatizante.longitud.toFixed(6)}
                </p>
              </div>
            )}

            {simpatizante.observaciones && (
              <div className="bg-bg-base border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Observaciones</p>
                </div>
                <p className="text-sm text-text-primary whitespace-pre-wrap">
                  {simpatizante.observaciones}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-primary" />
                  <p className="text-xs font-medium text-text-tertiary">Registrado por</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {simpatizante.registrado_por.nombre} {simpatizante.registrado_por.apellido}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      @{simpatizante.registrado_por.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                      {simpatizante.registrado_por.perfil.nombre}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      el {formatearFecha(simpatizante.fecha_registro)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-tertiary">No se pudo cargar la información</p>
          </div>
        )}
      </div>
    </>
  );
};