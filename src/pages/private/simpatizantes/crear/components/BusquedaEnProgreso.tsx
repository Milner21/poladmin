import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { FC } from 'react';

interface Paso {
  texto: string;
  completado: boolean;
  encontrado: boolean;
}

interface Props {
  pasos: Paso[];
  buscando: boolean;
}

export const BusquedaEnProgreso: FC<Props> = ({ pasos, buscando }) => {
  return (
    <div className="bg-bg-content rounded-xl p-6 shadow-sm mb-4">
      <div className="flex flex-col gap-4">
        {pasos.map((paso, index) => {
          const esActivo =
            buscando &&
            !paso.completado &&
            pasos.slice(0, index).every((p) => p.completado);

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="shrink-0">
                {paso.completado ? (
                  paso.encontrado ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-text-tertiary" />
                  )
                ) : esActivo ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
              </div>
              <span
                className={`text-sm ${
                  esActivo
                    ? 'text-text-primary font-medium'
                    : paso.completado
                      ? paso.encontrado
                        ? 'text-success font-medium'
                        : 'text-text-tertiary'
                      : 'text-text-tertiary'
                }`}
              >
                {paso.texto}
                {paso.completado && !paso.encontrado && ' — No encontrado'}
                {paso.completado && paso.encontrado && ' — Encontrado'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};