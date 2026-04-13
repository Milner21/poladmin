import { useState, useMemo, useCallback, type FC, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@components';
import { padronService } from '@services/padron.service';
import type { TipoPadron, PadronInterno, PadronGeneral } from '@dto/padron.types';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import RoutesConfig from '@routes/RoutesConfig';

const LIMITE = 50;

const PadronDetallePage: FC = () => {
  const { tipo, departamento, distrito } = useParams<{
    tipo: string;
    departamento: string;
    distrito: string;
  }>();
  const navigate = useNavigate();

  const [pagina, setPagina] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [buscarActivo, setBuscarActivo] = useState('');

  const tipoFinal = (tipo?.toUpperCase() === 'INTERNO' ? 'INTERNO' : 'GENERAL') as TipoPadron;
  const departamentoFinal = decodeURIComponent(departamento ?? '');
  const distritoFinal = decodeURIComponent(distrito ?? '');

  const queryKey = useMemo(
    () => ['padron-detalle', tipoFinal, departamentoFinal, distritoFinal, pagina, buscarActivo],
    [tipoFinal, departamentoFinal, distritoFinal, pagina, buscarActivo],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      padronService.obtenerPorDistrito({
        tipo: tipoFinal,
        departamento: departamentoFinal,
        distrito: distritoFinal,
        pagina,
        limite: LIMITE,
        buscar: buscarActivo || undefined,
      }),
    enabled: !!departamentoFinal && !!distritoFinal,
  });

  const handleBuscarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBuscar(e.target.value);
  }, []);

  const handleBuscarSubmit = useCallback(() => {
    setPagina(1);
    setBuscarActivo(buscar.trim());
  }, [buscar]);

  const handleBuscarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleBuscarSubmit();
      }
    },
    [handleBuscarSubmit],
  );

  const handleLimpiarBuscar = useCallback(() => {
    setBuscar('');
    setBuscarActivo('');
    setPagina(1);
  }, []);

  const handlePaginaAnterior = useCallback(() => {
    setPagina((prev) => Math.max(prev - 1, 1));
  }, []);

  const handlePaginaSiguiente = useCallback(() => {
    if (!data) return;
    setPagina((prev) => Math.min(prev + 1, data.total_paginas));
  }, [data]);

  const handleVolver = useCallback(() => {
    navigate(RoutesConfig.padronCargar);
  }, [navigate]);

  const esInterno = tipoFinal === 'INTERNO';

  const titulo = `${departamentoFinal} - ${distritoFinal}`;
  const subtitulo = `Padron ${esInterno ? 'Interno' : 'General'} · ${
    data ? data.total.toLocaleString() : '...'
  } registros`;

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={titulo}
        subtitle={subtitulo}
        showDivider
      />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Boton volver */}
        <button
          onClick={handleVolver}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al padron
        </button>

        {/* Barra de busqueda */}
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={buscar}
                onChange={handleBuscarChange}
                onKeyDown={handleBuscarKeyDown}
                placeholder="Buscar por CI, nombre o apellido..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button
              onClick={handleBuscarSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Buscar
            </button>
            {buscarActivo && (
              <button
                onClick={handleLimpiarBuscar}
                className="px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
          {buscarActivo && (
            <p className="mt-2 text-xs text-text-secondary">
              Mostrando resultados para:{' '}
              <span className="font-medium text-primary">{buscarActivo}</span>
            </p>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-bg-content border border-border rounded-xl overflow-hidden">

          {/* Encabezado de tabla con contador */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-text-primary">
                {data
                  ? `${data.total.toLocaleString()} registros encontrados`
                  : 'Cargando registros...'}
              </h3>
            </div>
            {data && (
              <span className="text-sm text-text-secondary">
                Pagina {data.pagina} de {data.total_paginas}
              </span>
            )}
          </div>

          {isLoading && (
            <div className="text-center py-16 text-text-secondary">
              Cargando...
            </div>
          )}

          {isError && (
            <div className="text-center py-16 text-danger">
              Error al cargar los registros
            </div>
          )}

          {!isLoading && !isError && data && data.registros.length === 0 && (
            <div className="text-center py-16 text-text-secondary">
              No se encontraron registros
            </div>
          )}

          {!isLoading && !isError && data && data.registros.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-base border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      CI
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Apellido
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Distrito
                    </th>
                    {esInterno && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                          Seccional
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                          Partido
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Local
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Mesa
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                      Orden
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.registros.map((reg) => {
                    const regInterno = esInterno ? (reg as PadronInterno) : null;
                    const regGeneral = !esInterno ? (reg as PadronGeneral) : null;

                    return (
                      <tr
                        key={reg.id}
                        className="hover:bg-bg-hover transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {reg.ci}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {reg.apellido}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {reg.nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {reg.departamento ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {reg.distrito ?? '-'}
                        </td>
                        {esInterno && (
                          <>
                            <td className="px-4 py-3 text-sm text-text-secondary">
                              {regInterno?.seccional ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-text-secondary">
                              {regInterno?.partido?.sigla ?? '-'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {esInterno
                            ? (regInterno?.local_votacion ?? '-')
                            : (regGeneral?.local_votacion ?? '-')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {reg.mesa ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {reg.orden ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginacion */}
          {data && data.total_paginas > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={handlePaginaAnterior}
                disabled={pagina <= 1}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(data.total_paginas, 5) }, (_, i) => {
                  const inicio = Math.max(1, Math.min(pagina - 2, data.total_paginas - 4));
                  const numeroPagina = inicio + i;
                  if (numeroPagina > data.total_paginas) return null;

                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => setPagina(numeroPagina)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        numeroPagina === pagina
                          ? 'bg-primary text-white'
                          : 'border border-border text-text-primary hover:bg-bg-hover'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePaginaSiguiente}
                disabled={pagina >= data.total_paginas}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PadronDetallePage;