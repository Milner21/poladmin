import { CheckCircle } from 'lucide-react';
import type { FC } from 'react';
import type { ResultadoPadronDto } from '@dto/padron.types';

interface Props {
  datos: ResultadoPadronDto;
}

export const DatosPadron: FC<Props> = ({ datos }) => {
  return (
    <div className="bg-bg-content rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-success" />
        <h3 className="font-semibold text-text-primary">
          Datos del Padron{' '}
          {datos.es_afiliado ? (
            <span className="text-xs font-normal text-primary ml-1 px-2 py-0.5 bg-primary/10 rounded-full">
              Afiliado - Padron Interno
            </span>
          ) : (
            <span className="text-xs font-normal text-accent ml-1 px-2 py-0.5 bg-accent/10 rounded-full">
              Padron General
            </span>
          )}
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

        {datos.es_afiliado && datos.seccional && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Seccional</label>
            <input
              type="text"
              value={datos.seccional}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Local de Votacion {datos.es_afiliado ? '(Internas)' : '(Generales)'}
          </label>
          <input
            type="text"
            value={datos.local_votacion || ''}
            readOnly
            className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
          />
        </div>

        {datos.mesa_votacion && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Mesa</label>
            <input
              type="text"
              value={datos.mesa_votacion}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}

        {datos.orden_votacion && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Orden</label>
            <input
              type="text"
              value={datos.orden_votacion}
              readOnly
              className="w-full px-3 py-2 text-sm bg-bg-base border border-border rounded-lg text-text-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};