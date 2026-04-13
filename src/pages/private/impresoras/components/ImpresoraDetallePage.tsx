import { PageHeader } from '@components';
import type { UpdateImpresoraDto } from '@dto/impresora.types';
import { usePermisos } from '@hooks/usePermisos';
import RoutesConfig from '@routes/RoutesConfig';
import { impresorasService } from '@services/impresoras.service';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Printer,
    Save,
    Trash2,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useActualizarImpresora } from '../hooks/useActualizarImpresora';
import { useImpresora } from '../hooks/useImpresora';
import { ModalAsignarUsuario } from './ModalAsignarUsuario';

const ImpresoraDetallePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: impresora, isLoading } = useImpresora(id!);
  const actualizarMutation = useActualizarImpresora();
  const { tienePermiso } = usePermisos();

  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const puedeEditar = tienePermiso('editar_impresora');
  const puedeAsignar = tienePermiso('asignar_impresora');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateImpresoraDto>({
    values: impresora
      ? {
          nombre: impresora.nombre,
          descripcion: impresora.descripcion || undefined,
          ubicacion: impresora.ubicacion || undefined,
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateImpresoraDto) => {
    if (!id) return;

    try {
      await actualizarMutation.mutateAsync({ id, data });
      setModoEdicion(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleCancelarEdicion = () => {
    reset();
    setModoEdicion(false);
  };

  const handleDesasignar = async (usuarioId: string, impresoraId: string) => {
    if (!confirm('¿Desasignar este usuario de la impresora?')) return;

    try {
      await impresorasService.desasignarUsuario(usuarioId, impresoraId);
      queryClient.invalidateQueries({ queryKey: ['impresora', id] });
      toast.success('Usuario desasignado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al desasignar usuario');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!impresora) {
    return (
      <div className="p-6">
        <p className="text-text-tertiary">Impresora no encontrada</p>
        <button
          onClick={() => navigate(RoutesConfig.impresorasLista)}
          className="btn btn-outline mt-4"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Detalle de Impresora" subtitle={impresora.nombre} />

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => navigate(RoutesConfig.impresorasLista)}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {puedeEditar && !modoEdicion && (
          <button
            onClick={() => setModoEdicion(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            Editar Impresora
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Printer size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Información Básica</h3>
                <p className="text-sm text-text-tertiary">
                  Código: <span className="font-mono font-semibold">{impresora.codigo}</span>
                </p>
              </div>
            </div>

            {modoEdicion ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    type="text"
                    className="input"
                    {...register('nombre', { required: 'El nombre es requerido' })}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-danger mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Descripción</label>
                  <input type="text" className="input" {...register('descripcion')} />
                </div>

                <div>
                  <label className="label">Ubicación</label>
                  <input type="text" className="input" {...register('ubicacion')} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelarEdicion}
                    className="flex-1 btn btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Nombre</p>
                  <p className="text-sm font-semibold text-text-primary">{impresora.nombre}</p>
                </div>

                {impresora.descripcion && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Descripción</p>
                    <p className="text-sm text-text-secondary">{impresora.descripcion}</p>
                  </div>
                )}

                {impresora.ubicacion && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Ubicación</p>
                    <p className="text-sm text-text-secondary">{impresora.ubicacion}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usuarios asignados */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary">Usuarios Asignados</h3>
              {puedeAsignar && (
                <button
                  onClick={() => setModalAsignarOpen(true)}
                  className="btn btn-sm btn-primary flex items-center gap-2"
                >
                  <UserPlus size={14} />
                  Asignar Usuario
                </button>
              )}
            </div>

            {impresora.usuarios && impresora.usuarios.length > 0 ? (
              <div className="space-y-3">
                {impresora.usuarios.map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center justify-between p-3 bg-bg-surface border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {ua.usuario?.nombre} {ua.usuario?.apellido}
                      </p>
                      <p className="text-xs text-text-tertiary">@{ua.usuario?.username}</p>
                      {ua.es_principal && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    {puedeAsignar && (
                      <button
                        onClick={() => handleDesasignar(ua.usuario_id, ua.impresora_id)}
                        className="btn btn-sm btn-danger flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-8">
                No hay usuarios asignados a esta impresora
              </p>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Estado</h3>
            <div className="flex items-center gap-3">
              {impresora.estado === 'CONECTADA' ? (
                <>
                  <CheckCircle size={20} className="text-success" />
                  <div>
                    <p className="font-semibold text-success">Conectada</p>
                    <p className="text-xs text-text-tertiary">Agente activo</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={20} className="text-text-tertiary" />
                  <div>
                    <p className="font-semibold text-text-tertiary">Desconectada</p>
                    <p className="text-xs text-text-tertiary">Agente inactivo</p>
                  </div>
                </>
              )}
            </div>

            {impresora.ultima_conexion && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-tertiary mb-1">Última conexión</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <p className="text-xs text-text-secondary">
                    {new Date(impresora.ultima_conexion).toLocaleString('es-PY')}
                  </p>
                </div>
              </div>
            )}

            {impresora.ip_ultima && (
              <div className="mt-3">
                <p className="text-xs text-text-tertiary mb-1">IP</p>
                <p className="text-xs font-mono text-text-secondary">{impresora.ip_ultima}</p>
              </div>
            )}

            {impresora.hostname_ultimo && (
              <div className="mt-3">
                <p className="text-xs text-text-tertiary mb-1">PC</p>
                <p className="text-xs text-text-secondary">{impresora.hostname_ultimo}</p>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-tertiary">Trabajos totales</span>
                <span className="text-sm font-semibold text-text-primary">
                  {impresora._count?.trabajos || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-tertiary">Usuarios asignados</span>
                <span className="text-sm font-semibold text-text-primary">
                  {impresora.usuarios?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Asignar Usuario */}
      <ModalAsignarUsuario
        isOpen={modalAsignarOpen}
        onClose={() => setModalAsignarOpen(false)}
        impresoraId={impresora.id}
      />
    </div>
  );
};

export default ImpresoraDetallePage;