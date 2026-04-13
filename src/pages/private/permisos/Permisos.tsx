import { useState, type FC } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, ProtectedAction } from '@components';
import type { Permiso, CreatePermisoDto } from '@dto/permiso.types';
import { usePermisos as useListaPermisos } from './hooks/usePermisos';
import { useCrearPermiso } from './hooks/useCrearPermiso';
import { useActualizarPermiso } from './hooks/useActualizarPermiso';
import { useEliminarPermiso } from './hooks/useEliminarPermiso';
import { PermisoFormModal } from './components/PermisoFormModal';

const Permisos: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [permisoEditar, setPermisoEditar] = useState<Permiso | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<Permiso | null>(null);

  const { data: permisos, isLoading, refetch } = useListaPermisos();
  const crearMutation = useCrearPermiso();
  const actualizarMutation = useActualizarPermiso();
  const eliminarMutation = useEliminarPermiso();

  // Agrupar permisos por módulo
  const permisosPorModulo = permisos?.reduce<Record<string, Permiso[]>>(
    (acc: Record<string, Permiso[]>, permiso: Permiso) => {
      if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
      acc[permiso.modulo].push(permiso);
      return acc;
    },
    {}
  ) ?? {};

  const handleAbrir = () => {
    setPermisoEditar(null);
    setModalOpen(true);
  };

  const handleEditar = (permiso: Permiso) => {
    setPermisoEditar(permiso);
    setModalOpen(true);
  };

  const handleCerrar = () => {
    setModalOpen(false);
    setPermisoEditar(null);
  };

  const handleSubmit = (data: CreatePermisoDto) => {
    if (permisoEditar) {
      actualizarMutation.mutate(
        { id: permisoEditar.id, data },
        { onSuccess: handleCerrar }
      );
    } else {
      crearMutation.mutate(data, { onSuccess: handleCerrar });
    }
  };

  const handleEliminar = () => {
    if (!confirmarEliminar) return;
    eliminarMutation.mutate(confirmarEliminar.id, {
      onSuccess: () => setConfirmarEliminar(null),
    });
  };

  const isPending = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Permisos"
        subtitle="Gestiona los permisos del sistema"
        showRefresh
        onRefresh={refetch}
        isRefreshing={isLoading}
        extraContent={
          <ProtectedAction modulo="permisos" accion="crear" ocultar>
            <button
              onClick={handleAbrir}
              className="
                flex items-center gap-2 px-4 py-2
                bg-primary hover:bg-primary-hover
                text-white text-sm font-medium rounded-lg
                transition-colors
              "
            >
              <Plus size={16} />
              Nuevo Permiso
            </button>
          </ProtectedAction>
        }
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Permisos agrupados por módulo */}
      {!isLoading && Object.keys(permisosPorModulo).length > 0 && (
        <div className="flex flex-col gap-6">
          {(Object.entries(permisosPorModulo) as [string, Permiso[]][]).map(
            ([modulo, items]) => (
              <div
                key={modulo}
                className="bg-bg-content border border-border rounded-xl overflow-hidden"
              >
                {/* Módulo Header */}
                <div className="px-4 py-3 bg-bg-title border-b border-border">
                  <h4 className="text-sm font-semibold text-text-primary m-0 capitalize">
                    {modulo}
                    <span className="ml-2 text-xs text-text-tertiary font-normal">
                      ({items.length} permisos)
                    </span>
                  </h4>
                </div>

                {/* Permisos del módulo */}
                <div className="divide-y divide-border">
                  {items.map((permiso: Permiso) => (
                    <div
                      key={permiso.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-bg-base transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-text-primary">
                          {permiso.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {permiso.accion}
                          </span>
                          {permiso.descripcion && (
                            <span className="text-xs text-text-tertiary">
                              {permiso.descripcion}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        <ProtectedAction modulo="permisos" accion="editar" ocultar>
                          <button
                            onClick={() => handleEditar(permiso)}
                            className="
                              p-2 rounded-lg text-text-secondary
                              hover:bg-bg-base hover:text-primary
                              transition-colors
                            "
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                        </ProtectedAction>

                        <ProtectedAction modulo="permisos" accion="eliminar" ocultar>
                          <button
                            onClick={() => setConfirmarEliminar(permiso)}
                            className="
                              p-2 rounded-lg text-text-secondary
                              hover:bg-danger/10 hover:text-danger
                              transition-colors
                            "
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </ProtectedAction>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Sin permisos */}
      {!isLoading && (!permisos || permisos.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <p className="text-base">No hay permisos registrados</p>
          <p className="text-sm">Creá el primer permiso con el botón de arriba</p>
        </div>
      )}

      {/* Modal crear/editar */}
      <PermisoFormModal
        open={modalOpen}
        onClose={handleCerrar}
        onSubmit={handleSubmit}
        isPending={isPending}
        permisoEditar={permisoEditar}
      />

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmarEliminar(null)}
          />
          <div className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-bg-content border border-border rounded-xl shadow-xl
            w-full max-w-sm z-50 p-6
          ">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ¿Eliminar permiso?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              ¿Estás seguro que querés eliminar{' '}
              <span className="font-semibold text-text-primary">
                {confirmarEliminar.nombre}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="
                  px-4 py-2 text-sm rounded-lg
                  border border-border text-text-primary
                  hover:bg-bg-base transition-colors
                "
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminarMutation.isPending}
                className="
                  px-4 py-2 text-sm rounded-lg
                  bg-danger hover:bg-danger/80
                  text-white font-medium transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                {eliminarMutation.isPending && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Permisos;