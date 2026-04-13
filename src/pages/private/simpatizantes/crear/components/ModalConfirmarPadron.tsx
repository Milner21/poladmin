import { CheckCircle, X, User } from 'lucide-react';
import type { FC } from 'react';
import type { DatosBusquedaInteligente, EncontradoEn } from '@dto/padron.types';

interface Props {
  isOpen: boolean;
  encontradoEn: EncontradoEn;
  datos: DatosBusquedaInteligente;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ModalConfirmarPadron: FC<Props> = ({
  isOpen,
  encontradoEn,
  datos,
  onConfirmar,
  onCancelar,
}) => {
  if (!isOpen) return null;

  const esPadronGeneral = encontradoEn === 'PADRON_GENERAL';

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
              ? 'Persona encontrada en padrón general'
              : 'Persona encontrada en padrón interno'}
          </h3>

          {esPadronGeneral && (
            <p className="text-sm text-warning mb-3">
              Esta persona no figura en el padrón interno pero sí en el padrón general.
              Si confirmás, se registrará con datos de generales.
            </p>
          )}

          <p className="text-sm text-text-secondary mb-4">
            ¿Es realmente la persona que estás buscando?
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
          {datos.local_votacion && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Local de votación</span>
              <span className="text-text-primary">{datos.local_votacion}</span>
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
            Sí, es la persona
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