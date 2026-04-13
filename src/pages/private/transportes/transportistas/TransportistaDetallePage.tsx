import { useState, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";
import { usePermisos } from "@hooks/usePermisos";
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Phone,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { ModalEditarTransportista } from "./components/ModalEditarTransportista";
import type { PasajeroTransporte } from "@dto/transporte.types";
import RoutesConfig from "@routes/RoutesConfig";

const TransportistaDetallePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tienePermiso } = usePermisos();

  const [modalEditarOpen, setModalEditarOpen] = useState(false);

  const puedeEditar = tienePermiso("editar_transportista");

  const { data: transportista, isLoading } = useQuery({
    queryKey: ["transportista", id],
    queryFn: () => transportesService.getTransportistaById(id ?? ""),
    enabled: !!id,
  });

  const { data: pasajeros, isLoading: loadingPasajeros } = useQuery({
    queryKey: ["pasajeros", id],
    queryFn: () => transportesService.getAllPasajeros(id),
    enabled: !!id,
  });

  const handleActualizar = () => {
    queryClient.invalidateQueries({ queryKey: ["pasajeros", id] });
    queryClient.invalidateQueries({ queryKey: ["transportista", id] });
  };

  const handleEditarExito = () => {
    setModalEditarOpen(false);
    handleActualizar();
  };

  if (isLoading) {
    return (
      <div className="py-4 px-6 flex justify-center items-center min-h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transportista) {
    return (
      <div className="py-4 px-6">
        <p className="text-text-tertiary">Transportista no encontrado</p>
        <button
          onClick={() => navigate(RoutesConfig.transportesTransportistas)}
          className="btn btn-outline mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>
    );
  }

  const pasajerosConfirmados = pasajeros?.filter((p) => p.confirmado) ?? [];
  const pasajerosPendientes =
    pasajeros?.filter((p) => !p.confirmado && !p.fue_por_cuenta) ?? [];
  const capacidadUsada = pasajeros?.length ?? 0;
  const porcentajeUso = Math.round(
    (capacidadUsada / transportista.capacidad_pasajeros) * 100,
  );

  const renderPasajero = (pasajero: PasajeroTransporte) => {
    const esConfirmado = pasajero.confirmado;

    return (
      <div
        key={pasajero.id}
        className={`rounded-lg border p-3 transition-colors ${
          esConfirmado
            ? "bg-success/10 border-success/30"
            : "bg-bg-content border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          {esConfirmado ? (
            <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
          ) : (
            <Clock size={16} className="text-warning shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${esConfirmado ? "text-success" : "text-text-primary"}`}
            >
              {pasajero.simpatizante?.nombre} {pasajero.simpatizante?.apellido}
            </p>
            <p className="text-xs text-text-tertiary mb-1">
              CI: {pasajero.simpatizante?.documento}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {pasajero.simpatizante?.local_votacion_interna ||
                pasajero.simpatizante?.local_votacion_general ||
                "-"}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-tertiary">
                Mesa:{" "}
                <span className="font-medium text-text-primary">
                  {pasajero.simpatizante?.mesa_votacion_interna ||
                    pasajero.simpatizante?.mesa_votacion_general ||
                    "-"}
                </span>
              </span>
              <span className="text-xs text-text-tertiary">
                Orden:{" "}
                <span className="font-medium text-text-primary">
                  {pasajero.simpatizante?.orden_votacion_interna ||
                    pasajero.simpatizante?.orden_votacion_general ||
                    "-"}
                </span>
              </span>
            </div>
            {pasajero.hora_recogida && (
              <p className="text-xs text-text-tertiary mt-1">
                🕐{" "}
                {new Date(pasajero.hora_recogida).toLocaleTimeString("es-PY", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {pasajero.fecha_confirmacion && (
              <p className="text-xs text-success mt-1">
                ✓ Confirmado:{" "}
                {new Date(pasajero.fecha_confirmacion).toLocaleString("es-PY", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {pasajero.es_duplicado && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-warning/10 text-warning rounded">
                Duplicado
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Detalle de Transportista"
        subtitle="Información del transportista y sus pasajeros asignados"
        showDivider
      />

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate(RoutesConfig.transportesTransportistas)}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {puedeEditar && (
          <button
            onClick={() => setModalEditarOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit size={16} />
            Editar
          </button>
        )}

        <button
          onClick={handleActualizar}
          className="btn btn-outline flex items-center gap-2 ml-auto"
        >
          <RefreshCw size={16} />
          <span className="hidden md:inline">Actualizar</span>
        </button>
      </div>

      {/* Información del transportista */}
      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" />
          Información Personal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-tertiary mb-1">Nombre completo</p>
            <p className="text-sm font-semibold text-text-primary">
              {transportista.nombre} {transportista.apellido}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">Documento</p>
            <p className="text-sm font-semibold text-text-primary">
              {transportista.documento}
            </p>
          </div>

          {transportista.telefono && (
            <div>
              <p className="text-xs text-text-tertiary mb-1">Teléfono</p>
              <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Phone size={14} />
                {transportista.telefono}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-text-tertiary mb-1">Estado</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                transportista.estado
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {transportista.estado ? "✓ Activo" : "✗ Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Información del vehículo */}
      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          Información del Vehículo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-tertiary mb-1">Tipo de vehículo</p>
            <p className="text-sm font-semibold text-text-primary">
              {transportista.tipo_vehiculo}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">Marca</p>
            <p className="text-sm font-semibold text-text-primary">
              {transportista.marca_vehiculo || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">Chapa</p>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Tag size={14} />
              {transportista.chapa_vehiculo}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">Capacidad máxima</p>
            <p className="text-sm font-semibold text-text-primary">
              {transportista.capacidad_pasajeros} pasajeros
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">
              Pasajeros asignados
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {capacidadUsada} / {transportista.capacidad_pasajeros}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-1">Uso de capacidad</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-bg-base rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    porcentajeUso >= 100
                      ? "bg-danger"
                      : porcentajeUso >= 80
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                  style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-text-primary">
                {porcentajeUso}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-info" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-2xl font-bold text-info">
            {pasajeros?.length ?? 0}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-success" />
            <p className="text-xs text-text-tertiary">Confirmados</p>
          </div>
          <p className="text-2xl font-bold text-success">
            {pasajerosConfirmados.length}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-warning" />
            <p className="text-xs text-text-tertiary">Pendientes</p>
          </div>
          <p className="text-2xl font-bold text-warning">
            {pasajerosPendientes.length}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={16} className="text-primary" />
            <p className="text-xs text-text-tertiary">Disponibles</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {Math.max(0, transportista.capacidad_pasajeros - capacidadUsada)}
          </p>
        </div>
      </div>

      {/* Lista de pasajeros */}
      {loadingPasajeros ? (
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pendientes */}
          {pasajerosPendientes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Clock size={14} className="text-warning" />
                Pendientes de confirmación ({pasajerosPendientes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pasajerosPendientes.map(renderPasajero)}
              </div>
            </div>
          )}

          {/* Confirmados */}
          {pasajerosConfirmados.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                <CheckCircle size={14} />
                Confirmados ({pasajerosConfirmados.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pasajerosConfirmados.map(renderPasajero)}
              </div>
            </div>
          )}

          {/* Sin pasajeros */}
          {(pasajeros?.length ?? 0) === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary border border-border rounded-xl bg-bg-content">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Sin pasajeros asignados</p>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Calendar size={12} />
          <span>
            Registrado el{" "}
            {new Date(transportista.fecha_registro).toLocaleDateString("es-PY")}
            {transportista.registrado_por && (
              <>
                {" "}
                por {transportista.registrado_por.nombre}{" "}
                {transportista.registrado_por.apellido}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Modal Editar */}
      {puedeEditar && (
        <ModalEditarTransportista
          isOpen={modalEditarOpen}
          transportista={transportista}
          onClose={() => setModalEditarOpen(false)}
          onSuccess={handleEditarExito}
        />
      )}
    </div>
  );
};

export default TransportistaDetallePage;
