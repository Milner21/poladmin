import { useState, type FC } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { PageHeader, ProtectedAction } from "@components";
import { usePerfiles } from "./hooks/usePerfiles";
import { useEliminarPerfil } from "./hooks/useEliminarPerfil";
import type { Perfil } from "@dto/perfil.types";
import RoutesConfig from "@routes/RoutesConfig";
import { useNavigate } from "react-router-dom";

const Perfiles: FC = () => {
  const navigate = useNavigate();
  const [confirmarEliminar, setConfirmarEliminar] = useState<Perfil | null>(
    null,
  );

  const { data: perfiles, isLoading, refetch } = usePerfiles();
  const eliminarMutation = useEliminarPerfil();

  const handleEliminar = () => {
    if (!confirmarEliminar) return;
    eliminarMutation.mutate(confirmarEliminar.id, {
      onSuccess: () => setConfirmarEliminar(null),
    });
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Perfiles"
        subtitle="Gestiona los perfiles del sistema"
        showRefresh
        onRefresh={refetch}
        isRefreshing={isLoading}
        extraContent={
          <ProtectedAction modulo="perfiles" accion="crear" ocultar>
            <button
              onClick={() => navigate(RoutesConfig.perfilesCrear)}
              className="
                flex items-center gap-2 px-4 py-2
                bg-primary hover:bg-primary-hover
                text-white text-sm font-medium rounded-lg
                transition-colors
              "
            >
              <Plus size={16} />
              Nuevo Perfil
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

      {/* Grid de perfiles */}
      {!isLoading && perfiles && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfiles.map((perfil) => (
            <div
              key={perfil.id}
              className="bg-bg-content border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-text-primary m-0">
                      {perfil.nombre}
                    </h4>
                    <span className="text-xs text-text-tertiary">
                      {perfil.es_operativo
                        ? "Operativo"
                        : perfil.nivel
                          ? `Nivel ${perfil.nivel.orden} - ${perfil.nivel.nombre}`
                          : "Sin nivel"}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <ProtectedAction modulo="perfiles" accion="editar" ocultar>
                    <button
                      onClick={() =>
                        navigate(RoutesConfig.perfilesEditar(perfil.id))
                      }
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

                  <ProtectedAction modulo="perfiles" accion="eliminar" ocultar>
                    <button
                      onClick={() => setConfirmarEliminar(perfil)}
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

              {/* Permisos count */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-text-tertiary">
                  {perfil.permisos.length} permisos asignados
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin perfiles */}
      {!isLoading && (!perfiles || perfiles.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <p className="text-base">No hay perfiles registrados</p>
          <p className="text-sm">
            Creá el primer perfil con el botón de arriba
          </p>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmarEliminar(null)}
          />
          <div
            className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-bg-content border border-border rounded-xl shadow-xl
            w-full max-w-sm z-50 p-6
          "
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ¿Eliminar perfil?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              ¿Estás seguro que querés eliminar{" "}
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

export default Perfiles;
