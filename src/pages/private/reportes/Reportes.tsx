import { useMemo, useState, type FC } from 'react';
import { PageHeader } from '@components';
import { useCampanaSeleccionada } from '@hooks/useCampanaSeleccionada';
import { useReporteCaptacion } from './hooks/useReporteCaptacion';
import { useTopRegistradores } from './hooks/useTopRegistradores';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

const Reportes: FC = () => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const [agrupacion, setAgrupacion] = useState<'dia' | 'semana' | 'mes'>('dia');
  
  // ✅ SOLUCIÓN: Usar useMemo para que las fechas se calculen solo una vez
  const { fechaDesde, fechaHasta } = useMemo(() => {
    const hasta = new Date().toISOString();
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    return {
      fechaDesde: desde.toISOString(),
      fechaHasta: hasta
    };
  }, []); // Array vacío = se calcula solo una vez

  const { data: captacion, isLoading: isLoadingCaptacion } = useReporteCaptacion({
    campana_id: campanaSeleccionada,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
    agrupacion,
  });

  const { data: topRegistradores, isLoading: isLoadingTop } = useTopRegistradores({
    campana_id: campanaSeleccionada,
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
  });

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          campanaActual
            ? `Reportes — ${campanaActual.nombre}`
            : "Reportes"
        }
        subtitle="Análisis detallado de captación y rendimiento"
        showDivider
      />

      {/* Stats Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Total Período</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {isLoadingCaptacion ? '...' : captacion?.total_periodo || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Afiliados</p>
              <p className="text-2xl font-bold text-success mt-1">
                {isLoadingCaptacion ? '...' : captacion?.total_afiliados || 0}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {captacion?.porcentaje_afiliados}%
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <TrendingUp className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Voto Seguro</p>
              <p className="text-2xl font-bold text-info mt-1">
                {isLoadingCaptacion ? '...' : captacion?.total_seguros || 0}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {captacion?.porcentaje_seguros}%
              </p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
              <BarChart3 className="text-info" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Período</p>
              <p className="text-lg font-bold text-text-primary mt-1">
                Últimos 30 días
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Calendar className="text-warning" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Captación */}
      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary m-0">
            Evolución de Captación
          </h3>
          
          <div className="flex gap-2">
            {(['dia', 'semana', 'mes'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setAgrupacion(tipo)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                  ${agrupacion === tipo
                    ? 'bg-primary text-white'
                    : 'bg-bg-base text-text-secondary hover:bg-bg-hover'
                  }
                `}
              >
                {tipo === 'dia' ? 'Día' : tipo === 'semana' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {isLoadingCaptacion ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={captacion?.periodo || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="fecha" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Simpatizantes"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 10 Registradores */}
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Top 10 Registradores
        </h3>

        {isLoadingTop ? (
          <div className="flex justify-center py-10">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topRegistradores && topRegistradores.length > 0 ? (
          <div className="space-y-3">
            {topRegistradores.map((item, index) => (
              <div
                key={item.usuario?.id || index}
                className="flex items-center justify-between p-3 bg-bg-base rounded-lg hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-warning text-white' : 
                      index === 1 ? 'bg-text-secondary/20 text-text-primary' : 
                      index === 2 ? 'bg-warning/30 text-warning' :
                      'bg-primary/10 text-primary'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {item.usuario?.nombre} {item.usuario?.apellido}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {item.usuario?.nivel?.nombre || item.usuario?.perfil?.nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{item.cantidad}</p>
                  <p className="text-xs text-text-tertiary">registros</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-tertiary text-center py-10">
            No hay datos disponibles
          </p>
        )}
      </div>
    </div>
  );
};

export default Reportes;