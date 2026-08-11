import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable";
import type { CupoActivador } from "@dto/activador.types";
import { usePermisos } from "@hooks/usePermisos";
import SelectConBusqueda from "@pages/private/simpatizantes/registrar-para/components/SelectConBusqueda";
import RoutesConfig from "@routes/RoutesConfig";
import {
    CheckCircle,
    Edit,
    Plus,
    Target,
    Trash2,
    User,
    Users,
    XCircle,
} from "lucide-react";
import { useState, type FC } from "react";
import { Navigate } from "react-router-dom";
import { useUsuarios } from "../usuarios/hooks/useUsuarios";
import { useActualizarCupo } from "./hooks/useActualizarCupo";
import { useAsignarCupo } from "./hooks/useAsignarCupo";
import { useCuposActivador } from "./hooks/useCuposActivador";
import { useEliminarCupo } from "./hooks/useEliminarCupo";

interface ModalAsignarProps {
  isOpen: boolean;
  onClose: () => void;
  cupoExistente?: CupoActivador | null;
}

const ModalAsignar: FC<ModalAsignarProps> = ({
  isOpen,
  onClose,
  cupoExistente,
}) => {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");
  const [cuposAsignados, setCuposAsignados] = useState<number>(
    cupoExistente?.cupos_asignados || 1,
  );
  const { data: usuarios } = useUsuarios();
  const asignarMutation = useAsignarCupo();
  const actualizarMutation = useActualizarCupo();

  const esEdicion = !!cupoExistente;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esEdicion && !usuarioSeleccionado) return;
    if (cuposAsignados < 1) return;

    try {
      if (esEdicion) {
        await actualizarMutation.mutateAsync({
          cupoId: cupoExistente.id,
          data: { cupos_asignados: cuposAsignados },
        });
      } else {
        await asignarMutation.mutateAsync({
          usuario_id: usuarioSeleccionado,
          cupos_asignados: cuposAsignados,
        });
      }
      onClose();
    } catch {
      // El error ya se maneja en los hooks
    }
  };

  const handleClose = () => {
    setUsuarioSeleccionado("");
    setCuposAsignados(1);
    onClose();
  };

  if (!isOpen) return null;

  const isSubmitting =
    asignarMutation.isPending || actualizarMutation.isPending;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={handleClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          {esEdicion ? "Editar Cupo" : "Asignar Cupo"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!esEdicion && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Usuario
              </label>
              <SelectConBusqueda
                placeholder="Seleccionar usuario..."
                opciones={
                  usuarios?.map((u) => ({
                    id: u.id,
                    nombre: u.nombre,
                    apellido: u.apellido,
                    nivel: {
                      nombre: u.perfil.nombre,
                    },
                  })) || []
                }
                valor={usuarioSeleccionado}
                onCambio={(valor) => setUsuarioSeleccionado(valor)}
              />
            </div>
          )}

          {esEdicion && (
            <div className="bg-bg-surface border border-border rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-tertiary" />
                <div>
                  <p className="font-medium text-text-primary">
                    {cupoExistente.usuario?.nombre}{" "}
                    {cupoExistente.usuario?.apellido}
                  </p>
                  <p className="text-sm text-text-secondary">
                    @{cupoExistente.usuario?.username}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Cupos a Asignar
            </label>
            <input
              type="number"
              value={cuposAsignados}
              onChange={(e) => setCuposAsignados(Number(e.target.value))}
              min="1"
              max="999"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            {esEdicion && cupoExistente.cupos_utilizados > 0 && (
              <p className="mt-1 text-xs text-text-tertiary">
                Utilizados: {cupoExistente.cupos_utilizados} (no puede ser menor
                que esto)
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn btn-outline"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!esEdicion && !usuarioSeleccionado) ||
                cuposAsignados < 1 ||
                (esEdicion && cuposAsignados < cupoExistente.cupos_utilizados)
              }
              className="flex-1 btn btn-primary"
            >
              {isSubmitting
                ? esEdicion
                  ? "Actualizando..."
                  : "Asignando..."
                : esEdicion
                  ? "Actualizar"
                  : "Asignar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const CuposActivadorPage: FC = () => {
  const { tienePermiso } = usePermisos();
  const { data: cupos, isLoading } = useCuposActivador();
  const eliminarMutation = useEliminarCupo();

  const [showModal, setShowModal] = useState(false);
  const [cupoAEditar, setCupoAEditar] = useState<CupoActivador | null>(null);
  const [cupoAEliminar, setCupoAEliminar] = useState<CupoActivador | null>(
    null,
  );

  const puedeGestionar = tienePermiso("gestionar_cupos_activador");

  if (!puedeGestionar) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleEliminar = async () => {
    if (!cupoAEliminar) return;

    try {
      await eliminarMutation.mutateAsync(cupoAEliminar.id);
      setCupoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEditar = (cupo: CupoActivador) => {
    setCupoAEditar(cupo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCupoAEditar(null);
  };

  const cuposConDisponibles =
    cupos?.map((cupo) => ({
      ...cupo,
      cupos_disponibles: cupo.cupos_asignados - cupo.cupos_utilizados,
    })) || [];

  const columns: ColumnDef<CupoActivador & { cupos_disponibles: number }>[] = [
    {
      key: "usuario",
      title: "Usuario",
      render: (cupo) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-text-primary">
              {cupo.usuario?.nombre} {cupo.usuario?.apellido}
            </p>
            <p className="text-sm text-text-secondary">
              @{cupo.usuario?.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "perfil",
      title: "Perfil",
      render: (cupo) => (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-bg-surface text-text-secondary border border-border">
          {cupo.usuario?.perfil?.nombre || "Sin perfil"}
        </span>
      ),
    },
    {
      key: "cupos_asignados",
      title: "Asignados",
      dataIndex: "cupos_asignados",
      render: (cupo) => (
        <div className="flex items-center gap-2">
          <Target size={14} className="text-primary" />
          <span className="font-semibold text-text-primary">
            {cupo.cupos_asignados}
          </span>
        </div>
      ),
    },
    {
      key: "cupos_utilizados",
      title: "Utilizados",
      dataIndex: "cupos_utilizados",
      render: (cupo) => (
        <div className="flex items-center gap-2">
          <XCircle size={14} className="text-text-tertiary" />
          <span className="font-semibold text-text-tertiary">
            {cupo.cupos_utilizados}
          </span>
        </div>
      ),
    },
    {
      key: "cupos_disponibles",
      title: "Disponibles",
      render: (cupo) => (
        <div className="flex items-center gap-2">
          <CheckCircle
            size={14}
            className={
              cupo.cupos_disponibles > 0 ? "text-success" : "text-text-tertiary"
            }
          />
          <span
            className={`font-semibold ${
              cupo.cupos_disponibles > 0 ? "text-success" : "text-text-tertiary"
            }`}
          >
            {cupo.cupos_disponibles}
          </span>
        </div>
      ),
    },
    {
      key: "fecha_asignacion",
      title: "Fecha Asignación",
      dataIndex: "fecha_asignacion",
      render: (cupo) => (
        <span className="text-sm text-text-secondary">
          {new Date(cupo.fecha_asignacion).toLocaleDateString("es-PY")}
        </span>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (cupo) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditar(cupo)}
            className="btn btn-sm btn-outline flex items-center gap-1"
            title="Editar cupos"
          >
            <Edit size={14} />
            <span className="hidden md:inline">Editar</span>
          </button>
          <button
            onClick={() => setCupoAEliminar(cupo)}
            className="btn btn-sm btn-danger flex items-center gap-1"
            title="Eliminar"
          >
            <Trash2 size={14} />
            <span className="hidden md:inline">Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalAsignados =
    cupos?.reduce((sum, cupo) => sum + cupo.cupos_asignados, 0) || 0;
  const totalUtilizados =
    cupos?.reduce((sum, cupo) => sum + cupo.cupos_utilizados, 0) || 0;
  const totalDisponibles = totalAsignados - totalUtilizados;

  return (
    <div className="p-6">
      <PageHeader
        title="Gestión de Cupos de Activador"
        subtitle="Asigna y gestiona cupos de activación para los usuarios"
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Target size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {totalAsignados} Asignados
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm font-medium text-success">
              {totalDisponibles} Disponibles
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border rounded-lg">
            <XCircle size={16} className="text-text-tertiary" />
            <span className="text-sm text-text-tertiary">
              {totalUtilizados} Utilizados
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Asignar Cupo
        </button>
      </div>

      {cupos && cupos.length > 0 ? (
        <CTable
          data={cuposConDisponibles}
          columns={columns}
          rowKey="id"
          pagination={true}
          defaultPageSize={10}
        />
      ) : (
        <div className="bg-bg-content border border-border rounded-xl p-12 text-center">
          <Users
            size={48}
            className="mx-auto mb-4 text-text-tertiary opacity-50"
          />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No hay cupos asignados
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            Asigna el primer cupo para comenzar
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Asignar Cupo
          </button>
        </div>
      )}

      {/* Modal Asignar/Editar */}
      <ModalAsignar
        isOpen={showModal}
        onClose={handleCloseModal}
        cupoExistente={cupoAEditar}
      />

      {/* Modal Confirmar Eliminación */}
      {cupoAEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setCupoAEliminar(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              ¿Eliminar cupo?
            </h3>
            <p className="text-sm text-text-secondary mb-2">
              Estas por eliminar el cupo de:
            </p>
            <div className="bg-bg-surface border border-border rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-tertiary" />
                <div>
                  <p className="font-medium text-text-primary">
                    {cupoAEliminar.usuario?.nombre}{" "}
                    {cupoAEliminar.usuario?.apellido}
                  </p>
                  <p className="text-sm text-text-secondary">
                    @{cupoAEliminar.usuario?.username}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {cupoAEliminar.cupos_asignados} asignados •{" "}
                    {cupoAEliminar.cupos_utilizados} utilizados
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-danger mb-6">
              Esta acción no se puede deshacer. Se perderá el historial de cupos
              de este usuario.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCupoAEliminar(null)}
                className="flex-1 btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminarMutation.isPending}
                className="flex-1 btn btn-danger"
              >
                {eliminarMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CuposActivadorPage;
