import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, CTable } from "@components";
import { usePermisos } from "@hooks/usePermisos";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  MapPin,
  Users,
} from "lucide-react";
import type { PuestoControl } from "@dto/puesto.types";
import RoutesConfig from "@routes/RoutesConfig";
import { usePuestos } from "./hooks/usePuestos";
import { useEliminarPuesto } from "./hooks/useEliminarPuesto";
import type { ColumnDef } from "@components/CTable";
import { Navigate } from "react-router-dom";

const PuestosListaPage: FC = () => {
  const navigate = useNavigate();
  const { data: puestos, isLoading } = usePuestos();
  const { tienePermiso } = usePermisos();
  const eliminarMutation = useEliminarPuesto();

  const [puestoAEliminar, setPuestoAEliminar] = useState<PuestoControl | null>(
    null,
  );

  const puedeGestionar = tienePermiso("gestionar_puestos");

  if (!puedeGestionar) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  const handleEliminar = async () => {
    if (!puestoAEliminar) return;

    try {
      await eliminarMutation.mutateAsync(puestoAEliminar.id);
      setPuestoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const columns: ColumnDef<PuestoControl>[] = [
    {
      key: "codigo",
      title: "Código",
      dataIndex: "codigo",
      render: (puesto: PuestoControl) => (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          <span className="font-mono font-semibold text-text-primary">
            {puesto.codigo}
          </span>
        </div>
      ),
    },
    {
      key: "descripcion",
      title: "Descripción",
      dataIndex: "descripcion",
      render: (puesto: PuestoControl) => (
        <span className="text-sm text-text-secondary">
          {puesto.descripcion || "-"}
        </span>
      ),
    },
    {
      key: "modo_eleccion",
      title: "Modo Elección",
      dataIndex: "modo_eleccion",
      render: (puesto: PuestoControl) => (
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
            puesto.modo_eleccion === "INTERNAS"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-success/10 text-success border border-success/30"
          }`}
        >
          {puesto.modo_eleccion}
        </span>
      ),
    },
    {
      key: "estado",
      title: "Estado",
      dataIndex: "activo",
      render: (puesto: PuestoControl) => (
        <div className="flex items-center gap-2">
          {puesto.activo ? (
            <>
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm font-medium text-success">Activo</span>
            </>
          ) : (
            <>
              <XCircle size={16} className="text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Inactivo</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "asignaciones",
      title: "Usuarios Asignados",
      render: (puesto: PuestoControl) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-tertiary" />
          <span className="text-sm text-text-secondary">
            {puesto.asignaciones?.filter((a) => a.activo).length || 0}
          </span>
        </div>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (puesto: PuestoControl) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(RoutesConfig.puestosDetalle(puesto.id))}
            className="btn btn-sm btn-outline flex items-center gap-1"
            title="Ver detalle"
          >
            <Edit size={14} />
            <span className="hidden md:inline">Detalle</span>
          </button>
          <button
            onClick={() => setPuestoAEliminar(puesto)}
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

  return (
    <div className="p-6">
      <PageHeader
        title="Puestos de Control"
        subtitle="Gestiona los puestos de control para el día de la elección"
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm font-medium text-success">
              {puestos?.filter((p) => p.activo).length || 0} Activos
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border rounded-lg">
            <MapPin size={16} className="text-text-tertiary" />
            <span className="text-sm text-text-tertiary">
              {puestos?.length || 0} Total
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(RoutesConfig.puestosCrear)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nuevo Puesto
        </button>
      </div>

      {puestos && puestos.length > 0 ? (
        <CTable
          data={puestos}
          columns={columns}
          rowKey="id"
          pagination={true}
          defaultPageSize={10}
          onRowDoubleClick={(puesto: PuestoControl) => {
            navigate(RoutesConfig.puestosDetalle(puesto.id));
          }}
        />
      ) : (
        <div className="bg-bg-content border border-border rounded-xl p-12 text-center">
          <MapPin
            size={48}
            className="mx-auto mb-4 text-text-tertiary opacity-50"
          />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No hay puestos de control registrados
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            Crea el primer puesto de control para comenzar
          </p>
          <button
            onClick={() => navigate(RoutesConfig.puestosCrear)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Crear Puesto
          </button>
        </div>
      )}

      {puestoAEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setPuestoAEliminar(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              ¿Eliminar puesto?
            </h3>
            <p className="text-sm text-text-secondary mb-2">
              Estas por eliminar el puesto:
            </p>
            <div className="bg-bg-surface border border-border rounded-lg p-3 mb-4">
              <p className="font-mono font-semibold text-text-primary">
                {puestoAEliminar.codigo}
              </p>
              <p className="text-sm text-text-secondary">
                {puestoAEliminar.descripcion || "Sin descripción"}
              </p>
            </div>
            <p className="text-xs text-danger mb-6">
              Esta acción no se puede deshacer. Los registros asociados se
              eliminarán también.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPuestoAEliminar(null)}
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

export default PuestosListaPage;