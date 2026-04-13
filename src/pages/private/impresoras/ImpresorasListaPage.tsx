import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, CTable } from "@components";
import { usePermisos } from "@hooks/usePermisos";
import {
  Plus,
  Printer,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Impresora } from "@dto/impresora.types";
import RoutesConfig from "@routes/RoutesConfig";
import { useImpresoras } from "./hooks/useImpresoras";
import { useEliminarImpresora } from "./hooks/useEliminarImpresora";
import type { ColumnDef } from "@components/CTable";

const ImpresorasListaPage: FC = () => {
  const navigate = useNavigate();
  const { data: impresoras, isLoading } = useImpresoras();
  const { tienePermiso } = usePermisos();
  const eliminarMutation = useEliminarImpresora();

  const [impresoraAEliminar, setImpresoraAEliminar] =
    useState<Impresora | null>(null);

  const puedeCrear = tienePermiso("crear_impresora");
  const puedeEditar = tienePermiso("editar_impresora");
  const puedeEliminar = tienePermiso("eliminar_impresora");

  const handleEliminar = async () => {
    if (!impresoraAEliminar) return;

    try {
      await eliminarMutation.mutateAsync(impresoraAEliminar.id);
      setImpresoraAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const columns: ColumnDef<Impresora>[] = [
    {
      key: "codigo",
      title: "Código",
      dataIndex: "codigo",
      render: (impresora: Impresora) => (
        <div className="flex items-center gap-2">
          <Printer size={16} className="text-primary" />
          <span className="font-mono font-semibold text-text-primary">
            {impresora.codigo}
          </span>
        </div>
      ),
    },
    {
      key: "nombre",
      title: "Nombre",
      dataIndex: "nombre",
      render: (impresora: Impresora) => (
        <div>
          <p className="font-medium text-text-primary">{impresora.nombre}</p>
          {impresora.descripcion && (
            <p className="text-xs text-text-tertiary">
              {impresora.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "ubicacion",
      title: "Ubicación",
      dataIndex: "ubicacion",
      render: (impresora: Impresora) => (
        <span className="text-sm text-text-secondary">
          {impresora.ubicacion || "-"}
        </span>
      ),
    },
    {
      key: "estado",
      title: "Estado",
      dataIndex: "estado",
      render: (impresora: Impresora) => (
        <div className="flex items-center gap-2">
          {impresora.estado === "CONECTADA" ? (
            <>
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm font-medium text-success">
                Conectada
              </span>
            </>
          ) : (
            <>
              <XCircle size={16} className="text-text-tertiary" />
              <span className="text-sm text-text-tertiary">Desconectada</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "usuarios",
      title: "Usuarios Asignados",
      render: (impresora: Impresora) => (
        <div className="flex flex-col gap-1">
          {impresora.usuarios && impresora.usuarios.length > 0 ? (
            impresora.usuarios.slice(0, 2).map((ua) => (
              <span key={ua.id} className="text-xs text-text-secondary">
                {ua.usuario?.nombre} {ua.usuario?.apellido}
              </span>
            ))
          ) : (
            <span className="text-xs text-text-tertiary italic">
              Sin asignar
            </span>
          )}
          {impresora.usuarios && impresora.usuarios.length > 2 && (
            <span className="text-xs text-primary font-medium">
              +{impresora.usuarios.length - 2} más
            </span>
          )}
        </div>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (impresora: Impresora) => (
        <div className="flex gap-2">
          {puedeEditar && (
            <button
              onClick={() =>
                navigate(`${RoutesConfig.impresorasLista}/${impresora.id}`)
              }
              className="btn btn-sm btn-outline flex items-center gap-1"
              title="Editar"
            >
              <Edit size={14} />
              <span className="hidden md:inline">Editar</span>
            </button>
          )}
          {puedeEliminar && (
            <button
              onClick={() => setImpresoraAEliminar(impresora)}
              className="btn btn-sm btn-danger flex items-center gap-1"
              title="Eliminar"
            >
              <Trash2 size={14} />
              <span className="hidden md:inline">Eliminar</span>
            </button>
          )}
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
        title="Gestión de Impresoras"
        subtitle="Administrá las impresoras térmicas del sistema"
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle size={16} className="text-success" />
            <span className="text-sm font-medium text-success">
              {impresoras?.filter((i) => i.estado === "CONECTADA").length || 0}{" "}
              Conectadas
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border rounded-lg">
            <Printer size={16} className="text-text-tertiary" />
            <span className="text-sm text-text-tertiary">
              {impresoras?.length || 0} Total
            </span>
          </div>
        </div>

        {puedeCrear && (
          <button
            onClick={() => navigate(RoutesConfig.impresorasCrear)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Nueva Impresora
          </button>
        )}
      </div>

      {impresoras && impresoras.length > 0 ? (
        <CTable
          data={impresoras}
          columns={columns}
          rowKey="id"
          pagination={true}
          defaultPageSize={10}
          onRowDoubleClick={(impresora: Impresora) => {
            if (puedeEditar) {
              navigate(`${RoutesConfig.impresorasLista}/${impresora.id}`);
            }
          }}
        />
      ) : (
        <div className="bg-bg-content border border-border rounded-xl p-12 text-center">
          <Printer
            size={48}
            className="mx-auto mb-4 text-text-tertiary opacity-50"
          />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No hay impresoras registradas
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            Comenzá registrando tu primera impresora térmica
          </p>
          {puedeCrear && (
            <button
              onClick={() => navigate(RoutesConfig.impresorasCrear)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
            >
              <Plus size={18} />
              Registrar Impresora
            </button>
          )}
        </div>
      )}

      {impresoraAEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setImpresoraAEliminar(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              ¿Eliminar impresora?
            </h3>
            <p className="text-sm text-text-secondary mb-2">
              Estás por eliminar la impresora:
            </p>
            <div className="bg-bg-surface border border-border rounded-lg p-3 mb-4">
              <p className="font-mono font-semibold text-text-primary">
                {impresoraAEliminar.codigo}
              </p>
              <p className="text-sm text-text-secondary">
                {impresoraAEliminar.nombre}
              </p>
            </div>
            <p className="text-xs text-danger mb-6">
              Esta acción no se puede deshacer. Los trabajos de impresión
              asociados también se eliminarán.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setImpresoraAEliminar(null)}
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

export default ImpresorasListaPage;
