import { useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@components';
import { useSolicitud } from '../hooks/useSolicitud';
import { useMovimientosSolicitud } from '../hooks/useMovimientosSolicitud';
import { useCambiarEstadoSolicitud } from '../hooks/useCambiarEstadoSolicitud';
import { useAsignarSolicitud } from '../hooks/useAsignarSolicitud';
import { usePermisos } from '@hooks/usePermisos';
import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';
import RoutesConfig from '@routes/RoutesConfig';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';
import type { EstadoSolicitud, MovimientoSolicitud } from '@dto/solicitud.types';

const ESTADOS: Array<{ value: EstadoSolicitud; label: string; color: string }> = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'EN_PROCESO', label: 'En Proceso', color: 'bg-info/10 text-info border-info/20' },
  { value: 'AGENDADA', label: 'Agendada', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'CUMPLIDA', label: 'Cumplida', color: 'bg-success/10 text-success border-success/20' },
  { value: 'RECHAZADA', label: 'Rechazada', color: 'bg-danger/10 text-danger border-danger/20' },
];

const ACCIONES_MOVIMIENTO: Record<string, string> = {
  CREAR: 'Solicitud creada',
  ASIGNAR: 'Solicitud asignada',
  AGENDAR: 'Solicitud agendada',
  ACTUALIZAR: 'Solicitud actualizada',
  CUMPLIR: 'Solicitud cumplida',
  RECHAZAR: 'Solicitud rechazada',
  REABRIR: 'Solicitud reabierta',
  ELIMINAR: 'Solicitud eliminada',
};

const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-warning/10 text-warning border-warning/20';
    case 'EN_PROCESO': return 'bg-info/10 text-info border-info/20';
    case 'AGENDADA': return 'bg-primary/10 text-primary border-primary/20';
    case 'CUMPLIDA': return 'bg-success/10 text-success border-success/20';
    case 'RECHAZADA': return 'bg-danger/10 text-danger border-danger/20';
    default: return 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20';
  }
};

const getColorPrioridad = (prioridad: string): string => {
  switch (prioridad) {
    case 'ALTA': return 'bg-danger text-white';
    case 'MEDIA': return 'bg-warning text-white';
    case 'BAJA': return 'bg-info text-white';
    default: return 'bg-text-tertiary text-white';
  }
};

const getIconoMovimiento = (accion: string) => {
  switch (accion) {
    case 'CREAR': return <ClipboardList size={14} />;
    case 'ASIGNAR': return <User size={14} />;
    case 'AGENDAR': return <Calendar size={14} />;
    case 'CUMPLIR': return <CheckCircle size={14} />;
    case 'RECHAZAR': return <XCircle size={14} />;
    default: return <AlertCircle size={14} />;
  }
};

const getColorMovimiento = (accion: string): string => {
  switch (accion) {
    case 'CREAR': return 'bg-primary';
    case 'CUMPLIR': return 'bg-success';
    case 'RECHAZAR': return 'bg-danger';
    case 'AGENDAR': return 'bg-info';
    default: return 'bg-text-tertiary';
  }
};

const SolicitudDetallePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tienePermiso } = usePermisos();

  const { data: solicitud, isLoading } = useSolicitud(id ?? '');
  const { data: movimientos, isLoading: loadingMovimientos } = useMovimientosSolicitud(id);
  const cambiarEstadoMutation = useCambiarEstadoSolicitud(id ?? '');
  const asignarMutation = useAsignarSolicitud(id ?? '');

  const { data: usuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.getAll(),
  });

  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoSolicitud | ''>('');
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [usuarioAsignadoId, setUsuarioAsignadoId] = useState('');
  const [comentarioAsignacion, setComentarioAsignacion] = useState('');

  const puedeCambiarEstado = tienePermiso('cambiar_estado_solicitud');
  const puedeAsignar = tienePermiso('asignar_solicitud');

  const handleCambiarEstado = () => {
    if (!estadoSeleccionado) {
      return;
    }
    cambiarEstadoMutation.mutate(
      { estado: estadoSeleccionado, comentario: comentarioEstado || undefined },
      {
        onSuccess: () => {
          setModalEstadoOpen(false);
          setEstadoSeleccionado('');
          setComentarioEstado('');
        },
      },
    );
  };

  const handleAsignar = () => {
    if (!usuarioAsignadoId) return;
    asignarMutation.mutate(
      { asignado_a_id: usuarioAsignadoId, comentario: comentarioAsignacion || undefined },
      {
        onSuccess: () => {
          setModalAsignarOpen(false);
          setUsuarioAsignadoId('');
          setComentarioAsignacion('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="py-4 px-6 flex justify-center items-center min-h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="py-4 px-6">
        <p className="text-text-tertiary">Solicitud no encontrada</p>
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Detalle de Solicitud"
        subtitle={solicitud.titulo}
        showDivider
      />

      <button
        onClick={() => navigate(RoutesConfig.solicitudes)}
        className="btn btn-outline mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos principales */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${getColorEstado(solicitud.estado)}`}>
                  {solicitud.estado.replace('_', ' ')}
                </span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getColorPrioridad(solicitud.prioridad)}`}>
                  {solicitud.prioridad}
                </span>
              </div>
              <div className="flex gap-2">
                {puedeCambiarEstado && (
                  <button
                    onClick={() => setModalEstadoOpen(true)}
                    className="btn btn-outline btn-sm flex items-center gap-1"
                  >
                    <ChevronDown size={14} />
                    Estado
                  </button>
                )}
                {puedeAsignar && (
                  <button
                    onClick={() => setModalAsignarOpen(true)}
                    className="btn btn-primary btn-sm flex items-center gap-1"
                  >
                    <User size={14} />
                    Asignar
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {solicitud.titulo}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {solicitud.descripcion}
            </p>

            {solicitud.fecha_limite && (
              <div className="mt-4 flex items-center gap-2 text-sm text-warning">
                <Calendar size={14} />
                <span>Fecha límite: {new Date(solicitud.fecha_limite).toLocaleDateString('es-PY')}</span>
              </div>
            )}
          </div>

          {/* Timeline de movimientos */}
          <div className="bg-bg-content border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" />
              Historial de Movimientos
            </h3>

            {loadingMovimientos ? (
              <div className="flex justify-center py-6">
                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : movimientos && movimientos.length > 0 ? (
              <div className="space-y-4">
                {movimientos.map((mov: MovimientoSolicitud) => (
                  <div
                    key={mov.id}
                    className="relative pl-8 pb-4 border-l-2 border-border last:border-0"
                  >
                    {/* Punto en la línea temporal */}
                    <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full flex items-center justify-center text-white ${getColorMovimiento(mov.accion)}`}>
                      {getIconoMovimiento(mov.accion)}
                    </div>

                    <div className="bg-bg-base rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary">
                          {ACCIONES_MOVIMIENTO[mov.accion] ?? mov.accion}
                        </span>
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(mov.fecha_movimiento).toLocaleString('es-PY', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {mov.comentario && (
                        <p className="text-xs text-text-secondary mb-2">{mov.comentario}</p>
                      )}

                      {mov.estado_anterior && mov.estado_nuevo && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded border ${getColorEstado(mov.estado_anterior)}`}>
                            {mov.estado_anterior.replace('_', ' ')}
                          </span>
                          <span className="text-text-tertiary">→</span>
                          <span className={`px-2 py-0.5 rounded border ${getColorEstado(mov.estado_nuevo)}`}>
                            {mov.estado_nuevo.replace('_', ' ')}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-text-tertiary mt-2">
                        Por: {mov.usuario?.nombre} {mov.usuario?.apellido}
                        {mov.usuario?.perfil && (
                          <span className="ml-1 opacity-60">({mov.usuario.perfil.nombre})</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
                <ClipboardList size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Sin movimientos registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Simpatizante */}
          <div className="bg-bg-content border border-border rounded-xl p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Simpatizante
            </h4>
            <p className="text-sm font-medium text-text-primary">
              {solicitud.simpatizante?.nombre} {solicitud.simpatizante?.apellido}
            </p>
            <p className="text-xs text-text-tertiary">
              CI: {solicitud.simpatizante?.documento}
            </p>
          </div>

          {/* Asignación */}
          <div className="bg-bg-content border border-border rounded-xl p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Asignado a
            </h4>
            {solicitud.asignado_a ? (
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {solicitud.asignado_a.nombre} {solicitud.asignado_a.apellido}
                </p>
                <p className="text-xs text-text-tertiary">
                  {solicitud.asignado_a_id}
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-tertiary italic">Sin asignar</p>
            )}
          </div>

          {/* Registrado por */}
          <div className="bg-bg-content border border-border rounded-xl p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <User size={14} className="text-text-tertiary" />
              Registrado por
            </h4>
            <p className="text-sm text-text-primary">
              {solicitud.registrado_por?.nombre} {solicitud.registrado_por?.apellido}
            </p>
            <p className="text-xs text-text-tertiary">
              {new Date(solicitud.fecha_registro).toLocaleDateString('es-PY')}
            </p>
          </div>

          {/* Campaña */}
          {solicitud.campana && (
            <div className="bg-bg-content border border-border rounded-xl p-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Campaña</h4>
              <p className="text-sm text-text-primary">{solicitud.campana.nombre}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {modalEstadoOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setModalEstadoOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Cambiar Estado</h3>
              <button onClick={() => setModalEstadoOpen(false)} className="text-text-tertiary hover:text-text-primary">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {ESTADOS.map((estado) => (
                <button
                  key={estado.value}
                  type="button"
                  onClick={() => setEstadoSeleccionado(estado.value)}
                  className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                    estadoSeleccionado === estado.value
                      ? estado.color + ' border-current'
                      : 'border-border text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {estado.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comentarioEstado}
                onChange={(e) => setComentarioEstado(e.target.value)}
                rows={3}
                placeholder="Ingrese un comentario sobre el cambio..."
                className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCambiarEstado}
                disabled={!estadoSeleccionado || cambiarEstadoMutation.isPending}
                className="flex-1 btn btn-primary"
              >
                {cambiarEstadoMutation.isPending ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => setModalEstadoOpen(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Asignar */}
      {modalAsignarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setModalAsignarOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Asignar Solicitud</h3>
              <button onClick={() => setModalAsignarOpen(false)} className="text-text-tertiary hover:text-text-primary">
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Asignar a <span className="text-danger">*</span>
              </label>
              <select
                value={usuarioAsignadoId}
                onChange={(e) => setUsuarioAsignadoId(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} — {u.perfil?.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comentarioAsignacion}
                onChange={(e) => setComentarioAsignacion(e.target.value)}
                rows={3}
                placeholder="Ingrese un comentario sobre la asignación..."
                className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAsignar}
                disabled={!usuarioAsignadoId || asignarMutation.isPending}
                className="flex-1 btn btn-primary"
              >
                {asignarMutation.isPending ? 'Asignando...' : 'Asignar'}
              </button>
              <button
                type="button"
                onClick={() => setModalAsignarOpen(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolicitudDetallePage;