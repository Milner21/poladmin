import { useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@components";
import {
  ArrowLeft,
  MapPin,
  Save,
  CheckCircle,
  XCircle,
  UserPlus,
  Trash2,
} from "lucide-react";
import RoutesConfig from "@routes/RoutesConfig";
import { usePuesto } from "../hooks/usePuesto";
import { useActualizarPuesto } from "../hooks/useActualizarPuesto";
import { useDesasignarPuesto } from "../hooks/useDesasignarPuesto";
import { useQueryClient } from "@tanstack/react-query";
import { ModalAsignarUsuarioPuesto } from "./ModalAsignarUsuarioPuesto";

const PuestoDetallePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: puesto, isLoading } = usePuesto(id ?? "");
  const actualizarMutation = useActualizarPuesto();
  const desasignarMutation = useDesasignarPuesto();

  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [descripcion, setDescripcion] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!puesto || !id) {
    return (
      <div className="p-6">
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-6 text-center">
          <XCircle size={48} className="mx-auto mb-3 text-danger" />
          <p className="font-semibold text-danger text-lg">
            Puesto no encontrado
          </p>
        </div>
      </div>
    );
  }

  const descripcionActual = descripcion ?? puesto.descripcion ?? "";
  const asignacionesActivas =
    puesto.asignaciones?.filter((a) => a.activo) ?? [];
  const asignacionesInactivas =
    puesto.asignaciones?.filter((a) => !a.activo) ?? [];

  const handleGuardarDescripcion = async () => {
    try {
      await actualizarMutation.mutateAsync({
        id,
        data: { descripcion: descripcionActual || undefined },
      });
      setEditando(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleToggleActivo = async () => {
    try {
      await actualizarMutation.mutateAsync({
        id,
        data: { activo: !puesto.activo },
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleDesasignar = async (usuarioId: string) => {
    try {
      await desasignarMutation.mutateAsync({
        puestoId: id,
        usuarioId,
      });
      queryClient.invalidateQueries({ queryKey: ["puesto", id] });
      queryClient.invalidateQueries({ queryKey: ["puestos"] });
    } catch (error) {
      console.error("Error al desasignar:", error);
    }
  };

  const handleAsignacionExitosa = () => {
    setModalAsignarOpen(false);
    queryClient.invalidateQueries({ queryKey: ["puesto", id] });
    queryClient.invalidateQueries({ queryKey: ["puestos"] });
  };

  return (
    <div className="p-6">
      <PageHeader
        title={`Puesto ${puesto.codigo}`}
        subtitle="Detalle y configuracion del puesto de control"
      />

      <button
        onClick={() => navigate(RoutesConfig.puestosLista)}
        className="btn btn-outline mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Datos generales */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-primary">
                Informacion General
              </h3>
              <p className="text-sm text-text-tertiary">
                Datos del puesto de control
              </p>
            </div>
            <button
              onClick={handleToggleActivo}
              disabled={actualizarMutation.isPending}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                puesto.activo
                  ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                  : "bg-bg-surface text-text-tertiary border border-border hover:bg-bg-surface/80"
              }`}
            >
              {puesto.activo ? (
                <>
                  <CheckCircle size={14} />
                  Activo
                </>
              ) : (
                <>
                  <XCircle size={14} />
                  Inactivo
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Codigo</span>
              <span className="text-sm font-mono font-semibold text-text-primary">
                {puesto.codigo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Modo Eleccion</span>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  puesto.modo_eleccion === "INTERNAS"
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-success/10 text-success border border-success/30"
                }`}
              >
                {puesto.modo_eleccion}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Campana</span>
              <span className="text-sm font-semibold text-text-primary">
                {puesto.campana?.nombre ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Fecha Registro</span>
              <span className="text-sm text-text-secondary">
                {new Date(puesto.fecha_registro).toLocaleString("es-PY")}
              </span>
            </div>

            {/* Descripcion editable */}
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-tertiary">Descripcion</span>
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
              {editando ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="input"
                    value={descripcionActual}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripcion del puesto"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditando(false);
                        setDescripcion(null);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleGuardarDescripcion}
                      disabled={actualizarMutation.isPending}
                      className="btn btn-primary btn-sm flex items-center gap-1"
                    >
                      <Save size={14} />
                      {actualizarMutation.isPending
                        ? "Guardando..."
                        : "Guardar"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  {puesto.descripcion || "Sin descripcion"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Usuarios asignados */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <h3 className="text-lg font-bold text-text-primary">
              Usuarios Asignados
            </h3>
            <button
              onClick={() => setModalAsignarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus size={16} />
              Asignar Usuario
            </button>
          </div>

          {asignacionesActivas.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase">
                Activos ({asignacionesActivas.length})
              </p>
              {asignacionesActivas.map((asignacion) => (
                <div
                  key={asignacion.id}
                  className="flex items-center justify-between p-3 bg-bg-surface border border-border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {asignacion.usuario?.nombre}{" "}
                      {asignacion.usuario?.apellido}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      @{asignacion.usuario?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary">
                      {new Date(asignacion.fecha_asignacion).toLocaleDateString(
                        "es-PY",
                      )}
                    </span>
                    <button
                      onClick={() => handleDesasignar(asignacion.usuario_id)}
                      disabled={desasignarMutation.isPending}
                      className="btn btn-sm btn-danger flex items-center gap-1"
                      title="Desasignar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus
                size={32}
                className="mx-auto mb-3 text-text-tertiary opacity-50"
              />
              <p className="text-sm text-text-tertiary">
                No hay usuarios asignados a este puesto
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Asigna usuarios para que operen desde este puesto de control
              </p>
            </div>
          )}

          {asignacionesInactivas.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-text-tertiary uppercase mb-3">
                Historial ({asignacionesInactivas.length})
              </p>
              {asignacionesInactivas.map((asignacion) => (
                <div
                  key={asignacion.id}
                  className="flex items-center justify-between p-2 opacity-50"
                >
                  <div>
                    <p className="text-sm text-text-tertiary">
                      {asignacion.usuario?.nombre}{" "}
                      {asignacion.usuario?.apellido}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      @{asignacion.usuario?.username}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {new Date(asignacion.fecha_asignacion).toLocaleDateString(
                      "es-PY",
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalAsignarUsuarioPuesto
        isOpen={modalAsignarOpen}
        onClose={() => setModalAsignarOpen(false)}
        puestoId={id}
        onSuccess={handleAsignacionExitosa}
      />
    </div>
  );
};

export default PuestoDetallePage;
