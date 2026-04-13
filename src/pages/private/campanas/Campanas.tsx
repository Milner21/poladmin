import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@components';
import { useCampanas } from './hooks/useCampanas';
import { useEliminarCampana } from './hooks/useEliminarCampana';
import RoutesConfig from '@routes/RoutesConfig';
import type { Campana } from '@dto/campana.types';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  Building2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Campanas: FC = () => {
  const navigate = useNavigate();
  const { data: campanas, isLoading } = useCampanas();
  const eliminarMutation = useEliminarCampana();
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);

  const handleEliminar = (id: string) => {
    eliminarMutation.mutate(id, {
      onSuccess: () => setConfirmarEliminar(null),
    });
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Campañas"
        subtitle="Administrá las campañas electorales del sistema"
        showDivider
      />

      <div className="max-w-5xl">
        {/* Botón crear */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate(RoutesConfig.campanasCrear)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Campaña
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12 text-text-secondary">
            Cargando campañas...
          </div>
        )}

        {/* Lista de campañas */}
        {!isLoading && campanas && campanas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campanas.map((campana: Campana) => (
              <div
                key={campana.id}
                className="bg-bg-content border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{campana.nombre}</h3>
                      {campana.distrito && campana.departamento && (
                        <p className="text-sm text-text-secondary">
                          {campana.distrito}, {campana.departamento}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex items-center gap-1">
                    {campana.estado ? (
                      <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-error bg-error/10 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                {/* Modo elección */}
                <div className="mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    campana.configuracion?.modo_eleccion === 'INTERNAS'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-accent/10 text-accent'
                  }`}>
                    {campana.configuracion?.modo_eleccion === 'INTERNAS'
                      ? '🗳️ Elecciones Internas'
                      : '🗳️ Elecciones Generales'
                    }
                  </span>
                </div>

                {/* Stats */}
                {campana._count && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-bg-base rounded-lg">
                      <Users className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-text-secondary">Usuarios</p>
                        <p className="font-semibold text-text-primary">{campana._count.usuarios}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-bg-base rounded-lg">
                      <UserPlus className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-text-secondary">Simpatizantes</p>
                        <p className="font-semibold text-text-primary">{campana._count.simpatizantes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => navigate(RoutesConfig.campanasEditar(campana.id))}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmarEliminar(campana.id)}
                    disabled={eliminarMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (
          <div className="text-center py-12 bg-bg-content border border-border rounded-xl">
            <Building2 className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No hay campañas creadas</p>
            <p className="text-text-tertiary text-sm mb-4">
              Creá tu primera campaña electoral
            </p>
            <button
              onClick={() => navigate(RoutesConfig.campanasCrear)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Campaña
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-content rounded-xl p-6 mx-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ¿Eliminar campaña?
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Esta acción no se puede deshacer. Solo se puede eliminar una campaña
              si no tiene usuarios o simpatizantes activos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarEliminar(null)}
                disabled={eliminarMutation.isPending}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmarEliminar)}
                disabled={eliminarMutation.isPending}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {eliminarMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campanas;