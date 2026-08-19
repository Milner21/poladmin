// src/pages/private/simpatizantes/crear/components/ModalConfirmarPadron.tsx

import { CheckCircle, X, User } from 'lucide-react';
import type { FC } from 'react';
import type { DatosBusquedaInteligente, EncontradoEn } from '@dto/padron.types';

interface Props {
  isOpen: boolean;
  encontradoEn: EncontradoEn;
  modoEleccion: 'INTERNAS' | 'GENERALES';
  datos: DatosBusquedaInteligente;
  simpatizanteBaseExistente: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ModalConfirmarPadron: FC<Props> = ({
  isOpen,
  encontradoEn,
  modoEleccion,
  datos,
  simpatizanteBaseExistente,
  onConfirmar,
  onCancelar,
}) => {
  if (!isOpen) return null;

  const esPadronGeneral = encontradoEn === 'PADRON_GENERAL';
  const esInternas = modoEleccion === 'INTERNAS';

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

  const etiquetaModo = esInternas ? 'Internas' : 'Generales';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {esPadronGeneral
              ? 'Persona encontrada en padron general'
              : 'Persona encontrada en padron interno'}
          </h3>

          {simpatizanteBaseExistente && (
            <p className="text-sm text-primary mb-3">
              Esta persona ya existe en la campaña. Se registrara su ficha para{' '}
              <strong>{etiquetaModo}</strong>.
            </p>
          )}

          {esPadronGeneral && !simpatizanteBaseExistente && (
            <p className="text-sm text-warning mb-3">
              Esta persona no figura en el padron interno pero si en el padron general.
              Si confirmas, se registrara con datos de generales.
            </p>
          )}

          <p className="text-sm text-text-secondary mb-4">
            Es realmente la persona que estas buscando?
          </p>
        </div>

        <div className="bg-bg-base border border-border rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Nombre</span>
            <span className="text-text-primary font-medium">
              {datos.nombre} {datos.apellido}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">CI</span>
            <span className="text-text-primary font-medium">{datos.ci}</span>
          </div>
          {datos.departamento && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Departamento</span>
              <span className="text-text-primary">{datos.departamento}</span>
            </div>
          )}
          {datos.distrito && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Distrito</span>
              <span className="text-text-primary">{datos.distrito}</span>
            </div>
          )}

          {seccional && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Seccional</span>
              <span className="text-text-primary">{seccional}</span>
            </div>
          )}

          {localVotacion && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Local votacion ({etiquetaModo})</span>
              <span className="text-text-primary">{localVotacion}</span>
            </div>
          )}

          {mesaVotacion && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Mesa ({etiquetaModo})</span>
              <span className="text-text-primary">{mesaVotacion}</span>
            </div>
          )}

          {ordenVotacion && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Orden ({etiquetaModo})</span>
              <span className="text-text-primary">{ordenVotacion}</span>
            </div>
          )}

          {!localVotacion && !mesaVotacion && !ordenVotacion && (
            <div className="text-center py-2">
              <span className="text-xs text-warning">
                No se encontraron datos de local/mesa/orden para {etiquetaModo}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirmar}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Si, es la persona
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            No es la persona
          </button>
        </div>
      </div>
    </>
  );
};