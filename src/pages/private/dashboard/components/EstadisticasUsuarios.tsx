import { Users, UserCheck, UserX, Briefcase, TrendingUp } from 'lucide-react';
import type { FC } from 'react';
import { useEstadisticasUsuarios } from '@pages/private/usuarios/hooks/useEstadisticasUsuarios';
import { useCampanaSeleccionada } from '@hooks/useCampanaSeleccionada';

export const EstadisticasUsuarios: FC = () => {
  const { campanaSeleccionada } = useCampanaSeleccionada();
  const { data: stats, isLoading } = useEstadisticasUsuarios(campanaSeleccionada);

  if (isLoading) {
    return (
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <div className="flex justify-center py-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <p className="text-text-tertiary text-center">No hay estadísticas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Total Usuarios</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Activos</p>
              <p className="text-2xl font-bold text-success mt-1">{stats.activos}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <UserCheck className="text-success" size={24} />
            </div>
          </div>
        </div>

        {/* Inactivos */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Inactivos</p>
              <p className="text-2xl font-bold text-danger mt-1">{stats.inactivos}</p>
            </div>
            <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center">
              <UserX className="text-danger" size={24} />
            </div>
          </div>
        </div>

        {/* Operativos */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Operativos</p>
              <p className="text-2xl font-bold text-info mt-1">{stats.operativos}</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
              <Briefcase className="text-info" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Por nivel */}
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-text-primary m-0">
            Usuarios por Nivel Jerárquico
          </h3>
        </div>

        {stats.por_nivel.length > 0 ? (
          <div className="space-y-3">
            {stats.por_nivel.map((item) => (
              <div
                key={item.nivel?.id || 'sin-nivel'}
                className="flex items-center justify-between p-3 bg-bg-base rounded-lg hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {item.nivel?.orden || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary m-0">
                      {item.nivel?.nombre || 'Sin nivel'}
                    </p>
                    {item.nivel?.exclusivo_root && (
                      <span className="text-xs text-warning">⚠️ Exclusivo ROOT</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{item.cantidad}</span>
                  <span className="text-xs text-text-tertiary">
                    {((item.cantidad / stats.total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-tertiary text-center py-6">
            No hay usuarios políticos registrados aún
          </p>
        )}
      </div>
    </div>
  );
};