// src/pages/private/simpatizantes/crear/components/DatosPadron.tsx

import { CheckCircle } from 'lucide-react';
import type { FC } from 'react';
import type { DatosBusquedaInteligente } from '@dto/padron.types';

interface Props {
  datos: DatosBusquedaInteligente;
  modoEleccion: 'INTERNAS' | 'GENERALES';
}

export const DatosPadron: FC<Props> = ({ datos, modoEleccion }) => {
  const esInternas = modoEleccion === 'INTERNAS';
  const etiquetaModo = esInternas ? 'Internas' : 'Generales';
  const esAfiliado = datos.padron_interno !== null;

  // Resolver local/mesa/orden segun modo activo
  const localVotacion = esInternas
    ? datos.padron_interno?.local_votacion ?? null
    : datos.padron_general?.local_votacion ?? null;

  const mesaVotacion = esInternas
    ? datos.padron_interno?.mesa ?? null
    : datos.padron_general?.mesa ?? null;

  const ordenVotacion = esInternas
    ? datos.padron_interno?.orden ?? null
    : datos.padron_general?.orden ?? null;

  const seccional = esInternas
    ? datos.padron_interno?.seccional ?? null
    : null;

  return (
    <div className="bg-bg-content rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-success" />
        <h3 className="font-semibold text-text-primary">
          Datos del Padron{' '}
          {esAfiliado ? (
            <span className="text-xs font-normal text-primary ml-1 px-2 py-0.5 bg-primary/10 rounded-full">
              Afiliado - Padron Interno
            </span>
          ) : (
            <span className="text-xs font-normal text-accent ml-1 px-2 py-0.5 bg-accent/10 rounded-full">
              Padron General
            </span>
          )}
          <span className="text-xs font-normal text-text-secondary ml-1 px-2 py-0.5 bg-bg-base rounded-full">
            Modo: {etiquetaModo}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Nombre</label>
          <input
            type="text"
            value={datos.nombre}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Apellido</label>
          <input
            type="text"
            value={datos.apellido}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Departamento</label>
          <input
            type="text"
            value={datos.departamento || ''}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Distrito</label>
          <input
            type="text"
            value={datos.distrito || ''}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>

        {seccional && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Seccional</label>
            <input
              type="text"
              value={seccional}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Local de Votacion ({etiquetaModo})
          </label>
          <input
            type="text"
            value={localVotacion || ''}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>

        {mesaVotacion && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Mesa ({etiquetaModo})
            </label>
            <input
              type="text"
              value={mesaVotacion}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}

        {ordenVotacion && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Orden ({etiquetaModo})
            </label>
            <input
              type="text"
              value={ordenVotacion}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}

        {!localVotacion && !mesaVotacion && !ordenVotacion && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-xs text-warning text-center py-2">
              No se encontraron datos de local/mesa/orden para {etiquetaModo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};