import { useState, useEffect, type FC } from 'react';
import { PageHeader } from '@components';
import { useConfiguracionTransporte, useActualizarConfiguracionTransporte } from '../hooks/useConfiguacionTransporte';
import { useAuth } from '@hooks/useAuth';
import { Settings, Printer, Users, Lock } from 'lucide-react';

const ConfiguracionTransportePage: FC = () => {
  const { usuario } = useAuth();
  const { data: configuracion, isLoading } = useConfiguracionTransporte();
  const actualizarMutation = useActualizarConfiguracionTransporte();

  const esRoot = usuario?.perfil?.nombre === 'ROOT';

  const [permitirImpresion, setPermitirImpresion] = useState(false);
  const [permitirDuplicados, setPermitirDuplicados] = useState(true);

  useEffect(() => {
    if (configuracion) {
      setPermitirImpresion(configuracion.permitir_impresion_tickets);
      setPermitirDuplicados(configuracion.permitir_duplicados);
    }
  }, [configuracion]);

  const handleGuardar = () => {
    actualizarMutation.mutate({
      permitir_impresion_tickets: permitirImpresion,
      permitir_duplicados: permitirDuplicados,
    });
  };

  if (isLoading) {
    return (
      <div className="py-4 px-6 flex justify-center items-center min-h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Configuración de Transporte"
        subtitle="Ajustá las opciones del módulo de transportes para esta campaña"
        showDivider
      />

      {!esRoot && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Lock size={16} className="text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            Solo el usuario <strong>ROOT</strong> puede modificar esta configuración.
          </p>
        </div>
      )}

      <div className="max-w-lg space-y-4">
        {/* Impresión de tickets */}
        <div className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Printer size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Impresión de Tickets</p>
                <p className="text-sm text-text-tertiary mt-1">
                  Si está activo, se habilitará la impresión térmica de tickets al confirmar un pasajero.
                  Si está inactivo, se mostrará el carrusel de datos para registro manual.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!esRoot}
              onClick={() => setPermitirImpresion(!permitirImpresion)}
              className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                permitirImpresion ? 'bg-primary' : 'bg-text-tertiary/30'
              } disabled:cursor-not-allowed`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  permitirImpresion ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${
            permitirImpresion
              ? 'bg-success/10 text-success'
              : 'bg-text-tertiary/10 text-text-tertiary'
          }`}>
            {permitirImpresion
              ? '✅ Impresión térmica habilitada'
              : '📋 Se usará carrusel de datos para registro manual'}
          </div>
        </div>

        {/* Duplicados */}
        <div className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                <Users size={18} className="text-warning" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Permitir Pasajeros Duplicados</p>
                <p className="text-sm text-text-tertiary mt-1">
                  Si está activo, un votante puede aparecer en más de un transporte.
                  Si está inactivo, se bloqueará el registro duplicado.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!esRoot}
              onClick={() => setPermitirDuplicados(!permitirDuplicados)}
              className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                permitirDuplicados ? 'bg-primary' : 'bg-text-tertiary/30'
              } disabled:cursor-not-allowed`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  permitirDuplicados ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${
            permitirDuplicados
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          }`}>
            {permitirDuplicados
              ? '⚠️ Un votante puede estar en múltiples transportes'
              : '✅ No se permiten registros duplicados'}
          </div>
        </div>

        {/* Botón guardar solo para ROOT */}
        {esRoot && (
          <button
            onClick={handleGuardar}
            disabled={actualizarMutation.isPending}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Settings size={16} />
            {actualizarMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionTransportePage;